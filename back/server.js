const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { query } = require('./db');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Incluir rutas
app.use('/api', routes);

// Rutas de prueba

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({ status: 'API funcionando correctamente' });
});

// Ruta para obtener versión de PostGIS
app.get('/postgis-version', async (req, res) => {
  try {
    const result = await query('SELECT PostGIS_version();');
    res.json({
      message: 'PostGIS versión',
      version: result.rows[0]?.postgis_version || 'No disponible'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta ejemplo: obtener coordenadas geográficas
app.get('/geo-example', async (req, res) => {
  try {
    const result = await query(
      "SELECT ST_AsGeoJSON(ST_Point(0, 0)::geography) as point;"
    );
    res.json({
      message: 'Ejemplo de punto geográfico',
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`📊 Base de datos: ${process.env.DB_NAME}`);
  console.log(`🌍 PostGIS disponible\n`);
});

module.exports = app;
