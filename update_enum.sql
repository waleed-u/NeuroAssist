USE neuroassist;

-- Alter the users table to include both old and new user types
ALTER TABLE users MODIFY COLUMN user_type ENUM('patient', 'doctor', 'staff', 'consultant', 'jr_doctor') NOT NULL; 