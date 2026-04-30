const express = require('express');
const router = express.Router();
const viaController = require('../controllers/viaController');
const { validateId } = require('../middleware/validate');

router.get('/', viaController.getAll);
router.get('/:id', validateId, viaController.getById);
router.get('/:id/geojson', validateId, viaController.getGeoJSON);

module.exports = router;
