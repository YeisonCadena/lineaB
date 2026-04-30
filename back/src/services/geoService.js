const { query } = require('../../db');
const logger = require('../logger/logger');

/**
 * Servicio Base para operaciones geográficas
 * Proporciona métodos reutilizables para todas las capas
 */
class GeoService {
  constructor(entityName) {
    this.entityName = entityName;
  }

  /**
   * Obtener todos los registros con paginación
   */
  async getAll(queryString, params = [], pagination) {
    try {
      const { limit, offset } = pagination;
      
      // Agregar LIMIT OFFSET al query
      const paginatedQuery = queryString.replace(';', '') + 
        ` LIMIT ${limit} OFFSET ${offset};`;
      
      const result = await query(paginatedQuery, params);
      
      logger.info(`${this.entityName} - getAll`, {
        total: result.rows.length,
        page: pagination.page
      });

      return {
        success: true,
        total: result.rows.length,
        page: pagination.page,
        limit: pagination.limit,
        data: result.rows
      };
    } catch (error) {
      logger.error(`${this.entityName} - getAll error`, { error: error.message });
      throw { status: 500, message: error.message };
    }
  }

  /**
   * Obtener registro por ID
   */
  async getById(queryString, id) {
    try {
      const result = await query(queryString, [id]);
      
      if (result.rows.length === 0) {
        logger.warn(`${this.entityName} - getById not found`, { id });
        throw { status: 404, message: `${this.entityName} no encontrado` };
      }
      
      logger.info(`${this.entityName} - getById`, { id });
      
      return {
        success: true,
        data: result.rows[0]
      };
    } catch (error) {
      if (error.status) throw error;
      logger.error(`${this.entityName} - getById error`, { error: error.message, id });
      throw { status: 500, message: error.message };
    }
  }

  /**
   * Obtener como GeoJSON Feature
   */
  async getGeoJSON(queryString, id) {
    try {
      const result = await query(queryString, [id]);
      
      if (result.rows.length === 0) {
        logger.warn(`${this.entityName} - getGeoJSON not found`, { id });
        throw { status: 404, message: `${this.entityName} no encontrado` };
      }
      
      const row = result.rows[0];
      const geometry = JSON.parse(row.geometry);
      
      // Preparar properties (eliminar geometry)
      const properties = { ...row };
      delete properties.geometry;
      
      const geojson = {
        type: 'Feature',
        properties,
        geometry
      };
      
      logger.info(`${this.entityName} - getGeoJSON`, { id });
      
      return geojson;
    } catch (error) {
      if (error.status) throw error;
      logger.error(`${this.entityName} - getGeoJSON error`, { error: error.message, id });
      throw { status: 500, message: error.message };
    }
  }

  /**
   * Ejecutar query personalizada
   */
  async executeQuery(queryString, params = []) {
    try {
      const result = await query(queryString, params);
      return result.rows;
    } catch (error) {
      logger.error(`${this.entityName} - executeQuery error`, { error: error.message });
      throw { status: 500, message: error.message };
    }
  }
}

module.exports = GeoService;
