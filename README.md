# Nirvan: Autonomous A2A Talent Marketplace

Nirvan is an Agent-to-Agent (A2A) hiring marketplace where candidate and recruiter agents can match, negotiate compensation and work preferences, support human steering via a Co-Pilot dock, and book interviews automatically.

This repository contains the complete codebase, including:
* [`Nirvan/backend/`](Nirvan/backend/) — FastAPI backend, LangGraph agents, Supabase database bindings, background task scheduling, Google Calendar integration, and Resend notification dispatches.
* [`Nirvan/frontend/`](Nirvan/frontend/) — Next.js 16 frontend app, role-based route proxy guards, user onboarding, candidate/recruiter dashboards, real-time WebSockets playback room, and Google OAuth flow.

---

## 🛠️ 1. Project Directory Layout

```text
Nirvana/
├── Nirvan/
│   ├── backend/        # FastAPI python server
│   ├── frontend/       # Next.js frontend client
│   └── docs/           # Architecture diagrams, specifications, & roadmap
├── Nirvan.pdf          # Project concept pitch deck
├── .gitignore          # Root Git Ignore configuration
└── README.md           # This startup & operations guide
```

---

## ⚙️ 2. Environment Configurations

Make sure to configure the environment variables in both sub-directories before running:

### Backend Configuration (`Nirvan/backend/.env`)
Create a `.env` file inside `Nirvan/backend/` and populate these values:
```bash
OPENAI_API_KEY=sk-...                     # Your OpenAI API key
NEXT_PUBLIC_SUPABASE_URL=https://...      # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=...         # Your Supabase anon key
SUPABASE_SERVICE_ROLE_KEY=...             # Your Supabase service role key

FRONTEND_BASE_URL=http://localhost:3000
CORS_ALLOW_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Set to true to bypass session check issues during local testing
ALLOW_DEV_AUTH_BYPASS=true
USE_CELERY=false

# Resend Email Configuration
RESEND_API_KEY=re_...
SENDER_EMAIL=notifications@yourdomain.com

# Gmail SMTP Configuration (Optional fallback for mail notifications)
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Frontend Configuration (`Nirvan/frontend/.env.local`)
Create a `.env.local` file inside `Nirvan/frontend/` and populate these values:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://...      # Same Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=...         # Same Supabase anon key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🚀 3. Startup & Execution Instructions

Follow these instructions in separate terminals:

### A. Run the Backend API (Port `8000`)
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd Nirvan/backend
   ```
2. Activate your python virtual environment:
   ```powershell
   # Windows PowerShell:
   .\venv\Scripts\activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the server:
   ```bash
   python -m uvicorn main:app --reload --port 8000
   ```
   * *Note: Using `python -m uvicorn` avoids launcher errors related to hardcoded python interpreter paths on Windows.*
   * Confirm the backend is live by opening `http://localhost:8000/health` in your browser.

### B. Run the Frontend Client (Port `3000`)
1. Open a second terminal and navigate to the frontend folder:
   ```bash
   cd Nirvan/frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:3000`.

---

## 🔒 4. Setting up Google Sign-In (OAuth)

To enable the **Sign in with Google** button on the login page:

1. **Supabase Setup**:
   * Go to your **Supabase Dashboard** ➔ **Authentication** ➔ **Providers** ➔ **Google**.
   * Toggle to **Enabled**.
   * Enter your Google Client ID and Client Secret.
   * Copy the **Redirect URL** (e.g. `https://<your-project>.supabase.co/auth/v1/callback`).
2. **Google Cloud Console Setup**:
   * Go to **APIs & Services** ➔ **Credentials** in the **Google Cloud Console**.
   * Edit your OAuth Client ID and add the Supabase redirect URL to the **Authorized redirect URIs** list.
   * Save the changes.
3. First-time Google OAuth sign-ups will be automatically routed to the `/profile` onboarding page to select their Name and Role (Candidate vs Recruiter) before landing on their settings page.

---

## 🛠️ 5. Troubleshooting Common Issues

#### 1. "No module named uvicorn" or "uvicorn not found"
Ensure you have activated your virtual environment (`.\venv\Scripts\activate`) and successfully run `pip install -r requirements.txt`.

#### 2. "Fatal error in launcher: Unable to create process"
Always prefix uvicorn with python to bypass Windows command launcher restrictions:
```powershell
python -m uvicorn main:app --reload --port 8000
```

#### 3. Supabase Auth Rate Limits
If your teammates hit a "Rate limit exceeded" error during signup:
* **Option A**: Disable email confirmation in Supabase Dashboard (Authentication ➔ Providers ➔ Email ➔ Toggle off **Confirm email**). This allows immediate login using only correct passwords.
* **Option B**: Adjust rate limits under Settings ➔ Auth ➔ **Rate Limits** in the Supabase console.

---

## 📤 6. Git Push workflow

To commit and push updates to the repository:

1. Stage your changes:
   ```bash
   git add .
   ```
2. Commit your changes:
   ```bash
   git commit -m "Commit description"
   ```
3. Push to GitHub:
   ```bash
   git push origin main
   ```
   *(The `.gitignore` is pre-configured to exclude virtual environments `venv` and `node_modules` while preserving required `.env` configurations).*
