<p align="center">
  <img src="https://img.shields.io/badge/Hackathon-Hermes%20Agent%20Accelerated%20Business-blueviolet?style=for-the-badge" alt="Hackathon Badge" />
  <img src="https://img.shields.io/badge/Stack-Next.js%20%7C%20TypeScript%20%7C%20Prisma-blue?style=for-the-badge" alt="Stack Badge" />
  <img src="https://img.shields.io/badge/AI-Hermes%20%7C%20Nemotron-green?style=for-the-badge" alt="AI Badge" />
  <img src="https://img.shields.io/badge/Payments-Stripe%20Test%20Mode-635bff?style=for-the-badge" alt="Stripe Badge" />
  <img src="https://img.shields.io/badge/License-MIT-orange?style=for-the-badge" alt="License Badge" />
</p>

<h1 align="center">🚀 VentureOps Autopilot</h1>

<p align="center">
  <strong>The Agentic Business Control Tower — Launch, Earn, Spend, Fulfill & Audit with Autonomous AI Agents</strong>
</p>

<p align="center">
  <em>One founder goal. One budget. Nine specialist agents. A fully auditable business loop — from revenue to profit.</em>
</p>

---

## 💡 The Problem

Launching a micro-business today requires a founder to juggle planning, budgeting, marketing, sales, operations, and accounting — all manually. What if autonomous AI agents could orchestrate an entire business run while keeping a human founder in control of every dollar?

## 🎯 Our Solution

**VentureOps Autopilot** is an agentic business control tower where a founder provides a single business goal and an operating budget. From there, a coordinated team of **9 specialist AI agents** autonomously:

| Agent | Role | Intelligence |
|-------|------|-------------|
| 🧠 **CEO** | Strategic planning & success metrics | Hermes / Nemotron |
| 💰 **CFO** | Deterministic budget policy enforcement | Rule Engine |
| 📈 **Growth** | Marketing copy & launch material | Hermes / Nemotron |
| 💳 **Stripe** | Revenue collection via Checkout Sessions | Stripe API |
| ⚙️ **Ops** | Customer report generation & fulfillment | Hermes / Nemotron |
| 💸 **Spend** | Proposes tool & data purchases | Rule Engine |
| 🛡️ **Risk** | Deterministic policy gating & risk blocking | Rule Engine |
| 📋 **Audit** | Receipt logging & event trail | Prisma |
| 🔬 **Learning** | Experiment recommendations for next cycle | Hermes / Nemotron |

> **Key Insight:** Creative agents use Hermes/Nemotron for intelligent planning. Financial safety agents (CFO, Risk, Audit) are **fully deterministic** — LLM output can never approve spend, override policy, or bypass the budget firewall.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     FOUNDER INPUT                               │
│              "Goal: Web3 Research Reports"  +  Budget: $25      │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   AGENT ORCHESTRATION LAYER                     │
│                                                                 │
│  CEO ──► CFO ──► Growth ──► Stripe ──► Ops ──► Spend ──► Risk  │
│                                                    │            │
│                   Hermes / Nemotron API ◄───────────┘            │
│                   (OpenAI-compatible)                            │
└──────────────┬──────────────┬───────────────┬───────────────────┘
               │              │               │
               ▼              ▼               ▼
┌──────────────────┐ ┌────────────────┐ ┌─────────────────────────┐
│  STRIPE TEST     │ │  BUDGET        │ │  PRISMA + SQLITE        │
│  MODE            │ │  FIREWALL      │ │  (Source of Truth)       │
│                  │ │                │ │                          │
│ • Products       │ │ • Auto-approve │ │ • BusinessRun            │
│ • Prices         │ │ • Threshold    │ │ • AgentEvent             │
│ • Checkout       │ │ • Block unsafe │ │ • CustomerOrder          │
│ • Webhooks       │ │ • Human review │ │ • SpendRequest           │
│ • Reconciliation │ │                │ │ • Receipt / StripeEvent  │
└──────────────────┘ └────────────────┘ │ • ProfitLossReport       │
                                        └─────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                 JUDGE-FACING DASHBOARDS                         │
