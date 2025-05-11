-- Drop database if exists and create new one
DROP DATABASE IF EXISTS neuroassist;
CREATE DATABASE neuroassist;
USE neuroassist;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    user_type ENUM('patient', 'consultant', 'junior_doctor') NOT NULL, -- Changed terminology here
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Patients table - contains biographical details
CREATE TABLE patients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    patient_id VARCHAR(20) UNIQUE NOT NULL, -- External patient identifier
    date_of_birth DATE,
    gender ENUM('M', 'F', 'Other'),
    contact_number VARCHAR(20),
    address TEXT,
    medical_history TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Consultants table (renamed from Doctors)
CREATE TABLE consultants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    specialization VARCHAR(100),
    department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Junior Doctors table (renamed from Staff)
CREATE TABLE junior_doctors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    role VARCHAR(50),
    department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- EEG Records table
CREATE TABLE eeg_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    consultant_id INT NOT NULL, -- Renamed from doctor_id
    file_path VARCHAR(255) NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    status ENUM('pending', 'processed', 'analyzed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (consultant_id) REFERENCES consultants(id)
);

-- EEG Recordings table
CREATE TABLE eeg_recordings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    recording_date DATETIME NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    duration INT, -- Duration in seconds
    sampling_rate INT, -- Sampling rate in Hz
    channels INT, -- Number of channels
    notes TEXT,
    status ENUM('pending', 'analyzed', 'archived') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- Analysis Results table
CREATE TABLE analysis_results (
    id INT PRIMARY KEY AUTO_INCREMENT,
    eeg_recording_id INT NOT NULL,
    status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
    classification ENUM('normal', 'abnormal') NOT NULL,
    confidence_score DECIMAL(5,2) NOT NULL,
    analysis_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    findings TEXT,
    interpretation TEXT,
    recommendations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (eeg_recording_id) REFERENCES eeg_recordings(id)
);

-- Conceptual Sensitivities table
CREATE TABLE conceptual_sensitivities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    analysis_result_id INT NOT NULL,
    concept_name VARCHAR(100) NOT NULL,
    sensitivity_score DECIMAL(5,2) NOT NULL,
    timestamp_start DATETIME NOT NULL,
    timestamp_end DATETIME NOT NULL,
    channel VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (analysis_result_id) REFERENCES analysis_results(id)
);

-- Patient-Consultant Relationships table (renamed from Patient-Doctor)
CREATE TABLE patient_consultant_relationships (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    consultant_id INT NOT NULL, -- Renamed from doctor_id
    start_date DATE NOT NULL,
    end_date DATE,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (consultant_id) REFERENCES consultants(id)
);

-- Patient Medical Records table
CREATE TABLE patient_medical_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    record_date DATE NOT NULL,
    diagnosis TEXT,
    treatment_plan TEXT,
    medications TEXT,
    notes TEXT,
    created_by INT NOT NULL, -- Refers to consultant ID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (created_by) REFERENCES consultants(id)
);

-- Patient Vitals table
CREATE TABLE patient_vitals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    record_date DATE NOT NULL,
    blood_pressure VARCHAR(20),
    heart_rate INT,
    temperature DECIMAL(4,2),
    weight DECIMAL(5,2),
    height DECIMAL(5,2),
    notes TEXT,
    recorded_by INT NOT NULL, -- Refers to consultant ID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (recorded_by) REFERENCES consultants(id)
);

-- EEG Analysis Details table
CREATE TABLE eeg_analysis_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    eeg_record_id INT NOT NULL,  -- References eeg_recordings.id
    analysis_type VARCHAR(50) NOT NULL,
    analysis_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    findings TEXT,
    recommendations TEXT,
    analyzed_by INT NOT NULL, -- Refers to consultant ID
    status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (eeg_record_id) REFERENCES eeg_recordings(id),
    FOREIGN KEY (analyzed_by) REFERENCES consultants(id)
);

-- Reports table
CREATE TABLE reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    eeg_recording_id INT NOT NULL,
    analysis_result_id INT NOT NULL,
    report_date TIMESTAMP NOT NULL,
    title VARCHAR(255) NOT NULL,
    clinical_history TEXT,
    eeg_findings TEXT,
    interpretation TEXT,
    recommendations TEXT,
    status ENUM('draft', 'final', 'archived') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (eeg_recording_id) REFERENCES eeg_recordings(id) ON DELETE CASCADE,
    FOREIGN KEY (analysis_result_id) REFERENCES analysis_results(id) ON DELETE CASCADE
);

