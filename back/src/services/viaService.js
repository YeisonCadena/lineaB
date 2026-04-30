const GeoService = require('./geoService');
const { QUERIES } = require('../models/queries');

class ViaService extends GeoService {
  constructor() {
    super('Vía');
  }

  async getAllVias() {
    return await this.getById(QUERIES.VIAS.GET_ALL, null);
  }

  async getViaById(id) {
    return await this.getById(QUERIES.VIAS.GET_BY_ID, id);
  }

  async getViaGeoJSON(id) {
    return await this.getGeoJSON(QUERIES.VIAS.GET_GEOJSON, id);
  }
}

module.exports = new ViaService();