│                                                                 │
│  Mission Control │ Stripe Revenue │ Orders │ Budget Firewall    │
│  Approvals │ Audit Trail │ Profit & Loss │ Live Proof Panel     │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features

### 🔄 End-to-End Autonomous Business Loop
From a single goal, agents plan the business, create a paid Stripe offer, generate marketing copy, process checkout payments, fulfill customer reports, manage spend, block unsafe requests, and produce an auditable P&L.

### 🛡️ Deterministic Budget Firewall
Spend safety is **never delegated to an LLM**. A rule-based policy engine evaluates every spend request against budget limits, vendor allowlists, category blocklists, approval thresholds, and risk levels.

### 💳 Real Stripe Test-Mode Integration
- Creates and reuses products and prices via the Stripe API
- Opens Stripe Checkout Sessions for real payment flows
- Webhook reconciliation updates orders, receipts, and P&L automatically
- Full event audit trail stored in Prisma

### 🤖 Hermes / Nemotron Intelligence
Creative agents call Hermes through a local OpenAI-compatible endpoint with optional Nemotron 3 Ultra routing. If the LLM times out, the system **visibly falls back** to deterministic content — no silent fake success.

### 📊 Prisma-Backed Proof Dashboards
Every dashboard reads from the database. Business runs, agent events, orders, receipts, spend decisions, and P&L are all stored in Prisma-backed SQLite — queryable, auditable, and replayable.

### 🔌 MCP Integration
A local MCP stdio server (`scripts/mcp-server.mjs`) exposes safe app-level tools to MCP-compatible clients — without ever exposing API keys or secrets.

---

## 🖥️ Dashboard Routes

| Route | Description |
|-------|-------------|
| `/submission-live` | **Live proof panel** — runtime status, real IDs, receipt counts, and proof metrics |
| `/agents` | **Agent management** — operator console with goal, budget, permissions, and status |
| `/judge-demo` | **90-second business run** — end-to-end demo for judges |
| `/stripe-revenue` | **Stripe panel** — checkout sessions, revenue tracking |
| `/mission` | **Mission control** — submit goals and monitor agent execution |
| `/orders` | **Customer orders** — real-time order status from Stripe webhooks |
| `/budget-firewall` | **Spend firewall** — auto-approve, threshold, and block decisions |
| `/approvals` | **Founder approval queue** — human-in-the-loop spend review |
| `/audit` | **Audit trail** — receipts, policy decisions, and event logs |
| `/profit-loss` | **P&L dashboard** — revenue, cost, blocked risk, and profit |
| `/operations` | **Live event stream** — real-time agent activity log |

---

## 🏆 Sponsor Alignment

### <img src="https://img.shields.io/badge/-Hermes-5C6BC0?style=flat-square" /> Hermes / Nous / Nemotron
- Hermes wired through a local OpenAI-compatible adapter (`HERMES_BASE_URL`)
- Optional Nous and NVIDIA adapters with deterministic fallback
- Skill pack included in `hermes-skills/ventureops-autopilot`
- Structured calls with transparent timeout handling

### <img src="https://img.shields.io/badge/-Stripe-635BFF?style=flat-square" /> Stripe
- Real test-mode Checkout Sessions — not mock data
- Product/price reuse across runs
- Webhook signature verification and order reconciliation
- Revenue and P&L proof from actual Stripe events

### <img src="https://img.shields.io/badge/-NVIDIA-76B900?style=flat-square" /> NVIDIA / NemoClaw-Style Safety
- Policy manifests in `nvidia/` — credential isolation, network allowlists, spend boundaries
- Deterministic budget firewall — LLM-proof financial controls
- Auditable action logs and receipt requirements
- Safe runtime boundary documentation and proofs

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/SuryaXyz-art/VentureOps.git
cd VentureOps

