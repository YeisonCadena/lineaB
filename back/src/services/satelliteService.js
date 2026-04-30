/**
 * Servicio de capas satelitales
 * Proporciona configuración y URLs de múltiples proveedores de imágenes satelitales
 */

// Proveedores de capas satelitales disponibles
const SATELLITE_LAYERS = {
  // OpenStreetMap Satellite (USGS)
  osm_satellite: {
    name: 'OpenStreetMap Satellite (USGS)',
    provider: 'usgs',
    type: 'raster',
    url: 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSImagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'USGS',
    maxZoom: 15,
    minZoom: 1,
    description: 'Imágenes satelitales de USGS con cobertura global'
  },

  // Esri World Imagery
  esri_satellite: {
    name: 'Esri World Imagery',
    provider: 'esri',
    type: 'raster',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
    maxZoom: 18,
    minZoom: 0,
    description: 'Imágenes satelitales mundiales de Esri con alta resolución'
  },

  // Sentinelhub (Copernicus Sentinel-2)
  sentinel_2: {
    name: 'Copernicus Sentinel-2',
    provider: 'esa',
    type: 'raster',
    url: 'https://services.sentinel-hub.com/ogc/wms/{INSTANCE_ID}',
    attribution: 'ESA Copernicus',
    maxZoom: 15,
    minZoom: 0,
    description: 'Imágenes multiespectrales de Sentinel-2 (requiere API key)',
    requiresAuth: true
  },

  // Google Satellite (necesita API key)
  google_satellite: {
    name: 'Google Satellite',
    provider: 'google',
    type: 'raster',
    url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    attribution: '© Google',
    maxZoom: 18,
    minZoom: 0,
    description: 'Imágenes satelitales de Google Maps',
    requiresAuth: false
  },

  // GEBCO Bathymetry (para zonas marítimas)
  gebco_bathymetry: {
    name: 'GEBCO Bathymetry',
    provider: 'gebco',
    type: 'raster',
    url: 'https://www.gebco.net/data_and_products/gridded_bathymetry_data/',
    attribution: 'GEBCO',
    maxZoom: 8,
    minZoom: 0,
    description: 'Batimetría y topografía marina'
  },

  // Mapbox Satellite (requiere token)
  mapbox_satellite: {
    name: 'Mapbox Satellite',
    provider: 'mapbox',
    type: 'raster',
    url: 'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/{lon},{lat},{z},0,0/{width}x{height}@2x',
    attribution: '© Mapbox',
    maxZoom: 20,
    minZoom: 0,
    description: 'Imágenes satelitales de Mapbox (requiere token)',
    requiresAuth: true
  }
};

/**
 * Obtener todas las capas satelitales disponibles
 */
const getAllSatelliteLayers = () => {
  return Object.entries(SATELLITE_LAYERS).map(([id, layer]) => ({
    id,
    ...layer
  }));
};

/**
 * Obtener una capa satelital específica
 */
const getSatelliteLayer = (layerId) => {
  if (!SATELLITE_LAYERS[layerId]) {
    throw new Error(`Capa satelital '${layerId}' no encontrada`);
  }
  return {
    id: layerId,
    ...SATELLITE_LAYERS[layerId]
  };
};

/**
 * Obtener capas satelitales gratuitas (sin autenticación)
 */
const getFreeSatelliteLayers = () => {
  return getAllSatelliteLayers().filter(layer => !layer.requiresAuth);
};

/**
 * Obtener capas recomendadas para una región específica
 */
const getRecommendedLayers = (region = 'colombia') => {
  const recommendations = {
    colombia: {
      primary: 'esri_satellite',
      alternatives: ['osm_satellite', 'google_satellite'],
      description: 'Recomendado para Colombia: Esri World Imagery'
    },
    bogota: {
      primary: 'esri_satellite',
      alternatives: ['google_satellite', 'osm_satellite'],
      description: 'Recomendado para Bogotá: Esri World Imagery'
    },
    default: {
      primary: 'esri_satellite',
      alternatives: ['osm_satellite', 'google_satellite'],
      description: 'Recomendado por defecto: Esri World Imagery'
    }
  };

  const rec = recommendations[region] || recommendations.default;
  return {
    region,
    ...rec,
    layers: {
      primary: getSatelliteLayer(rec.primary),
      alternatives: rec.alternatives.map(id => getSatelliteLayer(id))
    }
  };
};

/**
 * Construir URL de tile para una capa satelital
 */
const buildTileUrl = (layerId, z, x, y, options = {}) => {
  const layer = getSatelliteLayer(layerId);
  
  let url = layer.url
    .replace('{z}', z)
    .replace('{x}', x)
    .replace('{y}', y);

  // Agregar parámetros adicionales si se proporcionan
  if (options.apiKey && layerId.includes('mapbox')) {
    url += `?access_token=${options.apiKey}`;
  }

  return url;
};

/**
 * Obtener información de cobertura para una capa
 */
const getLayerCoverageInfo = (layerId) => {
  const layer = getSatelliteLayer(layerId);
  
  return {
    id: layerId,
    name: layer.name,
    coverage: {
      global: layerId !== 'sentinel_2', // Sentinel-2 tiene cobertura selectiva
      zoomLevels: `${layer.minZoom}-${layer.maxZoom}`,
      resolution: getResolutionByProvider(layer.provider)
    }
  };
};

/**
 * Obtener resolución típica por proveedor
 */
const getResolutionByProvider = (provider) => {
  const resolutions = {
    usgs: '~30 metros',
    esri: '~1-10 metros',
    esa: '~10 metros',
    google: '~1-5 metros',
    gebco: '~900 metros',
    mapbox: '~1-30 metros'
  };
  return resolutions[provider] || 'Variable';
};

/**
 * Validar configuración de capa
 */
const validateLayerConfig = (config) => {
  if (!config.id) {
    throw new Error('ID de capa requerido');
  }
  
  const layer = getSatelliteLayer(config.id);
  
  if (layer.requiresAuth && !config.apiKey) {
    throw new Error(`Capa '${layer.name}' requiere API key`);
  }

  return {
    valid: true,
    layer: layer,
    warning: null
  };
};

module.exports = {
  SATELLITE_LAYERS,
  getAllSatelliteLayers,
  getSatelliteLayer,
  getFreeSatelliteLayers,
  getRecommendedLayers,
  buildTileUrl,
  getLayerCoverageInfo,
  validateLayerConfig
};
