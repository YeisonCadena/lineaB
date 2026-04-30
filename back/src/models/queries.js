/**
 * SQL Queries Centralizadas
 * Todas las consultas en un solo lugar para fácil mantenimiento y reutilización
 */

const QUERIES = {
  // ========== DEPARTAMENTOS ==========
  DEPARTAMENTOS: {
    GET_ALL: `
      SELECT id, decodigo, denombre, dearea, shape_leng, shape_area,
             ST_AsGeoJSON(geom) as geom
      FROM departamentos
      ORDER BY denombre;
    `,
    GET_BY_ID: `
      SELECT id, decodigo, denombre, dearea, denorma, shape_leng, shape_area,
             ST_AsGeoJSON(geom) as geom
      FROM departamentos
      WHERE id = $1;
    `,
    GET_GEOJSON: `
      SELECT ST_AsGeoJSON(geom) as geometry, denombre, decodigo
      FROM departamentos
      WHERE id = $1;
    `
  },

  // ========== MUNICIPIOS ==========
  MUNICIPIOS: {
    GET_ALL: `
      SELECT id, mpcodigo, mpnombre, mparea, depto, shape_leng, shape_area,
             ST_AsGeoJSON(geom) as geom
      FROM municipios
      ORDER BY mpnombre
      LIMIT $1 OFFSET $2;
    `,
    COUNT: `SELECT COUNT(*) as total FROM municipios;`,
    
    GET_BY_ID: `
      SELECT id, mpcodigo, mpnombre, mparea, depto, shape_leng, shape_area,
             ST_AsGeoJSON(geom) as geom
      FROM municipios
      WHERE id = $1;
    `,
    GET_GEOJSON: `
      SELECT ST_AsGeoJSON(geom) as geometry, mpnombre, depto, mpaltitud
      FROM municipios
      WHERE id = $1;
    `,
    GET_BY_DEPARTAMENTO: `
      SELECT id, mpcodigo, mpnombre, mparea, depto, shape_leng, shape_area,
             ST_AsGeoJSON(geom) as geom
      FROM municipios
      WHERE depto = $1
      ORDER BY mpnombre
      LIMIT $2 OFFSET $3;
    `,
    COUNT_BY_DEPARTAMENTO: `
      SELECT COUNT(*) as total FROM municipios WHERE depto = $1;
    `,
    GET_CERCANOS: `
      SELECT id, mpnombre, 
             ST_Distance(geom, ST_SetSRID(ST_MakePoint($2, $1), 4326)) as distancia,
             ST_AsGeoJSON(geom) as geom
      FROM municipios
      WHERE ST_Distance(geom, ST_SetSRID(ST_MakePoint($2, $1), 4326)) <= $3
      ORDER BY distancia
      LIMIT $4 OFFSET $5;
    `
  },

  // ========== VÍAS ==========
  VIAS: {
    GET_ALL: `
      SELECT id, vianombre, shape_leng, shape_area,
             ST_AsGeoJSON(geom) as geom
      FROM vias
      ORDER BY vianombre;
    `,
    GET_BY_ID: `
      SELECT id, vianombre, shape_leng, shape_area,
             ST_AsGeoJSON(geom) as geom
      FROM vias
      WHERE id = $1;
    `,
    GET_GEOJSON: `
      SELECT ST_AsGeoJSON(geom) as geometry, vianombre
      FROM vias
      WHERE id = $1;
    `
  },

  // ========== SITIOS TURÍSTICOS ==========
  SITIOS_TURISTICOS: {
    GET_ALL: `
      SELECT id, stnombre, stcategoria, stciudad, shape_leng, shape_area,
             ST_AsGeoJSON(geom) as geom
      FROM sitios_turisticos
      ORDER BY stnombre
      LIMIT $1 OFFSET $2;
    `,
    COUNT: `SELECT COUNT(*) as total FROM sitios_turisticos;`,
    
    GET_BY_ID: `
      SELECT id, stnombre, stcategoria, stciudad, shape_leng, shape_area,
             ST_AsGeoJSON(geom) as geom
      FROM sitios_turisticos
      WHERE id = $1;
    `,
    GET_GEOJSON: `
      SELECT ST_AsGeoJSON(geom) as geometry, stnombre, stcategoria, stciudad
      FROM sitios_turisticos
      WHERE id = $1;
    `,
    GET_BY_CATEGORIA: `
      SELECT id, stnombre, stcategoria, stciudad, shape_leng, shape_area,
             ST_AsGeoJSON(geom) as geom
      FROM sitios_turisticos
      WHERE stcategoria = $1
      ORDER BY stnombre
      LIMIT $2 OFFSET $3;
    `,
    GET_BY_CIUDAD: `
      SELECT id, stnombre, stcategoria, stciudad, shape_leng, shape_area,
             ST_AsGeoJSON(geom) as geom
      FROM sitios_turisticos
      WHERE stciudad = $1
      ORDER BY stnombre
      LIMIT $2 OFFSET $3;
    `
  },

  // ========== CAPAS GEOREFERENCIADAS ==========
  CAPAS: {
    INSERT: `
      INSERT INTO capas_georeferenciadas 
        (nombre, descripcion, tipo_archivo, geometria_json, bbox, archivo_original, usuario_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING id, nombre, created_at;
    `,
    GET_ALL: `
      SELECT id, nombre, descripcion, tipo_archivo, usuario_id, created_at, updated_at
      FROM capas_georeferenciadas
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2;
    `,
    COUNT: `SELECT COUNT(*) as total FROM capas_georeferenciadas;`,
    
    GET_BY_ID: `
      SELECT id, nombre, descripcion, tipo_archivo, geometria_json, usuario_id, created_at
      FROM capas_georeferenciadas
      WHERE id = $1;
    `,
    DELETE: `DELETE FROM capas_georeferenciadas WHERE id = $1;`
  }
};

module.exports = { QUERIES };
