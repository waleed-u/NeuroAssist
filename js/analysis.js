document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and is a doctor
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userType = sessionStorage.getItem('userType');
    
    if ((!user || user.role !== 'doctor') && (!userType || userType !== 'doctor')) {
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
    
    // Set doctor name in top bar
    document.querySelector('.username').textContent = doctorName;

    // Initialize the page
    initializeAnalysisPage();
});

function initializeAnalysisPage() {
    // Load analysis data
    loadAnalysisData();
    
    // Setup event listeners
    setupSearchBar();
    setupFilters();
    setupModalHandlers();
}

function loadAnalysisData() {
    // This would typically be an API call to get analysis data
    // For now, we'll use dummy data
    const dummyAnalysis = [
        {
            id: 1,
            patientId: 'P001',
            patientName: 'John Doe',
            eegDate: '2024-03-15',
            eegType: 'Routine EEG',
            duration: '30 minutes',
            status: 'pending',
            predictions: ['Epileptiform Activity', 'Abnormal Slowing']
        },
        {
            id: 2,
            patientId: 'P002',
            patientName: 'Jane Smith',
            eegDate: '2024-03-10',
            eegType: 'Sleep EEG',
            duration: '45 minutes',
            status: 'pending',
            predictions: ['Normal EEG', 'Benign Variants']
        },
        {
            id: 3,
            patientId: 'P003',
            patientName: 'Robert Johnson',
            eegDate: '2024-03-05',
            eegType: 'Ambulatory EEG',
            duration: '24 hours',
            status: 'completed',
            predictions: ['Focal Slowing', 'Seizure Activity']
        }
    ];

    displayAnalysis(dummyAnalysis);
}

function displayAnalysis(analysisItems) {
    const pendingList = document.querySelector('#pendingAnalysisList');
    const completedList = document.querySelector('#completedAnalysisList');
    
    // Clear both lists
    pendingList.innerHTML = '';
    completedList.innerHTML = '';

    // Sort items by date (most recent first)
    const sortedItems = analysisItems.sort((a, b) => new Date(b.eegDate) - new Date(a.eegDate));

    sortedItems.forEach(analysis => {
        const analysisCard = createAnalysisCard(analysis);
        if (analysis.status === 'pending') {
            pendingList.appendChild(analysisCard);
        } else if (analysis.status === 'completed') {
            completedList.appendChild(analysisCard);
        }
    });
}

function createAnalysisCard(analysis) {
    const card = document.createElement('div');
    card.className = `analysis-card ${analysis.status}`;
    
    const initials = analysis.patientName.split(' ').map(n => n[0]).join('');
    
    card.innerHTML = `
        <div class="analysis-header">
            <div class="analysis-patient">
                <div class="patient-avatar">${initials}</div>
                <div class="patient-info">
                    <h3>${analysis.patientName}</h3>
                    <p>ID: ${analysis.patientId}</p>
                </div>
            </div>
            <div class="analysis-status">
                <span class="status-badge ${analysis.status}">${analysis.status.charAt(0).toUpperCase() + analysis.status.slice(1)}</span>
            </div>
        </div>
        <div class="analysis-details">
            <div class="detail-item">
                <i class="fas fa-calendar"></i>
                <span>${new Date(analysis.eegDate).toLocaleDateString()}</span>
            </div>
            <div class="detail-item">
                <i class="fas fa-clock"></i>
                <span>${analysis.duration}</span>
            </div>
            <div class="detail-item">
                <i class="fas fa-brain"></i>
                <span>${analysis.eegType}</span>
            </div>
        </div>
        <div class="analysis-predictions">
            <h4>Initial Predictions:</h4>
            <ul>
                ${analysis.predictions.map(pred => `<li>${pred}</li>`).join('')}
            </ul>
        </div>
        <div class="analysis-actions">
            <button onclick="viewAnalysisDetails(${analysis.id})" class="view-btn">
                <i class="fas fa-eye"></i> View Details
            </button>
        </div>
    `;
    return card;
}

function setupSearchBar() {
    const searchInput = document.querySelector('#analysisSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            filterAnalysis(searchTerm);
        });
    }
}

function setupFilters() {
    const filterBtn = document.querySelector('.filter-btn');
    const filterContent = document.querySelector('.filter-content');
    const applyFilterBtn = document.querySelector('.apply-filter');
    
    if (filterBtn && filterContent) {
        filterBtn.addEventListener('click', function() {
            filterContent.style.display = filterContent.style.display === 'none' ? 'block' : 'none';
        });

        // Close filter dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!filterBtn.contains(e.target) && !filterContent.contains(e.target)) {
                filterContent.style.display = 'none';
            }
        });
    }
    
    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', function() {
            applyFilters();
            filterContent.style.display = 'none';
        });
    }
}

function setupModalHandlers() {
    const modal = document.getElementById('analysisModal');
    const closeBtn = modal.querySelector('.close-btn');
    
    // Close modal when clicking the X
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Setup action buttons inside modal
    setupActionButtons();
}

function setupActionButtons() {
    const viewEEGBtn = document.querySelector('.action-btn.view-eeg');
    const approveBtn = document.querySelector('.action-btn.approve');
    const rejectBtn = document.querySelector('.action-btn.reject');
    const modifyBtn = document.querySelector('.action-btn.modify');
    
    if (viewEEGBtn) {
        viewEEGBtn.addEventListener('click', function() {
            const patientId = document.getElementById('modalPatientId').textContent.split(': ')[1];
            viewEEG(patientId);
        });
    }
    
    if (approveBtn) {
        approveBtn.addEventListener('click', function() {
            approveAnalysis();
        });
    }
    
    if (rejectBtn) {
        rejectBtn.addEventListener('click', function() {
            rejectAnalysis();
        });
    }
    
    if (modifyBtn) {
        modifyBtn.addEventListener('click', function() {
            modifyAnalysis();
        });
    }
}

