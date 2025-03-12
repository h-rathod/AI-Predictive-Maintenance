# Sensor Dashboard Chatbot

A React Native application with a chatbot interface that allows users to query sensor data from a Supabase database.

## Features

- Real-time sensor data queries (e.g., "What is the current internal temperature?")
- Historical data analysis (e.g., "What was the average humidity over the last week?")
- Status checks (e.g., "Is the compressor running?")
- Trend analysis (e.g., "How has the pressure changed over the last 24 hours?")

## Project Structure

- `SensorDashboard/`: React Native frontend application
- `chatbot-backend/`: Node.js backend server for handling chatbot requests

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
   node seedData.js
   ```

6. Start the backend server:
   ```
   node Server.js
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

3. Update the backend API URL in `src/screens/Chatbot.js` to match your backend server address.

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
- Ensure your Supabase credentials are correct in the `.env` file.
- Check the console logs for any error messages.

## License

This project is licensed under the MIT License.
