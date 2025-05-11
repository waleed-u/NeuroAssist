document.addEventListener('DOMContentLoaded', function() {
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const tokenInput = document.getElementById('token');
    
    // Extract token from URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (!token) {
        showError('Invalid or missing reset token. Please request a new password reset link.');
        disableForm();
        return;
    }
    
    // Set the token in the hidden input field
    tokenInput.value = token;
    
    resetPasswordForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Clear any existing messages
        clearMessages();
        
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validate inputs
        if (!password || !confirmPassword) {
            showError('All fields are required');
            return;
        }
        
        // Validate password length
        if (password.length < 6) {
            showError('Password must be at least 6 characters long');
            return;
        }
        
        // Validate passwords match
        if (password !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }
        
        try {
            const response = await resetPassword(token, password);
            
            if (response.success) {
                // Show success message
                showSuccess('Password reset successful! Redirecting to login page...');
                
                // Clear any stored credentials to prevent automatic login with old credentials
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                sessionStorage.clear();
                
                // Redirect to login page after 2 seconds
                setTimeout(() => {
                    window.location.replace('index.html');
                }, 2000);
            } else {
                showError(response.message || 'Failed to reset password. Please try again.');
            }
        } catch (error) {
            console.error('Password reset error:', error);
            showError(error.message || 'An error occurred. Please try again later.');
        }
    });
});

async function resetPassword(token, password) {
    try {
        const response = await fetch('http://localhost:3000/api/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token,
                password
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to reset password');
        }
        
        return data;
    } catch (error) {
        console.error('Password reset error:', error);
        if (error.message === 'Failed to fetch') {
            throw new Error('Unable to connect to the server. Please check your connection and try again.');
        }
        throw error;
    }
}

function disableForm() {
    const form = document.getElementById('resetPasswordForm');
    const inputs = form.querySelectorAll('input');
    const submitButton = form.querySelector('button[type="submit"]');
    
    inputs.forEach(input => {
        input.disabled = true;
    });
    
    submitButton.disabled = true;
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