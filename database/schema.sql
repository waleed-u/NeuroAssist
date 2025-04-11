-- Create the database
CREATE DATABASE IF NOT EXISTS neuroassist;
USE neuroassist;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    user_type ENUM('patient', 'doctor', 'staff') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Patients table
CREATE TABLE patients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    patient_id VARCHAR(20) UNIQUE NOT NULL,
    date_of_birth DATE,
    gender ENUM('M', 'F', 'Other'),
    contact_number VARCHAR(20),
    address TEXT,
    medical_history TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Doctors table
CREATE TABLE doctors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    specialization VARCHAR(100),
    department VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Staff table
CREATE TABLE staff (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    role VARCHAR(50),
    department VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- EEG Records table
CREATE TABLE eeg_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    status ENUM('pending', 'processed', 'analyzed') DEFAULT 'pending',
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);

-- Analysis Results table
CREATE TABLE analysis_results (
    id INT PRIMARY KEY AUTO_INCREMENT,
    eeg_record_id INT NOT NULL,
    classification ENUM('normal', 'abnormal') NOT NULL,
    confidence_score DECIMAL(5,2) NOT NULL,
    analysis_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (eeg_record_id) REFERENCES eeg_records(id)
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
    FOREIGN KEY (analysis_result_id) REFERENCES analysis_results(id)
);

-- Patient-Doctor Relationships table
CREATE TABLE patient_doctor_relationships (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    status ENUM('active', 'inactive') DEFAULT 'active',
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);

-- Create indexes for better performance
CREATE INDEX idx_patient_id ON patients(patient_id);
CREATE INDEX idx_doctor_license ON doctors(license_number);
CREATE INDEX idx_eeg_status ON eeg_records(status);
CREATE INDEX idx_analysis_date ON analysis_results(analysis_date);
CREATE INDEX idx_concept_sensitivity ON conceptual_sensitivities(concept_name, sensitivity_score);

-- Insert a test doctor with a real password hash (password: test123)
INSERT INTO users (username, password_hash, email, full_name, user_type) VALUES
('testdoctor', '$2a$10$8K1p/a0dL1LXMIZoIqPK6.U/BOkNGx1k3hU9V3X3HJGQZsuHhJ6Hy', 'testdoctor@hospital.com', 'Test Doctor', 'doctor');

-- Insert corresponding doctor record
INSERT INTO doctors (user_id, license_number, specialization, department) VALUES
(1, 'TEST123', 'Neurology', 'Neurology Department'); 