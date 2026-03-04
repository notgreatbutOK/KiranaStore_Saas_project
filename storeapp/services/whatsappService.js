const axios = require("axios");

exports.sendMessage = async (to, text) => {
  try {
    await axios.post(
      `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );
    console.log(`✅ Message sent to ${to}`);
  } catch (error) {
    console.error("Send error:", error.response?.data || error.message);
  }
};

exports.sendTemplate = async (to, templateName, components = []) => {
  try {
    await axios.post(
      `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: templateName,
          language: { code: "en" },
          components: components.length > 0 ? [
            {
              type: "body",
              parameters: components
            }
          ] : []
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );
    console.log(`✅ Template sent to ${to}`);
  } catch (error) {
    console.error("Template error:", error.response?.data || error.message);
  }
};