/**
 * Chat Controller
 *
 * This controller handles chat requests from the frontend.
 * It processes user queries, retrieves data from the database, and formats responses.
 */

const openaiService = require("../services/openaiService");
const supabaseService = require("../services/supabaseService");

/**
 * Handles a chat request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const handleChatRequest = async (req, res) => {
  const userPrompt = req.body.prompt;

  try {
    // Step 1: Analyze the query to determine what data is needed
    const result = await openaiService.analyzeUserQuery(userPrompt);

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
      // Sensor data queries
      case "CURRENT_VALUE":
        data = await supabaseService.getCurrentValue(field);
        break;

      case "HISTORICAL_AVG":
        const days = parseInt(timeRange);
        data = await supabaseService.getHistoricalAverage(field, days);
        break;

      case "HISTORICAL_MAX":
        const maxDays = parseInt(timeRange);
        data = await supabaseService.getHistoricalMax(field, maxDays);
        break;

      case "HISTORICAL_MIN":
        const minDays = parseInt(timeRange);
        data = await supabaseService.getHistoricalMin(field, minDays);
        break;

      case "TREND":
        const hours = parseInt(timeRange.replace("hours", ""));
        data = await supabaseService.getTrendData(field, hours);
        break;

      case "STATUS":
        data = await supabaseService.getStatus(field);
        break;

      case "AVERAGE_ALL_SENSORS":
        const avgDays = parseInt(timeRange);
        data = await supabaseService.getAverageOfAllSensors(avgDays);
        break;

      case "TIME_OF_HIGHEST":
        const highestDays = parseInt(timeRange);
        data = await supabaseService.getTimeOfHighestValue(field, highestDays);
        break;

      case "VIBRATION_DETAILS":
        const vibDays = parseInt(timeRange);
        data = await supabaseService.getVibrationDetails(vibDays);
        break;

      case "MAINTENANCE_CHECK":
        data = await supabaseService.checkMaintenance();
        break;

      // New ML prediction queries
      case "PREDICTION_LATEST":
        data = await supabaseService.getLatestPrediction();
        break;

      case "PREDICTION_HISTORY":
        const predHistoryDays = parseInt(timeRange);
        data = await supabaseService.getPredictionHistory(field, predHistoryDays);
        break;

      case "ANOMALY_SUMMARY":
        const anomalyDays = parseInt(timeRange);
        data = await supabaseService.getAnomalySummary(anomalyDays);
        break;

      case "PREDICTION_MAINTENANCE":
        data = await supabaseService.checkPredictionMaintenance();
        break;

      default:
        return res.json({
          response:
            "I'm not sure how to answer that. Could you rephrase your question?",
        });
    }

    // Step 4: Format the data into a natural response
    const response = await openaiService.formatResponse(
      userPrompt,
      queryType,
      field,
      data
    );
    res.json({ response });
  } catch (error) {
    console.error("Error processing prompt:", error);
    res.status(500).json({
      response:
        "Sorry, I encountered an error processing your request. Please try again.",
    });
  }
};

module.exports = {
  handleChatRequest,
};
