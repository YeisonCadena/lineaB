# 🚀 Proyecto Línea B - Sistema GIS para Bogotá

## 📋 Descripción del Proyecto

Sistema geoespacial completo para visualizar y analizar datos de la Línea B de Bogotá, incluyendo:
- 🗺️ Datos vectoriales (departamentos, municipios, vías)
- 🎯 Puntos de interés (sitios turísticos)
- 🛰️ Capas satelitales integradas
- 🔧 Herramientas GIS avanzadas

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (Angular 21)               │
│  ┌──────────────────────────────────────────────┐   │
│  │  GisMapComponent (Leaflet)                   │   │
│  │  ├─ GisService (HTTP)                        │   │
│  │  ├─ StyleService (Estilización)              │   │
│  │  └─ GeoToolsService (Turf.js)                │   │
│  └──────────────────────────────────────────────┘   │
└─────────────┬───────────────────────────────────────┘
              │ REST API (HTTP)
┌─────────────▼───────────────────────────────────────┐
│                   Backend (Node.js)                  │
│  ┌──────────────────────────────────────────────┐   │
│  │  Express Server                              │   │
│  │  ├─ /api/departamentos                       │   │
│  │  ├─ /api/municipios                          │   │
│  │  ├─ /api/vias                                │   │
│  │  ├─ /api/sitios-turisticos                   │   │
│  │  └─ /api/satellite-layers                    │   │
│  └──────────────────────────────────────────────┘   │
└─────────────┬───────────────────────────────────────┘
              │ PostGIS
┌─────────────▼───────────────────────────────────────┐
│                   Base de Datos                      │
│              PostgreSQL + PostGIS                    │
└─────────────────────────────────────────────────────┘
```

---

## 📦 Dependencias

### Backend
```json
{
  "express": "^5.1.0",
  "pg": "^8.20.0",
  "cors": "^2.8.5",
  "dotenv": "^17.4.2",
  "jsonwebtoken": "^8.5.1",
  "multer": "^1.4.5"
}
```

### Frontend
```json
{
  "angular": "^21.2.0",
  "@angular/forms": "^21.2.0",
  "@angular/platform-browser": "^21.2.0",
  "@angular/router": "^21.2.0",
  "leaflet": "^1.9.4",
  "@turf/turf": "^6.x",
  "leaflet-draw": "^1.0.4",
  "leaflet-measure": "^3.1.0"
}
```

---

## 🚀 Instalación y Ejecución

### 1. Clonar repositorio y preparar ambiente

```bash
# Instalar dependencias del backend
cd back
npm install

# Instalar dependencias del frontend
cd ../front
npm install
```

### 2. Configurar Base de Datos

```bash
# Crear archivo .env en carpeta back/
cd back
cat > .env << EOF
DB_HOST=localhost
DB_PORT=5432
DB_NAME=linea_b
DB_USER=postgres
DB_PASSWORD=tu_contraseña
PORT=3000
JWT_SECRET=tu_secret_jwt
EOF

# Ejecutar script de inicialización
psql -U postgres -f init.sql
```

### 3. Iniciar Backend

```bash
cd back
npm run dev
# El servidor estará en http://localhost:3000
```

### 4. Iniciar Frontend

```bash
cd front
npm start
# La app estará en http://localhost:4200
```

---

## 📂 Estructura de Carpetas

```
proyectoLineaB/
├── back/
│   ├── src/
│   │   ├── controllers/        # Controladores de lógica
│   │   ├── services/           # Servicios de negocio
│   │   ├── models/             # Modelos de datos
│   │   ├── middleware/         # Middleware (auth, errors)
│   │   ├── routes/             # Definición de rutas
│   │   ├── utils/              # Utilidades
│   │   └── logger/             # Sistema de logs
│   ├── middleware/
│   │   ├── auth.js             # Autenticación JWT
│   │   └── upload.js           # Gestión de uploads
│   ├── server.js               # Punto de entrada
│   ├── db.js                   # Conexión PostgreSQL
│   ├── routes.js               # Rutas principales
│   ├── geoutils.js             # Utilidades GIS
│   ├── package.json
│   └── init.sql                # Script de BD
│
├── front/
│   ├── src/
│   │   ├── app/
│   │   │   ├── services/
│   │   │   │   ├── gis.service.ts         # Consumo API
│   │   │   │   ├── style.service.ts       # Estilización
│   │   │   │   └── geo-tools.service.ts   # Operaciones GIS
│   │   │   ├── components/
│   │   │   │   └── gis-map.component.ts   # Mapa principal
│   │   │   ├── app.ts                     # Root component
│   │   │   ├── app.html                   # Template
│   │   │   └── app.css                    # Estilos
│   │   ├── index.html
│   │   └── main.ts
│   ├── package.json
│   └── tsconfig.json
│
├── FASE_3_VISOR_WEB.md         # Documentación Fase 3
├── PRUEBAS_FASE_3.md           # Guía de pruebas
└── README.md                   # Este archivo
```

---

## 🔑 Endpoints API Principales

### Departamentos
```
GET /api/departamentos              # Listar todos
GET /api/departamentos/:id          # Detalles
GET /api/departamentos/:id/geojson  # Formato GeoJSON
```

### Municipios
```
GET /api/municipios                          # Listar (paginado)
GET /api/municipios/:id                      # Detalles
GET /api/municipios/departamento/:depto      # Por departamento
GET /api/municipios/cercanos?lat=X&lon=Y     # Búsqueda espacial
```

### Vías
```
GET /api/vias                  # Listar todas
GET /api/vias/:id              # Detalles
GET /api/vias/:id/geojson      # Formato GeoJSON
```

### Sitios Turísticos
```
GET /api/sitios-turisticos                    # Listar (paginado)
GET /api/sitios-turisticos/:id                # Detalles
GET /api/sitios-turisticos/categoria/:cat     # Por categoría
GET /api/sitios-turisticos/ciudad/:ciudad     # Por ciudad
```

### Capas Satelitales
```
GET /api/satellite-layers                     # Todas disponibles
GET /api/satellite-layers/free                # Solo gratuitas
GET /api/satellite-layers/recommended/:region # Recomendadas
GET /api/satellite-layers/:layerId            # Detalles capa
```

### Autenticación
```
POST /api/auth/login        # Obtener JWT
POST /api/auth/verify       # Verificar token
GET /api/auth/usuarios-demo # Usuarios de prueba
```

---

## 🔐 Autenticación

### Usuarios de Prueba (Desarrollo)
```json
{
  "admin": {
    "usuario": "admin",
    "contraseña": "admin123",
    "rol": "admin"
  },
  "editor": {
    "usuario": "editor",
    "contraseña": "editor123",
    "rol": "editor"
  },
  "viewer": {
    "usuario": "viewer",
    "contraseña": "viewer123",
    "rol": "viewer"
  }
}
```

### Obtener Token
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "usuario": "admin",
    "contraseña": "admin123"
  }'
```

