require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Function to generate random data within a range
const randomInRange = (min, max) => {
  return Math.random() * (max - min) + min;
};

// Function to generate a random boolean with a bias
const randomBoolean = (trueBias = 0.5) => {
  return Math.random() < trueBias;
};

// Generate sample data for the past 30 days
const generateSampleData = () => {
  const data = [];
  const now = new Date();

  // Base values for sensors
  let baseTemperatureInternal = 4.0; // refrigerator temperature in Celsius
  let baseTemperatureEvaporator = -15.0;
  let baseAmbientTemperature = 22.0;
  let baseHumidityInternal = 40.0;
  let basePressureRefrigerant = 150.0;
  let baseCurrentCompressor = 2.5;
  let baseVibrationLevel = 0.5;
  let baseGasLeakLevel = 0.1;
  let compressorStatus = true;
  let baseEnergyConsumption = 0.2;

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
        compressorStatus = randomBoolean(0.7);
      }

      // Calculate temperature gradient and pressure trend
      const temperatureGradient = randomInRange(-0.5, 0.5);
      const pressureTrend = randomInRange(-5, 5);

      // Create a data point
      const dataPoint = {
        timestamp: timestamp.toISOString(),
        temperature_internal:
          baseTemperatureInternal +
          hourlyVariation * 0.5 +
          dailyVariation * 0.3 +
          randomInRange(-0.5, 0.5),
        temperature_evaporator:
          baseTemperatureEvaporator +
          hourlyVariation * 0.3 +
          dailyVariation * 0.2 +
          randomInRange(-1, 1),
        ambient_temperature:
          baseAmbientTemperature +
          hourlyVariation +
          dailyVariation +
          randomInRange(-2, 2),
        humidity_internal:
          baseHumidityInternal +
          hourlyVariation * 2 +
          dailyVariation +
          randomInRange(-5, 5),
        pressure_refrigerant:
          basePressureRefrigerant +
          hourlyVariation * 3 +
          dailyVariation * 2 +
          randomInRange(-10, 10),
        current_compressor: compressorStatus
          ? baseCurrentCompressor + randomInRange(-0.3, 0.3)
          : 0,
        vibration_level: compressorStatus
          ? baseVibrationLevel + randomInRange(-0.2, 0.4)
          : 0,
        gas_leak_level: baseGasLeakLevel + randomInRange(0, 0.05),
        compressor_status: compressorStatus,
        compressor_cycle_time: compressorStatus
          ? Math.floor(randomInRange(10, 60))
          : 0,
        energy_consumption:
          baseEnergyConsumption +
          (compressorStatus ? randomInRange(0.1, 0.3) : 0),
        temperature_gradient: temperatureGradient,
        pressure_trend: pressureTrend,
      };

      data.push(dataPoint);
    }

    // Simulate some daily drift in base values
    baseTemperatureInternal += randomInRange(-0.1, 0.1);
    baseTemperatureEvaporator += randomInRange(-0.2, 0.2);
    baseAmbientTemperature += randomInRange(-0.5, 0.5);
    baseHumidityInternal += randomInRange(-1, 1);
    basePressureRefrigerant += randomInRange(-2, 2);
    baseCurrentCompressor += randomInRange(-0.05, 0.05);
    baseVibrationLevel += randomInRange(-0.02, 0.02);
    baseGasLeakLevel += randomInRange(-0.01, 0.01);
    baseEnergyConsumption += randomInRange(-0.02, 0.02);

    // Keep values within reasonable ranges
    baseTemperatureInternal = Math.max(2, Math.min(8, baseTemperatureInternal));
    baseTemperatureEvaporator = Math.max(
      -20,
      Math.min(-10, baseTemperatureEvaporator)
    );
    baseAmbientTemperature = Math.max(15, Math.min(30, baseAmbientTemperature));
    baseHumidityInternal = Math.max(30, Math.min(60, baseHumidityInternal));
    basePressureRefrigerant = Math.max(
      120,
      Math.min(180, basePressureRefrigerant)
    );
    baseCurrentCompressor = Math.max(2, Math.min(3, baseCurrentCompressor));
    baseVibrationLevel = Math.max(0.3, Math.min(0.8, baseVibrationLevel));
    baseGasLeakLevel = Math.max(0.05, Math.min(0.2, baseGasLeakLevel));
    baseEnergyConsumption = Math.max(0.1, Math.min(0.4, baseEnergyConsumption));
  }

  return data;
};

// Insert data into Supabase
const seedDatabase = async () => {
  try {
    console.log("Generating sample data...");
    const sampleData = generateSampleData();
    console.log(`Generated ${sampleData.length} data points.`);

    // Insert data in batches to avoid request size limits
    const batchSize = 100;
    for (let i = 0; i < sampleData.length; i += batchSize) {
      const batch = sampleData.slice(i, i + batchSize);
      console.log(
        `Inserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
          sampleData.length / batchSize
        )}...`
      );

      const { data, error } = await supabase
        .from("sensor_history")
        .insert(batch);

      if (error) {
        console.error("Error inserting data:", error);
        return;
      }
    }

    console.log("Sample data inserted successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

// Run the seed function
seedDatabase();
