export async function POST(req) {
  try {
    const { messages, system } = await req.json();

    // Filter out any <think>...</think> blocks from previous assistant messages
    // Qwen3 32B emits these when thinking mode is on — we strip them from history
    const cleanMessages = messages.map(m => ({
      ...m,
      content: typeof m.content === "string"
        ? m.content.replace(/<think>[\s\S]*?<\/think>/g, "").trim()
        : m.content,
    }));

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "qwen/qwen3-32b",
        max_tokens: 8000,
        temperature: 0.6,
        messages: [
          { role: "system", content: system },
          ...cleanMessages,
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return Response.json({ error: data?.error?.message || "Groq API error" }, { status: response.status });
    }

    // Strip <think>...</think> reasoning block from the final reply before sending to UI
    let text = data.choices?.[0]?.message?.content || "";
    text = text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

    return Response.json({ text });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
