/**
 * Supabase Service
 *
 * This service handles all interactions with the Supabase database.
 * It provides methods for querying sensor data in various ways.
 */

const { createClient } = require("@supabase/supabase-js");
const config = require("../config");

// Initialize Supabase client
const supabase = createClient(config.supabase.url, config.supabase.key);

/**
 * Gets the latest sensor data record
 * @returns {Promise<Object>} The latest sensor data record
 */
const getLatestSensorData = async () => {
  try {
    const { data, error } = await supabase
      .from(config.database.sensorHistoryTable)
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(1);

    if (error) throw error;
    return data[0] || null;
  } catch (error) {
    console.error("Error fetching latest sensor data:", error);
    throw error;
  }
};

/**
 * Gets the latest value for a specific sensor field
 * @param {string} field - The sensor field to query
 * @returns {Promise<Object>} The query result
 */
const getCurrentValue = async (field) => {
  try {
    const { data, error } = await supabase
      .from(config.database.sensorHistoryTable)
      .select(field)
      .order("timestamp", { ascending: false })
      .limit(1);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching current value for ${field}:`, error);
    throw error;
  }
};

/**
 * Calculates the average value for a sensor field over a time period
 * @param {string} field - The sensor field to query
 * @param {number} days - Number of days to look back
 * @returns {Promise<Object>} The query result
 */
const getHistoricalAverage = async (field, days) => {
  try {
    const { data, error } = await supabase
      .from(config.database.sensorHistoryTable)
      .select(`${field}`)
      .gte(
        "timestamp",
        new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
      );

    if (error) throw error;

    if (data && data.length > 0) {
      const validValues = data
        .map((item) => item[field])
        .filter((value) => value !== null && value !== undefined);

      if (validValues.length === 0) return [];

      const sum = validValues.reduce((acc, val) => acc + val, 0);
      return [{ average: sum / validValues.length }];
    }

    return [];
  } catch (error) {
    console.error(`Error calculating average for ${field}:`, error);
    throw error;
  }
};

/**
 * Gets the maximum value for a sensor field over a time period
 * @param {string} field - The sensor field to query
 * @param {number} days - Number of days to look back
 * @returns {Promise<Object>} The query result
 */
const getHistoricalMax = async (field, days) => {
  try {
    const { data, error } = await supabase
      .from(config.database.sensorHistoryTable)
      .select(`${field}`)
      .gte(
        "timestamp",
        new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
      )
      .order(field, { ascending: false })
      .limit(1);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching maximum value for ${field}:`, error);
    throw error;
  }
};

/**
 * Gets the minimum value for a sensor field over a time period
 * @param {string} field - The sensor field to query
 * @param {number} days - Number of days to look back
 * @returns {Promise<Object>} The query result
 */
const getHistoricalMin = async (field, days) => {
  try {
    const { data, error } = await supabase
      .from(config.database.sensorHistoryTable)
      .select(`${field}`)
      .gte(
        "timestamp",
        new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
      )
      .order(field, { ascending: true })
      .limit(1);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching minimum value for ${field}:`, error);
    throw error;
  }
};

/**
 * Gets trend data for a sensor field over a time period
 * @param {string} field - The sensor field to query
 * @param {number} hours - Number of hours to look back
 * @returns {Promise<Object>} The query result
 */
const getTrendData = async (field, hours) => {
  try {
    const { data, error } = await supabase
      .from(config.database.sensorHistoryTable)
      .select(`timestamp, ${field}`)
      .gte(
        "timestamp",
        new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
      )
      .order("timestamp", { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching trend data for ${field}:`, error);
    throw error;
  }
};

/**
 * Gets the current status of a boolean field
 * @param {string} field - The sensor field to query
 * @returns {Promise<Object>} The query result
 */
