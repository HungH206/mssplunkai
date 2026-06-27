# CertOps Backend

Express API for the CertOps dashboard. The React app should call this API instead of connecting directly to Azure SQL.

## Setup

1. Run `database/setup.sql` in Azure SQL Query Editor for a fresh or partially configured database.
2. Optionally run `database/diagnostics.sql` to verify the tables and view exist.
3. If you prefer manual setup, run `database/base_tables.sql`, `database/agent_tables.sql`, `database/agent_seed.sql`, then `database/case_view.sql`.
4. Copy `.env.example` to `.env`.
5. Fill in the Azure SQL values in `.env`.
6. Optionally set `GEMINI_API_KEY` and `GEMINI_MODEL`. If they are empty, the agent endpoints return deterministic demo output.

## Commands

```bash
npm install
npm run check
npm run dev
```

## Endpoints

```txt
GET  /health

GET  /api/teams
POST /api/teams

GET  /api/learners
POST /api/learners

GET  /api/courses
POST /api/courses

GET  /api/assignments
POST /api/assignments

GET  /api/cases
POST /api/cases
POST /api/cases/:id/start

GET  /api/plans/study
POST /api/plans/learning/generate
POST /api/plans/study/generate

GET  /api/assessments
POST /api/assessments/generate

GET  /api/insights
```
