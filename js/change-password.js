document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const userType = sessionStorage.getItem('userType');
    if (!userType || userType !== 'doctor') {
        window.location.href = '../index.html';
        return;
    }

    initializePasswordChange();
});

function initializePasswordChange() {
    const form = document.getElementById('changePasswordForm');
    const cancelBtn = document.getElementById('cancelBtn');
    const toggleButtons = document.querySelectorAll('.toggle-password');
    const newPasswordInput = document.getElementById('newPassword');

    // Setup password visibility toggle
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);
            const icon = this.querySelector('i');

            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });

    // Setup password validation
    newPasswordInput.addEventListener('input', validatePassword);

    // Handle form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            await changePassword(data);
            showNotification('Password changed successfully', 'success');
            form.reset();
        } catch (error) {
            console.error('Error changing password:', error);
            showNotification('Failed to change password', 'error');
        }
    });

    // Handle cancel button
    cancelBtn.addEventListener('click', function() {
        window.location.href = 'dashboard.html';
    });
}

function validatePassword() {
    const password = document.getElementById('newPassword').value;
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    // Update requirement indicators
    Object.keys(requirements).forEach(req => {
        const element = document.getElementById(req);
        if (requirements[req]) {
            element.classList.add('valid');
        } else {
            element.classList.remove('valid');
        }
    });

    return Object.values(requirements).every(req => req);
}

function validateForm() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Clear previous errors
    clearErrors();

    let isValid = true;

    // Validate current password
    if (!currentPassword) {
        showError('currentPassword', 'Current password is required');
        isValid = false;
    }

    // Validate new password
    if (!newPassword) {
        showError('newPassword', 'New password is required');
        isValid = false;
    } else if (!validatePassword()) {
        showError('newPassword', 'New password does not meet requirements');
        isValid = false;
    }

    // Validate confirm password
    if (!confirmPassword) {
        showError('confirmPassword', 'Please confirm your new password');
        isValid = false;
    } else if (newPassword !== confirmPassword) {
        showError('confirmPassword', 'Passwords do not match');
        isValid = false;
    }

    return isValid;
}

function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const formGroup = field.closest('.form-group');
    
    formGroup.classList.add('error');
    
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.textContent = message;
    
    formGroup.appendChild(errorMessage);
}

function clearErrors() {
    const errorMessages = document.querySelectorAll('.error-message');
    const errorFields = document.querySelectorAll('.form-group.error');
    
    errorMessages.forEach(msg => msg.remove());
    errorFields.forEach(field => field.classList.remove('error'));
}

async function changePassword(data) {
    // In a real application, this would be an API call
    // For now, we'll just simulate a successful password change
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ success: true });
        }, 1000);
    });
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