document.addEventListener('DOMContentLoaded', function() {
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');

    forgotPasswordForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Clear any existing messages
        clearMessages();
        
        const email = document.getElementById('email').value.trim();
        const userType = document.getElementById('userType').value;

        // Validate inputs
        if (!email || !userType) {
            showError('All fields are required');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError('Please enter a valid email address');
            return;
        }

        showSuccess('Processing your request...');

        try {
            const response = await requestPasswordReset(email, userType);
            
            if (response.success) {
                showSuccess('Password reset instructions sent to your email address. Please check your inbox.');
                // Clear the form
                forgotPasswordForm.reset();
                
                // Since we don't actually send emails in this demo, show additional guidance
                const messageDiv = document.createElement('div');
                messageDiv.className = 'message-info';
                messageDiv.innerHTML = '<p><strong>Demo Notice:</strong> No actual email is sent. Please check the server console for the password reset link.</p>';
                messageDiv.style.marginTop = '15px';
                messageDiv.style.textAlign = 'center';
                messageDiv.style.padding = '10px';
                messageDiv.style.borderRadius = '4px';
                messageDiv.style.backgroundColor = 'rgba(255, 255, 0, 0.1)';
                messageDiv.style.border = '1px solid #e6c700';
                
                document.querySelector('.login-form').appendChild(messageDiv);
            } else {
                showError(response.message || 'Failed to request password reset. Please try again.');
            }
        } catch (error) {
            console.error('Password reset error:', error);
            showError(error.message || 'An error occurred. Please try again later.');
        }
    });
});

async function requestPasswordReset(email, userType) {
    try {
        // Map new user types to existing database types for backend compatibility
        let dbUserType = userType;
        if (userType === 'consultant') {
            dbUserType = 'doctor';
        } else if (userType === 'jr_doctor') {
            dbUserType = 'staff';
        }

        console.log(`Sending password reset request for ${email} with user type ${userType} (mapped to DB type: ${dbUserType})`);

        const response = await fetch('http://localhost:3000/api/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                userType: dbUserType
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to request password reset');
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
    
    const existingInfo = document.querySelector('.message-info');
    if (existingInfo) {
        existingInfo.remove();
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