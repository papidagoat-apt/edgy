export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const league = searchParams.get("league") || "soccer_epl";

    const url = `https://api.the-odds-api.com/v4/sports/${league}/odds/?apiKey=${process.env.ODDS_API_KEY}&regions=uk,eu&markets=h2h&oddsFormat=decimal&dateFormat=iso`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return Response.json({ error: data?.message || "Odds API error" }, { status: response.status });
    }

    const remaining = response.headers.get("x-requests-remaining");
    return Response.json({ data, remaining });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
