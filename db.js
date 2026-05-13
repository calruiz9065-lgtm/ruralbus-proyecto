const sql = require('mssql');

const config = {
    user: 'sa', // o tu usuario
    password: 'TU_PASSWORD',
    server: 'localhost',
    database: 'RuralBusDB',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

sql.connect(config)
    .then(() => console.log('✅ Conectado a SQL Server'))
    .catch(err => console.log('❌ Error de conexión:', err));

module.exports = sql;