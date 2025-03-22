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
You are a specialized assistant for an IoT sensor dashboard for refrigeration monitoring. Your job is to provide insights based on the 'sensor_data' table in a Supabase database. The table has these columns:

- id (uuid): Unique identifier
- device_id (uuid): Reference to the ESP32 device
- timestamp (timestamp): Timestamp of the record
- evaporator_coil_temperature (float): Temperature of the evaporator coil
- freezer_temperature (float): Temperature inside the freezer
- fridge_temperature (float): Temperature inside the fridge
- air_temperature (float): Ambient air temperature
- humidity (float): Humidity level
- compressor_vibration_x (float): X-axis vibration of the compressor
- compressor_vibration_y (float): Y-axis vibration of the compressor
- compressor_vibration_z (float): Z-axis vibration of the compressor
- compressor_vibration (float): Overall vibration magnitude (calculated)
- compressor_current (float): Current drawn by the compressor
- input_voltage (float): Input voltage
- power_consumption (float): Power consumption (calculated)
- gas_leakage_level (float): Gas leakage level
- temperature_diff (float): Temperature difference between freezer and fridge (calculated)
- inserted_at (timestamp): Time when the record was inserted

When the user asks about sensor data, analyze their question and determine what data they need. Then respond with one of these query types:

1. For current/latest values (e.g., "What is the current freezer temperature?"):
   CURRENT_VALUE:freezer_temperature

2. For historical averages (e.g., "What was the average humidity over the last week?"):
   HISTORICAL_AVG:humidity:7days

3. For min/max values (e.g., "What was the highest temperature yesterday?"):
   HISTORICAL_MAX:fridge_temperature:1days

4. For trends (e.g., "How has the power consumption changed over the last 24 hours?"):
   TREND:power_consumption:24hours

5. For average of all sensors (e.g., "What is the average of all temperatures over the last week?"):
   AVERAGE_ALL_SENSORS:7days

6. For time of highest value (e.g., "When was the compressor vibration highest in the last month?"):
   TIME_OF_HIGHEST:compressor_vibration:30days

7. For vibration details (e.g., "Show me the detailed vibration data"):
   VIBRATION_DETAILS:7days

8. For maintenance prediction (e.g., "Do I need to check for maintenance based on current parameters?"):
   MAINTENANCE_CHECK

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
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 150,
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
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant. Turn this data into a natural, conversational response for the user. Be concise but informative.",
        },
        {
          role: "user",
          content: `User asked: "${userPrompt}"
Query type: ${queryType}
Field: ${field}
Data: ${JSON.stringify(data)}`,
        },
      ],
      max_tokens: 200,
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
