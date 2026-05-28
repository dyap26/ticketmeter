# TicketMeter 🎫

**Find the best time to buy event tickets.** TicketMeter tracks resale prices across SeatGeek, Ticketmaster, and GameTime, predicts when prices will be cheapest, and alerts you the moment a deal appears — so you never overpay again.

> TicketMeter never handles purchases. It shows you where to buy and redirects you there.

---

## Features

- **When-to-Buy Meter** — A scored gauge (0 = Buy Now, 100 = Wait) driven by days-until-event curves, event magnitude (pre-season vs. playoffs vs. championship), performer/team popularity, win streaks, and news sentiment
- **Price graphs** — Historical price trend + a predicted future price line up to the event date, with the optimal buy window highlighted
- **Multi-platform price comparison** — SeatGeek, Ticketmaster, and GameTime prices side-by-side, sorted cheapest-first, with direct buy links
- **Smart alerts** — Get notified when:
  - A new all-time low price appears
  - A flash sale drops prices 15%+ in a single hour
  - Last-minute tickets become available (24h, 2h, 30min before start)
- **Location-aware home feed** — Events near you, radius-adjustable, filterable by sports or concerts
- **Search** — Find any event, team, or artist
- **User accounts** — Save events to track, set a target price, manage notification preferences
- **Track teams & artists** — Follow your favorites so their events surface first
- **Mobile & desktop** — Responsive layout with a bottom nav bar on mobile

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Charts | Recharts |
| State | Zustand |
| Backend | FastAPI (Python 3.11+) |
| ORM | SQLAlchemy 2.0 |
| Database | SQLite (dev) · PostgreSQL (prod) |
| Auth | JWT — httpOnly cookie tokens |
| Scheduler | APScheduler (price polling every 60 min) |
| Push | Web Push API (VAPID) via pywebpush |
| Email | Resend |
| News | NewsAPI.org + BeautifulSoup fallback |

---

## Project Structure

```
ticketmeter/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app + CORS + lifespan
│   │   ├── config.py               # Settings (pydantic-settings)
│   │   ├── database.py             # SQLAlchemy engine + session
│   │   ├── deps.py                 # JWT auth dependency injection
│   │   ├── models/                 # SQLAlchemy ORM models
│   │   ├── schemas/                # Pydantic request/response schemas
│   │   ├── routers/                # API route handlers
│   │   │   ├── auth.py             # /api/v1/auth
│   │   │   ├── events.py           # /api/v1/events
│   │   │   ├── users.py            # /api/v1/users/me
│   │   │   └── notifications.py    # /api/v1/notifications
│   │   ├── services/
│   │   │   ├── ticket_apis.py      # SeatGeek + Ticketmaster adapters (+ mock data)
│   │   │   ├── price_prediction.py # When-to-Buy heuristic engine
│   │   │   ├── news_scraper.py     # NewsAPI + sentiment scoring
│   │   │   └── notification_service.py  # Web Push + email dispatch
│   │   └── tasks/
│   │       ├── scheduler.py        # APScheduler setup
│   │       └── price_poller.py     # Hourly price fetch + alert triggers
│   ├── alembic/                    # DB migrations
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/                    # Typed axios API client
│   │   ├── components/
│   │   │   ├── events/             # EventCard, EventFilters
│   │   │   ├── tickets/            # BuyMeter, PriceGraph, PlatformLinks, PriceSnapshot
│   │   │   ├── layout/             # Navbar, BottomNav
│   │   │   └── search/             # SearchBar
│   │   ├── pages/                  # Home, EventDetail, Search, Settings, Login, Register, Notifications
│   │   ├── store/                  # Zustand stores (auth, location, notifications)
│   │   ├── hooks/                  # useGeolocation, useEventPrices, usePushNotifications
│   │   └── utils/formatters.ts     # Price, date, score formatting
│   ├── .env.example
│   └── Dockerfile
├── docker-compose.yml
├── start-dev.ps1                   # Windows quick-start script
└── .gitignore
```

---

## Getting Started

### Prerequisites

- **Python 3.11+**
- **Node.js 20+**
- *(Optional)* Docker + Docker Compose for the full stack with PostgreSQL + Redis

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd ticketmeter
```

### 2. Backend setup

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env          # edit as needed
python -m uvicorn app.main:app --reload
```

The API will be available at **http://localhost:8000**.
Interactive docs at **http://localhost:8000/docs**.

> The default `.env` uses `USE_MOCK_DATA=true` and SQLite — no external services needed.

