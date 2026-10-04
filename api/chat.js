export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { message } = req.body || {};

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "Please enter a message."
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "OPENAI_API_KEY is not configured."
      });
    }

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + apiKey
        },

        body: JSON.stringify({
          model: "gpt-5-mini",

          instructions:
            "You are a helpful AI conversational assistant. " +
            "Answer the user's questions clearly and accurately. " +
            "The user may ask questions in English or Tamil. " +
            "If the user asks in Tamil, answer in simple Tamil. " +
            "If the user asks in Tanglish, you may answer in Tanglish. " +
            "For study questions, explain step by step in simple language.",

          input: message.trim()
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error:
          data?.error?.message ||
          "OpenAI request failed."
      });
    }

    let answer = data.output_text;

    if (!answer && data.output) {
      answer = data.output
        .flatMap(item => item.content || [])
        .filter(item => item.type === "output_text")
        .map(item => item.text)
        .join("\n");
    }

    if (!answer) {
      answer = "Sorry, I couldn't generate an answer.";
    }

    return res.status(200).json({
      answer: answer
    });

  } catch (error) {

    console.error("AI ERROR:", error);

    return res.status(500).json({
      error: "Something went wrong while connecting to the AI."
    });
  }
}
