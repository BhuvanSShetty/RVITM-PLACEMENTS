<p align="center">
  <img src="assets/logo.png" alt="RVITM Placements Logo" width="180" />
</p>

<h1 align="center">RVITM Placements — Placement Portal & VTU Result System</h1>

<p align="center">
  <strong>Automate VTU result scraping with CAPTCHA bypass, extract placement notices with AI, manage placement drives with Google Calendar sync, and empower students with instant marks lookup — automatically.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/AI-Google%20Gemini%202.5-4285F4?style=for-the-badge&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/Scraper-Python%20%2B%20FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/Automation-WhatsApp%20Baileys-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" />
</p>

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Our Solution](#our-solution)
3. [System Architecture](#system-architecture)
4. [OCR + AI Pipeline](#ocr--ai-pipeline)
5. [Tech Stack](#tech-stack)
6. [Project Structure](#project-structure)
7. [Database Schema](#database-schema)
8. [Features](#features)
9. [Service Usage Guide](#service-usage-guide)
10. [API Reference](#api-reference)
11. [Maintenance & Operations](#maintenance--operations)
12. [Getting Started](#getting-started)
13. [Environment Variables](#environment-variables)

---

## Problem Statement

Managing campus recruitment drives and university exam evaluations is painful when:

- **Manual CAPTCHA Solving** — VTU result portals require manual entry of distorted CAPTCHAs for hundreds of students, making bulk evaluation painfully slow
- **Noisy & Scattered Notices** — Placement announcements in WhatsApp groups get buried in casual chatter, causing students to miss registration deadlines and test dates
- **Complex Result Calculations** — Manually calculating credit-weighted semester SGPA, cumulative CGPA, and tracking revaluation upgrades leads to human error
- **Scheduling Conflicts & Desynchronization** — Coordinators must manually create and update calendar invites across multiple batches, leading to missed assessment rounds

> **Result:** Wasted hours for coordinators, missed recruitment opportunities for students, and error-prone tracking of academic performance.

---

## Our Solution

**RVITM Placements** automates the entire flow — from scraping to placement scheduling:

| Step | What Happens |
|------|-------------|
| **WhatsApp Intake** | WhatsApp bot listens to placement community messages and filters recruitment updates from casual noise |
| **AI Parsing** | Google Gemini (2.5 Flash) structures unstructured notices into JSON — company, activity, dates, stipend, CTC, criteria, and links |
| **Calendar Sync** | Extracted drives are automatically synced with Google Calendar and organized into an interactive Calendar of Events (COE) |
| **OCR Scan** | VTU CAPTCHAs are preprocessed with OpenCV and solved with Tesseract OCR without manual input |
| **Bulk Scraping** | Automates batch scraping of student results by USN range, calculates SGPA/CGPA, and compares revaluation marks |
| **Student & SPC Portal** | Clean web portal with institutional Google SSO (`@rvei.edu.in`), interactive calendar filters, and marks registries |

---

## System Architecture

```
  WhatsApp Community            VTU Results Portal
        │                               │
        ▼ (Baileys)                     ▼ (OpenCV + Tesseract OCR)
  ┌───────────────┐              ┌────────────────────────┐
  │ WhatsApp Bot  │              │ Scraper Service        │
  │ (Node.js)     │              │ (FastAPI + Python)     │
  └───────┬───────┘              └───────────┬────────────┘
          │                                  │
          ▼ (Gemini AI)                      ▼
  Structured Drive JSON             Student Records (SGPA/CGPA)
          │                                  │
          └─────────────┬────────────────────┘
                        ▼
            ┌────────────────────────┐
            │   Express.js API       │◀────────┐
            │   (Node.js Port 5000)  │         │
            └───────────┬────────────┘         │
                        │                      │ REST API
         ┌──────────────┴──────────────┐       │
         ▼                             ▼       │
   ┌───────────┐                ┌──────────────┴─────────┐
   │  MongoDB  │                │ React 18 + Vite Portal │
   │  Database │                │ (Student & SPC UI)     │
   └───────────┘                └────────────────────────┘
         │
         ▼
  Google Calendar API
  (Real-Time Sync)
```

---

## OCR + AI Pipeline

### Step 1: Image Preprocessing (OpenCV)

The CAPTCHA image downloaded from the VTU results portal is processed with **OpenCV** before character recognition to maximize bypass accuracy:

| Operation | Purpose |
|-----------|---------|
| Grayscale Conversion | Remove background color artifacts |
| Thresholding | Convert to high-contrast binary black & white |
| Morphological Noise Filtering | Erode and dilate to eliminate background grid lines |
| Sharpening & Rescaling | Enhance character edges for OCR engine |

### Step 2: Text Extraction (Tesseract OCR)

The cleaned CAPTCHA image is passed to the Tesseract OCR engine with an alphanumeric whitelist, solving the CAPTCHA instantly and fetching the student's result HTML page.

### Step 3: Message Gatekeeping & Deduplication

Incoming WhatsApp announcements pass through strict heuristic filtering before AI parsing:

- Keyword scoring filters out casual messages, queries, and conversational noise
- Preserves Gemini API quota by only processing recruitment notifications
- Canonical deduplication skips reposts and identifies update notices (e.g., promoting `TBD` dates to confirmed drive schedules)

### Step 4: AI Structuring (Google Gemini 2.5 Flash)

The cleaned message text is passed to Google Gemini 2.5 Flash, which parses the unstructured text into a validated JSON array:

```json
[
  {
    "title": "Google – Online Assessment",
    "type": "exams",
    "mode": "online",
    "location": "rvitm",
    "studentType": "BE",
    "date": "2026-10-15",
    "subtypes": ["OA"],
    "desc": "• Role: Software Development Engineer\n• CTC: 28 LPA\n• Eligibility: 7.5+ CGPA, no active backlogs\n• Registration Deadline: 12th Oct 11:59 PM\n• Link: https://forms.gle/sample"
  }
]
```

### Full Pipeline Flow

```
  WhatsApp Announcement               VTU Portal Page
          │                                  │
          ▼                                  ▼
  ┌───────────────────────┐          ┌───────────────────────┐
  │ Filter & Gatekeeper   │          │ OpenCV Preprocessing  │
  │ Keyword scoring       │          │ Grayscale + Threshold │
  └───────────┬───────────┘          └───────────┬───────────┘
              ▼                                  ▼
  ┌───────────────────────┐          ┌───────────────────────┐
  │ Gemini 2.5 Flash      │          │ Tesseract OCR Engine  │
  │ Raw text → JSON Array │          │ CAPTCHA Bypass        │
  └───────────┬───────────┘          └───────────┬───────────┘
              ▼                                  ▼
  ┌───────────────────────┐          ┌───────────────────────┐
  │ Deduplication & Merge │          │ Credit & CGPA Engine  │
  │ TBD → Confirmed Date  │          │ Revaluation Comparison│
  └───────────┬───────────┘          └───────────┬───────────┘
              │                                  │
              └─────────────────┬────────────────┘
                                ▼
                       MongoDB Database &
                      Google Calendar Sync
```

---

## Tech Stack

### Backend

| Technology | Purpose |
|------------|---------|
| **Node.js 22** | Modern ESM runtime |
| **Express 5** | REST API framework |
| **MongoDB Native Driver** | Scalable document storage |
| **Google Gemini 2.5 Flash** | AI-driven placement announcement parser |
| **Google APIs (`googleapis`)** | Two-way Google Calendar synchronization via Service Account |
| **node-cron** | Scheduled background tasks & server keep-alive pinging |
| **jsonwebtoken & bcryptjs** | SPC Admin authentication and password hashing |

### Scraper Service

| Technology | Purpose |
|------------|---------|
| **Python 3.11** | High-performance scraper runtime |
| **FastAPI & Uvicorn** | Asynchronous scraper service API |
| **OpenCV (`cv2`)** | Computer vision CAPTCHA image processing |
| **Tesseract OCR** | Optical character recognition |
| **BeautifulSoup4** | HTML scraping & table parsing |
| **Pandas & OpenPyXL** | Formatted multi-sheet Excel report generation |

### WhatsApp Bot

| Technology | Purpose |
|------------|---------|
| **Node.js** | Bot execution environment |
| **@whiskeysockets/baileys** | Multi-device WhatsApp Web WebSocket protocol |
| **QR Code Terminal** | Terminal-based WhatsApp Web pairing |
| **Pino** | Lightweight high-speed logging |

### Frontend

| Technology | Purpose |
|------------|---------|
| **React 18** | Component-driven UI framework |
| **Vite** | Blazing fast build tooling & dev server |
| **React Router 6** | Client-side routing and view transitions |
| **Google Identity Services** | Institutional Google OAuth 2.0 Sign-In (`@rvei.edu.in`) |
| **Vanilla CSS** | Premium custom design system with dark aesthetics |

---

## Project Structure

```
RVITM-PLACEMENTS/
├── README.md
├── docker-compose.yml          # Multi-container orchestration
├── assets/
│   └── logo.png                # Project logo
│
├── backend/
│   ├── src/
│   │   ├── config/             # MongoDB database connection pool
│   │   ├── controllers/        # Route controllers (auth, events, results, parse)
│   │   ├── middleware/         # Admin JWT verification guard
│   │   ├── routes/             # Express API endpoints
│   │   └── services/           # Gemini AI parser, Google Calendar sync, SGPA calc
│   ├── scripts/                # Password hash generators
│   ├── server.js               # Express application entry point
│   └── package.json
│
├── scraper-service/
│   ├── src/
│   │   ├── captcha.py          # OpenCV CAPTCHA filter + Tesseract OCR
│   │   ├── scraper.py          # VTU result fetcher & HTML parser
│   │   ├── batch_runner.py     # Batch USN scraper queue & retry logic
│   │   ├── calculator.py       # VTU credit scheme SGPA & CGPA engine
│   │   ├── exporter.py         # Multi-sheet Excel workbook generator
│   │   └── database.py         # Result storage & revaluation comparison
│   ├── main.py                 # FastAPI service endpoints
│   ├── run.py                  # Interactive CLI scraper
│   └── requirements.txt
│
├── whatsapp-bot/
│   ├── bot.js                  # Baileys WhatsApp client & message listener
│   ├── filter.js               # Keyword scoring and noise gatekeeper
│   ├── reconciler.js           # Deduplication & TBD date promotion
│   ├── gemini-parser.js        # Gemini AI extractor integration
│   └── test-cli.js             # Standalone CLI testing utility
│
└── frontend/
    ├── public/
    │   └── favicon.png         # Portal favicon
    ├── scraper/
    │   └── index.html          # Scraper Admin Web Dashboard entry
    └── src/
        ├── components/         # Calendar grid, modals, filters, and cards
        ├── config/             # Auth config & spreadsheet URL configuration
        ├── hooks/              # Data fetching, auth, and filter hooks
        ├── pages/              # Home, Calendar, CSE Marks, ECE Marks, SPC Panel
        ├── services/           # Backend API client & Google Auth services
        ├── App.jsx             # Main router & layout controller
        ├── main.jsx            # React app entry point
        └── main.js             # Scraper dashboard logic
```

---

## Database Schema

The system uses MongoDB to store academic result records and placement drive calendar events.

```mermaid
erDiagram
    results {
        ObjectId id PK
        string usn UK
        string name
        int semester
        object subjects
        number sgpa
        number cgpa
        object sgpa_map
        timestamp last_updated
    }

    subjects {
        string code
        string name
        int ia
        int ea
        int total
        string status
        int credits
        int semester
    }

    calendar_events {
        string id PK
        string title
        string type
        string mode
        string location
        string studentType
        string date
        array subtypes
        string desc
        string googleCalendarEventId
        timestamp createdAt
        timestamp updatedAt
    }

    results ||--o{ subjects : "contains"
```

---

## Features

### Authentication & Access Control
- **Institutional Google SSO** — Restricts access strictly to verified institutional Google accounts (`@rvei.edu.in` and whitelisted domains)
- **SPC Coordinator Gate** — Password-protected coordinator panel with JWT authentication for creating, editing, and deleting recruitment drives
- **Persistent Sessions** — Verified sessions persist securely in `localStorage` for 30 days without requiring repetitive sign-ins

### Placement Calendar of Events (COE)
- **Interactive Calendar** — Month and list view of upcoming recruitment activities, assessments, and interviews
- **Multi-Category Filters** — Real-time filtering by drive type (Drive, PPT, Assessment, Interview), location (RVITM, RVCE, Worksite), and mode (Online, Offline)
- **Google Calendar Sync** — Two-way integration that adds, updates, and formats calendar entries with clean bulleted summaries

### WhatsApp Placement Bot & AI Extraction
- **Zero-Cost Baileys Connection** — Connects via WhatsApp Web multi-device protocol without expensive third-party messaging APIs
- **Intelligent Gatekeeper** — Uses score-based heuristics to ignore conversational chat and target actual recruitment notices
- **AI-Powered Event Extraction** — Google Gemini 2.5 Flash extracts multi-activity timelines, compensation, criteria, and forms into discrete events
- **Automatic Date Promotion** — Upgrades tentative `TBD` drives to confirmed dates when organizers issue schedule updates

### VTU Result Scraping & Analytics
- **Automated CAPTCHA Solver** — Computer vision pipeline cleans VTU CAPTCHAs and reads characters with Tesseract OCR
- **Batch Scraping Engine** — Scrapes large USN batches (e.g., `1RF23CS001` to `1RF23CS200`) with automatic retries
- **SGPA & CGPA Calculation** — Built-in credit database calculates semester-wise and cumulative grade point averages
- **Revaluation Diff Tracker** — Detects updated marks from revaluation results and updates records only when marks increase
- **Excel Report Exporter** — Generates `.xlsx` workbooks containing summary stats, detailed subject tables, semester tabs, and topper rankings

---

## Service Usage Guide

### 1. Scraper Service (How to Use the Scraper)

The scraper can be used through **two distinct methods**: the **Web Dashboard** or the **Interactive CLI**.

#### Option A: Web Scraper Dashboard (Recommended)
1. Open your browser and navigate to **[http://localhost/scraper](http://localhost/scraper)** (or `http://localhost:5173/scraper` in local development).
2. Go to the **Scrape** tab:
   - **VTU Result URL:** Enter the direct URL of the VTU exam result announcement (e.g., `https://results.vtu.ac.in/D25J26Ecbcs/index.php`).
   - **College Code:** Enter the 3-character college code (e.g., `1RF`).
   - **Year:** Enter the 2-digit admission year (e.g., `23` for 2023 batch).
   - **Branch:** Select or type the branch code (`CS`, `IS`, `EC`, `ME`).
   - **Roll Range:** Set the starting and ending roll numbers (e.g., `1` to `200`).
   - **Revaluation Mode Toggle:** Turn ON if scraping revaluation results (ensures only improved marks overwrite existing records).
3. Click **Start Scraping**.
4. Observe the real-time progress bar, solved CAPTCHA count, and live colored terminal log.
5. Once complete, click **Download Excel Report** to save a multi-sheet `.xlsx` summary with topper highlights and subject analytics.
6. Use the **Results**, **Find**, and **Leaderboard** tabs to inspect student records directly on screen.

#### Option B: Interactive CLI Scraper
If you prefer running the scraper in a terminal or headless server:
```bash
cd scraper-service
python run.py
```
1. Follow the interactive prompts:
   - Paste the VTU result URL.
   - Enter college code (`1RF`), year (`23`), and branch (`CS`).
   - Specify the roll number range.
   - Choose whether revaluation mode is active (`y/n`).
2. The CLI will automatically solve CAPTCHAs, retry failed USNs in second/third passes, insert student records into MongoDB, and generate an Excel report in `scraper-service/exports/`.

---

### 2. Backend Service (Express ESM API)

The backend acts as the central data and integration hub.

- **Port:** `5000`
- **Starting locally:**
  ```bash
  cd backend
  npm install
  npm run dev
  ```
- **Admin Password Setup:** Generate a bcrypt password hash for the Student Placement Coordinator (SPC) panel:
  ```bash
  cd backend
  node scripts/generate-hash.js "your_strong_admin_password"
  ```
  Copy the generated `$2b$10$...` hash into `backend/.env` under `ADMIN_PW_HASH`.
- **Server Keep-Alive Cron:** The backend includes a built-in `node-cron` scheduled job running every 5 minutes (`*/5 * * * *`) that pings its `/health` endpoint to eliminate cold starts on hosting providers.

---

### 3. WhatsApp Placement Bot

The bot connects directly to WhatsApp Web to automate placement drive extraction.

#### Running in Discovery Mode:
```bash
cd whatsapp-bot
npm install
npm start
```
1. A QR code will display in the terminal.
2. Open WhatsApp on your smartphone $\to$ **Settings** $\to$ **Linked Devices** $\to$ **Link a Device** $\to$ scan the terminal QR code.
3. With `ALLOWED_GROUPS=*`, the bot runs in discovery mode and prints the JID and name of every group it observes.
4. Set `ALLOWED_GROUPS="Placement Group Name,120363389271@g.us"` in `whatsapp-bot/.env` to restrict the bot to your official placement community.

#### Testing Without WhatsApp (CLI Test):
To verify that notice parsing and deduplication are working without sending WhatsApp messages:
```bash
cd whatsapp-bot
# Dry-run test of a sample notice:
npm run test:cli

# Test a custom announcement text:
node test-cli.js "Placement Drive: Microsoft India. SDE-1. CTC: 44 LPA. OA on 25th October. Deadline: 20th Oct."

# Directly execute and post test events into the calendar:
node test-cli.js --execute
```

#### Bot Reaction Status Codes:
- `⏳` — Message received and identified as a placement notice; AI parsing started.
- `📅` — Successfully parsed and published as a new event in the COE & Google Calendar.
- `🔄` — Updated an existing event (e.g., promoted a tentative `TBD` date to a confirmed schedule).
- `🔁` — Detected an exact duplicate or reminder message; skipped without polluting the database.

---

### 4. Frontend Portal (React 18 + Vite)

The frontend provides the public student registry and the SPC coordinator workspace.

- **Port:** `80` (Docker) or `5173` (Vite dev)
- **Starting locally:**
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
- **Student Flow:**
  - Login via Google Account Picker (`@rvei.edu.in` domain required).
  - Search any USN on the home screen to view marks, SGPA breakdown, and CGPA.
  - Access branch registries: `/cse` (Computer Science) and `/ece` (Electronics & Communication).
  - View `/calendar` for interactive calendar cards with filters for drive types and locations.
- **SPC Admin Flow:**
  - Click **Admin / SPC Login** in the header.
  - Enter the SPC password. Once verified, administrative controls are unlocked.
  - Create new recruitment drives, edit existing schedules, or paste raw WhatsApp text for instant Gemini AI parsing.

---

## API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth` | Public | Verify SPC Admin password and receive JWT token |
| `GET` | `/api/verify` | Public | Verify Google OAuth credentials and institutional domain |

### Calendar & Placement Events

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/events` | Public | Retrieve all placement calendar events |
| `HEAD` | `/api/events` | Public | Cache freshness check via `Last-Modified` header |
| `POST` | `/api/events` | Bearer Token | Create new placement drive event & sync to Google Calendar |
| `PUT` | `/api/events` | Bearer Token | Update existing placement event & sync edits |
| `DELETE` | `/api/events` | Bearer Token | Delete placement event and remove from Google Calendar |

### AI Notice Parsing

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/ai/parse` | Bearer Token | Extract structured placement events from raw message text |

### Student Academic Results

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/results/:usn` | Public | Fetch student result, subject marks, SGPA map, and CGPA |

### Scraper Service (Port 8000)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/scrape` | Public | Start asynchronous batch scraping job for given USN range |
| `GET` | `/status/{job_id}` | Public | Check batch scraping progress and live logs |
| `GET` | `/results` | Public | Query scraped student results from database |
| `GET` | `/export` | Public | Download compiled multi-sheet Excel report |

---

## Maintenance & Operations

### 1. Updating VTU Result URLs for New Semesters
When VTU publishes results for a new semester or examination cycle:
1. Copy the exact index URL from the VTU portal (e.g., `https://results.vtu.ac.in/NEW_CYCLE/index.php`).
2. Paste it into the **VTU Result URL** field in the Scraper Dashboard or CLI.
3. To update the preconfigured URL queue list in the Scraper Dashboard, edit the `#input-queue-urls` textarea inside [frontend/scraper/index.html](file:///Users/bhuvansshetty/Desktop/RVITM%20PLACEMENTS/frontend/scraper/index.html) (or [frontend/src/main.js](file:///Users/bhuvansshetty/Desktop/RVITM%20PLACEMENTS/frontend/src/main.js)).

### 2. Updating Subject Credit Schemes (SGPA/CGPA Calculations)
VTU periodically updates subject codes and credit weights across schemes (2018, 2021, 2022 schemes).
- **Backend SGPA Engine:** Subject credits are defined in `SUBJECT_CREDITS` within [backend/src/services/resultsService.js](file:///Users/bhuvansshetty/Desktop/RVITM%20PLACEMENTS/backend/src/services/resultsService.js).
- **Scraper Python Engine:** Subject credits are defined in `SUBJECT_CREDITS` within [scraper-service/src/calculator.py](file:///Users/bhuvansshetty/Desktop/RVITM%20PLACEMENTS/scraper-service/src/calculator.py).
- To add new subjects, simply append the subject code and credit value:
  ```javascript
  "BCS701": 4, "BCS702": 4, "BCSL703": 1
  ```

### 3. Maintaining WhatsApp Bot Authentication
- The bot stores WhatsApp multi-device authentication state in `whatsapp-bot/auth_session/`.
- In Docker, this is mounted as a persistent volume: `./whatsapp-bot/auth_session:/app/auth_session`.
- **If the session expires or gets unlinked:**
  1. Stop the bot container: `docker-compose stop whatsapp-bot`
  2. Remove old session keys: `rm -rf whatsapp-bot/auth_session/*`
  3. Start the bot: `docker-compose start whatsapp-bot`
  4. View logs and scan the new QR code: `docker logs -f vtu_whatsapp_bot`

### 4. Google Cloud OAuth & Calendar Credentials
- **Authorized JavaScript Origins:** In [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials), ensure your domain is added under your OAuth 2.0 Web Client ID:
  - `http://localhost`
  - `http://localhost:5173`
  - `https://your-production-domain.com`
- **Domain Gatekeeper:** Edit [frontend/src/config/auth.config.js](file:///Users/bhuvansshetty/Desktop/RVITM%20PLACEMENTS/frontend/src/config/auth.config.js) to adjust `ALLOWED_DOMAIN_REGEX` or add individual email addresses to `ALLOWED_EMAILS`.
- **Google Service Account:** If syncing to Google Calendar, ensure your target Google Calendar is shared with `GOOGLE_SERVICE_ACCOUNT_EMAIL` with permission **"Make changes to events"**.

### 5. MongoDB Backups & Indexing
- Backup your database:
  ```bash
  mongodump --uri="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/vtu_database" --out=backup/$(date +%F)
  ```
- Restore from backup:
  ```bash
  mongorestore --uri="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/vtu_database" backup/YYYY-MM-DD/vtu_database
  ```
- Indexes on `calendar_events.id` and `results.usn` are auto-ensured on server startup.

### 6. Docker Container Management
```bash
# View live status of all services
docker-compose ps

# Tail logs for a specific service (backend, frontend, scraper-service, whatsapp-bot)
docker-compose logs -f backend
docker-compose logs -f whatsapp-bot

# Restart a single service after making configuration changes
docker-compose restart backend

# Stop all services without losing MongoDB data
docker-compose down

# Stop and wipe all data volumes
docker-compose down -v
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+
- **Python** 3.11+ (with Tesseract OCR installed, if running locally without Docker)
- **Docker & Docker Compose** (Recommended for one-step deployment)
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- API key for [Google Gemini](https://aistudio.google.com/)
- [Google Cloud Service Account](https://console.cloud.google.com/) (Optional for Google Calendar sync)

### 1. Clone the Repository

```bash
git clone https://github.com/BhuvanSShetty/RVITM-PLACEMENTS.git
cd RVITM-PLACEMENTS
```

### 2. Configure Environment Variables

Create `.env` in the root directory (or individual `.env` files in `backend/`, `frontend/`, and `whatsapp-bot/`):

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp whatsapp-bot/.env.example whatsapp-bot/.env
```

### 3. Run with Docker Compose (Recommended)

```bash
docker-compose up -d --build
```

The stack will start:
- **Frontend Portal**: [http://localhost](http://localhost)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Scraper Service & Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **WhatsApp Bot**: Runs in background (check logs via `docker logs -f vtu_whatsapp_bot`)

### 4. Or Run Services Locally

#### Backend Setup:
```bash
cd backend
npm install
npm run dev
```

#### Frontend Setup:
```bash
cd frontend
npm install
npm run dev
```

#### Scraper Service Setup:
```bash
cd scraper-service
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

#### WhatsApp Bot Setup:
```bash
cd whatsapp-bot
npm install
npm start
```

---

## Environment Variables

### 1. Backend (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Backend API server port |
| `MONGO_URI` | — | MongoDB Atlas / local connection string |
| `DB_NAME` | `vtu_database` | MongoDB database name |
| `ADMIN_ID` | — | SPC Admin username (configured in `.env`) |
| `ADMIN_PW_HASH` | — | bcrypt hash of the SPC Admin password (generate with `node scripts/generate-hash.js`) |
| `JWT_SECRET` | — | Secret key for signing admin JWT tokens |
| `GEMINI_API_KEY` | — | Google Gemini API key for notice extraction |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | — | Google Cloud service account email for Calendar sync |
| `GOOGLE_PRIVATE_KEY` | — | Google Cloud service account private key (`"-----BEGIN PRIVATE KEY-----\n..."`) |
| `GOOGLE_CALENDAR_ID` | — | Target Google Calendar ID (`your_id@group.calendar.google.com`) |
| `PING_URL` | `http://localhost:5000/health` | URL used by internal keep-alive cron job |

### 2. Frontend (`frontend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | — | Backend API base URL (empty uses relative proxy via Vite/Nginx) |
| `VITE_GOOGLE_CLIENT_ID` | — | Google OAuth 2.0 Web Client ID from Google Cloud Console |
| `VITE_SHEET_BLACKLISTED_URL` | — | Debarred students Google Sheet link |
| `VITE_DRIVE_PLACEMENT_URL` | — | Central placement drive Google Drive folder link |
| `VITE_SHEET_STUDENTS_DB_URL` | — | Master student database spreadsheet link |
| `VITE_SHEET_PLACED_DATA_URL` | — | Placed students spreadsheet link |
| `VITE_SHEET_PLACED_DATA_EMBED_URL` | — | Embedded iframe URL for placed students data |

### 3. Scraper Service (`scraper-service/.env` or Docker env)

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGO_URI` | — | MongoDB connection string (same as backend) |
| `DB_NAME` | `vtu_database` | Target database for saving student results |
| `TESSERACT_PATH` | `/usr/bin/tesseract` | Absolute path to tesseract binary on host or container |
| `ADMIN_ID` | — | Admin username for scraper service endpoints |
| `ADMIN_PASSWORD` | — | Admin password for scraper service endpoints |
| `GEMINI_API_KEY` | — | Optional fallback Gemini API key |

### 4. WhatsApp Bot (`whatsapp-bot/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `API_BASE_URL` | `http://localhost:5000` | Backend API URL for posting parsed placement drives |
| `ALLOWED_GROUPS` | `*` | Comma-separated group names or JIDs (`*` runs in Discovery Mode) |
| `ENABLE_EMOJI_REACTIONS` | `true` | Toggle emoji reactions on messages (`⏳`, `📅`, `🔄`, `🔁`) |
| `GEMINI_API_KEY` | — | Google Gemini API key for notice extraction |
| `DRY_RUN` | `false` | When true, tests parsing without writing to the database |

---

<p align="center">
  <a>BUILT BY SPCS FOR SPCS , TEACHERS AND STUDENTS</a>
</p>
