# IoT Predictive Maintenance System

A comprehensive IoT solution for refrigeration equipment monitoring, anomaly detection, and predictive maintenance using machine learning.

## System Overview

This integrated system provides end-to-end capabilities for monitoring refrigeration equipment, detecting anomalies, predicting failures, and estimating remaining useful life. It consists of three main components:

1. **Java Spring ML Backend (`ml-back`)**: Handles machine learning inference for predictive maintenance (now located at `ml-back` inside this directory)
2. **React Native Frontend (`SensorDashboard`)**: Mobile app for visualizing sensor data and ML predictions
3. **Node.js Chatbot Backend (`chatbot-backend`)**: Provides natural language interface for querying sensor data and prediction results

![System Architecture](https://i.imgur.com/example-architecture.png)

## Components

### 1. Java Spring ML Backend (`ml-back`)

- **Location:** [`ml-back/`](./ml-back/README.md)
- Handles all ML inference and predictive maintenance logic
- See [ml-back/README.md](./ml-back/README.md) for backend-specific setup and details

### 2. React Native Frontend (`SensorDashboard`)

- **Location:** [`SensorDashboard/`](./SensorDashboard/README.md)
- Mobile dashboard for real-time and historical sensor data, and ML prediction visualization
- See [SensorDashboard/README.md](./SensorDashboard/README.md) for mobile setup and usage

### 3. Node.js Chatbot Backend (`chatbot-backend`)

- **Location:** [`chatbot-backend/`](./chatbot-backend/README.md)
- REST API and OpenAI-powered chatbot for natural language queries
- See [chatbot-backend/README.md](./chatbot-backend/README.md) for backend setup

## Installation & Setup

1. **Clone this repository**
2. All modules are now inside this `react-native` directory:
   - `SensorDashboard/` (mobile app)
   - `chatbot-backend/` (chatbot server)
   - `ml-back/` (Java Spring ML backend)
3. Follow each module's README for detailed setup instructions

## How to Run

- **Frontend (SensorDashboard):**
  - See [SensorDashboard/README.md](./SensorDashboard/README.md)
- **Chatbot Backend:**
  - See [chatbot-backend/README.md](./chatbot-backend/README.md)
- **ML Backend:**
  - See [ml-back/README.md](./ml-back/README.md)

## Project Structure

```
react-native/
├── SensorDashboard/       # React Native mobile app
│   ├── README.md
│   └── ...
├── chatbot-backend/       # Node.js chatbot API
│   ├── README.md
│   └── ...
├── ml-back/               # Java Spring ML backend
│   ├── README.md
│   └── ...
├── README.md              # (You are here) Unified project documentation
└── ...
```

## About

This repository unifies all major components for predictive maintenance and IoT monitoring in a single codebase for easier management, deployment, and collaboration.

For detailed documentation, see each module's README:
- [SensorDashboard/README.md](./SensorDashboard/README.md)
- [chatbot-backend/README.md](./chatbot-backend/README.md)
- [ml-back/README.md](./ml-back/README.md)
│   │   ├── navigation/        # Navigation configuration
│   │   ├── screens/           # Main application screens
│   │   ├── services/          # Service modules
│   │   └── utils/             # Utility functions and configs
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

### Frontend Environment Variables

```
BACKEND_URL=http://your-backend-url:3000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Backend Environment Variables

```
OPENAI_API_KEY=your_openai_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
PORT=3000
```

**Important:** Never commit your `.env` files to Git. They are included in `.gitignore` to prevent accidental commits.

## Database Schema

The application uses a Supabase PostgreSQL database with the following main table:

**sensor_history**

| Column Name              | Data Type   | Description                     |
| ------------------------ | ----------- | ------------------------------- |
| `id`                     | uuid        | Primary key                     |
| `timestamp`              | timestamptz | Time of sensor reading          |
| `temperature_internal`   | float8      | Internal temperature in °C      |
| `temperature_evaporator` | float8      | Evaporator temperature in °C    |
| `ambient_temperature`    | float8      | Ambient temperature in °C       |
| `humidity_internal`      | float8      | Internal humidity in %          |
| `pressure_refrigerant`   | float8      | Refrigerant pressure in kPa     |
| `current_compressor`     | float8      | Compressor current in A         |
| `vibration_level`        | float8      | Vibration level in mm/s         |
| `gas_leak_level`         | float8      | Gas leak level in ppm           |
| `compressor_status`      | boolean     | Whether compressor is active    |
| `compressor_cycle_time`  | integer     | Compressor cycle time           |
| `energy_consumption`     | float8      | Energy consumption in kWh       |
| `temperature_gradient`   | float8      | Temperature change rate in °C/h |
| `pressure_trend`         | float8      | Pressure change rate in kPa/h   |

## Recent Updates

- Added real-time server connectivity check functionality
- Implemented comprehensive chart configuration system
- Added detailed sensor unit display for better readability
- Standardized sensor naming conventions across the application
- Enhanced database schema with additional sensor metrics
- Added health check endpoint on the backend
- Improved error handling for API requests

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
