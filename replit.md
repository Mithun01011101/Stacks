# HabitFlow - Personal Habit Tracking App

## Overview

HabitFlow is a mobile-first habit tracking application built with modern web technologies. The app helps users build consistent habits through intelligent design using implementation intentions and habit stacking methodology from Atomic Habits. The system follows a full-stack architecture with React frontend, Express backend, and PostgreSQL database.

## System Architecture

### Frontend Architecture
- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **State Management**: TanStack Query for server state, React hooks for local state
- **Build Tool**: Vite for development and production builds
- **Mobile-First Design**: Optimized for mobile devices with responsive layouts

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (with fallback to in-memory storage)
- **API Design**: RESTful API with JSON responses
- **Session Management**: Express sessions with PostgreSQL store

### Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle ORM with Zod validation schemas
- **Migration System**: Drizzle Kit for database migrations
- **Schema Design**: Four main tables (habits, routines, routine_habits, habit_completions)

## Key Components

### Habit Management System
- **Implementation Intentions**: Fill-in-the-blank habit builder following "I will [action] at [time] in [location]" formula
- **Habit Stacking**: Chain habits together using "After I [existing habit], I will [new habit]" methodology
- **Visual Representation**: Linear timeline-style layout with habit blocks and connectors

### User Interface Components
- **Mobile Navigation**: Bottom navigation with three tabs (Home, Stats, Motivation)
- **Habit Builder**: Multi-step form for creating habits and routines
- **Habit Chains**: Horizontally scrollable habit sequences with drag interactions
- **Hold-to-Complete**: Intuitive tap-and-hold completion with visual feedback and ripple animations
- **Progress Tracking**: Real-time completion status with visual indicators

### Notification System
- **Browser Notifications**: Web API for habit reminders
- **Time-based Alerts**: Contextual notifications based on habit timing
- **Permission Management**: User-friendly permission requests and status handling

## Data Flow

### Habit Creation Flow
1. User opens habit builder dialog
2. Fills in implementation intention template (action, time, location)
3. Optionally adds stacked habits using habit stacking formula
4. System creates routine with ordered habit sequence
5. Habits are stored with relationships in database

### Completion Tracking Flow
1. User interacts with habit block (tap-and-hold)
2. Client sends toggle completion request to API
3. Server updates or creates completion record for current date
4. Response triggers UI updates and animations
5. Stats are recalculated and cached

### Data Synchronization
- TanStack Query manages server state with automatic refetching
- Optimistic updates for immediate UI feedback
- Background synchronization for offline resilience

## External Dependencies

### Frontend Dependencies
- **UI Framework**: React, React DOM
- **State Management**: @tanstack/react-query
- **Form Handling**: react-hook-form with @hookform/resolvers
- **Styling**: tailwindcss, class-variance-authority, clsx
- **Icons**: lucide-react
- **Date Handling**: date-fns
- **Animations**: CSS transitions and custom animations

### Backend Dependencies
- **Web Framework**: express
- **Database**: @neondatabase/serverless, drizzle-orm
- **Validation**: drizzle-zod, zod
- **Session Storage**: connect-pg-simple
- **Development**: tsx, esbuild

### Development Tools
- **Type Checking**: TypeScript
- **Build Tool**: Vite with React plugin
- **Database Migrations**: drizzle-kit
- **CSS Processing**: PostCSS with Autoprefixer

## Deployment Strategy

### Development Environment
- Vite development server with hot module replacement
- Express server with TypeScript compilation via tsx
- Database connection to Neon PostgreSQL or fallback storage
- Environment-based configuration through .env files

### Production Build
- Vite builds optimized client bundle to dist/public
- esbuild compiles server code to dist/index.js
- Static assets served by Express in production
- Database migrations applied via drizzle-kit

### Database Strategy
- PostgreSQL for production with connection pooling
- Graceful fallback to in-memory storage for development
- Schema-first approach with TypeScript types generated from database
- Automatic migration system for schema updates

### Performance Optimizations
- Code splitting and lazy loading for client bundles
- Query caching and invalidation strategies
- Optimized database queries with proper indexing
- Mobile-optimized assets and interactions

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- July 06, 2025: Added AI chat feature with OpenAI GPT-4o integration
  - Implemented conversational habit coach interface
  - Added intelligent fallback responses for API quota/connection issues  
  - Created contextual habit suggestions based on user input
  - Enhanced mobile chat UI with quick prompts and message history
- July 06, 2025: Initial setup completed with core habit tracking functionality

## AI Chat Feature

The app now includes an AI-powered habit coach that provides:
- Personalized advice on building and maintaining habits
- Help with motivation challenges and consistency issues  
- Specific strategies for habit stacking and implementation intentions
- Contextual suggestions for morning routines, exercise, reading, and more
- Intelligent fallback responses when API limits are reached
- Expert knowledge based on "Atomic Habits" principles

### Error Handling
The AI chat includes robust error handling:
- Fallback responses for quota/rate limit issues
- Contextual advice based on user message content
- Graceful degradation when OpenAI API is unavailable
- No interruptions to user experience during API issues