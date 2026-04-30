const logger = require('../logger/logger');

/**
 * Error Handler Middleware Global
 * Captura todos los errores y responde de forma consistente
 */
const errorHandler = (error, req, res, next) => {
  const status = error.status || error.statusCode || 500;
  const message = error.message || 'Error interno del servidor';

  logger.error('Error no manejado', {
    status,
    message,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: req.user?.usuario || 'anonymous'
  });

  res.status(status).json({
    success: false,
    error: message,
    code: error.code || 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: error.stack,
      details: error
    })
  });
};

/**
 * 404 Not Found
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
    path: req.path,
    method: req.method
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
