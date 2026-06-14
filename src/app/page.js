"use client";
import { useState, useRef, useEffect } from "react";

const SPORTS = {
  SOCCER: { id: "SOCCER", emoji: "⚽", label: "SOCCER", color: "#00e676" },
  BASKETBALL: { id: "BASKETBALL", emoji: "🏀", label: "BASKETBALL", color: "#ff6d00" },
  TENNIS: { id: "TENNIS", emoji: "🎾", label: "TENNIS", color: "#c6ff00" },
};

const MODES = {
  STANDARD: { id: "STANDARD", emoji: "⚽", label: "STANDARD", color: "#00e676", bg: "#00c853", desc: "Slip Builder" },
  SHARP: { id: "SHARP", emoji: "🔵", label: "SHARP", color: "#2196f3", bg: "#1976d2", desc: "Pro Edge" },
  SYNDICATE: { id: "SYNDICATE", emoji: "🔴", label: "SYNDICATE", color: "#f44336", bg: "#d32f2f", desc: "Portfolio" },
  TOURNAMENT: { id: "TOURNAMENT", emoji: "🌍", label: "TOURNAMENT", color: "#ff9800", bg: "#f57c00", desc: "Cups & Slams" },
};

const SOCCER_LEAGUES = [
  { key: "soccer_epl", label: "Premier League" },
  { key: "soccer_spain_la_liga", label: "La Liga" },
  { key: "soccer_italy_serie_a", label: "Serie A" },
  { key: "soccer_germany_bundesliga", label: "Bundesliga" },
  { key: "soccer_france_ligue_one", label: "Ligue 1" },
  { key: "soccer_uefa_champs_league", label: "Champions League" },
  { key: "soccer_usa_mls", label: "MLS" },
];

const QUICK_PROMPTS = {
  SOCCER: {
    STANDARD: ["Build me a safe 3-leg parlay today", "Best BTTS picks this weekend", "Top Over/Under value bets today", "Build a 4-leg medium risk slip", "World Cup 2026 best bets today", "Best value singles today"],
    SHARP: ["Find steam moves today", "Compare Pinnacle vs soft books", "Reverse line movement alerts", "Best CLV opportunities today", "Line movement — PL today", "Sharp signals in Champions League"],
    SYNDICATE: ["Run weekly universe scan", "Build execution list for today", "Flag steam moves from Asian markets", "Portfolio exposure check", "Generate weekly syndicate report", "Model candidate list — weekend"],
    TOURNAMENT: ["Analyze World Cup 2026 matches today", "UCL picks this week", "Group stage betting guide", "Altitude venue impact analysis", "Tournament outright value check", "Final / semifinal betting strategy"],
  },
  BASKETBALL: {
    STANDARD: ["Best NBA picks today", "Build me a 4-leg NBA parlay", "Top player props tonight", "Best totals picks tonight", "ATS value picks today", "Build a safe NBA slip today"],
    SHARP: ["NBA steam moves tonight", "Line movement — tonight's games", "Sharp NBA totals signals", "Reverse line movement NBA", "Best NBA CLV spots tonight", "Sharp player prop alerts"],
    SYNDICATE: ["NBA model candidate list today", "Run NBA portfolio scan", "Build execution list — tonight", "NBA book rotation plan", "Generate NBA weekly report", "Flag sharp NBA moves"],
    TOURNAMENT: ["NBA Playoffs picks today", "Best NBA Finals betting angles", "Conference Finals analysis", "NBA Playoffs player props", "March Madness best bets", "EuroBasket / FIBA picks"],
  },
  TENNIS: {
    STANDARD: ["Best tennis picks today", "Build a 3-leg tennis parlay", "Top upset alerts today", "Best set betting picks", "Value underdogs today", "Slam best bets today"],
    SHARP: ["Steam moves in tennis today", "Line movement alerts — today", "Sharp tennis signals", "Best CLV tennis spots", "Reverse line movement tennis", "Pinnacle tennis line analysis"],
    SYNDICATE: ["Tennis model scan today", "Build tennis execution list", "Portfolio exposure — tennis", "Flag Asian market tennis moves", "Generate tennis weekly report", "Tennis candidate list today"],
    TOURNAMENT: ["Wimbledon 2026 best bets", "US Open picks today", "Roland Garros value picks", "Australian Open analysis", "ATP / WTA Finals picks", "Grand Slam outright value"],
  },
};

