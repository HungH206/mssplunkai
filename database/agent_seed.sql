IF OBJECT_ID('LearnerAvailability', 'U') IS NULL
BEGIN
  THROW 51000, 'LearnerAvailability is missing. Run database/agent_tables.sql before database/agent_seed.sql.', 1;
END;

IF OBJECT_ID('CertificationCases', 'U') IS NULL
BEGIN
  THROW 51000, 'CertificationCases is missing. Run database/agent_tables.sql before database/agent_seed.sql.', 1;
END;

INSERT INTO LearnerAvailability (learner_id, meeting_hours, focus_hours, preferred_study_time)
SELECT id, 12, 6, 'Evening'
FROM Learners
WHERE NOT EXISTS (
  SELECT 1
  FROM LearnerAvailability
  WHERE LearnerAvailability.learner_id = Learners.id
);

INSERT INTO CertificationCases (
  learner_id,
  course_id,
  status,
  current_stage,
  risk_level,
  manager_status
)
SELECT
  lc.learner_id,
  lc.course_id,
  lc.status,
  CASE
    WHEN lc.status = 'Certified' THEN 'Certified'
    WHEN lc.status = 'Ready' THEN 'Manager Review'
    WHEN lc.status = 'At Risk' THEN 'Intervention'
    WHEN lc.progress > 0 THEN 'Learning'
    ELSE 'Intake'
  END,
  CASE
    WHEN lc.status = 'At Risk' OR lc.readiness < 50 THEN 'High'
    WHEN lc.readiness < 75 THEN 'Medium'
    ELSE 'Low'
  END,
  CASE
    WHEN lc.status IN ('Ready', 'At Risk') THEN 'Needs Review'
    ELSE 'Pending Review'
  END
FROM LearnerCourses lc
WHERE NOT EXISTS (
  SELECT 1
  FROM CertificationCases cc
  WHERE cc.learner_id = lc.learner_id
    AND cc.course_id = lc.course_id
);
