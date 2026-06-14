import { Card, Button, Input } from '@fluentui/react-components';
import { AddRegular, EyeRegular, SearchRegular, FilterRegular } from '@fluentui/react-icons';
import { certificationData } from '../data/mockData';

export function Learners() {
  const { learners } = certificationData;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ready':
        return 'bg-[#dff6dd] text-[#107c10]';
      case 'On Track':
        return 'bg-[#cfe4ff] text-[#004578]';
      case 'At Risk':
        return 'bg-[#fde7e9] text-[#d13438]';
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
            <h1 className="text-2xl font-semibold text-[#323130] mb-1">Learners</h1>
            <p className="text-sm text-[#605e5c]">Manage and track individual learner progress</p>
          </div>
          <Button appearance="primary" icon={<AddRegular />} className="bg-[#0078d4] text-white hover:bg-[#106ebe] sm:flex-shrink-0">
            Add Learner
          </Button>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8">
        {/* Search and Filters */}
        <Card className="p-4 bg-white border border-[#edebe9] rounded-lg shadow-sm mb-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative min-w-0 flex-1">
              <SearchRegular className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#605e5c]" />
              <Input
                placeholder="Search learners by name, email, or certification..."
                className="w-full pl-10"
              />
            </div>
            <Button icon={<FilterRegular />} appearance="secondary" className="md:flex-shrink-0">
              Filters
            </Button>
          </div>
        </Card>

        {/* Learners Table */}
        <Card className="overflow-hidden bg-white border border-[#edebe9] rounded-lg shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] table-fixed">
              <colgroup>
                <col className="w-[17%]" />
                <col className="w-[12%]" />
                <col className="w-[18%]" />
                <col className="w-[15%]" />
                <col className="w-[10%]" />
                <col className="w-[10%]" />
                <col className="w-[8%]" />
                <col className="w-[10%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-[#edebe9] bg-[#faf9f8]">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#605e5c]">Learner</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#605e5c]">Team</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#605e5c]">Current Certification</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#605e5c]">Progress</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-[#605e5c]">Readiness</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#605e5c]">Exam Date</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#605e5c]">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-[#605e5c]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {learners.map((learner) => (
                  <tr key={learner.id} className="border-b border-[#f3f2f1] hover:bg-[#faf9f8]">
                    <td className="py-4 px-4">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-[#323130]">{learner.name}</div>
                        <div className="truncate text-xs text-[#605e5c]">{learner.email}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-[#605e5c]">
                      <span className="line-clamp-2">{learner.team}</span>
                    </td>
                    <td className="py-4 px-4 text-sm text-[#323130]">
                      <span className="line-clamp-2">{learner.currentCert}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-2 min-w-[96px] flex-1 rounded-full bg-[#e1dfdd]">
                          <div
                            className="bg-[#0078d4] h-2 rounded-full"
                            style={{ width: `${learner.progress}%` }}
                          />
                        </div>
                        <span className="w-9 text-right text-xs font-medium text-[#605e5c]">{learner.progress}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-center">
                        <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[#f3f2f1]">
                          <svg className="absolute inset-0 w-12 h-12 -rotate-90">
                            <circle cx="24" cy="24" r="20" fill="none" stroke="#e1dfdd" strokeWidth="4" />
                            <circle
                              cx="24"
                              cy="24"
                              r="20"
                              fill="none"
                              stroke={learner.readiness >= 80 ? '#107c10' : learner.readiness >= 60 ? '#0078d4' : '#d83b01'}
                              strokeWidth="4"
                              strokeDasharray={`${(learner.readiness / 100) * 125.6} 125.6`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <span className="text-xs font-semibold text-[#323130]">{learner.readiness}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-[#605e5c]">{learner.examDate}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(learner.status)}`}>
                        {learner.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Button appearance="subtle" size="small" icon={<EyeRegular />}>
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
