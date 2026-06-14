import { Outlet, NavLink } from 'react-router';
import {
  HomeRegular,
  HomeFilled,
  PeopleRegular,
  PeopleFilled,
  BookRegular,
  BookFilled,
  ClipboardTaskRegular,
  ClipboardTaskFilled,
  ChartMultipleRegular,
  ChartMultipleFilled,
  PersonSettingsRegular,
  PersonSettingsFilled,
  SettingsRegular,
  SettingsFilled,
  bundleIcon,
} from '@fluentui/react-icons';

const HomeIcon = bundleIcon(HomeFilled, HomeRegular);
const PeopleIcon = bundleIcon(PeopleFilled, PeopleRegular);
const BookIcon = bundleIcon(BookFilled, BookRegular);
const ClipboardIcon = bundleIcon(ClipboardTaskFilled, ClipboardTaskRegular);
const ChartIcon = bundleIcon(ChartMultipleFilled, ChartMultipleRegular);
const AdminIcon = bundleIcon(PersonSettingsFilled, PersonSettingsRegular);
const SettingsIcon = bundleIcon(SettingsFilled, SettingsRegular);

export function Layout() {
  const navItems = [
    { to: '/', icon: HomeIcon, label: 'Dashboard', end: true },
    { to: '/admin', icon: AdminIcon, label: 'Admin Setup' },
    { to: '/learners', icon: PeopleIcon, label: 'Learners' },
    { to: '/study-plans', icon: BookIcon, label: 'Study Plans' },
    { to: '/assessments', icon: ClipboardIcon, label: 'Assessments' },
    { to: '/manager-insights', icon: ChartIcon, label: 'Manager Insights' },
    { to: '/settings', icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <div className="flex h-screen bg-[#faf9f8]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#edebe9] flex flex-col">
        {/* Logo */}
        <div className="h-16 px-6 flex items-center border-b border-[#edebe9]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#0078d4] to-[#106ebe] rounded-lg flex items-center justify-content-center">
              <span className="text-white text-sm font-semibold">CO</span>
            </div>
            <span className="text-lg font-semibold text-[#323130]">CertOps AI</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md mb-1 transition-colors ${
                  isActive
                    ? 'bg-[#f3f2f1] text-[#0078d4]'
                    : 'text-[#605e5c] hover:bg-[#f3f2f1] hover:text-[#323130]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-[#edebe9]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#0078d4] rounded-full flex items-center justify-center">
              <span className="text-white text-sm">AS</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-[#323130] truncate">Admin User</div>
              <div className="text-xs text-[#605e5c] truncate">admin@company.com</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
