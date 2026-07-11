# HabitFlow - Local Setup Guide

## Download Instructions

To get your personal copy of HabitFlow:

1. **Download the project files** from Replit:
   - In Replit, go to the three-dot menu (⋯) in the file explorer
   - Select "Download as zip" 
   - Save the zip file to your computer

2. **Extract the files**:
   - Unzip the downloaded file to a folder on your computer
   - You should see folders like `client/`, `server/`, `shared/`, etc.

## Quick Setup

### Option 1: Simple Setup (Recommended)
```bash
# Navigate to your project folder
cd habitflow

# Install all dependencies
npm install

# Start the app
npm run dev
```

Open your browser to `http://localhost:5000` and start using HabitFlow!

### Option 2: With Database (For Data Persistence)

If you want your habits to be saved permanently:

1. **Install PostgreSQL** on your computer
2. **Create a database**:
   ```sql
   CREATE DATABASE habitflow;
   ```
3. **Set environment variable**:
   ```bash
   # Create .env file
   echo "DATABASE_URL=postgresql://your_username:your_password@localhost:5432/habitflow" > .env
   ```
4. **Start the app**:
   ```bash
   npm run dev
   ```

## What You Get

- Full habit tracking app running on your computer
- All the features: habit stacking, hold-to-complete, drag scrolling
- Mobile-responsive design
- Your personal data stays on your machine
- No internet required once installed

## Sharing with Others

To share HabitFlow with family or friends:
1. Give them a copy of the project folder
2. They follow the same setup steps
3. Each person has their own independent app and data

## System Requirements

- **Operating System**: Windows, Mac, or Linux
- **Node.js**: Version 18 or higher
- **RAM**: 512MB minimum
- **Storage**: ~100MB for the app
- **Browser**: Chrome, Firefox, Safari, or Edge

## Files Included

Your download contains:
- Complete source code
- All UI components and animations
- Database schemas and API endpoints
- Styling and responsive design
- Documentation and setup instructions

This is a complete, standalone application that runs entirely on your computer.