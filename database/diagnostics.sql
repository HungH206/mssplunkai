SELECT DB_NAME() AS current_database;

SELECT
  s.name AS schema_name,
  o.name AS object_name,
  o.type_desc
FROM sys.objects o
JOIN sys.schemas s ON s.schema_id = o.schema_id
WHERE o.name IN (
  'Teams',
  'Learners',
  'CertificateCourses',
  'LearnerCourses',
  'CertificationCases',
  'vw_CertificationCases',
  'LearningPlans',
  'StudyPlans',
  'AssessmentResults',
  'LearnerAvailability'
)
ORDER BY o.name;

SELECT
  OBJECT_ID('dbo.CertificationCases', 'U') AS certification_cases_table_id,
  OBJECT_ID('dbo.vw_CertificationCases', 'V') AS certification_cases_view_id;
