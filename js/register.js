document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const userTypeSelect = document.getElementById('userType');
    const patientIdGroup = document.getElementById('patientIdGroup');
    const licenseNumberGroup = document.getElementById('licenseNumberGroup');

    // Show/hide additional fields based on user type
    userTypeSelect.addEventListener('change', function() {
        const selectedType = this.value;
        
        // Hide both groups first
        patientIdGroup.style.display = 'none';
        licenseNumberGroup.style.display = 'none';
        
        // Show relevant group based on selection
        if (selectedType === 'patient') {
            patientIdGroup.style.display = 'block';
            document.getElementById('patientId').required = true;
            document.getElementById('licenseNumber').required = false;
        } else if (selectedType === 'doctor') {
            licenseNumberGroup.style.display = 'block';
            document.getElementById('licenseNumber').required = true;
            document.getElementById('patientId').required = false;
        }
    });

    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Clear any existing messages
        clearMessages();
        
        // Get form values
        const formData = {
            fullName: document.getElementById('fullName').value.trim(),
            email: document.getElementById('email').value.trim(),
            username: document.getElementById('username').value.trim(),
            password: document.getElementById('password').value,
            confirmPassword: document.getElementById('confirmPassword').value,
            userType: document.getElementById('userType').value
        };

        // Validate required fields
        if (!formData.fullName || !formData.email || !formData.username || !formData.password || !formData.userType) {
            showError('All fields are required');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            showError('Please enter a valid email address');
            return;
        }

        // Validate password length
        if (formData.password.length < 6) {
            showError('Password must be at least 6 characters long');
            return;
        }

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            showError('Passwords do not match');
            return;
        }

        // Add additional fields based on user type
        if (formData.userType === 'patient') {
            const patientId = document.getElementById('patientId').value.trim();
            if (!patientId) {
                showError('Patient ID is required');
                return;
            }
            formData.patientId = patientId;
        } else if (formData.userType === 'doctor') {
            const licenseNumber = document.getElementById('licenseNumber').value.trim();
            if (!licenseNumber) {
                showError('License number is required');
                return;
            }
            formData.licenseNumber = licenseNumber;
        }

        try {
            const response = await registerUser(formData);
            
            if (response.success) {
                showSuccess('Registration successful! Redirecting to login...');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                showError(response.message || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            showError(error.message || 'An error occurred. Please try again later.');
        }
    });
});

async function registerUser(formData) {
    try {
        const response = await fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors',
            credentials: 'same-origin',
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Registration failed');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Registration error:', error);
        if (error.message === 'Failed to fetch') {
            throw new Error('Unable to connect to the server. Please check your connection and try again.');
        }
        throw error;
    }
}

function showError(message) {
    showMessage(message, 'error');
}

function showSuccess(message) {
    showMessage(message, 'success');
}

function clearMessages() {
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
}

function showMessage(message, type) {
    clearMessages();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.textContent = message;
    messageDiv.style.color = type === 'error' ? 'var(--error-color)' : 'var(--success-color)';
    messageDiv.style.marginBottom = '15px';
    messageDiv.style.textAlign = 'center';
    messageDiv.style.padding = '10px';
    messageDiv.style.borderRadius = '4px';
    messageDiv.style.backgroundColor = type === 'error' ? 'rgba(255, 0, 0, 0.1)' : 'rgba(0, 255, 0, 0.1)';

    document.querySelector('.login-form').insertBefore(
        messageDiv,
        document.querySelector('.additional-options')
    );

    // Remove message after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
} 