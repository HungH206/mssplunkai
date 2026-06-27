IF OBJECT_ID('Learners', 'U') IS NULL
BEGIN
  THROW 51000, 'Learners is missing. Run database/base_tables.sql before database/agent_tables.sql.', 1;
END;

IF OBJECT_ID('CertificateCourses', 'U') IS NULL
BEGIN
  THROW 51000, 'CertificateCourses is missing. Run database/base_tables.sql before database/agent_tables.sql.', 1;
END;

IF OBJECT_ID('LearnerCourses', 'U') IS NULL
BEGIN
  THROW 51000, 'LearnerCourses is missing. Run database/base_tables.sql before database/agent_tables.sql.', 1;
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
