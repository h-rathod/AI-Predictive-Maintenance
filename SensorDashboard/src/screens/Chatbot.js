/**
 * Chatbot Screen Component
 *
 * This component provides a chat interface for users to query sensor data.
 * It communicates with the backend server to process natural language queries
 * and retrieve data from the Supabase database.
 */

import React, { useState, useCallback, useEffect } from "react";
import { GiftedChat, Bubble, Message, Avatar } from "react-native-gifted-chat";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import axios from "axios";
import { BACKEND_URL } from "../utils/config";
import { CARD_STYLE } from "../utils/theme";
import { useTheme } from "../utils/ThemeContext";

// Custom Avatar component to replace the one with defaultProps
const CustomAvatar = ({ currentMessage }) => {
  const { colors } = useTheme();

  // We don't need to handle other props since we're using a simplified avatar
  // that only shows for bot messages (left side)
  if (!currentMessage || currentMessage.user._id !== 2) {
    return null;
  }

  return (
    <View
      style={[
        styles.avatarContainer,
        { backgroundColor: colors.isDarkMode ? colors.card : "#F1F5F9" },
      ]}
    >
      <Text style={styles.avatarText}>🤖</Text>
    </View>
  );
};

const Chatbot = () => {
  const { colors, isDarkMode } = useTheme();

  // State for chat messages and loading indicator
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Create theme-aware styles
  const themedStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    messagesContainer: {
      backgroundColor: colors.background,
      paddingBottom: 20, // Reduced padding since navbar will be hidden
    },
    loadingContainer: {
      padding: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
      backgroundColor: isDarkMode ? colors.card : "#F1F5F9",
      borderRadius: 12,
      margin: 10,
      borderWidth: 0,
    },
    loadingText: {
      marginLeft: 10,
      color: colors.textSecondary,
      fontStyle: "italic",
    },
    avatarContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 8,
      borderWidth: 0,
    },
    avatarText: {
      fontSize: 20,
    },
    textInput: {
      backgroundColor: isDarkMode ? colors.card : "#F1F5F9",
      color: colors.text,
      borderRadius: 20,
      borderColor: colors.border,
      borderWidth: 1,
      paddingHorizontal: 12,
    },
  });

  // Add welcome message and example queries when component mounts
  useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: "Hello! I can help you with sensor data. Try asking me questions like:\n\n• What is the current freezer temperature?\n• What was the average humidity over the last week?\n• How has the power consumption changed over the last 24 hours?\n• When was the compressor vibration highest?",
        createdAt: new Date(),
        user: { _id: 2, name: "Chatbot" },
      },
    ]);
  }, []);

  /**
   * Handles sending a message to the chatbot
   * @param {Array} newMessages - Array containing the new message
   */
  const onSend = useCallback(async (newMessages = []) => {
    if (!newMessages || newMessages.length === 0) return;

    // Append the user's message to the chat
    setMessages((prevMessages) => GiftedChat.append(prevMessages, newMessages));
    const userMessage = newMessages[0].text;

    // Show loading indicator
    setIsLoading(true);

    try {
      // Send the prompt to the backend
      const response = await sendMessageToBackend(userMessage);

      // Create and append the bot's response
      appendBotResponse(response.data.response);
    } catch (error) {
      console.error("Failed to get response:", error);

      // Handle error and show appropriate message
      handleChatError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Sends a message to the backend server
   * @param {string} message - The user's message
   * @returns {Promise} - The axios response
   */
  const sendMessageToBackend = async (message) => {
    return await axios.post(`${BACKEND_URL}/chat`, {
      prompt: message,
    });
  };

  /**
   * Appends a bot response to the chat
   * @param {string} text - The response text
   */
  const appendBotResponse = (text) => {
    const botMessage = {
      _id: Math.random().toString(),
      text: text,
      createdAt: new Date(),
      user: { _id: 2, name: "Chatbot" },
    };

    setMessages((prevMessages) =>
      GiftedChat.append(prevMessages, [botMessage])
    );
  };

  /**
   * Handles errors from the chat API
   * @param {Error} error - The error object
   */
  const handleChatError = (error) => {
    let errorMessage = "Sorry, something went wrong. Please try again.";

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      errorMessage = `Server error: ${error.response.status}. Please try again later.`;
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage =
        "Could not connect to the server. Please check your connection.";
    }

    appendBotResponse(errorMessage);
  };

  /**
   * Renders custom chat bubbles
   */
  const renderBubble = (props) => {
    // Create a new props object without the 'key' prop
    const { key, ...bubbleProps } = props;

    return (
      <Bubble
        {...bubbleProps}
        wrapperStyle={{
          right: {
            backgroundColor: colors.primary,
          },
          left: {
            backgroundColor: isDarkMode ? colors.card : "#F1F5F9",
            borderWidth: 0,
          },
        }}
        textStyle={{
          right: {
            color: isDarkMode ? colors.text : colors.card,
          },
          left: {
            color: colors.text,
          },
        }}
      />
    );
  };

  /**
   * Custom message renderer to avoid key prop spreading
   */
  const renderMessage = (props) => {
    const { key, ...messageProps } = props;

    return (
      <Message
        {...messageProps}
        key={`message-${messageProps.currentMessage._id}`}
      />
    );
  };

  /**
   * Renders the loading indicator when the bot is "thinking"
   */
  const renderFooter = () => {
    if (isLoading) {
      return (
        <View style={themedStyles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={themedStyles.loadingText}>Chatbot is thinking...</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={themedStyles.container}>
      <GiftedChat
        messages={messages}
        onSend={(msgs) => onSend(msgs)}
        user={{ _id: 1 }}
        renderBubble={renderBubble}
        renderMessage={renderMessage}
        renderAvatar={CustomAvatar}
        renderFooter={renderFooter}
        placeholder="Ask about sensor data..."
        alwaysShowSend={true}
        messagesContainerStyle={themedStyles.messagesContainer}
        timeFormat="HH:mm"
        dateFormat="YYYY-MM-DD"
        showUserAvatar={false}
        inverted={true}
        textInputStyle={themedStyles.textInput}
        textInputProps={{
          placeholderTextColor: colors.textSecondary,
        }}
      />
    </View>
  );
};

// Keep this but we'll only use it for non-theme related styles
const styles = StyleSheet.create({
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    borderWidth: 0,
  },
  avatarText: {
    fontSize: 20,
  },
});

export default Chatbot;
