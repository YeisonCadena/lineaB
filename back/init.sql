-- ============================================
-- Script de Inicialización - Línea B con PostGIS
-- ============================================

-- Verificar que PostGIS está instalado
SELECT PostGIS_version();

-- Crear tabla de estaciones
CREATE TABLE IF NOT EXISTS estaciones (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    geom GEOMETRY(Point, 4326) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índice espacial para mejor rendimiento en consultas
CREATE INDEX IF NOT EXISTS idx_estaciones_geom ON estaciones USING GIST(geom);

-- Crear tabla de rutas/líneas
CREATE TABLE IF NOT EXISTS rutas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    ruta_geom GEOMETRY(LineString, 4326) NOT NULL,
    distancia_km NUMERIC(10, 3),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índice espacial para rutas
CREATE INDEX IF NOT EXISTS idx_rutas_geom ON rutas USING GIST(ruta_geom);

-- Crear tabla de paradas
CREATE TABLE IF NOT EXISTS paradas (
    id SERIAL PRIMARY KEY,
    estacion_id INTEGER NOT NULL REFERENCES estaciones(id) ON DELETE CASCADE,
    ruta_id INTEGER NOT NULL REFERENCES rutas(id) ON DELETE CASCADE,
    orden INTEGER NOT NULL,
    tiempo_parada INTEGER DEFAULT 60, -- en segundos
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para relaciones
CREATE INDEX IF NOT EXISTS idx_paradas_estacion ON paradas(estacion_id);
CREATE INDEX IF NOT EXISTS idx_paradas_ruta ON paradas(ruta_id);

-- ============================================
-- Insertar datos de ejemplo (Bogotá - Línea B)
-- ============================================

-- Insertar estaciones
INSERT INTO estaciones (nombre, descripcion, geom) VALUES
('Kennedy', 'Estación Kennedy - Sur de Bogotá', ST_SetSRID(ST_MakePoint(-74.1449, 4.6297), 4326)),
('Banderas', 'Estación Banderas', ST_SetSRID(ST_MakePoint(-74.1439, 4.6417), 4326)),
('Marsella', 'Estación Marsella', ST_SetSRID(ST_MakePoint(-74.1431, 4.6531), 4326)),
('Gamarra', 'Estación Gamarra', ST_SetSRID(ST_MakePoint(-74.1419, 4.6641), 4326)),
('Biblioteca', 'Estación Biblioteca', ST_SetSRID(ST_MakePoint(-74.1409, 4.6751), 4326)),
('Usaquén', 'Estación Usaquén - Norte de Bogotá', ST_SetSRID(ST_MakePoint(-74.0280, 4.7210), 4326)) ON CONFLICT DO NOTHING;

-- Insertar ruta principal (ejemplo simplificado)
INSERT INTO rutas (nombre, descripcion, ruta_geom, distancia_km) VALUES
('Línea B - Kennedy a Usaquén', 
 'Ruta principal de transporte masivo',
 ST_SetSRID(
   ST_LineFromText('LINESTRING(-74.1449 4.6297, -74.1439 4.6417, -74.1431 4.6531, -74.1419 4.6641, -74.1409 4.6751, -74.0280 4.7210)'),
   4326
 ),
 15.5
) ON CONFLICT DO NOTHING;

-- ============================================
-- Consultas útiles
-- ============================================

-- Ver todas las estaciones
SELECT id, nombre, ST_AsText(geom) as coordenadas FROM estaciones;

-- Ver distancia entre estaciones (en metros)
SELECT 
  e1.nombre as estacion_origen,
  e2.nombre as estacion_destino,
  ROUND(ST_Distance(e1.geom, e2.geom)::numeric, 2) as distancia_metros
FROM estaciones e1
JOIN estaciones e2 ON e1.id < e2.id
ORDER BY distancia_metros DESC
LIMIT 10;

-- Ver estaciones dentro de 500m de un punto (ej: -74.0280, 4.7210)
SELECT 
  nombre,
  ROUND(ST_Distance(geom, ST_SetSRID(ST_MakePoint(-74.0280, 4.7210), 4326))::numeric, 2) as distancia_metros
FROM estaciones
WHERE ST_Distance(geom, ST_SetSRID(ST_MakePoint(-74.0280, 4.7210), 4326)) < 500
ORDER BY distancia_metros;

-- Ver área de cobertura (envolvente convexa)
SELECT ST_AsText(ST_ConvexHull(ST_Collect(geom))) as area_cobertura FROM estaciones;

-- Ver información de rutas
SELECT id, nombre, distancia_km, ST_AsText(ruta_geom) FROM rutas;
