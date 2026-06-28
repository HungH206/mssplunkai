from __future__ import annotations

from datetime import datetime, timezone
from statistics import mean
from typing import Any

from pydantic import BaseModel, Field


class Input(BaseModel):
    learnerId: str
    certificationId: str
    certificationName: str
    learnerProfile: dict[str, Any] = Field(default_factory=dict)
    studyPlan: dict[str, Any]
    quizResults: list[dict[str, Any]] = Field(default_factory=list)


class Output(BaseModel):
    learnerId: str
    certificationId: str
    assessmentResult: dict[str, Any]
    generatedAt: str


def _score(value: Any, default: float) -> float:
    try:
        return max(0.0, min(100.0, float(value)))
    except (TypeError, ValueError):
        return default


def main(input_data: Input) -> Output:
    milestones = input_data.studyPlan.get("weeklyMilestones") or []
    checkpoints = input_data.studyPlan.get("checkpoints") or []
    quiz_scores = [_score(row.get("score"), 0) for row in input_data.quizResults if isinstance(row, dict)]

    base_score = 62.0
    if quiz_scores:
        base_score = mean(quiz_scores)
    elif checkpoints:
        base_score = mean(_score(item.get("readinessTarget"), 60) for item in checkpoints if isinstance(item, dict))

    experience = str(input_data.learnerProfile.get("experienceLevel") or "intermediate").lower()
    experience_bonus = {"beginner": -5, "intermediate": 0, "advanced": 5}.get(experience, 0)
    plan_bonus = min(8, len(milestones) * 1.5)
    overall = round(max(0, min(100, base_score + experience_bonus + plan_bonus)), 1)
    pass_probability = round(max(0, min(100, overall - 5 + (5 if quiz_scores else 0))), 1)

    readiness_level = "ready" if overall >= 80 else "partially-ready" if overall >= 65 else "not-ready"
    topics = []
    for index, milestone in enumerate(milestones[:5], start=1):
        title = ", ".join(milestone.get("modulesToComplete") or [f"Milestone {index}"])
        topic_score = round(max(0, min(100, overall - 8 + index * 3)), 1)
        topics.append({"topic": title, "score": topic_score})

    strengths = [item["topic"] for item in topics if item["score"] >= 75][:3]
    weaknesses = [item["topic"] for item in topics if item["score"] < 75][:3] or ["Practice exam consistency"]
    recommendations = [
        {"area": area, "action": "Complete targeted review, hands-on practice, and a timed knowledge check."}
        for area in weaknesses
    ]

    return Output(
        learnerId=input_data.learnerId,
        certificationId=input_data.certificationId,
        assessmentResult={
            "overallReadinessScore": overall,
            "readinessLevel": readiness_level,
            "topicScores": topics,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "recommendations": recommendations,
            "estimatedPassProbability": pass_probability,
        },
        generatedAt=datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    )
