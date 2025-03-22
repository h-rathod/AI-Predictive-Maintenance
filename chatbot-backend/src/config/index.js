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
    sensorHistoryTable: "sensor_data",
  },

  // Sensor field definitions
  sensorFields: {
    // Field names
    evaporator_coil_temperature: "evaporator_coil_temperature",
    freezer_temperature: "freezer_temperature",
    fridge_temperature: "fridge_temperature",
    air_temperature: "air_temperature",
    humidity: "humidity",
    compressor_vibration: "compressor_vibration",
    compressor_vibration_x: "compressor_vibration_x",
    compressor_vibration_y: "compressor_vibration_y",
    compressor_vibration_z: "compressor_vibration_z",
    compressor_current: "compressor_current",
    input_voltage: "input_voltage",
    power_consumption: "power_consumption",
    gas_leakage_level: "gas_leakage_level",
    temperature_diff: "temperature_diff",

    // Field units
    units: {
      evaporator_coil_temperature: "°C",
      freezer_temperature: "°C",
      fridge_temperature: "°C",
      air_temperature: "°C",
      humidity: "%",
      compressor_vibration: "mm/s",
      compressor_vibration_x: "mm/s",
      compressor_vibration_y: "mm/s",
      compressor_vibration_z: "mm/s",
      compressor_current: "A",
      input_voltage: "V",
      power_consumption: "W",
      gas_leakage_level: "ppm",
      temperature_diff: "°C",
    },

    // Human-readable field names
    displayNames: {
      evaporator_coil_temperature: "Evaporator Coil Temperature",
      freezer_temperature: "Freezer Temperature",
      fridge_temperature: "Fridge Temperature",
      air_temperature: "Air Temperature",
      humidity: "Humidity",
      compressor_vibration: "Compressor Vibration",
      compressor_vibration_x: "Compressor Vibration X",
      compressor_vibration_y: "Compressor Vibration Y",
      compressor_vibration_z: "Compressor Vibration Z",
      compressor_current: "Compressor Current",
      input_voltage: "Input Voltage",
      power_consumption: "Power Consumption",
      gas_leakage_level: "Gas Leakage Level",
      temperature_diff: "Temperature Difference",
    },
  },
};
