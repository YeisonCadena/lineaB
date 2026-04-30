# ⚡ Quick Start - Línea B GIS

## 1️⃣ Preparar Base de Datos (Si es primera vez)

```bash
# En psql o pgAdmin
cd back
psql -U postgres < init.sql
```

## 2️⃣ Iniciar Backend

```bash
cd back
npm install  # Solo si es primera vez
npm run dev
```

**Expected Output:**
```
🚀 Servidor ejecutándose en http://localhost:3000
📊 Base de datos: linea_b
```

## 3️⃣ Iniciar Frontend (en otra terminal)

```bash
cd front
npm install  # Solo si es primera vez
npm start
```

**Expected Output:**
```
✔ Compiled successfully
Local: http://localhost:4200/
```

## 4️⃣ Abrir en navegador

```
http://localhost:4200
```

---

## 📋 Verificar que todo funciona

### Backend
```bash
curl http://localhost:3000/health
# Response: {"status": "API funcionando correctamente"}
```

### Frontend
- ✅ Mapa visible
- ✅ Departamentos cargados (azul)
- ✅ Municipios cargados (verde)
- ✅ Vías cargadas (rojo)

---

## 🎮 Primeras Acciones

### 1. Ver información de un municipio
1. Click en botón "🗺️ Capas"
2. Asegurar que "Municipios" está checked
3. Click en cualquier polígono verde
4. Ver popup con información

### 2. Cargar capa satelital
1. Click en "🗺️ Capas"
2. Click en "Cargar Satélite"
3. Fondo debe cambiar a imagen satelital

### 3. Exportar datos
1. Click en "🔧 Herramientas"
2. Click en "Exportar GeoJSON"
3. Archivo "export.geojson" se descarga

### 4. Ver estadísticas
1. Click en "🔧 Herramientas"
2. Click en "Calcular Estadísticas"
3. Alert muestra altitud promedio

---

## 🔧 Configuración Común

### Cambiar puerto backend
```bash
# En back/.env
PORT=3001
```

### Cambiar URL API
```typescript
// En front/src/app/services/gis.service.ts
private apiUrl = 'http://localhost:3000/api';  // Cambiar aquí
```

### Agregar más capas
```typescript
// En front/src/app/components/gis-map.component.ts
// En loadLayers()
layersConfig.push({
  id: 'nueva-capa',
  name: 'Mi Capa',
  type: 'vector',
  visible: true,
  opacity: 0.7
});
```

---

## 🐛 Problemas Comunes

| Error | Solución |
|-------|----------|
| `Cannot GET /` | Frontend no está compilado. Ejecutar `npm start` |
| `API Error 500` | Backend no tiene DB. Ejecutar `init.sql` |
| `CORS Error` | Backend no tiene CORS habilitado. Revisar `server.js` |
| `Mapa en blanco` | Browser console tiene errores. Ver F12 |

---

## 📚 Documentación Completa

- 📖 [Documentación Fase 3](./FASE_3_VISOR_WEB.md)
- 🧪 [Guía de Pruebas](./PRUEBAS_FASE_3.md)
- 📘 [README Completo](./README_COMPLETO.md)
- 🛠️ [Endpoints API](./back/ENDPOINTS.md)
- 🛰️ [Capas Satelitales](./back/SATELLITE_LAYERS_TEST.md)

---

## 🚀 Siguientes Pasos

1. ✅ Mapa funcionando → Explorar datos
2. ✅ Datos explorados → Personalizar estilos
3. ✅ Estilos personalizados → Agregar herramientas
4. ✅ Herramientas agregadas → Desplegar a producción

---

## 💡 Tips

- 🖱️ Usa Ctrl + Click para seleccionar múltiples features
- ⌨️ Usa letra 'M' para cambiar modo medición
- 🔍 Usa rueda del mouse para zoom
- 📍 Arrastra el mapa para panear

---

**¡Listo! Ahora tienes un visor GIS funcional. Explora los datos.** 🗺️

Para más información, ve a [README_COMPLETO.md](./README_COMPLETO.md)
