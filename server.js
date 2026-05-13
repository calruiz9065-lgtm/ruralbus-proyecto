const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const sql = require('mssql');
const path = require('path');

const app = express();
const PORT = 4000;

// =============================
// CONFIG DB
// =============================
const dbConfig = {
    user: 'sa',
    password: '123456',
    server: '127.0.0.1',
    port: 1433,
    database: 'RuralBusDB',
    options: {
        trustServerCertificate: true
    }
};

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// =============================
// START SERVER
// =============================
async function iniciarServidor() {
    try {
        const pool = await sql.connect(dbConfig);
        console.log('✅ Conectado a SQL Server');

        // =============================
        // REGISTRO
        // =============================
        app.post('/registro', async (req, res) => {

            console.log("📥 BODY:", req.body); // DEBUG

            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({ message: 'Datos incompletos' });
            }

            try {
                const hashed = await bcrypt.hash(password, 10);

                await pool.request()
                    .input('username', sql.VarChar, username)
                    .input('password', sql.VarChar, hashed)
                    .query(`
                        INSERT INTO usuarios (username, password)
                        VALUES (@username, @password)
                    `);

                console.log("✅ Usuario insertado:", username);

                res.json({ message: 'Registro exitoso' });

            } catch (error) {

                console.error("❌ ERROR SQL:", error);

                if (error.number === 2627) {
                    return res.status(400).json({ message: 'Usuario ya existe' });
                }

                res.status(500).json({ message: 'Error en registro' });
            }
        });

        // =============================
        // LOGIN
        // =============================
        app.post('/login', async (req, res) => {

            console.log("📥 LOGIN:", req.body);

            const { username, password } = req.body;

            try {
                const result = await pool.request()
                    .input('username', sql.VarChar, username)
                    .query(`
                        SELECT * FROM usuarios WHERE username = @username
                    `);

                if (result.recordset.length === 0) {
                    return res.status(401).json({ message: 'Usuario no existe' });
                }

                const user = result.recordset[0];

                const match = await bcrypt.compare(password, user.password);

                if (!match) {
                    return res.status(401).json({ message: 'Contraseña incorrecta' });
                }

                // borrar tokens anteriores
                await pool.request()
                    .input('user', sql.VarChar, username)
                    .query(`
                        DELETE FROM llaves_acceso WHERE usuario_asignado = @user
                    `);

                const token = Math.random().toString(36).substring(2) + Date.now();

                await pool.request()
                    .input('token', sql.VarChar, token)
                    .input('user', sql.VarChar, username)
                    .query(`
                        INSERT INTO llaves_acceso (usuario_asignado, token_llave)
                        VALUES (@user, @token)
                    `);

                res.json({
                    message: 'Login correcto',
                    username,
                    token
                });

            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Error login' });
            }
        });

        // =============================
        // ROOT
        // =============================
        app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'public', 'index.html'));
        });

        app.listen(PORT, () => {
            console.log(`🚀 Servidor en http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('❌ Error DB:', error);
    }
}

iniciarServidor();