# Chatbot Backend

Node.js server application that processes natural language queries from the Sensor Dashboard frontend, interacts with OpenAI, and retrieves data from the Supabase database.

## Features

- Natural language processing for sensor data queries
- Integration with OpenAI API
- Supabase database interaction for sensor data
- RESTful API for chatbot functionality
- Health check endpoint for monitoring server status
- Support for handling complex sensor data queries
- Standardized error handling and response formatting

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

   | Column Name            | Data Type   | Description                     |
   | ---------------------- | ----------- | ------------------------------- |
   | id                     | uuid        | Primary key                     |
   | timestamp              | timestamptz | Time of sensor reading          |
   | temperature_internal   | float8      | Internal temperature in °C      |
   | temperature_evaporator | float8      | Evaporator temperature in °C    |
   | ambient_temperature    | float8      | Ambient temperature in °C       |
   | humidity_internal      | float8      | Internal humidity in %          |
   | pressure_refrigerant   | float8      | Refrigerant pressure in kPa     |
   | current_compressor     | float8      | Compressor current in A         |
   | vibration_level        | float8      | Vibration level in mm/s         |
   | gas_leak_level         | float8      | Gas leak level in ppm           |
   | compressor_status      | boolean     | Whether compressor is active    |
   | compressor_cycle_time  | integer     | Compressor cycle time           |
   | energy_consumption     | float8      | Energy consumption in kWh       |
   | temperature_gradient   | float8      | Temperature change rate in °C/h |
   | pressure_trend         | float8      | Pressure change rate in kPa/h   |

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

## API Endpoints

- `GET /health` - Check server health status
- `POST /api/chat` - Process chatbot queries
- `GET /api/sensor-data` - Get latest sensor data
- `GET /api/sensor-data/history` - Get historical sensor data

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
