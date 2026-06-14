INSERT INTO LearnerAvailability (learner_id, meeting_hours, focus_hours, preferred_study_time)
SELECT id, 12, 6, 'Evening'
FROM Learners
WHERE NOT EXISTS (
  SELECT 1
  FROM LearnerAvailability
  WHERE LearnerAvailability.learner_id = Learners.id
);
