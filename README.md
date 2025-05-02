# IoT Predictive Maintenance System

A comprehensive IoT solution for refrigeration equipment monitoring, anomaly detection, and predictive maintenance using machine learning.

## System Overview

This integrated system provides end-to-end capabilities for monitoring refrigeration equipment, detecting anomalies, predicting failures, and estimating remaining useful life. It consists of three main components:

1. **Java Spring ML Backend (`ml-back`)**: Handles machine learning inference for predictive maintenance
2. **React Native Frontend (`react-native/SensorDashboard`)**: Mobile app for visualizing sensor data and ML predictions
3. **Node.js Chatbot Backend (`react-native/chatbot-backend`)**: Provides natural language interface for querying sensor data and prediction results

![System Architecture](https://i.imgur.com/example-architecture.png)

## Components

### 1. Java Spring ML Backend (`ml-back`)

The ML backend is responsible for processing sensor data and generating predictions using four machine learning models:

- **Anomaly Detection**: Uses an autoencoder (DeepLearning4j) to identify abnormal sensor patterns
- **Failure Probability**: Uses Random Forest Classifier (Weka) to predict the probability of imminent failure
- **Health Index**: Uses Random Forest Regressor (Weka) to estimate equipment health on a scale of 0-100
- **Remaining Useful Life (RUL)**: Uses LSTM network (DeepLearning4j) to predict remaining time until maintenance is required

The application follows a pipeline-based architecture:
1. Fetches sensor data from Supabase
2. Preprocesses data (normalization, sequence creation)
3. Runs inference through all four ML models
4. Stores prediction results back in Supabase

**Key Technologies:**
- Java 21, Spring Boot 3.2.3
- DeepLearning4j, Weka
- Supabase PostgreSQL
- Maven

[Learn more about the ML Backend](./ml-back/README.md)

### 2. React Native Frontend (`react-native/SensorDashboard`)

The mobile application provides a user-friendly interface for monitoring sensor data and ML predictions:

- **Dashboard**: Real-time visualization of key sensor metrics
- **Graphs**: Historical data visualization with configurable timeframes
- **Predictions Screen**: Shows ML model outputs (anomaly detection, failure probability, health index, RUL)
- **Chatbot Interface**: Natural language interface for querying sensor data and ML predictions
- **Settings**: Configuration options for the application

**Key Technologies:**
- React Native + Expo
- React Navigation
- Victory Native (charts)
- React Native Paper
- Supabase Client
- Gifted Chat

[Learn more about the React Native Frontend](./react-native/SensorDashboard/README.md)

### 3. Node.js Chatbot Backend (`react-native/chatbot-backend`)

The chatbot backend processes natural language queries about sensor data and ML predictions:

- Analyzes user queries using OpenAI's language models
- Retrieves relevant data from Supabase (both sensor data and ML predictions)
- Formats responses in natural language
- Provides a RESTful API for the frontend

**Key Technologies:**
- Node.js + Express
- OpenAI API
- Supabase Client
- REST API

[Learn more about the Chatbot Backend](./react-native/chatbot-backend/README.md)

## Data Flow

The system operates with the following data flow:

1. **Sensor Data Collection**:
   - IoT sensors collect data from refrigeration equipment
   - Data is stored in the Supabase `sensor_history` table

2. **ML Processing**:
   - Spring ML backend fetches latest sensor data
   - Runs inference through four ML models
   - Stores prediction results in the Supabase `predictions` table

3. **Visualization and Interaction**:
   - React Native app fetches both sensor data and ML predictions from Supabase
   - Displays data in dashboard, graphs, and predictions screen
   - User can query data using natural language through the chatbot

4. **Natural Language Processing**:
   - User queries are sent to the chatbot backend
   - Queries are analyzed by OpenAI to determine intent
   - Relevant data is fetched from Supabase (both sensor data and ML predictions)
   - Response is formatted in natural language and returned to the frontend

## Database Schema

### Sensor Data Table

The `sensor_history` table stores raw sensor readings:

| Column Name              | Data Type   | Description                     |
| ------------------------ | ----------- | ------------------------------- |
| `id`                     | uuid        | Primary key                     |
| `timestamp`              | timestamptz | Time of sensor reading          |
| `evaporator_coil_temperature` | float8  | Evaporator coil temperature in °C    |
| `freezer_temperature`    | float8      | Freezer internal temperature in °C |
| `fridge_temperature`     | float8      | Fridge internal temperature in °C   |
| `air_temperature`        | float8      | Ambient air temperature in °C   |
| `humidity`               | float8      | Humidity level in %             |
| `compressor_vibration_x` | float8      | X-axis vibration in mm/s        |
| `compressor_vibration_y` | float8      | Y-axis vibration in mm/s        |
| `compressor_vibration_z` | float8      | Z-axis vibration in mm/s        |
| `compressor_vibration`   | float8      | Overall vibration magnitude     |
| `compressor_current`     | float8      | Compressor current in A         |
| `input_voltage`          | float8      | Input voltage in V              |
| `power_consumption`      | float8      | Power consumption in W          |
| `gas_leakage_level`      | float8      | Gas leak level in ppm           |
| `temperature_diff`       | float8      | Temperature differential in °C  |
| `inserted_at`            | timestamptz | Time when record was inserted   |

### Predictions Table

The `predictions` table stores ML model outputs:

| Column Name          | Data Type   | Description                           |
| -------------------- | ----------- | ------------------------------------- |
| `id`                 | uuid        | Primary key                           |
| `timestamp`          | timestamptz | Time of prediction                    |
| `anomaly`            | boolean     | True if anomaly detected              |
| `failure_probability`| float8      | Probability of imminent failure (0-1) |
| `health_index`       | float8      | Equipment health score (0-100)        |
| `remaining_useful_life` | float8   | Estimated hours until maintenance required |
| `created_at`         | timestamptz | Time when prediction was created      |

## Setup and Deployment

Each component has its own setup instructions. Please refer to their respective README files:

- [ML Backend Setup](./ml-back/RUNNING.md)
- [React Native Frontend Setup](./react-native/SensorDashboard/README.md)
- [Chatbot Backend Setup](./react-native/chatbot-backend/README.md)

### Environment Variables

Each component requires specific environment variables:

#### ML Backend (`application.properties` or environment variables)

```properties
supabase.url=your_supabase_url
supabase.key=your_supabase_service_key
supabase.sensor_table=sensor_history
supabase.predictions_table=predictions
schedule.enabled=true
schedule.rate=60000  # Run pipeline every 60 seconds
```

#### React Native Frontend (`.env`)

```
BACKEND_URL=http://your-backend-url:3000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Chatbot Backend (`.env`)

```
OPENAI_API_KEY=your_openai_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
PORT=3000
```

## Integration Points

The system is designed with clear integration points between components:

1. **ML Backend ↔ Supabase**:
   - ML backend fetches sensor data from `sensor_history` table
   - ML backend stores predictions in `predictions` table

2. **React Native Frontend ↔ Supabase**:
   - Frontend fetches sensor data from `sensor_history` table
   - Frontend fetches ML predictions from `predictions` table

3. **React Native Frontend ↔ Chatbot Backend**:
   - Frontend sends natural language queries to the chatbot backend
   - Chatbot backend returns formatted responses

4. **Chatbot Backend ↔ Supabase**:
   - Chatbot backend queries both `sensor_history` and `predictions` tables
   - Chatbot backend formats data into natural language responses

5. **Chatbot Backend ↔ OpenAI**:
   - Chatbot backend sends user queries to OpenAI for intent classification
   - Chatbot backend uses OpenAI to format technical data into natural language

## Key Features

### Real-time Monitoring
- Live sensor data visualization
- Auto-refreshing dashboards
- Status indicators for equipment health

### Predictive Maintenance
- Anomaly detection identifies irregular patterns
- Failure probability estimation
- Equipment health index tracking
- Remaining useful life prediction

### Data Visualization
- Historical data charts with configurable timeframes
- Comparative analysis of different metrics
- Daily aggregation of prediction data

### Natural Language Interface
- Query sensor data and ML predictions using natural language
- Get maintenance recommendations
- Analyze trends and anomalies

## Future Enhancements

Potential areas for system enhancement:

1. **Advanced ML Models**:
   - Time series forecasting for predictive analytics
   - Multi-variate anomaly detection
   - Reinforcement learning for optimal maintenance scheduling

2. **Enhanced Visualization**:
   - 3D visualization of sensor data
   - AR/VR integration for maintenance guidance
   - Real-time alerting and notification system

3. **System Expansion**:
   - Support for multiple equipment types
   - Fleet management capabilities
   - Integration with maintenance workflow systems

4. **User Experience**:
   - Offline mode with data synchronization
   - User role management
   - Customizable dashboards

## Troubleshooting

Common issues and solutions:

1. **Connection Issues**:
   - Verify Supabase credentials in environment variables
   - Check network connectivity
   - Ensure chatbot backend server is running

2. **ML Pipeline Failures**:
   - Check Java logs for stack traces
   - Verify model files are present
   - Check Supabase permissions

3. **Chatbot Response Errors**:
   - Verify OpenAI API key
   - Check for rate limits
   - Inspect backend server logs

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
