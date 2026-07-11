# HabitFlow - Personal Habit Tracking App

A mobile-first habit tracking application that helps you build consistent habits through intelligent design and habit stacking methodology.

## Features

- **Habit Stacking**: Chain habits together using implementation intentions
- **Hold-to-Complete**: Intuitive tap-and-hold completion with visual feedback
- **Drag Scrolling**: Smooth horizontal scrolling through habit chains
- **Mobile Optimized**: Designed for mobile-first experience
- **Visual Progress**: Real-time progress tracking with ripple animations
- **Statistics Dashboard**: Track streaks, completion rates, and progress

## Quick Start

### Prerequisites
- Node.js 18+ installed on your computer
- PostgreSQL database (optional - can use in-memory storage)

### Installation

1. **Download and extract** the HabitFlow files to your computer

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment** (optional for database):
   ```bash
   # Create .env file for database (optional)
   echo "DATABASE_URL=postgresql://username:password@localhost:5432/habitflow" > .env
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser** to `http://localhost:5000`

## Usage

### Creating Habit Stacks
1. Click "Create New Stack"
2. Fill in your routine name and first habit
3. Use the fill-in-the-blanks format: "I will [action] at [time] in [location]"
4. Add additional habits to stack them together
5. Save your routine

### Completing Habits
- **Hold down** on any habit block for 0.8 seconds to mark it complete
- Watch the progress border trace around the habit block
- See ripple animations for visual feedback

### Managing Habits
- **Delete habits**: Hover over habit blocks and click the X button
- **Add to existing stacks**: Click the + button at the end of any habit chain
- **Scroll through long chains**: Click and drag horizontally through habit stacks

## Technical Details

### Architecture
- **Frontend**: React + TypeScript with Vite
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL (with fallback to in-memory storage)
- **Styling**: Tailwind CSS with custom animations
- **State Management**: TanStack Query for server state

### Project Structure
```
├── client/          # Frontend React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Application pages
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities and API client
├── server/          # Backend Express server
│   ├── index.ts     # Server entry point
│   ├── routes.ts    # API route definitions
│   ├── storage.ts   # Data storage layer
│   └── db.ts        # Database connection
├── shared/          # Shared types and schemas
└── package.json     # Dependencies and scripts
```

### Database Setup (Optional)

If you want persistent data storage:

1. Install PostgreSQL on your system
2. Create a database named `habitflow`
3. Set the `DATABASE_URL` environment variable
4. The app will automatically create the necessary tables

Without a database, the app uses in-memory storage that resets when you restart the server.

### Customization

The app uses a custom color palette defined in `client/src/index.css`:
- **Habit Purple**: Primary action color
- **Habit Indigo**: Secondary accent
- **Habit Emerald**: Success states
- **Habit Amber**: Time/schedule indicators

You can modify these colors by updating the CSS custom properties in the `:root` section.

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Adding New Features
1. **Frontend components** go in `client/src/components/`
2. **API endpoints** are defined in `server/routes.ts`
3. **Database models** are in `shared/schema.ts`
4. **Styling** uses Tailwind classes with custom utilities

## Troubleshooting

### Common Issues

**Port already in use**: Change the port in `server/index.ts` if 5000 is occupied

**Database connection issues**: Verify PostgreSQL is running and connection string is correct

**Build errors**: Ensure Node.js version is 18 or higher

**Mobile scrolling issues**: Clear browser cache and ensure touch events are enabled

## License

This project is for personal use. Feel free to modify and customize for your own habit tracking needs.

## Support

This is a personal habit tracking app. For technical issues, check the console logs in your browser's developer tools for detailed error messages.