document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const authToken = localStorage.getItem('authToken');
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');
    const showSignup = document.getElementById('showSignup');
    const showLogin = document.getElementById('showLogin');
    const authDropdown = document.querySelector('.auth-dropdown');
    const messageDiv = document.getElementById('message');
    const authStatus = document.getElementById('authStatus');
    const navbar = document.querySelector('.navbar');

    // Reset message on load
    if (messageDiv) messageDiv.className = 'message hidden';

    // Initialize state
    console.log('Initial token on load:', authToken ? 'exists' : 'null');
    updateStatus(authToken);

    function updateStatus(token) {
        console.log('Updating state with token:', token ? 'exists' : 'null');
        if (token) {
            if (authDropdown) authDropdown.className = 'auth-dropdown hidden';
            if (showSignup) showSignup.style.display = 'none';
            if (showLogin) showLogin.style.display = 'none';
            if (authStatus) {
                authStatus.innerHTML = `Hello, ${localStorage.getItem('lastEmail') || 'User'}! <button id="logoutButton" class="logout-btn">Logout</button>`;
                authStatus.style.display = 'block'; // Asigurăm că e vizibil
                const logoutButton = document.getElementById('logoutButton');
                if (logoutButton) logoutButton.addEventListener('click', handleLogout);
            }
        } else {
            if (authDropdown) authDropdown.className = 'auth-dropdown hidden';
            if (showSignup) showSignup.className = 'toggle-button';
            if (showLogin) showLogin.className = 'toggle-button active';
            if (showSignup) showSignup.style.display = 'inline-block';
            if (showLogin) showLogin.style.display = 'inline-block';
            if (authStatus) {
                authStatus.textContent = 'You are not logged in.';
                authStatus.style.display = 'block';
            }
        }
    }

    async function handleSignup() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (!email || !password) {
            messageDiv.textContent = 'Email and password are required.';
            messageDiv.className = 'message error visible';
            setTimeout(() => { messageDiv.className = 'message error hidden'; }, 3000);
            return;
        }

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            console.log('Signup response:', data);

            if (response.ok) {
                messageDiv.textContent = data.message; // "Account created successfully!"
                messageDiv.className = 'message success visible';
                localStorage.setItem('lastEmail', email);
                const loginResponse = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const loginData = await loginResponse.json();
                console.log('Auto-login response after signup:', loginData);
                if (loginResponse.ok) {
                    localStorage.setItem('authToken', loginData.token);
                    console.log('Token saved after signup');
                    updateStatus(loginData.token);
                } else {
                    messageDiv.textContent = 'Account created, but auto-login failed: ' + loginData.error;
                    messageDiv.className = 'message error visible';
                }
                setTimeout(() => { messageDiv.className = 'message success hidden'; }, 3000);
            } else {
                messageDiv.textContent = data.error;
                messageDiv.className = 'message error visible';
                setTimeout(() => { messageDiv.className = 'message error hidden'; }, 3000);
            }
        } catch (error) {
            messageDiv.textContent = 'Connection error: ' + error.message;
            messageDiv.className = 'message error visible';
            setTimeout(() => { messageDiv.className = 'message error hidden'; }, 3000);
        }
    }

    async function handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            messageDiv.textContent = 'Email and password are required.';
            messageDiv.className = 'message error visible';
            setTimeout(() => { messageDiv.className = 'message error hidden'; }, 3000);
            return;
        }

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            console.log('Login response:', data);

            if (response.ok) {
                messageDiv.textContent = data.message; // "Login successful!"
                messageDiv.className = 'message success visible';
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('lastEmail', email);
                console.log('Token saved after login');
                updateStatus(data.token);
                setTimeout(() => { messageDiv.className = 'message success hidden'; }, 3000);
            } else {
                messageDiv.textContent = data.error;
                messageDiv.className = 'message error visible';
                setTimeout(() => { messageDiv.className = 'message error hidden'; }, 3000);
            }
        } catch (error) {
            messageDiv.textContent = 'Connection error: ' + error.message;
            messageDiv.className = 'message error visible';
            setTimeout(() => { messageDiv.className = 'message error hidden'; }, 3000);
        }
    }

    async function handleLogout() {
        const authToken = localStorage.getItem('authToken');

        if (!authToken) {
            messageDiv.textContent = 'You are not logged in.';
            messageDiv.className = 'message error visible';
            setTimeout(() => { messageDiv.className = 'message error hidden'; }, 3000);
            return;
        }

        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            });
            const data = await response.json();
            console.log('Logout response:', data);

            if (response.ok) {
                messageDiv.textContent = data.message; // "Logout successful!"
                messageDiv.className = 'message success visible';
                localStorage.removeItem('authToken');
                localStorage.removeItem('lastEmail');
                console.log('Token cleared after logout');
                updateStatus(null);
                setTimeout(() => { messageDiv.className = 'message success hidden'; }, 3000);
            } else {
                messageDiv.textContent = data.error;
                messageDiv.className = 'message error visible';
                setTimeout(() => { messageDiv.className = 'message error hidden'; }, 3000);
            }
        } catch (error) {
            messageDiv.textContent = 'Logout error: ' + error.message;
            messageDiv.className = 'message error visible';
            setTimeout(() => { messageDiv.className = 'message error hidden'; }, 3000);
        }
    }

    async function handleResetPassword() {
        const email = document.getElementById('loginEmail').value;

        if (!email) {
            messageDiv.textContent = 'Email is required.';
            messageDiv.className = 'message error visible';
            setTimeout(() => { messageDiv.className = 'message error hidden'; }, 3000);
            return;
        }

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            console.log('Reset password response:', data);

            if (response.ok) {
                messageDiv.textContent = data.message; // "Password reset email has been sent!"
                messageDiv.className = 'message success visible';
            } else {
                messageDiv.textContent = data.error; // "Email is not registered." sau alte erori
                messageDiv.className = 'message error visible';
            }
            setTimeout(() => { messageDiv.className = 'message hidden'; }, 3000);
        } catch (error) {
            messageDiv.textContent = 'Connection error: ' + error.message;
            messageDiv.className = 'message error visible';
            setTimeout(() => { messageDiv.className = 'message error hidden'; }, 3000);
        }
    }

    function showSignupForm() {
        const authDropdown = document.querySelector('.auth-dropdown');
        if (authDropdown) authDropdown.className = 'auth-dropdown visible';
        if (signupForm) signupForm.className = 'form-container visible';
        if (loginForm) loginForm.className = 'form-container hidden';
        if (showSignup) showSignup.className = 'toggle-button active';
        if (showLogin) showLogin.className = 'toggle-button';
    }

    function showLoginForm() {
        const authDropdown = document.querySelector('.auth-dropdown');
        if (authDropdown) authDropdown.className = 'auth-dropdown visible';
        if (signupForm) signupForm.className = 'form-container hidden';
        if (loginForm) loginForm.className = 'form-container visible';
        if (showSignup) showSignup.className = 'toggle-button';
        if (showLogin) showLogin.className = 'toggle-button active';
    }

    // Logic for navbar scroll behavior
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > lastScroll && currentScroll > 100) {
            // Scroll down, hide navbar
            navbar.classList.add('hidden');
        } else {
            // Scroll up, show navbar
            navbar.classList.remove('hidden');
        }
        lastScroll = currentScroll;
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
        const isClickInside = authDropdown.contains(event.target) || showSignup.contains(event.target) || showLogin.contains(event.target);
        if (!isClickInside && authDropdown.classList.contains('visible')) {
            authDropdown.className = 'auth-dropdown hidden';
        }
    });

    window.handleSignup = handleSignup;
    window.handleLogin = handleLogin;
    window.handleLogout = handleLogout;
    window.handleResetPassword = handleResetPassword;
    window.showSignupForm = showSignupForm;
    window.showLoginForm = showLoginForm;

    const signupButton = document.getElementById('signupButton');
    if (signupButton) signupButton.addEventListener('click', handleSignup);

    const loginButton = document.getElementById('loginButton');
    if (loginButton) loginButton.addEventListener('click', (event) => {
        event.preventDefault();
        handleLogin();
    });

    const resetPasswordButton = document.getElementById('resetPasswordButton');
    if (resetPasswordButton) resetPasswordButton.addEventListener('click', handleResetPassword);

    const showSignupButton = document.getElementById('showSignup');
    if (showSignupButton) showSignupButton.addEventListener('click', showSignupForm);

    const showLoginButton = document.getElementById('showLogin');
    if (showLoginButton) showLoginButton.addEventListener('click', showLoginForm);
});