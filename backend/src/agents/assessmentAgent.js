const { query, sql } = require('../services/sql');
const { generateJson } = require('../services/gemini');

async function generateAssessment({ learnerId, courseId }) {
  const rows = await query(
    `
      SELECT
        l.id AS learner_id,
        l.full_name,
        c.id AS course_id,
        c.name AS course_name,
        c.provider,
        c.level
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
    questions: [
      { question: `What is a core concept in ${context.course_name}?`, answer: 'Review course objectives and platform fundamentals.' },
      { question: 'Which area should the learner practice next?', answer: 'Hands-on labs and scenario questions.' },
    ],
    score: 72,
    readiness: 'Medium',
  };

  const assessment = await generateJson(
    `Generate a short certification assessment for ${context.full_name}.
Course: ${context.provider} ${context.course_name}
Level: ${context.level}
JSON shape: {"questions":[{"question":"text","answer":"text"}],"score":72,"readiness":"Medium"}`,
    fallback,
  );

  const saved = await query(
    `
      INSERT INTO AssessmentResults (learner_id, course_id, questions_json, score, readiness)
      OUTPUT inserted.id
      VALUES (@learnerId, @courseId, @questionsJson, @score, @readiness)
    `,
    {
      learnerId: { type: sql.Int, value: learnerId },
      courseId: { type: sql.Int, value: courseId },
      questionsJson: { type: sql.NVarChar(sql.MAX), value: JSON.stringify(assessment.questions || []) },
      score: { type: sql.Int, value: assessment.score || null },
      readiness: { type: sql.NVarChar(50), value: assessment.readiness || null },
    },
  );

  return { id: saved[0].id, ...assessment };
}

module.exports = {
  generateAssessment,
};
