import { useMemo, useState } from 'react';
import { Button, Card, Input } from '@fluentui/react-components';
import { AddRegular, CertificateRegular, PeopleRegular } from '@fluentui/react-icons';
import { certificationData } from '../data/mockData';

type Team = {
  id: number;
  name: string;
  manager: string;
  learners: number;
};

type Person = {
  id: number;
  name: string;
  email: string;
  team: string;
  course: string;
  progress: number;
};

type Course = {
  id: number;
  name: string;
  provider: string;
  level: string;
  durationWeeks: number;
  owner: string;
};

export function AdminSetup() {
  const initialTeams = useMemo<Team[]>(
    () =>
      certificationData.teamReadiness.map((team, index) => ({
        id: index + 1,
        name: team.team,
        manager: index === 0 ? 'Admin User' : 'Team Lead',
        learners: team.total,
      })),
    [],
  );

  const initialCourses = useMemo<Course[]>(
    () =>
      certificationData.certificateCourses.map((course) => ({
        id: course.id,
        name: course.name,
        provider: course.provider,
        level: course.level,
        durationWeeks: course.durationWeeks,
        owner: course.owner,
      })),
    [],
  );

  const initialPeople = useMemo<Person[]>(
    () =>
      certificationData.learners.map((learner) => ({
        id: learner.id,
        name: learner.name,
        email: learner.email,
        team: learner.team,
        course: learner.currentCert,
        progress: learner.progress,
      })),
    [],
  );

  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [people, setPeople] = useState<Person[]>(initialPeople);

  const [teamForm, setTeamForm] = useState({ name: '', manager: '' });
  const [courseForm, setCourseForm] = useState({
    name: '',
    provider: '',
    level: 'Associate',
    durationWeeks: '6',
    owner: initialTeams[0]?.name ?? '',
  });
  const [personForm, setPersonForm] = useState({
    name: '',
    email: '',
    team: initialTeams[0]?.name ?? '',
    course: initialCourses[0]?.name ?? '',
  });

  const nextId = (items: Array<{ id: number }>) => Math.max(0, ...items.map((item) => item.id)) + 1;

  const addTeam = () => {
    if (!teamForm.name.trim()) return;

    const team = {
      id: nextId(teams),
      name: teamForm.name.trim(),
      manager: teamForm.manager.trim() || 'Unassigned',
      learners: 0,
    };

    setTeams((currentTeams) => [...currentTeams, team]);
    setTeamForm({ name: '', manager: '' });

    if (!courseForm.owner) {
      setCourseForm((currentForm) => ({ ...currentForm, owner: team.name }));
    }

    if (!personForm.team) {
      setPersonForm((currentForm) => ({ ...currentForm, team: team.name }));
    }
  };

  const addCourse = () => {
    if (!courseForm.name.trim()) return;

    const course = {
      id: nextId(courses),
      name: courseForm.name.trim(),
      provider: courseForm.provider.trim() || 'Internal',
      level: courseForm.level,
      durationWeeks: Number(courseForm.durationWeeks) || 6,
      owner: courseForm.owner || teams[0]?.name || 'Unassigned',
    };

    setCourses((currentCourses) => [...currentCourses, course]);
    setCourseForm({
      name: '',
      provider: '',
      level: 'Associate',
      durationWeeks: '6',
      owner: course.owner,
    });

    if (!personForm.course) {
      setPersonForm((currentForm) => ({ ...currentForm, course: course.name }));
    }
  };

  const addPerson = () => {
    if (!personForm.name.trim()) return;

    const person = {
      id: nextId(people),
      name: personForm.name.trim(),
      email: personForm.email.trim() || `${personForm.name.trim().toLowerCase().replaceAll(' ', '.')}@company.com`,
      team: personForm.team || teams[0]?.name || 'Unassigned',
      course: personForm.course || courses[0]?.name || 'Unassigned',
      progress: 0,
    };

    setPeople((currentPeople) => [...currentPeople, person]);
    setTeams((currentTeams) =>
      currentTeams.map((team) => (team.name === person.team ? { ...team, learners: team.learners + 1 } : team)),
    );
    setPersonForm({
      name: '',
      email: '',
      team: person.team,
      course: person.course,
    });
  };

  return (
    <div className="h-full overflow-auto bg-[#faf9f8]">
      <div className="border-b border-[#edebe9] bg-white px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-[#323130]">Admin Setup</h1>
          <p className="text-sm text-[#605e5c]">Add teams, people, and certificate courses to track learner progress.</p>
        </div>
      </div>

      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
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
                <p className="text-sm text-[#605e5c]">People</p>
                <p className="text-3xl font-semibold text-[#323130]">{people.length}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#e8f2fb]">
                <PeopleRegular className="h-6 w-6 text-[#0078d4]" />
              </div>
            </div>
            <p className="text-xs text-[#605e5c]">Learners currently assigned to certification tracks.</p>
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
            <h2 className="mb-4 text-lg font-semibold text-[#323130]">Add Person</h2>
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
                value={personForm.team}
                onChange={(event) => setPersonForm((form) => ({ ...form, team: event.target.value }))}
              >
                {teams.map((team) => (
                  <option key={team.id} value={team.name}>
                    {team.name}
                  </option>
                ))}
              </select>
              <select
                className="h-8 w-full rounded border border-[#d1d1d1] bg-white px-3 text-sm text-[#323130]"
                value={personForm.course}
                onChange={(event) => setPersonForm((form) => ({ ...form, course: event.target.value }))}
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.name}>
                    {course.name}
                  </option>
                ))}
              </select>
              <Button appearance="primary" icon={<AddRegular />} className="w-full bg-[#0078d4] text-white" onClick={addPerson}>
                Add Person
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
              <select
                className="h-8 w-full rounded border border-[#d1d1d1] bg-white px-3 text-sm text-[#323130]"
                value={courseForm.owner}
                onChange={(event) => setCourseForm((form) => ({ ...form, owner: event.target.value }))}
              >
                {teams.map((team) => (
                  <option key={team.id} value={team.name}>
                    {team.name}
                  </option>
                ))}
              </select>
              <Button appearance="primary" icon={<AddRegular />} className="w-full bg-[#0078d4] text-white" onClick={addCourse}>
                Add Course
              </Button>
            </div>
          </Card>
        </div>

        <Card className="overflow-hidden border border-[#edebe9] bg-white shadow-sm">
          <div className="border-b border-[#edebe9] px-5 py-4">
            <h2 className="text-lg font-semibold text-[#323130]">Tracked Assignments</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px]">
              <thead>
                <tr className="border-b border-[#edebe9] bg-[#faf9f8]">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#605e5c]">Person</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#605e5c]">Team</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#605e5c]">Certificate Course</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#605e5c]">Progress</th>
                </tr>
              </thead>
              <tbody>
                {people.map((person) => (
                  <tr key={person.id} className="border-b border-[#f3f2f1] hover:bg-[#faf9f8]">
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-[#323130]">{person.name}</div>
                      <div className="text-xs text-[#605e5c]">{person.email}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-[#605e5c]">{person.team}</td>
                    <td className="px-4 py-4 text-sm text-[#323130]">{person.course}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-2 min-w-[140px] flex-1 rounded-full bg-[#e1dfdd]">
                          <div className="h-2 rounded-full bg-[#0078d4]" style={{ width: `${person.progress}%` }} />
                        </div>
                        <span className="w-9 text-right text-xs font-medium text-[#605e5c]">{person.progress}%</span>
                      </div>
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
