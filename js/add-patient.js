document.addEventListener('DOMContentLoaded', function() {
    const patientForm = document.getElementById('patientForm');
    const cancelButton = document.getElementById('cancelButton');

    // Form validation
    function validateForm() {
        let isValid = true;
        const requiredFields = patientForm.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add('error');
                if (!field.nextElementSibling?.classList.contains('error-message')) {
                    const errorMessage = document.createElement('div');
                    errorMessage.className = 'error-message';
                    errorMessage.textContent = 'This field is required';
                    field.parentNode.insertBefore(errorMessage, field.nextSibling);
                }
            } else {
                field.classList.remove('error');
                const errorMessage = field.nextElementSibling;
                if (errorMessage?.classList.contains('error-message')) {
                    errorMessage.remove();
                }
            }
        });

        // Email validation
        const emailField = patientForm.querySelector('#email');
        if (emailField.value && !isValidEmail(emailField.value)) {
            isValid = false;
            emailField.classList.add('error');
            if (!emailField.nextElementSibling?.classList.contains('error-message')) {
                const errorMessage = document.createElement('div');
                errorMessage.className = 'error-message';
                errorMessage.textContent = 'Please enter a valid email address';
                emailField.parentNode.insertBefore(errorMessage, emailField.nextSibling);
            }
        }

        // Phone number validation
        const phoneField = patientForm.querySelector('#phone');
        if (phoneField.value && !isValidPhone(phoneField.value)) {
            isValid = false;
            phoneField.classList.add('error');
            if (!phoneField.nextElementSibling?.classList.contains('error-message')) {
                const errorMessage = document.createElement('div');
                errorMessage.className = 'error-message';
                errorMessage.textContent = 'Please enter a valid phone number';
                phoneField.parentNode.insertBefore(errorMessage, phoneField.nextSibling);
            }
        }

        return isValid;
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function isValidPhone(phone) {
        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        return phoneRegex.test(phone);
    }

    // Handle form submission
    patientForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const formData = new FormData(patientForm);
        const patientData = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/patients', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(patientData)
            });

            if (!response.ok) {
                throw new Error('Failed to add patient');
            }

            const result = await response.json();
            
            // Show success message
            alert('Patient added successfully!');
            
            // Redirect to patients list
            window.location.href = '/doctor/patients.html';
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to add patient. Please try again.');
        }
    });

    // Handle cancel button
    cancelButton.addEventListener('click', function() {
        if (confirm('Are you sure you want to cancel? All entered data will be lost.')) {
            window.location.href = '/doctor/patients.html';
        }
    });

    // Real-time validation
    const inputs = patientForm.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.hasAttribute('required') && !this.value.trim()) {
                this.classList.add('error');
            } else {
                this.classList.remove('error');
                const errorMessage = this.nextElementSibling;
                if (errorMessage?.classList.contains('error-message')) {
                    errorMessage.remove();
                }
            }
        });
    });
}); 