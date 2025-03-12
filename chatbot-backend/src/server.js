/**
 * Sensor Dashboard Backend Server
 *
 * This is the main entry point for the backend server.
 * It sets up the Express server, middleware, and routes.
 */

const express = require("express");
const cors = require("cors");
const config = require("./config");
const chatController = require("./controllers/chatController");

// Initialize Express app
const app = express();

// Apply middleware
app.use(express.json());
app.use(cors());

// Define routes
app.post("/chat", chatController.handleChatRequest);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Start the server
const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});
