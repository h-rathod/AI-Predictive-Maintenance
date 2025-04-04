# Sensor Dashboard (Frontend)

React Native application that provides an interactive dashboard for monitoring sensor data and includes a chatbot interface for querying data using natural language.

## Features

- Real-time sensor data display
- Interactive graphs for historical data analysis
- Chatbot interface for natural language queries
- Responsive design for mobile and tablet devices

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (for development)

## Installation

1. Clone the repository
2. Navigate to the SensorDashboard directory:
   ```
   cd SensorDashboard
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file based on `.env.sample` with the following environment variables:
   ```
   REACT_APP_BACKEND_URL=http://your-backend-url:3000
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   **Note**: Never commit your `.env` file to Git.

## Running the Application

For development:

```
npx expo start
```

This will start the Expo development server. You can run the app on:

- Android simulator/device: Press 'a'
- iOS simulator/device: Press 'i'
- Web browser: Press 'w'

## Project Structure

- `/src/screens`: Main application screens
- `/src/components`: Reusable React components
- `/src/api`: API integration code
- `/src/utils`: Utility functions
- `/src/services`: Service modules for external integrations
- `/src/context`: React Context providers
- `/src/navigation`: Navigation configurations
- `/src/commons`: Common utilities, constants, and styles

## Dependencies

The main dependencies used in this project are:

- React Native
- Expo
- React Navigation
- Victory Native (for charts)
- React Native Paper (UI components)
- Gifted Chat (for chatbot interface)
- Supabase JS Client

For the complete list of dependencies, see the `package.json` file.
