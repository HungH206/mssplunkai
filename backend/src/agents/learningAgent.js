const { query, sql } = require('../services/sql');
const { generateJson } = require('../services/gemini');

async function generateLearningPlan({ learnerId, courseId }) {
  const rows = await query(
    `
      SELECT
        l.id AS learner_id,
        l.full_name,
        c.id AS course_id,
        c.name AS course_name,
        c.provider,
        c.level,
        c.duration_weeks
      FROM Learners l
      CROSS JOIN CertificateCourses c
      WHERE l.id = @learnerId AND c.id = @courseId
    `,
    {
      learnerId: { type: sql.Int, value: learnerId },
      courseId: { type: sql.Int, value: courseId },
    },
  );

  if (!rows[0]) {
    const error = new Error('Learner or course not found.');
    error.statusCode = 404;
    throw error;
  }

  const context = rows[0];
  const fallback = {
    learnerId,
    courseId,
    skills: [context.course_name, 'Core concepts', 'Hands-on practice', 'Exam review'],
    estimatedHours: Math.max(10, Number(context.duration_weeks || 4) * 3),
  };

  const plan = await generateJson(
    `Create a concise certification learning plan for ${context.full_name}.
Course: ${context.provider} ${context.course_name}
Level: ${context.level}
Duration weeks: ${context.duration_weeks}
JSON shape: {"skills":["skill"],"estimatedHours":20}`,
    fallback,
  );

  const saved = await query(
    `
      INSERT INTO LearningPlans (learner_id, course_id, generated_plan, estimated_hours)
      OUTPUT inserted.id
      VALUES (@learnerId, @courseId, @generatedPlan, @estimatedHours)
    `,
    {
      learnerId: { type: sql.Int, value: learnerId },
      courseId: { type: sql.Int, value: courseId },
      generatedPlan: { type: sql.NVarChar(sql.MAX), value: JSON.stringify(plan) },
      estimatedHours: { type: sql.Int, value: plan.estimatedHours || null },
    },
  );

  return { id: saved[0].id, ...plan };
}

module.exports = {
  generateLearningPlan,
};
