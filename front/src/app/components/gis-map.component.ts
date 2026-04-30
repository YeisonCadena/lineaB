import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  signal,
  computed,
  effect,
  PLATFORM_ID,
  inject,
  NgZone
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { GisService, GeoFeature } from '../services/gis.service';
import { StyleService, StyleConfig } from '../services/style.service';
import { GeoToolsService } from '../services/geo-tools.service';
import { LeafletLoaderService } from '../services/leaflet-loader.service';

// Declare L as any type - will be imported dynamically in browser
let L: any;

interface MapLayer {
  id: string;
  name: string;
  type: 'vector' | 'raster' | 'satellite';
  visible: boolean;
  layer?: L.GeoJSON | L.TileLayer;
  data?: GeoFeature[];
  opacity: number;
}

@Component({
  selector: 'app-gis-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-container">
      <div #mapElement class="map-element"></div>
      <div class="map-controls">
        <div class="control-group">
          <button (click)="toggleLayerPanel()" class="btn-control">🗺️ Capas</button>
          <button (click)="toggleLegend()" class="btn-control">📋 Leyenda</button>
          <button (click)="toggleTools()" class="btn-control">🔧 Herramientas</button>
          <button (click)="fitBounds()" class="btn-control">📍 Ajustar</button>
        </div>
      </div>

      <!-- Panel de Capas -->
      <div *ngIf="showLayerPanel()" class="panel layer-panel">
        <h3>Capas Disponibles</h3>
        <div class="layer-list">
          <div *ngFor="let layer of layers()" class="layer-item">
            <input
              type="checkbox"
              [checked]="layer.visible"
              (change)="toggleLayer(layer)"
              [id]="'layer-' + layer.id"
            />
            <label [for]="'layer-' + layer.id">{{ layer.name }}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              [value]="layer.opacity"
              (change)="setLayerOpacity(layer, $event)"
              class="opacity-slider"
            />
          </div>
        </div>
        <button (click)="loadSatelliteLayer()" class="btn-load">Cargar Satélite</button>
      </div>

      <!-- Leyenda -->
      <div *ngIf="showLegend()" class="panel legend-panel">
        <h3>Leyenda</h3>
        <div class="legend-content" [innerHTML]="legendHTML()"></div>
      </div>

      <!-- Panel de Herramientas -->
      <div *ngIf="showTools()" class="panel tools-panel">
        <h3>Herramientas GIS</h3>
        <div class="tools-group">
          <button (click)="activateDrawing('polygon')" class="btn-tool">Dibujar Polígono</button>
          <button (click)="activateDrawing('linestring')" class="btn-tool">Dibujar Línea</button>
          <button (click)="activateDrawing('point')" class="btn-tool">Dibujar Punto</button>
          <button (click)="clearDrawings()" class="btn-tool btn-danger">Limpiar</button>
        </div>
        <hr />
        <div class="tools-group">
          <button (click)="exportData()" class="btn-tool">Exportar GeoJSON</button>
          <button (click)="calculateStats()" class="btn-tool">Calcular Estadísticas</button>
        </div>
      </div>

      <!-- Indicador de carga -->
      <div *ngIf="isLoading()" class="loading-indicator">
        <div class="spinner"></div>
        <p>Cargando datos...</p>
      </div>
    </div>
  `,
  styles: [`
    .map-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      z-index: 1;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #e5e3df;
    }

    .map-element {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #e5e3df;
      z-index: 0;
    }

    .map-controls {
      position: absolute;
      bottom: 30px;
      left: 30px;
      z-index: 1000;
      background: white;
      padding: 15px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .control-group {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .btn-control {
      padding: 10px 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
      white-space: nowrap;
    }

    .btn-control:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
      background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
    }

    .btn-control:active {
      transform: translateY(0);
    }

    .panel {
      position: absolute;
      top: 30px;
      right: 30px;
      background: white;
      border-radius: 12px;
      padding: 20px;
      max-width: 320px;
      max-height: 75vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      z-index: 999;
      border: 1px solid #ecf0f1;
      animation: slideInRight 0.3s ease;
    }

    @keyframes slideInRight {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .panel h3 {
      margin: 0 0 15px 0;
      font-size: 16px;
      font-weight: 700;
      color: #2c3e50;
      border-bottom: 2px solid #667eea;
      padding-bottom: 10px;
    }

    .layer-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .layer-item {
      display: grid;
      grid-template-columns: 20px 1fr 60px;
      align-items: center;
      gap: 10px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
      font-size: 13px;
      transition: all 0.2s;
    }

    .layer-item:hover {
      background: #ecf0f1;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .layer-item input[type="checkbox"] {
      cursor: pointer;
      width: 18px;
      height: 18px;
      accent-color: #667eea;
    }

    .layer-item label {
      cursor: pointer;
      font-weight: 600;
      color: #2c3e50;
    }

    .opacity-slider {
      width: 100%;
      height: 5px;
      cursor: pointer;
      accent-color: #667eea;
      -webkit-appearance: none;
      appearance: none;
      background: #ecf0f1;
      border-radius: 3px;
    }

    .opacity-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #667eea;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(102, 126, 234, 0.3);
    }

    .opacity-slider::-moz-range-thumb {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #667eea;
      cursor: pointer;
      border: none;
      box-shadow: 0 2px 6px rgba(102, 126, 234, 0.3);
    }

    .btn-load {
      width: 100%;
      padding: 11px;
      margin-top: 15px;
      background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      transition: all 0.3s;
      box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3);
    }

    .btn-load:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(39, 174, 96, 0.4);
    }

    .legend-content {
      font-size: 13px;
      color: #2c3e50;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
      padding: 8px;
      background: #f8f9fa;
      border-radius: 6px;
    }

    .legend-color {
      display: inline-block;
      min-width: 20px;
      height: 20px;
      border-radius: 4px;
      border: 1px solid #ccc;
    }

    .tools-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .btn-tool {
      padding: 11px;
      background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      transition: all 0.3s;
      box-shadow: 0 4px 15px rgba(155, 89, 182, 0.3);
    }

    .btn-tool:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(155, 89, 182, 0.4);
    }

    .btn-tool.btn-danger {
      background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
      box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
    }

    .btn-tool.btn-danger:hover {
      box-shadow: 0 8px 25px rgba(231, 76, 60, 0.4);
    }

    .loading-indicator {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(44, 62, 80, 0.95);
      color: white;
      padding: 40px;
      border-radius: 16px;
      text-align: center;
      z-index: 2000;
      backdrop-filter: blur(10px);
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
    }

    .loading-indicator p {
      margin-top: 15px;
      font-size: 14px;
      font-weight: 500;
    }

    .spinner {
      border: 4px solid rgba(255, 255, 255, 0.2);
      border-top: 4px solid #667eea;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 0.8s linear infinite;
      margin: 0 auto;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    hr {
      margin: 15px 0;
      border: none;
      border-top: 1px solid #ecf0f1;
    }

    /* Scrollbar styling */
    .panel::-webkit-scrollbar {
      width: 6px;
    }

    .panel::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 10px;
    }

    .panel::-webkit-scrollbar-thumb {
      background: #667eea;
      border-radius: 10px;
    }

    .panel::-webkit-scrollbar-thumb:hover {
      background: #764ba2;
    }

    @media (max-width: 768px) {
      .map-controls {
        bottom: 15px;
        left: 15px;
      }

      .panel {
        top: 15px;
        right: 15px;
        max-width: 280px;
        max-height: 60vh;
      }

      .btn-control {
        padding: 8px 12px;
        font-size: 12px;
      }
    }
  `]
})
export class GisMapComponent implements OnInit, AfterViewInit {
  @ViewChild('mapElement', { static: false }) mapElement!: ElementRef;

  private map!: L.Map;
  private drawnItems: any;
  private isInitialized = false;
  private platformId = inject(PLATFORM_ID);

  // Signals
  layers = signal<MapLayer[]>([]);
  showLayerPanel = signal(false);
  showLegend = signal(false);
  showTools = signal(false);
  legendHTML = signal('');
  isLoading = signal(false);
  selectedLayer = signal<MapLayer | null>(null);

  // Computed
  visibleLayers = computed(() => this.layers().filter(l => l.visible));

  constructor(
    private gisService: GisService,
    private styleService: StyleService,
    private geoToolsService: GeoToolsService,
    private leafletLoader: LeafletLoaderService
  ) {
    // Efecto: actualizar leyenda cuando cambian capas
    effect(() => {
      if (this.visibleLayers().length > 0) {
        this.updateLegend();
      }
    });
  }

  ngOnInit(): void {
    // Solo inicializar en el navegador (no en SSR)
    if (isPlatformBrowser(this.platformId)) {
      // Load Leaflet dynamically
      this.leafletLoader.loadLeaflet().then((leaflet) => {
        L = leaflet;
        // Make L available to services
        (window as any).L = L;
      }).catch(err => console.error('Error loading Leaflet:', err));
    }
  }

  ngAfterViewInit(): void {
    // Initialize map after view is fully rendered
    if (isPlatformBrowser(this.platformId) && !this.isInitialized && this.mapElement) {
      setTimeout(() => {
        try {
          this.isInitialized = true;
          
          // Create map with OSM tiles
          this.map = L.map(this.mapElement.nativeElement, {
            preferCanvas: true
          }).setView([4.5, -74.3], 5);

          // Add OSM tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
            minZoom: 2
          }).addTo(this.map);

          // Add scale control
          L.control.scale({ position: 'bottomleft' }).addTo(this.map);

          // Invalidate size
          this.map.invalidateSize();

          // Load GIS layers
          this.loadLayers();
        } catch (err) {
          console.error('Error initializing map:', err);
        }
      }, 100);
    }
  }

  /**
   * Inicializar mapa de Leaflet (ya no se usa - inicialización inline en ngAfterViewInit)
   */
  private initializeMap(): void {
    // Map is now initialized inline in ngAfterViewInit
  }

  /**
   * Cargar capas disponibles
   */
  private loadLayers(): void {
    this.isLoading.set(true);

    const layersConfig: MapLayer[] = [
      {
        id: 'departamentos',
        name: 'Departamentos',
        type: 'vector',
        visible: true,
        opacity: 0.7,
        data: []
      },
      {
        id: 'municipios',
        name: 'Municipios',
        type: 'vector',
        visible: true,
        opacity: 0.6,
        data: []
      },
      {
        id: 'vias',
        name: 'Vías',
        type: 'vector',
        visible: true,
        opacity: 0.8,
        data: []
      },
      {
        id: 'sitios',
        name: 'Sitios Turísticos',
        type: 'vector',
        visible: false,
        opacity: 0.8,
        data: []
      }
    ];

    this.layers.set(layersConfig);

    // Cargar datos de cada capa
    this.gisService.getDepartamentos().subscribe({
      next: (data) => this.addLayerData('departamentos', data),
      error: (err) => console.error('Error loading departamentos:', err)
    });

    this.gisService.getMunicipios().subscribe({
      next: (data) => this.addLayerData('municipios', data),
      error: (err) => console.error('Error loading municipios:', err)
    });

    this.gisService.getVias().subscribe({
      next: (data) => this.addLayerData('vias', data),
      error: (err) => console.error('Error loading vías:', err)
    });

    this.gisService.getSitiosTuristicos().subscribe({
      next: (data) => this.addLayerData('sitios', data),
      error: (err) => console.error('Error loading sitios:', err),
      complete: () => this.isLoading.set(false)
    });
  }

  /**
   * Agregar datos a una capa y renderizarla
   */
  private addLayerData(layerId: string, data: GeoFeature[]): void {
    const layers = this.layers();
    const layer = layers.find(l => l.id === layerId);

    if (layer) {
      layer.data = data;
      layer.layer = this.createGeoJSONLayer(data, layerId);

      if (layer.visible) {
        layer.layer.addTo(this.map);
      }

      this.layers.set([...layers]);
    }
  }

  /**
   * Crear capa GeoJSON
   */
  private createGeoJSONLayer(data: GeoFeature[], layerId: string): L.GeoJSON {
    const geoJsonData: any = {
      type: 'FeatureCollection',
      features: data
    };
    return L.geoJSON(geoJsonData, {
      style: (feature: any) => this.styleService.getDynamicStyle(feature, layerId),
      pointToLayer: (feature: any, latlng: any) => {
        const style = this.styleService.getDynamicStyle(feature, layerId);
        return L.circleMarker(latlng, style);
      },
      onEachFeature: (feature: any, layer: any) => {
        const popup = this.styleService.createPopup(feature, layerId);
        const tooltip = this.styleService.createTooltip(feature, layerId);
        layer.bindPopup(popup);
        layer.bindTooltip(tooltip);
      }
    });
  }

  /**
   * Toggle visibilidad de capa
   */
  toggleLayer(layer: MapLayer): void {
    layer.visible = !layer.visible;

    if (layer.visible && layer.layer) {
      layer.layer.addTo(this.map);
    } else if (!layer.visible && layer.layer) {
      this.map.removeLayer(layer.layer);
    }

    this.layers.set([...this.layers()]);
  }

  /**
   * Establecer opacidad de capa
   */
  setLayerOpacity(layer: MapLayer, event: any): void {
    layer.opacity = parseFloat(event.target.value);

    if (layer.layer && 'setOpacity' in layer.layer) {
      (layer.layer as any).setOpacity(layer.opacity);
    }
  }

  /**
   * Cargar capa satelital
   */
  loadSatelliteLayer(): void {
    this.gisService.getRecommendedLayers('colombia').subscribe({
      next: (data) => {
        const layer = data.data.layers.primary;
        L.tileLayer(layer.url, {
          attribution: layer.attribution,
          maxZoom: layer.maxZoom
        }).addTo(this.map);
      }
    });
  }

  /**
   * Activar modo dibujo
   */
  activateDrawing(type: 'polygon' | 'linestring' | 'point'): void {
    console.log('Drawing mode:', type);
    // Aquí se integrará Leaflet Draw
  }

  /**
   * Limpiar dibujos
   */
  clearDrawings(): void {
    this.drawnItems.clearLayers();
  }

  /**
   * Exportar datos
   */
  exportData(): void {
    const allFeatures = this.visibleLayers()
      .flatMap(l => l.data || []);

    this.geoToolsService.downloadGeoJSON(allFeatures, 'export.geojson');
  }

  /**
   * Calcular estadísticas
   */
  calculateStats(): void {
    const features = this.visibleLayers()
      .filter(l => l.id === 'municipios')
      .flatMap(l => l.data || []);

    if (features.length > 0) {
      const stats = this.geoToolsService.getStatistics(features, 'mpaltitud');
      console.log('Estadísticas de altitud:', stats);
      alert(`Altitud promedio: ${stats.mean.toFixed(0)}m\nMáx: ${stats.max}m\nMín: ${stats.min}m`);
    }
  }

  /**
   * Actualizar leyenda
   */
  private updateLegend(): void {
    let html = '';
    this.visibleLayers().forEach(layer => {
      html += this.styleService.createLegendHTML(layer.name, layer.id);
    });
    this.legendHTML.set(html);
  }

  /**
   * Ajustar vista al mapa completo
   */
  fitBounds(): void {
    const bounds = this.drawnItems.getBounds();
    if (bounds.isValid()) {
      this.map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      this.map.setView([4.5, -74.3], 5);
    }
  }

  /**
   * Toggle panel de capas
   */
  toggleLayerPanel(): void {
    this.showLayerPanel.set(!this.showLayerPanel());
  }

  /**
   * Toggle leyenda
   */
  toggleLegend(): void {
    this.showLegend.set(!this.showLegend());
  }

  /**
   * Toggle panel de herramientas
   */
  toggleTools(): void {
    this.showTools.set(!this.showTools());
  }
}
