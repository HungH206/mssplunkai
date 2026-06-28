from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from typing import Any

from pydantic import BaseModel, Field


class Input(BaseModel):
    learnerId: str
    certificationId: str
    certificationName: str
    learnerProfile: dict[str, Any] = Field(default_factory=dict)
    assessmentResult: dict[str, Any]
    studyPlan: dict[str, Any]
    riskEvaluation: dict[str, Any]
    managerFeedback: str | None = None


class Output(BaseModel):
    learnerId: str
    certificationId: str
    coachingPlan: dict[str, Any]
    generatedAt: str


def _parse_date(value: Any) -> date:
    try:
        return date.fromisoformat(str(value)[:10])
    except ValueError:
        return datetime.now(timezone.utc).date() + timedelta(days=21)


def main(input_data: Input) -> Output:
    today = datetime.now(timezone.utc).date()
    risk = input_data.riskEvaluation
    assessment = input_data.assessmentResult
    study_plan = input_data.studyPlan

    weaknesses = [str(item) for item in assessment.get("weaknesses") or []]
    risk_factors = [str(item.get("factor") or "Study risk") for item in risk.get("riskFactors") or [] if isinstance(item, dict)]
    focus = []
    if input_data.managerFeedback:
        focus.append("Manager feedback: " + input_data.managerFeedback[:120])
    focus.extend(weaknesses)
    focus.extend(risk_factors)
    focus = list(dict.fromkeys(focus))[:3] or ["Practice exam readiness", "Study consistency", "Hands-on reinforcement"]

    risk_score = float(risk.get("riskScore") or 50)
    added_weeks = 4 if risk_score >= 70 else 2 if risk_score >= 50 else 1
    multiplier = 1.5 if risk_score >= 70 else 1.3
    daily_hours = round(max(1.0, float(study_plan.get("dailyStudyHours") or 1) * multiplier), 1)
    original_exam_date = _parse_date(study_plan.get("targetExamDate"))
    revised_exam_date = original_exam_date + timedelta(weeks=added_weeks)

    actions = []
    for index, area in enumerate(focus, start=1):
        actions.append(
            {
                "action": f"Complete targeted coaching cycle for {area}.",
                "targetArea": area,
                "durationDays": 7 if index == 1 else 5,
                "priority": "high" if index == 1 else "medium",
            }
        )
    actions.append(
        {
            "action": "Complete one timed practice assessment and review missed questions with a mentor.",
            "targetArea": "Exam readiness",
            "durationDays": 3,
            "priority": "medium",
        }
    )

    revised_milestones = []
    for week in range(1, added_weeks + 1):
        area = focus[(week - 1) % len(focus)]
        revised_milestones.append(
            {
                "week": week,
                "focus": area,
                "activities": [
                    f"Review weak-topic notes for {area}",
                    "Complete hands-on practice or scenario drills",
                    "Finish a timed knowledge check and document misses",
                ],
                "estimatedHours": round(daily_hours * 5, 1),
            }
        )

    target_reassessment = today + timedelta(days=28 if len(actions) >= 4 or risk_score >= 70 else 14)

    return Output(
        learnerId=input_data.learnerId,
        certificationId=input_data.certificationId,
        coachingPlan={
            "title": f"Coaching Plan for {input_data.certificationName}",
            "coachingFocus": focus,
            "coachingActions": actions,
            "updatedStudyPlan": {
                "adjustedDailyStudyHours": daily_hours,
                "revisedTargetExamDate": revised_exam_date.isoformat(),
                "addedWeeks": added_weeks,
                "revisedMilestones": revised_milestones,
            },
            "targetReassessmentDate": target_reassessment.isoformat(),
            "successCriteria": "Achieve overall readiness score >= 75% and estimated pass probability >= 70% on reassessment.",
        },
        generatedAt=datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    )
