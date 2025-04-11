// DOM Elements
const viewDiagnosisBtn = document.getElementById('viewDiagnosisBtn');
const viewHistoryBtn = document.getElementById('viewHistoryBtn');
const downloadReportsBtn = document.getElementById('downloadReportsBtn');
const diagnosisModal = document.getElementById('diagnosisModal');
const historyModal = document.getElementById('historyModal');
const reportsModal = document.getElementById('reportsModal');
const closeButtons = document.querySelectorAll('.close-btn');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize dashboard
    loadDashboardStats();
    loadCurrentStatus();
    loadRecentReports();
    
    // Add event listeners for modals
    if (viewDiagnosisBtn) {
        viewDiagnosisBtn.addEventListener('click', () => openModal(diagnosisModal));
    }
    
    if (viewHistoryBtn) {
        viewHistoryBtn.addEventListener('click', () => openModal(historyModal));
    }
    
    if (downloadReportsBtn) {
        downloadReportsBtn.addEventListener('click', () => openModal(reportsModal));
    }
    
    // Close modal buttons
    closeButtons.forEach(btn => {
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
});

// Dashboard Stats
function loadDashboardStats() {
    // This would typically fetch data from your backend
    const stats = {
        totalReports: 5,
        pendingReports: 1,
        lastVisit: '2024-03-15'
    };
    
    updateStatsDisplay(stats);
}

function updateStatsDisplay(stats) {
    const statsElements = {
        totalReports: document.querySelector('.stat-card:nth-child(1) p'),
        pendingReports: document.querySelector('.stat-card:nth-child(2) p'),
        lastVisit: document.querySelector('.stat-card:nth-child(3) p')
    };
    
    for (const [key, element] of Object.entries(statsElements)) {
        if (element) {
            element.textContent = stats[key];
        }
    }
}

// Current Status
function loadCurrentStatus() {
    // This would typically fetch data from your backend
    const status = {
        date: '2024-03-15',
        doctor: 'Dr. John Smith',
        status: 'Under Review'
    };
    
    updateCurrentStatus(status);
}

function updateCurrentStatus(status) {
    const statusDetails = document.querySelector('.status-details');
    if (!statusDetails) return;
    
    statusDetails.innerHTML = `
        <p><strong>Date:</strong> ${status.date}</p>
        <p><strong>Doctor:</strong> ${status.doctor}</p>
        <p><strong>Status:</strong> ${status.status}</p>
    `;
}

// Recent Reports
function loadRecentReports() {
    // This would typically fetch data from your backend
    const reports = [
        {
            date: '2024-03-15',
            type: 'EEG Analysis',
            doctor: 'Dr. John Smith',
            status: 'Pending Review'
        },
        {
            date: '2024-02-15',
            type: 'Follow-up Report',
            doctor: 'Dr. Sarah Johnson',
            status: 'Completed'
        }
    ];
    
    updateReportsList(reports);
}

function updateReportsList(reports) {
    const reportsList = document.querySelector('.report-list');
    if (!reportsList) return;
    
    reportsList.innerHTML = reports.map(report => `
        <div class="report-card">
            <div class="report-info">
                <h3>${report.type}</h3>
                <p><strong>Date:</strong> ${report.date}</p>
                <p><strong>Doctor:</strong> ${report.doctor}</p>
            </div>
            <div class="report-status ${report.status.toLowerCase().replace(' ', '-')}">
                ${report.status}
            </div>
        </div>
    `).join('');
}

// Modal Functions
function openModal(modal) {
    if (modal) {
        modal.style.display = 'block';
        
        // Load data based on modal type
        if (modal.id === 'historyModal') {
            loadMedicalHistory();
        } else if (modal.id === 'reportsModal') {
            loadAllReports();
        }
    }
}

function closeModal(modal) {
    if (modal) {
        modal.style.display = 'none';
    }
}

// Medical History
function loadMedicalHistory() {
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
    
    updateHistoryTimeline(history);
}

function updateHistoryTimeline(history) {
    const timeline = document.querySelector('.history-timeline');
    if (!timeline) return;
    
    timeline.innerHTML = history.map(item => `
        <div class="timeline-item">
            <div class="timeline-date">${item.date}</div>
            <div class="timeline-content">
                <h4>${item.type}</h4>
                <p><strong>Doctor:</strong> ${item.doctor}</p>
                <p>${item.summary}</p>
            </div>
        </div>
    `).join('');
}

// All Reports
function loadAllReports() {
    // This would typically fetch data from your backend
    const reports = [
        {
            id: 'R001',
            date: '2024-03-15',
            type: 'EEG Analysis',
            doctor: 'Dr. John Smith',
            status: 'Pending Review'
        },
        {
            id: 'R002',
            date: '2024-02-15',
            type: 'Follow-up Report',
            doctor: 'Dr. Sarah Johnson',
            status: 'Completed'
        }
    ];
    
    updateReportsModal(reports);
}

function updateReportsModal(reports) {
    const reportsList = document.querySelector('.reports-list');
    if (!reportsList) return;
    
    reportsList.innerHTML = reports.map(report => `
        <div class="report-item">
            <div class="report-header">
                <h4>${report.type}</h4>
                <span class="report-status ${report.status.toLowerCase().replace(' ', '-')}">
                    ${report.status}
                </span>
            </div>
            <div class="report-details">
                <p><strong>Date:</strong> ${report.date}</p>
                <p><strong>Doctor:</strong> ${report.doctor}</p>
                <p><strong>Report ID:</strong> ${report.id}</p>
            </div>
            <div class="report-actions">
                <button class="action-btn small" onclick="viewReport('${report.id}')">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="action-btn small" onclick="downloadReport('${report.id}')">
                    <i class="fas fa-download"></i> Download
                </button>
            </div>
        </div>
    `).join('');
}

// Report Actions
function viewReport(reportId) {
    console.log('Viewing report:', reportId);
    // Implement view report functionality
}

async function downloadReport(reportId) {
    try {
        // This would typically send a request to your backend
        // const response = await fetch(`/api/reports/${reportId}/download`);
        // const blob = await response.blob();
        // const url = window.URL.createObjectURL(blob);
        // const a = document.createElement('a');
        // a.href = url;
        // a.download = `report-${reportId}.pdf`;
        // a.click();
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        showNotification('Report downloaded successfully', 'success');
        
    } catch (error) {
        console.error('Error downloading report:', error);
        showNotification('Error downloading report', 'error');
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