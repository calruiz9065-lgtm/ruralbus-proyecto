document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.querySelector('.toggle-password');
    const toggleIcon = document.querySelector('.toggle-password i');

    const host = window.location.hostname || 'localhost';
    const serverUrl = `http://${host}:4000/login`;

    // Limpiar sesiones previas de forma segura
    try {
        localStorage.removeItem('usuarioActivo');
        localStorage.removeItem('token');
        localStorage.removeItem('rol');
    } catch (e) {
        console.warn("LocalStorage no accesible.");
    }

    // ========================================================
    // RESTAURADO: ANIMACIÓN DEL BOTÓN OCULTAR/VER CONTRASEÑA
    // ========================================================
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', (e) => {
            e.preventDefault(); // Evita comportamientos extraños del formulario
            
            const isHidden = passwordInput.type === 'password';
            passwordInput.type = isHidden ? 'text' : 'password';
            
            if (toggleIcon) {
                // Intercambia las clases de FontAwesome para cerrar/abrir el ojo
                toggleIcon.className = isHidden ? 'fas fa-eye-slash' : 'fas fa-eye';
            }
        });
    }

    // ========================================================
    // LÓGICA DE INICIO DE SESIÓN
    // ========================================================
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const username = document.getElementById('username').value.trim();
            const password = passwordInput ? passwordInput.value.trim() : '';

            if (!username || !password) {
                showMessage('Ingrese usuario y contraseña', 'error');
                return;
            }

            const submitButton = document.querySelector('.btn-login');

            try {
                if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.textContent = 'Verificando...';
                }

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

                // Guardado en LocalStorage para mantener la sesión en reservas.html
                localStorage.setItem('usuarioActivo', username);
                localStorage.setItem('token', data.token); 
                localStorage.setItem('rol', data.rol);

                // RESTAURADO: Cartel flotante dinámico usando el usuario del formulario
                showMessage(`✅ Bienvenido ${username}`, 'success');

                // Retraso de 1.2 segundos para que el usuario aprecie el cartel antes de saltar
                setTimeout(() => {
                    window.location.href = 'reservas.html';
                }, 1200);

            } catch (error) {
                console.error("Fallo de red:", error);
                showMessage('⚠️ No se pudo conectar con el servidor.', 'error');
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Iniciar Sesión';
                }
            }
        });
    }

    // ========================================================
    // RESTAURADO: FUNCIÓN DE NOTIFICACIONES TOAST EN PANTALLA
    // ========================================================
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
            font-family: 'Open Sans', sans-serif;
            box-shadow: 0px 4px 12px rgba(0,0,0,0.15);
            font-weight: 600;
            transition: all 0.3s ease;
        `;

        document.body.appendChild(div);
    }
});
