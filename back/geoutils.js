/**
 * Utilidades para procesamiento geoespacial
 */

/**
 * Validar GeoJSON
 */
function validateGeoJSON(jsonString) {
  try {
    const geojson = JSON.parse(jsonString);
    
    // Verificar estructura básica de GeoJSON
    if (!geojson.type) {
      return { valid: false, error: 'GeoJSON debe tener propiedad "type"' };
    }

    const validTypes = ['FeatureCollection', 'Feature', 'Point', 'LineString', 'Polygon', 
                       'MultiPoint', 'MultiLineString', 'MultiPolygon', 'GeometryCollection'];
    
    if (!validTypes.includes(geojson.type)) {
      return { valid: false, error: `Tipo de GeoJSON inválido: ${geojson.type}` };
    }

    // Validar según tipo
    if (geojson.type === 'FeatureCollection') {
      if (!Array.isArray(geojson.features)) {
        return { valid: false, error: 'FeatureCollection debe tener array "features"' };
      }
    } else if (geojson.type === 'Feature') {
      if (!geojson.geometry) {
        return { valid: false, error: 'Feature debe tener propiedad "geometry"' };
      }
    }

    return { valid: true };

  } catch (error) {
    return { valid: false, error: 'JSON inválido: ' + error.message };
  }
}

/**
 * Procesar archivo Shapefile
 * Nota: Necesita la librería 'shapefile' instalada
 */
async function parseShapefile(filePath) {
  try {
    // Para implementación completa, necesitarías usar la librería 'shapefile'
    // Por ahora, retornamos un error indicativo
    return {
      valid: false,
      error: 'Procesamiento de Shapefile requiere dependencia "shapefile". Instálalo con: npm install shapefile'
    };
    
    // Implementación futura:
    // const shapefile = require('shapefile');
    // const source = await shapefile.open(filePath);
    // const geojson = await source.read();
    // return { valid: true, geojson };
    
  } catch (error) {
    return { 
      valid: false, 
      error: 'Error procesando Shapefile: ' + error.message 
    };
  }
}

/**
 * Calcular Bounding Box de un GeoJSON
 */
function calculateBBox(geojson) {
  let coordinates = [];

  // Extraer todas las coordenadas según el tipo
  function extractCoordinates(geom) {
    if (!geom) return;

    if (geom.type === 'Point' && geom.coordinates) {
      coordinates.push(geom.coordinates);
    } else if (geom.type === 'LineString' && geom.coordinates) {
      coordinates.push(...geom.coordinates);
    } else if (geom.type === 'Polygon' && geom.coordinates) {
      geom.coordinates.forEach(ring => {
        coordinates.push(...ring);
      });
    } else if (geom.type === 'MultiPoint' && geom.coordinates) {
      coordinates.push(...geom.coordinates);
    } else if (geom.type === 'MultiLineString' && geom.coordinates) {
      geom.coordinates.forEach(line => {
        coordinates.push(...line);
      });
    } else if (geom.type === 'MultiPolygon' && geom.coordinates) {
      geom.coordinates.forEach(polygon => {
        polygon.forEach(ring => {
          coordinates.push(...ring);
        });
      });
    } else if (geom.type === 'GeometryCollection' && geom.geometries) {
      geom.geometries.forEach(g => extractCoordinates(g));
    }
  }

  if (geojson.type === 'FeatureCollection' && geojson.features) {
    geojson.features.forEach(feature => {
      extractCoordinates(feature.geometry);
    });
  } else if (geojson.type === 'Feature') {
    extractCoordinates(geojson.geometry);
  } else {
    extractCoordinates(geojson);
  }

  // Calcular min/max
  if (coordinates.length === 0) {
    return {
      wktString: 'POLYGON((0 0, 1 0, 1 1, 0 1, 0 0))',
      geojson: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]] }
    };
  }

  const lons = coordinates.map(c => c[0]);
  const lats = coordinates.map(c => c[1]);

  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  // Formato WKT para PostGIS
  const wktString = `POLYGON((${minLon} ${minLat}, ${maxLon} ${minLat}, ${maxLon} ${maxLat}, ${minLon} ${maxLat}, ${minLon} ${minLat}))`;

  const geojsonBbox = {
    type: 'Polygon',
    coordinates: [[
      [minLon, minLat],
      [maxLon, minLat],
      [maxLon, maxLat],
      [minLon, maxLat],
      [minLon, minLat]
    ]]
  };

  return {
    wktString,
    geojson: geojsonBbox,
    bounds: {
      minLon, maxLon, minLat, maxLat
    }
  };
}

/**
 * Sanitizar nombre de archivo/capa
 */
function sanitizeFilename(filename) {
  return filename
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s_-]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 100);
}

/**
 * Convertir coordenadas a diferentes sistemas
 */
function convertCoordinates(lat, lon, fromSRID, toSRID) {
  // Para implementación completa, necesitarías proj4
  // Por ahora, retornamos las mismas coordenadas
  return { lat, lon };
}

/**
 * Calcular distancia entre dos puntos (Haversine)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distancia en km
  
  return distance;
}

module.exports = {
  validateGeoJSON,
  parseShapefile,
  calculateBBox,
  sanitizeFilename,
  convertCoordinates,
  calculateDistance
};