const getStatus = async (field) => {
  try {
    const { data, error } = await supabase
      .from(config.database.sensorHistoryTable)
      .select(field)
      .order("timestamp", { ascending: false })
      .limit(1);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching status for ${field}:`, error);
    throw error;
  }
};

// Function to calculate the average of all sensors
const getAverageOfAllSensors = async (days) => {
  try {
    const { data, error } = await supabase
      .from(config.database.sensorHistoryTable)
      .select("*")
      .gte(
        "timestamp",
        new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
      );

    if (error) throw error;

    if (data && data.length > 0) {
      const fields = Object.keys(config.sensorFields);
      const averages = fields.reduce((acc, field) => {
        const sum = data.reduce(
          (sum, record) => sum + parseFloat(record[field] || 0),
          0
        );
        acc[field] = sum / data.length;
        return acc;
      }, {});
      return averages;
    }

    return {};
  } catch (error) {
    console.error("Error calculating average of all sensors:", error);
    throw error;
  }
};

// Function to determine when a sensor value was highest
const getTimeOfHighestValue = async (field, days) => {
  try {
    const { data, error } = await supabase
      .from(config.database.sensorHistoryTable)
      .select("timestamp, " + field)
      .gte(
        "timestamp",
        new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
      )
      .order(field, { ascending: false })
      .limit(1);

    if (error) throw error;
    return data[0] || null;
  } catch (error) {
    console.error(`Error fetching time of highest value for ${field}:`, error);
    throw error;
  }
};

/**
 * Gets vibration details for all axes
 * @param {number} days - Number of days to look back
 * @returns {Promise<Object>} The vibration data for all axes
 */
const getVibrationDetails = async (days) => {
  try {
    const { data, error } = await supabase
      .from(config.database.sensorHistoryTable)
      .select(
        "timestamp, compressor_vibration, compressor_vibration_x, compressor_vibration_y, compressor_vibration_z"
      )
      .gte(
        "timestamp",
        new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
      )
      .order("timestamp", { ascending: true });

    if (error) throw error;

    // Calculate statistics for each vibration component
    if (data && data.length > 0) {
      const stats = {
        compressor_vibration: calculateStats(data, "compressor_vibration"),
        compressor_vibration_x: calculateStats(data, "compressor_vibration_x"),
        compressor_vibration_y: calculateStats(data, "compressor_vibration_y"),
        compressor_vibration_z: calculateStats(data, "compressor_vibration_z"),
        timeSeriesData: data,
      };
      return stats;
    }

    return null;
  } catch (error) {
    console.error("Error fetching vibration details:", error);
    throw error;
  }
};

/**
 * Calculate statistics for a specific field
 * @param {Array} data - Array of data records
 * @param {string} field - Field to calculate statistics for
 * @returns {Object} Statistics object with min, max, avg values
 */
const calculateStats = (data, field) => {
  const values = data
    .map((record) => parseFloat(record[field] || 0))
    .filter((val) => !isNaN(val));

  if (values.length === 0) return { min: 0, max: 0, avg: 0 };

  const min = Math.min(...values);
  const max = Math.max(...values);
  const sum = values.reduce((acc, val) => acc + val, 0);
  const avg = sum / values.length;

  return { min, max, avg };
};

/**
 * Checks if maintenance is needed based on current sensor values
 * @returns {Promise<Object>} Maintenance recommendation and reasons
 */
const checkMaintenance = async () => {
  try {
    // Get the latest sensor data
    const latestData = await getLatestSensorData();

    if (!latestData)
      return { needed: false, reason: "No sensor data available" };

    // Define thresholds for maintenance alerts
    const thresholds = {
      compressor_vibration: 10.0, // mm/s - high vibration indicates potential issues
      gas_leakage_level: 50.0, // ppm - gas leak threshold
      temperature_diff: 25.0, // °C - large temperature difference may indicate cooling issues
      power_consumption: 500.0, // W - high power consumption may indicate inefficiency
    };

    // Check if any thresholds are exceeded
    const issues = [];

    if (latestData.compressor_vibration > thresholds.compressor_vibration) {
      issues.push(
        `High compressor vibration (${latestData.compressor_vibration.toFixed(
          2
        )} mm/s)`
      );
    }

    if (latestData.gas_leakage_level > thresholds.gas_leakage_level) {
      issues.push(
        `Elevated gas leakage level (${latestData.gas_leakage_level.toFixed(
          2
        )} ppm)`
      );
    }

    if (Math.abs(latestData.temperature_diff) > thresholds.temperature_diff) {
      issues.push(
        `Abnormal temperature difference (${latestData.temperature_diff.toFixed(
          2
        )} °C)`
      );
    }

    if (latestData.power_consumption > thresholds.power_consumption) {
      issues.push(
        `High power consumption (${latestData.power_consumption.toFixed(2)} W)`
      );
    }

    return {
      needed: issues.length > 0,
      reason:
        issues.length > 0
          ? issues.join(", ")
          : "All parameters within normal ranges",
      data: latestData,
    };
  } catch (error) {
    console.error("Error checking maintenance needs:", error);
    throw error;
  }
};

/**
 * Gets the latest prediction data
 * @returns {Promise<Object>} The latest prediction data
 */
const getLatestPrediction = async () => {
  try {
    const { data, error } = await supabase
      .from("predictions")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(1);

    if (error) throw error;
    return data[0] || null;
  } catch (error) {
    console.error("Error fetching latest prediction data:", error);
    throw error;
  }
};

/**
 * Gets historical prediction data for a specific field
 * @param {string} field - The prediction field to query (anomaly, failure_probability, health_index, remaining_useful_life)
 * @param {number} days - Number of days to look back
 * @returns {Promise<Object>} The query result
 */
const getPredictionHistory = async (field, days) => {
  try {
    const { data, error } = await supabase
      .from("predictions")
      .select(`timestamp, ${field}`)
      .gte(
        "timestamp",
        new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
      )
      .order("timestamp", { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching prediction history for ${field}:`, error);
    throw error;
  }
};

