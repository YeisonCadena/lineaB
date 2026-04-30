/**
 * Middlewares de Validación
 * Reutilizables en cualquier ruta
 */

// Validar ID numérico positivo
const validateId = (req, res, next) => {
  const { id } = req.params;
  const parsed = parseInt(id);
  
  if (isNaN(parsed) || parsed <= 0) {
    return res.status(400).json({
      success: false,
      error: 'ID debe ser un número positivo',
      received: id
    });
  }
  
  req.params.id = parsed;
  next();
};

// Validar paginación (page, limit)
const validatePagination = (req, res, next) => {
  let { page = 1, limit = 50 } = req.query;
  
  page = parseInt(page);
  limit = parseInt(limit);
  
  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1 || limit > 100) limit = 50;
  
  req.pagination = {
    page,
    limit,
    offset: (page - 1) * limit
  };
  
  next();
};

// Validar parámetro string (no vacío)
const validateStringParam = (paramName) => (req, res, next) => {
  const value = req.params[paramName] || req.query[paramName];
  
  if (!value || value.trim() === '') {
    return res.status(400).json({
      success: false,
      error: `${paramName} es requerido y no puede estar vacío`
    });
  }
  
  next();
};

// Validar coordenadas geográficas (lat, lon)
const validateCoordinates = (req, res, next) => {
  const { lat, lon, radio } = req.query;
  
  let latitude = parseFloat(lat);
  let longitude = parseFloat(lon);
  let distance = parseFloat(radio);
  
  if (isNaN(latitude) || latitude < -90 || latitude > 90) {
    return res.status(400).json({
      success: false,
      error: 'Latitud debe estar entre -90 y 90',
      received: lat
    });
  }
  
  if (isNaN(longitude) || longitude < -180 || longitude > 180) {
    return res.status(400).json({
      success: false,
      error: 'Longitud debe estar entre -180 y 180',
      received: lon
    });
  }
  
  if (isNaN(distance) || distance <= 0 || distance > 1000000) {
    distance = 5000; // 5km por defecto
  }
  
  req.geo = {
    latitude,
    longitude,
    distance
  };
  
  next();
};

module.exports = {
  validateId,
  validatePagination,
  validateStringParam,
  validateCoordinates
};
