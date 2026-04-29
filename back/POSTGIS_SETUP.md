# Configuración de PostgreSQL con PostGIS - Guía Completa

## 1. Requisitos Previos
- PostgreSQL instalado (versión 12 o superior)
- PostGIS instalado en PostgreSQL
- Node.js (v16 o superior)

## 2. Instalar PostGIS en PostgreSQL

### En Windows (usando PostgreSQL installer):
```sql
-- En pgAdmin o psql, ejecutar como superusuario:
CREATE EXTENSION postgis;
CREATE EXTENSION postgis_topology;
CREATE EXTENSION fuzzystrmatch;
CREATE EXTENSION postgis_tiger_geocoder;

-- Verificar instalación:
SELECT PostGIS_version();
```

### En Linux:
```bash
sudo apt-get install postgresql-12-postgis-3
sudo -u postgres psql -c "CREATE EXTENSION postgis;" -d tu_base_datos
```

## 3. Crear Base de Datos
```sql
-- Conectar como superusuario postgres
CREATE DATABASE linea_b;

-- Conectar a la nueva BD
\c linea_b

-- Instalar extensiones
CREATE EXTENSION postgis;
CREATE EXTENSION postgis_topology;
```

## 4. Configurar Variables de Entorno
Edita el archivo `.env` en la carpeta `back`:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=linea_b
DB_USER=postgres
DB_PASSWORD=tu_contraseña_postgres
DB_SSL=false
PORT=3000
NODE_ENV=development
```

## 5. Instalar Dependencias Node.js
```bash
cd back
npm install
```

## 6. Ejecutar el Servidor
```bash
# Producción
npm start

# Desarrollo (con auto-reinicio)
npm run dev
```

## 7. Probar la Conexión
Abre tu navegador o Postman:

### Verificar salud de la API:
```
GET http://localhost:3000/health
```

### Verificar PostGIS:
```
GET http://localhost:3000/postgis-version
```

### Probar consulta geográfica:
```
GET http://localhost:3000/geo-example
```

## 8. Crear Tablas con Geometría (Ejemplo)
```sql
-- Crear tabla de lugares con coordenadas
CREATE TABLE lugares (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    descripcion TEXT,
    geom GEOMETRY(Point, 4326),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índice espacial
CREATE INDEX idx_lugares_geom ON lugares USING GIST(geom);

-- Insertar ejemplo de punto (Bogotá)
INSERT INTO lugares (nombre, descripcion, geom)
VALUES ('Bogotá Centro', 'Centro histórico', ST_SetSRID(ST_MakePoint(-74.076, 4.711), 4326));
```

## 9. Realizar Consultas Geográficas desde la API

Ejemplo para obtener todos los lugares con su geometría en GeoJSON:

```javascript
// En un archivo routes.js
app.get('/lugares', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, nombre, descripcion, ST_AsGeoJSON(geom) as geom FROM lugares;`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Solución de Problemas

### Error: "extension postgis does not exist"
- Verifica que PostGIS esté instalado: `SELECT * FROM pg_available_extensions WHERE name LIKE 'postgis%';`
- Si no aparece, reinstala PostGIS desde el PostgreSQL installer

### Error de conexión
- Verifica credenciales en `.env`
- Asegúrate de que PostgreSQL está ejecutándose
- Comprueba firewall local

### PostGIS no se detecta en API
- Ejecuta manualmente en pgAdmin: `SELECT PostGIS_version();`
- Verifica que la base de datos tiene la extensión instalada

## Referencias
- [PostGIS Documentation](https://postgis.net/documentation/)
- [Node.js pg Documentation](https://node-postgres.com/)
- [GeoJSON Specification](https://geojson.org/)