# 2. Install dependencies
npm ci

# 3. Set up environment
cp .env.example .env
# Edit .env with your keys (see Configuration below)

# 4. Initialize database
npx prisma generate
npx prisma db push

# 5. Launch
npm run dev:quiet
```

Open **http://localhost:3000/submission-live** to see the live proof panel.

### Configuration

Copy `.env.example` → `.env` and configure:

```bash
# ── Core ─────────────────────────────────────────
APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL="file:./dev.db"
DEMO_MODE=true                    # Set false for live Stripe + Hermes

# ── Stripe (Test Mode) ──────────────────────────
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...   # From: stripe listen --forward-to localhost:3000/api/stripe/webhook

# ── Hermes / Nemotron ────────────────────────────
LLM_PROVIDER=hermes
HERMES_BASE_URL=http://127.0.0.1:8642/v1
HERMES_MODEL=hermes-agent
HERMES_API_KEY=your-local-token

# ── Optional: Nous / NVIDIA ─────────────────────
NOUS_API_KEY=
NVIDIA_API_KEY=
NEMOTRON_MODEL_ID=nvidia/nemotron-3-ultra-550b-a55b
```

> ⚠️ **Never commit API keys.** Only `.env.example` with placeholders is tracked.

---

## 🎬 Judge Demo Script

### ⏱️ 90-Second Version

1. **Open** `/submission-live` → Show runtime status, Stripe config, Hermes provider, and proof metrics
2. **Click** "Run Live Test Demo" → Watch 9 agents execute the business loop
3. **Open** `/stripe-revenue` → Show real Stripe Checkout Session
4. **Open** `/profit-loss` → Revenue, cost, blocked risk, and profit — all from Prisma
5. **Open** `/audit` → Receipts and policy decisions prove every action

### ⏱️ 3-Minute Deep Dive

1. **Start at** `/agents` → Explain goal, budget, success condition, and tool permissions
2. **Submit** at `/mission` → Web3 founder research-report goal with $25 budget
3. **Watch** `/operations` → CEO plan → CFO policy → Growth copy → Stripe checkout → Fulfillment → Spend → Risk → Audit → Learning
4. **Pay** via Stripe Checkout with test card `4242 4242 4242 4242`
5. **Verify** `/orders` → Order status changes from `checkout_created` → `paid`
6. **Inspect** `/budget-firewall` → $6 auto-approves, $9 needs human review, $60 blocks
7. **Review** `/approvals` → Approve or reject pending spend, watch P&L update
8. **End at** `/submission-live` → Real IDs, receipt counts, blocked spend, profit, and provider status

---

## 🛡️ Security & Safety

| Boundary | Implementation |
|----------|---------------|
| **Credential Isolation** | Secrets in `.env` only — never committed, never exposed via API or MCP |
| **Spend Safety** | Deterministic policy engine — LLM cannot approve, override, or bypass |
| **Network Boundary** | Documented allowlists in `nvidia/network-allowlist.example.json` |
| **Webhook Verification** | Stripe signature verification enforced when `DEMO_MODE=false` |
| **Audit Trail** | Every agent action, spend decision, and receipt stored in Prisma |
| **MCP Safety** | MCP server exposes app-level tools only — no secret access |

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 App Router, React 18, TypeScript |
| **Styling** | Tailwind CSS, Framer Motion animations |
| **UI Components** | shadcn/ui primitives, Radix UI, Lucide icons, Recharts |
| **Database** | Prisma ORM + SQLite |
| **Payments** | Stripe (test mode) — Checkout, Webhooks, Reconciliation |
| **AI** | Hermes, Nemotron 3 Ultra, Nous (OpenAI-compatible adapters) |
| **Safety** | NemoClaw/OpenShell-style policy manifests |
| **Interop** | MCP stdio server for agent tooling |
| **Validation** | Zod schema validation |

---

## 📁 Project Structure

```
ventureops-autopilot/
├── app/                    # Next.js App Router pages & API routes
│   ├── api/                # REST endpoints (runs, orders, receipts, P&L, Stripe, LLM)
│   ├── agents/             # Agent management console
│   ├── approvals/          # Founder approval queue
│   ├── audit/              # Audit trail & receipts
│   ├── operations/         # Live event stream
│   ├── profit-loss/        # P&L dashboard
│   └── submission-live/    # Live proof panel for judges
├── components/             # React components by domain
│   ├── dashboard/          # Autopilot console, judge demo
│   ├── marketing/          # Landing page, header
│   ├── mission/            # Mission control
│   ├── orders/             # Orders page
│   ├── policy/             # Budget firewall
│   ├── proof/              # Live test demo button
│   └── stripe/             # Stripe revenue page
├── lib/                    # Business logic
│   ├── agents/             # Agent implementations (Stripe, Spend, etc.)
│   ├── config/             # Runtime configuration
│   └── llm/                # Hermes, Nous, NVIDIA adapters
├── prisma/                 # Schema & migrations
├── nvidia/                 # NemoClaw/OpenShell policy manifests
├── docs/                   # Detailed documentation
├── scripts/                # MCP server, verification, utilities
└── hermes-skills/          # Hermes skill pack
```

---

## 📚 Documentation

| Document | Description |
|----------|------------|
| [`ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Runtime layers, agent workflow, data & payment flows |
| [`API.md`](docs/API.md) | Endpoint reference with examples and error format |
| [`USER_GUIDE.md`](docs/USER_GUIDE.md) | End-user operating guide |
| [`DEMO_WALKTHROUGH.md`](docs/DEMO_WALKTHROUGH.md) | 1-minute and 3-minute demo scripts |
| [`HACKATHON_ALIGNMENT.md`](docs/HACKATHON_ALIGNMENT.md) | Hermes, Stripe, NVIDIA/NemoClaw alignment details |
| [`SECURITY_AND_SAFETY.md`](docs/SECURITY_AND_SAFETY.md) | Secret handling, spend policy, runtime boundaries |
| [`NEMOCLAW_PROOF.md`](docs/NEMOCLAW_PROOF.md) | Terminal proof commands for NemoClaw and Hermes |
| [`ROADMAP.md`](docs/ROADMAP.md) | Product roadmap and future vision |

