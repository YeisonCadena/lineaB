import { Injectable } from '@angular/core';

// Declare L as any type - will be imported dynamically in browser
let L: any;

export interface StyleConfig {
  color?: string;
  fillColor?: string;
  weight?: number;
  opacity?: number;
  fillOpacity?: number;
  radius?: number;
  dashArray?: string;
}

export interface ThematicStyle {
  property: string;
  field: string;
  values: { [key: string]: StyleConfig };
  default: StyleConfig;
}

@Injectable({
  providedIn: 'root'
})
export class StyleService {
  private getL(): any {
    return (window as any).L;
  }
  
  // Paleta de colores por tipo de geometría
  private stylePresets = {
    departamentos: {
      color: '#2c3e50',
      fillColor: '#3498db',
      weight: 2,
      opacity: 0.8,
      fillOpacity: 0.5
    },
    municipios: {
      color: '#27ae60',
      fillColor: '#2ecc71',
      weight: 1.5,
      opacity: 0.8,
      fillOpacity: 0.4
    },
    vias: {
      color: '#e74c3c',
      weight: 3,
      opacity: 0.8,
      dashArray: '5, 5'
    },
    sitios: {
      radius: 6,
      fillColor: '#f39c12',
      fillOpacity: 0.8,
      color: '#e67e22',
      weight: 2,
      opacity: 1
    }
  };

