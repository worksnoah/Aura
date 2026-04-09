export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Use POST with a JSON body." })
    };
  }

  try {
    const { prompt } = JSON.parse(event.body);

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-5.4-mini",
        input: `
          You are Aura.

          Your personality:
          - Calm, sharp, and focused
          - Minimal words, maximum clarity
          - Slightly intense but not aggressive
          - Never overly friendly or excited
          - No fluff, no filler, no emojis

          Your role:
          - Help the user stay focused and productive
          - Answer clearly in 1–2 sentences
          - If possible, guide them toward action

          Tone:
          - Clean
          - Confident
          - Slightly motivational without sounding cheesy

          Rules:
          - Never ramble
          - Never say "as an AI"
          - Never apologize unless absolutely necessary
          - Never refuse without offering an alternative solution

          User request:
          ${prompt}
          `
      })
    });

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        text: data.output[0].content[0].text
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