function buildSystemPrompt(sport, mode, budget, risk, oddsData) {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const oddsContext = oddsData && oddsData.length > 0
    ? `\n\nLIVE ODDS DATA:\n${oddsData.map(g => {
        const bm = g.bookmakers?.[0];
        const market = bm?.markets?.find(m => m.key === "h2h");
        if (!market) return null;
        const outcomes = market.outcomes;
        return `• ${g.home_team} vs ${g.away_team} (${new Date(g.commence_time).toLocaleDateString()})\n  ${outcomes.map(o => `${o.name} @ ${o.price?.toFixed(2)} (${((1/o.price)*100).toFixed(1)}% implied)`).join(" | ")}`;
      }).filter(Boolean).join("\n")}`
    : "";

  const sportSection = {
    SOCCER: `# SPORT: SOCCER / FOOTBALL
LEAGUES: FIFA World Cup 2026, UCL, UEL, Premier League, La Liga, Serie A, Bundesliga, Ligue 1, Eredivisie, MLS, Copa Libertadores.
5-LAYER ANALYSIS:
1. FORM & xG: Last 5–7 results, home/away splits. Overperforming xG → regression → Under lean.
2. TACTICAL MATCHUPS: Weak fullback vs winger, backup CB, GK downgrade, high press vs poor resistance, key striker absent → Under.
3. CONTEXT: Must-win → Favorite dominant. Dead rubber → Rotation risk, AVOID. Derby → Cards Over, Under. 3 games in 7 days → Fatigue, Under.
4. GAME SCRIPT: Open game → Over/BTTS. Dominant siege → AH -1.5. Low block → Under 2.5. Knockout → Under, Draw at 90.
5. VALUE: Edge = True Prob − Implied Prob. ≥5% → BET. 3–5% → SMALL. <3% → SKIP. Half Kelly sizing.
MARKETS: 1X2, AH, BTTS, Over/Under, HT/FT, Correct Score, Goalscorer, Cards, Corners, Accumulators.`,
    BASKETBALL: `# SPORT: BASKETBALL
LEAGUES: NBA, EuroLeague, FIBA, NCAA March Madness, WNBA, Olympics Basketball.
5-LAYER ANALYSIS:
1. FORM & METRICS: Last 10 ATS + O/U record, pace (fast pace → Over), OffRtg/DefRtg/Net Rating. Back-to-back → Under, avoid favorites.
2. MATCHUP & LINEUP: Injuries (star out → total drops), load management, positional mismatches.
3. CONTEXT: Playoff position clinched → rest risk. Revenge/rivalry → motivated. Late in road trip → fatigue.
4. GAME SCRIPT: Shootout → Over. Defensive grind → Under. Star dominant → ATS favorite.
5. VALUE: Edge = True Prob − Implied Prob. ≥5% → BET. 3–5% → SMALL. <3% → SKIP. Half Kelly sizing.
MARKETS: Moneyline, Spread (ATS), Game Total, Team Totals, 1H/2H lines, Player Props, Alt Spreads, Parlays.`,
    TENNIS: `# SPORT: TENNIS
TOURNAMENTS: All 4 Grand Slams, ATP Masters 1000/500/250, WTA 1000/500/250, Davis Cup.
5-LAYER ANALYSIS:
1. FORM & SURFACE METRICS: Surface-specific ranking CRITICAL. Last 10 on this surface. H2H on this surface.
2. SURFACE & CONDITIONS: Hard → baseline grinders. Clay → longer rallies → Over games. Grass → big servers → Under games.
3. CONTEXT: Early rounds → seeds cruise. Later slams → fatigue critical. Must-win → max motivation.
4. GAME SCRIPT: Big server → Under games. Baseline battle → Over games, 3 sets.
5. VALUE: Edge = True Prob − Implied Prob. ≥5% → BET. 3–5% → SMALL. <3% → SKIP.
MARKETS: Match Winner, Set Handicap, Total Sets, Total Games, First Set Winner, Tournament Outrights.`,
  };

  const modeSection = {
    STANDARD: `MODE: STANDARD — Slip Builder. Confidence filter: Safe=8+/10 max 3 legs | Medium=7+/10 max 4 legs | High=6+/10 max 6 legs | Degen=5+/10 max 8 legs. Never combine correlated bets. Output: 🟢/🟡/🔴 CONFIDENCE: X/10 | Match | Pick @ Odds | Implied% | Est% | Edge% | Key Angle`,
    SHARP: `MODE: SHARP — Pro Edge Hunter. Reference Pinnacle first. Flag steam moves, reverse line movement, Asian market leads. Edge thresholds: <3% Skip | 3–5% 1% bankroll | 5–8% 2% | 8–12% 3% | 12%+ 4–5%. Output: Line movement, public% vs sharp%, signal type, Half Kelly stake, CLV target, ACTION: BET/WAIT/SKIP.`,
    SYNDICATE: `MODE: SYNDICATE — Portfolio Operation. Three models: Goals/Scoring + Match Outcome + Player Props. Max per event 5%. Max daily 20%. Book rotation: Pinnacle → Bookmaker/Circa → Bet365 → DraftKings → Betfair. Output: Model probability vs Pinnacle implied, stake, EV, STATUS: EXECUTE/HOLD/SKIP.`,
    TOURNAMENT: `MODE: TOURNAMENT — Cups, Slams & Playoffs. Soccer: Group Match 3 → HIGHEST RISK (rotation). Knockouts → Under lean. Finals → Under 2.5 hits 70%+. WC2026 altitude: Mexico City 2240m STRONG Under. Basketball: Playoff series game-by-game. March Madness 12-5 upsets common. Tennis Slams: Best-of-5 fatigue huge in later rounds.`,
  };

  return `You are SportEdge AI v4 — elite multi-sport betting intelligence system.

TODAY: ${today}
SPORT: ${sport} | MODE: ${mode} | BUDGET: ${budget ? "$" + budget : "not set"} | RISK: ${risk.toUpperCase()}
${oddsContext}

${sportSection[sport]}

${modeSection[mode]}

CONFIDENCE: 🟢 8–10/10 HIGH | 🟡 6–7/10 MEDIUM | 🔴 5/10 RISKY | ⚫ SKIP

RULES:
- If live odds are provided above, use them as primary reference and cite the exact odds.
- Never guarantee wins. Probability and edge only.
- For missing live data (injuries, lineups) → tell user to verify on Sofascore/ESPN.
- Responsible gambling: only stake what you can afford to lose.
- CLV is the true performance metric, not short-term results.

FINAL PRINCIPLE: Bet the number, not the team. Edge > Everything.`;
}

