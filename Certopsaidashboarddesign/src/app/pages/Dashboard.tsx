import { useEffect, useState } from 'react';
import { Card } from '@fluentui/react-components';
import {
  PeopleRegular,
  CertificateRegular,
  TrophyRegular,
  AlertRegular,
} from '@fluentui/react-icons';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DashboardData, getDashboard } from '../../services/api';

const aiAgents = [
  {
    name: 'Learning Path Agent',
    description: 'Analyzes case context and creates personalized learning paths',
    status: 'Active',
    tasksCompleted: 0,
    efficiency: 94,
  },
  {
    name: 'Study Planner Agent',
    description: 'Generates adaptive study schedules from learner availability',
    status: 'Active',
    tasksCompleted: 0,
    efficiency: 91,
  },
  {
    name: 'Assessment Agent',
    description: 'Evaluates readiness and generates practice questions',
    status: 'Active',
    tasksCompleted: 0,
    efficiency: 88,
  },
  {
    name: 'Manager Insights Agent',
    description: 'Summarizes team readiness, risk, and certification pipeline health',
    status: 'Active',
    tasksCompleted: 0,
    efficiency: 96,
  },
];

export function Dashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboard()
      .then(setDashboard)
      .catch((apiError) => setError(apiError.message));
  }, []);

  const COLORS = ['#0078d4', '#00b7c3', '#8764b8', '#498205', '#ea4300', '#c239b3'];
  const teamReadiness = dashboard?.teamReadiness ?? [];
  const certificationPipeline = dashboard?.certificationPipeline ?? [];
  const atRiskCases = dashboard?.atRiskCases ?? [];

  const formatDate = (value?: string) => {
    if (!value) return 'No date';
    return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
  };

  return (
    <div className="h-full overflow-auto bg-[#faf9f8]">
      {/* Header */}
      <div className="bg-white border-b border-[#edebe9] px-8 py-6">
        <h1 className="text-2xl font-semibold text-[#323130] mb-1">Executive Overview</h1>
        <p className="text-sm text-[#605e5c]">Certification management powered by AI agents</p>
      </div>

      <div className="p-8 space-y-6">
        {error && (
          <Card className="border border-[#fde7e9] bg-white p-4 text-sm text-[#d13438]">
            {error}
          </Card>
        )}
        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-6">
          <Card className="p-6 bg-white border border-[#edebe9] rounded-lg shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#605e5c] mb-1">Total Learners</p>
                <p className="text-3xl font-semibold text-[#323130]">{dashboard?.totalLearners ?? 0}</p>
                <p className="text-xs text-[#605e5c] mt-2">From Azure SQL</p>
              </div>
              <div className="w-12 h-12 bg-[#e1dfdd] rounded-lg flex items-center justify-center">
                <PeopleRegular className="w-6 h-6 text-[#0078d4]" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border border-[#edebe9] rounded-lg shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#605e5c] mb-1">Active Certifications</p>
                <p className="text-3xl font-semibold text-[#323130]">{dashboard?.activeCourses ?? 0}</p>
                <p className="text-xs text-[#605e5c] mt-2">{dashboard?.activeCases ?? 0} open cases</p>
              </div>
              <div className="w-12 h-12 bg-[#e1dfdd] rounded-lg flex items-center justify-center">
                <CertificateRegular className="w-6 h-6 text-[#0078d4]" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border border-[#edebe9] rounded-lg shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#605e5c] mb-1">Avg Readiness Score</p>
                <p className="text-3xl font-semibold text-[#323130]">{dashboard?.averageReadiness ?? 0}%</p>
                <p className="text-xs text-[#605e5c] mt-2">{dashboard?.predictedPassRate ?? 0}% predicted pass rate</p>
              </div>
              <div className="w-12 h-12 bg-[#e1dfdd] rounded-lg flex items-center justify-center">
                <TrophyRegular className="w-6 h-6 text-[#0078d4]" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border border-[#edebe9] rounded-lg shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#605e5c] mb-1">High Risk Cases</p>
                <p className="text-3xl font-semibold text-[#323130]">{dashboard?.highRiskCount ?? 0}</p>
                <p className="text-xs text-[#605e5c] mt-2">{dashboard?.completionRate ?? 0}% completion rate</p>
              </div>
              <div className="w-12 h-12 bg-[#e1dfdd] rounded-lg flex items-center justify-center">
                <AlertRegular className="w-6 h-6 text-[#0078d4]" />
              </div>
            </div>
          </Card>
        </div>

        {/* Team Readiness Cards */}
        <div>
          <h2 className="text-lg font-semibold text-[#323130] mb-4">Team Readiness Score</h2>
          <div className="grid grid-cols-5 gap-4">
            {teamReadiness.map((team) => (
              <Card key={team.team} className="p-5 bg-white border border-[#edebe9] rounded-lg shadow-sm">
                <h3 className="text-sm font-semibold text-[#323130] mb-3">{team.team}</h3>
                <div className="flex items-end gap-2 mb-3">
                  <span className="text-3xl font-semibold text-[#0078d4]">{team.readiness}</span>
                  <span className="text-sm text-[#605e5c] pb-1">/100</span>
                </div>
                <div className="w-full bg-[#e1dfdd] h-2 rounded-full mb-3">
                  <div
                    className="bg-[#0078d4] h-2 rounded-full"
                    style={{ width: `${team.readiness}%` }}
                  />
                </div>
                <div className="space-y-1 text-xs text-[#605e5c]">
                  <div className="flex justify-between">
                    <span>Certified:</span>
                    <span className="font-medium text-[#323130]">{team.certified}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>In Progress:</span>
                    <span className="font-medium text-[#323130]">{team.inProgress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>At Risk:</span>
                    <span className="font-medium text-[#d83b01]">{team.highRisk}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-2 gap-6">
          {/* Skill Gap Analysis */}
          <Card className="p-6 bg-white border border-[#edebe9] rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-[#323130] mb-4">Team Risk Load</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart id="risk-load-chart" data={teamReadiness} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#edebe9" />
                <XAxis type="number" stroke="#605e5c" style={{ fontSize: '12px' }} />
                <YAxis dataKey="team" type="category" width={150} stroke="#605e5c" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #edebe9',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                />
                <Bar name="High risk cases" dataKey="highRisk" fill="#d83b01" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Readiness by Team */}
          <Card className="p-6 bg-white border border-[#edebe9] rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-[#323130] mb-4">Readiness by Team</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart id="readiness-team-chart" data={teamReadiness}>
                <CartesianGrid strokeDasharray="3 3" stroke="#edebe9" />
                <XAxis dataKey="team" stroke="#605e5c" style={{ fontSize: '12px' }} />
                <YAxis stroke="#605e5c" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #edebe9',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                />
                <Bar name="Readiness" dataKey="readiness" fill="#0078d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Pipeline and At-Risk */}
        <div className="grid grid-cols-3 gap-6">
          {/* Certification Pipeline */}
          <Card className="p-6 bg-white border border-[#edebe9] rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-[#323130] mb-4">Certification Progress Pipeline</h2>
            <div className="flex justify-center">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={certificationPipeline}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} (${percentage}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {certificationPipeline.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #edebe9',
                      borderRadius: '4px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* At-Risk Employees */}
          <Card className="col-span-2 p-6 bg-white border border-[#edebe9] rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-[#323130] mb-4">At-Risk Employees</h2>
            <div className="overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#edebe9]">
                    <th className="text-left py-3 px-3 text-xs font-semibold text-[#605e5c]">Name</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-[#605e5c]">Certification</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-[#605e5c]">Days Left</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-[#605e5c]">Readiness</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-[#605e5c]">Last Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {atRiskCases.map((employee) => (
                    <tr key={employee.id} className="border-b border-[#f3f2f1] hover:bg-[#faf9f8]">
                      <td className="py-3 px-3 text-sm text-[#323130]">{employee.full_name}</td>
                      <td className="py-3 px-3 text-sm text-[#605e5c]">{employee.course_name}</td>
                      <td className="py-3 px-3">
                        <span className="inline-flex px-2 py-1 rounded text-xs font-medium bg-[#fff4ce] text-[#8a6116]">
                          {formatDate(employee.exam_date)}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-[#e1dfdd] h-2 rounded-full max-w-[80px]">
                            <div
                              className="bg-[#d83b01] h-2 rounded-full"
                              style={{ width: `${employee.readiness}%` }}
                            />
                          </div>
                          <span className="text-xs text-[#605e5c]">{employee.readiness}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-sm text-[#605e5c]">{formatDate(employee.updated_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* AI Agents Workflow */}
        <div>
          <h2 className="text-lg font-semibold text-[#323130] mb-4">AI Agent Workflow</h2>
          <div className="grid grid-cols-4 gap-4">
            {aiAgents.map((agent, index) => (
              <Card key={agent.name} className="p-5 bg-white border border-[#edebe9] rounded-lg shadow-sm">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0078d4] to-[#106ebe] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-semibold">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-[#323130] mb-1">{agent.name}</h3>
                    <p className="text-xs text-[#605e5c] leading-relaxed">{agent.description}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#605e5c]">Status:</span>
                    <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-[#dff6dd] text-[#107c10]">
                      {agent.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#605e5c]">Tasks Completed:</span>
                    <span className="text-sm font-medium text-[#323130]">{agent.tasksCompleted}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#605e5c]">Efficiency:</span>
                    <span className="text-sm font-medium text-[#107c10]">{agent.efficiency}%</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
