IF OBJECT_ID('Teams', 'U') IS NULL
BEGIN
  CREATE TABLE Teams (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(120) NOT NULL,
    manager_name NVARCHAR(120) NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
  );
END;

IF OBJECT_ID('Learners', 'U') IS NULL
BEGIN
  CREATE TABLE Learners (
    id INT IDENTITY(1,1) PRIMARY KEY,
    full_name NVARCHAR(160) NOT NULL,
    email NVARCHAR(255) NOT NULL UNIQUE,
    team_id INT NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_Learners_Teams
      FOREIGN KEY (team_id) REFERENCES Teams(id)
  );
END;

IF OBJECT_ID('CertificateCourses', 'U') IS NULL
BEGIN
  CREATE TABLE CertificateCourses (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(160) NOT NULL,
    provider NVARCHAR(120) NULL,
    level NVARCHAR(80) NULL,
    duration_weeks INT NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
  );
END;

IF OBJECT_ID('LearnerCourses', 'U') IS NULL
BEGIN
  CREATE TABLE LearnerCourses (
    id INT IDENTITY(1,1) PRIMARY KEY,
    learner_id INT NOT NULL,
    course_id INT NOT NULL,
    progress INT NOT NULL DEFAULT 0,
    readiness INT NOT NULL DEFAULT 0,
    status NVARCHAR(50) NOT NULL DEFAULT 'Not Started',
    exam_date DATE NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_LearnerCourses_Learners
      FOREIGN KEY (learner_id) REFERENCES Learners(id),

    CONSTRAINT FK_LearnerCourses_Courses
      FOREIGN KEY (course_id) REFERENCES CertificateCourses(id),

    CONSTRAINT CK_LearnerCourses_Progress
      CHECK (progress >= 0 AND progress <= 100),

    CONSTRAINT CK_LearnerCourses_Readiness
      CHECK (readiness >= 0 AND readiness <= 100)
  );
END;

IF NOT EXISTS (
  SELECT 1
  FROM sys.indexes
  WHERE name = 'UX_LearnerCourses_LearnerCourse'
    AND object_id = OBJECT_ID('LearnerCourses')
)
BEGIN
  CREATE UNIQUE INDEX UX_LearnerCourses_LearnerCourse
    ON LearnerCourses (learner_id, course_id);
END;

IF OBJECT_ID('LearningPlans', 'U') IS NULL
BEGIN
  CREATE TABLE LearningPlans (
    id INT IDENTITY(1,1) PRIMARY KEY,
    learner_id INT NOT NULL,
    course_id INT NOT NULL,
    generated_plan NVARCHAR(MAX) NOT NULL,
    estimated_hours INT NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_LearningPlans_Learners
      FOREIGN KEY (learner_id) REFERENCES Learners(id),

    CONSTRAINT FK_LearningPlans_Courses
      FOREIGN KEY (course_id) REFERENCES CertificateCourses(id),

    CONSTRAINT CK_LearningPlans_GeneratedPlan_IsJson
      CHECK (ISJSON(generated_plan) = 1)
  );
END;

IF OBJECT_ID('LearnerAvailability', 'U') IS NULL
BEGIN
  CREATE TABLE LearnerAvailability (
    id INT IDENTITY(1,1) PRIMARY KEY,
    learner_id INT NOT NULL UNIQUE,
    meeting_hours INT NOT NULL DEFAULT 0,
    focus_hours INT NOT NULL DEFAULT 5,
    preferred_study_time NVARCHAR(50) NOT NULL DEFAULT 'Evening',
    updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_LearnerAvailability_Learners
      FOREIGN KEY (learner_id) REFERENCES Learners(id)
  );
END;

IF OBJECT_ID('CertificationCases', 'U') IS NULL
BEGIN
  CREATE TABLE CertificationCases (
    id INT IDENTITY(1,1) PRIMARY KEY,
    learner_id INT NOT NULL,
    course_id INT NOT NULL,
    status NVARCHAR(50) NOT NULL DEFAULT 'Not Started',
    current_stage NVARCHAR(80) NOT NULL DEFAULT 'Intake',
    risk_level NVARCHAR(50) NOT NULL DEFAULT 'Low',
    manager_status NVARCHAR(50) NOT NULL DEFAULT 'Pending Review',
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_CertificationCases_Learners
      FOREIGN KEY (learner_id) REFERENCES Learners(id),

    CONSTRAINT FK_CertificationCases_Courses
      FOREIGN KEY (course_id) REFERENCES CertificateCourses(id)
  );
