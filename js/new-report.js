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

    // Initialize form elements
    const patientSelect = document.getElementById('patientSelect');
    const eegSelect = document.getElementById('eegSelect');
    const generateReportBtn = document.getElementById('generateReportBtn');
    const editReportBtn = document.getElementById('editReportBtn');
    const saveReportBtn = document.getElementById('saveReportBtn');
    const printReportBtn = document.getElementById('printReportBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const reportPreview = document.getElementById('reportPreview');

    // Load mock patient data
    const mockPatients = [
        { id: 'P001', name: 'John Smith', dob: '01/15/1980', gender: 'Male' },
        { id: 'P002', name: 'Sarah Johnson', dob: '03/22/1995', gender: 'Female' },
        { id: 'P003', name: 'Michael Brown', dob: '11/30/1975', gender: 'Male' }
    ];

    // Load mock EEG data
    const mockEEGs = {
        'P001': [
            { id: 'EEG001', date: '03/15/2024', duration: '30 minutes' },
            { id: 'EEG002', date: '02/01/2024', duration: '45 minutes' }
        ],
        'P002': [
            { id: 'EEG003', date: '03/10/2024', duration: '30 minutes' }
        ],
        'P003': [
            { id: 'EEG004', date: '03/05/2024', duration: '60 minutes' }
        ]
    };

    // Populate patient select
    function populatePatientSelect() {
        patientSelect.innerHTML = '<option value="">Choose a patient...</option>';
        mockPatients.forEach(patient => {
            const option = document.createElement('option');
            option.value = patient.id;
            option.textContent = `${patient.name} (ID: ${patient.id})`;
            patientSelect.appendChild(option);
        });
    }

    // Populate EEG select based on selected patient
    function populateEEGSelect(patientId) {
        eegSelect.innerHTML = '<option value="">Choose an EEG recording...</option>';
        if (patientId && mockEEGs[patientId]) {
            mockEEGs[patientId].forEach(eeg => {
                const option = document.createElement('option');
                option.value = eeg.id;
                option.textContent = `EEG Recording - ${eeg.date} (${eeg.duration})`;
                eegSelect.appendChild(option);
            });
        }
    }

    // Generate report
    function generateReport() {
        const patientId = patientSelect.value;
        const eegId = eegSelect.value;

        if (!patientId || !eegId) {
            alert('Please select both a patient and an EEG recording.');
            return;
        }

        const patient = mockPatients.find(p => p.id === patientId);
        const eeg = mockEEGs[patientId].find(e => e.id === eegId);

        // Update report content
        document.getElementById('patientName').textContent = patient.name;
        document.getElementById('patientId').textContent = patient.id;
        document.getElementById('patientDob').textContent = patient.dob;
        document.getElementById('patientGender').textContent = patient.gender;
        document.getElementById('eegDate').textContent = eeg.date;
        document.getElementById('eegDuration').textContent = eeg.duration;
        document.getElementById('reportDate').textContent = new Date().toLocaleDateString();
        document.getElementById('doctorName').textContent = doctorName;

        // Show report preview
        reportPreview.style.display = 'block';
    }

    // Edit report
    function editReport() {
        // Make report content editable
        const reportContent = document.getElementById('reportContent');
        reportContent.contentEditable = true;
        reportContent.classList.add('editing');
        
        // Change button text
        editReportBtn.textContent = 'Done Editing';
        editReportBtn.onclick = finishEditing;
    }

    // Finish editing
    function finishEditing() {
        const reportContent = document.getElementById('reportContent');
        reportContent.contentEditable = false;
        reportContent.classList.remove('editing');
        
        // Change button text back
        editReportBtn.textContent = 'Edit Report';
        editReportBtn.onclick = editReport;
    }

    // Save report
    function saveReport() {
        // Here you would typically send the report to a server
        alert('Report saved successfully!');
    }

    // Print report
    function printReport() {
        window.print();
    }

    // Cancel report generation
    function cancelReport() {
        patientSelect.value = '';
        eegSelect.value = '';
        reportPreview.style.display = 'none';
    }

    // Event listeners
    patientSelect.addEventListener('change', () => {
        populateEEGSelect(patientSelect.value);
    });

    generateReportBtn.addEventListener('click', generateReport);
    editReportBtn.addEventListener('click', editReport);
    saveReportBtn.addEventListener('click', saveReport);
    printReportBtn.addEventListener('click', printReport);
    cancelBtn.addEventListener('click', cancelReport);

    // Initialize the page
    populatePatientSelect();
}); 