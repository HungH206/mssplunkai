from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, Field


class Input(BaseModel):
    learnerId: str
    certificationId: str
    certificationName: str
    learnerProfile: dict[str, Any] = Field(default_factory=dict)


class Output(BaseModel):
    learnerId: str
    certificationId: str
    learningPath: dict[str, Any]
    generatedAt: str


def _experience_level(profile: dict[str, Any]) -> str:
    return str(profile.get("experienceLevel") or "intermediate").lower()


def _module_hours(level: str) -> list[int]:
    if level == "beginner":
        return [4, 5, 5, 4, 3]
    if level == "advanced":
        return [2, 3, 4, 4]
    return [3, 4, 4, 3, 2]


def _skills(certification_name: str) -> list[str]:
    return [
        f"{certification_name} foundations",
        "Core service concepts",
        "Hands-on implementation",
        "Monitoring and troubleshooting",
        "Practice exam review",
    ]


def main(input_data: Input) -> Output:
    level = _experience_level(input_data.learnerProfile)
    skills = _skills(input_data.certificationName)
    hours = _module_hours(level)

    modules = []
    for index, skill in enumerate(skills[: len(hours)], start=1):
        modules.append(
            {
                "moduleId": f"M{index:02d}",
                "title": f"Module {index}: {skill}",
                "description": f"Build practical readiness in {skill.lower()} for {input_data.certificationName}.",
                "estimatedHours": hours[index - 1],
                "resources": [
                    {"type": "documentation", "title": "Official certification guide", "priority": "high"},
                    {"type": "lab", "title": f"Hands-on practice for {skill}", "priority": "high"},
                    {"type": "practice-exam", "title": f"Knowledge check: {skill}", "priority": "medium"},
                ],
            }
        )

    total_hours = sum(module["estimatedHours"] for module in modules)
    completion_days = max(14, round(total_hours / 1.5))

    return Output(
        learnerId=input_data.learnerId,
        certificationId=input_data.certificationId,
        learningPath={
            "title": f"Learning Path for {input_data.certificationName}",
            "totalModules": len(modules),
            "estimatedTotalHours": total_hours,
            "estimatedCompletionDays": completion_days,
            "modules": modules,
            "keySkillsTargeted": skills[: len(modules)],
        },
        generatedAt=datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    )
