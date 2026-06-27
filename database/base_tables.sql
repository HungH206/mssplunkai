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
