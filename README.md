# CertFlow

CertFlow is an enterprise-ready agentic certification case management platform. It helps organizations manage employee certification programs with AI-powered planning, assessment, risk analysis, and human-in-the-loop approvals.

The platform combines AI agents, workflow orchestration, case management, analytics, and human oversight to improve certification success rates while giving managers visibility into workforce readiness.

## Problem Statement

Organizations invest heavily in employee certifications, compliance training, and workforce development programs, but managing certification readiness at scale is difficult.

Common challenges include:

- Employees do not know what to study.
- Study plans are not personalized to workload.
- Managers lack visibility into certification readiness.
- High-risk learners are identified too late.
- Certification processes rely on spreadsheets and manual tracking.
- There is no structured workflow for intervention and approval.

CertFlow addresses these challenges through agentic case management and workflow orchestration.

## Solution Overview

Each employee certification journey becomes a managed case. AI agents collaborate to:

- Create personalized learning paths.
- Generate workload-aware study plans.
- Assess readiness through AI-generated evaluations.
- Predict certification risk.
- Escalate cases requiring manager intervention.
- Provide leadership analytics through dashboards.

The platform keeps humans involved at critical decision points while automating repetitive planning and assessment tasks.

## Architecture

```txt
Employee
  |
  v
Certification Case  (CertificationCases + vw_CertificationCases)
  |
  v
Case Orchestrator
  |
  |-- Learning Agent        (Express API + UiPath coded agent)
  |-- Study Planner Agent
  |-- Assessment Agent
  |-- Risk / Insights Agent
  `-- Manager Review
  |
  v
Azure SQL Database
  |
  v
Power BI Analytics
```

The platform offers two complementary execution paths for the agents:

- **In-process agents** in the Express backend (`backend/src/agents`), used by the React dashboard for fast, interactive generation.
- **UiPath coded agents** in `agents/` (LangGraph + UiPath Python SDK), used when the same logic is orchestrated by UiPath Maestro, Orchestrator, or a BPMN process.

## Core Features

### Certification Case Management

Every learner is tracked through a certification case. Cases evolve over time instead of following a static workflow.

Cases are persisted in the `CertificationCases` table and surfaced through the `vw_CertificationCases` SQL view, which joins learner, team, course, and progress data into a single record.

Tracked case data includes:

- Employee and team
- Certification target (course, provider, level)
- Progress and readiness score
- Current stage (Intake, Learning, Manager Review, Intervention, Certified)
- Risk level
- Manager / approval status

A case advances through stages automatically based on readiness and status, while still requiring a manager to approve key transitions.

### Learning Path Agent

Generates a certification roadmap.

Inputs:

- Employee role
- Certification target
- Skill history

Outputs:

- Required skills
- Learning objectives
- Recommended resources
- Estimated study effort

Example:

```txt
Certification: AZ-204

Required Skills:
- Azure Functions
- Storage Accounts
- Event Grid
- Monitoring
```

The learning path logic is available both as an Express endpoint and as a standalone UiPath coded agent (see [UiPath Learning Agent](#uipath-learning-agent)).

### Study Planner Agent

Creates personalized study schedules.

Inputs:

- Meeting load
- Focus hours
- Certification complexity
- Exam date

Outputs:

- Weekly study plan
- Milestones
- Learning checkpoints

Example:

```txt
Week 1: Azure Functions
Week 2: Storage
Week 3: Monitoring
Week 4: Practice Assessment
```

### Assessment Agent

Evaluates certification readiness.

Inputs:

- Certification objectives
- Study progress
- Historical performance

Outputs:

- Practice questions
- Readiness score
- Improvement recommendations

Example:

```txt
Readiness Score: 78%

Recommendation:
Focus on Azure Storage and Monitoring.
```

### Risk & Insights Agent

Identifies learners at risk of failing and powers leadership analytics.

Inputs:

- Study progress
- Assessment scores
- Remaining time
- Historical performance

Outputs:

- Risk level
- Predicted pass probability
- Intervention recommendations
- Aggregate insights for the executive dashboard

Example:

```txt
Risk Level: High
Pass Probability: 54%

