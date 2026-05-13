// =======================================================
// 1. VARIABLES GLOBALES Y CONEXIÓN DE FIREBASE
// (Asume que las variables 'db' y 'firebase' ya están inicializadas
// y disponibles en el scope global desde sus scripts de Firebase SDK)
// =======================================================

const crearReservaForm = document.getElementById('crearReservaForm');
const reservasTableBody = document.getElementById('reservasTableBody');

// Mapa de precios de ruta para la creación de reservas
const preciosRuta = {
    "MANAGUA - MASAYA": 25.00,
    "MANAGUA - GRANADA": 45.00,
    "MANAGUA - RIO BLANCO": 120.00
};

// =======================================================
// 2. FUNCIÓN PARA CARGAR Y MOSTRAR RESERVAS (READ)
// =======================================================
function loadReservas() {
    if (!reservasTableBody || typeof db === 'undefined') return;

    db.collection('reservas').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
        const reservas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderReservasTable(reservas);
    }, error => {
        console.error("Error al cargar las reservas en tiempo real:", error);
    });
}

function renderReservasTable(reservas) {
    reservasTableBody.innerHTML = '';
    reservas.forEach(reserva => {
        const newRow = document.createElement('tr');

        let precioDisplay = reserva.precio;
        if (typeof reserva.precio === 'number') {
            precioDisplay = `C$ ${reserva.precio.toFixed(2)}`;
        } else if (!reserva.precio) {
            precioDisplay = 'C$ 0.00';
        }

        newRow.innerHTML = `
            <td>#${reserva.id.slice(0, 5).toUpperCase()}</td>
            <td>${reserva.nombrePasajero || reserva.pasajero}</td>
            <td>${reserva.ruta}</td>
            <td>${reserva.fechaViaje || reserva.fecha}</td>
            <td>${reserva.numeroAsiento || reserva.asiento}</td>
            <td>${precioDisplay}</td>
            <td>
                <button class="delete-btn btn-eliminar" data-id="${reserva.id}" title="Eliminar Reserva">Eliminar</button>
            </td>
        `;

        reservasTableBody.appendChild(newRow);
    });

    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', deleteReserva);
    });
}

// =======================================================
// 3. CREAR RESERVAS (CREATE)
// =======================================================
if (crearReservaForm) {
    crearReservaForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const nombrePasajero = document.getElementById('nombre').value;
        const dniId = document.getElementById('dni').value;
        const ruta = document.getElementById('ruta').value;
        const fechaViaje = document.getElementById('fecha').value;
        const numeroAsiento = document.getElementById('asiento').value;

        if (!ruta) {
            alert('Por favor, seleccione una ruta de la lista.');
            return;
        }

        const precio = preciosRuta[ruta] || 0;

        if (!nombrePasajero || !dniId || !ruta || !fechaViaje || !numeroAsiento) {
            alert('Por favor, complete todos los campos de la reserva.');
            return;
        }

        const nuevaReserva = {
            nombrePasajero,
            dniId,
            ruta,
            fechaViaje,
            numeroAsiento,
            precio,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            await db.collection('reservas').add(nuevaReserva);
            alert('¡Reserva creada y guardada permanentemente en Firebase!');
        } catch (e) {
            console.error("Error al agregar documento: ", e);
            alert("Hubo un error al intentar guardar la reserva.");
        }
    });
}

// =======================================================
// 4. ELIMINAR RESERVAS (DELETE)
// =======================================================
async function deleteReserva(event) {
    const reservaId = event.currentTarget.dataset.id;
    if (confirm('¿Está seguro que desea eliminar esta reserva?')) {
        try {
            await db.collection('reservas').doc(reservaId).delete();
            alert('Reserva eliminada.');
        } catch (e) {
            console.error("Error al eliminar documento: ", e);
            alert("Hubo un error al intentar eliminar la reserva.");
        }
    }
}

// =======================================================
// 5. INICIO DE SESIÓN Y CARGA INICIAL
// =======================================================
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            if (username === "admin" && password === "1234") {
                window.location.href = "reservas.html";
            } else {
                alert('Usuario o contraseña incorrectos. Use "admin" y "1234".');
            }
        });
    }

    loadReservas();
});
const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const res = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();
            if (data.success) {
                alert('¡Login correcto!');
                window.location.href = 'reservas.html'; // o la página principal
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
            alert('Error en login');
        }
    });
}
