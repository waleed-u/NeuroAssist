document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and is a doctor
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
    
    // Set doctor's name in the top bar
    const usernameElement = document.querySelector('.username');
    if (usernameElement) {
        usernameElement.textContent = doctorName;
    }

    // Initialize reports page
    initializeReports();
});

function initializeReports() {
    // Load mock reports data
    const reports = getMockReports();
    displayReports(reports);

    // Setup event listeners
    setupEventListeners();
}

function getMockReports() {
    // Mock data for reports
    return [
        {
            id: 'R001',
            patientId: 'P001',
            patientName: 'John Doe',
            date: '2024-03-15',
            title: 'EEG Analysis Report',
            summary: 'Routine EEG analysis showing normal brain activity patterns.',
            status: 'completed',
            clinicalHistory: 'Patient presented with episodes of staring and unresponsiveness...',
            eegFindings: 'The EEG recording shows normal background activity with well-organized alpha rhythm...',
            interpretation: 'Based on the EEG findings, there is no evidence of epileptiform activity...',
            recommendations: '1. Continue current medication\n2. Follow up in 3 months\n3. Maintain regular sleep schedule'
        },
        {
            id: 'R002',
            patientId: 'P002',
            patientName: 'Jane Smith',
            date: '2024-03-14',
            title: 'Sleep Study Report',
            summary: 'Polysomnography study indicating mild sleep apnea.',
            status: 'completed',
            clinicalHistory: 'Patient reports excessive daytime sleepiness...',
            eegFindings: 'Sleep architecture shows reduced REM sleep...',
            interpretation: 'Findings consistent with mild obstructive sleep apnea...',
            recommendations: '1. Consider CPAP therapy\n2. Weight management\n3. Sleep hygiene education'
        },
        {
            id: 'R003',
            patientId: 'P003',
            patientName: 'Robert Johnson',
            date: '2024-03-13',
            title: 'Emergency EEG Report',
            summary: 'Emergency EEG showing focal slowing in temporal region.',
            status: 'completed',
            clinicalHistory: 'Patient presented with sudden onset of confusion...',
            eegFindings: 'Focal slowing in left temporal region...',
            interpretation: 'Findings suggest possible temporal lobe dysfunction...',
            recommendations: '1. Immediate neurology consultation\n2. MRI brain\n3. Start anti-seizure medication'
        }
    ];
}

function displayReports(reports) {
    const reportsList = document.getElementById('reportsList');
    reportsList.innerHTML = '';

    reports.forEach(report => {
        const reportCard = createReportCard(report);
        reportsList.appendChild(reportCard);
    });
}

function createReportCard(report) {
    const card = document.createElement('div');
    card.className = 'report-card';
    card.innerHTML = `
        <div class="report-header">
            <h3>${report.title}</h3>
            <span class="report-date">Generated on: ${formatDate(report.date)}</span>
        </div>
        <div class="patient-info">
            <div class="info-item">
                <span class="info-label">Patient Name:</span>
                <span class="info-value">${report.patientName}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Patient ID:</span>
                <span class="info-value">${report.patientId}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Report ID:</span>
                <span class="info-value">${report.id}</span>
            </div>
        </div>
        <div class="report-summary">
            ${report.summary}
        </div>
        <div class="report-actions">
            <button class="btn btn-primary" onclick="viewReport('${report.id}')">
                <i class="fas fa-eye"></i> View Report
            </button>
            <button class="btn btn-secondary" onclick="printReport('${report.id}')">
                <i class="fas fa-print"></i> Print
            </button>
        </div>
    `;
    return card;
}

function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('reportSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const reports = getMockReports();
            const filteredReports = reports.filter(report => 
                report.patientName.toLowerCase().includes(searchTerm) ||
                report.title.toLowerCase().includes(searchTerm) ||
                report.id.toLowerCase().includes(searchTerm)
            );
            displayReports(filteredReports);
        });
    }

    // Filter functionality
    const filterSelect = document.getElementById('filterStatus');
    const applyFilterBtn = document.getElementById('applyFilter');
    if (filterSelect && applyFilterBtn) {
        applyFilterBtn.addEventListener('click', function() {
            const filterValue = filterSelect.value;
            const reports = getMockReports();
            let filteredReports = reports;
            
            if (filterValue === 'recent') {
                filteredReports = reports.filter(report => 
                    new Date(report.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                );
            } else if (filterValue === 'archived') {
                filteredReports = reports.filter(report => 
                    new Date(report.date) <= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                );
            }
            
            displayReports(filteredReports);
        });
    }

    // Modal close button
    const closeBtn = document.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            const modal = document.getElementById('viewReportModal');
            modal.style.display = 'none';
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('viewReportModal');
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Setup logout functionality
    setupLogout();
    
    // Setup navigation
    setupNavigation();
}

function setupLogout() {
    // Handle logout from sidebar
    const logoutBtn = document.getElementById('logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                sessionStorage.clear();
                window.location.href = '../index.html';
            }
        });
    }

    // Handle logout from dropdown
    const logoutDropdownBtn = document.getElementById('logoutBtn');
    if (logoutDropdownBtn) {
        logoutDropdownBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                sessionStorage.clear();
                window.location.href = '../index.html';
            }
        });
    }
}

function setupNavigation() {
    // Handle the sidebar Annotate EEG button
    const uploadBtn = document.getElementById('uploadEEG');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '../full_edf_viewer/index.html';
        });
    }
    
    // Handle account links
    const viewAccountBtn = document.getElementById('viewAccount');
    const changePasswordBtn = document.getElementById('changePassword');
    
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
}

function viewReport(reportId) {
    const reports = getMockReports();
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    // Populate modal with report data
    document.getElementById('reportTitle').textContent = report.title;
    document.getElementById('reportDate').textContent = `Generated on: ${formatDate(report.date)}`;
    document.getElementById('patientName').textContent = report.patientName;
    document.getElementById('patientId').textContent = report.patientId;
    document.getElementById('reportId').textContent = report.id;
    document.getElementById('clinicalHistory').textContent = report.clinicalHistory;
    document.getElementById('eegFindings').textContent = report.eegFindings;
    document.getElementById('interpretation').textContent = report.interpretation;
    document.getElementById('recommendations').textContent = report.recommendations;

    // Show modal
    const modal = document.getElementById('viewReportModal');
    modal.style.display = 'block';
}

function printReport(reportId) {
    const reports = getMockReports();
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>${report.title}</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .section { margin-bottom: 20px; }
                    h1, h2, h3 { color: #2c3e50; }
                    .info-item { margin-bottom: 10px; }
                    .info-label { font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${report.title}</h1>
                    <p>Generated on: ${formatDate(report.date)}</p>
                </div>
                <div class="section">
                    <h2>Patient Information</h2>
                    <div class="info-item">
                        <span class="info-label">Patient Name:</span> ${report.patientName}
                    </div>
                    <div class="info-item">
                        <span class="info-label">Patient ID:</span> ${report.patientId}
                    </div>
                    <div class="info-item">
                        <span class="info-label">Report ID:</span> ${report.id}
                    </div>
                </div>
                <div class="section">
                    <h2>Clinical History</h2>
                    <p>${report.clinicalHistory}</p>
                </div>
                <div class="section">
                    <h2>EEG Findings</h2>
                    <p>${report.eegFindings}</p>
                </div>
                <div class="section">
                    <h2>Interpretation</h2>
                    <p>${report.interpretation}</p>
                </div>
                <div class="section">
                    <h2>Recommendations</h2>
                    <p>${report.recommendations}</p>
                </div>
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
} 