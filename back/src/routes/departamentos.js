const express = require('express');
const router = express.Router();
const departamentoController = require('../controllers/departamentoController');
const { validateId } = require('../middleware/validate');

/**
 * Rutas de Departamentos
 */
router.get('/', departamentoController.getAll);
router.get('/:id', validateId, departamentoController.getById);
router.get('/:id/geojson', validateId, departamentoController.getGeoJSON);

module.exports = router;
