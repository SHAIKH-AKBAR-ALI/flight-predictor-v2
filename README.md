<div align="center">

# ✈️ AI Flight Price Intelligence

**Predict Indian domestic flight prices with 98.42% accuracy.**  
**Understand *why* with SHAP explainability + Groq AI in plain English.**

<br/>

[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
[![AWS](https://img.shields.io/badge/AWS-EC2-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white)](https://aws.amazon.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.4.2-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI%2FCD-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/features/actions)

<br/>

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-Visit%20App-7C3AED?style=for-the-badge)](http://54.84.17.86)
&nbsp;
[![GitHub stars](https://img.shields.io/github/stars/SHAIKH-AKBAR-ALI/flight-predictor-v2?style=for-the-badge&color=yellow&logo=github)](https://github.com/SHAIKH-AKBAR-ALI/flight-predictor-v2/stargazers)
&nbsp;
[![GitHub forks](https://img.shields.io/github/forks/SHAIKH-AKBAR-ALI/flight-predictor-v2?style=for-the-badge&color=blue&logo=github)](https://github.com/SHAIKH-AKBAR-ALI/flight-predictor-v2/fork)

</div>

---

## 🧠 What is this?

A production-grade, full-stack machine learning application that predicts **Indian domestic flight prices** in real time — then tells you *exactly* which factors drove that price using **SHAP explainability** and translates it into plain English via **Llama 3.3 70B on Groq**.

> **Not just a prediction. An explanation you can actually understand.**

| | |
|---|---|
| 📊 **98.42% R² accuracy** on 300K+ real flight records | 🧠 **SHAP** ranks every feature's rupee impact |
| ⚡ **< 50ms inference** after model warm-up | 🤖 **Groq LLM** narrates the analysis in plain English |
| 🐳 **One-command Docker deploy** | 🚀 **Full CI/CD** — push to main, live in minutes |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                          USER BROWSER                                │
│                  React 18 · Framer Motion · Recharts                 │
│                                                                      │
│   [Form] ──→ [ResultCard] ──→ [SHAPChart] ──→ [AIExplanation]       │
└─────────────────────────┬────────────────────────────────────────────┘
                          │  HTTP  (Nginx reverse proxy)
                          ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        FASTAPI BACKEND                               │
│                                                                      │
│  POST /predict          POST /explain          GET /history          │
│       │                      │                      │               │
│  ┌────▼────┐          ┌──────▼──────┐               │               │
│  │   ML    │          │    SHAP     │               │               │
│  │ Service │          │   Engine   │               │               │
│  │Random   │          │TreeExplain │               │               │
│  │ Forest  │          └──────┬──────┘               │               │
│  └────┬────┘                 │                      │               │
│       │               ┌──────▼──────┐               │               │
│       │               │  Groq LLM   │               │               │
│       │               │ Llama 3.3   │               │               │
│       │               │    70B      │               │               │
│       │               └──────┬──────┘               │               │
│       └──────────────────────┼──────────────────────┘               │
│                              ▼                                       │
│                    ┌──────────────────┐                             │
│                    │  Supabase (PG)   │                             │
│                    │ Prediction log   │                             │
│                    └──────────────────┘                             │
└──────────────────────────────────────────────────────────────────────┘

DEPLOYMENT PIPELINE
───────────────────────────────────────────────────────────────────────
  git push main
       │
       ▼
  ┌──────────────────┐    build + push    ┌─────────────┐
  │  GitHub Actions  │ ─────────────────▶ │  Docker Hub │
  │  1. Smoke test   │                    │  Registry   │
  │  2. Build images │                    └──────┬──────┘
  │  3. SSH + deploy │                           │ docker pull
  └──────────────────┘                           ▼
                                         ┌─────────────┐
                                         │   AWS EC2   │
                                         │ docker up-d │
                                         └─────────────┘
```

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔮 **Price Prediction** | Instant price estimate powered by an optimized 18MB Random Forest model |
| 📊 **SHAP Explainability** | Interactive horizontal bar chart — each bar shows the exact ₹ impact of every feature |
| 🤖 **Groq AI Narration** | Llama 3.3 70B writes a human-readable paragraph explaining your specific prediction |
| 📈 **Confidence Range** | Every result includes `±MAE ₹1,368` bounds so you know the likely price window |
| 🕐 **Prediction History** | All predictions persisted to Supabase with an inline sparkline trend column |
| 🛫 **Route Visualizer** | Animated FROM → ✈️ → TO connector in the form |
| 🎨 **Animated UI** | Floating particles, glassmorphism cards, typewriter cursor, Framer Motion throughout |
| 🐳 **Docker-First** | Single `docker compose up --build` launches the full stack |
| 🚀 **Auto CI/CD** | GitHub Actions → Docker Hub → EC2 — zero-touch deploys on every push to `main` |

---

## 📊 Model Performance

| Metric | Value |
|--------|-------|
| **Dataset** | 300,000+ Indian domestic flight records |
| **Algorithm** | Random Forest Regressor |
| **Train R²** | 98.72% |
| **Test R²** | 98.42% |
| **Mean Absolute Error (MAE)** | ₹1,368 |
| **Model size** | 18 MB (reduced from 832 MB original) |
| **Inference latency** | < 50 ms |
| **Input features** | Airline, Route, Class, Stops, Duration, Days Until Departure |

<details>
<summary>📋 Feature Importance (SHAP global average)</summary>

| Rank | Feature | Impact |
|------|---------|--------|
| 1 | `class` (Business vs Economy) | Highest |
| 2 | `days_left` (booking lead time) | High |
| 3 | `stops` | Medium-High |
| 4 | `duration` | Medium |
| 5 | `airline` | Medium |
| 6 | `departure_time` / `arrival_time` | Low |

</details>

---

## 🔧 Tech Stack

<table>
<tr>
<td><strong>Layer</strong></td>
<td><strong>Technology</strong></td>
<td><strong>Purpose</strong></td>
</tr>
<tr>
<td>Frontend</td>
<td>
  <img src="https://img.shields.io/badge/React_18-61DAFB?style=flat&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Framer_Motion-black?style=flat&logo=framer&logoColor=white" />
  <img src="https://img.shields.io/badge/Recharts-22B5BF?style=flat" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white" />
</td>
<td>SPA, animations, SHAP charts, bundler</td>
</tr>
<tr>
<td>Backend</td>
<td>
  <img src="https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/Python_3.11-3776AB?style=flat&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/Uvicorn-4B9CD3?style=flat" />
</td>
<td>REST API, validation, async ASGI</td>
</tr>
<tr>
<td>ML</td>
<td>
  <img src="https://img.shields.io/badge/scikit--learn-F7931E?style=flat&logo=scikit-learn&logoColor=white" />
  <img src="https://img.shields.io/badge/SHAP-FF6B6B?style=flat" />
  <img src="https://img.shields.io/badge/pandas-150458?style=flat&logo=pandas&logoColor=white" />
  <img src="https://img.shields.io/badge/numpy-013243?style=flat&logo=numpy&logoColor=white" />
</td>
<td>Random Forest, explainability, data wrangling</td>
</tr>
<tr>
<td>AI</td>
<td>
  <img src="https://img.shields.io/badge/Groq-Llama_3.3_70B-F54B2A?style=flat" />
</td>
<td>Natural language explanation generation</td>
</tr>
<tr>
<td>Database</td>
<td>
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white" />
</td>
<td>Prediction history, hosted PostgreSQL</td>
</tr>
<tr>
<td>Serving</td>
<td>
  <img src="https://img.shields.io/badge/Nginx-009639?style=flat&logo=nginx&logoColor=white" />
</td>
<td>Static files + API reverse proxy</td>
</tr>
<tr>
<td>DevOps</td>
<td>
  <img src="https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat&logo=githubactions&logoColor=white" />
  <img src="https://img.shields.io/badge/AWS_EC2-FF9900?style=flat&logo=amazonaws&logoColor=white" />
</td>
<td>Containers, CI/CD, cloud hosting</td>
</tr>
</table>

---

## ⚙️ How It Works

```
Step 1 — 🖊️  User fills the flight form
              airline · source_city · destination_city · class
              stops · departure_time · arrival_time · duration · days_left
                │
Step 2 — ✅  FastAPI validates & encodes input
              Pydantic schema → pandas DataFrame → label encoding
                │
Step 3 — 🌲  Random Forest predicts price
              optimized 18MB .pkl model → predicted_price (INR)
                │
Step 4 — 📊  SHAP calculates feature importance
              TreeExplainer → shap_values → per-feature ₹ impact (signed)
                │
Step 5 — 🤖  Groq LLM writes the explanation
              SHAP values + flight context → Llama 3.3 70B prompt
              → natural language paragraph streamed to frontend
                │
Step 6 — 🗄️  Prediction logged to Supabase
              full input + predicted_price + timestamp → PostgreSQL row
                │
Step 7 — 🎨  Frontend renders everything
              animated price card + confidence range
              SHAP horizontal bar chart with ₹ labels inside bars
              typewriter-animated AI explanation with GROQ badge
              history table with sparkline trend column
```

---

## 🌐 API Reference

### `POST /predict`

Predict flight price from input features.

```bash
curl -X POST http://54.84.17.86/predict \
  -H "Content-Type: application/json" \
  -d '{
    "airline": "Indigo",
    "source_city": "Delhi",
    "destination_city": "Mumbai",
    "departure_time": "Morning",
    "arrival_time": "Afternoon",
    "stops": "zero",
    "class": "Economy",
    "duration": 2,
    "days_left": 15
  }'
```

```json
{
  "predicted_price": 3081,
  "currency": "INR"
}
```

---

### `POST /explain`

Predict price + compute SHAP values + generate Groq AI explanation.

> Same request body as `/predict`.

```json
{
  "predicted_price": 3081,
  "currency": "INR",
  "feature_importance": {
    "days_left": -1240,
    "class": 850,
    "stops": 620,
    "duration": 410,
    "airline": -180,
    "departure_time": 95,
    "arrival_time": -60
  },
  "ai_explanation": "This Indigo Economy flight from Delhi to Mumbai is priced at ₹3,081, which is relatively affordable. Booking 15 days ahead saves you ₹1,240 compared to last-minute prices. Choosing a non-stop route keeps costs low, while the short 2-hour duration avoids fuel surcharges..."
}
```

---

### `GET /history`

Returns the last 20 predictions from Supabase.

```bash
curl http://54.84.17.86/history
```

### `GET /health`

```bash
curl http://54.84.17.86/health
# → {"status": "ok", "model_loaded": true}
```

---

**Endpoint summary:**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/predict` | `POST` | Price prediction only (~50ms) |
| `/explain` | `POST` | Prediction + SHAP + Groq AI (~3–6s) |
| `/history` | `GET` | Last 20 predictions from Supabase |
| `/health` | `GET` | Service health check |

**Accepted values for enum fields:**

| Field | Options |
|-------|---------|
| `airline` | `AirAsia` `Air_India` `GO_FIRST` `Indigo` `SpiceJet` `Vistara` |
| `source_city` / `destination_city` | `Delhi` `Mumbai` `Bangalore` `Kolkata` `Hyderabad` `Chennai` |
| `departure_time` / `arrival_time` | `Morning` `Afternoon` `Evening` `Night` `Early_Morning` `Late_Night` |
| `stops` | `zero` `one` `two_or_more` |
| `class` | `Economy` `Business` |

---

## 🚀 Quick Start

### 🐳 Docker (Recommended)

```bash
# 1. Clone
git clone https://github.com/SHAIKH-AKBAR-ALI/flight-predictor-v2.git
cd flight-predictor-v2

# 2. Add environment variables
cp backend/.env.example backend/.env
#    → edit backend/.env with your keys (see Environment Variables below)

# 3. Add model file
#    → place model_artifacts_v2.pkl in data/

# 4. Launch
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |

---

### 💻 Local Development

**Backend**

```bash
cd backend

python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

pip install -r requirements.txt

# Copy and fill environment variables
cp .env.example .env

uvicorn app.main:app --reload --port 8000
```

**Frontend** (in a separate terminal)

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
# Vite automatically proxies /predict /explain /history /health → :8000
```

---

## 📁 Project Structure

```
flight-predictor-v2/
│
├── 📂 backend/
│   ├── 📂 app/
│   │   ├── main.py                  # FastAPI app entry point + CORS
│   │   ├── 📂 models/
│   │   │   └── schemas.py           # Pydantic input/output schemas
│   │   ├── 📂 routes/
│   │   │   ├── predict.py           # POST /predict
│   │   │   ├── explain.py           # POST /explain (SHAP + Groq)
│   │   │   ├── history.py           # GET  /history
│   │   │   └── health.py            # GET  /health
│   │   └── 📂 services/
│   │       ├── ml_service.py        # Model load + inference
│   │       ├── groq_service.py      # Llama 3.3 70B via Groq SDK
│   │       └── supabase_service.py  # PostgreSQL via Supabase client
│   ├── requirements.txt
│   └── Dockerfile
│
├── 📂 frontend/
│   ├── 📂 src/
│   │   ├── 📂 components/
│   │   │   ├── Navbar.jsx           # Sticky top bar + GitHub link
│   │   │   ├── HeroSection.jsx      # Animated hero + floating particles
│   │   │   ├── PredictionForm.jsx   # Flight details form + route visual
│   │   │   ├── ResultCard.jsx       # Price + confidence range bar
│   │   │   ├── SHAPChart.jsx        # Horizontal bar chart with ₹ labels
│   │   │   ├── AIExplanation.jsx    # Typewriter text + GROQ badge
│   │   │   └── HistoryTable.jsx     # Table + sparkline trend column
│   │   ├── App.jsx                  # Root component + API calls
│   │   ├── main.jsx
│   │   └── index.css                # Glassmorphism + gradient utilities
│   ├── nginx.conf                   # API proxy + SPA fallback routing
│   ├── vite.config.js
│   └── Dockerfile                   # Multi-stage: node build → nginx serve
│
├── 📂 data/                         # ⚠️ gitignored — add manually
│   ├── model_artifacts_v2.pkl       # 18MB trained Random Forest
│   └── Indian Airlines.csv          # 300K+ training records
│
├── 📂 .github/workflows/
│   └── deploy.yml                   # Full CI/CD pipeline
│
├── docker-compose.yml               # Orchestrates backend + frontend
├── .gitignore
└── README.md
```

---

## 🔐 Environment Variables

Create `backend/.env`:

```env
# ML Model path (Docker overrides this to /app/data/model_artifacts_v2.pkl)
MODEL_PATH=../data/model_artifacts_v2.pkl

# Groq API — https://console.groq.com/keys
GROQ_API_KEY=gsk_...

# Supabase — https://supabase.com/dashboard/project/_/settings/api
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIs...
```

| Variable | Required | Where to get it |
|----------|----------|-----------------|
| `MODEL_PATH` | ✅ | Path to `.pkl` model file |
| `GROQ_API_KEY` | ✅ | [console.groq.com](https://console.groq.com/keys) — free tier available |
| `SUPABASE_URL` | ✅ | Supabase project → Settings → API |
| `SUPABASE_KEY` | ✅ | Supabase project → Settings → API (anon key) |

> ⚠️ **Never commit `.env` to git.** It's in `.gitignore` already.

---

## 🔄 CI/CD Pipeline

Every push to `main` triggers the full automated pipeline:

```
git push origin main
        │
        ▼
┌───────────────────────────────────────────────────────┐
│           GitHub Actions  (deploy.yml)                │
│                                                       │
│  ┌──────────────────────────────────────────────┐    │
│  │  JOB 1: test                                 │    │
│  │  ✓ Setup Python 3.11                         │    │
│  │  ✓ pip install -r backend/requirements.txt   │    │
│  │  ✓ Import all app modules (smoke test)        │    │
│  └──────────────────────────┬───────────────────┘    │
│                             │ needs: test             │
│  ┌──────────────────────────▼───────────────────┐    │
│  │  JOB 2: deploy                               │    │
│  │  ✓ docker/login-action → Docker Hub          │    │
│  │  ✓ Build + push backend image (:latest)      │    │
│  │  ✓ Build + push frontend image (:latest)     │    │
│  │  ✓ SSH to EC2                                │    │
│  │    → docker pull backend + frontend          │    │
│  │    → docker compose up -d                    │    │
│  └──────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────┘
```

**Add these secrets to your repo** (`Settings → Secrets and variables → Actions`):

| Secret | Value |
|--------|-------|
| `DOCKER_USERNAME` | Your Docker Hub username |
| `DOCKER_PASSWORD` | Docker Hub access token (not password) |
| `EC2_HOST` | EC2 public IP or elastic IP |
| `EC2_USERNAME` | `ubuntu` or `ec2-user` |
| `EC2_SSH_KEY` | Full content of your `.pem` private key |

---

## 🤝 Contributing

All contributions are welcome — bug fixes, new features, better ML models, UI improvements.

```bash
# 1. Fork the repo on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/flight-predictor-v2.git
cd flight-predictor-v2

# 3. Create a feature branch
git checkout -b feature/your-feature-name

# 4. Make changes, then commit
git add .
git commit -m "feat: describe what you added"

# 5. Push and open a PR
git push origin feature/your-feature-name
```

**Ideas for contributions:**

- 🧪 Unit tests for `ml_service.py` and API routes
- 🛫 Add more airlines / international routes
- 📅 Historical price calendar view
- 🌙 Price prediction by time-of-day heatmap
- 📦 Model versioning and A/B testing support

---

## 👤 Author

<div align="center">

<br/>

[![LinkedIn](https://img.shields.io/badge/Shaikh%20Akbar%20Ali-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/shaikh-akbar-ali-a5b44128b)
&nbsp;
[![GitHub](https://img.shields.io/badge/SHAIKH--AKBAR--ALI-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/SHAIKH-AKBAR-ALI)

<br/>

*Built with ❤️, Python, React, and too much caffeine.*

</div>

---

## 📄 License

```
MIT License

Copyright (c) 2025 Shaikh Akbar Ali

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software.
```

---

<div align="center">

**If this project helped you, consider leaving a ⭐ — it means a lot!**

[![Star](https://img.shields.io/github/stars/SHAIKH-AKBAR-ALI/flight-predictor-v2?style=social)](https://github.com/SHAIKH-AKBAR-ALI/flight-predictor-v2)
&nbsp;
[![Follow](https://img.shields.io/github/followers/SHAIKH-AKBAR-ALI?style=social)](https://github.com/SHAIKH-AKBAR-ALI)

</div>
