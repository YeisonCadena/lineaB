-- ========================================
-- INICIALIZACIÓN - API REST CON PROYECTO
-- ========================================
-- Este script prepara la base de datos "proyecto" para la API de capas georeferenciadas
-- Las tablas principales (departamentos, municipios, vias, sitios_turisticos) 
-- ya existen con datos reales

-- Verificar que PostGIS está instalado
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- ========================================
-- TABLA: CAPAS GEOREFERENCIADAS
-- ========================================
-- Para subir y gestionar nuevas capas geoespaciales

CREATE TABLE IF NOT EXISTS capas_georeferenciadas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    descripcion TEXT,
    tipo_archivo VARCHAR(50) NOT NULL, -- 'geojson', 'shapefile', 'geotiff', etc
    geometria_json JSONB NOT NULL,     -- Almacenar el GeoJSON completo
    bbox GEOMETRY(Polygon, 4326) NOT NULL, -- Bounding box de la capa
    archivo_original VARCHAR(255),     -- Nombre del archivo subido
    usuario_id INTEGER,                -- Para futuro: control de acceso
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para capas
CREATE INDEX IF NOT EXISTS idx_capas_bbox ON capas_georeferenciadas USING GIST(bbox);
CREATE INDEX IF NOT EXISTS idx_capas_nombre ON capas_georeferenciadas(nombre);
CREATE INDEX IF NOT EXISTS idx_capas_tipo ON capas_georeferenciadas(tipo_archivo);
CREATE INDEX IF NOT EXISTS idx_capas_created ON capas_georeferenciadas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_capas_json ON capas_georeferenciadas USING GIN(geometria_json);

-- ========================================
-- FUNCIONES UTILITARIAS
-- ========================================

-- Calcular área en km² de una capa
CREATE OR REPLACE FUNCTION area_capa_km2(capa_id INTEGER)
RETURNS NUMERIC AS $$
BEGIN
    RETURN (
        SELECT ST_Area(bbox::geography) / 1000000 
        FROM capas_georeferenciadas 
        WHERE id = capa_id
    );
END;
$$ LANGUAGE plpgsql;

-- Contar features en una capa
CREATE OR REPLACE FUNCTION contar_features(capa_id INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT 
            CASE 
                WHEN geometria_json->>'type' = 'FeatureCollection' THEN jsonb_array_length(geometria_json->'features')
                ELSE 1
            END
        FROM capas_georeferenciadas
        WHERE id = capa_id
    );
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- VISTAS PARA ESTADÍSTICAS
-- ========================================

-- Estadísticas de capas subidas
CREATE OR REPLACE VIEW estadisticas_capas AS
SELECT 
    COUNT(*) as total_capas,
    COUNT(DISTINCT tipo_archivo) as tipos_archivo,
    MAX(created_at) as ultima_capa_agregada,
    SUM(ST_Area(bbox::geography)) / 1000000 as area_total_km2
FROM capas_georeferenciadas;

-- Estadísticas de entidades principales
CREATE OR REPLACE VIEW estadisticas_entidades AS
SELECT 
    (SELECT COUNT(*) FROM departamentos) as total_departamentos,
    (SELECT COUNT(*) FROM municipios) as total_municipios,
    (SELECT COUNT(*) FROM vias) as total_vias,
    (SELECT COUNT(*) FROM sitios_turisticos) as total_sitios_turisticos;

-- ========================================
-- CONSULTAS ÚTILES (COMENTADAS)
-- ========================================

-- Ver todas las capas
-- SELECT id, nombre, tipo_archivo, created_at FROM capas_georeferenciadas ORDER BY created_at DESC;

-- Ver departamentos con geometría
-- SELECT denombre, ST_AsGeoJSON(geom) FROM departamentos;

-- Ver municipios cercanos a un punto
-- SELECT mpnombre, depto, ST_Distance(geom, ST_SetSRID(ST_MakePoint(-75.0, 5.0), 4326)) as distancia 
-- FROM municipios 
-- WHERE ST_Distance(geom, ST_SetSRID(ST_MakePoint(-75.0, 5.0), 4326)) < 10000 
-- ORDER BY distancia;

-- Ver sitios turísticos por ciudad
-- SELECT nombre, categoria, ciudad FROM sitios_turisticos WHERE ciudad ILIKE '%Bogotá%';

-- Longitud total de todas las vías
-- SELECT SUM(ST_Length(geom::geography)) / 1000 as total_km FROM vias;
