const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.static('public'));
app.use(express.static('.')); // Serve static files from root directory

// Add error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: err.message
    });
});

// Add OPTIONS handler for preflight requests
app.options('*', cors());

// Create connection pool with promise wrapper
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "waleed",
    database: "neuroassist",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// JWT secret key
const JWT_SECRET = 'neuroassist_secret_key';

// File upload configuration
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const uploadDir = 'uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'Authentication token required' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// In-memory store for reset tokens (for simplicity - in production, use a database)
const passwordResetTokens = new Map();

// Configure email transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // TLS
    auth: {
        user: 'neuroassist.system@gmail.com', // Replace with your email
        pass: 'your_app_password', // Replace with your app password
    },
});

// Routes

// Login route
app.post('/api/login', async (req, res) => {
    const { username, password, userType } = req.body;
    
    // No need to map user types anymore as they match directly in the database
    if (!username || !password || !userType) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    try {
        const [results] = await pool.query(
            'SELECT * FROM users WHERE username = ? AND user_type = ?',
            [username, userType]
        );
        
        if (results.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        
        const user = results[0];
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!passwordMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username, userType: userType },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                fullName: user.full_name,
                userType: userType
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Database error' });
    }
});

// Register route
app.post('/api/register', async (req, res) => {
    const { fullName, email, username, password, userType, patientId, licenseNumber } = req.body;
    
    console.log('Registration attempt:', { fullName, email, username, userType }); // Log registration attempt
    
    // Validate required fields
    if (!fullName || !email || !username || !password || !userType) {
        console.log('Missing required fields:', { fullName, email, username, userType });
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    // Validate user type specific fields
    if (userType === 'patient' && !patientId) {
        console.log('Missing patient ID for patient registration');
        return res.status(400).json({ success: false, message: 'Patient ID is required for patient registration' });
    }
    
    if (userType === 'consultant' && !licenseNumber) {
        console.log('Missing license number for consultant registration');
        return res.status(400).json({ success: false, message: 'License number is required for consultant registration' });
    }
    
    try {
        // Check if username or email already exists
        const [existingUsers] = await pool.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
        
        if (existingUsers.length > 0) {
            console.log('Username or email already exists:', { username, email });
            return res.status(400).json({ success: false, message: 'Username or email already exists' });
        }
        
        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        
        // Insert user
        const [userResult] = await pool.query(
            'INSERT INTO users (username, password_hash, email, full_name, user_type) VALUES (?, ?, ?, ?, ?)',
            [username, passwordHash, email, fullName, userType]
        );
        
        const userId = userResult.insertId;
        
        // Insert role-specific data
        if (userType === 'patient') {
            await pool.query(
                'INSERT INTO patients (user_id, patient_id) VALUES (?, ?)',
                [userId, patientId]
            );
        } else if (userType === 'consultant') {
            // Insert into consultants table
            await pool.query(
                'INSERT INTO consultants (user_id, license_number, specialization, department) VALUES (?, ?, ?, ?)',
                [userId, licenseNumber, 'Neurology', 'Neurology Department']
            );
        } else if (userType === 'junior_doctor') {
            // Insert into junior_doctors table
            await pool.query(
                'INSERT INTO junior_doctors (user_id, role, department) VALUES (?, ?, ?)',
                [userId, 'Jr. Doctor', 'General']
            );
        }
        
        console.log('Registration successful for user:', username);
        res.json({ success: true, message: 'Registration successful' });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Registration failed. Please try again.',
            error: error.message 
        });
    }
});

