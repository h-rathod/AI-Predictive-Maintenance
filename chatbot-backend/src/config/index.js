/**
 * Backend Configuration
 *
 * This file centralizes all configuration settings for the backend server.
 * It loads environment variables from the .env file and provides them in a structured way.
 */

require("dotenv").config();

module.exports = {
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
  },

  // OpenAI configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },

  // Supabase configuration
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
  },

  // Database table names
  database: {
    sensorHistoryTable: "sensor_history",
  },

  // Sensor field definitions
  sensorFields: {
    // Field names
    temperature_internal: "temperature_internal",
    temperature_evaporator: "temperature_evaporator",
    ambient_temperature: "ambient_temperature",
    humidity_internal: "humidity_internal",
    pressure_refrigerant: "pressure_refrigerant",
    current_compressor: "current_compressor",
    vibration_level: "vibration_level",
    gas_leak_level: "gas_leak_level",
    compressor_status: "compressor_status",
    compressor_cycle_time: "compressor_cycle_time",
    energy_consumption: "energy_consumption",
    temperature_gradient: "temperature_gradient",
    pressure_trend: "pressure_trend",

    // Field units
    units: {
      temperature_internal: "°C",
      temperature_evaporator: "°C",
      ambient_temperature: "°C",
      humidity_internal: "%",
      pressure_refrigerant: "kPa",
      current_compressor: "A",
      vibration_level: "mm/s",
      gas_leak_level: "ppm",
      energy_consumption: "kWh",
      temperature_gradient: "°C/h",
      pressure_trend: "kPa/h",
    },

    // Human-readable field names
    displayNames: {
      temperature_internal: "Internal Temperature",
      temperature_evaporator: "Evaporator Temperature",
      ambient_temperature: "Ambient Temperature",
      humidity_internal: "Internal Humidity",
      pressure_refrigerant: "Refrigerant Pressure",
      current_compressor: "Compressor Current",
      vibration_level: "Vibration Level",
      gas_leak_level: "Gas Leak Level",
      compressor_status: "Compressor Status",
      compressor_cycle_time: "Compressor Cycle Time",
      energy_consumption: "Energy Consumption",
      temperature_gradient: "Temperature Gradient",
      pressure_trend: "Pressure Trend",
    },
  },
};
