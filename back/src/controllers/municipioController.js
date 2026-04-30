const municipioService = require('../services/municipioService');
const logger = require('../logger/logger');

/**
 * Controller de Municipios
 * Maneja requests HTTP y delega a servicios
 */
class MunicipioController {
  /**
   * GET /municipios?page=1&limit=50
   */
  async getAll(req, res, next) {
    try {
      const result = await municipioService.getAllMunicipios(req.pagination);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /municipios/:id
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const result = await municipioService.getMunicipioById(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /municipios/:id/geojson
   */
  async getGeoJSON(req, res, next) {
    try {
      const { id } = req.params;
      const geojson = await municipioService.getMunicipioGeoJSON(id);
      res.setHeader('Content-Type', 'application/geo+json');
      res.json(geojson);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /municipios/departamento/:depto?page=1&limit=50
   */
  async getByDepartamento(req, res, next) {
    try {
      const { depto } = req.params;
      const result = await municipioService.getMunicipiosByDepartamento(depto, req.pagination);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /municipios/cercanos?lat=5.5&lon=-74.0&radio=5000&page=1&limit=50
   */
  async getCercanos(req, res, next) {
    try {
      const { latitude, longitude, distance } = req.geo;
      const result = await municipioService.getMunicipiosCercanos(
        latitude, 
        longitude, 
        distance, 
        req.pagination
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MunicipioController();