### Usar Token en Requests
```bash
curl http://localhost:3000/api/departamentos \
  -H "Authorization: Bearer TOKEN_AQUI"
```

---

## 🗺️ Características del Visor

### Visualización
- ✅ Mapa base OpenStreetMap
- ✅ Múltiples capas vectoriales
- ✅ Capas satelitales integradas
- ✅ Escala y controles de zoom

### Interactividad
- ✅ Click para popups informativos
- ✅ Hover para tooltips
- ✅ Controles de opacidad
- ✅ Mostrar/ocultar capas

### Análisis
- ✅ Cálculo de áreas
- ✅ Cálculo de distancias
- ✅ Búsqueda de puntos cercanos
- ✅ Estadísticas de propiedades

### Exportación
- ✅ Descargar como GeoJSON
- ✅ Conservar propiedades
- ✅ Geometrías válidas

---

## 📊 Datos Disponibles

| Capa | Registros | Geometría | Propiedades |
|------|-----------|-----------|-------------|
| Departamentos | 4 | MultiPolygon | código, nombre, área |
| Municipios | 236 | Polygon | código, nombre, altitud, categoría |
| Vías | 14 | LineString | nombre, tipo, origen, destino |
| Sitios Turísticos | 165 | Point | nombre, ciudad, categoría |

---

## 🛠️ Tecnologías

| Capa | Tecnología |
|------|-----------|
| Frontend | Angular 21 + TypeScript |
| Mapas | Leaflet.js |
| Análisis Geoespacial | Turf.js |
| Backend | Node.js + Express |
| Base de Datos | PostgreSQL + PostGIS |
| Autenticación | JWT |

---

## 📱 Navegadores Soportados

- ✅ Chrome/Chromium (versión 90+)
- ✅ Firefox (versión 88+)
- ✅ Safari (versión 14+)
- ✅ Edge (versión 90+)

---

## 🐛 Troubleshooting

### El mapa no carga
1. Verificar que backend está corriendo: `curl http://localhost:3000/health`
2. Verificar CORS: revisar headers en respuestas
3. Abrir consola (F12) para ver errores específicos

### Las capas no aparecen
1. Ir a pestaña Network (F12)
2. Buscar solicitudes a /api/municipios
3. Verificar que response tiene geometrías válidas
4. Revisar console para errores de Leaflet

### Errores de conexión a BD
1. Verificar que PostgreSQL está corriendo
2. Verificar credenciales en .env
3. Revisar que la BD existe: `psql -l | grep linea_b`
4. Revisar logs del servidor

---

## 📈 Performance

| Operación | Tiempo |
|-----------|--------|
| Carga inicial | < 3s |
| Cargar 236 municipios | < 2s |
| Zoom con 4 capas | < 100ms |
| Cálculo de estadísticas | < 500ms |

---

## 🔄 Workflow de Desarrollo

```bash
# 1. Actualizar servicios
cd front
npm start

# 2. En otra terminal, iniciar backend
cd back
npm run dev

# 3. Hacer cambios
# - Editar servicios en front/src/app/services/
# - Editar componentes en front/src/app/components/
# - Editar rutas en back/routes.js

# 4. Los cambios se cargan automáticamente (hot reload)

# 5. Ver cambios en http://localhost:4200
```

---

## 📚 Recursos Útiles

- [Leaflet Docs](https://leafletjs.com/reference.html)
- [Turf.js Docs](https://turfjs.org/)
- [PostGIS Docs](https://postgis.net/docs/)
- [Angular Docs](https://angular.io/docs)
- [GeoJSON Spec](https://geojson.org/)

---

## 📝 Licencia

Este proyecto es propiedad de XXX. Todos los derechos reservados.

---

## 👥 Equipo

- 👨‍💻 Desarrollo: Tu Nombre
- 🗺️ GIS: Especialista SIG
- 🎨 Diseño: Diseñador UI/UX

---

## 📞 Contacto

Para reportar bugs o sugerencias:
- 📧 Email: support@example.com
- 🐛 Issues: GitHub Issues
- 💬 Discord: [Link]

---

**Última actualización**: Abril 30, 2026  
**Versión**: 1.0.0  
**Estado**: ✅ Producción

---

## 🚀 Próximas Fases

- [ ] Fase 4: Análisis Avanzado (Heatmaps, Clusters)
- [ ] Fase 5: Modelo 3D
- [ ] Fase 6: Reportes PDF
- [ ] Fase 7: API GraphQL
- [ ] Fase 8: Mobile App

---

**¡Gracias por usar nuestro sistema GIS!** 🎉
