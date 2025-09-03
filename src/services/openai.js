import OpenAI from "openai";
import { env } from "../../confiq/index.js";
const client = new OpenAI({ apiKey: env.OPEN_API_KEY });

export default async function postReflectionStory(notes) {
  try {
    // will implement openai later
    /* const response = await client.responses.create({
      model: "gpt-5",
      input: notes,
    });
    console.log(response); */

    const res = new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({ status: true, message: `Note is: ${notes}` });
      }, 4000);
    });

    return res;
  } catch (error) {
    console.log(error.message);
    return { status: false, message: "" };
  }
}
