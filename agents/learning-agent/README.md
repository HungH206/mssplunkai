# CertFlow Learning Agent

UiPath coded Python agent for generating a certification learning path from a CertFlow BPMN or Maestro workflow.

## Contract

Input:

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
  "skillHistory": ["Core platform concepts"],
  "bpmnContext": {
    "caseId": 101
  }
}
```

Output:

```json
{
  "learningPath": {
    "learnerId": 1,
    "courseId": 1,
    "certificationTarget": "Azure Administrator Associate",
    "requiredSkills": [],
    "modules": [],
    "estimatedHours": 12,
    "checkpoints": [],
    "nextAgent": "study-planner-agent"
  }
}
```

## Local Setup

```bash
cd agents/learning-agent
python3.11 -m venv .venv
source .venv/bin/activate
pip install -e .
uipath auth
uipath init
uipath run agent '{"learnerId":1,"courseId":1,"learnerName":"Avery Nguyen","certificationTarget":"Azure Administrator Associate","level":"Intermediate","durationWeeks":4,"skillHistory":["Core platform concepts"]}'
```

`uipath init` can regenerate `entry-points.json` and `bindings.json` after authentication.

## Studio Web

1. Create a coded Agent project in Studio Web.
2. Copy the project id into `.env` as `UIPATH_PROJECT_ID=<project-id>`.
3. Run `uipath push` from this folder.
4. Use the output `learningPath` as the payload for the Study Planner Agent step.

## Package And Publish

```bash
uipath pack
uipath publish --my-workspace
```

After publishing, the agent can be invoked by Maestro, Orchestrator, the UiPath CLI, or the BPMN process.
