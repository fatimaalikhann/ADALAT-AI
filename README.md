<div align="center">

# ⚖️ AdalatAI
### Legal Aid for Every Pakistani Citizen
### ہر پاکستانی شہری کے لیے مفت قانونی مدد

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-adalat--ai--alpha.vercel.app-gold?style=for-the-badge)](https://adalat-ai-alpha.vercel.app)
[![Backend](https://img.shields.io/badge/🚀_Backend-Railway-blueviolet?style=for-the-badge)](https://adalat-ai-production.up.railway.app/api/health)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.11-blue?style=for-the-badge&logo=python)](https://python.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org)

**Built by Fatima Ali Khan**

*6 autonomous AI agents working 24/7 to deliver free, instant legal guidance to every Pakistani citizen — in Urdu and English.*

</div>

---

## 🌟 The Problem

Pakistan has **220 million citizens** and fewer than 130,000 registered lawyers. The majority of Pakistanis who face legal problems — wrongful dismissal, domestic abuse, landlord disputes, police harassment — never access professional legal help. The barriers are cost, geography, language, and stigma.

**AdalatAI tears down every one of those barriers.**

---

## 🤖 The 6 AI Agents

AdalatAI runs a production-grade multi-agent pipeline powered by Claude (Anthropic). Each agent is a specialist:

| Agent | Role | What It Does |
|-------|------|-------------|
| 🔍 **Classifier** | Case Triage | Identifies legal domain (labor, family, criminal, property, consumer, constitutional) and urgency level |
| 📚 **Rights Explainer** | Legal Education | Explains your rights under Pakistani law in plain Urdu and English — no jargon |
| 📄 **Document Drafter** | Legal Documents | Generates court-ready legal documents, complaint letters, and formal notices |
| ⚖️ **Lawyer Assessor** | Professional Guidance | Evaluates whether your case needs a human lawyer and provides actionable next steps |
| ⏰ **Deadline Tracker** | Time Management | Identifies critical legal deadlines and limitation periods specific to Pakistani law |
| 📊 **Analytics Agent** | Policy Insights | Aggregates anonymized case data to surface systemic legal issues across Pakistan |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Next.js Frontend                   │
│         (Vercel · Dark Theme · Urdu + English)       │
└─────────────────────┬───────────────────────────────┘
                      │ HTTPS
┌─────────────────────▼───────────────────────────────┐
│                  FastAPI Backend                      │
│              (Railway · Docker · Python 3.11)        │
└──────┬──────────────┬──────────────┬────────────────┘
       │              │              │
┌──────▼──────┐ ┌─────▼──────┐ ┌───▼────────────────┐
│  Anthropic  │ │ PostgreSQL  │ │   6 AI Agents      │
│  Claude API │ │  (Railway)  │ │   Pipeline         │
└─────────────┘ └────────────┘ └────────────────────┘
```

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS |
| **Backend** | Python 3.11, FastAPI |
| **AI** | Anthropic Claude (claude-sonnet-4-6) |
| **Database** | PostgreSQL |
| **Containerization** | Docker |
| **Frontend Hosting** | Vercel |
| **Backend Hosting** | Railway |
| **Security** | AES-256 encryption for case data |

---

## ✨ Features

- 🆓 **100% Free** — no fees, no subscriptions, no paywalls
- 🌐 **Bilingual** — full Urdu and English support
- 🔒 **Confidential** — end-to-end encrypted case data
- ⚡ **Instant** — real-time AI responses, no waiting
- 📱 **Accessible** — works on any device, any browser
- 🕐 **24/7** — always available, no office hours
- 🇵🇰 **Pakistan-specific** — trained on Pakistani law, courts, and procedures

---

## 🛠️ Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL
- Anthropic API Key

### Backend Setup

```bash
# Clone the repo
git clone https://github.com/fatimaalikhann/ADALAT-AI.git
cd ADALAT-AI

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your values:
# ANTHROPIC_API_KEY=your_key
# CASES_DATABASE_URL=postgresql://...
# ANALYTICS_DATABASE_URL=postgresql://...
# ENCRYPTION_KEY_HEX=your_32_byte_hex

# Run backend
uvicorn api.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set environment variables
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Run frontend
npm run dev
```

Visit `http://localhost:3000` 🎉

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/cases` | Submit a new legal case |
| `GET` | `/api/cases/{id}` | Retrieve case analysis |
| `POST` | `/api/analyze` | Run full 6-agent pipeline |
| `GET` | `/api/analytics` | Aggregated legal insights |

---

## 🌍 Deployment

### Backend (Railway)
- Deployed via Docker
- Auto-deploys on push to `main`
- PostgreSQL managed by Railway
- URL: `https://adalat-ai-production.up.railway.app`

### Frontend (Vercel)
- Auto-deploys on push to `main`
- Root directory: `frontend/`
- URL: `https://adalat-ai-alpha.vercel.app`

---

## 🎯 Impact

AdalatAI addresses Pakistan's justice gap by making legal guidance:

- **Accessible** to rural citizens with smartphones
- **Affordable** — free for everyone, always
- **Available** in the language people actually speak
- **Actionable** — not just information, but next steps

Every case submitted helps build an anonymized dataset of Pakistan's most common legal problems — giving policymakers real data to fix systemic injustices.

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

```bash
git checkout -b feature/your-feature
git commit -m "Add your feature"
git push origin feature/your-feature
# Open a Pull Request
```

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with ❤️ for Pakistan**

*"Justice delayed is justice denied. AdalatAI makes sure no Pakistani has to wait."*

⭐ Star this repo if you believe in free legal aid for all

</div>
