# 📡 Guía Completa de Endpoints REST API

Documentación detallada de todos los endpoints disponibles en la API con ejemplos de uso.

---

## 📍 DEPARTAMENTOS - 4 registros

### GET /api/departamentos
Obtener lista de todos los departamentos (4 total).

**Query Parameters:** Ninguno

**Response:**
```json
{
  "success": true,
  "total": 4,
  "data": [
    {
      "id": 1,
      "decodigo": "05",
      "denombre": "Antioquia",
      "dearea": 63612.0,
      "shape_leng": 1234.56,
      "shape_area": 63612.0,
      "geom": {
        "type": "MultiPolygon",
        "coordinates": [...]
      }
    }
  ]
}
```

**cURL:**
```bash
curl http://localhost:3000/api/departamentos
```

---

### GET /api/departamentos/:id
Obtener detalles de un departamento específico.

**Parameters:**
- `id` (integer, required) - ID del departamento

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "decodigo": "05",
    "denombre": "Antioquia",
    "dearea": 63612.0,
    "denorma": 63612.0,
    "shape_leng": 1234.56,
    "shape_area": 63612.0,
    "geom": {...}
  }
}
```

**cURL:**
```bash
curl http://localhost:3000/api/departamentos/1
```

---

### GET /api/departamentos/:id/geojson
Obtener un departamento en formato GeoJSON puro.

**Response:**
```json
{
  "type": "Feature",
  "properties": {
    "nombre": "Antioquia",
    "codigo": "05",
    "tipo": "departamento"
  },
  "geometry": {
    "type": "MultiPolygon",
    "coordinates": [...]
  }
}
```

**cURL:**
```bash
curl http://localhost:3000/api/departamentos/1/geojson \
  -H "Accept: application/geo+json"
```

---

## 🏘️ MUNICIPIOS - 236 registros

### GET /api/municipios
Listar municipios con paginación.

**Query Parameters:**
- `limit` (default: 50) - Registros por página
- `offset` (default: 0) - Página inicial

**Response:**
```json
{
  "success": true,
  "total": 236,
  "limit": 50,
  "offset": 0,
  "data": [
    {
      "id": 1,
      "mpcodigo": "05001",
      "mpnombre": "Medellín",
      "depto": "Antioquia",
      "mparea": 380.64,
      "mpaltitud": 1495,
      "mpcategor": "Categoria especial",
      "geom": {...}
    }
  ]
}
```

**cURL:**
```bash
# Primera página (50 registros)
curl http://localhost:3000/api/municipios

# Segunda página
curl "http://localhost:3000/api/municipios?limit=50&offset=50"

# Primeros 10 registros
curl "http://localhost:3000/api/municipios?limit=10"
```

---

### GET /api/municipios/:id
Obtener un municipio específico.

**Parameters:**
- `id` (integer, required) - ID del municipio

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "mpcodigo": "05001",
    "mpnombre": "Medellín",
    "depto": "Antioquia",
    "mparea": 380.64,
    "mpaltitud": 1495,
    "mpcategor": "Categoria especial",
    "restriccio": null,
    "shape_leng": 1234.56,
    "shape_area": 380.64,
    "geom": {...}
  }
}
```

**cURL:**
```bash
curl http://localhost:3000/api/municipios/1
```

---

### GET /api/municipios/departamento/:depto
Obtener municipios de un departamento específico.

**Parameters:**
- `depto` (string, required) - Nombre del departamento (búsqueda parcial)

**Response:**
```json
{
  "success": true,
  "total": 5,
  "departamento": "Antioquia",
  "data": [...]
}
```

**cURL:**
```bash
curl "http://localhost:3000/api/municipios/departamento/Antioquia"

# O parcial:
curl "http://localhost:3000/api/municipios/departamento/Cauca"
```

---

### GET /api/municipios/cercanos
Buscar municipios cercanos a un punto (búsqueda espacial).

**Query Parameters:**
- `lat` (number, required) - Latitud
- `lon` (number, required) - Longitud
- `radio` (number, default: 5000) - Radio en metros

