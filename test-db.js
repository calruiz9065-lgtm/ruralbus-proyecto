const sql = require('mssql');

const config = {
    server: 'localhost',
    database: 'RuralBusDB',
    options: {
        instanceName: 'SQLEXPRESS',
        trustServerCertificate: true
    }
};

sql.connect(config)
    .then(() => console.log('✅ CONECTADO'))
    .catch(err => console.log('❌ ERROR:', err));