-- Dashboard Metrics view
CREATE OR REPLACE VIEW dashboard_metrics AS
SELECT 
    c.id as consultant_id, -- Renamed from doctor_id
    COUNT(DISTINCT p.id) as total_patients,
    COUNT(DISTINCT CASE WHEN ar.status = 'pending' THEN ar.id END) as pending_analysis,
    COUNT(DISTINCT ar.id) as total_reports
FROM consultants c -- Renamed from doctors
LEFT JOIN patient_consultant_relationships pcr ON c.id = pcr.consultant_id -- Renamed tables and fields
LEFT JOIN patients p ON pcr.patient_id = p.id
LEFT JOIN eeg_recordings er ON p.id = er.patient_id
LEFT JOIN analysis_results ar ON er.id = ar.eeg_recording_id
GROUP BY c.id;

-- Create indexes for better performance
CREATE INDEX idx_patient_id ON patients(patient_id);
CREATE INDEX idx_consultant_license ON consultants(license_number);
CREATE INDEX idx_eeg_status ON eeg_records(status);
CREATE INDEX idx_analysis_date ON analysis_results(analysis_date);
CREATE INDEX idx_concept_sensitivity ON conceptual_sensitivities(concept_name, sensitivity_score);
CREATE INDEX idx_medical_record_date ON patient_medical_records(record_date);
CREATE INDEX idx_vitals_date ON patient_vitals(record_date);
CREATE INDEX idx_eeg_analysis_date ON eeg_analysis_details(analysis_date);
CREATE INDEX idx_recording_date ON eeg_recordings(recording_date);
CREATE INDEX idx_analysis_status ON analysis_results(status);

-- Insert test data for a consultant user
INSERT INTO users (username, password_hash, email, full_name, user_type) VALUES
('dr.ahmed', '$2a$10$8K1p/a0dL1LXMIZoIqPK6.U/BOkNGx1k3hU9V3X3HJGQZsuHhJ6Hy', 'dr.ahmed@hospital.com', 'Dr. Ahmed Khan', 'consultant');

-- Insert corresponding consultant record
INSERT INTO consultants (user_id, license_number, specialization, department) VALUES
(1, 'MD12345', 'Neurology', 'Neurology Department');

-- Insert test patients with detailed biographical information
INSERT INTO users (username, password_hash, email, full_name, user_type) VALUES
('fatima.ali', '$2a$10$8K1p/a0dL1LXMIZoIqPK6.U/BOkNGx1k3hU9V3X3HJGQZsuHhJ6Hy', 'fatima.ali@email.com', 'Fatima Ali', 'patient'),
('usman.malik', '$2a$10$8K1p/a0dL1LXMIZoIqPK6.U/BOkNGx1k3hU9V3X3HJGQZsuHhJ6Hy', 'usman.malik@email.com', 'Usman Malik', 'patient'),
('sana.khan', '$2a$10$8K1p/a0dL1LXMIZoIqPK6.U/BOkNGx1k3hU9V3X3HJGQZsuHhJ6Hy', 'sana.khan@email.com', 'Sana Khan', 'patient'),
('hamza.butt', '$2a$10$8K1p/a0dL1LXMIZoIqPK6.U/BOkNGx1k3hU9V3X3HJGQZsuHhJ6Hy', 'hamza.butt@email.com', 'Hamza Butt', 'patient'),
('ayesha.rizvi', '$2a$10$8K1p/a0dL1LXMIZoIqPK6.U/BOkNGx1k3hU9V3X3HJGQZsuHhJ6Hy', 'ayesha.rizvi@email.com', 'Ayesha Rizvi', 'patient');

-- Insert corresponding patient records with biographical data
INSERT INTO patients (user_id, patient_id, date_of_birth, gender, contact_number, address, medical_history) VALUES
(2, 'PAT001', '1985-05-15', 'F', '03001234567', 'House 123, Block 6, PECHS, Karachi', 'Hypertension, Type 2 Diabetes'),
(3, 'PAT002', '1990-08-22', 'M', '03002345678', 'Flat 45, Gulberg III, Lahore', 'Migraine, Anxiety'),
(4, 'PAT003', '1978-11-30', 'F', '03003456789', 'House 78, Sector F-8/1, Islamabad', 'Epilepsy, Sleep Disorder'),
(5, 'PAT004', '1995-03-18', 'M', '03004567890', 'House 34, Block 7, Clifton, Karachi', 'Depression, ADHD'),
(6, 'PAT005', '1982-07-25', 'F', '03005678901', 'Flat 12, Gulshan-e-Iqbal, Karachi', 'Parkinson\'s Disease, Tremors');

