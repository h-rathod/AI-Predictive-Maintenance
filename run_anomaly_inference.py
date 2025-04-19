# Install required libraries (Colab or local)
# !pip install numpy pandas tensorflow

import numpy as np
import pandas as pd
import tensorflow as tf
import pickle
from datetime import datetime

# Load model, scaler, and threshold
model = tf.keras.models.load_model('autoencoder_model.keras')
with open('scaler.pkl', 'rb') as f:
    scaler = pickle.load(f)
with open('threshold.pkl', 'rb') as f:
    threshold = pickle.load(f)

# Features used by the model
selected_features = [
    'evaporator_coil_temperature', 'fridge_temperature', 'compressor_vibration_x',
    'compressor_vibration_y', 'compressor_vibration_z', 'compressor_current',
    'input_voltage', 'gas_leakage_level', 'compressor_vibration', 'power_consumption',
    'temperature_diff'
]

# Load new sensor data
try:
    df = pd.read_csv('new_sensor_data.csv')
except FileNotFoundError:
    print("Error: 'new_sensor_data.csv' not found.")
    exit(1)

# Validate required columns
required_columns = ['device_id', 'timestamp', 'evaporator_coil_temperature', 'fridge_temperature',
                    'compressor_vibration_x', 'compressor_vibration_y', 'compressor_vibration_z',
                    'compressor_current', 'input_voltage', 'gas_leakage_level']
missing_cols = [col for col in required_columns if col not in df.columns]
if missing_cols:
    print(f"Error: Missing columns in CSV: {missing_cols}")
    exit(1)

# Compute derived features if not present
if 'compressor_vibration' not in df.columns:
    df['compressor_vibration'] = np.sqrt(
        df['compressor_vibration_x']**2 +
        df['compressor_vibration_y']**2 +
        df['compressor_vibration_z']**2
    ).round(2)
if 'power_consumption' not in df.columns:
    df['power_consumption'] = (df['compressor_current'] * df['input_voltage'] * 0.8).clip(upper=2000).round(2)
if 'temperature_diff' not in df.columns:
    df['temperature_diff'] = (df['fridge_temperature'] - df['evaporator_coil_temperature']).round(2)

# Ensure timestamp is datetime
df['timestamp'] = pd.to_datetime(df['timestamp'])

# Sort by timestamp
df = df.sort_values('timestamp')

# Create sequences (10 time steps)
sequence_length = 10
sequences = []
sequence_info = []

for i in range(0, len(df) - sequence_length + 1, sequence_length):
    seq_df = df.iloc[i:i + sequence_length]
    if len(seq_df) == sequence_length:
        seq_data = seq_df[selected_features].values
        sequences.append(seq_data)
        sequence_info.append({
            'sequence_id': i // sequence_length,
            'timestamp_start': seq_df['timestamp'].iloc[0],
            'timestamp_end': seq_df['timestamp'].iloc[-1]
        })

if not sequences:
    print("Error: Not enough data to form any sequences.")
    exit(1)

# Convert to numpy array
X_new = np.array(sequences)

# Preprocess: Log-transform and normalize
X_reshaped = X_new.reshape(-1, X_new.shape[-1])
X_reshaped[:, 6] = np.log1p(X_reshaped[:, 6])  # input_voltage
X_reshaped[:, 9] = np.log1p(X_reshaped[:, 9])  # power_consumption
X_scaled = scaler.transform(X_reshaped).reshape(X_new.shape)

# Run inference
reconstructions = model.predict(X_scaled)
mse = np.mean(np.square(X_scaled - reconstructions), axis=(1, 2))
predictions = (mse > threshold).astype(int)  # 1: anomaly, 0: normal

# Prepare results
results = []
for i, info in enumerate(sequence_info):
    results.append({
        'sequence_id': info['sequence_id'],
        'timestamp_start': info['timestamp_start'],
        'timestamp_end': info['timestamp_end'],
        'reconstruction_error': round(mse[i], 4),
        'is_anomaly': predictions[i]
    })

# Save results
results_df = pd.DataFrame(results)
results_df.to_csv('anomaly_results.csv', index=False)

# Print summary
anomaly_count = sum(predictions)
print(f"Detected {anomaly_count} anomalies out of {len(predictions)} sequences.")
if anomaly_count > 0:
    print("\nAnomalous sequences:")
    for _, row in results_df[results_df['is_anomaly'] == 1].iterrows():
        print(f"Sequence {row['sequence_id']}: Error = {row['reconstruction_error']:.4f}, "
              f"Time: {row['timestamp_start']} to {row['timestamp_end']}")

print("Results saved to 'anomaly_results.csv'.")