document.addEventListener('DOMContentLoaded', () => {

    const registroForm =
        document.getElementById('registroForm');

    const passwordInput =
        document.getElementById('password');

    const togglePassword =
        document.querySelector('.toggle-password');

    const toggleIcon =
        document.querySelector('.toggle-password i');

    const submitButton =
        document.querySelector('.btn-registro');

const serverUrl = `http://${window.location.hostname}:4000/registro`;

    // =========================================
    // TOGGLE PASSWORD
    // =========================================
    if (togglePassword &&
        passwordInput &&
        toggleIcon) {

        togglePassword.addEventListener('click', () => {

            const isHidden =
                passwordInput.type === 'password';

            passwordInput.type =
                isHidden ? 'text' : 'password';

            toggleIcon.classList.toggle('fa-eye');

            toggleIcon.classList.toggle(
                'fa-eye-slash'
            );
        });
    }

    // =========================================
    // REGISTRO
    // =========================================
    if (registroForm) {

        registroForm.addEventListener('submit',
            async (event) => {

            event.preventDefault();

            const username =
                document.getElementById('username')
                .value.trim();

            const password =
                passwordInput.value.trim();

            // VALIDACIONES
            if (!username || !password) {

                showMessage(
                    'Complete todos los campos',
                    'error'
                );

                return;
            }

            if (username.length < 3) {

                showMessage(
                    'Usuario mínimo 3 caracteres',
                    'error'
                );

                return;
            }

            if (password.length < 6) {

                showMessage(
                    'Contraseña mínimo 6 caracteres',
                    'error'
                );

                return;
            }

            if (
                !/[A-Za-z]/.test(password) ||
                !/[0-9]/.test(password)
            ) {

                showMessage(
                    'Debe contener letras y números',
                    'error'
                );

                return;
            }

            try {

                submitButton.disabled = true;

                submitButton.textContent =
                    'Registrando...';

                const response = await fetch(serverUrl, {

                    method: 'POST',

                    headers: {
                        'Content-Type':
                        'application/json'
                    },

                    body: JSON.stringify({
                        username,
                        password
                    })
                });

                const data = await response.json();

                if (!response.ok) {

                    showMessage(
                        data.message ||
                        'Error registro',
                        'error'
                    );

                    return;
                }

                showMessage(
                    '✅ Registro exitoso',
                    'success'
                );

                setTimeout(() => {

                    window.location.href =
                        'index.html';

                }, 1200);

            } catch (error) {

                console.error(error);

                showMessage(
                    '⚠️ Error conexión servidor',
                    'error'
                );

            } finally {

                submitButton.disabled = false;

                submitButton.textContent =
                    'Registrar';
            }
        });
    }

    // =========================================
    // MENSAJES
    // =========================================
    function showMessage(message, type) {

        const old =
            document.getElementById('msg');

        if (old) old.remove();

        const div =
            document.createElement('div');

        div.id = 'msg';

        div.textContent = message;

        let color = '#333';

        if (type === 'success')
            color = '#4CAF50';

        if (type === 'error')
            color = '#F44336';

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

        setTimeout(() => {
            div.remove();
        }, 3000);
    }
});