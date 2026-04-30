const GeoService = require('./geoService');
const { QUERIES } = require('../models/queries');

/**
 * Servicio de Departamentos
 * Lógica de negocio para departamentos
 */
class DepartamentoService extends GeoService {
  constructor() {
    super('Departamento');
  }

  /**
   * Obtener todos los departamentos
   */
  async getAllDepartamentos() {
    return await this.getById(QUERIES.DEPARTAMENTOS.GET_ALL, null);
  }

  /**
   * Obtener departamento por ID
   */
  async getDepartamentoById(id) {
    return await this.getById(QUERIES.DEPARTAMENTOS.GET_BY_ID, id);
  }

  /**
   * Obtener departamento en formato GeoJSON
   */
  async getDepartamentoGeoJSON(id) {
    return await this.getGeoJSON(QUERIES.DEPARTAMENTOS.GET_GEOJSON, id);
  }
}

module.exports = new DepartamentoService();
