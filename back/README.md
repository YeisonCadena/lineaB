# 🚀 Configuración API PostgreSQL + PostGIS - Línea B

Tu API está lista para conectarse a PostgreSQL con PostGIS. Aquí está lo que se configuró:

## 📁 Estructura de archivos creados

```
back/
├── server.js           # Servidor Express principal
├── db.js              # Configuración y pool de conexión a PostgreSQL
├── routes.js          # Rutas CRUD para estaciones y operaciones geográficas
├── .env               # Variables de entorno (⚠️ Editar con tus credenciales)
├── init.sql           # Script SQL para crear tablas e insertar datos
├── package.json       # Actualizado con dependencias necesarias
└── POSTGIS_SETUP.md   # Guía completa de configuración
```

## ⚙️ Pasos siguientes

### 1️⃣ Configurar PostgreSQL
```bash
# Abre pgAdmin o psql y ejecuta:
CREATE DATABASE linea_b;

# Luego conecta a esa BD y ejecuta:
CREATE EXTENSION postgis;
CREATE EXTENSION postgis_topology;

# Verifica la instalación:
SELECT PostGIS_version();
```

### 2️⃣ Editar archivo `.env`
Abre `back/.env` y actualiza con tus credenciales:
```
DB_HOST=localhost          # Tu servidor PostgreSQL
DB_PORT=5432              # Puerto (por defecto 5432)
DB_NAME=linea_b           # Nombre de tu BD
DB_USER=postgres          # Tu usuario
DB_PASSWORD=tu_contraseña # Tu contraseña
DB_SSL=false              # true si usas conexión remota
```

### 3️⃣ Inicializar base de datos
```bash
# Opción A: Usando pgAdmin
# - Abre pgAdmin
# - Haz clic derecho en tu BD "linea_b"
# - Tools > Query Tool
# - Copia todo el contenido de: back/init.sql
# - Ejecuta (F5)

# Opción B: Usando terminal
psql -U postgres -d linea_b -f back/init.sql
```

### 4️⃣ Iniciar el servidor
```bash
cd back

# Modo desarrollo (auto-reinicio con cambios)
npm run dev

# Modo producción
npm start
```

## 🔌 Endpoints disponibles

### Salud de la API
```bash
GET http://localhost:3000/health
```

### Gestión de Estaciones
```bash
# Obtener todas las estaciones
GET http://localhost:3000/api/estaciones

# Crear nueva estación
POST http://localhost:3000/api/estaciones
Content-Type: application/json
{
  "nombre": "Nueva Estación",
  "lat": 4.7210,
  "lon": -74.0280
}

# Obtener estaciones cercanas (radio en metros)
GET http://localhost:3000/api/estaciones/cercanas?lat=4.7210&lon=-74.0280&radio=2000

# Actualizar estación
PUT http://localhost:3000/api/estaciones/:id
{
  "nombre": "Nombre Actualizado",
  "lat": 4.7210,
  "lon": -74.0280
}

# Eliminar estación
DELETE http://localhost:3000/api/estaciones/:id

# Ver área de cobertura
GET http://localhost:3000/api/estaciones/cobertura
```

## 📊 Verificación de PostGIS
```bash
# En tu navegador o Postman
GET http://localhost:3000/postgis-version
GET http://localhost:3000/geo-example
```

## 💾 Funcionalidades geográficas implementadas

✅ **Crear estaciones** con coordenadas (lat/lon)  
✅ **Calcular distancias** entre puntos  
✅ **Buscar estaciones cercanas** dentro de un radio  
✅ **Exportar en GeoJSON** para visualización en mapas  
✅ **Crear rutas** como líneas geográficas  
✅ **Calcular área de cobertura** con convex hull  

## 🗺️ Integración con mapas (próximo paso)

Para visualizar los datos en un mapa interactivo, puedes usar:
- **Leaflet** + GeoJSON
- **Mapbox GL JS**
- **Google Maps API**
- **OpenStreetMap**

## 📝 Notas importantes

- El SRID utilizado es **4326** (WGS84 - estándar GPS)
- Todos los puntos se almacenan en formato `GEOMETRY(Point, 4326)`
- Las distancias se calculan en **metros**
- Los índices GIST optimizan las consultas espaciales

## ❓ Problemas frecuentes

Si PostGIS no se detecta:
```sql
-- Verifica en pgAdmin:
SELECT * FROM pg_available_extensions WHERE name LIKE 'postgis%';

-- Si está disponible pero no instalada:
CREATE EXTENSION postgis;
```

Si hay errores de conexión:
- Verifica que PostgreSQL está corriendo
- Comprueba credenciales en `.env`
- Revisa el firewall/puerto 5432

## 📚 Referencias útiles

- [Documentación PostGIS](https://postgis.net/documentation/)
- [Funciones geográficas](https://postgis.net/docs/PostGIS_Manual.html)
- [GeoJSON spec](https://geojson.org/)
- [Express.js docs](https://expressjs.com/)

---

**¡Tu API está lista! 🚀** Ejecuta `npm run dev` en la carpeta `back` y comienza a trabajar con datos geográficos.
