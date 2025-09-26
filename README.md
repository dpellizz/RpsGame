# RpsGame

Rock–paper–scissors as a full-stack sample: a minimal ASP.NET Core API backed by PostgreSQL, a React frontend, and helper scripts for quick testing.

## Project structure

| Path | Description |
| --- | --- |
| `RpsGame.Api/` | Minimal API (.NET 9) exposing play/history endpoints and persisting results. |
| `RpsGame.React/` | Vite + React client that plays the game from the browser. |
| `scripts/` | `curl`-based helpers to hit the API from the terminal. |
| `docker-compose.yml` | Orchestrates API, frontend, and PostgreSQL containers. |

## Requirements

- .NET SDK 9.0 (preview)
- Node.js 20+ and npm (for the React app)
- Docker & docker-compose (optional, for containerized runs)

## Backend API (`RpsGame.Api`)

### Configuration

The API will look for a PostgreSQL connection string in the following order:

1. `ConnectionStrings:Default` in `appsettings.json` / `appsettings.Development.json`
2. Environment variable `ConnectionStrings__Default`
3. Environment variable `DATABASE_URL`

Example connection string:

```text
Host=localhost;Port=5432;Database=rps_game;Username=postgres;Password=postgres
```

Allowed origins for CORS are controlled through the `AllowedOrigins` array in `appsettings.json`. Update this list (or override via configuration) to permit additional frontends.

### Run locally

```bash
dotnet restore
dotnet run --project RpsGame.Api
```

This exposes the API at `http://localhost:8080` by default.

### CLI helpers

With the API running you can exercise the endpoints from the root of the repo:

```bash
# Play a round (POST /api/game/play)
./scripts/play.sh rock

# View history (GET /api/game/history)
./scripts/history.sh

# Clear history (DELETE /api/game/history)
./scripts/reset-history.sh
```

Point the scripts at another host if necessary:

```bash
API_BASE=http://localhost:8080 ./scripts/play.sh scissors
API_BASE=http://localhost:8080 ./scripts/history.sh
API_BASE=http://localhost:8080 ./scripts/reset-history.sh
```

### Endpoints

- `POST /api/game/play` – Records a game result.
- `GET /api/game/history` – Lists results (newest first).
- `DELETE /api/game/history` – Clears all results.

Swagger UI is available at `/swagger` when the app is running.

## Frontend (`RpsGame.React`)

### Setup & development server

```bash
cd RpsGame.React
npm install
VITE_API_BASE_URL=http://localhost:8080 npm run dev
```

The dev server listens on `http://localhost:5173` and proxies requests to the API URL defined by `VITE_API_BASE_URL`. (If the variable is omitted it falls back to `http://localhost:5198`.)

### Production build preview

```bash
npm run build
npm run preview
```

The solution file (`RpsGame.sln`) includes `RpsGame.React` so the frontend opens alongside the API in IDEs that understand solution files.

## Docker & docker-compose

Bring up the full stack with PostgreSQL:

```bash
docker-compose up --build
```

Services are published to:

- API → <http://localhost:8080>
- Frontend → <http://localhost:5173>
- PostgreSQL → `localhost:5432` (via the `postgres` service)

Environment variables in `docker-compose.yml` control connectivity. The frontend uses `VITE_API_BASE_URL` (set to `http://localhost:8080` so the browser can reach the API), while the API receives `ConnectionStrings__Default` pointing at the bundled database service.

Useful variations:

- Start only PostgreSQL: `docker-compose up postgres`
- Rebuild a single service: `docker-compose up --build api`
- Tear everything down: `docker-compose down`

To run only the API container against an external database:

```bash
docker build -t rps-game-api .
docker run -p 8080:8080 \
  -e ConnectionStrings__Default="Host=my-db;Port=5432;Database=rps_game;Username=postgres;Password=postgres" \
  rps-game-api
```

## Troubleshooting

- **Failed to fetch in the frontend** – ensure `VITE_API_BASE_URL` is reachable from the browser. When running in Docker, the compose file already points at `http://localhost:8080`.
- **CORS errors** – add your frontend origin to `AllowedOrigins` or override via environment configuration.
- **Preview package warnings** – the API currently uses .NET 9 preview packages. Keep an eye on release notes and update once stable versions are available.
