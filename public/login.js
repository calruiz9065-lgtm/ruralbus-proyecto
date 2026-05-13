document.addEventListener('DOMContentLoaded', () => { 

    const loginForm = document.getElementById('loginForm');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.querySelector('.toggle-password');
    const toggleIcon = document.querySelector('.toggle-password i');

    const serverUrl = 'http://localhost:4000/login';

    localStorage.removeItem('usuarioActivo');
    localStorage.removeItem('token');

    // 👁️ TOGGLE CONTRASEÑA (FUNCIONANDO REAL)
    if (togglePassword && passwordInput && toggleIcon) {
        togglePassword.addEventListener('click', () => {

            const isHidden = passwordInput.type === 'password';

            passwordInput.type = isHidden ? 'text' : 'password';

            // 🔥 FORZADO (NO toggle)
            if (isHidden) {
                toggleIcon.className = 'fas fa-eye-slash';
            } else {
                toggleIcon.className = 'fas fa-eye';
            }
        });
    }

    // LOGIN
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const username = document.getElementById('username').value.trim();
            const password = passwordInput.value.trim();

            if (!username || !password) {
                showMessage('Por favor ingresa usuario y contraseña.', 'error');
                return;
            }

            const submitButton = document.querySelector('.btn-login');

            try {
                submitButton.disabled = true;
                submitButton.textContent = 'Verificando...';

                const response = await fetch(serverUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    showMessage(data.message || 'Error login', 'error');
                    return;
                }

                localStorage.setItem('usuarioActivo', data.username);
                localStorage.setItem('token', data.token);

                showMessage(`✅ Bienvenido ${data.username}`, 'success');

                setTimeout(() => {
                    window.location.href = 'reservas.html';
                }, 1200);

            } catch (error) {
                console.error(error);
                showMessage('⚠️ Error conectando con servidor', 'error');
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = 'Iniciar Sesión';
            }
        });
    }

    function showMessage(message, type) {
        const old = document.getElementById('msg');
        if (old) old.remove();

        const div = document.createElement('div');
        div.id = 'msg';
        div.textContent = message;

        let color = '#333';
        if (type === 'success') color = '#4CAF50';
        if (type === 'error') color = '#F44336';

        div.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${color};
            color: white;
            padding: 15px;
            border-radius: 8px;
            z-index: 999;
        `;

        document.body.appendChild(div);

        setTimeout(() => div.remove(), 3000);
    }

});