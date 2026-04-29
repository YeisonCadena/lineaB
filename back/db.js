const { Pool } = require('pg');
require('dotenv').config();

// Crear pool de conexión a PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

// Manejo de errores de conexión
pool.on('error', (err) => {
  console.error('Error en el pool de conexión:', err);
});

// Verificar conexión exitosa
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error conectando a PostgreSQL:', err.stack);
  } else {
    console.log('✓ Conectado a PostgreSQL correctamente');
    
    // Verificar si PostGIS está instalado
    client.query('SELECT PostGIS_version();', (err, result) => {
      if (err) {
        console.warn('⚠ PostGIS no encontrado. Instálalo en tu base de datos.');
      } else {
        console.log('✓ PostGIS disponible:', result.rows[0].postgis_version);
      }
      release();
    });
  }
});

// Exportar funciones útiles
const query = (text, params) => pool.query(text, params);

const getClient = async () => {
  const client = await pool.connect();
  return client;
};

module.exports = {
  pool,
  query,
  getClient
};
