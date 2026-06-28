from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any
from typing_extensions import TypedDict

from langgraph.graph import END, START, StateGraph

try:
    from uipath.tracing import traced
except ImportError:
    def traced(*_args: Any, **_kwargs: Any):
        def decorator(func):
            return func

        return decorator


class LearningAgentState(TypedDict, total=False):
    learnerId: int
    courseId: int
    learnerName: str
    role: str
    certificationTarget: str
    provider: str
    level: str
    durationWeeks: int
    skillHistory: list[str]
    bpmnContext: dict[str, Any]
    learningPath: dict[str, Any]


@dataclass
class LearningModule:
    title: str
    objective: str
    estimatedHours: int
    resources: list[str] = field(default_factory=list)


@dataclass
class LearningPath:
    learnerId: int
    courseId: int
    certificationTarget: str
    requiredSkills: list[str]
    modules: list[LearningModule]
    estimatedHours: int
    checkpoints: list[str]
    nextAgent: str = "study-planner-agent"


def _as_int(value: Any, default: int) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def _certification_name(state: LearningAgentState) -> str:
    return (
        state.get("certificationTarget")
        or state.get("bpmnContext", {}).get("certificationTarget")
        or f"Course {state.get('courseId', 'Unknown')}"
    )


def _required_skills(state: LearningAgentState) -> list[str]:
    target = _certification_name(state)
    history = {skill.strip().lower() for skill in state.get("skillHistory", []) if skill.strip()}

    baseline = [
        f"{target} foundations",
        "Core platform concepts",
        "Hands-on implementation",
        "Monitoring and troubleshooting",
        "Practice assessment review",
    ]

    return [skill for skill in baseline if skill.lower() not in history][:5]


@traced(name="build_learning_path", run_type="uipath")
def build_learning_path(state: LearningAgentState) -> dict[str, Any]:
    learner_id = _as_int(state.get("learnerId"), 0)
    course_id = _as_int(state.get("courseId"), 0)
    duration_weeks = max(1, _as_int(state.get("durationWeeks"), 4))
    target = _certification_name(state)
    required_skills = _required_skills(state)

    weekly_hours = 4 if state.get("level", "").lower() in {"advanced", "expert"} else 3
    modules = [
        LearningModule(
            title=f"Week {index}: {skill}",
            objective=f"Build working knowledge of {skill.lower()} for {target}.",
            estimatedHours=weekly_hours,
            resources=[
                "Official certification learning path",
                "Hands-on lab or sandbox exercise",
                "Knowledge check questions",
            ],
        )
        for index, skill in enumerate(required_skills[:duration_weeks], start=1)
    ]

    if not modules:
        modules = [
            LearningModule(
                title=f"Week 1: {target} exam review",
                objective="Validate retained knowledge and close remaining gaps.",
                estimatedHours=weekly_hours,
                resources=["Practice assessment", "Exam objectives checklist"],
            )
        ]

    learning_path = LearningPath(
        learnerId=learner_id,
        courseId=course_id,
        certificationTarget=target,
        requiredSkills=required_skills,
        modules=modules,
        estimatedHours=sum(module.estimatedHours for module in modules),
        checkpoints=[
            "Manager confirms target certification",
            "Learner completes required skill modules",
            "Assessment Agent generates readiness evaluation",
        ],
    )

    return {"learningPath": asdict(learning_path)}


builder = StateGraph(LearningAgentState)
builder.add_node("build_learning_path", build_learning_path)
builder.add_edge(START, "build_learning_path")
builder.add_edge("build_learning_path", END)

graph = builder.compile()
