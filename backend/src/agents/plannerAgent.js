const { query, sql } = require('../services/sql');
const { generateJson } = require('../services/gemini');

async function generateStudyPlan({ learnerCourseId }) {
  const rows = await query(
    `
      SELECT
        lc.id AS learner_course_id,
        l.id AS learner_id,
        l.full_name,
        c.name AS course_name,
        lc.progress,
        lc.readiness,
        lc.status,
        lc.exam_date,
        ISNULL(la.meeting_hours, 0) AS meeting_hours,
        ISNULL(la.focus_hours, 5) AS focus_hours,
        ISNULL(la.preferred_study_time, 'Evening') AS preferred_study_time
      FROM LearnerCourses lc
      JOIN Learners l ON l.id = lc.learner_id
      JOIN CertificateCourses c ON c.id = lc.course_id
      LEFT JOIN LearnerAvailability la ON la.learner_id = l.id
      WHERE lc.id = @learnerCourseId
    `,
    {
      learnerCourseId: { type: sql.Int, value: learnerCourseId },
    },
  );

  if (!rows[0]) {
    const error = new Error('Learner course assignment not found.');
    error.statusCode = 404;
    throw error;
  }

  const context = rows[0];
  const fallback = {
    learnerCourseId,
    learnerId: context.learner_id,
    schedule: [
      { week: 1, focus: 'Core concepts', hours: Math.min(6, context.focus_hours) },
      { week: 2, focus: 'Hands-on labs', hours: Math.min(6, context.focus_hours) },
      { week: 3, focus: 'Practice exams', hours: Math.min(6, context.focus_hours) },
    ],
    workIq: {
      meetingHours: context.meeting_hours,
      focusHours: context.focus_hours,
      preferredStudyTime: context.preferred_study_time,
    },
  };

  const plan = await generateJson(
    `Create a weekly study plan for ${context.full_name}.
Course: ${context.course_name}
Current progress: ${context.progress}
Readiness: ${context.readiness}
Status: ${context.status}
Exam date: ${context.exam_date}
Meeting hours: ${context.meeting_hours}
Focus hours: ${context.focus_hours}
Preferred study time: ${context.preferred_study_time}
JSON shape: {"schedule":[{"week":1,"focus":"topic","hours":4}],"workIq":{"meetingHours":12,"focusHours":6,"preferredStudyTime":"Evening"}}`,
    fallback,
  );

  const saved = await query(
    `
      INSERT INTO StudyPlans (learner_id, learner_course_id, generated_plan)
      OUTPUT inserted.id
      VALUES (@learnerId, @learnerCourseId, @generatedPlan)
    `,
    {
      learnerId: { type: sql.Int, value: context.learner_id },
      learnerCourseId: { type: sql.Int, value: learnerCourseId },
      generatedPlan: { type: sql.NVarChar(sql.MAX), value: JSON.stringify(plan) },
    },
  );

  return { id: saved[0].id, ...plan };
}

module.exports = {
  generateStudyPlan,
};
