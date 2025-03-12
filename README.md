# Sensor Dashboard with Chatbot Interface

A React Native application with a chatbot interface that allows users to query sensor data from a Supabase database. This project is designed for monitoring and analyzing sensor data from IoT devices.

## Features

- Real-time sensor data queries (e.g., "What is the current internal temperature?")
- Historical data analysis (e.g., "What was the average humidity over the last week?")
- Status checks (e.g., "Is the compressor running?")
- Trend analysis (e.g., "How has the pressure changed over the last 24 hours?")
- Interactive dashboard with sensor readings
- Graphical visualization of sensor data

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

#### Key Files and Directories

- **src/server.js**: The main server file that sets up the Express server, middleware, and routes.
- **src/controllers/**
  - `chatController.js`: Handles chat requests from the frontend.
- **src/services/**
  - `openaiService.js`: Handles interactions with the OpenAI API.
  - `supabaseService.js`: Handles interactions with the Supabase database.
- **src/config/**
  - `index.js`: Centralizes configuration settings for the backend.
- **src/utils/**
  - `seedData.js`: Script to generate and insert sample sensor data into the Supabase database.

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

Key features:

- Displays current sensor readings with appropriate units
- Shows status indicators for critical components
- Provides navigation to detailed graphs for each sensor
- Refreshes data automatically at regular intervals

#### Graph.js

Component for displaying sensor data in graphical format. It fetches historical data for a specific sensor and renders it as a line chart.

Key features:

- Displays sensor data over time as a line chart
- Allows users to select different time ranges
- Shows min, max, and average values
- Handles loading and error states

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

#### server.js

The main entry point for the backend server. It sets up the Express server, middleware, and routes.

Key features:

- Configures Express middleware (CORS, JSON parsing)
- Sets up routes for handling chat requests
- Provides a health check endpoint
- Starts the server on the configured port

#### chatController.js

Controller that handles chat requests from the frontend. It processes user queries, retrieves data from the database, and formats responses.

Key features:

- Analyzes user queries to determine what data is needed
- Executes the appropriate database queries
- Formats responses in natural language
- Handles errors gracefully

#### openaiService.js

Service that handles interactions with the OpenAI API. It provides methods for analyzing user queries and formatting responses.

Key features:

- Analyzes user queries to determine what type of data is needed
- Formats data into natural language responses
- Handles OpenAI API errors

#### supabaseService.js

Service that handles interactions with the Supabase database. It provides methods for querying sensor data in various ways.

Key features:

- Fetches latest sensor data
- Calculates historical averages
- Gets minimum and maximum values
- Retrieves trend data
- Checks component status

#### seedData.js

Script to generate and insert sample sensor data into the Supabase database. It creates realistic data points for the past 30 days with hourly readings for various sensor metrics.

Key features:

- Generates realistic sensor data with appropriate variations
- Simulates daily and hourly patterns
- Handles component status changes
- Inserts data in batches to avoid request size limits

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account with a project set up
- OpenAI API key

### Backend Setup

1. Navigate to the backend directory:

   ```
   cd chatbot-backend
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file based on `.env.sample` with your Supabase and OpenAI credentials:

   ```
   OPENAI_API_KEY=your_openai_api_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   PORT=3000
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

3. Create a `.env` file based on `.env.sample` with your backend URL and Supabase credentials:

   ```
   REACT_APP_BACKEND_URL=http://your-backend-url:3000
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the React Native application:
   ```
   npx expo start
   ```

## Usage

1. Open the application on your device or emulator.
2. Navigate to the Dashboard screen to view current sensor readings.
3. Tap on a sensor card to view detailed historical data in graph form.
4. Navigate to the Chatbot screen to ask questions about sensor data, such as:
   - "What is the current internal temperature?"
   - "What was the average humidity over the last week?"
   - "Is the compressor running?"
   - "How has the pressure changed over the last 24 hours?"

## Troubleshooting

- If the chatbot is not responding, check that the backend server is running.
- Ensure your Supabase credentials are correct in the `.env` files.
- Check the console logs for any error messages.
- Make sure your device/emulator and backend server are on the same network.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgements

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [Supabase](https://supabase.io/)
- [OpenAI](https://openai.com/)
- [GiftedChat](https://github.com/FaridSafi/react-native-gifted-chat)
