const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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

// Database connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "waleed",
    database: "neuroassist"
});

// Connect to database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to MySQL database');
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

// Routes

// Login route
app.post('/api/login', async (req, res) => {
    const { username, password, userType } = req.body;
    
    if (!username || !password || !userType) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    const query = 'SELECT * FROM users WHERE username = ? AND user_type = ?';
    db.query(query, [username, userType], async (err, results) => {
        if (err) {
            console.error('Login error:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        
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
            { id: user.id, username: user.username, userType: user.user_type },
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
                userType: user.user_type
            }
        });
    });
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
    
    if (userType === 'doctor' && !licenseNumber) {
        console.log('Missing license number for doctor registration');
        return res.status(400).json({ success: false, message: 'License number is required for doctor registration' });
    }
    
    try {
        // Check if username or email already exists
        const [existingUsers] = await db.promise().query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
        
        if (existingUsers.length > 0) {
            console.log('Username or email already exists:', { username, email });
            return res.status(400).json({ success: false, message: 'Username or email already exists' });
        }
        
        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        
        // Insert user
        const [userResult] = await db.promise().query(
            'INSERT INTO users (username, password_hash, email, full_name, user_type) VALUES (?, ?, ?, ?, ?)',
            [username, passwordHash, email, fullName, userType]
        );
        
        const userId = userResult.insertId;
        
        // Insert role-specific data
        if (userType === 'patient') {
            await db.promise().query(
                'INSERT INTO patients (user_id, patient_id) VALUES (?, ?)',
                [userId, patientId]
            );
        } else if (userType === 'doctor') {
            await db.promise().query(
                'INSERT INTO doctors (user_id, license_number, specialization, department) VALUES (?, ?, ?, ?)',
                [userId, licenseNumber, 'Neurology', 'Neurology Department']
            );
        } else if (userType === 'staff') {
            await db.promise().query(
                'INSERT INTO staff (user_id, role, department) VALUES (?, ?, ?)',
                [userId, 'Staff Member', 'General']
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
app.get('/api/patients/recent', authenticateToken, (req, res) => {
    const query = `
        SELECT p.id, p.patient_id, u.full_name as name, 
               (SELECT MAX(upload_date) FROM eeg_records WHERE patient_id = p.id) as lastVisit
        FROM patients p
        JOIN users u ON p.user_id = u.id
        ORDER BY lastVisit DESC
        LIMIT 5
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching recent patients:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        
        res.json(results);
    });
});

// Get all patients
app.get('/api/patients', authenticateToken, (req, res) => {
    const query = `
        SELECT p.id, p.patient_id, u.full_name as name
        FROM patients p
        JOIN users u ON p.user_id = u.id
        ORDER BY u.full_name
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching patients:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        
        res.json(results);
    });
});

// Upload EEG file
app.post('/api/eeg/upload', authenticateToken, upload.single('eegFile'), (req, res) => {
    const { patientId, notes } = req.body;
    const filePath = req.file ? req.file.path : null;
    
    if (!filePath) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    // Get doctor ID from user ID
    const doctorQuery = 'SELECT id FROM doctors WHERE user_id = ?';
    db.query(doctorQuery, [req.user.id], (err, doctorResults) => {
        if (err || doctorResults.length === 0) {
            return res.status(500).json({ success: false, message: 'Doctor not found' });
        }
        
        const doctorId = doctorResults[0].id;
        
        // Insert EEG record
        const eegQuery = 'INSERT INTO eeg_records (patient_id, doctor_id, file_path, notes) VALUES (?, ?, ?, ?)';
        db.query(eegQuery, [patientId, doctorId, filePath, notes], (err, result) => {
            if (err) {
                console.error('Error uploading EEG:', err);
                return res.status(500).json({ success: false, message: 'Database error' });
            }
            
            res.json({ 
                success: true, 
                message: 'EEG file uploaded successfully',
                eegId: result.insertId
            });
        });
    });
});

// Get EEG history for a patient
app.get('/api/eeg/history/:patientId', authenticateToken, (req, res) => {
    const { patientId } = req.params;
    
    const query = `
        SELECT er.id, er.file_path, er.upload_date, er.notes, er.status,
               u.full_name as doctor_name
        FROM eeg_records er
        JOIN doctors d ON er.doctor_id = d.id
        JOIN users u ON d.user_id = u.id
        WHERE er.patient_id = ?
        ORDER BY er.upload_date DESC
    `;
    
    db.query(query, [patientId], (err, results) => {
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
    db.query(updateQuery, ['analyzed', eegId], (err) => {
        if (err) {
            console.error('Error updating EEG status:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        
        // Insert analysis result (simulated)
        const analysisQuery = 'INSERT INTO analysis_results (eeg_record_id, classification, confidence_score) VALUES (?, ?, ?)';
        const classification = Math.random() > 0.5 ? 'normal' : 'abnormal';
        const confidenceScore = (Math.random() * 30 + 70).toFixed(2); // Random score between 70-100
        
        db.query(analysisQuery, [eegId, classification, confidenceScore], (err, result) => {
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
                    
                    db.query(sensitivityQuery, [
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

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 