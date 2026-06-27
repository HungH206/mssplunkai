const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const details = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(details.error ?? `API request failed: ${response.status}`);
  }

  return response.json();
}

export type Team = {
  id: number;
  name: string;
  manager_name?: string;
  created_at?: string;
};

export type Learner = {
  id: number;
  full_name: string;
  email: string;
  team_id?: number;
  team_name?: string;
};

export type Course = {
  id: number;
  name: string;
  provider?: string;
  level?: string;
  duration_weeks?: number;
  created_at?: string;
};

export type CertificationCase = {
  id: number;
  learner_id: number;
  full_name: string;
  email: string;
  team_id?: number;
  team_name?: string;
  course_id: number;
  course_name: string;
  provider?: string;
  level?: string;
  duration_weeks?: number;
  learner_course_id?: number;
  progress: number;
  readiness: number;
  status: string;
  current_stage: string;
  risk_level: string;
  manager_status: string;
  exam_date?: string;
  created_at?: string;
  updated_at?: string;
};

export type DashboardData = {
  totalLearners: number;
  activeCourses: number;
  activeCases: number;
  averageReadiness: number;
  highRiskCount: number;
  completionRate: number;
  predictedPassRate: number;
  teamReadiness: Array<{
    team: string;
    learners: number;
    readiness: number;
    certified: number;
    inProgress: number;
    highRisk: number;
  }>;
  certificationPipeline: Array<{
    stage: string;
    count: number;
    percentage: number;
  }>;
  atRiskCases: Array<{
    id: number;
    full_name: string;
    course_name: string;
    team_name?: string;
    readiness: number;
    exam_date?: string;
    risk_level: string;
    status: string;
    updated_at?: string;
  }>;
};

export type StudyPlan = {
  id: number;
  learner_id: number;
  learner_course_id?: number;
  certification_case_id?: number;
  full_name: string;
  course_name?: string;
  progress?: number;
  readiness?: number;
  exam_date?: string;
  generated_plan: {
    schedule?: Array<{ week: number; focus: string; hours: number }>;
    workIq?: {
      meetingHours?: number;
      focusHours?: number;
      preferredStudyTime?: string;
    };
  };
  created_at: string;
};

export type AssessmentResult = {
  id: number;
  learner_id: number;
  full_name: string;
  course_id: number;
  certification_case_id?: number;
  course_name: string;
  questions_json: Array<{ question: string; answer: string }>;
  score?: number;
  readiness?: string;
  created_at: string;
};

export function getTeams() {
  return request<Team[]>('/api/teams');
}

export function getLearners() {
  return request<Learner[]>('/api/learners');
}

export function getCourses() {
  return request<Course[]>('/api/courses');
}

export function getCases() {
  return request<CertificationCase[]>('/api/cases');
}

export function getAssignments() {
  return request<CertificationCase[]>('/api/assignments');
}

export function getDashboard() {
  return request<DashboardData>('/api/insights');
}

export function getStudyPlans() {
  return request<StudyPlan[]>('/api/plans/study');
}

export function getAssessments() {
  return request<AssessmentResult[]>('/api/assessments');
}

export function createLearner(input: { fullName: string; email: string; teamId?: number }) {
  return request<Learner>('/api/learners', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function assignCertification(input: { learnerId: number; courseId: number; examDate?: string }) {
  return request<CertificationCase>('/api/assignments', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function startCertificationCase(caseId: number) {
  return request<CertificationCase>(`/api/cases/${caseId}/start`, {
    method: 'POST',
  });
}

export function createTeam(input: { name: string; managerName?: string }) {
  return request<Team>('/api/teams', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function createCourse(input: { name: string; provider?: string; level?: string; durationWeeks?: number }) {
  return request<Course>('/api/courses', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