/**
 * Gets anomaly summary for a time period
 * @param {number} days - Number of days to look back
 * @returns {Promise<Object>} The query result with anomaly counts and percentages
 */
const getAnomalySummary = async (days) => {
  try {
    const { data, error } = await supabase
      .from("predictions")
      .select("anomaly, timestamp")
      .gte(
        "timestamp",
        new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
      );

    if (error) throw error;

    // Calculate anomaly statistics
    const totalCount = data.length;
    const anomalyCount = data.filter(item => item.anomaly === true).length;
    const anomalyPercentage = totalCount > 0 ? (anomalyCount / totalCount) * 100 : 0;

    // Find the timestamps of anomalies
    const anomalyTimestamps = data
      .filter(item => item.anomaly === true)
      .map(item => item.timestamp)
      .sort((a, b) => new Date(b) - new Date(a)); // Sort newest first

    return {
      total_predictions: totalCount,
      anomaly_count: anomalyCount,
      anomaly_percentage: anomalyPercentage.toFixed(1),
      anomaly_timestamps: anomalyTimestamps.slice(0, 5) // Return most recent 5 anomalies
    };
  } catch (error) {
    console.error(`Error calculating anomaly summary:`, error);
    throw error;
  }
};

/**
 * Checks if maintenance is needed based on ML predictions
 * @returns {Promise<Object>} Maintenance prediction with detailed reasons
 */
const checkPredictionMaintenance = async () => {
  try {
    // Get the latest prediction
    const latestPrediction = await getLatestPrediction();
    
    if (!latestPrediction) {
      return {
        maintenance_needed: false,
        confidence: 0,
        reasons: ["No prediction data available"],
        remaining_useful_life: null,
        health_index: null,
        failure_probability: null,
        anomaly_detected: false
      };
    }
    
    // Extract relevant fields
    const { 
      anomaly, 
      failure_probability, 
      health_index, 
      remaining_useful_life,
      timestamp
    } = latestPrediction;
    
    // Determine if maintenance is needed based on ML predictions
    const maintenanceNeeded = anomaly === true || 
                            failure_probability > 0.4 || 
                            health_index < 50 || 
                            remaining_useful_life < 48; // Less than 48 hours remaining
    
    // Calculate confidence level (0-100) based on a weighted average of indicators
    const confidenceCalculation = [
      anomaly ? 100 : 0,  // Anomaly is a strong indicator
      failure_probability * 100, // Direct percentage
      (100 - health_index), // Invert health index (lower health = higher maintenance need)
      remaining_useful_life < 168 ? (168 - remaining_useful_life) / 1.68 : 0 // Scale RUL (less than 1 week)
    ];
    
    // Calculate weighted average (anomaly and failure probability are weighted more heavily)
    const weights = [3, 2, 1, 1]; // Weights for each factor
    const weightedSum = confidenceCalculation.reduce((sum, value, index) => sum + value * weights[index], 0);
    const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
    const confidence = Math.min(100, Math.round(weightedSum / weightSum));
    
    // Generate reasons
    const reasons = [];
    if (anomaly) reasons.push("Anomaly detected in system operation");
    if (failure_probability > 0.4) reasons.push(`High failure probability: ${(failure_probability * 100).toFixed(1)}%`);
    if (health_index < 70) reasons.push(`Low health index: ${health_index.toFixed(1)}/100`);
    if (remaining_useful_life < 168) reasons.push(`Limited remaining useful life: ${remaining_useful_life.toFixed(0)} hours`);
    
    if (reasons.length === 0 && !maintenanceNeeded) {
      reasons.push("All parameters within normal operating ranges");
    }
    
    return {
      maintenance_needed: maintenanceNeeded,
      confidence,
      reasons,
      remaining_useful_life: remaining_useful_life,
      health_index: health_index,
      failure_probability: failure_probability,
      anomaly_detected: anomaly,
      last_prediction_time: timestamp
    };
  } catch (error) {
    console.error("Error in prediction-based maintenance check:", error);
    throw error;
  }
};

module.exports = {
  getLatestSensorData,
  getCurrentValue,
  getHistoricalAverage,
  getHistoricalMax,
  getHistoricalMin,
  getTrendData,
  getStatus,
  getAverageOfAllSensors,
  getTimeOfHighestValue,
  getVibrationDetails,
  checkMaintenance,
  // New prediction-related functions
  getLatestPrediction,
  getPredictionHistory,
  getAnomalySummary,
  checkPredictionMaintenance,
  supabase, // Export the client for direct use if needed
};
