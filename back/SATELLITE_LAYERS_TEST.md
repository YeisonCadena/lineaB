# 🛰️ Prueba Rápida - Capas Satelitales

## Pasos para probar

### 1. Iniciar el servidor
```powershell
npm run dev
```

### 2. Probar los endpoints

#### Listar todas las capas disponibles
```bash
curl http://localhost:3000/api/satellite-layers
```

#### Obtener solo capas gratuitas
```bash
curl http://localhost:3000/api/satellite-layers/free
```

#### Capas recomendadas para Colombia
```bash
curl http://localhost:3000/api/satellite-layers/recommended/colombia
```

#### Detalles de una capa específica (Esri - recomendado)
```bash
curl http://localhost:3000/api/satellite-layers/esri_satellite
```

#### Obtener URL de un tile específico
```bash
curl "http://localhost:3000/api/satellite-layers/tile/esri_satellite/10/250/400"
```

#### Validar configuración de capa
```bash
curl -X POST http://localhost:3000/api/satellite-layers/validate \
  -H "Content-Type: application/json" \
  -d '{"id":"esri_satellite"}'
```

### 3. En Postman

Importa estas solicitudes en Postman:

| Método | URL | Descripción |
|--------|-----|-------------|
| GET | http://localhost:3000/api/satellite-layers | Todas las capas |
| GET | http://localhost:3000/api/satellite-layers/free | Capas gratuitas |
| GET | http://localhost:3000/api/satellite-layers/recommended/colombia | Recomendadas para Colombia |
| GET | http://localhost:3000/api/satellite-layers/esri_satellite | Info de capa Esri |
| GET | http://localhost:3000/api/satellite-layers/tile/esri_satellite/10/250/400 | URL de tile |
| POST | http://localhost:3000/api/satellite-layers/validate | Validar configuración |

## Capas disponibles

| ID | Nombre | Proveedor | Gratuito | Resolución |
|----|--------|-----------|----------|-----------|
| esri_satellite | Esri World Imagery | Esri | ✅ | 1-10m |
| osm_satellite | OpenStreetMap Satellite | USGS | ✅ | 30m |
| google_satellite | Google Satellite | Google | ✅ | 1-5m |
| sentinel_2 | Copernicus Sentinel-2 | ESA | ❌ | 10m |
| mapbox_satellite | Mapbox Satellite | Mapbox | ❌ | 1-30m |
| gebco_bathymetry | GEBCO Bathymetry | GEBCO | ✅ | 900m |

## Recomendaciones

- **Para Colombia**: Usa `esri_satellite` - mejor relación calidad/resolución
- **Alternativa gratuita**: `osm_satellite` o `google_satellite`
- **Para análisis marino**: `gebco_bathymetry`

## Integración en el frontend

Una vez probado, integra en tu componente Angular:

```typescript
// En tu componente de mapa
loadSatelliteLayer() {
  fetch('/api/satellite-layers/recommended/colombia')
    .then(res => res.json())
    .then(data => {
      console.log('Capa recomendada:', data.data.layers.primary);
      this.satelliteLayer = data.data.layers.primary;
    })
    .catch(err => console.error('Error:', err));
}
```

## Troubleshooting

Si ves errores:
1. Verifica que el servidor está corriendo: `npm run dev`
2. Confirma que los puertos están correctos (3000)
3. Revisa la consola del servidor para errores
4. Intenta sin CORS (desde el mismo localhost)
