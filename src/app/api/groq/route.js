export async function POST(req) {
  try {
    const { messages, system } = await req.json();

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1024,
        temperature: 0.7,
        messages: [{ role: "system", content: system }, ...messages],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return Response.json({ error: data?.error?.message || "Groq API error" }, { status: response.status });
    }
    const text = data.choices?.[0]?.message?.content || "";
    return Response.json({ text });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
