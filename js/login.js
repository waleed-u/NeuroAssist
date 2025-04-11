document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const createAccountLink = document.getElementById('createAccount');
    const forgotPasswordLink = document.getElementById('forgotPassword');

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Clear any existing messages
        clearMessages();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const userType = document.getElementById('userType').value;

        // Validate inputs
        if (!username || !password || !userType) {
            showError('All fields are required');
            return;
        }

        try {
            const response = await loginUser(username, password, userType);
            
            if (response.success) {
                // Store token in localStorage
                localStorage.setItem('token', response.token);
                // Store user info in session storage
                sessionStorage.setItem('userType', response.user.userType);
                sessionStorage.setItem('username', response.user.username);
                sessionStorage.setItem('fullName', response.user.fullName);
                
                showSuccess('Login successful! Redirecting...');
                // Redirect based on user type
                setTimeout(() => {
                    redirectUser(response.user.userType);
                }, 1000);
            } else {
                showError(response.message || 'Invalid credentials. Please try again.');
            }
        } catch (error) {
            console.error('Login error:', error);
            showError(error.message || 'An error occurred. Please try again later.');
        }
    });

    createAccountLink.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'register.html';
    });

    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'forgot-password.html';
    });
});

async function loginUser(username, password, userType) {
    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors',
            credentials: 'same-origin',
            body: JSON.stringify({
                username,
                password,
                userType
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }
        
        return data;
    } catch (error) {
        console.error('Login error:', error);
        if (error.message === 'Failed to fetch') {
            throw new Error('Unable to connect to the server. Please check your connection and try again.');
        }
        throw error;
    }
}

function redirectUser(userType) {
    switch(userType) {
        case 'patient':
            window.location.href = 'patient/dashboard.html';
            break;
        case 'doctor':
            window.location.href = 'doctor/dashboard.html';
            break;
        case 'staff':
            window.location.href = 'staff/dashboard.html';
            break;
        default:
            showError('Invalid user type');
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