### 3. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env.local    # edit if needed
npm run dev
```

The app will be available at **http://localhost:5173**.

### 4. Windows quick-start (both at once)

```powershell
cd ticketmeter
.\start-dev.ps1
```

### 5. Docker Compose (full stack with PostgreSQL + Redis)

```bash
docker-compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | SQLAlchemy DB URL | `sqlite:///./ticketmeter.db` |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379/0` |
| `SECRET_KEY` | JWT signing secret — **change in prod** | dev key |
| `USE_MOCK_DATA` | `true` to use built-in mock events | `true` |
| `SEATGEEK_CLIENT_ID` | SeatGeek API client ID | *(empty)* |
| `SEATGEEK_SECRET` | SeatGeek API secret | *(empty)* |
| `TICKETMASTER_API_KEY` | Ticketmaster Discovery API key | *(empty)* |
| `NEWSAPI_KEY` | NewsAPI.org API key | *(empty)* |
| `RESEND_API_KEY` | Resend email API key | *(empty)* |
| `VAPID_PUBLIC_KEY` | Web Push VAPID public key | *(empty)* |
| `VAPID_PRIVATE_KEY` | Web Push VAPID private key | *(empty)* |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|---|---|
| `VITE_VAPID_PUBLIC_KEY` | Must match `VAPID_PUBLIC_KEY` in backend |

---

## Connecting Real APIs

All external services degrade gracefully to mock data when keys are absent. To enable live data:

1. **SeatGeek** — [Register at platform.seatgeek.com](https://platform.seatgeek.com) → set `SEATGEEK_CLIENT_ID` + `SEATGEEK_SECRET`
2. **Ticketmaster** — [developer.ticketmaster.com](https://developer.ticketmaster.com) → set `TICKETMASTER_API_KEY`
3. **NewsAPI** — [newsapi.org](https://newsapi.org) free tier → set `NEWSAPI_KEY`
4. **Resend** (email) — [resend.com](https://resend.com) → set `RESEND_API_KEY`
5. **Web Push** — Generate VAPID keys:
   ```bash
   pip install pywebpush
   python -c "from py_vapid import Vapid; v=Vapid(); v.generate_keys(); print('Public:', v.public_key); print('Private:', v.private_key)"
   ```
6. Set `USE_MOCK_DATA=false` in `backend/.env`

---

## How the When-to-Buy Score Works

The score (0–100) is calculated per-event in `backend/app/services/price_prediction.py`:

```
0         ← Buy Now (prices rising or event is soon)
30–65     ← Neutral (stable, monitor)
100       ← Wait (prices expected to drop)
```

**Inputs:**
| Signal | Effect |
|---|---|
| Days until event | Base curve — prices typically dip at 60–90 days, spike inside 2 weeks |
| Event magnitude | Championship → prices surge late; pre-season → more day-of drops |
| Entity popularity | More popular = less likely to drop |
| Win streak / recent form | Hot teams drive demand up → buy sooner |
| News sentiment | Positive press (new album, playoff push) → buy sooner |
| Listing count trend | Shrinking supply → buy sooner |
| 7-day price trend | Already rising → buy sooner |

A **ML layer** (GradientBoostingRegressor) is planned after ~3 months of real price data collection and will be swapped in via `price_prediction.py` once confidence exceeds the heuristic baseline.

---

## API Reference

Base URL: `http://localhost:8000/api/v1`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Create account |
| `POST` | `/auth/login` | Login → sets cookie tokens |
| `POST` | `/auth/logout` | Clear auth cookies |
| `GET` | `/events?lat=&lon=&radius_miles=&q=&category=` | List/search events |
| `GET` | `/events/{id}` | Event detail + current prices |
| `GET` | `/events/{id}/price-history` | Historical + predicted price series |
| `GET` | `/events/{id}/prediction` | When-to-Buy score + reasoning |
| `GET` | `/events/{id}/buy-links` | Buy links per platform, cheapest first |
| `GET` | `/events/{id}/news` | Related news articles |
| `GET` | `/users/me` | Current user profile |
| `PATCH` | `/users/me` | Update location / notification prefs |
| `GET` | `/users/me/tracked` | Saved events |
| `POST` | `/users/me/tracked` | Save an event |
| `DELETE` | `/users/me/tracked/{event_id}` | Remove saved event |
| `GET` | `/notifications/` | Notification history |
| `PATCH` | `/notifications/{id}/read` | Mark notification read |

Full interactive docs: **http://localhost:8000/docs**

---

## Roadmap

- [ ] Real SeatGeek / Ticketmaster data integration (set `USE_MOCK_DATA=false`)
- [ ] Geocoding city search (convert city name → lat/lon)
- [ ] PWA service worker for offline support + push on mobile
- [ ] ML price prediction model (GradientBoostingRegressor, after 3 months of data)
- [ ] "Similar events" recommendations on event detail page
- [ ] Calendar export (add event to Google/Apple Calendar)
- [ ] Social share — share a deal with friends