-- Create patient-consultant relationships
INSERT INTO patient_consultant_relationships (patient_id, consultant_id, start_date, status) VALUES
(1, 1, CURDATE(), 'active'),
(2, 1, CURDATE(), 'active'),
(3, 1, CURDATE(), 'active'),
(4, 1, CURDATE(), 'active'),
(5, 1, CURDATE(), 'active');

-- Insert EEG recordings for patients
INSERT INTO eeg_recordings (patient_id, recording_date, file_path, duration, sampling_rate, channels, notes) VALUES
(1, NOW(), 'test_recording.edf', 300, 256, 19, 'Test EEG recording'),
(2, DATE_SUB(NOW(), INTERVAL 30 DAY), 'patient1_eeg1.edf', 300, 256, 19, 'Routine checkup'),
(3, DATE_SUB(NOW(), INTERVAL 25 DAY), 'patient2_eeg1.edf', 450, 256, 19, 'Migraine assessment'),
(4, DATE_SUB(NOW(), INTERVAL 20 DAY), 'patient3_eeg1.edf', 600, 256, 19, 'Epilepsy monitoring'),
(5, DATE_SUB(NOW(), INTERVAL 15 DAY), 'patient4_eeg1.edf', 300, 256, 19, 'ADHD evaluation'),
(1, DATE_SUB(NOW(), INTERVAL 10 DAY), 'patient5_eeg1.edf', 450, 256, 19, 'Parkinson\'s assessment');

-- Insert analysis results for EEG recordings
INSERT INTO analysis_results (eeg_recording_id, status, classification, confidence_score) VALUES
(1, 'completed', 'normal', 92.50),
(2, 'pending', 'abnormal', 85.75),
(3, 'in_progress', 'normal', 88.25),
(4, 'completed', 'abnormal', 90.00),
(5, 'pending', 'normal', 87.50);

-- Insert EEG records (for compatibility with older references)
INSERT INTO eeg_records (patient_id, consultant_id, file_path, status) VALUES
(1, 1, 'test_eeg.edf', 'pending');

-- Insert EEG analysis details with correct key relationships
INSERT INTO eeg_analysis_details (eeg_record_id, analysis_type, findings, recommendations, analyzed_by) VALUES
(1, 'Standard EEG Analysis', 'Normal brain activity patterns', 'Continue regular monitoring', 1),
(2, 'Detailed EEG Analysis', 'Abnormal wave patterns detected', 'Further investigation required', 1),
(3, 'Sleep Study Analysis', 'Normal sleep patterns', 'Maintain current treatment', 1),
(4, 'Cognitive Assessment', 'Attention deficit patterns', 'Adjust medication dosage', 1),
(5, 'Motor Function Analysis', 'Tremor patterns observed', 'Increase physical therapy sessions', 1);

-- Insert medical records for patients
INSERT INTO patient_medical_records (patient_id, record_date, diagnosis, treatment_plan, medications, notes, created_by) VALUES
(1, CURDATE(), 'Initial consultation', 'Regular monitoring', 'None', 'Patient shows normal brain activity', 1),
(2, DATE_SUB(CURDATE(), INTERVAL 30 DAY), 'Initial consultation', 'Regular monitoring', 'None', 'Patient shows normal brain activity', 1),
(3, DATE_SUB(CURDATE(), INTERVAL 25 DAY), 'Migraine assessment', 'Prescribed medication', 'Sumatriptan 50mg', 'Patient reports frequent migraines', 1),
(4, DATE_SUB(CURDATE(), INTERVAL 20 DAY), 'Epilepsy monitoring', 'Anti-seizure medication', 'Levetiracetam 500mg', 'Patient shows improvement', 1),
(5, DATE_SUB(CURDATE(), INTERVAL 15 DAY), 'ADHD evaluation', 'Behavioral therapy', 'Methylphenidate 20mg', 'Patient responding well to treatment', 1);

-- Insert vitals for patients
INSERT INTO patient_vitals (patient_id, record_date, blood_pressure, heart_rate, temperature, weight, height, notes, recorded_by) VALUES
(1, CURDATE(), '120/80', 72, 37.0, 70.5, 175.0, 'Normal vitals', 1),
(2, CURDATE(), '120/80', 72, 37.0, 75.5, 180.0, 'Normal vitals', 1),
(3, CURDATE(), '118/75', 68, 36.8, 65.0, 165.0, 'Normal vitals', 1),
(4, CURDATE(), '125/82', 75, 37.1, 82.0, 175.0, 'Slightly elevated BP', 1),
(5, CURDATE(), '115/78', 70, 36.9, 58.0, 160.0, 'Normal vitals', 1); 