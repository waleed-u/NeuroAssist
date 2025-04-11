document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userType = sessionStorage.getItem('userType');
    
    if ((!user || !user.role) && (!userType || userType !== 'doctor')) {
        // If no authentication is found, create mock user for testing
        const mockUser = {
            id: '1',
            name: 'John Smith',
            role: 'doctor'
        };
        localStorage.setItem('user', JSON.stringify(mockUser));
        console.log('Created mock user for testing');
    }
    
    // Get user data (either real or mock)
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const doctorName = currentUser.name || sessionStorage.getItem('fullName') || 'Dr. John Doe';
    
    // Set doctor's name in the top bar
    const usernameElement = document.querySelector('.username');
    if (usernameElement) {
        usernameElement.textContent = doctorName;
    }

    // Initialize elements
    const patientsList = document.getElementById('patientsList');
    const patientSearch = document.getElementById('patientSearch');
    const filterStatus = document.getElementById('filterStatus');
    const applyFilter = document.getElementById('applyFilter');
    const addPatientBtn = document.getElementById('addPatientBtn');
    const addPatientModal = document.getElementById('addPatientModal');
    const viewPatientModal = document.getElementById('viewPatientModal');
    const addPatientForm = document.getElementById('addPatientForm');
    const cancelAddPatient = document.getElementById('cancelAddPatient');
    
    // Close buttons for modals
    const closeButtons = document.querySelectorAll('.close-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Handle logout
    document.getElementById('logout').addEventListener('click', function(e) {
        e.preventDefault();
        sessionStorage.clear();
        window.location.href = '../index.html';
    });
    
    // Handle logout from dropdown
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        sessionStorage.clear();
        window.location.href = '../index.html';
    });
    
    // Handle Annotate EEG button
    const uploadBtn = document.getElementById('uploadEEG');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => {
            window.location.href = '../full_edf_viewer/index.html';
        });
    }
    
    // Mock patient data
    const mockPatients = [
        { 
            id: 'P001', 
            name: 'John Smith', 
            dob: '1980-01-15', 
            gender: 'Male', 
            contact: '+1 234 567 8900', 
            email: 'john.smith@example.com', 
            address: '123 Main St, City, Country',
            status: 'active',
            lastVisit: '2023-05-15',
            diagnosis: 'Epilepsy',
            eegCount: 3
        },
        { 
            id: 'P002', 
            name: 'Sarah Johnson', 
            dob: '1995-03-22', 
            gender: 'Female', 
            contact: '+1 234 567 8901', 
            email: 'sarah.j@example.com', 
            address: '456 Oak Ave, Town, Country',
            status: 'active',
            lastVisit: '2023-06-10',
            diagnosis: 'Sleep Disorder',
            eegCount: 2
        },
        { 
            id: 'P003', 
            name: 'Michael Brown', 
            dob: '1975-11-30', 
            gender: 'Male', 
            contact: '+1 234 567 8902', 
            email: 'michael.b@example.com', 
            address: '789 Pine Rd, Village, Country',
            status: 'inactive',
            lastVisit: '2023-01-20',
            diagnosis: 'Stroke',
            eegCount: 1
        },
        { 
            id: 'P004', 
            name: 'Emily Davis', 
            dob: '1988-07-12', 
            gender: 'Female', 
            contact: '+1 234 567 8903', 
            email: 'emily.d@example.com', 
            address: '321 Elm St, City, Country',
            status: 'active',
            lastVisit: '2023-07-05',
            diagnosis: 'Migraine',
            eegCount: 2
        },
        { 
            id: 'P005', 
            name: 'Robert Wilson', 
            dob: '1965-09-18', 
            gender: 'Male', 
            contact: '+1 234 567 8904', 
            email: 'robert.w@example.com', 
            address: '654 Maple Dr, Town, Country',
            status: 'active',
            lastVisit: '2023-06-28',
            diagnosis: 'Brain Tumor',
            eegCount: 4
        }
    ];
    
    // Mock EEG data
    const mockEEGs = {
        'P001': [
            { id: 'EEG001', date: '2023-05-15', duration: '30 minutes', status: 'Completed' },
            { id: 'EEG002', date: '2023-03-10', duration: '45 minutes', status: 'Completed' },
            { id: 'EEG003', date: '2023-01-05', duration: '30 minutes', status: 'Completed' }
        ],
        'P002': [
            { id: 'EEG004', date: '2023-06-10', duration: '60 minutes', status: 'Completed' },
            { id: 'EEG005', date: '2023-04-20', duration: '45 minutes', status: 'Completed' }
        ],
        'P003': [
            { id: 'EEG006', date: '2023-01-20', duration: '30 minutes', status: 'Completed' }
        ],
        'P004': [
            { id: 'EEG007', date: '2023-07-05', duration: '30 minutes', status: 'Completed' },
            { id: 'EEG008', date: '2023-05-22', duration: '30 minutes', status: 'Completed' }
        ],
        'P005': [
            { id: 'EEG009', date: '2023-06-28', duration: '45 minutes', status: 'Completed' },
            { id: 'EEG010', date: '2023-05-15', duration: '30 minutes', status: 'Completed' },
            { id: 'EEG011', date: '2023-03-10', duration: '45 minutes', status: 'Completed' },
            { id: 'EEG012', date: '2023-01-05', duration: '30 minutes', status: 'Completed' }
        ]
    };
    
    // Mock medical records
    const mockRecords = {
        'P001': [
            { id: 'R001', date: '2023-05-15', type: 'EEG', notes: 'Normal EEG with no abnormalities detected.' },
            { id: 'R002', date: '2023-05-15', type: 'Consultation', notes: 'Patient reports reduced seizure frequency with current medication.' },
            { id: 'R003', date: '2023-03-10', type: 'EEG', notes: 'EEG shows mild abnormalities in temporal lobe.' }
        ],
        'P002': [
            { id: 'R004', date: '2023-06-10', type: 'EEG', notes: 'Sleep study shows irregular sleep patterns.' },
            { id: 'R005', date: '2023-06-10', type: 'Consultation', notes: 'Patient reports improved sleep quality with prescribed medication.' },
            { id: 'R006', date: '2023-04-20', type: 'EEG', notes: 'Initial sleep study baseline established.' }
        ],
        'P003': [
            { id: 'R007', date: '2023-01-20', type: 'EEG', notes: 'EEG shows signs of post-stroke activity.' },
            { id: 'R008', date: '2023-01-20', type: 'Consultation', notes: 'Patient showing good recovery progress.' }
        ],
        'P004': [
            { id: 'R009', date: '2023-07-05', type: 'EEG', notes: 'Normal EEG with no abnormalities detected.' },
            { id: 'R010', date: '2023-07-05', type: 'Consultation', notes: 'Patient reports reduced migraine frequency.' },
            { id: 'R011', date: '2023-05-22', type: 'EEG', notes: 'Initial EEG baseline established.' }
        ],
        'P005': [
            { id: 'R012', date: '2023-06-28', type: 'EEG', notes: 'EEG shows changes in brain activity consistent with tumor location.' },
            { id: 'R013', date: '2023-06-28', type: 'Consultation', notes: 'Patient scheduled for follow-up MRI in 3 months.' },
            { id: 'R014', date: '2023-05-15', type: 'EEG', notes: 'EEG shows stable brain activity compared to previous recordings.' }
        ]
    };
    
    // Load patients
    function loadPatients(filter = 'all') {
        patientsList.innerHTML = '';
        
        let filteredPatients = [...mockPatients];
        
        // Apply filter if not 'all'
        if (filter !== 'all') {
            filteredPatients = filteredPatients.filter(patient => patient.status === filter);
        }
        
        // Apply search filter if search term exists
        const searchTerm = patientSearch.value.toLowerCase();
        if (searchTerm) {
            filteredPatients = filteredPatients.filter(patient => 
                patient.name.toLowerCase().includes(searchTerm) || 
                patient.id.toLowerCase().includes(searchTerm) ||
                patient.diagnosis.toLowerCase().includes(searchTerm)
            );
        }
        
        if (filteredPatients.length === 0) {
            patientsList.innerHTML = '<div class="no-results">No patients found matching your criteria.</div>';
            return;
        }
        
        filteredPatients.forEach(patient => {
            const patientCard = document.createElement('div');
            patientCard.className = 'patient-card';
            patientCard.dataset.id = patient.id;
            
            // Format date
            const dob = new Date(patient.dob);
            const formattedDob = dob.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
            
            // Calculate age
            const today = new Date();
            let age = today.getFullYear() - dob.getFullYear();
            const monthDiff = today.getMonth() - dob.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
                age--;
            }
            
            patientCard.innerHTML = `
                <div class="patient-header">
                    <h3>${patient.name}</h3>
                    <span class="patient-id">${patient.id}</span>
                </div>
                <div class="patient-info">
                    <div class="info-item">
                        <span class="info-label">Age:</span>
                        <span class="info-value">${age} years</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Gender:</span>
                        <span class="info-value">${patient.gender}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Diagnosis:</span>
                        <span class="info-value">${patient.diagnosis}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Last Visit:</span>
                        <span class="info-value">${new Date(patient.lastVisit).toLocaleDateString()}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">EEG Recordings:</span>
                        <span class="info-value">${patient.eegCount}</span>
                    </div>
                </div>
                <div class="patient-actions">
                    <button class="btn btn-primary view-patient" data-id="${patient.id}">View Details</button>
                </div>
            `;
            
            patientsList.appendChild(patientCard);
        });
        
        // Add event listeners to view buttons
        document.querySelectorAll('.view-patient').forEach(button => {
            button.addEventListener('click', function() {
                const patientId = this.dataset.id;
                viewPatientDetails(patientId);
            });
        });
    }
    
    // View patient details
    function viewPatientDetails(patientId) {
        const patient = mockPatients.find(p => p.id === patientId);
        if (!patient) return;
        
        // Format date
        const dob = new Date(patient.dob);
        const formattedDob = dob.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        
        // Update patient details in modal
        document.getElementById('viewPatientName').textContent = patient.name;
        document.getElementById('viewPatientId').textContent = `ID: ${patient.id}`;
        document.getElementById('viewPatientDob').textContent = formattedDob;
        document.getElementById('viewPatientGender').textContent = patient.gender;
        document.getElementById('viewPatientContact').textContent = patient.contact;
        document.getElementById('viewPatientEmail').textContent = patient.email;
        document.getElementById('viewPatientAddress').textContent = patient.address;
        
        // Load medical records
        loadMedicalRecords(patientId);
        
        // Load EEG recordings
        loadEEGRecordings(patientId);
        
        // Load timeline
        loadTimeline(patientId);
        
        // Show modal
        viewPatientModal.style.display = 'block';
    }
    
    // Load medical records
    function loadMedicalRecords(patientId) {
        const recordsTableBody = document.getElementById('recordsTableBody');
        recordsTableBody.innerHTML = '';
        
        const records = mockRecords[patientId] || [];
        
        if (records.length === 0) {
            recordsTableBody.innerHTML = '<tr><td colspan="4" class="no-data">No medical records found.</td></tr>';
            return;
        }
        
        records.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(record.date).toLocaleDateString()}</td>
                <td>${record.type}</td>
                <td>${record.notes}</td>
                <td>
                    <button class="btn-icon view-record" data-id="${record.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            recordsTableBody.appendChild(row);
        });
    }
    
    // Load EEG recordings
    function loadEEGRecordings(patientId) {
        const eegsTableBody = document.getElementById('eegsTableBody');
        eegsTableBody.innerHTML = '';
        
        const eegs = mockEEGs[patientId] || [];
        
        if (eegs.length === 0) {
            eegsTableBody.innerHTML = '<tr><td colspan="4" class="no-data">No EEG recordings found.</td></tr>';
            return;
        }
        
        eegs.forEach(eeg => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(eeg.date).toLocaleDateString()}</td>
                <td>${eeg.duration}</td>
                <td>${eeg.status}</td>
                <td>
                    <button class="btn-icon view-eeg" data-id="${eeg.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            eegsTableBody.appendChild(row);
        });
    }
    
    // Load timeline
    function loadTimeline(patientId) {
        const timeline = document.getElementById('patientTimeline');
        timeline.innerHTML = '';
        
        // Combine records and EEGs for timeline
        const records = mockRecords[patientId] || [];
        const eegs = mockEEGs[patientId] || [];
        
        const timelineItems = [
            ...records.map(record => ({
                date: record.date,
                type: record.type,
                title: `${record.type} - ${new Date(record.date).toLocaleDateString()}`,
                description: record.notes,
                icon: record.type === 'EEG' ? 'fa-brain' : 'fa-stethoscope'
            })),
            ...eegs.map(eeg => ({
                date: eeg.date,
                type: 'EEG',
                title: `EEG Recording - ${new Date(eeg.date).toLocaleDateString()}`,
                description: `Duration: ${eeg.duration}, Status: ${eeg.status}`,
                icon: 'fa-brain'
            }))
        ];
        
        // Sort by date (newest first)
        timelineItems.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (timelineItems.length === 0) {
            timeline.innerHTML = '<div class="no-data">No timeline data available.</div>';
            return;
        }
        
        timelineItems.forEach(item => {
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item';
            timelineItem.innerHTML = `
                <div class="timeline-icon">
                    <i class="fas ${item.icon}"></i>
                </div>
                <div class="timeline-content">
                    <h4>${item.title}</h4>
                    <p>${item.description}</p>
                    <span class="timeline-date">${new Date(item.date).toLocaleDateString()}</span>
                </div>
            `;
            timeline.appendChild(timelineItem);
        });
    }
    
    // Handle tab switching
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            
            // Remove active class from all tabs
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Hide all tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.style.display = 'none';
            });
            
            // Show selected tab content
            document.getElementById(`${tabName}Tab`).style.display = 'block';
        });
    });
    
    // Handle add patient button
    addPatientBtn.addEventListener('click', function() {
        addPatientModal.style.display = 'block';
    });
    
    // Handle cancel add patient
    cancelAddPatient.addEventListener('click', function() {
        addPatientModal.style.display = 'none';
    });
    
    // Handle add patient form submission
    addPatientForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('patientName').value;
        const dob = document.getElementById('patientDob').value;
        const gender = document.getElementById('patientGender').value;
        const contact = document.getElementById('patientContact').value;
        const email = document.getElementById('patientEmail').value;
        const address = document.getElementById('patientAddress').value;
        const notes = document.getElementById('patientNotes').value;
        
        // Create new patient ID
        const newId = `P${String(mockPatients.length + 1).padStart(3, '0')}`;
        
        // Create new patient object
        const newPatient = {
            id: newId,
            name: name,
            dob: dob,
            gender: gender,
            contact: contact,
            email: email,
            address: address,
            status: 'active',
            lastVisit: new Date().toISOString().split('T')[0],
            diagnosis: 'Pending Diagnosis',
            eegCount: 0
        };
        
        // Add to mock data
        mockPatients.push(newPatient);
        mockRecords[newId] = [];
        mockEEGs[newId] = [];
        
        // Add initial record
        mockRecords[newId].push({
            id: `R${String(Object.keys(mockRecords).length + 1).padStart(3, '0')}`,
            date: new Date().toISOString().split('T')[0],
            type: 'Consultation',
            notes: notes || 'Initial consultation.'
        });
        
        // Reset form
        addPatientForm.reset();
        
        // Close modal
        addPatientModal.style.display = 'none';
        
        // Reload patients
        loadPatients();
        
        // Show success message
        alert('Patient added successfully!');
    });
    
    // Handle search
    patientSearch.addEventListener('input', function() {
        loadPatients(filterStatus.value);
    });
    
    // Handle filter
    applyFilter.addEventListener('click', function() {
        loadPatients(filterStatus.value);
    });
    
    // Initialize the page
    loadPatients();
}); 