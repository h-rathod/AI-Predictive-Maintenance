/**
 * Sensor Dashboard Chatbot Backend Server
 *
 * This server handles chat requests from the frontend, processes them using OpenAI,
 * and retrieves data from Supabase based on the query type.
 */

require("dotenv").config();
const express = require("express");
const OpenAI = require("openai");
const { createClient } = require("@supabase/supabase-js");
const cors = require("cors");

// Initialize Express app
const app = express();
app.use(express.json());
app.use(cors());

// Initialize OpenAI and Supabase clients
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// System prompt to define the chatbot's role and database schema
const systemPrompt = `
You are a specialized assistant for an IoT sensor dashboard. Your job is to provide insights based on the 'sensor_history' table in a Supabase database. The table has these columns:

- id (uuid): Unique identifier
- timestamp (timestamptz): Timestamp of the record
- temperature_internal (float8): Internal temperature
- temperature_evaporator (float8): Evaporator temperature
- ambient_temperature (float8): Ambient temperature
- humidity_internal (float8): Internal humidity
- pressure_refrigerant (float8): Refrigerant pressure
- current_compressor (float8): Compressor current
- vibration_level (float8): Vibration level
- gas_leak_level (float8): Gas leak level
- compressor_status (bool): Compressor status (on/off)
- compressor_cycle_time (int4): Compressor cycle time
- energy_consumption (float8): Energy consumption
- temperature_gradient (float8): Temperature gradient
- pressure_trend (float8): Pressure trend

When the user asks about sensor data, analyze their question and determine what data they need. Then respond with one of these query types:

1. For current/latest values (e.g., "What is the current internal temperature?"):
   CURRENT_VALUE:temperature_internal

2. For historical averages (e.g., "What was the average humidity over the last week?"):
   HISTORICAL_AVG:humidity_internal:7days

3. For min/max values (e.g., "What was the highest temperature yesterday?"):
   HISTORICAL_MAX:temperature_internal:1days

4. For trends (e.g., "How has the pressure changed over the last 24 hours?"):
   TREND:pressure_refrigerant:24hours

5. For status checks (e.g., "Is the compressor running?"):
   STATUS:compressor_status

Format your response EXACTLY as shown above, with no additional text.
If the user asks something unrelated to sensor data, respond with GENERAL: followed by a brief helpful response.
`;

/**
 * Analyzes user query using OpenAI to determine the type of data needed
 * @param {string} userPrompt - The user's question
 * @returns {Promise<string>} - The analyzed query type
 */
async function analyzeUserQuery(userPrompt) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 100,
    });
    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error analyzing user query:", error);
    throw new Error("Failed to analyze query");
  }
}

/**
 * Fetches the latest value for a specific sensor field
 * @param {string} field - The sensor field to query
 * @returns {Promise<Object>} - The query result
 */
async function getCurrentValue(field) {
  const { data, error } = await supabase
    .from("sensor_history")
    .select(field)
    .order("timestamp", { ascending: false })
    .limit(1);

  if (error) throw error;
  return data;
}

/**
 * Calculates the average value for a sensor field over a time period
 * @param {string} field - The sensor field to query
 * @param {number} days - Number of days to look back
 * @returns {Promise<Object>} - The query result
 */
async function getHistoricalAverage(field, days) {
  const { data, error } = await supabase
    .from("sensor_history")
    .select(`${field}`)
    .gte(
      "timestamp",
      new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
    );

  if (error) throw error;

  if (data && data.length > 0) {
    const sum = data.reduce(
      (acc, record) => acc + parseFloat(record[field] || 0),
      0
    );
    return [{ average: sum / data.length }];
  }

  return [];
}

/**
 * Gets the maximum value for a sensor field over a time period
 * @param {string} field - The sensor field to query
 * @param {number} days - Number of days to look back
 * @returns {Promise<Object>} - The query result
 */
