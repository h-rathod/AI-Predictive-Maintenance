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

module.exports = {
  getLatestSensorData,
  getCurrentValue,
  getHistoricalAverage,
  getHistoricalMax,
  getHistoricalMin,
  getTrendData,
  getStatus,
  supabase, // Export the client for direct use if needed
};
