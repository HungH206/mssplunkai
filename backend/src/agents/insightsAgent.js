const { query } = require('../services/sql');

async function generateInsights() {
  const [summary] = await query(`
    SELECT
      COUNT(DISTINCT l.id) AS totalLearners,
      COUNT(DISTINCT c.id) AS activeCourses,
      AVG(CAST(lc.readiness AS FLOAT)) AS averageReadiness,
      COUNT(CASE WHEN lc.status = 'At Risk' THEN 1 END) AS highRiskCount
    FROM Learners l
    LEFT JOIN LearnerCourses lc ON lc.learner_id = l.id
    LEFT JOIN CertificateCourses c ON c.id = lc.course_id
  `);

  const teamReadiness = await query(`
    SELECT
      t.name AS team,
      COUNT(l.id) AS learners,
      AVG(CAST(lc.readiness AS FLOAT)) AS readiness,
      COUNT(CASE WHEN lc.status = 'At Risk' THEN 1 END) AS highRisk
    FROM Teams t
    LEFT JOIN Learners l ON l.team_id = t.id
    LEFT JOIN LearnerCourses lc ON lc.learner_id = l.id
    GROUP BY t.name
    ORDER BY t.name
  `);

  const predictedPassRate = Math.round(Math.min(95, Math.max(45, Number(summary.averageReadiness || 0) + 8)));

  return {
    totalLearners: summary.totalLearners || 0,
    activeCourses: summary.activeCourses || 0,
    averageReadiness: Math.round(summary.averageReadiness || 0),
    highRiskCount: summary.highRiskCount || 0,
    predictedPassRate,
    teamReadiness,
  };
}

module.exports = {
  generateInsights,
};
