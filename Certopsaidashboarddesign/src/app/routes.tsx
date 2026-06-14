import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Learners } from "./pages/Learners";
import { StudyPlans } from "./pages/StudyPlans";
import { Assessments } from "./pages/Assessments";
import { ManagerInsights } from "./pages/ManagerInsights";
import { Settings } from "./pages/Settings";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "learners", Component: Learners },
      { path: "study-plans", Component: StudyPlans },
      { path: "assessments", Component: Assessments },
      { path: "manager-insights", Component: ManagerInsights },
      { path: "settings", Component: Settings },
    ],
  },
]);
