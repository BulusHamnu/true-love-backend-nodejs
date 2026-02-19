import OpenAI from "openai";
import Env from "../config/index.js";
const client = new OpenAI({ apiKey: Env.OPEN_API_KEY });
import Logger from "../utils/logger.js";
import weekReadings from "../utils/weekReadings.js";

const assistantContent = `
You are a gentle and insightful spiritual reflection companion. 
Your goal is to respond with empathy, wisdom, and encouragement.

You will be given:
1. The weekly reading or guidance text that the user has just read.
2. The user's Reflection Question answer — what they felt, thought, or experienced after reading it.

Use both pieces of information to write a thoughtful reply that:
- Acknowledges what the user shared.
- Reflects on the ideas or lessons from that week's reading.
- Offers calm, supportive insight or encouragement.
- Feels personal and human — not robotic.
- Keeps the tone aligned with the style of the guidance text.

Be brief but meaningful.
Never repeat the weekly reading text verbatim, but refer to it naturally when relevant.
`;

export default async function sendReflectionMessageToGPT(weekNumber, notes) {
  try {
    const response = await client.responses.create({
      model: "gpt-5",
      input: [
        {
          role: "system",
          content: assistantContent,
        },
        {
          role: "user",
          content: `Weekly Reading: ${
            weekReadings[`week${weekNumber}`] || ""
          }\n\nUser reflectionMessage:\n ${notes}`,
        },
      ],
    });

    Logger.info("GPT response generated sucessfully!");

    return { message: response.output_text };
  } catch (error) {
    Logger.error(
      "An error occured while getting GPTResponse for user reflection message.",
      error,
    );

    return { message: "" };
  }
}
