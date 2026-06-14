export async function POST(req) {
  try {
    const { messages, system } = await req.json();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system,
        messages,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return Response.json({ error: data?.error?.message || "Claude API error" }, { status: response.status });
    }
    const text = data.content?.map((b) => b.text || "").join("") || "";
    return Response.json({ text });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
