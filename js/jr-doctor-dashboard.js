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

async function initializeDashboard() {
    try {
        // Check if user is logged in
        const user = JSON.parse(localStorage.getItem('user')) || JSON.parse(sessionStorage.getItem('user'));
        const token = localStorage.getItem('token');
        
        if (!user || !token) {
            console.log('No valid authentication found, redirecting to login');
            window.location.href = '../index.html';
            return;
        }
        
        // Update consultant name
        const username = sessionStorage.getItem('username') || user.username;
        const fullName = sessionStorage.getItem('fullName') || user.fullName;
        
        document.querySelector('.username').textContent = username;
        const consultantNameElement = document.getElementById('consultantName');
        if (consultantNameElement) {
            consultantNameElement.textContent = fullName;
        }
        
        // Load dashboard metrics
        const dashboardResponse = await fetch('http://localhost:3000/api/dashboard/metrics', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (dashboardResponse.ok) {
            const metrics = await dashboardResponse.json();
            updateDashboardMetrics(metrics);
        }
    } catch (error) {
        console.error('Error initializing dashboard:', error);
    }
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
        localStorage.removeItem('token');
        localStorage.removeItem('user');
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
}

function setupDropdownMenu() {
    const viewAccountBtn = document.getElementById('viewAccount');
    const changePasswordBtn = document.getElementById('changePassword');
    const logoutBtn = document.getElementById('logoutBtn');

    if (viewAccountBtn) {
        viewAccountBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'account.html';
        });
    }

    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'change-password.html';
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                sessionStorage.clear();
                window.location.href = '../index.html';
            }
        });
    }
}

async function loadRecentPatients() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No authentication token found');
            return;
        }
        
        // Fetch recent patients from the API
        const response = await fetch('http://localhost:3000/api/patients/recent', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch recent patients: ${response.status}`);
        }
        
        const patients = await response.json();
        console.log('Recent patients:', patients); // Debug log
        
        const patientList = document.getElementById('patientList');
        const noPatients = document.getElementById('noPatients');
        
        if (!patientList) {
            console.error('Patient list element not found');
            return;
        }
        
        // Clear existing list (except the no-patients message)
        const existingCards = patientList.querySelectorAll('.patient-card');
        existingCards.forEach(card => card.remove());
        
        // Check if there are patients
        if (patients.length === 0) {
            if (noPatients) noPatients.style.display = 'block';
            return;
        }
        
        // Hide the no patients message if we have patients
        if (noPatients) noPatients.style.display = 'none';
        
        // Sort patients by lastVisit date in descending order (most recent first)
        const sortedPatients = patients.sort((a, b) => {
            return new Date(b.lastVisit || 0) - new Date(a.lastVisit || 0);
        });
        
        // Display up to 3 most recent patients
        const recentPatients = sortedPatients.slice(0, 3);
        
        recentPatients.forEach(patient => {
            const patientCard = createPatientCard(patient);
            patientList.appendChild(patientCard);
        });
    } catch (error) {
        console.error('Error loading recent patients:', error);
        
        // Show no patients message on error
        const noPatients = document.getElementById('noPatients');
        if (noPatients) noPatients.style.display = 'block';
        
        showNotification('Failed to load recent patients', 'error');
    }
}

async function loadPatientList() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No authentication token found');
            return;
        }
        
        // Fetch all patients from the API for the patient select dropdown
        const response = await fetch('http://localhost:3000/api/patients', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch patients: ${response.status}`);
        }
        
        const patients = await response.json();
        console.log('All patients for dropdown:', patients); // Debug log
        
        const patientSelect = document.getElementById('patientSelect');
        if (!patientSelect) {
            console.error('Patient select element not found');
            return;
        }
        
        // Clear existing options except the default one
        patientSelect.innerHTML = '<option value="">Choose a patient...</option>';
        
        // Add patients to dropdown
        if (patients.length > 0) {
            patients.forEach(patient => {
                const option = document.createElement('option');
                option.value = patient.id;
                option.textContent = `${patient.name} (ID: ${patient.patient_id})`;
                patientSelect.appendChild(option);
            });
        } else {
            // Add a disabled option indicating no patients
            const option = document.createElement('option');
            option.disabled = true;
            option.textContent = 'No patients available';
            patientSelect.appendChild(option);
        }
    } catch (error) {
        console.error('Error loading patient list:', error);
        
        // Set a disabled option on error
        const patientSelect = document.getElementById('patientSelect');
        if (patientSelect) {
            patientSelect.innerHTML = '<option value="">Choose a patient...</option>';
            const option = document.createElement('option');
            option.disabled = true;
            option.textContent = 'Error loading patients';
            patientSelect.appendChild(option);
        }
        
        showNotification('Failed to load patient list', 'error');
    }
}

