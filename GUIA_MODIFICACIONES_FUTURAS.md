# 🔄 Guía de Modificaciones Futuras

## Estructura Actual

```
Componentes/Servicios → Signals → Computed → Template
     ↓
   RxJS Observables
     ↓
    API REST (Backend)
```

---

## ✏️ Cómo Modificar Componentes

### 1. Agregar Nueva Capa Vectorial

**Backend** (`back/routes.js`):
```javascript
router.get('/api/mi-capa', async (req, res) => {
  try {
    const result = await query(`
      SELECT id, nombre, ST_AsGeoJSON(geom) as geom
      FROM mi_tabla
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

**Frontend - Servicio** (`gis.service.ts`):
```typescript
getMiCapa(): Observable<GeoFeature[]> {
  return this.http.get<LayerData>(`${this.apiUrl}/mi-capa`).pipe(
    map(res => this.parseGeoFeatures(res.data)),
    catchError(err => this.handleError(err))
  );
}
```

**Frontend - Componente** (`gis-map.component.ts`):
```typescript
// En loadLayers():
layersConfig.push({
  id: 'mi-capa',
  name: 'Mi Capa',
  type: 'vector',
  visible: false,
  opacity: 0.7,
  data: []
});

// Cargar datos:
this.gisService.getMiCapa().subscribe(data => {
  this.addLayerData('mi-capa', data);
});
```

---

### 2. Cambiar Estilos de Capa

**`style.service.ts`:**

En `getDynamicStyle()`:
```typescript
case 'mi-capa':
  // Personalizar estilo
  if (feature.properties?.status === 'activo') {
    return { ...baseStyle, fillColor: '#27ae60', weight: 3 };
  }
  return baseStyle;
```

En `getRelevantProps()`:
```typescript
case 'mi-capa':
  return ['propiedad1', 'propiedad2', 'propiedad3'];
```

---

### 3. Agregar Operación GIS

**`geo-tools.service.ts`:**

```typescript
/**
 * Nueva operación personalizada
 */
miNuevaOperacion(feature: any): any {
  try {
    // Usar Turf.js
    const resultado = turf.turf_operation(feature);
    return resultado;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}
```

**Usar en componente:**
```typescript
// En algún método del componente
const resultado = this.geoToolsService.miNuevaOperacion(feature);
```

---

### 4. Cambiar Mapa Base

**`gis-map.component.ts` - en `initializeMap()`:**

```typescript
// Cambiar de OpenStreetMap a otro proveedor:

// Opción 1: Satellite (Esri)
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: '© Esri',
  maxZoom: 18
}).addTo(this.map);

// Opción 2: Stamen TonerLite
L.tileLayer('http://tile.stamen.com/toner-lite/{z}/{x}/{y}.png', {
  attribution: '© Stamen',
  maxZoom: 20
}).addTo(this.map);

// Opción 3: CartoDB
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '© CartoDB',
  maxZoom: 20
}).addTo(this.map);
```

---

### 5. Modificar Popup

**`style.service.ts` - en `createPopup()`:**

```typescript
private createPopup(feature: any, type: string): string {
  const props = feature.properties;
  let html = `<div class="popup-content">`;
  
  // Agregar contenido personalizado
  html += `<img src="${props.imagen_url}" style="width:100%; max-width:200px;"><br>`;
  html += `<a href="${props.link}" target="_blank">Ver más</a><br>`;
  
  // ... resto del popup
  
  return html;
}
```

---

### 6. Agregar Nuevo Signal

**En componente:**

```typescript
// Crear signal
nuevoEstado = signal<any>(null);

// Usar computed
derivado = computed(() => {
  return this.nuevoEstado() ? this.nuevoEstado().propiedad : '';
});

// En template:
// {{ derivado() }}

// Actualizar:
this.nuevoEstado.set(nuevoValor);
```

---

## 🔍 Debugging Tips

### 1. Inspeccionar Datos en Consola
```javascript
// En browser console (F12)
ng.probe($0).componentInstance.layers()  // Ver capas

ng.probe($0).injector.get(GisService)    // Acceder al servicio

L.geoJson().addTo(map)                   // Agregar GeoJSON manualmente
```