  // Paleta de colores
  private colorPalette = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#ABEBC6'
  ];

  constructor() { }

  /**
   * Obtener estilo preestablecido por tipo
   */
  getPresetStyle(type: string): StyleConfig {
    return this.stylePresets[type as keyof typeof this.stylePresets] || this.stylePresets.municipios;
  }

  /**
   * Crear estilo dinámico basado en propiedades
   */
  getDynamicStyle(feature: any, type: string): StyleConfig {
    const baseStyle = this.getPresetStyle(type);

    // Personalizar según propiedades
    switch (type) {
      case 'municipios':
        if (feature.properties?.mpaltitud > 2500) {
          return { ...baseStyle, fillColor: '#3498db', weight: 2 };
        }
        return baseStyle;

      case 'vias':
        if (feature.properties?.tipo === 'Principal') {
          return { ...baseStyle, weight: 4, color: '#c0392b' };
        }
        return baseStyle;

      case 'sitios':
        const categoria = feature.properties?.categoria;
        if (categoria === 'Museo') {
          return { ...baseStyle, fillColor: '#9b59b6' };
        } else if (categoria === 'Monumento') {
          return { ...baseStyle, fillColor: '#e67e22' };
        }
        return baseStyle;

      default:
        return baseStyle;
    }
  }

  /**
   * Aplicar estilo temático basado en valores de propiedad
   */
  getThematicStyle(feature: any, thematic: ThematicStyle): StyleConfig {
    const fieldValue = feature.properties?.[thematic.field];
    return thematic.values[fieldValue] || thematic.default;
  }

  /**
   * Crear función de estilo para GeoJSON Layer
   */
  getStyleFunction(type: string) {
    return (feature: any) => {
      return this.getDynamicStyle(feature, type);
    };
  }

  /**
   * Crear ícono para puntos
   */
  createMarkerIcon(options?: { color?: string; icon?: string }): any {
    const color = options?.color || '#3498db';
    const icon = options?.icon || 'info';
    const L = this.getL();

    return L.icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-${color.replace('#', '')}.png`,
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  }

  /**
   * Crear popup para feature
   */
  createPopup(feature: any, type: string): string {
    const props = feature.properties;
    let html = `<div class="popup-content">`;
    html += `<strong>${this.getFeatureTitle(feature, type)}</strong><br>`;
    html += `<small>${type}</small><br><br>`;

    // Mostrar propiedades relevantes
    const relevantProps = this.getRelevantProps(type);
    relevantProps.forEach(prop => {
      if (props[prop]) {
        const label = this.formatLabel(prop);
        const value = this.formatValue(props[prop]);
        html += `<strong>${label}:</strong> ${value}<br>`;
      }
    });

    html += `</div>`;
    return html;
  }

  /**
   * Crear tooltip para feature
   */
  createTooltip(feature: any, type: string): string {
    return this.getFeatureTitle(feature, type);
  }

  /**
   * Obtener título del feature
   */
  private getFeatureTitle(feature: any, type: string): string {
    const props = feature.properties;

    switch (type) {
      case 'departamentos':
        return props.denombre || props.nombre || 'Departamento';
      case 'municipios':
        return props.mpnombre || props.nombre || 'Municipio';
      case 'vias':
        return props.via || props.nombre || 'Vía';
      case 'sitios':
        return props.nombre || 'Sitio';
      default:
        return 'Feature';
    }
  }

  /**
   * Obtener propiedades relevantes por tipo
   */
  private getRelevantProps(type: string): string[] {
    switch (type) {
      case 'departamentos':
        return ['decodigo', 'dearea'];
      case 'municipios':
        return ['depto', 'mparea', 'mpaltitud', 'mpcategor'];
      case 'vias':
        return ['tipo', 'origen', 'destino', 'longitud_metros'];
      case 'sitios':
        return ['ciudad', 'departamen', 'categoria'];
      default:
        return [];
    }
  }

  /**
   * Formatear etiquetas
   */
  private formatLabel(prop: string): string {
    const labels: { [key: string]: string } = {
      decodigo: 'Código',
      denombre: 'Nombre',
      dearea: 'Área (km²)',
      mpnombre: 'Municipio',
      depto: 'Departamento',
      mparea: 'Área (km²)',
      mpaltitud: 'Altitud (m)',
      mpcategor: 'Categoría',
      via: 'Vía',
      tipo: 'Tipo',
      origen: 'Origen',
      destino: 'Destino',
      longitud_metros: 'Longitud (m)',
      nombre: 'Nombre',
      ciudad: 'Ciudad',
      departamen: 'Departamento',
      categoria: 'Categoría'
    };
    return labels[prop] || this.capitalize(prop);
  }

  /**
   * Formatear valores
   */
  private formatValue(value: any): string {
    if (typeof value === 'number') {
      if (value > 1000) {
        return (value / 1000).toFixed(2) + ' k';
      }
      return value.toFixed(2);
    }
    return String(value);
  }

  /**
   * Capitalizar string
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');
  }

  /**
   * Obtener color aleatorio de la paleta
   */
  getRandomColor(): string {
    return this.colorPalette[Math.floor(Math.random() * this.colorPalette.length)];
  }

  /**
   * Crear leyenda HTML
   */
  createLegendHTML(layerName: string, type: string): string {
    const style = this.getPresetStyle(type);
    let html = `<div class="legend-item">`;
    html += `<span class="legend-label">${layerName}</span><br>`;

    if (style.fillColor) {
      html += `<span class="legend-color" style="background-color: ${style.fillColor}; width: 20px; height: 20px; display: inline-block; border: 1px solid ${style.color || 'black'};"></span>`;
    } else if (style.color) {
      html += `<span class="legend-line" style="background: linear-gradient(90deg, ${style.color} 0%, ${style.color} 100%); width: 30px; height: 2px; display: inline-block;"></span>`;
    }

    html += `</div>`;
    return html;
  }

  /**
   * Obtener rango de colores para mapa temático
   */
  getColorRange(count: number = 5): string[] {
    const gradient = ['#ffffcc', '#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#e31a1c'];
    if (count <= gradient.length) {
      return gradient.slice(0, count);
    }
    return gradient;
  }

  /**
   * Crear estilo para clustering
   */
  getClusterStyle(clusterSize: number): StyleConfig {
    if (clusterSize < 10) {
      return { fillColor: '#7ec850', fillOpacity: 0.8 };
    } else if (clusterSize < 50) {
      return { fillColor: '#f4a500', fillOpacity: 0.8 };
    }
    return { fillColor: '#e41a1c', fillOpacity: 0.8 };
  }
}
