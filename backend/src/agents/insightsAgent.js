const { query } = require('../services/sql');

async function generateInsights() {
  const [summary] = await query(`
    SELECT
      COUNT(DISTINCT l.id) AS totalLearners,
      COUNT(DISTINCT c.id) AS activeCourses,
      COUNT(DISTINCT cc.id) AS activeCases,
      AVG(CAST(ISNULL(lc.readiness, 0) AS FLOAT)) AS averageReadiness,
      COUNT(CASE WHEN cc.risk_level = 'High' OR cc.status = 'At Risk' THEN 1 END) AS highRiskCount,
      COUNT(CASE WHEN cc.status = 'Certified' THEN 1 END) AS certifiedCount
    FROM Learners l
    LEFT JOIN CertificationCases cc ON cc.learner_id = l.id
    LEFT JOIN LearnerCourses lc ON lc.learner_id = cc.learner_id AND lc.course_id = cc.course_id
    LEFT JOIN CertificateCourses c ON c.id = cc.course_id
  `);

  const teamReadiness = await query(`
    SELECT
      t.name AS team,
      COUNT(l.id) AS learners,
      AVG(CAST(ISNULL(lc.readiness, 0) AS FLOAT)) AS readiness,
      COUNT(CASE WHEN cc.status = 'Certified' THEN 1 END) AS certified,
      COUNT(CASE WHEN cc.status IN ('In Progress', 'Not Started', 'Ready') THEN 1 END) AS inProgress,
      COUNT(CASE WHEN cc.risk_level = 'High' OR cc.status = 'At Risk' THEN 1 END) AS highRisk
    FROM Teams t
    LEFT JOIN Learners l ON l.team_id = t.id
    LEFT JOIN CertificationCases cc ON cc.learner_id = l.id
    LEFT JOIN LearnerCourses lc ON lc.learner_id = cc.learner_id AND lc.course_id = cc.course_id
    GROUP BY t.name
    ORDER BY t.name
  `);

  const pipeline = await query(`
    SELECT
      current_stage AS stage,
      COUNT(*) AS count
    FROM CertificationCases
    GROUP BY current_stage
    ORDER BY current_stage
  `);

  const atRiskCases = await query(`
    SELECT TOP 8
      id,
      full_name,
      course_name,
      team_name,
      readiness,
      exam_date,
      risk_level,
      status,
      updated_at
    FROM vw_CertificationCases
    WHERE risk_level = 'High' OR status = 'At Risk'
    ORDER BY readiness ASC, updated_at DESC
  `);

  const predictedPassRate = Math.round(Math.min(95, Math.max(45, Number(summary.averageReadiness || 0) + 8)));
  const activeCases = summary.activeCases || 0;
  const certifiedCount = summary.certifiedCount || 0;
  const completionRate = activeCases ? Math.round((certifiedCount / activeCases) * 100) : 0;
  const pipelineTotal = pipeline.reduce((total, item) => total + Number(item.count || 0), 0);

  return {
    totalLearners: summary.totalLearners || 0,
    activeCourses: summary.activeCourses || 0,
    activeCases,
    averageReadiness: Math.round(summary.averageReadiness || 0),
    highRiskCount: summary.highRiskCount || 0,
    completionRate,
    predictedPassRate,
    teamReadiness: teamReadiness.map((team) => ({
      team: team.team,
      learners: team.learners || 0,
      readiness: Math.round(team.readiness || 0),
      certified: team.certified || 0,
      inProgress: team.inProgress || 0,
      highRisk: team.highRisk || 0,
    })),
    certificationPipeline: pipeline.map((item) => ({
      stage: item.stage,
      count: item.count,
      percentage: pipelineTotal ? Math.round((Number(item.count || 0) / pipelineTotal) * 100) : 0,
    })),
    atRiskCases,
  };
}

module.exports = {
  generateInsights,
};