### 2. Ver Requests HTTP
1. Abrir DevTools (F12)
2. Ir a Network
3. Buscar `/api/` requests
4. Ver response en tab "Response"

### 3. Inspeccionar Features Leaflet
```javascript
// En console
map.eachLayer(layer => {
  if (layer.toGeoJSON) {
    console.log(layer.toGeoJSON());
  }
});
```

### 4. Probar GeoJSON
```javascript
// En console
const geojson = { type: 'Feature', geometry: {...}, properties: {...} };
L.geoJson(geojson).addTo(map);
```

---

## 📝 Patrones Comunes

### Patrón 1: Cargar Datos Condicionales
```typescript
if (this.selectedRegion()) {
  this.gisService.getDatos(this.selectedRegion()).subscribe(data => {
    this.updateLayer(data);
  });
}
```

### Patrón 2: Transformar Datos
```typescript
const transformed = data.map(item => ({
  ...item,
  geometry: this.geoToolsService.simplifyGeometry(item)
}));
```

### Patrón 3: Manejo de Errores
```typescript
this.gisService.getData().subscribe({
  next: (data) => {
    // Éxito
  },
  error: (err) => {
    console.error('Error:', err);
    // Mostrar notificación
  },
  complete: () => {
    console.log('Completado');
  }
});
```

---

## 🎨 Cambiar Colores

**`style.service.ts`:**

```typescript
private stylePresets = {
  mi-capa: {
    color: '#2c3e50',      // Borde
    fillColor: '#3498db',  // Relleno
    weight: 2,             // Grosor línea
    opacity: 0.8,          // Opacidad borde
    fillOpacity: 0.5       // Opacidad relleno
  }
};
```

**Paleta útil:**
```
Azul: #3498db
Verde: #2ecc71
Rojo: #e74c3c
Naranja: #f39c12
Morado: #9b59b6
Gris: #95a5a6
```

---

## 🔒 Cambiar Rutas Protegidas

**Backend:**
```typescript
// Proteger ruta con JWT
router.post('/ruta-protegida', verifyToken, (req, res) => {
  // Solo usuarios autenticados pueden acceder
});
```

**Frontend:**
```typescript
// El servicio automáticamente envía token si existe
this.gisService.getMiCapa().subscribe(data => {
  // El servicio agregó Authorization header
});
```

---

## 📦 Agregar Librería Externa

```bash
# Instalar
cd front
npm install nombre-libreria

# Importar en componente
import { Libreria } from 'nombre-libreria';

// O en servicio
import * as turf from '@turf/turf';

// Usar
const resultado = Libreria.metodo();
```

---

## 🚀 Deploy a Producción

### Backend
```bash
# Build
npm run build

# Crear .env con valores de producción
DB_HOST=db.ejemplo.com
DB_NAME=linea_b_prod
PORT=3000

# Ejecutar
npm start
```

### Frontend
```bash
# Build para producción
ng build --configuration production

# Servir archivos estáticos desde nginx/apache
# O desde Node.js server

# Cambiar URL API en gis.service.ts
private apiUrl = 'https://api.ejemplo.com/api';
```

---

## 🧪 Pruebas de Cambios

Después de modificar:

1. **Verificar compilación** sin errores
2. **Probar en navegador** (F12 console limpia)
3. **Revisar Network tab** (requests correctas)
4. **Validar visualmente** (mapa renderiza bien)
5. **Probar interactividad** (click, hover, etc.)

---

## 📚 Referencias

- **Leaflet API**: https://leafletjs.com/reference.html
- **Turf.js API**: https://turfjs.org/docs
- **PostGIS**: https://postgis.net/docs
- **GeoJSON**: https://geojson.org/
- **Angular**: https://angular.io/docs

---

## 💡 Mejores Prácticas

✅ Mantener servicios puros (sin side effects)
✅ Usar signals para estado reactivo
✅ Documentar nuevas operaciones GIS
✅ Validar GeoJSON antes de usar
✅ Manejo de errores en cada operación
✅ Usar constantes para URLs/colores
✅ Pruebas antes de producción

---

**Última actualización**: Abril 30, 2026
