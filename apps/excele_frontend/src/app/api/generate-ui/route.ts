// pages/api/generate-ui.js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure this is set in your .env file
});

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { prompt } = req.body;
    console.log("prompt-", prompt);

    try {
      const params = {
        messages: [
          {
            role: "user",
            content: `You are a UI generator. Interpret this prompt: "${prompt}" and output an array of shapes or UI elements in JSON format.`,
          },
        ],
        model: "gpt-4", // You can change the model if needed
      };

      const chatCompletion = await client.chat.completions.create(params);
      const generatedUI = chatCompletion.choices[0].message.content.trim();

      console.log("generatedUI-", generatedUI);
      res.status(200).json({ generatedUI });
    } catch (error) {
      console.error("Error generating UI:", error);
      res.status(500).json({ error: "Failed to generate UI" });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
