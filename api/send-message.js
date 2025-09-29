const fetch = require("node-fetch");

/**
 * Vercel Serverless Function for sending Telegram messages
 *
 * This function accepts POST requests with bot token, chat ID, and message content
 * and sends the message via Telegram Bot API
 */
module.exports = async (req, res) => {
  // Set CORS headers to allow cross-origin requests
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight OPTIONS requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
      message: "Only POST requests are supported",
    });
  }

  try {
    const {
      botToken,
      chatId,
      message,
      parseMode = "HTML",
      disableWebPagePreview = false,
    } = req.body;

    // Validate required parameters
    if (!botToken) {
      return res.status(400).json({
        error: "Missing bot token",
        message: "botToken is required in the request body",
      });
    }

    if (!chatId) {
      return res.status(400).json({
        error: "Missing chat ID",
        message: "chatId is required in the request body",
      });
    }

    if (!message) {
      return res.status(400).json({
        error: "Missing message",
        message: "message is required in the request body",
      });
    }

    // Construct Telegram Bot API URL
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    // Prepare the message payload
    const payload = {
      chat_id: chatId,
      text: message,
      parse_mode: parseMode,
      disable_web_page_preview: disableWebPagePreview,
    };

    // Send request to Telegram API
    const response = await fetch(telegramApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();

    // Check if the Telegram API request was successful
    if (!response.ok || !responseData.ok) {
      return res.status(400).json({
        error: "Telegram API error",
        message: responseData.description || "Failed to send message",
        telegramError: responseData,
      });
    }

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Message sent successfully",
      messageId: responseData.result.message_id,
      chatId: responseData.result.chat.id,
      date: responseData.result.date,
    });
  } catch (error) {
    console.error("Error sending Telegram message:", error);

    return res.status(500).json({
      error: "Internal server error",
      message: "Failed to process the request",
      details: error.message,
    });
  }
};
