const express = require('express');
const router = express.Router();
const municipioController = require('../controllers/municipioController');
const { validateId, validatePagination, validateStringParam, validateCoordinates } = require('../middleware/validate');

/**
 * Rutas de Municipios
 */
router.get('/', validatePagination, municipioController.getAll);
router.get('/:id', validateId, municipioController.getById);
router.get('/:id/geojson', validateId, municipioController.getGeoJSON);
router.get('/departamento/:depto', validatePagination, municipioController.getByDepartamento);
router.get('/cercanos', validateCoordinates, validatePagination, municipioController.getCercanos);

module.exports = router;
