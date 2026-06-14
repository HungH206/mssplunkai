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
