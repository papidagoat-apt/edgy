# SportEdge AI v4 — Deployment Guide

## Deploy to Vercel (free, 5 minutes)

### Step 1 — Upload to GitHub
1. Go to github.com → New repository → name it `sportedge`
2. Upload this entire folder (drag & drop all files)
3. Click "Commit changes"

### Step 2 — Deploy on Vercel
1. Go to vercel.com → Sign up free (use your GitHub account)
2. Click "Add New Project" → Import your `sportedge` repo
3. Click "Deploy" — Vercel auto-detects Next.js

### Step 3 — Add your API keys
In Vercel dashboard → Your project → Settings → Environment Variables:

| Name | Value |
|------|-------|
| `ANTHROPIC_API_KEY` | Get from console.anthropic.com |
| `GROQ_API_KEY` | Get from console.groq.com |
| `ODDS_API_KEY` | `` |

### Step 4 — Redeploy
After adding env vars → Deployments → Redeploy

Your app will be live at: `https://sportedge-xxxx.vercel.app`

---

## API Keys needed
- **Anthropic** — console.anthropic.com (pay-as-you-go, ~$0.003/message)
- **Groq** — console.groq.com (free tier, 14,400 req/day)
- **The Odds API** — the-odds-api.com (free tier, 500 req/month)
