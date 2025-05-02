# FridgeGuard ML Integration

This project extends the FridgeGuard application with machine learning capabilities for anomaly detection in refrigerator sensor data.

## Project Structure

- **ml-backend/** - Flask server for ML prediction
- **SensorDashboard/** - React Native mobile application
- **chatbot-backend/** - Existing backend for chatbot functionality

## Components

### 1. ML Backend Server

The ML backend is a Flask server that loads a pre-trained autoencoder model for anomaly detection. The model analyzes patterns in sensor data to identify potential anomalies in refrigerator operation.

Key files:

- `app.py` - Flask application
- `requirements.txt` - Python dependencies
- `autoencoder_model.h5` / `autoencoder_model.keras` - Pre-trained model
- `scaler.pkl` - Data normalization parameters
- `threshold.pkl` - Anomaly detection threshold

### 2. React Native Integration

The mobile app includes a new "Predictions" screen that communicates with the ML backend to display anomaly detection results.

Key files:

- `src/utils/anomalyService.js` - Service for ML backend communication
- `src/screens/PredictionsScreen.js` - UI for displaying anomaly predictions

## Setup and Deployment

### ML Backend Setup

1. Navigate to the ml-backend directory

```bash
cd ml-backend
```

2. Create a virtual environment

```bash
python -m venv venv
```

3. Activate the virtual environment

   - Windows: `venv\Scripts\activate`
   - Unix/MacOS: `source venv/bin/activate`

4. Install dependencies

```bash
pip install -r requirements.txt
```

5. Start the server

```bash
python app.py
```

The ML server runs on port 5000 by default.

### Mobile App Setup

1. Ensure the ML server is running

2. Update the server URL if needed

   - Edit `SensorDashboard/src/utils/anomalyService.js`
   - Change `ML_SERVER_URL` to match your server's IP address

3. Install dependencies

```bash
cd SensorDashboard
npm install
```

4. Start the React Native app

```bash
npm start
```

## How It Works

1. The ML backend loads the pre-trained autoencoder model
2. When the user opens the Predictions screen, the app:

   - Fetches recent sensor data from Supabase
   - Sends this data to the ML backend for analysis
   - Displays the results, showing any detected anomalies

3. The anomaly detection process:
   - Data is preprocessed and normalized
   - Fed through the autoencoder model
   - Reconstruction error is calculated
   - Points with high error are flagged as anomalies

## Development Notes

- The ML server must be running for predictions to work
- For Android emulators, the server address is configured as `10.0.2.2:5000`
- For physical devices, update the server URL to your local IP address
- The model is trained to detect anomalies in refrigerator operation based on multiple sensor readings

## Troubleshooting

If you encounter issues with the ML integration:

1. Verify the ML server is running and accessible
2. Check the server URL configuration in `anomalyService.js`
3. Ensure all required model files are present in the correct locations
4. Check the Python environment has all required dependencies installed
