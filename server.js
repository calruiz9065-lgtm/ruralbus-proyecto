const jwt = require('jsonwebtoken');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const sql = require('mssql');
const path = require('path');
const prisma = require('./prismaClient');
const rateLimit = require('express-rate-limit');
const { verificarToken, verificarAdmin } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 4000;

const dbConfig = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '123456',
    server: process.env.DB_SERVER || '127.0.0.1',
    port: parseInt(process.env.DB_PORT) || 1433,
    database: process.env.DB_NAME || 'RuralBusDB',
    options: { trustServerCertificate: true }
};

// Subimos el límite a 500 para que trabajes sin bloqueos de 5 minutos
const limitadorAutenticacion = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 500,
    message: { message: "Demasiados intentos." }
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// REGISTRO
app.post('/registro', limitadorAutenticacion, async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ message: 'Datos incompletos' });
        const hashed = await bcrypt.hash(password, 10);
        await prisma.usuarios.create({ 
            data: { username, password: hashed, rol: username === 'camilo123' ? 'admin' : 'usuario' }
        });

        // LOGGER: Registro de nuevo usuario en consola
        console.info(`👤 [REGISTRO] Nuevo usuario creado en el sistema: "${username}"`);

        res.json({ message: 'Registro exitoso' });
    } catch (error) {
        if (error.code === 'P2002') return res.status(409).json({ message: 'El usuario ya existe' });
        next(error); 
    }
});

// LOGIN (Envía el token en el JSON, limpio de enredos de cookies)
app.post('/login', limitadorAutenticacion, async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ message: 'Credenciales requeridas' });

        const user = await prisma.usuarios.findUnique({ where: { username } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const token = jwt.sign({ username: user.username, rol: user.rol }, process.env.JWT_SECRET || 'SECRET_KEY_RURALBUS', { expiresIn: '2h' });
        
        // LOGGER: Registro de inicio de sesión exitoso en consola
        console.info(`🔑 [LOGIN] El usuario "${username}" ha iniciado sesión correctamente. (Rol: ${user.rol})`);

        // Respondemos directamente con el token en el objeto JSON
        res.json({ message: 'Login correcto', token, rol: user.rol });
    } catch (error) { next(error); }
});

// LOGOUT (Endpoint con logger para registrar salidas del cliente de forma explícita)
app.post('/logout', verificarToken, (req, res) => {
    // LOGGER: Registro de cierre de sesión en consola extrayendo los datos del middleware auth
    console.info(`🚪 [LOGOUT] El usuario "${req.usuario.username}" ha cerrado su sesión de forma segura.`);
    res.json({ message: 'Sesión cerrada exitosamente en el servidor' });
});

// RUTAS PROTEGIDAS
app.get('/perfil', verificarToken, (req, res) => res.json({ usuario: req.usuario.username, rol: req.usuario.rol }));
app.get('/admin-dashboard', verificarToken, verificarAdmin, (req, res) => res.json({ message: 'Bienvenido, Admin' }));

app.use((req, res) => res.status(404).json({ message: 'La ruta no existe' }));
app.use((err, req, res, next) => {
    console.error("❌ ERROR:", err.stack);
    res.status(500).json({ message: 'Error interno' });
});

async function iniciar() {
    try {
        await sql.connect(dbConfig);
        app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Servidor RURALBUS listo en el puerto ${PORT}`));
    } catch (e) { console.error('Error DB:', e); }
}
iniciar();
