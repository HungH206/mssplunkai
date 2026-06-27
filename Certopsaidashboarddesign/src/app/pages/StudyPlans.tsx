import { useEffect, useMemo, useState } from 'react';
import { Card, Button } from '@fluentui/react-components';
import {
  CheckmarkCircleRegular,
  CircleRegular,
  ClockRegular,
  BrainCircuitRegular,
} from '@fluentui/react-icons';
import { getStudyPlans, StudyPlan } from '../../services/api';

export function StudyPlans() {
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getStudyPlans()
      .then(setStudyPlans)
      .catch((apiError) => setError(apiError.message));
  }, []);

  const totalHours = useMemo(
    () =>
      studyPlans.reduce(
        (sum, plan) => sum + (plan.generated_plan.schedule ?? []).reduce((planSum, topic) => planSum + Number(topic.hours || 0), 0),
        0,
      ),
    [studyPlans],
  );

  const topicLabel = (count: number) => `${count} ${count === 1 ? 'topic' : 'topics'}`;

  const topicStatus = (planProgress: number | undefined, index: number, total: number) => {
    const progress = planProgress ?? 0;
    const topicProgress = ((index + 1) / total) * 100;

    if (progress >= topicProgress) return 'completed';
    if (progress >= (index / total) * 100) return 'in-progress';
    return 'not-started';
  };

  const weeksRemaining = (examDate?: string) => {
    if (!examDate) return '-';
    const remainingMs = new Date(examDate).getTime() - Date.now();
    return String(Math.max(0, Math.ceil(remainingMs / (7 * 24 * 60 * 60 * 1000))));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckmarkCircleRegular className="w-5 h-5 text-[#107c10]" />;
      case 'in-progress':
        return <ClockRegular className="w-5 h-5 text-[#0078d4]" />;
      default:
        return <CircleRegular className="w-5 h-5 text-[#605e5c]" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-[#dff6dd] text-[#107c10]';
      case 'in-progress':
        return 'bg-[#cfe4ff] text-[#004578]';
      default:
        return 'bg-[#f3f2f1] text-[#605e5c]';
    }
  };

  return (
    <div className="h-full overflow-auto bg-[#faf9f8]">
      {/* Header */}
      <div className="bg-white border-b border-[#edebe9] px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold text-[#323130] mb-1">AI-Generated Study Plans</h1>
            <p className="text-sm text-[#605e5c]">Personalized learning paths created by AI agents</p>
          </div>
          <Button appearance="primary" className="bg-[#0078d4] text-white hover:bg-[#106ebe] sm:flex-shrink-0" icon={<BrainCircuitRegular />}>
            Generate New Plan
          </Button>
        </div>
      </div>

      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {/* AI Agent Info */}
        <Card className="rounded-lg border-0 bg-gradient-to-r from-[#0078d4] to-[#106ebe] p-5 text-white shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="w-14 h-14 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <BrainCircuitRegular className="w-8 h-8" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold mb-2">Study Planner Agent</h2>
              <p className="text-sm opacity-90 mb-4">
                Our AI analyzes your skill gaps, learning pace, and exam timeline to create personalized study plans
                that adapt to your progress and optimize your success rate.
              </p>
              <div className="grid gap-3 text-sm sm:grid-cols-3 sm:gap-6">
                <div>
                  <span className="block opacity-75">Plans Generated</span>
                  <span className="font-semibold">{studyPlans.length}</span>
                </div>
                <div>
                  <span className="block opacity-75">Success Rate</span>
                  <span className="font-semibold">Live</span>
                </div>
                <div>
                  <span className="block opacity-75">Avg Time Saved</span>
                  <span className="font-semibold">{totalHours} planned hours</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {error && (
          <Card className="border border-[#fde7e9] bg-white p-4 text-sm text-[#d13438]">
            {error}
          </Card>
        )}

        {/* Study Plans */}
        {studyPlans.map((plan) => {
          const topics = plan.generated_plan.schedule ?? [];
          const topicsWithStatus = topics.map((topic, index) => ({
            ...topic,
            status: topicStatus(plan.progress, index, topics.length),
          }));
          const completedTopics = topicsWithStatus.filter((topic) => topic.status === 'completed').length;
          const inProgressTopics = topicsWithStatus.filter((topic) => topic.status === 'in-progress').length;
          const notStartedTopics = topicsWithStatus.filter((topic) => topic.status === 'not-started').length;
          const completion = topics.length ? Math.round((completedTopics / topics.length) * 100) : 0;

          return (
            <Card key={plan.id} className="bg-white border border-[#edebe9] rounded-lg p-5 shadow-sm sm:p-6">
              {/* Plan Header */}
              <div className="mb-6 flex flex-col gap-4 border-b border-[#edebe9] pb-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-semibold text-[#323130]">{plan.course_name ?? 'Certification plan'}</h3>
                    <span className="inline-flex rounded-full bg-[#e1dfdd] px-3 py-1 text-xs font-medium text-[#323130]">
                      AI Generated
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#605e5c]">
                    <div>
                      <span className="font-medium">Learner:</span> {plan.full_name}
                    </div>
                    <div>
                      <span className="font-medium">Created:</span> {new Date(plan.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <ClockRegular className="w-4 h-4" />
                      <span className="font-medium">{weeksRemaining(plan.exam_date)} weeks remaining</span>
                    </div>
                  </div>
                </div>
                <Button appearance="primary" className="bg-[#0078d4] text-white hover:bg-[#106ebe] lg:flex-shrink-0">
                  View Full Plan
                </Button>
              </div>

              {/* Topics List */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-[#605e5c] mb-3">Learning Topics</h4>
                {topicsWithStatus.map((topic, index) => (
                  <div
                    key={index}
                    className="flex flex-col gap-3 rounded-lg border border-[#edebe9] p-4 transition-colors hover:bg-[#faf9f8] sm:flex-row sm:items-center sm:gap-4"
                  >
                    <div className="hidden flex-shrink-0 sm:block">
                      {getStatusIcon(topic.status)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2 sm:gap-3">
                        <span className="sm:hidden">{getStatusIcon(topic.status)}</span>
                        <h5 className="text-sm font-medium text-[#323130]">Week {topic.week}: {topic.focus}</h5>
                        <span className={`inline-flex rounded px-2 py-0.5 text-xs font-medium capitalize ${getStatusColor(topic.status)}`}>
                          {topic.status.replace('-', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-[#605e5c]">Estimated: {topic.hours} hours</p>
                    </div>
                    <div className="flex-shrink-0 sm:min-w-[96px] sm:text-right">
                      {topic.status === 'not-started' && (
                        <Button appearance="subtle" size="small">
                          Start
                        </Button>
                      )}
                      {topic.status === 'in-progress' && (
                        <Button appearance="subtle" size="small">
                          Continue
                        </Button>
                      )}
                      {topic.status === 'completed' && (
                        <Button appearance="subtle" size="small" disabled>
                          Completed
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress Summary */}
              <div className="mt-6 border-t border-[#edebe9] pt-4">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-[#107c10]"></div>
                      <span className="text-[#605e5c]">
                        Completed: <span className="font-medium text-[#323130]">{topicLabel(completedTopics)}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-[#0078d4]"></div>
                      <span className="text-[#605e5c]">
                        In Progress: <span className="font-medium text-[#323130]">{topicLabel(inProgressTopics)}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-[#e1dfdd]"></div>
                      <span className="text-[#605e5c]">
                        Not Started: <span className="font-medium text-[#323130]">{topicLabel(notStartedTopics)}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 xl:flex-shrink-0">
                    <div className="h-2 w-full min-w-[160px] rounded-full bg-[#e1dfdd] sm:w-48">
                      <div className="h-2 rounded-full bg-[#0078d4]" style={{ width: `${completion}%` }} />
                    </div>
                    <span className="whitespace-nowrap text-sm font-medium text-[#323130]">{completion}% Complete</span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        {/* Recent Plans Grid */}
        <div>
          <h2 className="text-lg font-semibold text-[#323130] mb-4">Recent Study Plans</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 xl:gap-6">
            {[
              ...studyPlans.slice(0, 3).map((plan) => ({
                learner: plan.full_name,
                cert: plan.course_name ?? 'Certification plan',
                progress: plan.progress ?? 0,
                id: plan.id,
              })),
            ].map((item) => (
              <Card key={item.id} className="p-5 bg-white border border-[#edebe9] rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-[#323130] mb-1">{item.cert}</h4>
                  <p className="text-xs text-[#605e5c]">{item.learner}</p>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-[#605e5c] mb-1">
                    <span>Progress</span>
                    <span className="font-medium">{item.progress}%</span>
                  </div>
                  <div className="w-full bg-[#e1dfdd] h-2 rounded-full">
                    <div
                      className="bg-[#0078d4] h-2 rounded-full"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
                <Button appearance="subtle" size="small" className="w-full">
                  View Plan
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
