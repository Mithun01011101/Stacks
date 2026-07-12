import crypto from "crypto";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import createMemoryStore from "memorystore";
import type { Express, NextFunction, Request, Response } from "express";
import { pool } from "./db";

// Paths reachable without logging in. The manifest and icons stay public so
// Android can install the home-screen app before the user is signed in.
const PUBLIC_PATHS = new Set(["/login", "/logout", "/manifest.webmanifest"]);

function isAuthed(req: Request): boolean {
  return Boolean((req.session as any)?.authed);
}

function safeEqual(a: string, b: string): boolean {
  const ha = crypto.createHash("sha256").update(a).digest();
  const hb = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function loginPage(showError: boolean): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="theme-color" content="#9b56f0" />
<title>Stacks — Sign in</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    font-family: system-ui, -apple-system, sans-serif;
    background: linear-gradient(160deg, hsl(267, 84%, 64%), hsl(240, 60%, 40%));
    padding: 24px;
  }
  .card {
    background: white; border-radius: 16px; padding: 32px 28px;
    width: 100%; max-width: 360px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    text-align: center;
  }
  .logo {
    width: 56px; height: 56px; border-radius: 16px; margin: 0 auto 14px;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #9C56F0, #6469F2);
    box-shadow: 0 4px 18px rgba(156, 86, 240, 0.35);
  }
  h1 { font-size: 28px; color: hsl(267, 84%, 44%); margin-bottom: 4px; }
  p { color: #666; font-size: 14px; margin-bottom: 24px; }
  input {
    width: 100%; padding: 14px 16px; font-size: 16px; border: 2px solid #ddd;
    border-radius: 10px; margin-bottom: 14px; outline: none;
  }
  input:focus { border-color: hsl(267, 84%, 64%); }
  button {
    width: 100%; padding: 14px; font-size: 16px; font-weight: 600; color: white;
    background: hsl(267, 84%, 64%); border: none; border-radius: 10px; cursor: pointer;
  }
  button:active { background: hsl(267, 84%, 54%); }
  .error { color: #d33; font-size: 14px; margin-bottom: 14px; }
</style>
</head>
<body>
  <div class="card">
    <div class="logo">
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/>
        <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/>
        <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>
      </svg>
    </div>
    <h1>Stacks</h1>
    <p>Enter your password to continue</p>
    ${showError ? '<div class="error">Wrong password, try again.</div>' : ""}
    <form method="POST" action="/login">
      <input type="password" name="password" placeholder="Password" autofocus required />
      <button type="submit">Sign in</button>
    </form>
  </div>
</body>
</html>`;
}

export function setupAuth(app: Express) {
  const password = process.env.APP_PASSWORD;
  if (!password) return; // no password configured -> app stays open (local use)

  // Persist sessions in Postgres when available so logins survive restarts;
  // otherwise fall back to an in-memory store.
  const store = pool
    ? new (connectPgSimple(session))({ pool: pool as any, createTableIfMissing: true })
    : new (createMemoryStore(session))({ checkPeriod: 86_400_000 });

  app.use(
    session({
      secret: process.env.SESSION_SECRET || password,
      store,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 90 * 24 * 60 * 60 * 1000, // stay signed in for 90 days
      },
    })
  );

  app.get("/login", (req: Request, res: Response) => {
    if (isAuthed(req)) return res.redirect("/");
    res.status(200).type("html").send(loginPage("error" in req.query));
  });

  app.post("/login", (req: Request, res: Response) => {
    const attempt = typeof req.body?.password === "string" ? req.body.password : "";
    if (attempt && safeEqual(attempt, password)) {
      (req.session as any).authed = true;
      return res.redirect("/");
    }
    res.redirect("/login?error");
  });

  app.get("/logout", (req: Request, res: Response) => {
    req.session.destroy(() => res.redirect("/login"));
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (isAuthed(req)) return next();
    if (PUBLIC_PATHS.has(req.path) || req.path.startsWith("/icons/")) return next();
    if (req.path.startsWith("/api/")) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    return res.redirect("/login");
  });
}
