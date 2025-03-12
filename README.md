# Sensor Dashboard Chatbot

A React Native application with a chatbot interface that allows users to query sensor data from a Supabase database.

## Features

- Real-time sensor data queries (e.g., "What is the current internal temperature?")
- Historical data analysis (e.g., "What was the average humidity over the last week?")
- Status checks (e.g., "Is the compressor running?")
- Trend analysis (e.g., "How has the pressure changed over the last 24 hours?")

## Project Structure

The project is divided into two main parts:

### Frontend (SensorDashboard/)

The React Native application that provides the user interface for the sensor dashboard and chatbot.

#### Key Files and Directories

- **src/screens/**

  - `Chatbot.js`: The chatbot interface component that allows users to query sensor data using natural language.
  - `Dashboard.js`: The main dashboard screen that displays current sensor readings and status.
  - `Graph.js`: Component for displaying sensor data in graphical format.
  - `Welcome.js`: Welcome screen with app introduction.

- **src/utils/**

  - `config.js`: Central configuration file for the application, containing API endpoints, Supabase credentials, and sensor metadata.
  - `supabase.js`: Initializes and exports the Supabase client for database access.
  - `sensorUtils.js`: Utility functions for working with sensor data, including fetching, formatting, and calculations.

- **App.js**: Main application component that sets up navigation and routing.

### Backend (chatbot-backend/)

The Node.js server that processes chatbot queries, communicates with OpenAI, and retrieves data from Supabase.

#### Key Files

- `Server.js`: The main server file that handles API requests, processes queries using OpenAI, and retrieves data from Supabase.
- `seedData.js`: Script to generate and insert sample sensor data into the Supabase database.
- `.env`: Environment variables file for storing API keys and configuration.

## File Descriptions

### Frontend Files

#### Chatbot.js

This component provides a chat interface for users to query sensor data. It uses the GiftedChat library to create a messaging UI and communicates with the backend server to process natural language queries and retrieve data from the Supabase database.

Key features:

- Sends user messages to the backend for processing
- Displays responses from the chatbot
- Shows a loading indicator while waiting for responses
- Handles error states gracefully

#### Dashboard.js

The main dashboard screen that displays current sensor readings and status. It fetches the latest sensor data from Supabase and presents it in a user-friendly format.

#### config.js

Central configuration file that stores global settings for the application. This includes:

- Backend API URL
- Supabase credentials
- Chart configuration
- Sensor units and display names

#### sensorUtils.js

Utility functions for working with sensor data, including:

- Fetching latest and historical sensor data from Supabase
- Formatting sensor values with appropriate units
- Calculating statistics (average, minimum, maximum)
- Converting database field names to human-readable names

### Backend Files

#### Server.js

The main server file that handles API requests from the frontend. It:

- Processes natural language queries using OpenAI
- Determines the type of data needed (current values, historical averages, trends, etc.)
- Retrieves the appropriate data from Supabase
- Formats the data into natural language responses

#### seedData.js

Script to generate and insert sample sensor data into the Supabase database. It creates realistic data points for the past 30 days with hourly readings for various sensor metrics.

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account with a project set up

### Backend Setup

1. Navigate to the backend directory:

   ```
   cd chatbot-backend
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file with your Supabase and OpenAI credentials:

   ```
   OPENAI_API_KEY=your_openai_api_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   ```

4. Set up the Supabase database:

   - Create a table named `sensor_history` with the following columns:
     - `id` (uuid, primary key)
     - `timestamp` (timestamptz)
     - `temperature_internal` (float8)
     - `temperature_evaporator` (float8)
     - `ambient_temperature` (float8)
     - `humidity_internal` (float8)
     - `pressure_refrigerant` (float8)
     - `current_compressor` (float8)
     - `vibration_level` (float8)
     - `gas_leak_level` (float8)
     - `compressor_status` (boolean)
     - `compressor_cycle_time` (integer)
     - `energy_consumption` (float8)
     - `temperature_gradient` (float8)
     - `pressure_trend` (float8)

5. Seed the database with sample data:

   ```
   npm run seed
   ```

6. Start the backend server:
   ```
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend directory:

   ```
   cd SensorDashboard
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Update the backend API URL in `src/utils/config.js` to match your backend server address.

4. Start the React Native application:
   ```
   npx expo start
   ```

## Usage

1. Open the application on your device or emulator.
2. Navigate to the Chatbot screen.
3. Ask questions about sensor data, such as:
   - "What is the current internal temperature?"
   - "What was the average humidity over the last week?"
   - "Is the compressor running?"
   - "How has the pressure changed over the last 24 hours?"

## Troubleshooting

- If the chatbot is not responding, check that the backend server is running.
- Ensure your Supabase credentials are correct in the `.env` file and `config.js`.
- Check the console logs for any error messages.
- Make sure your device/emulator and backend server are on the same network.

## License

This project is licensed under the MIT License.
