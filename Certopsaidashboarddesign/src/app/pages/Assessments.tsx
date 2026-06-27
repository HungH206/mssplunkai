import { useEffect, useMemo, useState } from 'react';
import { Card, Button } from '@fluentui/react-components';
import {
  ClipboardTaskRegular,
  TrophyRegular,
  BrainCircuitRegular,
  ChevronRightRegular,
} from '@fluentui/react-icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { AssessmentResult, getAssessments } from '../../services/api';

export function Assessments() {
  const [assessments, setAssessments] = useState<AssessmentResult[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getAssessments()
      .then(setAssessments)
      .catch((apiError) => setError(apiError.message));
  }, []);

  const assessmentScores = useMemo(
    () =>
      assessments.slice(0, 6).reverse().map((assessment, index) => ({
        name: `Assessment ${index + 1}`,
        score: assessment.score ?? 0,
      })),
    [assessments],
  );

  const skillRadarData = useMemo(
    () =>
      assessments.slice(0, 6).map((assessment) => ({
        subject: assessment.course_name.length > 16 ? `${assessment.course_name.slice(0, 16)}...` : assessment.course_name,
        score: assessment.score ?? 0,
      })),
    [assessments],
  );

  const latestScore = assessments[0]?.score ?? 0;

  return (
    <div className="h-full overflow-auto bg-[#faf9f8]">
      {/* Header */}
      <div className="bg-white border-b border-[#edebe9] px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#323130] mb-1">Assessment Results</h1>
            <p className="text-sm text-[#605e5c]">AI-powered readiness evaluation and practice exams</p>
          </div>
          <Button appearance="primary" className="bg-[#0078d4] text-white hover:bg-[#106ebe]" icon={<ClipboardTaskRegular />}>
            New Assessment
          </Button>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* AI Agent Info */}
        <Card className="p-6 bg-gradient-to-r from-[#8764b8] to-[#6b4a9e] border-0 rounded-lg shadow-sm text-white">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <BrainCircuitRegular className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-2">Assessment Agent</h2>
              <p className="text-sm opacity-90 mb-4">
                Advanced AI evaluates learner readiness through adaptive assessments, skill gap analysis, and personalized
                practice questions that mirror real certification exam patterns.
              </p>
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="opacity-75">Assessments Completed:</span>
                  <span className="font-semibold ml-2">{assessments.length}</span>
                </div>
                <div>
                  <span className="opacity-75">Avg Accuracy:</span>
                  <span className="font-semibold ml-2">88%</span>
                </div>
                <div>
                  <span className="opacity-75">Pass Rate Improvement:</span>
                  <span className="font-semibold ml-2">+24%</span>
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

        {/* Charts */}
        <div className="grid grid-cols-2 gap-6">
          {/* Assessment Score Trend */}
          <Card className="p-6 bg-white border border-[#edebe9] rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-[#323130] mb-4">Assessment Score Progression</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart id="assessment-scores-chart" data={assessmentScores}>
                <CartesianGrid strokeDasharray="3 3" stroke="#edebe9" />
                <XAxis dataKey="name" stroke="#605e5c" style={{ fontSize: '12px' }} />
                <YAxis stroke="#605e5c" style={{ fontSize: '12px' }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #edebe9',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                />
                <Bar name="Score" dataKey="score" fill="#0078d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-[#605e5c]">Latest Score:</span>
              <span className="text-xl font-semibold text-[#107c10]">{latestScore}%</span>
            </div>
          </Card>

          {/* Skill Coverage Radar */}
          <Card className="p-6 bg-white border border-[#edebe9] rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-[#323130] mb-4">Skill Coverage Analysis</h2>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart id="skill-radar-chart" data={skillRadarData}>
                <PolarGrid stroke="#edebe9" />
                <PolarAngleAxis dataKey="subject" stroke="#605e5c" style={{ fontSize: '12px' }} />
                <PolarRadiusAxis stroke="#605e5c" style={{ fontSize: '12px' }} domain={[0, 100]} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#0078d4"
                  fill="#0078d4"
                  fillOpacity={0.6}
                  strokeWidth={2}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #edebe9',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-[#605e5c]">Avg Coverage:</span>
              <span className="text-xl font-semibold text-[#0078d4]">73%</span>
            </div>
          </Card>
        </div>

        {/* Readiness Scores */}
        <div>
          <h2 className="text-lg font-semibold text-[#323130] mb-4">Individual Readiness Scores</h2>
          <div className="grid grid-cols-4 gap-4">
            {assessments.slice(0, 4).map((assessment) => {
              const score = assessment.score ?? 0;
              const status = score >= 80 ? 'Ready' : 'In Progress';

              return (
              <Card key={assessment.id} className="p-5 bg-white border border-[#edebe9] rounded-lg shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#0078d4] rounded-full flex items-center justify-center text-white font-semibold">
                    {assessment.full_name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-[#323130] truncate">{assessment.full_name}</h4>
                    <p className="text-xs text-[#605e5c] truncate">{assessment.course_name}</p>
                  </div>
                </div>
                <div className="relative">
                  <div className="w-full h-2 bg-[#e1dfdd] rounded-full">
                    <div
                      className={`h-2 rounded-full ${score >= 80 ? 'bg-[#107c10]' : 'bg-[#0078d4]'}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-[#605e5c]">Readiness</span>
                    <span className={`text-lg font-semibold ${score >= 80 ? 'text-[#107c10]' : 'text-[#0078d4]'}`}>
                      {score}%
                    </span>
                  </div>
                </div>
                <div className="mt-3">
                  <span className={`inline-flex w-full justify-center px-3 py-1 rounded-full text-xs font-medium ${
                    status === 'Ready' ? 'bg-[#dff6dd] text-[#107c10]' : 'bg-[#cfe4ff] text-[#004578]'
                  }`}>
                    {status}
                  </span>
                </div>
              </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Assessments */}
        <Card className="p-6 bg-white border border-[#edebe9] rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#323130]">Recent Assessments</h2>
            <Button appearance="subtle" size="small" icon={<ChevronRightRegular />} iconPosition="after">
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {assessments.map((assessment) => (
              <div
                key={assessment.id}
                className="flex items-center gap-4 p-4 rounded-lg border border-[#edebe9] hover:bg-[#faf9f8] transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${
                    (assessment.score ?? 0) >= 80 ? 'bg-[#dff6dd]' : (assessment.score ?? 0) >= 70 ? 'bg-[#cfe4ff]' : 'bg-[#fff4ce]'
                  }`}>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        (assessment.score ?? 0) >= 80 ? 'text-[#107c10]' : (assessment.score ?? 0) >= 70 ? 'text-[#0078d4]' : 'text-[#8a6116]'
                      }`}>
                        {assessment.score ?? 0}
                      </div>
                      <div className="text-xs text-[#605e5c]">Score</div>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-[#323130]">{assessment.full_name}</h4>
                    <span className="text-xs text-[#605e5c]">•</span>
                    <span className="text-xs text-[#605e5c]">{assessment.course_name}</span>
                  </div>
                  <p className="text-xs text-[#605e5c] mb-2">AI assessment • {new Date(assessment.created_at).toLocaleDateString()}</p>
                  <div className="flex items-start gap-2">
                    <BrainCircuitRegular className="w-4 h-4 text-[#8764b8] mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-[#323130]">
                      <span className="font-medium">AI Recommendation:</span> {assessment.readiness ?? 'Review weak areas and continue practice.'}
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <Button appearance="subtle" size="small">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
