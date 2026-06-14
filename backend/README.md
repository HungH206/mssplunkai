# CertOps Backend

Express API for the CertOps dashboard. The React app should call this API instead of connecting directly to Azure SQL.

## Setup

1. Run `database/agent_tables.sql` in Azure SQL Query Editor.
2. Run `database/agent_seed.sql` in Azure SQL Query Editor.
3. Copy `.env.example` to `.env`.
4. Fill in the Azure SQL values in `.env`.
5. Optionally set `GEMINI_API_KEY` and `GEMINI_MODEL`. If they are empty, the agent endpoints return deterministic demo output.

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

POST /api/plans/learning/generate
POST /api/plans/study/generate
POST /api/assessments/generate
GET  /api/insights
```