**Response:**
```json
{
  "success": true,
  "punto": {
    "lat": 5.5,
    "lon": -74.0
  },
  "radio_metros": 5000,
  "encontrados": 3,
  "data": [
    {
      "id": 15,
      "mpnombre": "Municipio Cercano",
      "depto": "Departamento",
      "mpaltitud": 1200,
      "distancia": 2345.67,
      "geom": {...}
    }
  ]
}
```

**cURL:**
```bash
# Municipios dentro de 5km de Bogotá
curl "http://localhost:3000/api/municipios/cercanos?lat=4.7110&lon=-74.0069&radio=5000"

# Dentro de 1km
curl "http://localhost:3000/api/municipios/cercanos?lat=4.7110&lon=-74.0069&radio=1000"
```

---

### GET /api/municipios/:id/geojson
Obtener municipio en formato GeoJSON.

**Response:**
```json
{
  "type": "Feature",
  "properties": {
    "nombre": "Medellín",
    "departamento": "Antioquia",
    "altitud": 1495,
    "tipo": "municipio"
  },
  "geometry": {...}
}
```

**cURL:**
```bash
curl http://localhost:3000/api/municipios/1/geojson
```

---

## 🛣️ VÍAS - 14 registros

### GET /api/vias
Listar todas las vías con su longitud calculada.

**Response:**
```json
{
  "success": true,
  "total": 14,
  "data": [
    {
      "id": 1,
      "via": "Ruta 45",
      "tipo": "Principal",
      "origen": "Medellín",
      "destino": "Bogotá",
      "longitud_metros": 456234.5,
      "geom": {...}
    }
  ]
}
```

**cURL:**
```bash
curl http://localhost:3000/api/vias
```

---

### GET /api/vias/:id
Obtener una vía específica.

**Parameters:**
- `id` (integer, required) - ID de la vía

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "via": "Ruta 45",
    "tipo": "Principal",
    "origen": "Medellín",
    "destino": "Bogotá",
    "longitud_metros": 456234.5,
    "geom": {...}
  }
}
```

**cURL:**
```bash
curl http://localhost:3000/api/vias/1
```

---

### GET /api/vias/:id/geojson
Obtener vía en formato GeoJSON.

**Response:**
```json
{
  "type": "Feature",
  "properties": {
    "nombre": "Ruta 45",
    "tipo": "Principal",
    "origen": "Medellín",
    "destino": "Bogotá"
  },
  "geometry": {
    "type": "LineString",
    "coordinates": [...]
  }
}
```

**cURL:**
```bash
curl http://localhost:3000/api/vias/1/geojson
```

---

## 🎒 SITIOS TURÍSTICOS - 165 registros

### GET /api/sitios-turisticos
Listar sitios turísticos con paginación.

**Query Parameters:**
- `limit` (default: 50) - Registros por página
- `offset` (default: 0) - Página inicial

**Response:**
```json
{
  "success": true,
  "total": 165,
  "limit": 50,
  "offset": 0,
  "data": [
    {
      "id": 1,
      "nombre": "Monumento X",
      "ciudad": "Medellín",
      "departamen": "Antioquia",
      "categoria": "Monumento",
      "objectid": 123,
      "geom": {...}
    }
  ]
}
```

**cURL:**
```bash
curl http://localhost:3000/api/sitios-turisticos

# Con paginación
curl "http://localhost:3000/api/sitios-turisticos?limit=20&offset=0"
```

---

### GET /api/sitios-turisticos/:id
Obtener un sitio turístico específico.

**Parameters:**
- `id` (integer, required) - ID del sitio

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Monumento X",
    "ciudad": "Medellín",
    "departamen": "Antioquia",
    "categoria": "Monumento",
    "objectid": 123,
    "geom": {...}
  }
}
```

**cURL:**
```bash
curl http://localhost:3000/api/sitios-turisticos/1
```

---

### GET /api/sitios-turisticos/categoria/:categoria
Obtener sitios turísticos por categoría.

**Parameters:**
- `categoria` (string, required) - Nombre de la categoría

**Response:**
```json
{
  "success": true,
  "total": 25,
  "categoria": "Museo",
  "data": [...]
}
```

