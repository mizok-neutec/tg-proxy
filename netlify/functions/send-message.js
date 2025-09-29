const axios = require("axios");

/**
 * Netlify Serverless Function for sending Telegram messages
 *
 * POST /api/send-message
 *
 * Body:
 * {
 *   "botToken": "your-bot-token",
 *   "chatId": "chat-id-or-username",
 *   "message": "message-to-send",
 *   "parseMode": "HTML", // optional: HTML, Markdown, MarkdownV2
 *   "threadId": 123 // optional: message thread ID for topics in groups
 * }
 */

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
  };

  // Handle preflight requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "OK" }),
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        error: "Method not allowed. Use POST.",
      }),
    };
  }

  try {
    // Parse request body
    const body = JSON.parse(event.body || "{}");

    // Use environment variables as defaults, but allow API request to override
    const botToken = body.botToken || process.env.BOT_TOKEN;
    const chatId = body.chatId || process.env.CHAT_ID;
    const message = body.message;
    const parseMode = body.parseMode;
    const threadId = body.threadId;

    // Validate required fields
    if (!botToken) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error:
            "Bot token is required (either in request body or BOT_TOKEN environment variable)",
          example: {
            botToken: "your-bot-token",
            chatId: "chat-id-or-username",
            message: "Hello from Telegram bot!",
            threadId: 6111, // optional
          },
        }),
      };
    }

    if (!chatId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error:
            "Chat ID is required (either in request body or CHAT_ID environment variable)",
          example: {
            botToken: "your-bot-token",
            chatId: "chat-id-or-username",
            message: "Hello from Telegram bot!",
            threadId: 123, // optional
          },
        }),
      };
    }

    if (!message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "Message is required",
          example: {
            botToken: "your-bot-token",
            chatId: "chat-id-or-username",
            message: "Hello from Telegram bot!",
            threadId: 6111, // optional
          },
        }),
      };
    }

    // Prepare Telegram API request
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const payload = {
      chat_id: chatId,
      text: message,
      message_thread_id: threadId,
    };

    // Add parse mode if specified
    if (parseMode) {
      payload.parse_mode = parseMode;
    }

    // Send message via Telegram API
    const response = await axios.post(telegramApiUrl, payload, {
      timeout: 10000, // 10 seconds timeout
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Success response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Message sent successfully",
        messageId: response.data.result.message_id,
        chatId: response.data.result.chat.id,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error("Error sending Telegram message:", error.message);

    // Handle different types of errors
    let errorMessage = "Internal server error";
    let statusCode = 500;

    if (error.response) {
      // Telegram API error
      statusCode = error.response.status;
      errorMessage = error.response.data.description || "Telegram API error";

      // Common Telegram API errors
      if (error.response.status === 400) {
        errorMessage = `Bad Request: ${error.response.data.description}`;
      } else if (error.response.status === 401) {
        errorMessage = "Unauthorized: Invalid bot token";
      } else if (error.response.status === 403) {
        errorMessage = "Forbidden: Bot was blocked by user or kicked from chat";
      } else if (error.response.status === 404) {
        errorMessage = "Not Found: Chat not found";
      }
    } else if (error.request) {
      // Network error
      errorMessage = "Network error: Unable to reach Telegram API";
    } else if (error.name === "SyntaxError") {
      // JSON parsing error
      statusCode = 400;
      errorMessage = "Invalid JSON in request body";
    }

    return {
      statusCode,
      headers,
      body: JSON.stringify({
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      }),
    };
  }
};
