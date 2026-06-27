import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Input } from '@fluentui/react-components';
import { AddRegular, CertificateRegular, PeopleRegular } from '@fluentui/react-icons';
import {
  assignCertification,
  CertificationCase,
  Course,
  createCourse,
  createLearner,
  createTeam,
  getCases,
  getCourses,
  getLearners,
  getTeams,
  Learner,
  startCertificationCase,
  Team,
} from '../../services/api';

export function AdminSetup() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [learners, setLearners] = useState<Learner[]>([]);
  const [cases, setCases] = useState<CertificationCase[]>([]);
  const [error, setError] = useState('');

  const [teamForm, setTeamForm] = useState({ name: '', manager: '' });
  const [courseForm, setCourseForm] = useState({
    name: '',
    provider: '',
    level: 'Associate',
    durationWeeks: '6',
  });
  const [personForm, setPersonForm] = useState({
    name: '',
    email: '',
    teamId: '',
    courseId: '',
    examDate: '',
  });

  const loadData = () => {
    setError('');
    Promise.all([getTeams(), getCourses(), getLearners(), getCases()])
      .then(([teamRows, courseRows, learnerRows, caseRows]) => {
        setTeams(teamRows);
        setCourses(courseRows);
        setLearners(learnerRows);
        setCases(caseRows);
        setPersonForm((form) => ({
          ...form,
          teamId: form.teamId || String(teamRows[0]?.id ?? ''),
          courseId: form.courseId || String(courseRows[0]?.id ?? ''),
        }));
      })
      .catch((apiError) => setError(apiError.message));
  };

  useEffect(() => {
    loadData();
  }, []);

  const learnerCountByTeam = useMemo(() => {
    return learners.reduce<Record<number, number>>((counts, learner) => {
      if (learner.team_id) {
        counts[learner.team_id] = (counts[learner.team_id] ?? 0) + 1;
      }
      return counts;
    }, {});
  }, [learners]);

  const addTeam = async () => {
    if (!teamForm.name.trim()) return;

    try {
      setError('');
      await createTeam({
        name: teamForm.name.trim(),
        managerName: teamForm.manager.trim() || undefined,
      });
      setTeamForm({ name: '', manager: '' });
      loadData();
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : 'Unable to create team.');
    }
  };

  const addCourse = async () => {
    if (!courseForm.name.trim()) return;

    try {
      setError('');
      await createCourse({
        name: courseForm.name.trim(),
        provider: courseForm.provider.trim() || undefined,
        level: courseForm.level,
        durationWeeks: Number(courseForm.durationWeeks) || undefined,
      });
      setCourseForm({
        name: '',
        provider: '',
        level: 'Associate',
        durationWeeks: '6',
      });
      loadData();
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : 'Unable to create course.');
    }
  };

  const addPerson = async () => {
    if (!personForm.name.trim() || !personForm.email.trim()) return;

    try {
      setError('');
      const learner = await createLearner({
        fullName: personForm.name.trim(),
        email: personForm.email.trim(),
        teamId: personForm.teamId ? Number(personForm.teamId) : undefined,
      });

      if (personForm.courseId) {
        await assignCertification({
          learnerId: learner.id,
          courseId: Number(personForm.courseId),
          examDate: personForm.examDate || undefined,
        });
      }

      setPersonForm((form) => ({
        name: '',
        email: '',
        teamId: form.teamId,
        courseId: form.courseId,
        examDate: '',
      }));
      loadData();
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : 'Unable to create learner.');
    }
  };

  const startCase = async (caseId: number) => {
    try {
      setError('');
      await startCertificationCase(caseId);
      loadData();
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : 'Unable to start certification case.');
    }
  };

  return (
    <div className="h-full overflow-auto bg-[#faf9f8]">
      <div className="border-b border-[#edebe9] bg-white px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-[#323130]">Admin Setup</h1>
          <p className="text-sm text-[#605e5c]">Add teams, learners, certificate courses, and certification cases.</p>
        </div>
      </div>

      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {error && (
          <Card className="border border-[#fde7e9] bg-white p-4 text-sm text-[#d13438]">
            {error}
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border border-[#edebe9] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-[#605e5c]">Teams</p>
                <p className="text-3xl font-semibold text-[#323130]">{teams.length}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#e8f2fb]">
                <PeopleRegular className="h-6 w-6 text-[#0078d4]" />
              </div>
            </div>
            <p className="text-xs text-[#605e5c]">Groups that own learners and course assignments.</p>
          </Card>

          <Card className="border border-[#edebe9] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-[#605e5c]">Learners</p>
                <p className="text-3xl font-semibold text-[#323130]">{learners.length}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#e8f2fb]">
                <PeopleRegular className="h-6 w-6 text-[#0078d4]" />
              </div>
            </div>
            <p className="text-xs text-[#605e5c]">People currently available for certification cases.</p>
          </Card>

          <Card className="border border-[#edebe9] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-[#605e5c]">Certificate Courses</p>
                <p className="text-3xl font-semibold text-[#323130]">{courses.length}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#e8f2fb]">
                <CertificateRegular className="h-6 w-6 text-[#0078d4]" />
              </div>
            </div>
            <p className="text-xs text-[#605e5c]">Courses available for learner progress tracking.</p>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <Card className="border border-[#edebe9] bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-[#323130]">Add Team</h2>
            <div className="space-y-3">
              <Input
                value={teamForm.name}
                placeholder="Team name"
                onChange={(_, data) => setTeamForm((form) => ({ ...form, name: data.value }))}
              />
              <Input
                value={teamForm.manager}
                placeholder="Manager"
                onChange={(_, data) => setTeamForm((form) => ({ ...form, manager: data.value }))}
              />
              <Button appearance="primary" icon={<AddRegular />} className="w-full bg-[#0078d4] text-white" onClick={addTeam}>
                Add Team
              </Button>
            </div>
          </Card>

          <Card className="border border-[#edebe9] bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-[#323130]">Add Learner and Case</h2>
            <div className="space-y-3">
              <Input
                value={personForm.name}
                placeholder="Full name"
                onChange={(_, data) => setPersonForm((form) => ({ ...form, name: data.value }))}
              />
              <Input
                value={personForm.email}
                placeholder="Email"
                onChange={(_, data) => setPersonForm((form) => ({ ...form, email: data.value }))}
              />
              <select
                className="h-8 w-full rounded border border-[#d1d1d1] bg-white px-3 text-sm text-[#323130]"
                value={personForm.teamId}
                onChange={(event) => setPersonForm((form) => ({ ...form, teamId: event.target.value }))}
              >
                <option value="">No team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
              <select
                className="h-8 w-full rounded border border-[#d1d1d1] bg-white px-3 text-sm text-[#323130]"
                value={personForm.courseId}
                onChange={(event) => setPersonForm((form) => ({ ...form, courseId: event.target.value }))}
              >
                <option value="">No certification</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
              <Input
                value={personForm.examDate}
                type="date"
                onChange={(_, data) => setPersonForm((form) => ({ ...form, examDate: data.value }))}
              />
              <Button appearance="primary" icon={<AddRegular />} className="w-full bg-[#0078d4] text-white" onClick={addPerson}>
                Add Learner
              </Button>
            </div>
          </Card>

          <Card className="border border-[#edebe9] bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-[#323130]">Add Certificate Course</h2>
            <div className="space-y-3">
              <Input
                value={courseForm.name}
                placeholder="Course name"
                onChange={(_, data) => setCourseForm((form) => ({ ...form, name: data.value }))}
              />
              <Input
                value={courseForm.provider}
                placeholder="Provider"
                onChange={(_, data) => setCourseForm((form) => ({ ...form, provider: data.value }))}
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  className="h-8 w-full rounded border border-[#d1d1d1] bg-white px-3 text-sm text-[#323130]"
                  value={courseForm.level}
                  onChange={(event) => setCourseForm((form) => ({ ...form, level: event.target.value }))}
                >
                  <option>Foundational</option>
                  <option>Associate</option>
                  <option>Professional</option>
                  <option>Specialty</option>
                </select>
                <Input
                  value={courseForm.durationWeeks}
                  type="number"
                  min={1}
                  placeholder="Weeks"
                  onChange={(_, data) => setCourseForm((form) => ({ ...form, durationWeeks: data.value }))}
                />
              </div>
              <Button appearance="primary" icon={<AddRegular />} className="w-full bg-[#0078d4] text-white" onClick={addCourse}>
                Add Course
              </Button>
            </div>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="overflow-hidden border border-[#edebe9] bg-white shadow-sm">
            <div className="border-b border-[#edebe9] px-5 py-4">
              <h2 className="text-lg font-semibold text-[#323130]">Teams</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px]">
                <thead>
                  <tr className="border-b border-[#edebe9] bg-[#faf9f8]">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#605e5c]">Team</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#605e5c]">Manager</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#605e5c]">Learners</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team) => (
                    <tr key={team.id} className="border-b border-[#f3f2f1] hover:bg-[#faf9f8]">
                      <td className="px-4 py-4 text-sm font-medium text-[#323130]">{team.name}</td>
                      <td className="px-4 py-4 text-sm text-[#605e5c]">{team.manager_name ?? 'Unassigned'}</td>
                      <td className="px-4 py-4 text-sm text-[#605e5c]">{learnerCountByTeam[team.id] ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="overflow-hidden border border-[#edebe9] bg-white shadow-sm">
            <div className="border-b border-[#edebe9] px-5 py-4">
              <h2 className="text-lg font-semibold text-[#323130]">Courses</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px]">
                <thead>
                  <tr className="border-b border-[#edebe9] bg-[#faf9f8]">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#605e5c]">Course</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#605e5c]">Provider</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#605e5c]">Level</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#605e5c]">Weeks</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course.id} className="border-b border-[#f3f2f1] hover:bg-[#faf9f8]">
                      <td className="px-4 py-4 text-sm font-medium text-[#323130]">{course.name}</td>
                      <td className="px-4 py-4 text-sm text-[#605e5c]">{course.provider ?? 'Internal'}</td>
                      <td className="px-4 py-4 text-sm text-[#605e5c]">{course.level ?? 'Unspecified'}</td>
                      <td className="px-4 py-4 text-sm text-[#605e5c]">{course.duration_weeks ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <Card className="overflow-hidden border border-[#edebe9] bg-white shadow-sm">
          <div className="border-b border-[#edebe9] px-5 py-4">
            <h2 className="text-lg font-semibold text-[#323130]">Certification Cases</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead>
                <tr className="border-b border-[#edebe9] bg-[#faf9f8]">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#605e5c]">Learner</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#605e5c]">Team</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#605e5c]">Certificate Course</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#605e5c]">Stage</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#605e5c]">Risk</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#605e5c]">Progress</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[#605e5c]">Action</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((certificationCase) => (
                  <tr key={certificationCase.id} className="border-b border-[#f3f2f1] hover:bg-[#faf9f8]">
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-[#323130]">{certificationCase.full_name}</div>
                      <div className="text-xs text-[#605e5c]">{certificationCase.email}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-[#605e5c]">{certificationCase.team_name ?? 'Unassigned'}</td>
                    <td className="px-4 py-4 text-sm text-[#323130]">{certificationCase.course_name}</td>
                    <td className="px-4 py-4 text-sm text-[#605e5c]">{certificationCase.current_stage}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                        certificationCase.risk_level === 'High'
                          ? 'bg-[#fde7e9] text-[#d13438]'
                          : certificationCase.risk_level === 'Medium'
                          ? 'bg-[#fff4ce] text-[#8a6116]'
                          : 'bg-[#dff6dd] text-[#107c10]'
                      }`}>
                        {certificationCase.risk_level}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-2 min-w-[140px] flex-1 rounded-full bg-[#e1dfdd]">
                          <div className="h-2 rounded-full bg-[#0078d4]" style={{ width: `${certificationCase.progress}%` }} />
                        </div>
                        <span className="w-9 text-right text-xs font-medium text-[#605e5c]">{certificationCase.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button appearance="subtle" size="small" onClick={() => startCase(certificationCase.id)}>
                        Start Case
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