Recommendation:
Delay exam by 2 weeks.
```

### Human-in-the-Loop Review

Managers remain responsible for important decisions.

Approval actions include:

- Approve exam readiness
- Delay exam
- Assign additional training
- Escalate for coaching

This ensures accountability while leveraging AI recommendations.

### Executive Dashboard

Power BI provides organization-wide insights.

Metrics include:

- Team readiness score
- Certification pipeline
- At-risk employees
- Predicted pass rate
- Learning progress
- Certification completion trends

## Technology Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS, shadcn/ui |
| Backend | Node.js, Express |
| Database | Azure SQL Database (`mssql` driver) |
| In-process AI | Gemini API, agent-based orchestration |
| Coded agents | UiPath Python SDK, LangGraph |
| Analytics | Power BI |
| Workflow orchestration | UiPath Maestro Case, UiPath Automation Cloud |

## Project Structure

```txt
.
|-- Certopsaidashboarddesign/   # React/Vite frontend dashboard
|-- backend/                    # Express API and in-process agent endpoints
|   `-- src/
|       |-- agents/             # learningAgent, plannerAgent, assessmentAgent, insightsAgent
|       |-- routes/             # teams, learners, courses, assignments, cases, plans, assessments, insights
|       |-- services/           # sql.js (Azure SQL), gemini.js (LLM)
|       `-- server.js           # Express app entry point
|-- agents/                     # UiPath coded agents (LangGraph + UiPath Python SDK)
|   `-- learning-agent/         # CertFlow Learning Agent
|-- database/                   # Azure SQL schema, views, and seed scripts
`-- README.md                   # Project overview
```

## Database

The schema is split into ordered scripts so base tables, agent tables, and the case view can be applied independently.

| Script | Purpose |
| --- | --- |
| `database/base_tables.sql` | Core tables: Teams, Learners, CertificateCourses, LearnerCourses |
| `database/agent_tables.sql` | Agent output tables (LearningPlans, etc.) and CertificationCases; requires base tables first |
| `database/case_view.sql` | `vw_CertificationCases` view joining learner, team, course, and progress data |
| `database/agent_seed.sql` | Sample seed data |
| `database/setup.sql` | Convenience script that creates the full base schema |
| `database/diagnostics.sql` | Read-only checks for verifying the schema |

Run them in Azure SQL Query Editor (or `sqlcmd`) in this order:

```txt
database/base_tables.sql
database/agent_tables.sql
database/case_view.sql
database/agent_seed.sql
```

## Getting Started

### Prerequisites

- Node.js and npm
- Azure SQL Database
- UiPath Automation Cloud (for the coded agent, labs, and agent monitoring)
- Python 3.11 (only required for the UiPath coded agent)
- Optional: Gemini API key

### Database

Apply the SQL scripts in the order shown in the [Database](#database) section.

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run check
npm run dev
```

Fill in the Azure SQL settings in `backend/.env`. If `GEMINI_API_KEY` and `GEMINI_MODEL` are empty, the agent endpoints return deterministic demo output.

By default, the backend runs at:

```txt
http://localhost:4000
```

### Frontend

```bash
cd Certopsaidashboarddesign
npm install
npm run dev
```

By default, the Vite frontend runs at:

```txt
http://localhost:5173
```

## UiPath Learning Agent

`agents/learning-agent` is a UiPath coded Python agent (LangGraph + UiPath Python SDK) that generates a certification learning path from a CertFlow BPMN or Maestro workflow. It mirrors the in-process Learning Agent so the same logic can run inside UiPath orchestration.

Input contract:

```json
{
  "learnerId": 1,
  "courseId": 1,
  "learnerName": "Avery Nguyen",
  "role": "Cloud Engineer",
  "certificationTarget": "Azure Administrator Associate",
  "provider": "Microsoft",
  "level": "Intermediate",
  "durationWeeks": 4,
  "skillHistory": ["Core platform concepts"]
}
```

It returns a `learningPath` object (required skills, weekly modules, estimated hours, checkpoints) and hands off to the `study-planner-agent`.

Local setup:

```bash
cd agents/learning-agent
python3.11 -m venv .venv
source .venv/bin/activate
pip install -e .
uipath auth
uipath init
uipath run agent '{"learnerId":1,"courseId":1,"certificationTarget":"Azure Administrator Associate","level":"Intermediate","durationWeeks":4}'
```

Publish to UiPath so Maestro, Orchestrator, the CLI, or a BPMN process can invoke it:

```bash
uipath pack
uipath publish --my-workspace
```

See `agents/learning-agent/README.md` for the full Studio Web and publishing workflow.

## API Endpoints

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

POST /api/plans/learning/generate
POST /api/plans/study/generate
GET  /api/plans/study

POST /api/assessments/generate
GET  /api/assessments

GET  /api/insights
```

## Validation

Run the backend syntax check before starting the API:

```bash
cd backend
npm run check
```

## License

MIT License
