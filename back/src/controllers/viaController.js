const viaService = require('../services/viaService');

class ViaController {
  async getAll(req, res, next) {
    try {
      const result = await viaService.getAllVias();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const result = await viaService.getViaById(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getGeoJSON(req, res, next) {
    try {
      const { id } = req.params;
      const geojson = await viaService.getViaGeoJSON(id);
      res.setHeader('Content-Type', 'application/geo+json');
      res.json(geojson);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ViaController();
