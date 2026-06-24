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
Certification Case
  |
  v
Case Orchestrator
  |
  |-- Learning Agent
  |-- Study Planner Agent
  |-- Assessment Agent
  |-- Risk Agent
  `-- Manager Review
  |
  v
Azure SQL Database
  |
  v
Power BI Analytics
```

## Core Features

### Certification Case Management

Every learner is tracked through a certification case. Cases evolve over time instead of following a static workflow.

Tracked case data includes:

- Employee
- Team
- Certification target
- Progress
- Readiness score
- Risk level
- Approval status

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

### Risk Agent

Identifies learners at risk of failing.

Inputs:

- Study progress
- Assessment scores
- Remaining time
- Historical performance

Outputs:

- Risk level
- Predicted pass probability
- Intervention recommendations

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
| Frontend | React, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| Database | Azure SQL Database |
| AI | Gemini API, agent-based orchestration |
| Analytics | Power BI |
| Workflow orchestration | UiPath Maestro Case, UiPath Automation Cloud |

## Project Structure

```txt
.
|-- Certopsaidashboarddesign/   # React/Vite frontend dashboard
|-- backend/                    # Express API and agent endpoints
|-- database/                   # Azure SQL schema and seed scripts
`-- README.md                   # Project overview
```

## Getting Started

### Prerequisites

- Node.js
- npm
- Azure SQL Database
- UIPath Cloud for Lab and Agent Monitoring
- Optional: Gemini API key

### Database

Run the SQL scripts in Azure SQL Query Editor:

```txt
database/agent_tables.sql
database/agent_seed.sql
```

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

POST /api/plans/learning/generate
POST /api/plans/study/generate
POST /api/assessments/generate
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