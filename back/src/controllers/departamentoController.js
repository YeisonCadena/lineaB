const departamentoService = require('../services/departamentoService');
const logger = require('../logger/logger');

/**
 * Controller de Departamentos
 * Maneja requests HTTP y delega a servicios
 */
class DepartamentoController {
  /**
   * GET /departamentos
   * Obtener todos los departamentos
   */
  async getAll(req, res, next) {
    try {
      const result = await departamentoService.getAllDepartamentos();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /departamentos/:id
   * Obtener departamento por ID
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const result = await departamentoService.getDepartamentoById(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /departamentos/:id/geojson
   * Obtener departamento en formato GeoJSON
   */
  async getGeoJSON(req, res, next) {
    try {
      const { id } = req.params;
      const geojson = await departamentoService.getDepartamentoGeoJSON(id);
      res.setHeader('Content-Type', 'application/geo+json');
      res.json(geojson);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DepartamentoController();
