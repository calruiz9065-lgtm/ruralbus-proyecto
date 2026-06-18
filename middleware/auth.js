const jwt = require('jsonwebtoken');

async function verificarToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ message: 'Token requerido' });

        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();

        jwt.verify(token, process.env.JWT_SECRET || 'SECRET_KEY_RURALBUS', (err, decoded) => {
            if (err) return res.status(401).json({ message: 'Token inválido o expirado' });
            req.usuario = { username: decoded.username, rol: decoded.rol };
            next();
        });
    } catch (error) { next(error); }
}

async function verificarAdmin(req, res, next) {
    try {
        if (!req.usuario) return res.status(401).json({ message: 'No autenticado' });
        if (req.usuario.rol !== 'admin') return res.status(403).json({ message: 'No es admin' });
        next();
    } catch (error) { next(error); }
}

module.exports = { verificarToken, verificarAdmin };
