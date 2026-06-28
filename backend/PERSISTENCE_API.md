# Persistence API Contract

Use this contract for the UiPath Studio Web API Project that sits between the BPMN process and the Node.js backend.

## Base URL

Local backend default:

```txt
http://localhost:4000
```

If you want `http://localhost:3000`, set `PORT=3000` in `backend/.env` before starting the backend.

UiPath Cloud cannot call your local `localhost`. Use a tunnel or deploy the backend before binding these endpoints in Studio Web.

## Endpoints

### Create Certification Case

```txt
POST /api/persistence/certification-case
```

Body:

```json
{
  "learnerId": 1,
  "courseId": 2,
  "examDate": "2026-08-01"
}
```

### Check Existing Case / Plan

```txt
GET /api/persistence/certification-case?learnerId=1&certificationId=2
```

Response:

```json
{
  "certificationCase": {},
  "existingPlan": true
}
```

### Save Learning Plan

```txt
POST /api/persistence/learning-plan
```

Body:

```json
{
  "caseId": 1,
  "learningPath": {}
}
```

### Save Study Plan

```txt
POST /api/persistence/study-plan
```

Body:

```json
{
  "caseId": 1,
  "studyPlan": {}
}
```

### Save Assessment

```txt
POST /api/persistence/assessment
```

Body:

```json
{
  "caseId": 1,
  "assessmentResult": {}
}
```

### Save Risk Evaluation

```txt
POST /api/persistence/risk
```

Body:

```json
{
  "caseId": 1,
  "riskEvaluation": {}
}
```

### Save Coaching Plan / Update Study Plan

```txt
POST /api/persistence/coaching-plan
```

Body:

```json
{
  "caseId": 1,
  "coachingPlan": {}
}
```

Compatibility endpoint:

```txt
PUT /api/persistence/study-plan/{caseId}
```

Body:

```json
{
  "coachingPlan": {}
}
```
