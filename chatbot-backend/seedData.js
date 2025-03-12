/**
 * Seed Data Generator for Sensor Dashboard
 *
 * This script generates realistic sample sensor data and inserts it into the Supabase database.
 * It creates data points for the past 30 days with hourly readings for various sensor metrics.
 */

require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

/**
 * Generates a random number within a specified range
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random number within the range
 */
const randomInRange = (min, max) => {
  return Math.random() * (max - min) + min;
};

/**
 * Generates a random boolean with a bias towards true or false
 * @param {number} trueBias - Probability of returning true (0-1)
 * @returns {boolean} Random boolean
 */
const randomBoolean = (trueBias = 0.5) => {
  return Math.random() < trueBias;
};

/**
 * Generates sample sensor data for the past 30 days
 * @returns {Array} Array of data points
 */
const generateSampleData = () => {
  const data = [];
  const now = new Date();

  // Initial base values for sensors
  const initialValues = {
    temperatureInternal: 4.0, // refrigerator temperature in Celsius
    temperatureEvaporator: -15.0,
    ambientTemperature: 22.0,
    humidityInternal: 40.0,
    pressureRefrigerant: 150.0,
    currentCompressor: 2.5,
    vibrationLevel: 0.5,
    gasLeakLevel: 0.1,
    compressorStatus: true,
    energyConsumption: 0.2,
  };

  // Create a copy of initial values to track current values
  let currentValues = { ...initialValues };

  // Generate data points for the past 30 days, every hour
  for (let day = 30; day >= 0; day--) {
    for (let hour = 0; hour < 24; hour++) {
      // Skip some hours randomly to simulate gaps in data
      if (Math.random() > 0.9) continue;

      const timestamp = new Date(now);
      timestamp.setDate(now.getDate() - day);
      timestamp.setHours(hour, 0, 0, 0);

      // Add some daily variation
      const dailyVariation = Math.sin(day * 0.2) * 2;
      // Add some hourly variation
      const hourlyVariation = Math.sin(hour * 0.25) * 1.5;

      // Randomly toggle compressor status with a bias towards being on
      if (hour % 4 === 0) {
        currentValues.compressorStatus = randomBoolean(0.7);
      }

      // Calculate temperature gradient and pressure trend
      const temperatureGradient = randomInRange(-0.5, 0.5);
      const pressureTrend = randomInRange(-5, 5);

      // Create a data point with variations
      const dataPoint = {
        timestamp: timestamp.toISOString(),
        temperature_internal:
          currentValues.temperatureInternal +
          hourlyVariation * 0.5 +
          dailyVariation * 0.3 +
          randomInRange(-0.5, 0.5),
        temperature_evaporator:
          currentValues.temperatureEvaporator +
          hourlyVariation * 0.3 +
          dailyVariation * 0.2 +
          randomInRange(-1, 1),
        ambient_temperature:
          currentValues.ambientTemperature +
          hourlyVariation +
          dailyVariation +
          randomInRange(-2, 2),
        humidity_internal:
          currentValues.humidityInternal +
          hourlyVariation * 2 +
          dailyVariation +
          randomInRange(-5, 5),
        pressure_refrigerant:
          currentValues.pressureRefrigerant +
          hourlyVariation * 3 +
          dailyVariation * 2 +
          randomInRange(-10, 10),
        current_compressor: currentValues.compressorStatus
          ? currentValues.currentCompressor + randomInRange(-0.3, 0.3)
          : 0,
        vibration_level: currentValues.compressorStatus
          ? currentValues.vibrationLevel + randomInRange(-0.2, 0.4)
          : 0,
        gas_leak_level: currentValues.gasLeakLevel + randomInRange(0, 0.05),
        compressor_status: currentValues.compressorStatus,
        compressor_cycle_time: currentValues.compressorStatus
          ? Math.floor(randomInRange(10, 60))
          : 0,
        energy_consumption:
          currentValues.energyConsumption +
          (currentValues.compressorStatus ? randomInRange(0.1, 0.3) : 0),
        temperature_gradient: temperatureGradient,
        pressure_trend: pressureTrend,
      };

      data.push(dataPoint);
    }

    // Simulate some daily drift in base values
    applyDailyDrift(currentValues);
  }

  return data;
};

/**
 * Applies daily drift to sensor values to simulate realistic changes over time
 * @param {Object} values - Current sensor values
 */
function applyDailyDrift(values) {
  // Apply small random changes to each value
  values.temperatureInternal += randomInRange(-0.1, 0.1);
  values.temperatureEvaporator += randomInRange(-0.2, 0.2);
  values.ambientTemperature += randomInRange(-0.5, 0.5);
  values.humidityInternal += randomInRange(-1, 1);
  values.pressureRefrigerant += randomInRange(-2, 2);
  values.currentCompressor += randomInRange(-0.05, 0.05);
  values.vibrationLevel += randomInRange(-0.02, 0.02);
  values.gasLeakLevel += randomInRange(-0.01, 0.01);
  values.energyConsumption += randomInRange(-0.02, 0.02);

  // Keep values within reasonable ranges
  values.temperatureInternal = Math.max(
    2,
    Math.min(8, values.temperatureInternal)
  );
  values.temperatureEvaporator = Math.max(
    -20,
    Math.min(-10, values.temperatureEvaporator)
  );
  values.ambientTemperature = Math.max(
    15,
    Math.min(30, values.ambientTemperature)
  );
  values.humidityInternal = Math.max(30, Math.min(60, values.humidityInternal));
  values.pressureRefrigerant = Math.max(
    120,
    Math.min(180, values.pressureRefrigerant)
  );
  values.currentCompressor = Math.max(2, Math.min(3, values.currentCompressor));
  values.vibrationLevel = Math.max(0.3, Math.min(0.8, values.vibrationLevel));
  values.gasLeakLevel = Math.max(0.05, Math.min(0.2, values.gasLeakLevel));
  values.energyConsumption = Math.max(
    0.1,
    Math.min(0.4, values.energyConsumption)
  );
}

/**
 * Inserts sample data into the Supabase database
 */
const seedDatabase = async () => {
  try {
    console.log("Generating sample data...");
    const sampleData = generateSampleData();
    console.log(`Generated ${sampleData.length} data points.`);

    // Insert data in batches to avoid request size limits
    const batchSize = 100;
    let successCount = 0;

    for (let i = 0; i < sampleData.length; i += batchSize) {
      const batch = sampleData.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(sampleData.length / batchSize);

      console.log(`Inserting batch ${batchNumber}/${totalBatches}...`);

      const { data, error } = await supabase
        .from("sensor_history")
        .insert(batch);

      if (error) {
        console.error("Error inserting batch:", error);
      } else {
        successCount += batch.length;
      }
    }

    console.log(
      `Sample data insertion complete. ${successCount} records inserted successfully.`
    );
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

// Run the seed function
seedDatabase();
