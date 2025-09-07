# Arasie - Health & Fitness Tracking App

A modern health and fitness tracking application built with React and Firebase.

## Features

- User authentication with Firebase Auth
- Daily progress tracking (water, diet, workout)
- Streak counting and gamification
- Real-time data sync with Firestore
- Responsive design with Tailwind CSS

## Environment Setup

1. Copy the environment template:

   ```bash
   cp .env.example .env
   ```

2. Fill in your Firebase configuration in the `.env` file:
   ```
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up your environment variables (see Environment Setup above)

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **State Management**: Zustand
- **Routing**: React Router