**cURL:**
```bash
curl "http://localhost:3000/api/sitios-turisticos/categoria/Museo"
curl "http://localhost:3000/api/sitios-turisticos/categoria/Monumento"
```

---

### GET /api/sitios-turisticos/ciudad/:ciudad
Obtener sitios turísticos por ciudad.

**Parameters:**
- `ciudad` (string, required) - Nombre de la ciudad

**Response:**
```json
{
  "success": true,
  "total": 8,
  "ciudad": "Medellín",
  "data": [...]
}
```

**cURL:**
```bash
curl "http://localhost:3000/api/sitios-turisticos/ciudad/Medellín"
```

---

### GET /api/sitios-turisticos/:id/geojson
Obtener sitio turístico en GeoJSON.

**Response:**
```json
{
  "type": "Feature",
  "properties": {
    "nombre": "Monumento X",
    "ciudad": "Medellín",
    "departamento": "Antioquia",
    "categoria": "Monumento",
    "tipo": "sitio_turistico"
  },
  "geometry": {
    "type": "Point",
    "coordinates": [-74.0, 5.5]
  }
}
```

**cURL:**
```bash
curl http://localhost:3000/api/sitios-turisticos/1/geojson
```

---

## 📤 CAPAS GEOREFERENCIADAS - Subir nuevos datos

### POST /api/capas
Subir una nueva capa georeferenciada (GeoJSON).

**Content-Type:** multipart/form-data

**Form Fields:**
- `archivo` (file, required) - Archivo GeoJSON (.geojson o .json)
- `nombre` (string, required) - Nombre de la capa
- `descripcion` (string, optional) - Descripción

**Response:**
```json
{
  "success": true,
  "message": "Capa lista para procesar",
  "data": {
    "nombre": "mi-capa",
    "tipo": "geojson",
    "archivo": "mi-capa-1234567890.geojson",
    "features": 15,
    "bbox": {
      "minLon": -74.1,
      "minLat": 4.5,
      "maxLon": -73.9,
      "maxLat": 4.9
    }
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/api/capas \
  -F "archivo=@datos.geojson" \
  -F "nombre=Mi Capa GIS" \
  -F "descripcion=Datos de prueba"
```