END;

IF NOT EXISTS (
  SELECT 1
  FROM sys.indexes
  WHERE name = 'UX_CertificationCases_LearnerCourse'
    AND object_id = OBJECT_ID('CertificationCases')
)
BEGIN
  CREATE UNIQUE INDEX UX_CertificationCases_LearnerCourse
    ON CertificationCases (learner_id, course_id);
END;

IF OBJECT_ID('StudyPlans', 'U') IS NULL
BEGIN
  CREATE TABLE StudyPlans (
    id INT IDENTITY(1,1) PRIMARY KEY,
    learner_id INT NOT NULL,
    learner_course_id INT NULL,
    generated_plan NVARCHAR(MAX) NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_StudyPlans_Learners
      FOREIGN KEY (learner_id) REFERENCES Learners(id),

    CONSTRAINT FK_StudyPlans_LearnerCourses
      FOREIGN KEY (learner_course_id) REFERENCES LearnerCourses(id),

    CONSTRAINT CK_StudyPlans_GeneratedPlan_IsJson
      CHECK (ISJSON(generated_plan) = 1)
  );
END;

IF OBJECT_ID('AssessmentResults', 'U') IS NULL
BEGIN
  CREATE TABLE AssessmentResults (
    id INT IDENTITY(1,1) PRIMARY KEY,
    learner_id INT NOT NULL,
    course_id INT NOT NULL,
    questions_json NVARCHAR(MAX) NULL,
    score INT NULL,
    readiness NVARCHAR(50) NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_AssessmentResults_Learners
      FOREIGN KEY (learner_id) REFERENCES Learners(id),

    CONSTRAINT FK_AssessmentResults_Courses
      FOREIGN KEY (course_id) REFERENCES CertificateCourses(id),

    CONSTRAINT CK_AssessmentResults_Questions_IsJson
      CHECK (questions_json IS NULL OR ISJSON(questions_json) = 1)
  );
END;

IF COL_LENGTH('LearningPlans', 'certification_case_id') IS NULL
BEGIN
  ALTER TABLE LearningPlans ADD certification_case_id INT NULL;
END;

IF COL_LENGTH('StudyPlans', 'certification_case_id') IS NULL
BEGIN
  ALTER TABLE StudyPlans ADD certification_case_id INT NULL;
END;

IF COL_LENGTH('AssessmentResults', 'certification_case_id') IS NULL
BEGIN
  ALTER TABLE AssessmentResults ADD certification_case_id INT NULL;
END;

IF NOT EXISTS (
  SELECT 1
  FROM sys.foreign_keys
  WHERE name = 'FK_LearningPlans_CertificationCases'
)
BEGIN
  ALTER TABLE LearningPlans
    ADD CONSTRAINT FK_LearningPlans_CertificationCases
    FOREIGN KEY (certification_case_id) REFERENCES CertificationCases(id);
END;

IF NOT EXISTS (
  SELECT 1
  FROM sys.foreign_keys
  WHERE name = 'FK_StudyPlans_CertificationCases'
)
BEGIN
  ALTER TABLE StudyPlans
    ADD CONSTRAINT FK_StudyPlans_CertificationCases
    FOREIGN KEY (certification_case_id) REFERENCES CertificationCases(id);
END;

IF NOT EXISTS (
  SELECT 1
  FROM sys.foreign_keys
  WHERE name = 'FK_AssessmentResults_CertificationCases'
)
BEGIN
  ALTER TABLE AssessmentResults
    ADD CONSTRAINT FK_AssessmentResults_CertificationCases
    FOREIGN KEY (certification_case_id) REFERENCES CertificationCases(id);
END;

IF NOT EXISTS (SELECT 1 FROM Teams)
BEGIN
  INSERT INTO Teams (name, manager_name)
  VALUES
    ('Engineering', 'Admin User'),
    ('DevOps', 'Team Lead'),
    ('Cloud Architecture', 'Team Lead'),
    ('Security', 'Team Lead'),
    ('Data Engineering', 'Team Lead');
