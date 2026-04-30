const express = require('express');
const router = express.Router();
const { query } = require('./db');
const { 
  validateGeoJSON, 
  parseShapefile, 
  calculateBBox,
  sanitizeFilename 
} = require('./geoutils');
const upload = require('./middleware/upload');
const fs = require('fs').promises;
const path = require('path');

const { generateToken, verifyToken } = require('./middleware/auth');
const {
  getAllSatelliteLayers,
  getSatelliteLayer,
  getFreeSatelliteLayers,
  getRecommendedLayers,
  buildTileUrl,
  getLayerCoverageInfo,
  validateLayerConfig
} = require('./src/services/satelliteService');

// ========== ENDPOINTS PARA DEPARTAMENTOS ==========

/**
 * GET /api/departamentos
 * Obtener todos los departamentos con geometría
 */
router.get('/departamentos', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, decodigo, denombre, dearea, shape_leng, shape_area,
              ST_AsGeoJSON(geom) as geom
       FROM departamentos
       ORDER BY denombre;`
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

/**
 * GET /api/departamentos/:id
 * Obtener un departamento específico
 */
router.get('/departamentos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      `SELECT id, decodigo, denombre, dearea, denorma, shape_leng, shape_area,
              ST_AsGeoJSON(geom) as geom
       FROM departamentos
       WHERE id = $1;`,
      [parseInt(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Departamento no encontrado' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/departamentos/:id/geojson
 * Obtener departamento en formato GeoJSON
 */
router.get('/departamentos/:id/geojson', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT ST_AsGeoJSON(geom) as geometry, denombre, decodigo
       FROM departamentos
       WHERE id = $1;`,
      [parseInt(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Departamento no encontrado' });
    }

    const dept = result.rows[0];
    const geojson = {
      type: 'Feature',
      properties: {
        nombre: dept.denombre,
        codigo: dept.decodigo,
        tipo: 'departamento'
      },
      geometry: JSON.parse(dept.geometry)
    };

    res.setHeader('Content-Type', 'application/geo+json');
    res.json(geojson);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== ENDPOINTS PARA MUNICIPIOS ==========

/**
 * GET /api/municipios
 * Obtener todos los municipios
 */
router.get('/municipios', async (req, res) => {
  try {
    const limit = req.query.limit || 50;
    const offset = req.query.offset || 0;

    const result = await query(
      `SELECT id, mpcodigo, mpnombre, depto, mparea, mpaltitud, mpcategor,
              ST_AsGeoJSON(geom) as geom
       FROM municipios
       ORDER BY mpnombre
       LIMIT $1 OFFSET $2;`,
      [parseInt(limit), parseInt(offset)]
    );

    const countResult = await query('SELECT COUNT(*) FROM municipios;');

    res.json({
      success: true,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset),
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/municipios/:id
 * Obtener municipio específico
 */
router.get('/municipios/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT id, mpcodigo, mpnombre, depto, mparea, mpaltitud, mpcategor, 
              restriccio, shape_leng, shape_area,
              ST_AsGeoJSON(geom) as geom
       FROM municipios
       WHERE id = $1;`,
      [parseInt(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Municipio no encontrado' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/municipios/departamento/:depto
 * Obtener municipios por departamento
 */
router.get('/municipios/departamento/:depto', async (req, res) => {
  try {
    const { depto } = req.params;

    const result = await query(
      `SELECT id, mpcodigo, mpnombre, depto, mparea, mpaltitud, mpcategor,
              ST_AsGeoJSON(geom) as geom
       FROM municipios
       WHERE depto ILIKE $1
       ORDER BY mpnombre;`,
      [`%${depto}%`]
    );

    res.json({
      success: true,
      total: result.rows.length,
      departamento: depto,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/municipios/cercanos?lat=X&lon=Y&radio=1000
 * Buscar municipios cercanos a un punto
 */
router.get('/municipios/cercanos', async (req, res) => {
  try {
    const { lat, lon, radio = 5000 } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: 'Se requieren lat y lon' });
    }

    const result = await query(
      `SELECT id, mpnombre, depto, mpaltitud,
              ST_Distance(geom, ST_SetSRID(ST_MakePoint($1, $2), 4326)) as distancia,
              ST_AsGeoJSON(geom) as geom
       FROM municipios
       WHERE ST_Distance(geom, ST_SetSRID(ST_MakePoint($1, $2), 4326)) < $3
       ORDER BY distancia
       LIMIT 20;`,
      [parseFloat(lon), parseFloat(lat), parseFloat(radio)]
    );

    res.json({
      success: true,
      punto: { lat: parseFloat(lat), lon: parseFloat(lon) },
      radio_metros: parseFloat(radio),
      encontrados: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/municipios/:id/geojson
 * Obtener municipio en GeoJSON
 */
router.get('/municipios/:id/geojson', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT ST_AsGeoJSON(geom) as geometry, mpnombre, depto, mpaltitud
       FROM municipios
       WHERE id = $1;`,
      [parseInt(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Municipio no encontrado' });
    }

    const mun = result.rows[0];
    const geojson = {
      type: 'Feature',
      properties: {
        nombre: mun.mpnombre,
        departamento: mun.depto,
        altitud: mun.mpaltitud,
        tipo: 'municipio'
      },
      geometry: JSON.parse(mun.geometry)
    };

    res.setHeader('Content-Type', 'application/geo+json');
    res.json(geojson);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== ENDPOINTS PARA VIAS ==========

/**
 * GET /api/vias
 * Obtener todas las vías
 */
router.get('/vias', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, via, tipo, origen, destino,
              ST_Length(ST_Transform(geom, 4326)::geography) as longitud_metros,
              ST_AsGeoJSON(ST_Transform(geom, 4326)) as geom
       FROM vias
       ORDER BY via;`
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

/**
 * GET /api/vias/:id
 * Obtener vía específica
 */
router.get('/vias/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT id, via, tipo, origen, destino,
              ST_Length(ST_Transform(geom, 4326)::geography) as longitud_metros,
              ST_AsGeoJSON(ST_Transform(geom, 4326)) as geom
       FROM vias
       WHERE id = $1;`,
      [parseInt(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vía no encontrada' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/vias/:id/geojson
 * Obtener vía en GeoJSON
 */
router.get('/vias/:id/geojson', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT ST_AsGeoJSON(ST_Transform(geom, 4326)) as geometry, via, tipo, origen, destino
       FROM vias
       WHERE id = $1;`,
      [parseInt(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vía no encontrada' });
    }

    const via = result.rows[0];
    const geojson = {
      type: 'Feature',
      properties: {
        nombre: via.via,
        tipo: via.tipo,
        origen: via.origen,
        destino: via.destino
      },
      geometry: JSON.parse(via.geometry)
    };

    res.setHeader('Content-Type', 'application/geo+json');
    res.json(geojson);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== ENDPOINTS PARA SITIOS TURÍSTICOS ==========

/**
 * GET /api/sitios-turisticos
 * Obtener todos los sitios turísticos
 */
router.get('/sitios-turisticos', async (req, res) => {
  try {
    const limit = req.query.limit || 50;
    const offset = req.query.offset || 0;

    const result = await query(
      `SELECT id, nombre, ciudad, departamen, categoria, objectid,
              ST_AsGeoJSON(geom) as geom
       FROM sitios_turisticos
       ORDER BY nombre
       LIMIT $1 OFFSET $2;`,
      [parseInt(limit), parseInt(offset)]
    );

    const countResult = await query('SELECT COUNT(*) FROM sitios_turisticos;');

    res.json({
      success: true,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset),
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/sitios-turisticos/:id
 * Obtener sitio turístico específico
 */
router.get('/sitios-turisticos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT id, nombre, ciudad, departamen, categoria, objectid,
              ST_AsGeoJSON(geom) as geom
       FROM sitios_turisticos
       WHERE id = $1;`,
      [parseInt(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sitio turístico no encontrado' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/sitios-turisticos/categoria/:categoria
 * Obtener sitios turísticos por categoría
 */
router.get('/sitios-turisticos/categoria/:categoria', async (req, res) => {
  try {
    const { categoria } = req.params;

    const result = await query(
      `SELECT id, nombre, ciudad, departamen, categoria,
              ST_AsGeoJSON(geom) as geom
       FROM sitios_turisticos
       WHERE categoria ILIKE $1
       ORDER BY nombre;`,
      [`%${categoria}%`]
    );

    res.json({
      success: true,
      total: result.rows.length,
      categoria,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/sitios-turisticos/ciudad/:ciudad
 * Obtener sitios turísticos por ciudad
 */
router.get('/sitios-turisticos/ciudad/:ciudad', async (req, res) => {
  try {
    const { ciudad } = req.params;

    const result = await query(
      `SELECT id, nombre, ciudad, departamen, categoria,
              ST_AsGeoJSON(geom) as geom
       FROM sitios_turisticos
       WHERE ciudad ILIKE $1
       ORDER BY nombre;`,
      [`%${ciudad}%`]
    );

    res.json({
      success: true,
      total: result.rows.length,
      ciudad,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/sitios-turisticos/:id/geojson
 * Obtener sitio turístico en GeoJSON
 */
router.get('/sitios-turisticos/:id/geojson', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT ST_AsGeoJSON(geom) as geometry, nombre, ciudad, departamen, categoria
       FROM sitios_turisticos
       WHERE id = $1;`,
      [parseInt(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sitio turístico no encontrado' });
    }

    const sitio = result.rows[0];
    const geojson = {
      type: 'Feature',
      properties: {
        nombre: sitio.nombre,
        ciudad: sitio.ciudad,
        departamento: sitio.departamen,
        categoria: sitio.categoria,
        tipo: 'sitio_turistico'
      },
      geometry: JSON.parse(sitio.geometry)
    };

    res.setHeader('Content-Type', 'application/geo+json');
    res.json(geojson);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== ENDPOINTS PARA SUBIR NUEVAS CAPAS ==========

/**
 * POST /api/capas
 * Subir nueva capa georeferenciada
 */
router.post('/capas', verifyToken, upload.single('archivo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó archivo' });
    }

    const { nombre, descripcion } = req.body;

    if (!nombre) {
      await fs.unlink(req.file.path);
      return res.status(400).json({ error: 'El nombre de la capa es requerido' });
    }

    const ext = path.extname(req.file.filename).toLowerCase();
    const fileContent = await fs.readFile(req.file.path, 'utf8');
    let geometriaGeoJSON;
    let tipoArchivo;

    // Procesar GeoJSON
    if (ext === '.geojson' || ext === '.json') {
      const validacion = validateGeoJSON(fileContent);
      if (!validacion.valid) {
        await fs.unlink(req.file.path);
        return res.status(400).json({ error: 'GeoJSON inválido: ' + validacion.error });
      }

      geometriaGeoJSON = JSON.parse(fileContent);
      tipoArchivo = 'geojson';
    } else {
      await fs.unlink(req.file.path);
      return res.status(400).json({ error: 'Solo se aceptan archivos GeoJSON por ahora' });
    }

    const bbox = calculateBBox(geometriaGeoJSON);
    const nombreSanitizado = sanitizeFilename(nombre);

    res.status(201).json({
      success: true,
      message: 'Capa lista para procesar',
      data: {
        nombre: nombreSanitizado,
        tipo: tipoArchivo,
        archivo: req.file.filename,
        features: geometriaGeoJSON.features ? geometriaGeoJSON.features.length : 1,
        bbox: bbox.bounds
      }
    });

  } catch (error) {
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/capas/validar
 * Validar archivo antes de subirlo
 * Requiere: Authorization: Bearer <token>
 */
router.post('/capas/validar', verifyToken, upload.single('archivo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó archivo' });
    }

    const ext = path.extname(req.file.filename).toLowerCase();
    const fileContent = await fs.readFile(req.file.path, 'utf8');

    let validacion = { valid: false };

    if (ext === '.geojson' || ext === '.json') {
      validacion = validateGeoJSON(fileContent);
    } else {
      validacion = { valid: false, error: 'Solo GeoJSON soportado' };
    }

    await fs.unlink(req.file.path);

    res.json({
      success: validacion.valid,
      valid: validacion.valid,
      message: validacion.valid ? 'Archivo válido' : 'Archivo inválido',
      error: validacion.error || null
    });

  } catch (error) {
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== ENDPOINTS DE AUTENTICACIÓN JWT ==========


// Simulación de BD de usuarios (en producción usar BD real)
const USUARIOS_VALIDOS = {
  'admin': { password: 'admin123', rol: 'admin', nombre: 'Administrador' },
  'editor': { password: 'editor123', rol: 'editor', nombre: 'Editor' },
  'viewer': { password: 'viewer123', rol: 'viewer', nombre: 'Visualizador' }
};

/**
 * POST /api/auth/login
 * Obtener JWT con credenciales
 * Body: { usuario: "admin", contraseña: "admin123" }
 */
router.post('/auth/login', (req, res) => {
  try {
    const { usuario, contraseña } = req.body;

    if (!usuario || !contraseña) {
      return res.status(400).json({
        success: false,
        error: 'Usuario y contraseña son requeridos'
      });
    }

    const user = USUARIOS_VALIDOS[usuario];
    if (!user || user.password !== contraseña) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    const token = generateToken({
      usuario,
      rol: user.rol,
      nombre: user.nombre,
      iat: Math.floor(Date.now() / 1000)
    }, '24h');

    res.json({
      success: true,
      token,
      usuario: { usuario, rol: user.rol, nombre: user.nombre },
      expiresIn: '24h'
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/auth/verify
 * Verificar JWT válido
 * Header: Authorization: Bearer <token>
 */
router.post('/auth/verify', verifyToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token válido',
    usuario: req.user
  });
});

/**
 * GET /api/auth/usuarios-demo
 * Lista de usuarios de demo (SOLO PARA DESARROLLO)
 */
router.get('/auth/usuarios-demo', (req, res) => {
  res.json({
    success: true,
    message: 'Usuarios disponibles para pruebas (DESARROLLO SOLO)',
    usuarios: [
      { usuario: 'admin', contraseña: 'admin123', rol: 'admin' },
      { usuario: 'editor', contraseña: 'editor123', rol: 'editor' },
      { usuario: 'viewer', contraseña: 'viewer123', rol: 'viewer' }
    ],
    endpoint: 'POST /api/auth/login',
    ejemplo: {
      method: 'POST',
      url: 'http://localhost:3000/api/auth/login',
      body: { usuario: 'admin', contraseña: 'admin123' }
    }
  });
});

// ========== ENDPOINTS PARA CAPAS SATELITALES ==========

/**
 * GET /api/satellite-layers
 * Obtener todas las capas satelitales disponibles
 */
router.get('/satellite-layers', (req, res) => {
  try {
    const layers = getAllSatelliteLayers();
    res.json({
      success: true,
      total: layers.length,
      data: layers,
      message: 'Capas satelitales disponibles. Usa /satellite-layers/free para capas sin autenticación.'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/satellite-layers/free
 * Obtener solo capas satelitales gratuitas (sin API key requerida)
 */
router.get('/satellite-layers/free', (req, res) => {
  try {
    const layers = getFreeSatelliteLayers();
    res.json({
      success: true,
      total: layers.length,
      data: layers,
      message: 'Capas satelitales gratuitas sin autenticación requerida'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/satellite-layers/recommended/:region?
 * Obtener capas satelitales recomendadas para una región
 * Regiones soportadas: colombia, bogota (default: colombia)
 */
router.get('/satellite-layers/recommended/:region?', (req, res) => {
  try {
    const region = req.params.region || 'colombia';
    const recommendations = getRecommendedLayers(region);
    
    res.json({
      success: true,
      data: recommendations,
      message: `Capas recomendadas para ${region}`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/satellite-layers/:layerId
 * Obtener información de una capa satelital específica
 * Ejemplo: /api/satellite-layers/esri_satellite
 */
router.get('/satellite-layers/:layerId', (req, res) => {
  try {
    const { layerId } = req.params;
    const layer = getSatelliteLayer(layerId);
    const coverage = getLayerCoverageInfo(layerId);
    
    res.json({
      success: true,
      data: {
        ...layer,
        coverage: coverage.coverage
      }
    });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/satellite-layers/tile/:layerId/:z/:x/:y
 * Construir URL de tile para una capa específica
 * Ejemplo: /api/satellite-layers/tile/esri_satellite/10/250/400
 */
router.get('/satellite-layers/tile/:layerId/:z/:x/:y', (req, res) => {
  try {
    const { layerId, z, x, y } = req.params;
    const apiKey = req.query.apiKey;

    if (!layerId || !z || !x || !y) {
      return res.status(400).json({
        success: false,
        error: 'Parámetros requeridos: layerId, z, x, y'
      });
    }

    const tileUrl = buildTileUrl(layerId, z, x, y, { apiKey });
    
    res.json({
      success: true,
      data: {
        layerId,
        tile: { z: parseInt(z), x: parseInt(x), y: parseInt(y) },
        tileUrl,
        usage: 'Usa esta URL como src en un <img> o como URL de tile en Leaflet/Mapbox'
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/satellite-layers/validate
 * Validar configuración de capa satelital
 * Body: { id: "esri_satellite", apiKey: "tu_api_key" (opcional) }
 */
router.post('/satellite-layers/validate', (req, res) => {
  try {
    const { id, apiKey } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID de capa requerido'
      });
    }

    const config = validateLayerConfig({ id, apiKey });
    
    res.json({
      success: true,
      data: {
        valid: config.valid,
        layer: config.layer,
        warning: config.warning,
        message: 'Configuración válida'
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