// Get recent patients
app.get('/api/patients/recent', authenticateToken, async (req, res) => {
    try {
        // First get the consultant ID for filtering patients
        const [consultantResult] = await pool.query(
            'SELECT id FROM consultants WHERE user_id = ?',
            [req.user.id]
        );
        
        if (consultantResult.length === 0) {
            return res.status(404).json({ error: 'Consultant not found' });
        }
        
        const consultantId = consultantResult[0].id;
        
        // Get patients assigned to this consultant with their latest EEG recording date
        const [patients] = await pool.query(`
            SELECT 
                p.id, 
                p.patient_id, 
                u.full_name as name, 
                (SELECT MAX(recording_date) FROM eeg_recordings WHERE patient_id = p.id) as lastVisit,
                p.created_at
            FROM patients p
            JOIN users u ON p.user_id = u.id
            JOIN patient_consultant_relationships pcr ON p.id = pcr.patient_id AND pcr.consultant_id = ?
            WHERE pcr.status = 'active'
            ORDER BY 
                CASE WHEN (SELECT MAX(recording_date) FROM eeg_recordings WHERE patient_id = p.id) IS NULL 
                    THEN 0 ELSE 1 END DESC,
                lastVisit DESC, 
                p.created_at DESC
            LIMIT 5
        `, [consultantId]);
        
        // Process the dates to ensure they're valid
        const patientsWithDates = patients.map(patient => {
            // Use current date format for consistent handling on frontend
            const now = new Date();
            let lastVisit = patient.lastVisit;
            
            if (!lastVisit) {
                // If no EEG recordings, use created_at date
                lastVisit = patient.created_at;
            }
            
            return {
                ...patient,
                lastVisit
            };
        });
        
        console.log(`Found ${patientsWithDates.length} recent patients for consultant ID ${consultantId}`);
        res.json(patientsWithDates);
    } catch (error) {
        console.error('Error fetching recent patients:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all patients
app.get('/api/patients', authenticateToken, async (req, res) => {
    try {
        const [results] = await pool.query(`
            SELECT p.id, p.patient_id, u.full_name as name
            FROM patients p
            JOIN users u ON p.user_id = u.id
            ORDER BY u.full_name
        `);
        
        res.json(results);
    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({ success: false, message: 'Database error' });
    }
});

// Upload EEG file
app.post('/api/eeg/upload', authenticateToken, upload.single('eegFile'), async (req, res) => {
    const { patientId, notes } = req.body;
    const filePath = req.file ? req.file.path : null;
    
    if (!filePath) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    try {
        // Get consultant ID from user ID
        const [consultantResults] = await pool.query(
            'SELECT id FROM consultants WHERE user_id = ?',
            [req.user.id]
        );
        
        if (consultantResults.length === 0) {
            return res.status(500).json({ success: false, message: 'Consultant not found' });
        }
        
        const consultantId = consultantResults[0].id;
        
        // Insert EEG record using consultant_id column
        const [result] = await pool.query(
            'INSERT INTO eeg_records (patient_id, consultant_id, file_path, notes) VALUES (?, ?, ?, ?)',
            [patientId, consultantId, filePath, notes]
        );
        
        res.json({ 
            success: true, 
            message: 'EEG file uploaded successfully',
            eegId: result.insertId
        });
    } catch (error) {
        console.error('Error uploading EEG:', error);
        res.status(500).json({ success: false, message: 'Database error' });
    }
});

// Get EEG history for a patient
app.get('/api/eeg/history/:patientId', authenticateToken, (req, res) => {
    const { patientId } = req.params;
    
    const query = `
        SELECT er.id, er.file_path, er.upload_date, er.notes, er.status,
               u.full_name as consultant_name
        FROM eeg_records er
        JOIN consultants c ON er.consultant_id = c.id
        JOIN users u ON c.user_id = u.id
        WHERE er.patient_id = ?
        ORDER BY er.upload_date DESC
    `;
    
    pool.query(query, [patientId], (err, results) => {
        if (err) {
            console.error('Error fetching EEG history:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        
        res.json(results);
    });
});

// Analyze EEG
app.post('/api/eeg/analyze/:eegId', authenticateToken, (req, res) => {
    const { eegId } = req.params;
    
    // In a real application, this would call your XAI model
    // For now, we'll simulate the analysis
    
    // Update EEG status to 'analyzed'
    const updateQuery = 'UPDATE eeg_records SET status = ? WHERE id = ?';
    pool.query(updateQuery, ['analyzed', eegId], (err) => {
        if (err) {
            console.error('Error updating EEG status:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        
        // Insert analysis result (simulated)
        const analysisQuery = 'INSERT INTO analysis_results (eeg_record_id, classification, confidence_score) VALUES (?, ?, ?)';
        const classification = Math.random() > 0.5 ? 'normal' : 'abnormal';
        const confidenceScore = (Math.random() * 30 + 70).toFixed(2); // Random score between 70-100
        
        pool.query(analysisQuery, [eegId, classification, confidenceScore], (err, result) => {
            if (err) {
                console.error('Error inserting analysis result:', err);
                return res.status(500).json({ success: false, message: 'Database error' });
            }
            
            const analysisId = result.insertId;
            
            // Insert conceptual sensitivities (simulated)
            const concepts = ['alpha waves', 'beta waves', 'delta waves', 'theta waves', 'spike activity'];
            const sensitivityPromises = concepts.map(concept => {
                return new Promise((resolve, reject) => {
                    const sensitivityScore = (Math.random() * 100).toFixed(2);
                    const timestampStart = new Date(Date.now() - Math.random() * 3600000);
                    const timestampEnd = new Date(timestampStart.getTime() + Math.random() * 3600000);
                    const channel = `Channel ${Math.floor(Math.random() * 20) + 1}`;
                    
                    const sensitivityQuery = `
                        INSERT INTO conceptual_sensitivities 
                        (analysis_result_id, concept_name, sensitivity_score, timestamp_start, timestamp_end, channel) 
                        VALUES (?, ?, ?, ?, ?, ?)
                    `;
                    
                    pool.query(sensitivityQuery, [
                        analysisId, concept, sensitivityScore, timestampStart, timestampEnd, channel
                    ], (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });
            });
            
            Promise.all(sensitivityPromises)
                .then(() => {
                    res.json({
                        success: true,
                        message: 'EEG analysis completed',
                        analysis: {
                            classification,
                            confidenceScore,
                            concepts: concepts.map(concept => ({
                                name: concept,
                                sensitivityScore: (Math.random() * 100).toFixed(2)
                            }))
                        }
                    });
                })
                .catch(err => {
                    console.error('Error inserting conceptual sensitivities:', err);
                    res.status(500).json({ success: false, message: 'Database error' });
                });
        });
    });
});

// Get dashboard metrics
app.get('/api/dashboard/metrics', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get consultant ID from user ID
        const [consultantResult] = await pool.query(
            'SELECT id FROM consultants WHERE user_id = ?',
            [userId]
        );

        if (consultantResult.length === 0) {
            return res.status(404).json({ error: 'Consultant not found' });
        }

        const consultantId = consultantResult[0].id;

        // Get metrics from the view
        const [metrics] = await pool.query(
            'SELECT * FROM dashboard_metrics WHERE consultant_id = ?',
            [consultantId]
        );

        if (metrics.length === 0) {
            // If no metrics exist for this consultant, return zeros
            return res.json({
                total_patients: 0,
                pending_analysis: 0,
                total_reports: 0
            });
        }

        res.json(metrics[0]);
    } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get recent patients
app.get('/api/dashboard/recent-patients', authenticateToken, async (req, res) => {
    try {
        const [patients] = await pool.query(
            `SELECT p.*, u.email 
             FROM patients p 
             LEFT JOIN users u ON p.user_id = u.id 
             ORDER BY p.created_at DESC 
             LIMIT 5`
        );
        res.json(patients);
    } catch (error) {
        console.error('Error fetching recent patients:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get pending analyses
app.get('/api/dashboard/pending-analyses', authenticateToken, async (req, res) => {
    try {
        const [analyses] = await pool.query(
            `SELECT ar.*, u.full_name as patient_name, er.recording_date 
             FROM analysis_results ar 
             JOIN eeg_recordings er ON ar.eeg_recording_id = er.id 
             JOIN patients p ON er.patient_id = p.id 
             JOIN users u ON p.user_id = u.id
             WHERE ar.status = 'pending' 
             ORDER BY ar.created_at DESC 
             LIMIT 5`
        );
        res.json(analyses);
    } catch (error) {
        console.error('Error fetching pending analyses:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get patient details
app.get('/api/patients/:patientId', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT p.*, u.full_name, u.email 
             FROM patients p 
             JOIN users u ON p.user_id = u.id 
             WHERE p.id = ?`,
            [req.params.patientId]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching patient details:', error);
        res.status(500).json({ message: 'Error fetching patient details' });
    }
});

// Get patient medical records
app.get('/api/patients/:patientId/medical-records', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT * FROM patient_medical_records 
             WHERE patient_id = ? 
             ORDER BY record_date DESC`,
            [req.params.patientId]
        );
        
        res.json(rows);
    } catch (error) {
        console.error('Error fetching medical records:', error);
        res.status(500).json({ message: 'Error fetching medical records' });
    }
});

// Get patient vitals
app.get('/api/patients/:patientId/vitals', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT * FROM patient_vitals 
             WHERE patient_id = ? 
             ORDER BY record_date DESC`,
            [req.params.patientId]
        );
        
        res.json(rows);
    } catch (error) {
        console.error('Error fetching vitals:', error);
        res.status(500).json({ message: 'Error fetching vitals' });
    }
});

// Get patient EEG history
app.get('/api/patients/:patientId/eeg-history', authenticateToken, async (req, res) => {
    try {
        console.log(`Fetching EEG history for patient ID: ${req.params.patientId}`);
        const [rows] = await pool.query(
            `SELECT er.*, ead.analysis_type, ead.findings, ead.recommendations 
             FROM eeg_recordings er 
             LEFT JOIN eeg_analysis_details ead ON er.id = ead.eeg_record_id 
             WHERE er.patient_id = ? 
             ORDER BY er.recording_date DESC`,
            [req.params.patientId]
        );
        
        console.log(`Found ${rows.length} EEG records`);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching EEG history:', error);
        res.status(500).json({ message: 'Error fetching EEG history' });
    }
});

// Download EEG file
app.get('/api/eeg/download/:filePath', authenticateToken, async (req, res) => {
  try {
    const filePath = req.params.filePath;
    const fullPath = path.join(__dirname, 'uploads', filePath);
    
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    res.download(fullPath);
  } catch (error) {
    console.error('Error downloading EEG file:', error);
    res.status(500).json({ message: 'Error downloading EEG file' });
  }
});

// Forgot password route
app.post('/api/forgot-password', async (req, res) => {
    const { email, userType } = req.body;
    
    console.log('Password reset attempt:', { email, userType });
    
    if (!email || !userType) {
        return res.status(400).json({ success: false, message: 'Email and user type are required' });
    }
    
    try {
        // Find the user with the provided email and user type
        const [users] = await pool.query(
            'SELECT * FROM users WHERE email = ? AND user_type = ?',
            [email, userType]
        );
        
        if (users.length === 0) {
            // Don't reveal that the user doesn't exist for security reasons
            return res.json({ 
                success: true, 
                message: 'If an account with that email exists, a password reset link has been sent.' 
            });
        }
        
        const user = users[0];
        
        // Generate a reset token
        const token = crypto.randomBytes(32).toString('hex');
        const expiry = Date.now() + 3600000; // 1 hour from now
        
        // Store the token in our in-memory store
        passwordResetTokens.set(token, {
            userId: user.id,
            expiry,
            email: user.email,
            userType: user.user_type
        });
        
        // Create reset link (use the server's port 3000)
        const resetLink = `http://localhost:3000/reset-password.html?token=${token}`;
        
        // For testing purposes - log the reset link prominently
        console.log('\n==================================================');
        console.log('PASSWORD RESET LINK (For Testing Purposes):');
        console.log(resetLink);
        console.log('==================================================\n');
        
        // In a production environment, we would send an actual email
        // For this project, we're simulating success without actually sending
        
        res.json({ 
            success: true, 
            message: 'Password reset instructions sent to your email address. Please check your inbox.' 
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Reset password route
app.post('/api/reset-password', async (req, res) => {
    const { token, password } = req.body;
    
    if (!token || !password) {
        return res.status(400).json({ success: false, message: 'Token and password are required' });
    }
    
    // Check if token exists and is valid
    if (!passwordResetTokens.has(token)) {
        return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }
    
    const tokenData = passwordResetTokens.get(token);
    
    // Check if token has expired
    if (tokenData.expiry < Date.now()) {
        passwordResetTokens.delete(token);
        return res.status(400).json({ success: false, message: 'Token has expired. Please request a new password reset link.' });
    }
    
    try {
        // Hash the new password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        
        // Update user's password
        await pool.query(
            'UPDATE users SET password_hash = ? WHERE id = ?',
            [passwordHash, tokenData.userId]
        );
        
        // Delete the used token
        passwordResetTokens.delete(token);
        
        res.json({ success: true, message: 'Password has been reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 