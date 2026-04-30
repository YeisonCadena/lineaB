const GeoService = require('./geoService');
const { QUERIES } = require('../models/queries');
const { query } = require('../../db');
const logger = require('../logger/logger');

/**
 * Servicio de Municipios
 * Lógica de negocio para municipios
 */
class MunicipioService extends GeoService {
  constructor() {
    super('Municipio');
  }

  /**
   * Obtener todos los municipios con paginación
   */
  async getAllMunicipios(pagination) {
    try {
      const result = await query(QUERIES.MUNICIPIOS.GET_ALL, [pagination.limit, pagination.offset]);
      const countResult = await query(QUERIES.MUNICIPIOS.COUNT);
      
      logger.info('Municipio - getAllMunicipios', { total: countResult.rows[0].total, page: pagination.page });
      
      return {
        success: true,
        total: parseInt(countResult.rows[0].total),
        page: pagination.page,
        limit: pagination.limit,
        data: result.rows
      };
    } catch (error) {
      logger.error('Municipio - getAllMunicipios error', { error: error.message });
      throw { status: 500, message: error.message };
    }
  }

  /**
   * Obtener municipio por ID
   */
  async getMunicipioById(id) {
    return await this.getById(QUERIES.MUNICIPIOS.GET_BY_ID, id);
  }

  /**
   * Obtener municipio en formato GeoJSON
   */
  async getMunicipioGeoJSON(id) {
    return await this.getGeoJSON(QUERIES.MUNICIPIOS.GET_GEOJSON, id);
  }

  /**
   * Obtener municipios por departamento
   */
  async getMunicipiosByDepartamento(depto, pagination) {
    try {
      const result = await query(QUERIES.MUNICIPIOS.GET_BY_DEPARTAMENTO, 
        [depto, pagination.limit, pagination.offset]);
      const countResult = await query(QUERIES.MUNICIPIOS.COUNT_BY_DEPARTAMENTO, [depto]);
      
      logger.info('Municipio - getMunicipiosByDepartamento', { depto, total: countResult.rows[0].total });
      
      return {
        success: true,
        total: parseInt(countResult.rows[0].total),
        page: pagination.page,
        limit: pagination.limit,
        departamento: depto,
        data: result.rows
      };
    } catch (error) {
      logger.error('Municipio - getMunicipiosByDepartamento error', { error: error.message, depto });
      throw { status: 500, message: error.message };
    }
  }

  /**
   * Obtener municipios cercanos por coordenadas (búsqueda espacial)
   */
  async getMunicipiosCercanos(latitude, longitude, distance, pagination) {
    try {
      const result = await query(QUERIES.MUNICIPIOS.GET_CERCANOS, 
        [latitude, longitude, distance, pagination.limit, pagination.offset]);
      
      logger.info('Municipio - getMunicipiosCercanos', { 
        latitude, 
        longitude, 
        distance, 
        resultados: result.rows.length 
      });
      
      return {
        success: true,
        total: result.rows.length,
        coordenadas: { latitude, longitude },
        radio_metros: distance,
        data: result.rows
      };
    } catch (error) {
      logger.error('Municipio - getMunicipiosCercanos error', { error: error.message });
      throw { status: 500, message: error.message };
    }
  }
}

module.exports = new MunicipioService();