function createPatientCard(patient) {
    const card = document.createElement('div');
    card.className = 'patient-card';
    
    // Format the last visit date or use 'N/A' if not available
    const lastVisitDate = patient.lastVisit 
        ? new Date(patient.lastVisit).toLocaleDateString() 
        : 'N/A';
    
    card.innerHTML = `
        <div class="patient-info">
            <h3>${patient.name}</h3>
            <p>ID: ${patient.patient_id}</p>
            <p>Last Visit: ${lastVisitDate}</p>
        </div>
        <div class="patient-actions">
            <button onclick="viewPatientDetails('${patient.id}')">View Details</button>
        </div>
    `;
    return card;
}

async function uploadEEGFile(formData) {
    // This is a placeholder for your actual API call
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/eeg/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
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

// View patient details
async function viewPatientDetails(patientId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Authentication required', 'error');
            return;
        }
        
        // Show loading state
        showNotification('Loading patient details...', 'info');
        
        // Fetch patient details
        const patientResponse = await fetch(`http://localhost:3000/api/patients/${patientId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!patientResponse.ok) {
            throw new Error(`Failed to fetch patient details: ${patientResponse.status}`);
        }
        
        const patient = await patientResponse.json();

        // Fetch patient vitals
        const vitalsResponse = await fetch(`http://localhost:3000/api/patients/${patientId}/vitals`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const vitals = await vitalsResponse.json();

        // Fetch patient EEG history
        const eegResponse = await fetch(`http://localhost:3000/api/patients/${patientId}/eeg-history`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const eegHistory = await eegResponse.json();

        // Populate modal with patient details
        document.getElementById('modalPatientName').textContent = patient.full_name || 'N/A';
        document.getElementById('modalPatientId').textContent = patient.patient_id || 'N/A';
        document.getElementById('modalPatientDOB').textContent = patient.date_of_birth 
            ? new Date(patient.date_of_birth).toLocaleDateString() 
            : 'N/A';
        document.getElementById('modalPatientGender').textContent = patient.gender || 'N/A';
        document.getElementById('modalPatientContact').textContent = patient.contact_number || 'N/A';
        document.getElementById('modalPatientAddress').textContent = patient.address || 'N/A';
        document.getElementById('modalPatientHistory').textContent = patient.medical_history || 'No medical history available';

        // Populate vitals if available
        if (vitals && vitals.length > 0) {
            const latestVitals = vitals[0];
            document.getElementById('modalPatientBP').textContent = latestVitals.blood_pressure || 'N/A';
            document.getElementById('modalPatientHR').textContent = latestVitals.heart_rate || 'N/A';
            document.getElementById('modalPatientTemp').textContent = latestVitals.temperature 
                ? `${latestVitals.temperature}°C` 
                : 'N/A';
            document.getElementById('modalPatientWeight').textContent = latestVitals.weight 
                ? `${latestVitals.weight} kg` 
                : 'N/A';
            document.getElementById('modalPatientHeight').textContent = latestVitals.height 
                ? `${latestVitals.height} cm` 
                : 'N/A';
        } else {
            document.getElementById('modalPatientBP').textContent = 'N/A';
            document.getElementById('modalPatientHR').textContent = 'N/A';
            document.getElementById('modalPatientTemp').textContent = 'N/A';
            document.getElementById('modalPatientWeight').textContent = 'N/A';
            document.getElementById('modalPatientHeight').textContent = 'N/A';
        }

        // Populate EEG history
        const eegTableBody = document.getElementById('modalPatientEEG');
        eegTableBody.innerHTML = '';
        if (eegHistory && eegHistory.length > 0) {
            eegHistory.forEach(eeg => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${eeg.recording_date ? new Date(eeg.recording_date).toLocaleDateString() : 'N/A'}</td>
                    <td>${eeg.duration ? `${eeg.duration} sec` : 'N/A'}</td>
                    <td>${eeg.notes || 'No notes'}</td>
                    <td>
                        <span class="badge bg-${eeg.status === 'completed' ? 'success' : 'warning'}">
                            ${eeg.status || 'pending'}
                        </span>
                    </td>
                `;
                eegTableBody.appendChild(row);
            });
        } else {
            eegTableBody.innerHTML = '<tr><td colspan="4" class="text-center">No EEG recordings found</td></tr>';
        }

        // Show modal
        const patientDetailsModal = document.getElementById('patientDetailsModal');
        if (patientDetailsModal) {
            const modal = new bootstrap.Modal(patientDetailsModal);
            modal.show();
        } else {
            console.error('Patient details modal not found');
            showNotification('Error displaying patient details', 'error');
        }
    } catch (error) {
        console.error('Error fetching patient details:', error);
        showNotification('Error loading patient details. Please try again.', 'error');
    }
}

function viewAnalysis(analysisId) {
    window.location.href = `analysis.html?id=${analysisId}`;
}

// Setup event listeners
function setupEventListeners() {
    // Add additional event listeners here if needed
}

// Expose viewPatientDetails to global scope so it can be called from HTML
window.viewPatientDetails = viewPatientDetails;