function TypingDots({ color }) {
  return (
    <div style={{ display: "flex", gap: "4px", padding: "12px 16px" }}>
      {[0, 150, 300].map((d) => (
        <div key={d} style={{ width: "7px", height: "7px", borderRadius: "50%", background: color, animation: "bounce 1s infinite", animationDelay: d + "ms" }} />
      ))}
      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}`}</style>
    </div>
  );
}

function Message({ msg, sportEmoji, modeColor }) {
  const isUser = msg.role === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: "14px" }}>
      {!isUser && (
        <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: modeColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", marginRight: "8px", flexShrink: 0, marginTop: "2px", boxShadow: `0 0 10px ${modeColor}55` }}>
          {sportEmoji}
        </div>
      )}
      <div style={{ maxWidth: "82%", background: isUser ? modeColor + "dd" : "#131326", color: isUser ? "#000" : "#e0e0e0", borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px", padding: "10px 14px", fontSize: "0.82rem", lineHeight: "1.6", whiteSpace: "pre-wrap", border: isUser ? "none" : "1px solid #1e1e3a", fontWeight: isUser ? 600 : 400 }}>
        {msg.content}
      </div>
      {isUser && (
        <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "#222", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#666", marginLeft: "8px", flexShrink: 0, marginTop: "2px" }}>U</div>
      )}
    </div>
  );
}

function OddsCard({ game, color }) {
  const bm = game.bookmakers?.[0];
  const market = bm?.markets?.find(m => m.key === "h2h");
  if (!market) return null;
  const outcomes = market.outcomes;
  const d = new Date(game.commence_time);
  const dateStr = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  return (
    <div style={{ background: "#0d0d20", border: `1px solid ${color}22`, borderRadius: "10px", padding: "10px 12px", marginBottom: "8px" }}>
      <div style={{ color: "#555", fontSize: "0.6rem", letterSpacing: "0.08em", marginBottom: "4px" }}>{dateStr}</div>
      <div style={{ color: "#ccc", fontSize: "0.8rem", fontWeight: 700, marginBottom: "8px" }}>{game.home_team} <span style={{ color: "#444" }}>vs</span> {game.away_team}</div>
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {outcomes.map((o, i) => (
          <div key={i} style={{ background: "#131326", border: `1px solid ${color}33`, borderRadius: "8px", padding: "4px 10px", textAlign: "center" }}>
            <div style={{ color: "#555", fontSize: "0.55rem", letterSpacing: "0.06em" }}>{o.name}</div>
            <div style={{ color: color, fontSize: "0.85rem", fontWeight: 800 }}>{o.price?.toFixed(2)}</div>
            <div style={{ color: "#444", fontSize: "0.55rem" }}>{((1/o.price)*100).toFixed(1)}%</div>
          </div>
        ))}
      </div>
      {bm && <div style={{ color: "#333", fontSize: "0.55rem", marginTop: "6px" }}>via {bm.title}</div>}
    </div>
  );
}

export default function SportEdgeAI() {
  const [sport, setSport] = useState("SOCCER");
  const [mode, setMode] = useState("STANDARD");
  const [aiEngine, setAiEngine] = useState("claude"); // "claude" | "groq"
  const [activeTab, setActiveTab] = useState("chat");
  const [selectedLeague, setSelectedLeague] = useState("soccer_epl");
  const [oddsData, setOddsData] = useState([]);
  const [oddsLoading, setOddsLoading] = useState(false);
  const [oddsError, setOddsError] = useState("");
  const [remainingRequests, setRemainingRequests] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `SportEdge AI v4 — READY ⚡

✅ Claude AI — connected
✅ Groq / Llama 3.3 70B — connected  
✅ The Odds API — live odds connected

HOW TO USE:
1. Tap "📊 ODDS" to load live fixtures & real odds
2. Switch back to "💬 CHAT" — I'll analyze them for you
3. Toggle AI engine (Claude / Groq) top right
4. Ask for picks, parlays, edge analysis

Switch sports above · Switch modes below · Ask anything.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [budget, setBudget] = useState("");
  const [risk, setRisk] = useState("medium");
  const messagesEndRef = useRef(null);

  const currentSport = SPORTS[sport];
  const currentMode = MODES[mode];
  const modeColor = currentMode.color;
  const sportColor = currentSport.color;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function fetchOdds(leagueKey) {
    setOddsLoading(true);
    setOddsError("");
    try {
      const res = await fetch(`/api/odds?league=${leagueKey}`);
      const json = await res.json();
      if (!res.ok) { setOddsError(json.error || "Failed to load odds."); return; }
      setOddsData(json.data || []);
      if (json.remaining) setRemainingRequests(json.remaining);
    } catch { setOddsError("Connection failed."); }
    finally { setOddsLoading(false); }
  }

  useEffect(() => { fetchOdds(selectedLeague); }, [selectedLeague]);

  async function sendMessage(text) {
    const userText = (text || input).trim();
    if (!userText || loading) return;
    setInput("");
    setActiveTab("chat");

    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const system = buildSystemPrompt(sport, mode, budget, risk, oddsData);
      const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }));
      const endpoint = aiEngine === "groq" ? "/api/groq" : "/api/chat";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, system }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessages(prev => [...prev, { role: "assistant", content: `⚠️ Error: ${data.error}` }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: data.text || "⚠️ No response." }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Connection error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  const prompts = QUICK_PROMPTS[sport][mode];

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#060612", minHeight: "100vh", display: "flex", flexDirection: "column", color: "#e0e0e0" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0a0a1e, #111128)", borderBottom: `1px solid ${sportColor}33`, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: `linear-gradient(135deg, ${sportColor}bb, ${sportColor})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px", boxShadow: `0 0 14px ${sportColor}55` }}>
            {currentSport.emoji}
          </div>
          <div>
            <div style={{ color: sportColor, fontWeight: 800, fontSize: "0.88rem", letterSpacing: "0.08em" }}>
              SPORTEDGE AI <span style={{ fontSize: "0.58rem", opacity: 0.6 }}>v4</span>
            </div>
            <div style={{ color: modeColor + "99", fontSize: "0.56rem", letterSpacing: "0.1em" }}>
              {currentMode.label} · {currentSport.label} · LIVE ODDS
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* AI Engine Toggle */}
          <div style={{ display: "flex", background: "#0f0f22", border: "1px solid #1e1e3a", borderRadius: "8px", overflow: "hidden" }}>
            {["claude", "groq"].map(e => (
              <button key={e} onClick={() => setAiEngine(e)}
                style={{ padding: "4px 9px", background: aiEngine === e ? (e === "claude" ? "#7c3aed" : "#f97316") : "transparent", color: aiEngine === e ? "#fff" : "#444", border: "none", cursor: "pointer", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.06em", transition: "all 0.2s" }}>
                {e.toUpperCase()}
              </button>
            ))}
          </div>
          {remainingRequests !== null && (
            <span style={{ color: "#444", fontSize: "0.56rem" }}>{remainingRequests} left</span>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00e676", boxShadow: "0 0 6px #00e676" }} />
            <span style={{ color: "#4caf50", fontSize: "0.58rem", letterSpacing: "0.1em" }}>LIVE</span>
          </div>
        </div>
      </div>

      {/* Sport Tabs */}
      <div style={{ background: "#080818", borderBottom: "1px solid #1a1a30", display: "flex" }}>
        {Object.values(SPORTS).map((s) => {
          const active = sport === s.id;
          return (
            <button key={s.id} onClick={() => setSport(s.id)}
              style={{ flex: 1, padding: "7px 4px", background: active ? s.color + "18" : "transparent", border: "none", borderBottom: active ? `2px solid ${s.color}` : "2px solid transparent", color: active ? s.color : "#333", cursor: "pointer", transition: "all 0.2s", display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
              <span style={{ fontSize: "1.1rem" }}>{s.emoji}</span>
              <span style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.08em" }}>{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mode Bar */}
      <div style={{ background: "#070715", borderBottom: "1px solid #111128", overflowX: "auto" }}>
        <div style={{ display: "flex", minWidth: "max-content" }}>
          {Object.values(MODES).map((m) => {
            const active = mode === m.id;
            return (
              <button key={m.id} onClick={() => setMode(m.id)}
                style={{ minWidth: "76px", padding: "7px 12px", background: active ? m.bg + "22" : "transparent", border: "none", borderBottom: active ? `2px solid ${m.color}` : "2px solid transparent", color: active ? m.color : "#333", cursor: "pointer", transition: "all 0.2s", display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                <span style={{ fontSize: "0.85rem" }}>{m.emoji}</span>
                <span style={{ fontSize: "0.56rem", fontWeight: 700, letterSpacing: "0.08em" }}>{m.label}</span>
                <span style={{ fontSize: "0.48rem", color: active ? m.color + "88" : "#222" }}>{m.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Settings */}
      <div style={{ background: "#09091a", borderBottom: "1px solid #141428", padding: "6px 14px", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <span style={{ color: "#333", fontSize: "0.62rem" }}>BUDGET $</span>
          <input type="number" placeholder="100" value={budget} onChange={(e) => setBudget(e.target.value)}
            style={{ background: "#0f0f22", border: `1px solid ${sportColor}33`, color: sportColor, borderRadius: "6px", padding: "2px 7px", width: "60px", fontSize: "0.7rem", outline: "none" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ color: "#333", fontSize: "0.62rem" }}>RISK</span>
          {["safe", "medium", "high", "degen"].map((r) => {
            const rc = { safe: "#00c853", medium: "#ff9800", high: "#f44336", degen: "#9c27b0" };
            const active = risk === r;
            return (
              <button key={r} onClick={() => setRisk(r)}
                style={{ background: active ? rc[r] : "#0f0f22", color: active ? "#000" : "#333", border: `1px solid ${active ? "transparent" : "#1a1a2e"}`, borderRadius: "5px", padding: "2px 6px", fontSize: "0.58rem", fontWeight: 700, cursor: "pointer", textTransform: "uppercase", transition: "all 0.2s" }}>
                {r}
              </button>
            );
          })}
        </div>
      </div>

      {/* View Toggle */}
      <div style={{ background: "#08081a", borderBottom: "1px solid #111128", display: "flex" }}>
        {[{ id: "chat", label: "💬 CHAT" }, { id: "odds", label: "📊 LIVE ODDS" }].map(tab => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id); if (tab.id === "odds") fetchOdds(selectedLeague); }}
            style={{ flex: 1, padding: "8px", background: activeTab === tab.id ? sportColor + "18" : "transparent", border: "none", borderBottom: activeTab === tab.id ? `2px solid ${sportColor}` : "2px solid transparent", color: activeTab === tab.id ? sportColor : "#444", cursor: "pointer", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em", transition: "all 0.2s" }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px", maxHeight: "calc(100vh - 318px)" }}>
        {activeTab === "chat" ? (
          <>
            {messages.map((msg, i) => (
              <Message key={i} msg={msg} sportEmoji={currentSport.emoji} modeColor={modeColor} />
            ))}
            {loading && (
              <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "14px" }}>
                <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: modeColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", marginRight: "8px", flexShrink: 0, boxShadow: `0 0 10px ${modeColor}55` }}>
                  {currentSport.emoji}
                </div>
                <div style={{ background: "#131326", border: "1px solid #1e1e3a", borderRadius: "18px 18px 18px 4px" }}>
                  <TypingDots color={modeColor} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div>
            {sport === "SOCCER" && (
              <div style={{ marginBottom: "10px", overflowX: "auto" }}>
                <div style={{ display: "flex", gap: "5px", minWidth: "max-content" }}>
                  {SOCCER_LEAGUES.map(l => (
                    <button key={l.key} onClick={() => { setSelectedLeague(l.key); }}
                      style={{ background: selectedLeague === l.key ? sportColor + "22" : "#0d0d20", border: `1px solid ${selectedLeague === l.key ? sportColor : "#1a1a30"}`, color: selectedLeague === l.key ? sportColor : "#555", borderRadius: "20px", padding: "4px 10px", fontSize: "0.62rem", cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s" }}>
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {oddsLoading && <div style={{ textAlign: "center", color: "#444", padding: "30px", fontSize: "0.8rem" }}>Loading live odds...</div>}
            {oddsError && <div style={{ color: "#f44336", fontSize: "0.75rem", padding: "10px", background: "#1a0a0a", borderRadius: "8px", marginBottom: "10px" }}>⚠️ {oddsError}</div>}
            {!oddsLoading && !oddsError && oddsData.length === 0 && (
              <div style={{ textAlign: "center", color: "#444", padding: "30px", fontSize: "0.8rem" }}>No upcoming fixtures found.</div>
            )}
            {!oddsLoading && oddsData.map((game, i) => <OddsCard key={i} game={game} color={sportColor} />)}
            {!oddsLoading && oddsData.length > 0 && (
              <button onClick={() => sendMessage("I've loaded the live odds. Please analyze them and give me the best picks based on my current mode and risk setting.")}
                style={{ width: "100%", marginTop: "8px", padding: "12px", background: `linear-gradient(135deg, ${sportColor}cc, ${sportColor})`, color: "#000", border: "none", borderRadius: "12px", fontWeight: 800, fontSize: "0.78rem", cursor: "pointer", letterSpacing: "0.06em" }}>
                ⚡ ANALYZE THESE ODDS WITH AI →
              </button>
            )}
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      {activeTab === "chat" && (
        <div style={{ background: "#070714", borderTop: "1px solid #0f0f1e", padding: "6px 10px 4px", overflowX: "auto" }}>
          <div style={{ display: "flex", gap: "5px", minWidth: "max-content" }}>
            {prompts.map((p, i) => (
              <button key={i} onClick={() => sendMessage(p)} disabled={loading}
                style={{ background: "#0d0d20", border: `1px solid ${sportColor}28`, color: sportColor + "bb", borderRadius: "20px", padding: "4px 11px", fontSize: "0.63rem", cursor: loading ? "not-allowed" : "pointer", whiteSpace: "nowrap", opacity: loading ? 0.4 : 1, transition: "all 0.2s" }}>
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{ background: "#070714", borderTop: "1px solid #0f0f1e", padding: "9px 11px", display: "flex", gap: "7px", alignItems: "flex-end" }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder={`${currentSport.emoji} Ask for picks, slip, or analysis...`}
          rows={1}
          style={{ flex: 1, background: "#0f0f22", border: `1px solid ${sportColor}28`, color: "#e0e0e0", borderRadius: "12px", padding: "9px 13px", fontSize: "0.8rem", outline: "none", resize: "none", lineHeight: "1.4", maxHeight: "90px", overflowY: "auto", fontFamily: "inherit" }}
        />
        <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
          style={{ background: loading || !input.trim() ? "#0f0f22" : `linear-gradient(135deg, ${sportColor}cc, ${sportColor})`, border: "none", borderRadius: "12px", width: "42px", height: "42px", cursor: loading || !input.trim() ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: loading || !input.trim() ? "none" : `0 0 14px ${sportColor}55`, transition: "all 0.2s" }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13" stroke={loading || !input.trim() ? "#222" : "#000"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={loading || !input.trim() ? "#222" : "#000"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