**Ejemplo GeoJSON válido (datos.geojson):**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "nombre": "Punto 1",
        "valor": 100
      },
      "geometry": {
        "type": "Point",
        "coordinates": [-74.0, 5.5]
      }
    }
  ]
}
```

---

### POST /api/capas/validar
Validar un archivo GeoJSON antes de guardarlo (no se almacena).

**Content-Type:** multipart/form-data

**Form Fields:**
- `archivo` (file, required) - Archivo a validar

**Response (válido):**
```json
{
  "success": true,
  "valid": true,
  "message": "Archivo válido",
  "error": null
}
```

**Response (inválido):**
```json
{
  "success": false,
  "valid": false,
  "message": "Archivo inválido",
  "error": "Missing required 'type' field in GeoJSON"
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/api/capas/validar \
  -F "archivo=@datos.geojson"
```

---

### GET /api/capas
Listar todas las capas subidas.

**Response:**
```json
{
  "success": true,
  "total": 3,
  "data": [
    {
      "id": 1,
      "nombre": "Capa Prueba",
      "descripcion": "Datos de prueba",
      "tipo_archivo": "geojson",
      "bbox": {...},
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**cURL:**
```bash
curl http://localhost:3000/api/capas
```

---

### GET /api/capas/:id
Obtener detalles de una capa específica.

**Parameters:**
- `id` (integer, required) - ID de la capa

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Capa Prueba",
    "descripcion": "Datos de prueba",
    "tipo": "geojson",
    "geometria": {
      "type": "FeatureCollection",
      "features": [...]
    },
    "bbox": {...},
    "archivo": "capa-prueba-1234567890.geojson",
    "features": 15,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**cURL:**
```bash
curl http://localhost:3000/api/capas/1
```

---

### GET /api/capas/:id/geojson
Descargar una capa como GeoJSON puro.

**Response:**
```json
{
  "type": "FeatureCollection",
  "features": [...]
}
```

**cURL:**
```bash
curl http://localhost:3000/api/capas/1/geojson \
  -H "Accept: application/geo+json" \
  -o capa.geojson
```

---

## 🧪 Testing con cURL

### Probar conectividad
```bash
# Verificar que el servidor está corriendo
curl http://localhost:3000/api/departamentos

# Debe devolver la lista de 4 departamentos
```

### Flujo completo
```bash
# 1. Listar departamentos
curl http://localhost:3000/api/departamentos

# 2. Obtener municipios cercanos
curl "http://localhost:3000/api/municipios/cercanos?lat=4.7110&lon=-74.0069&radio=10000"

# 3. Descargar un municipio como GeoJSON
curl http://localhost:3000/api/municipios/1/geojson > municipio.geojson

# 4. Subir una capa nueva
curl -X POST http://localhost:3000/api/capas \
  -F "archivo=@municipio.geojson" \
  -F "nombre=Mi Municipio"

# 5. Verificar capas subidas
curl http://localhost:3000/api/capas
```

---

## ⚠️ Códigos de Error

| Código | Significado |
|--------|------------|
| 200 | OK - Solicitud exitosa |
| 201 | Created - Recurso creado |
| 400 | Bad Request - Parámetros inválidos |
| 404 | Not Found - Recurso no encontrado |
| 500 | Server Error - Error interno |

**Ejemplo de error:**
```json
{
  "error": "Municipio no encontrado"
}
```

---

## 📊 Formatos de respuesta

Todas las respuestas están en JSON. Para GeoJSON:
```bash
# Solicitar explícitamente GeoJSON
curl http://localhost:3000/api/municipios/1/geojson \
  -H "Accept: application/geo+json"
```

---

**¡Listo para consumir la API! 🎉**

---

## 🛰️ CAPAS SATELITALES - Imágenes de satélite

Acceso a múltiples proveedores de imágenes satelitales con diferentes resoluciones y coberturas.

### GET /api/satellite-layers
Obtener todas las capas satelitales disponibles (gratuitas y de pago).

**Response:**
```json
{
  "success": true,
  "total": 7,
  "data": [
    {
      "id": "esri_satellite",
      "name": "Esri World Imagery",
      "provider": "esri",
      "type": "raster",
      "url": "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      "attribution": "Tiles © Esri",
      "maxZoom": 18,
      "minZoom": 0,
      "description": "Imágenes satelitales mundiales de Esri con alta resolución",
      "requiresAuth": false
    },
    {
      "id": "osm_satellite",
      "name": "OpenStreetMap Satellite (USGS)",
      "provider": "usgs",
      "type": "raster",
      "url": "https://basemap.nationalmap.gov/arcgis/rest/services/USGSImagery/MapServer/tile/{z}/{y}/{x}",
      "attribution": "USGS",
      "maxZoom": 15,
      "minZoom": 1,
      "description": "Imágenes satelitales de USGS con cobertura global",
      "requiresAuth": false
    }
  ]
}
```

**cURL:**
```bash
curl http://localhost:3000/api/satellite-layers
```

---

### GET /api/satellite-layers/free
Obtener solo capas satelitales gratuitas (sin API key requerida).

**Response:**
```json
{
  "success": true,
  "total": 4,
  "data": [
    {
      "id": "esri_satellite",
      "name": "Esri World Imagery",
      "description": "Imágenes satelitales mundiales de Esri",
      "url": "..."
    },
    {
      "id": "osm_satellite",
      "name": "OpenStreetMap Satellite (USGS)",
      "description": "Imágenes satelitales de USGS",
      "url": "..."
    }
  ]
}
```

**cURL:**
```bash
curl http://localhost:3000/api/satellite-layers/free
```

---

### GET /api/satellite-layers/:layerId
Obtener información detallada de una capa satelital específica.

**Parameters:**
- `layerId` (string, required) - ID de la capa (esri_satellite, osm_satellite, google_satellite, sentinel_2, mapbox_satellite, gebco_bathymetry)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "esri_satellite",
    "name": "Esri World Imagery",
    "provider": "esri",
    "type": "raster",
    "url": "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    "attribution": "Tiles © Esri",
    "maxZoom": 18,
    "minZoom": 0,
    "description": "Imágenes satelitales mundiales de Esri con alta resolución",
    "requiresAuth": false,
    "coverage": {
      "global": true,
      "zoomLevels": "0-18",
      "resolution": "~1-10 metros"
    }
  }
}
```

**cURL:**
```bash
# Esri (recomendado para Colombia)
curl http://localhost:3000/api/satellite-layers/esri_satellite

# OpenStreetMap
curl http://localhost:3000/api/satellite-layers/osm_satellite

# Google Satellite
curl http://localhost:3000/api/satellite-layers/google_satellite
```

---

### GET /api/satellite-layers/recommended/:region
Obtener capas satelitales recomendadas para una región.

**Parameters:**
- `region` (string, optional) - Región (colombia, bogota). Default: colombia

**Response:**
```json
{
  "success": true,
  "data": {
    "region": "colombia",
    "primary": "esri_satellite",
    "alternatives": ["osm_satellite", "google_satellite"],
    "description": "Recomendado para Colombia: Esri World Imagery",
    "layers": {
      "primary": {
        "id": "esri_satellite",
        "name": "Esri World Imagery",
        "url": "..."
      },
      "alternatives": [
        {
          "id": "osm_satellite",
          "name": "OpenStreetMap Satellite (USGS)",
          "url": "..."
        }
      ]
    }
  }
}
```

**cURL:**
```bash
# Capas recomendadas para Colombia
curl http://localhost:3000/api/satellite-layers/recommended/colombia

# Capas recomendadas para Bogotá
curl http://localhost:3000/api/satellite-layers/recommended/bogota
```

---

### GET /api/satellite-layers/tile/:layerId/:z/:x/:y
Construir URL de tile para una capa satelital (para mapas web).

**Parameters:**
- `layerId` (string, required) - ID de la capa
- `z` (integer, required) - Nivel de zoom (0-20)
- `x` (integer, required) - Posición X del tile
- `y` (integer, required) - Posición Y del tile
- `apiKey` (query param, optional) - API key si es requerida

**Response:**
```json
{
  "success": true,
  "data": {
    "layerId": "esri_satellite",
    "tile": {
      "z": 10,
      "x": 250,
      "y": 400
    },
    "tileUrl": "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/10/400/250",
    "usage": "Usa esta URL como src en un <img> o como URL de tile en Leaflet/Mapbox"
  }
}
```

**cURL:**
```bash
# Tile de nivel 10, posición 250,400
curl "http://localhost:3000/api/satellite-layers/tile/esri_satellite/10/250/400"

# Usar con API key
curl "http://localhost:3000/api/satellite-layers/tile/mapbox_satellite/10/250/400?apiKey=tu_token"
```

---

### POST /api/satellite-layers/validate
Validar configuración de una capa satelital.

**Body:**
```json
{
  "id": "esri_satellite",
  "apiKey": "tu_api_key_opcional"
}
```

**Response (válido):**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "layer": {
      "id": "esri_satellite",
      "name": "Esri World Imagery",
      "requiresAuth": false
    },
    "warning": null,
    "message": "Configuración válida"
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/api/satellite-layers/validate \
  -H "Content-Type: application/json" \
  -d '{
    "id": "esri_satellite"
  }'

# Con API key para Mapbox
curl -X POST http://localhost:3000/api/satellite-layers/validate \
  -H "Content-Type: application/json" \
  -d '{
    "id": "mapbox_satellite",
    "apiKey": "pk.eyJ1IjoidHUidX..."
  }'
```

---

## 🗺️ Integración con Leaflet (Frontend Angular)

Ejemplo de uso en tu frontend:

```typescript
// Obtener capa recomendada
fetch('/api/satellite-layers/recommended/colombia')
  .then(res => res.json())
  .then(data => {
    const layer = data.data.layers.primary;
    L.tileLayer(layer.url, {
      attribution: layer.attribution,
      maxZoom: layer.maxZoom
    }).addTo(map);
  });
```

---

**¡Listo para consumir la API! 🎉**