---

## ✅ Quality & Verification

```bash
npm run typecheck       # TypeScript strict checks
npm run lint            # ESLint
npm run build           # Production build
npm run policy:test     # Budget firewall policy tests
npm run verify:live     # Live stack verification (requires running server)
```

---

## 🔍 Honest Transparency

We believe in honest engineering. Here's what is real and what has boundaries:

| Claim | Status |
|-------|--------|
| Stripe payments | ✅ Real test-mode — actual Checkout Sessions, webhooks, and reconciliation |
| Hermes/Nemotron calls | ✅ Real when connected — visible deterministic fallback on timeout |
| Budget firewall | ✅ Fully deterministic — zero LLM dependency |
| Prisma dashboards | ✅ All data from database — no hardcoded display values |
| Demo mode | ✅ Explicit `DEMO_MODE=true` flag — clearly labeled, not hidden |
| Production finance | ❌ Not claimed — this is a hackathon prototype |
| NemoClaw enforcement | ⚠️ Documented + mirrored through local policy — not a full sandbox runtime |
| Live money movement | ❌ Test mode only — no real financial transactions |

---

## 📜 License

MIT — see [`LICENSE`](LICENSE).

---

<p align="center">
  <strong>Built for the Hermes Agent Accelerated Business Hackathon</strong><br/>
  <em>Where autonomous agents meet responsible business operations.</em>
</p>