END;

IF NOT EXISTS (SELECT 1 FROM CertificateCourses)
BEGIN
  INSERT INTO CertificateCourses (name, provider, level, duration_weeks)
  VALUES
    ('AWS Solutions Architect', 'AWS', 'Associate', 8),
    ('Azure Administrator', 'Microsoft', 'Associate', 6),
    ('Kubernetes CKA', 'Linux Foundation', 'Professional', 10),
    ('GCP Professional Cloud Architect', 'Google Cloud', 'Professional', 10),
    ('Azure Security Engineer', 'Microsoft', 'Associate', 8);
END;

IF NOT EXISTS (SELECT 1 FROM Learners)
BEGIN
  INSERT INTO Learners (full_name, email, team_id)
  SELECT 'Sarah Johnson', 'sarah.j@company.com', id FROM Teams WHERE name = 'Engineering'
  UNION ALL
  SELECT 'Michael Chen', 'michael.c@company.com', id FROM Teams WHERE name = 'DevOps'
  UNION ALL
  SELECT 'Emily Rodriguez', 'emily.r@company.com', id FROM Teams WHERE name = 'Cloud Architecture'
  UNION ALL
  SELECT 'David Park', 'david.p@company.com', id FROM Teams WHERE name = 'Security'
  UNION ALL
  SELECT 'Lisa Anderson', 'lisa.a@company.com', id FROM Teams WHERE name = 'Data Engineering';
END;

IF NOT EXISTS (SELECT 1 FROM LearnerCourses)
BEGIN
  INSERT INTO LearnerCourses (learner_id, course_id, progress, readiness, status, exam_date)
  SELECT l.id, c.id, 65, 45, 'At Risk', DATEADD(DAY, 14, CAST(GETDATE() AS DATE))
  FROM Learners l
  CROSS JOIN CertificateCourses c
  WHERE l.email = 'sarah.j@company.com'
    AND c.name = 'AWS Solutions Architect'
  UNION ALL
  SELECT l.id, c.id, 72, 82, 'Ready', DATEADD(DAY, 28, CAST(GETDATE() AS DATE))
  FROM Learners l
  CROSS JOIN CertificateCourses c
  WHERE l.email = 'michael.c@company.com'
    AND c.name = 'Azure Administrator'
  UNION ALL
  SELECT l.id, c.id, 58, 71, 'In Progress', DATEADD(DAY, 35, CAST(GETDATE() AS DATE))
  FROM Learners l
  CROSS JOIN CertificateCourses c
  WHERE l.email = 'emily.r@company.com'
    AND c.name = 'Kubernetes CKA'
  UNION ALL
  SELECT l.id, c.id, 88, 91, 'Ready', DATEADD(DAY, 21, CAST(GETDATE() AS DATE))
  FROM Learners l
  CROSS JOIN CertificateCourses c
  WHERE l.email = 'david.p@company.com'
    AND c.name = 'GCP Professional Cloud Architect'
  UNION ALL
  SELECT l.id, c.id, 42, 41, 'At Risk', DATEADD(DAY, 18, CAST(GETDATE() AS DATE))
  FROM Learners l
  CROSS JOIN CertificateCourses c
  WHERE l.email = 'lisa.a@company.com'
    AND c.name = 'Azure Security Engineer';
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

EXEC(N'
CREATE OR ALTER VIEW dbo.vw_CertificationCases AS
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
FROM dbo.CertificationCases cc
JOIN dbo.Learners l ON l.id = cc.learner_id
LEFT JOIN dbo.Teams t ON t.id = l.team_id
JOIN dbo.CertificateCourses c ON c.id = cc.course_id
LEFT JOIN dbo.LearnerCourses lc
  ON lc.learner_id = cc.learner_id
 AND lc.course_id = cc.course_id;
');

SELECT
  DB_NAME() AS current_database,
  OBJECT_ID('dbo.CertificationCases', 'U') AS certification_cases_table_id,
  OBJECT_ID('dbo.vw_CertificationCases', 'V') AS certification_cases_view_id,
  (SELECT COUNT(*) FROM CertificationCases) AS certification_case_count;
