import { useEffect, useMemo, useState } from 'react';
import { Card, Button } from '@fluentui/react-components';
import { BrainCircuitRegular, ArrowDownloadRegular, ShareRegular } from '@fluentui/react-icons';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter,
  ZAxis, PieChart, Pie, Cell,
} from 'recharts';
import { DashboardData, getDashboard } from '../../services/api';

export function ManagerInsights() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  useEffect(() => {
    getDashboard().then(setDashboard).catch(() => setDashboard(null));
  }, []);

  const roiData = [
    { month: 'Jan', investment: 45000, productivity: 52000 },
    { month: 'Feb', investment: 48000, productivity: 58000 },
    { month: 'Mar', investment: 52000, productivity: 67000 },
    { month: 'Apr', investment: 51000, productivity: 72000 },
    { month: 'May', investment: 54000, productivity: 78000 },
    { month: 'Jun', investment: 56000, productivity: 85000 },
  ];

  const timeToCompetencyData = [
    { team: 'Engineering', traditional: 12, aiPowered: 7 },
    { team: 'DevOps', traditional: 10, aiPowered: 6 },
    { team: 'Cloud Arch', traditional: 14, aiPowered: 8 },
    { team: 'Security', traditional: 11, aiPowered: 6 },
    { team: 'Data Eng', traditional: 13, aiPowered: 8 },
  ];

  const teamPerformanceData = useMemo(
    () =>
      (dashboard?.teamReadiness ?? []).map((team) => ({
        team: team.team,
        readiness: team.readiness,
        engagement: Math.min(100, Math.max(40, team.readiness + 8 - team.highRisk * 4)),
        size: team.learners,
      })),
    [dashboard],
  );

  return (
    <div className="h-full overflow-auto bg-[#faf9f8]">
      {/* Header */}
      <div className="bg-white border-b border-[#edebe9] px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#323130] mb-1">Manager Insights Dashboard</h1>
            <p className="text-sm text-[#605e5c]">Strategic analytics and team performance metrics</p>
          </div>
          <div className="flex gap-3">
            <Button icon={<ShareRegular />} appearance="secondary">
              Share Report
            </Button>
            <Button icon={<ArrowDownloadRegular />} appearance="primary" className="bg-[#0078d4] text-white hover:bg-[#106ebe]">
              Export Data
            </Button>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* AI Agent Info */}
        <Card className="p-6 bg-gradient-to-r from-[#498205] to-[#3a6804] border-0 rounded-lg shadow-sm text-white">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <BrainCircuitRegular className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-2">Manager Insights Agent</h2>
              <p className="text-sm opacity-90 mb-4">
                Provides comprehensive team analytics, ROI calculations, and predictive insights to help managers make
                data-driven decisions about certification programs and resource allocation.
              </p>
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="opacity-75">Reports Generated:</span>
                  <span className="font-semibold ml-2">67</span>
                </div>
                <div>
                  <span className="opacity-75">Insights Accuracy:</span>
                  <span className="font-semibold ml-2">96%</span>
                </div>
                <div>
                  <span className="opacity-75">Cost Savings Identified:</span>
                  <span className="font-semibold ml-2">$142K</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-6">
          <Card className="p-6 bg-white border border-[#edebe9] rounded-lg shadow-sm">
            <h3 className="text-sm text-[#605e5c] mb-2">Total Investment</h3>
            <p className="text-3xl font-semibold text-[#323130] mb-1">$312K</p>
            <p className="text-xs text-[#605e5c]">Last 6 months</p>
          </Card>
          <Card className="p-6 bg-white border border-[#edebe9] rounded-lg shadow-sm">
            <h3 className="text-sm text-[#605e5c] mb-2">Productivity Gain</h3>
            <p className="text-3xl font-semibold text-[#107c10] mb-1">$412K</p>
            <p className="text-xs text-[#107c10]">+32% ROI</p>
          </Card>
          <Card className="p-6 bg-white border border-[#edebe9] rounded-lg shadow-sm">
            <h3 className="text-sm text-[#605e5c] mb-2">Avg Time Saved</h3>
            <p className="text-3xl font-semibold text-[#0078d4] mb-1">5.2</p>
            <p className="text-xs text-[#605e5c]">weeks per learner</p>
          </Card>
          <Card className="p-6 bg-white border border-[#edebe9] rounded-lg shadow-sm">
            <h3 className="text-sm text-[#605e5c] mb-2">Team Efficiency</h3>
            <p className="text-3xl font-semibold text-[#8764b8] mb-1">87%</p>
            <p className="text-xs text-[#107c10]">↑ 12% this quarter</p>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-6">
          {/* ROI Trend */}
          <Card className="p-6 bg-white border border-[#edebe9] rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-[#323130] mb-4">Certification ROI Analysis</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart id="roi-chart" data={roiData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#edebe9" />
                <XAxis dataKey="month" stroke="#605e5c" style={{ fontSize: '12px' }} />
                <YAxis stroke="#605e5c" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #edebe9',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="investment"
                  stroke="#d83b01"
                  strokeWidth={2}
                  name="Investment"
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="productivity"
                  stroke="#107c10"
                  strokeWidth={2}
                  name="Productivity Value"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Time to Competency */}
          <Card className="p-6 bg-white border border-[#edebe9] rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-[#323130] mb-4">Time to Competency Comparison</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart id="competency-chart" data={timeToCompetencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#edebe9" />
                <XAxis dataKey="team" stroke="#605e5c" style={{ fontSize: '12px' }} />
                <YAxis stroke="#605e5c" style={{ fontSize: '12px' }} label={{ value: 'Weeks', angle: -90, position: 'insideLeft' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #edebe9',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="traditional" fill="#e1dfdd" name="Traditional Learning" radius={[4, 4, 0, 0]} />
                <Bar dataKey="aiPowered" fill="#0078d4" name="AI-Powered Learning" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Team Performance Matrix */}
        <Card className="p-6 bg-white border border-[#edebe9] rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-[#323130] mb-4">Team Performance Matrix</h2>
          <div className="flex gap-6">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height={320}>
                <ScatterChart id="team-performance-chart" margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#edebe9" />
                  <XAxis
                    type="number"
                    dataKey="readiness"
                    name="Readiness"
                    stroke="#605e5c"
                    style={{ fontSize: '12px' }}
                    label={{ value: 'Team Readiness Score', position: 'bottom', offset: 0 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="engagement"
                    name="Engagement"
                    stroke="#605e5c"
                    style={{ fontSize: '12px' }}
                    label={{ value: 'Engagement Score', angle: -90, position: 'insideLeft' }}
                  />
                  <ZAxis type="number" dataKey="size" range={[100, 1000]} />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #edebe9',
                      borderRadius: '4px',
                      fontSize: '12px',
                    }}
                  />
                  <Scatter name="Teams" data={teamPerformanceData} fill="#0078d4">
                    {teamPerformanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#0078d4', '#00b7c3', '#8764b8', '#498205', '#ea4300'][index]} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div className="w-64 space-y-3">
              <h3 className="text-sm font-semibold text-[#605e5c] mb-3">Team Legend</h3>
              {teamPerformanceData.map((team, index) => (
                <div key={team.team} className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: ['#0078d4', '#00b7c3', '#8764b8', '#498205', '#ea4300'][index] }}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-[#323130]">{team.team}</div>
                    <div className="text-xs text-[#605e5c]">{team.size} members</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Team Recommendations */}
        <div className="grid grid-cols-2 gap-6">
          <Card className="p-6 bg-white border border-[#edebe9] rounded-lg shadow-sm">
            <div className="flex items-start gap-3 mb-4">
              <BrainCircuitRegular className="w-6 h-6 text-[#0078d4] flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-lg font-semibold text-[#323130] mb-1">AI Recommendations</h2>
                <p className="text-sm text-[#605e5c]">Strategic insights for program optimization</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-4 bg-[#cfe4ff] rounded-lg border-l-4 border-[#0078d4]">
                <h4 className="text-sm font-semibold text-[#323130] mb-1">High Priority</h4>
                <p className="text-sm text-[#605e5c]">
                  Allocate additional resources to Data Engineering team. Current readiness score (69%) is below target.
                  Estimated 5 weeks to reach 80% with increased support.
                </p>
              </div>
              <div className="p-4 bg-[#fff4ce] rounded-lg border-l-4 border-[#faa06b]">
                <h4 className="text-sm font-semibold text-[#323130] mb-1">Medium Priority</h4>
                <p className="text-sm text-[#605e5c]">
                  Cloud Architecture team shows strong potential. Consider advanced certification tracks for top
                  performers to maximize ROI.
                </p>
              </div>
              <div className="p-4 bg-[#dff6dd] rounded-lg border-l-4 border-[#107c10]">
                <h4 className="text-sm font-semibold text-[#323130] mb-1">Optimization</h4>
                <p className="text-sm text-[#605e5c]">
                  Security team performing exceptionally (85% readiness). Leverage their success patterns for other teams.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border border-[#edebe9] rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-[#323130] mb-4">Program Health Indicators</h2>
            <div className="space-y-4">
              {[
                { metric: 'Certification Completion Rate', value: 68, target: 75, status: 'needs-attention' },
                { metric: 'Learner Engagement Score', value: 82, target: 80, status: 'good' },
                { metric: 'Average Study Time Efficiency', value: 91, target: 85, status: 'excellent' },
                { metric: 'Resource Utilization', value: 76, target: 70, status: 'good' },
                { metric: 'Program ROI', value: 132, target: 120, status: 'excellent' },
              ].map((indicator, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#323130] font-medium">{indicator.metric}</span>
                    <span className="text-[#605e5c]">
                      {indicator.value}{indicator.metric === 'Program ROI' ? '%' : '%'} / {indicator.target}% target
                    </span>
                  </div>
                  <div className="w-full bg-[#e1dfdd] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${
                        indicator.status === 'excellent'
                          ? 'bg-[#107c10]'
                          : indicator.status === 'good'
                          ? 'bg-[#0078d4]'
                          : 'bg-[#faa06b]'
                      }`}
                      style={{ width: `${(indicator.value / indicator.target) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
