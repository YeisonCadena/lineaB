const express = require('express');
const router = express.Router();
const { query } = require('./db');

// GET - Obtener todas las estaciones (ejemplo con geometría)
router.get('/estaciones', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, nombre, ST_AsGeoJSON(geom) as coordenadas FROM estaciones ORDER BY id;`
    );
    res.json({
      success: true,
      total: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET - Obtener estaciones cercanas a un punto (radio en metros)
router.get('/estaciones/cercanas', async (req, res) => {
  try {
    const { lat, lon, radio = 1000 } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Se requieren lat y lon' });
    }

    const result = await query(
      `SELECT id, nombre, 
              ST_Distance(geom, ST_SetSRID(ST_MakePoint($1, $2), 4326)) as distancia,
              ST_AsGeoJSON(geom) as coordenadas
       FROM estaciones
       WHERE ST_Distance(geom, ST_SetSRID(ST_MakePoint($1, $2), 4326)) < $3
       ORDER BY distancia;`,
      [parseFloat(lon), parseFloat(lat), parseFloat(radio)]
    );

    res.json({
      success: true,
      punto: { lat: parseFloat(lat), lon: parseFloat(lon) },
      radio_metros: radio,
      encontrados: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST - Crear nueva estación
router.post('/estaciones', async (req, res) => {
  try {
    const { nombre, lat, lon } = req.body;

    if (!nombre || !lat || !lon) {
      return res.status(400).json({ 
        error: 'Se requieren nombre, lat y lon' 
      });
    }

    const result = await query(
      `INSERT INTO estaciones (nombre, geom)
       VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326))
       RETURNING id, nombre, ST_AsGeoJSON(geom) as coordenadas;`,
      [nombre, parseFloat(lon), parseFloat(lat)]
    );

    res.status(201).json({
      success: true,
      message: 'Estación creada exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT - Actualizar ubicación de estación
router.put('/estaciones/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, lat, lon } = req.body;

    if (!lat || !lon) {
      return res.status(400).json({ error: 'Se requieren lat y lon' });
    }

    const result = await query(
      `UPDATE estaciones 
       SET nombre = COALESCE($1, nombre),
           geom = ST_SetSRID(ST_MakePoint($2, $3), 4326)
       WHERE id = $4
       RETURNING id, nombre, ST_AsGeoJSON(geom) as coordenadas;`,
      [nombre || null, parseFloat(lon), parseFloat(lat), parseInt(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Estación no encontrada' });
    }

    res.json({
      success: true,
      message: 'Estación actualizada exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE - Eliminar estación
router.delete('/estaciones/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM estaciones WHERE id = $1 RETURNING id, nombre;',
      [parseInt(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Estación no encontrada' });
    }

    res.json({
      success: true,
      message: 'Estación eliminada exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET - Calcular área de cobertura (convex hull)
router.get('/estaciones/cobertura', async (req, res) => {
  try {
    const result = await query(
      `SELECT ST_AsGeoJSON(ST_ConvexHull(ST_Collect(geom))) as area_cobertura,
              COUNT(*) as total_estaciones
       FROM estaciones;`
    );

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