function filterAnalysis(searchTerm) {
    const analysisCards = document.querySelectorAll('.analysis-card');
    
    analysisCards.forEach(card => {
        const patientName = card.querySelector('h3').textContent.toLowerCase();
        const patientId = card.querySelector('p').textContent.toLowerCase();
        
        if (patientName.includes(searchTerm) || patientId.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function applyFilters() {
    const dateFilter = document.getElementById('dateFilter').value;
    const searchTerm = document.getElementById('analysisSearch').value.toLowerCase();
    
    // Get all analysis cards
    const cards = document.querySelectorAll('.analysis-card');
    
    cards.forEach(card => {
        let showCard = true;
        
        // Apply date filter
        if (dateFilter) {
            const dateText = card.querySelector('.detail-item:nth-child(1) span').textContent;
            const analysisDate = new Date(dateText);
            const today = new Date();
            
            switch(dateFilter) {
                case 'today':
                    showCard = analysisDate.toDateString() === today.toDateString();
                    break;
                case 'week':
                    const weekAgo = new Date(today.setDate(today.getDate() - 7));
                    showCard = analysisDate >= weekAgo;
                    break;
                case 'month':
                    const monthAgo = new Date(today.setMonth(today.getMonth() - 1));
                    showCard = analysisDate >= monthAgo;
                    break;
            }
        }
        
        // Apply search filter
        if (showCard && searchTerm) {
            const patientName = card.querySelector('.patient-info h3').textContent.toLowerCase();
            const patientId = card.querySelector('.patient-info p').textContent.toLowerCase();
            showCard = patientName.includes(searchTerm) || patientId.includes(searchTerm);
        }
        
        // Show/hide card
        card.style.display = showCard ? 'block' : 'none';
    });
}

function viewAnalysisDetails(analysisId) {
    // This would typically fetch analysis details from an API
    // For now, we'll use dummy data
    const dummyAnalysisDetails = {
        id: analysisId,
        patientId: 'P001',
        patientName: 'John Doe',
        eegDate: '2024-03-15',
        eegType: 'Routine EEG',
        duration: '30 minutes',
        status: 'pending',
        predictions: [
            {
                name: 'Epileptiform Activity',
                confidence: 92,
                details: 'Model detected spike-wave complexes in channels F3-C3, F4-C4',
                explanation: 'Model identified 3.5 Hz spike-wave discharges with frontal predominance, characteristic of absence seizures.'
            },
            {
                name: 'Abnormal Slowing',
                confidence: 76,
                details: 'Model detected theta slowing in the left temporal region',
                explanation: 'Left temporal theta activity (4-7 Hz) potentially indicating focal dysfunction.'
            }
        ]
    };

    displayAnalysisDetails(dummyAnalysisDetails);
}

function displayAnalysisDetails(details) {
    const modal = document.getElementById('analysisModal');
    
    // Populate patient info
    document.getElementById('modalPatientName').textContent = details.patientName;
    document.getElementById('modalPatientId').textContent = `ID: ${details.patientId}`;
    
    // Populate EEG info
    document.getElementById('eegDate').textContent = details.eegDate;
    document.getElementById('eegDuration').textContent = details.duration;
    document.getElementById('eegType').textContent = details.eegType;
    document.getElementById('eegStatus').textContent = details.status === 'pending' ? 'Pending Review' : 'Completed';
    document.getElementById('eegStatus').className = `status ${details.status}`;
    
    // Update action buttons based on status
    const actionButtons = document.querySelector('.action-buttons');
    if (details.status === 'pending') {
        actionButtons.innerHTML = `
            <button class="action-btn view-eeg" onclick="viewEEG('${details.patientId}')">
                <i class="fas fa-eye"></i> View Full EEG
            </button>
            <button class="action-btn reject" onclick="rejectAnalysis(${details.id})">
                <i class="fas fa-times"></i> Reject Analysis
            </button>
            <button class="action-btn modify" onclick="modifyAnalysis(${details.id})">
                <i class="fas fa-edit"></i> Modify Analysis
            </button>
            <button class="action-btn approve" onclick="approveAnalysis(${details.id})">
                <i class="fas fa-check"></i> Approve Analysis
            </button>
        `;
    } else {
        actionButtons.innerHTML = `
            <button class="action-btn view-eeg" onclick="viewEEG('${details.patientId}')">
                <i class="fas fa-eye"></i> View Full EEG
            </button>
        `;
    }
    
    // Show modal
    modal.style.display = 'block';
}

function viewEEG(patientId) {
    // Redirect to the EDF viewer with the patient ID
    window.location.href = `/full_edf_viewer/index.html?patientId=${patientId}`;
}

function approveAnalysis() {
    // This would typically send an API request to approve the analysis
    alert('Analysis approved successfully');
    document.getElementById('analysisModal').style.display = 'none';
    
    // Reload data to reflect changes
    loadAnalysisData();
}

function rejectAnalysis() {
    // This would typically send an API request to reject the analysis
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
        alert('Analysis rejected');
        document.getElementById('analysisModal').style.display = 'none';
        
        // Reload data to reflect changes
        loadAnalysisData();
    }
}

function modifyAnalysis() {
    // This would typically redirect to a page to modify the analysis
    const assessment = document.getElementById('doctorAssessment').value;
    if (assessment.trim() === '') {
        alert('Please provide your assessment before modifying the analysis');
        return;
    }
    
    alert('Analysis modifications saved');
    document.getElementById('analysisModal').style.display = 'none';
    
    // Reload data to reflect changes
    loadAnalysisData();
} 