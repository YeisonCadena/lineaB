const GeoService = require('./geoService');
const { QUERIES } = require('../models/queries');
const { query } = require('../../db');
const logger = require('../logger/logger');

class SitioService extends GeoService {
  constructor() {
    super('Sitio Turístico');
  }

  async getAllSitios(pagination) {
    try {
      const result = await query(QUERIES.SITIOS_TURISTICOS.GET_ALL, [pagination.limit, pagination.offset]);
      const countResult = await query(QUERIES.SITIOS_TURISTICOS.COUNT);

      return {
        success: true,
        total: parseInt(countResult.rows[0].total),
        page: pagination.page,
        limit: pagination.limit,
        data: result.rows
      };
    } catch (error) {
      logger.error('Sitio - getAllSitios error', { error: error.message });
      throw { status: 500, message: error.message };
    }
  }

  async getSitioById(id) {
    return await this.getById(QUERIES.SITIOS_TURISTICOS.GET_BY_ID, id);
  }

  async getSitioGeoJSON(id) {
    return await this.getGeoJSON(QUERIES.SITIOS_TURISTICOS.GET_GEOJSON, id);
  }

  async getSitiosByCategoria(categoria, pagination) {
    try {
      const result = await query(QUERIES.SITIOS_TURISTICOS.GET_BY_CATEGORIA, [categoria, pagination.limit, pagination.offset]);
      return {
        success: true,
        total: result.rows.length,
        categoria,
        page: pagination.page,
        limit: pagination.limit,
        data: result.rows
      };
    } catch (error) {
      logger.error('Sitio - getSitiosByCategoria error', { error: error.message, categoria });
      throw { status: 500, message: error.message };
    }
  }

  async getSitiosByCiudad(ciudad, pagination) {
    try {
      const result = await query(QUERIES.SITIOS_TURISTICOS.GET_BY_CIUDAD, [ciudad, pagination.limit, pagination.offset]);
      return {
        success: true,
        total: result.rows.length,
        ciudad,
        page: pagination.page,
        limit: pagination.limit,
        data: result.rows
      };
    } catch (error) {
      logger.error('Sitio - getSitiosByCiudad error', { error: error.message, ciudad });
      throw { status: 500, message: error.message };
    }
  }
}

module.exports = new SitioService();
