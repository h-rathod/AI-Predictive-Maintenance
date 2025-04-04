# AI Predictive Maintenance

A React Native application with a chatbot interface for IoT sensor monitoring and predictive maintenance. The system allows users to query sensor data using natural language and visualize real-time and historical sensor readings.

## Project Overview

This project consists of two main components:

### 1. SensorDashboard (Frontend)

A React Native application built with Expo that provides:

- Interactive dashboard for monitoring sensor data
- Chatbot interface for natural language queries about sensor readings
- Graphical visualization of historical data
- Responsive design for mobile and tablet devices

### 2. Chatbot Backend

A Node.js server application that:

- Processes natural language queries using OpenAI
- Retrieves sensor data from Supabase database
- Provides a RESTful API for the frontend

## Tech Stack

### Frontend

- React Native + Expo
- React Navigation
- Victory Native (charts)
- React Native Paper
- Gifted Chat
- Supabase Client

### Backend

- Node.js + Express
- OpenAI API
- Supabase Client
- Middleware: CORS, body-parser

### Database

- Supabase (PostgreSQL)

## Project Structure

```
/
├── SensorDashboard/           # Frontend React Native application
│   ├── src/
│   │   ├── api/               # API integration
│   │   ├── components/        # Reusable components
│   │   ├── context/           # React Context providers
│   │   ├── navigation/        # Navigation configuration
│   │   ├── screens/           # Main application screens
│   │   ├── services/          # Service modules
│   │   └── utils/             # Utility functions
│   ├── App.js                 # Main application component
│   └── README.md              # Frontend documentation
│
├── chatbot-backend/           # Backend Node.js server
│   ├── src/
│   │   ├── config/            # Configuration
│   │   ├── controllers/       # Request handlers
│   │   ├── services/          # Business logic
│   │   └── utils/             # Utility functions
│   ├── Server.js              # Main server file
│   ├── seedData.js            # Database seed script
│   └── README.md              # Backend documentation
│
└── README.md                  # Main documentation (this file)
```

## Getting Started

Each component (frontend and backend) has its own setup instructions. Please refer to their respective README files:

- [SensorDashboard Setup Instructions](./SensorDashboard/README.md)
- [Chatbot Backend Setup Instructions](./chatbot-backend/README.md)

## Environment Variables

Both the frontend and backend require environment variables to be set in their respective `.env` files. Sample files (`.env.sample`) are provided in each directory with the required variables.

**Important:** Never commit your `.env` files to Git. They are included in `.gitignore` to prevent accidental commits.

## Database Schema

The application uses a Supabase PostgreSQL database with the following main table:

**sensor_history**

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

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
