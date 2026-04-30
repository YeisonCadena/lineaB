# 🗺️ REST API - Proyecto Georeferenciado

API Node.js + Express + PostgreSQL + PostGIS para consultar datos geoespaciales.

## ⚡ Inicio Rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Ejecutar script SQL (en pgAdmin o terminal)
psql -U postgres -d proyecto -f init.sql

# 3. Iniciar servidor
npm run dev
```

Servidor en: **http://localhost:3000**

## 📊 Datos Disponibles

| Tabla | Registros | Endpoints |
|-------|-----------|-----------|
| departamentos | 4 | GET /api/departamentos |
| municipios | 236 | GET /api/municipios |
| vias | 14 | GET /api/vias |
| sitios_turisticos | 165 | GET /api/sitios-turisticos |
| capas (upload) | - | POST /api/capas |

## 📡 Ejemplos

```bash
# Listar departamentos
curl http://localhost:3000/api/departamentos

# Municipios cercanos (10km)
curl "http://localhost:3000/api/municipios/cercanos?lat=5.5&lon=-74.0&radio=10000"

# Como GeoJSON
curl http://localhost:3000/api/municipios/1/geojson

# Subir capa GeoJSON
curl -X POST http://localhost:3000/api/capas \
  -F "archivo=@datos.geojson" -F "nombre=Mi Capa"
```

## 📖 Documentación Completa

Ver **[ENDPOINTS.md](ENDPOINTS.md)** - 22 endpoints documentados con ejemplos.

## 🛠️ Archivos

- `server.js` - Servidor Express
- `routes.js` - 22 endpoints REST  
- `db.js` - Conexión PostgreSQL
- `geoutils.js` - Funciones geoespaciales
- `init.sql` - Setup de base de datos
- `.env` - Configuración

---

**SRID:** 4326 (WGS84)  
**Base de datos:** proyecto  
**Puerto:** 3000
