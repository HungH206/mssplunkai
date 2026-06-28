from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from math import ceil
from typing import Any

from pydantic import BaseModel, Field


class Input(BaseModel):
    learnerId: str
    certificationId: str
    certificationName: str
    learnerProfile: dict[str, Any] = Field(default_factory=dict)
    learningPath: dict[str, Any]
    targetExamDate: str | None = None


class Output(BaseModel):
    learnerId: str
    certificationId: str
    studyPlan: dict[str, Any]
    generatedAt: str


def _today() -> date:
    return datetime.now(timezone.utc).date()


def _parse_date(value: str | None, fallback: date) -> date:
    if not value:
        return fallback
    try:
        return date.fromisoformat(value[:10])
    except ValueError:
        return fallback


def _module_title(module: dict[str, Any], index: int) -> str:
    return str(module.get("title") or f"Module {index}")


def main(input_data: Input) -> Output:
    start_date = _today()
    learning_path = input_data.learningPath
    modules = list(learning_path.get("modules") or [])
    estimated_days = int(learning_path.get("estimatedCompletionDays") or 21)
    total_hours = float(learning_path.get("estimatedTotalHours") or sum(float(m.get("estimatedHours") or 2) for m in modules) or 12)
    target_exam_date = _parse_date(input_data.targetExamDate, start_date + timedelta(days=estimated_days))

    available_study_days = max(1, ceil(max(1, (target_exam_date - start_date).days) * 5 / 7))
    daily_hours = round(max(0.5, total_hours / available_study_days), 1)
    week_count = max(1, ceil(max(1, (target_exam_date - start_date).days) / 7))

    weekly_milestones = []
    for week in range(1, week_count + 1):
        selected = [
            _module_title(module, idx)
            for idx, module in enumerate(modules, start=1)
            if (idx - 1) % week_count == (week - 1)
        ]
        if not selected and modules:
            selected = [_module_title(modules[min(week - 1, len(modules) - 1)], week)]
        weekly_milestones.append(
            {
                "week": week,
                "modulesToComplete": selected,
                "studyGoal": "Complete assigned modules and one knowledge check.",
                "estimatedHours": round(daily_hours * 5, 1),
            }
        )

    checkpoints = []
    for pct, readiness in [(0.33, 40), (0.66, 70), (0.9, 90)]:
        checkpoint_date = start_date + timedelta(days=max(1, round((target_exam_date - start_date).days * pct)))
        checkpoints.append(
            {
                "checkpointDate": checkpoint_date.isoformat(),
                "description": f"Validate {readiness}% readiness target with practice questions and review.",
                "readinessTarget": readiness,
            }
        )

    resources = []
    for module in modules:
        for resource in module.get("resources") or []:
            if isinstance(resource, dict):
                resources.append(
                    {
                        "type": str(resource.get("type") or "documentation"),
                        "title": str(resource.get("title") or "Certification resource"),
                        "url": str(resource.get("url") or ""),
                        "priority": str(resource.get("priority") or "medium"),
                    }
                )
            else:
                resources.append({"type": "documentation", "title": str(resource), "url": "", "priority": "medium"})

    return Output(
        learnerId=input_data.learnerId,
        certificationId=input_data.certificationId,
        studyPlan={
            "title": f"Personalized Study Plan for {input_data.certificationName}",
            "startDate": start_date.isoformat(),
            "targetExamDate": target_exam_date.isoformat(),
            "dailyStudyHours": daily_hours,
            "weeklyMilestones": weekly_milestones,
            "checkpoints": checkpoints,
            "recommendedResources": resources[:8],
        },
        generatedAt=datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    )
