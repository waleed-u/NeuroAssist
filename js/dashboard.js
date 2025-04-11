document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard
    initializeDashboard();
    
    // Event listeners for navigation
    setupNavigation();
    
    // Event listeners for modals
    setupModals();
    
    // Load initial data
    loadRecentPatients();
    loadPatientList();
});

function initializeDashboard() {
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
    const doctorName = currentUser.name || sessionStorage.getItem('fullName') || 'Doctor';
    
    // Set doctor's name
    document.querySelector('.username').textContent = doctorName;

    // Setup dropdown menu handlers
    setupDropdownMenu();
}

function setupNavigation() {
    // Handle navigation links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function(e) {
            // Only prevent default for links without proper href
            if (this.getAttribute('href') === '#') {
                e.preventDefault();
                
                // Remove active class from all links
                document.querySelectorAll('.nav-links li').forEach(li => {
                    li.classList.remove('active');
                });
                
                // Add active class to clicked link
                this.parentElement.classList.add('active');
                
                // Handle navigation (you'll need to implement the actual page changes)
                const page = this.getAttribute('href').substring(1);
                navigateToPage(page);
            }
        });
    });

    // Handle logout
    document.getElementById('logout').addEventListener('click', function(e) {
        e.preventDefault();
        sessionStorage.clear();
        window.location.href = '../index.html';
    });
}

function setupModals() {
    // Handle the sidebar Annotate EEG button
    const uploadBtn = document.getElementById('uploadEEG');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => {
            window.location.href = '../full_edf_viewer/index.html';
        });
    }

    // Handle quick action buttons
    const uploadEEGQuick = document.getElementById('uploadEEGQuick');
    if (uploadEEGQuick) {
        uploadEEGQuick.addEventListener('click', () => {
            window.location.href = '../full_edf_viewer/index.html';
        });
    }

    const newReportBtn = document.getElementById('newReportBtn');
    if (newReportBtn) {
        newReportBtn.addEventListener('click', () => {
            // Redirect to the new report page
            window.location.href = '../doctor/new-report.html';
        });
    }

    // Remove add patient functionality
}

function setupDropdownMenu() {
    const viewAccountBtn = document.getElementById('viewAccount');
    const changePasswordBtn = document.getElementById('changePassword');
    const logoutBtn = document.getElementById('logoutBtn');

    viewAccountBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'account.html';
    });

    changePasswordBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'change-password.html';
    });

    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            sessionStorage.clear();
            window.location.href = '../index.html';
        }
    });
}

async function loadRecentPatients() {
    try {
        // Use mock data instead of API call
        const patients = [
            { id: '1', name: 'John Smith', patientId: '001', lastVisit: '2024-03-18' },
            { id: '2', name: 'Sarah Johnson', patientId: '002', lastVisit: '2024-03-15' },
            { id: '3', name: 'Michael Brown', patientId: '003', lastVisit: '2024-03-12' },
            { id: '4', name: 'Emily Davis', patientId: '004', lastVisit: '2024-03-10' },
            { id: '5', name: 'Robert Wilson', patientId: '005', lastVisit: '2024-03-05' }
        ];
        
        const patientList = document.querySelector('.patient-list');
        if (!patientList) {
            console.error('Patient list element not found');
            return;
        }
        
        patientList.innerHTML = ''; // Clear existing list
        
        // Sort patients by lastVisit date in descending order (most recent first)
        const sortedPatients = patients.sort((a, b) => new Date(b.lastVisit) - new Date(a.lastVisit));
        
        // Take only the 3 most recent patients
        const recentPatients = sortedPatients.slice(0, 3);
        
        recentPatients.forEach(patient => {
            const patientCard = createPatientCard(patient);
            patientList.appendChild(patientCard);
        });
    } catch (error) {
        console.error('Error loading recent patients:', error);
        showNotification('Failed to load recent patients', 'error');
    }
}

async function loadPatientList() {
    try {
        // Use mock data instead of API call
        const patients = [
            { id: '001', name: 'John Smith', patientId: '001' },
            { id: '002', name: 'Sarah Johnson', patientId: '002' },
            { id: '003', name: 'Michael Brown', patientId: '003' },
            { id: '004', name: 'Emily Davis', patientId: '004' },
            { id: '005', name: 'Robert Wilson', patientId: '005' }
        ];
        
        const patientSelect = document.getElementById('patientSelect');
        if (!patientSelect) {
            console.error('Patient select element not found');
            return;
        }
        
        patientSelect.innerHTML = '<option value="">Choose a patient...</option>';
        
        patients.forEach(patient => {
            const option = document.createElement('option');
            option.value = patient.id;
            option.textContent = `${patient.name} (ID: ${patient.patientId})`;
            patientSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading patient list:', error);
        showNotification('Failed to load patient list', 'error');
    }
}

function createPatientCard(patient) {
    const card = document.createElement('div');
    card.className = 'patient-card';
    card.innerHTML = `
        <div class="patient-info">
            <h3>${patient.name}</h3>
            <p>ID: ${patient.patientId}</p>
            <p>Last Visit: ${new Date(patient.lastVisit).toLocaleDateString()}</p>
        </div>
        <div class="patient-actions">
            <button onclick="viewPatientDetails('${patient.id}')">View Details</button>
            <button onclick="viewEEGHistory('${patient.id}')">EEG History</button>
        </div>
    `;
    return card;
}

async function uploadEEGFile(formData) {
    // This is a placeholder for your actual API call
    try {
        const response = await fetch('/api/eeg/upload', {
            method: 'POST',
            body: formData
        });
        return await response.json();
    } catch (error) {
        throw new Error('Upload failed');
    }
}

function navigateToPage(page) {
    // Implement page navigation logic here
    console.log(`Navigating to ${page}`);
    
    switch(page) {
        case 'patients':
            window.location.href = 'patients.html';
            break;
        case 'analysis':
            window.location.href = 'analysis.html';
            break;
        case 'reports':
            window.location.href = 'reports.html';
            break;
        case 'settings':
            window.location.href = 'settings.html';
            break;
        default:
            // If no specific page, stay on dashboard
            break;
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Placeholder functions for patient actions
function viewPatientDetails(patientId) {
    console.log(`Viewing details for patient ${patientId}`);
    // Implement patient details view
}

function viewEEGHistory(patientId) {
    console.log(`Viewing EEG history for patient ${patientId}`);
    // Implement EEG history view
} 