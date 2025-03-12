require("dotenv").config();
const express = require("express");
const OpenAI = require("openai");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(express.json());

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

5. For status checks (e.g., "Is the compressor currently running?"):
   STATUS:compressor_status

Format your response EXACTLY as shown above, with no additional text.
If the user asks something unrelated to sensor data, respond with GENERAL: followed by a brief helpful response.
`;

// Endpoint to handle chat requests
app.post("/chat", async (req, res) => {
  const userPrompt = req.body.prompt;

  try {
    // Step 1: Ask GPT to analyze the query and determine what data is needed
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 100,
    });
    const result = completion.choices[0].message.content.trim();

    // Step 2: Process the result based on the query type
    if (result.startsWith("GENERAL:")) {
      // If it's a general query, return the response directly
      return res.json({ response: result.substring(8).trim() });
    }

    // Parse the query type and parameters
    const [queryType, field, timeRange] = result.split(":");
    let data;
    let error;

    // Step 3: Execute the appropriate query based on the type
    switch (queryType) {
      case "CURRENT_VALUE":
        // Get the latest value for the specified field
        ({ data, error } = await supabase
          .from("sensor_history")
          .select(field)
          .order("timestamp", { ascending: false })
          .limit(1));
        break;

      case "HISTORICAL_AVG":
        // Calculate average over the specified time range
        const days = parseInt(timeRange);
        ({ data, error } = await supabase
          .from("sensor_history")
          .select(`${field}`)
          .gte(
            "timestamp",
            new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
          ));

        if (data && data.length > 0) {
          // Calculate average manually
          const sum = data.reduce(
            (acc, record) => acc + parseFloat(record[field] || 0),
            0
          );
          data = [{ average: sum / data.length }];
        }
        break;

      case "HISTORICAL_MAX":
        // Get maximum value over the specified time range
        const maxDays = parseInt(timeRange);
        ({ data, error } = await supabase
          .from("sensor_history")
          .select(`${field}`)
          .gte(
            "timestamp",
            new Date(Date.now() - maxDays * 24 * 60 * 60 * 1000).toISOString()
          )
          .order(field, { ascending: false })
          .limit(1));
        break;

      case "HISTORICAL_MIN":
        // Get minimum value over the specified time range
        const minDays = parseInt(timeRange);
        ({ data, error } = await supabase
          .from("sensor_history")
          .select(`${field}`)
          .gte(
            "timestamp",
            new Date(Date.now() - minDays * 24 * 60 * 60 * 1000).toISOString()
          )
          .order(field, { ascending: true })
          .limit(1));
        break;

      case "TREND":
        // Get data points for trend analysis
        const hours = parseInt(timeRange.replace("hours", ""));
        ({ data, error } = await supabase
          .from("sensor_history")
          .select(`timestamp, ${field}`)
          .gte(
            "timestamp",
            new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
          )
          .order("timestamp", { ascending: true }));
        break;

      case "STATUS":
        // Get current status
        ({ data, error } = await supabase
          .from("sensor_history")
          .select(field)
          .order("timestamp", { ascending: false })
          .limit(1));
        break;

      default:
        return res.json({
          response:
            "I'm not sure how to answer that. Could you rephrase your question?",
        });
    }

    if (error) {
      console.error("Supabase error:", error);
      return res.json({
        response: "Sorry, I couldn't retrieve the data. Please try again.",
      });
    }

    // Step 4: Format the data into a natural response
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
    res.json({
      response: formattedResponse.choices[0].message.content.trim(),
    });
  } catch (error) {
    console.error("Error processing prompt:", error);
    res.status(500).json({
      response:
        "Sorry, I encountered an error processing your request. Please try again.",
    });
  }
});

// Start the server
app.listen(3000, () => console.log("Server running on port 3000"));
