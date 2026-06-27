IF OBJECT_ID('vw_CertificationCases', 'V') IS NOT NULL
BEGIN
  DROP VIEW vw_CertificationCases;
END;
GO

CREATE VIEW vw_CertificationCases AS
SELECT
  cc.id,
  cc.learner_id,
  l.full_name,
  l.email,
  t.id AS team_id,
  t.name AS team_name,
  cc.course_id,
  c.name AS course_name,
  c.provider,
  c.level,
  c.duration_weeks,
  ISNULL(lc.id, 0) AS learner_course_id,
  ISNULL(lc.progress, 0) AS progress,
  ISNULL(lc.readiness, 0) AS readiness,
  cc.status,
  cc.current_stage,
  cc.risk_level,
  cc.manager_status,
  lc.exam_date,
  cc.created_at,
  cc.updated_at
FROM CertificationCases cc
JOIN Learners l ON l.id = cc.learner_id
LEFT JOIN Teams t ON t.id = l.team_id
JOIN CertificateCourses c ON c.id = cc.course_id
LEFT JOIN LearnerCourses lc
  ON lc.learner_id = cc.learner_id
 AND lc.course_id = cc.course_id;
GO
