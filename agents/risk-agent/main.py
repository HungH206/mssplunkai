from __future__ import annotations

from datetime import date, datetime, timezone
from typing import Any

from pydantic import BaseModel, Field


class Input(BaseModel):
    learnerId: str
    certificationId: str
    certificationName: str
    learnerProfile: dict[str, Any] = Field(default_factory=dict)
    assessmentResult: dict[str, Any]
    studyPlan: dict[str, Any]


class Output(BaseModel):
    learnerId: str
    certificationId: str
    riskEvaluation: dict[str, Any]
    generatedAt: str


def _num(value: Any, default: float) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _days_until(value: Any) -> int:
    try:
        return (date.fromisoformat(str(value)[:10]) - datetime.now(timezone.utc).date()).days
    except ValueError:
        return 21


def main(input_data: Input) -> Output:
    assessment = input_data.assessmentResult
    study_plan = input_data.studyPlan
    readiness = max(0, min(100, _num(assessment.get("overallReadinessScore"), 60)))
    pass_probability = max(0, min(100, _num(assessment.get("estimatedPassProbability"), 55)))
    daily_hours = _num(study_plan.get("dailyStudyHours"), 1)
    days_remaining = _days_until(study_plan.get("targetExamDate"))
    weaknesses = assessment.get("weaknesses") or []

    plan_gap = 0
    factors = []
    if readiness < 65:
        factors.append({"factor": "Low readiness score", "severity": "high", "detail": f"Overall readiness is {readiness:.1f}%."})
    elif readiness < 75:
        factors.append({"factor": "Moderate readiness score", "severity": "medium", "detail": f"Overall readiness is {readiness:.1f}%."})

    if pass_probability < 65:
        factors.append({"factor": "Low pass probability", "severity": "high", "detail": f"Estimated pass probability is {pass_probability:.1f}%."})

    if daily_hours < 1:
        plan_gap += 60
        factors.append({"factor": "Insufficient study time", "severity": "medium", "detail": "Daily study time is below 1 hour."})
    if days_remaining < 14:
        plan_gap += 40
        factors.append({"factor": "Unrealistic exam date", "severity": "medium", "detail": "Target exam date is less than 14 days away."})
    if len(weaknesses) >= 3:
        factors.append({"factor": "Multiple weak topics", "severity": "medium", "detail": f"{len(weaknesses)} weak topic areas require targeted practice."})

    plan_risk = min(100, plan_gap)
    risk_score = round(((100 - readiness) * 0.4) + ((100 - pass_probability) * 0.35) + (plan_risk * 0.25), 1)
    risk_level = "high" if risk_score >= 50 else "low"
    readiness_level = str(assessment.get("readinessLevel") or "").lower()
    is_ready = risk_level == "low" and (readiness_level == "ready" or (readiness_level == "partially-ready" and risk_score < 40))

    suggestions = [
        "Complete targeted practice on weak topics before reassessment.",
        "Schedule a manager or mentor checkpoint to review blockers.",
    ]
    if daily_hours < 1:
        suggestions.append("Increase daily study time to at least 1 hour.")
    if days_remaining < 14:
        suggestions.append("Move the target exam date out by at least one week.")

    summary = (
        f"The learner is classified as {risk_level} risk with a risk score of {risk_score}. "
        f"Readiness is {readiness:.1f}% and pass probability is {pass_probability:.1f}%. "
        f"{'Manager review is recommended before completion.' if not is_ready else 'The learner can proceed toward completion.'}"
    )

    return Output(
        learnerId=input_data.learnerId,
        certificationId=input_data.certificationId,
        riskEvaluation={
            "riskLevel": risk_level,
            "riskScore": risk_score,
            "isReady": is_ready,
            "riskFactors": factors,
            "mitigationSuggestions": suggestions[:4],
            "summary": summary,
        },
        generatedAt=datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    )
