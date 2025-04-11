// DOM Elements
const addPatientBtn = document.getElementById('addPatientBtn');
const viewHistoryBtn = document.getElementById('viewHistoryBtn');
const managePatientsBtn = document.getElementById('managePatientsBtn');
const addPatientModal = document.getElementById('addPatientModal');
const patientHistoryModal = document.getElementById('patientHistoryModal');
const managePatientsModal = document.getElementById('managePatientsModal');
const addPatientForm = document.getElementById('addPatientForm');
const closeButtons = document.querySelectorAll('.close-btn');
const cancelButtons = document.querySelectorAll('.secondary-btn');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize dashboard
    loadDashboardStats();
    loadRecentPatients();
    
    // Add event listeners for modals
    if (addPatientBtn) {
        addPatientBtn.addEventListener('click', () => openModal(addPatientModal));
    }
    
    if (viewHistoryBtn) {
        viewHistoryBtn.addEventListener('click', () => openModal(patientHistoryModal));
    }
    
    if (managePatientsBtn) {
        managePatientsBtn.addEventListener('click', () => openModal(managePatientsModal));
    }
    
    // Close modal buttons
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Cancel buttons
    cancelButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });
    
    // Form submission
    if (addPatientForm) {
        addPatientForm.addEventListener('submit', handleAddPatient);
    }
});

// Dashboard Stats
function loadDashboardStats() {
    // This would typically fetch data from your backend
    const stats = {
        totalPatients: 150,
        totalReports: 320,
        pendingReports: 12
    };
    
    updateStatsDisplay(stats);
}

function updateStatsDisplay(stats) {
    const statsElements = {
        totalPatients: document.querySelector('.stat-card:nth-child(1) p'),
        totalReports: document.querySelector('.stat-card:nth-child(2) p'),
        pendingReports: document.querySelector('.stat-card:nth-child(3) p')
    };
    
    for (const [key, element] of Object.entries(statsElements)) {
        if (element) {
            element.textContent = stats[key];
        }
    }
}

// Recent Patients
function loadRecentPatients() {
    // This would typically fetch data from your backend
    const patients = [
        {
            name: 'John Smith',
            id: 'P001',
            lastVisit: '2024-03-15',
            status: 'Active'
        },
        {
            name: 'Sarah Johnson',
            id: 'P002',
            lastVisit: '2024-03-14',
            status: 'Active'
        },
        {
            name: 'Michael Brown',
            id: 'P003',
            lastVisit: '2024-03-13',
            status: 'Active'
        }
    ];
    
    updatePatientsList(patients);
}

function updatePatientsList(patients) {
    const patientsList = document.querySelector('.patient-list');
    if (!patientsList) return;
    
    patientsList.innerHTML = patients.map(patient => `
        <div class="patient-card">
            <div class="patient-info">
                <h3>${patient.name}</h3>
                <p>ID: ${patient.id}</p>
                <p>Last Visit: ${patient.lastVisit}</p>
            </div>
            <div class="patient-status ${patient.status.toLowerCase()}">
                ${patient.status}
            </div>
        </div>
    `).join('');
}

// Modal Functions
function openModal(modal) {
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeModal(modal) {
    if (modal) {
        modal.style.display = 'none';
        if (modal.querySelector('form')) {
            modal.querySelector('form').reset();
        }
    }
}

// Add Patient
async function handleAddPatient(e) {
    e.preventDefault();
    
    const formData = new FormData(addPatientForm);
    const patientData = Object.fromEntries(formData.entries());
    
    try {
        // Show loading state
        const submitBtn = addPatientForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Adding Patient...';
        submitBtn.disabled = true;
        
        // This would typically send the data to your backend
        // const response = await fetch('/api/patients', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify(patientData)
        // });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Show success message
        showNotification('Patient added successfully!', 'success');
        
        // Close modal and reset form
        closeModal(addPatientModal);
        
        // Refresh patient list
        loadRecentPatients();
        
    } catch (error) {
        console.error('Error adding patient:', error);
        showNotification('Error adding patient. Please try again.', 'error');
    } finally {
        // Reset button state
        const submitBtn = addPatientForm.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Add Patient';
        submitBtn.disabled = false;
    }
}

// Patient History
function loadPatientHistory(patientId) {
    // This would typically fetch data from your backend
    const history = [
        {
            date: '2024-03-15',
            type: 'EEG Analysis',
            doctor: 'Dr. John Smith',
            summary: 'Normal brain activity patterns detected'
        },
        {
            date: '2024-02-15',
            type: 'Follow-up',
            doctor: 'Dr. Sarah Johnson',
            summary: 'Patient showing improvement'
        }
    ];
    
    updateHistoryList(history);
}

function updateHistoryList(history) {
    const historyList = document.querySelector('.history-list');
    if (!historyList) return;
    
    historyList.innerHTML = history.map(item => `
        <div class="history-item">
            <div class="history-date">${item.date}</div>
            <div class="history-content">
                <h4>${item.type}</h4>
                <p><strong>Doctor:</strong> ${item.doctor}</p>
                <p>${item.summary}</p>
            </div>
        </div>
    `).join('');
}

// Manage Patients
function loadPatientTable() {
    // This would typically fetch data from your backend
    const patients = [
        {
            id: 'P001',
            name: 'John Smith',
            age: 45,
            lastVisit: '2024-03-15'
        },
        {
            id: 'P002',
            name: 'Sarah Johnson',
            age: 32,
            lastVisit: '2024-03-14'
        }
    ];
    
    updatePatientTable(patients);
}

function updatePatientTable(patients) {
    const tableBody = document.querySelector('.patient-table tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = patients.map(patient => `
        <tr>
            <td>${patient.id}</td>
            <td>${patient.name}</td>
            <td>${patient.age}</td>
            <td>${patient.lastVisit}</td>
            <td>
                <button class="action-btn small" onclick="viewPatient('${patient.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn small" onclick="editPatient('${patient.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn small" onclick="deletePatient('${patient.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Patient Actions
function viewPatient(patientId) {
    console.log('Viewing patient:', patientId);
    // Implement view patient functionality
}

function editPatient(patientId) {
    console.log('Editing patient:', patientId);
    // Implement edit patient functionality
}

async function deletePatient(patientId) {
    if (confirm('Are you sure you want to delete this patient?')) {
        try {
            // This would typically send a request to your backend
            // await fetch(`/api/patients/${patientId}`, {
            //     method: 'DELETE'
            // });
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            showNotification('Patient deleted successfully', 'success');
            loadPatientTable();
            loadRecentPatients();
            
        } catch (error) {
            console.error('Error deleting patient:', error);
            showNotification('Error deleting patient', 'error');
        }
    }
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Search Functionality
const searchInput = document.querySelector('.search-bar input');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        // Implement search functionality here
        console.log('Searching for:', searchTerm);
    });
}

// Logout Functionality
const logoutBtn = document.querySelector('.sidebar-footer a');
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Implement logout functionality here
        console.log('Logging out...');
        // Redirect to login page
        // window.location.href = '/login';
    });
} 