async function getHistoricalMax(field, days) {
  const { data, error } = await supabase
    .from("sensor_history")
    .select(`${field}`)
    .gte(
      "timestamp",
      new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
    )
    .order(field, { ascending: false })
    .limit(1);

  if (error) throw error;
  return data;
}

/**
 * Gets the minimum value for a sensor field over a time period
 * @param {string} field - The sensor field to query
 * @param {number} days - Number of days to look back
 * @returns {Promise<Object>} - The query result
 */
async function getHistoricalMin(field, days) {
  const { data, error } = await supabase
    .from("sensor_history")
    .select(`${field}`)
    .gte(
      "timestamp",
      new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
    )
    .order(field, { ascending: true })
    .limit(1);

  if (error) throw error;
  return data;
}

/**
 * Gets trend data for a sensor field over a time period
 * @param {string} field - The sensor field to query
 * @param {number} hours - Number of hours to look back
 * @returns {Promise<Object>} - The query result
 */
async function getTrendData(field, hours) {
  const { data, error } = await supabase
    .from("sensor_history")
    .select(`timestamp, ${field}`)
    .gte(
      "timestamp",
      new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
    )
    .order("timestamp", { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Gets the current status of a boolean field
 * @param {string} field - The sensor field to query
 * @returns {Promise<Object>} - The query result
 */
async function getStatus(field) {
  const { data, error } = await supabase
    .from("sensor_history")
    .select(field)
    .order("timestamp", { ascending: false })
    .limit(1);

  if (error) throw error;
  return data;
}

/**
 * Formats the data into a natural language response using OpenAI
 * @param {string} userPrompt - The original user question
 * @param {string} queryType - The type of query that was performed
 * @param {string} field - The sensor field that was queried
 * @param {Object} data - The data retrieved from the database
 * @returns {Promise<string>} - The formatted response
 */
async function formatResponse(userPrompt, queryType, field, data) {
  try {
    const formattedResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant. Turn this data into a natural, conversational response for the user. Be concise but informative.",
        },
        {
          role: "user",
          content: `User asked: "${userPrompt}"\nQuery type: ${queryType}\nField: ${field}\nData: ${JSON.stringify(
            data
          )}`,
        },
      ],
      max_tokens: 150,
    });
    return formattedResponse.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error formatting response:", error);
    throw new Error("Failed to format response");
  }
}

// Endpoint to handle chat requests
app.post("/chat", async (req, res) => {
  const userPrompt = req.body.prompt;

  try {
    // Step 1: Analyze the query to determine what data is needed
    const result = await analyzeUserQuery(userPrompt);

    // Step 2: Process the result based on the query type
    if (result.startsWith("GENERAL:")) {
      // If it's a general query, return the response directly
      return res.json({ response: result.substring(8).trim() });
    }

    // Parse the query type and parameters
    const [queryType, field, timeRange] = result.split(":");
    let data;

    // Step 3: Execute the appropriate query based on the type
    switch (queryType) {
      case "CURRENT_VALUE":
        data = await getCurrentValue(field);
        break;

      case "HISTORICAL_AVG":
        const days = parseInt(timeRange);
        data = await getHistoricalAverage(field, days);
        break;

      case "HISTORICAL_MAX":
        const maxDays = parseInt(timeRange);
        data = await getHistoricalMax(field, maxDays);
        break;

      case "HISTORICAL_MIN":
        const minDays = parseInt(timeRange);
        data = await getHistoricalMin(field, minDays);
        break;

      case "TREND":
        const hours = parseInt(timeRange.replace("hours", ""));
        data = await getTrendData(field, hours);
        break;

      case "STATUS":
        data = await getStatus(field);
        break;

      default:
        return res.json({
          response:
            "I'm not sure how to answer that. Could you rephrase your question?",
        });
    }

    // Step 4: Format the data into a natural response
    const response = await formatResponse(userPrompt, queryType, field, data);
    res.json({ response });
  } catch (error) {
    console.error("Error processing prompt:", error);
    res.status(500).json({
      response:
        "Sorry, I encountered an error processing your request. Please try again.",
    });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
