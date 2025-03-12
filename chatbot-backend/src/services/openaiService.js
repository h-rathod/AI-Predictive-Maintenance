/**
 * OpenAI Service
 *
 * This service handles all interactions with the OpenAI API.
 * It provides methods for analyzing user queries and formatting responses.
 */

const OpenAI = require("openai");
const config = require("../config");

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: config.openai.apiKey });

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
 * Analyzes a user query to determine what type of data is needed
 * @param {string} userPrompt - The user's question
 * @returns {Promise<string>} - The analyzed query type
 */
const analyzeUserQuery = async (userPrompt) => {
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
};

/**
 * Formats data into a natural language response
 * @param {string} userPrompt - The original user question
 * @param {string} queryType - The type of query that was performed
 * @param {string} field - The sensor field that was queried
 * @param {Object} data - The data retrieved from the database
 * @returns {Promise<string>} - The formatted response
 */
const formatResponse = async (userPrompt, queryType, field, data) => {
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
};

module.exports = {
  analyzeUserQuery,
  formatResponse,
};
