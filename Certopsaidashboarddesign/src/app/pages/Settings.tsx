import { Card, Button, Input, Switch } from '@fluentui/react-components';
import { SaveRegular, DismissRegular } from '@fluentui/react-icons';

export function Settings() {
  return (
    <div className="h-full overflow-auto bg-[#faf9f8]">
      {/* Header */}
      <div className="bg-white border-b border-[#edebe9] px-8 py-6">
        <h1 className="text-2xl font-semibold text-[#323130] mb-1">Settings</h1>
        <p className="text-sm text-[#605e5c]">Configure your CertOps AI platform</p>
      </div>

      <div className="p-8 max-w-5xl space-y-6">
        {/* Organization Settings */}
        <Card className="p-6 bg-white border border-[#edebe9] rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-[#323130] mb-4">Organization Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#323130] mb-2">
                Organization Name
              </label>
              <Input placeholder="Enter organization name" defaultValue="Acme Corporation" className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#323130] mb-2">
                Default Certification Target
              </label>
              <Input placeholder="Default readiness target" defaultValue="80" type="number" className="w-full" />
            </div>
          </div>
        </Card>

        {/* AI Agent Settings */}
        <Card className="p-6 bg-white border border-[#edebe9] rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-[#323130] mb-4">AI Agent Configuration</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-[#f3f2f1]">
              <div>
                <h4 className="text-sm font-medium text-[#323130]">Learning Path Agent</h4>
                <p className="text-xs text-[#605e5c]">Automatically generate personalized learning paths</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between py-3 border-b border-[#f3f2f1]">
              <div>
                <h4 className="text-sm font-medium text-[#323130]">Study Planner Agent</h4>
                <p className="text-xs text-[#605e5c]">Create adaptive study schedules</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between py-3 border-b border-[#f3f2f1]">
              <div>
                <h4 className="text-sm font-medium text-[#323130]">Assessment Agent</h4>
                <p className="text-xs text-[#605e5c]">Generate practice questions and evaluate readiness</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <h4 className="text-sm font-medium text-[#323130]">Manager Insights Agent</h4>
                <p className="text-xs text-[#605e5c]">Provide team analytics and strategic recommendations</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-6 bg-white border border-[#edebe9] rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-[#323130] mb-4">Notification Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-[#f3f2f1]">
              <div>
                <h4 className="text-sm font-medium text-[#323130]">At-Risk Learner Alerts</h4>
                <p className="text-xs text-[#605e5c]">Get notified when learners fall behind schedule</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between py-3 border-b border-[#f3f2f1]">
              <div>
                <h4 className="text-sm font-medium text-[#323130]">Weekly Team Reports</h4>
                <p className="text-xs text-[#605e5c]">Receive weekly progress summaries</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <h4 className="text-sm font-medium text-[#323130]">Certification Completions</h4>
                <p className="text-xs text-[#605e5c]">Celebrate learner achievements</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button appearance="primary" icon={<SaveRegular />} className="bg-[#0078d4] text-white hover:bg-[#106ebe]">
            Save Changes
          </Button>
          <Button appearance="secondary" icon={<DismissRegular />}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
