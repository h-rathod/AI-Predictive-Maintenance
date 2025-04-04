# Chatbot Backend

Node.js server application that processes natural language queries from the Sensor Dashboard frontend, interacts with OpenAI, and retrieves data from the Supabase database.

## Features

- Natural language processing for sensor data queries
- Integration with OpenAI API
- Supabase database interaction for sensor data
- RESTful API for chatbot functionality

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account with a project set up
- OpenAI API key

## Installation

1. Clone the repository
2. Navigate to the chatbot-backend directory:
   ```
   cd chatbot-backend
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file based on `.env.sample` with the following environment variables:
   ```
   OPENAI_API_KEY=your_openai_api_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   PORT=3000
   ```
   **Note**: Never commit your `.env` file to Git.

## Database Setup

1. Set up the Supabase database:

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

2. Seed the database with sample data:
   ```
   node seedData.js
   ```

## Running the Server

Start the backend server:

```
node Server.js
```

Or for development with automatic restart on file changes:

```
npm run dev
```

The server will be available at `http://localhost:3000` (or the PORT specified in your .env file).

## Project Structure

- `Server.js`: Main server entry point
- `/src/config`: Configuration settings
- `/src/controllers`: Request handlers
- `/src/services`: Business logic and external API interactions
- `/src/utils`: Utility functions and helpers

## Dependencies

The main dependencies used in this project are:

- Express.js
- OpenAI Node.js client
- Supabase JS Client
- dotenv
- cors
- nodemon (dev dependency)

For the complete list of dependencies, see the `package.json` file.
