import { Injectable } from '@angular/core';
import * as turf from '@turf/turf';
import * as L from 'leaflet';

@Injectable({
  providedIn: 'root'
})
export class GeoToolsService {

  constructor() { }

  /**
   * Calcular buffer alrededor de una geometría
   * @param feature - GeoJSON Feature
   * @param radius - Radio en km
   * @returns Buffer GeoJSON Feature
   */
  createBuffer(feature: any, radiusKm: number): any {
    try {
      return turf.buffer(feature, radiusKm, { units: 'kilometers' });
    } catch (error) {
      console.error('Error creating buffer:', error);
      return null;
    }
  }

  /**
   * Calcular centroide de una geometría
   */
  getCentroid(feature: any): any {
    try {
      return turf.centroid(feature);
    } catch (error) {
      console.error('Error getting centroid:', error);
      return null;
    }
  }

  /**
   * Calcular área de un polígono (en km²)
   */
  getArea(feature: any): number {
    try {
      return turf.area(feature) / 1000000; // Convertir a km²
    } catch (error) {
      console.error('Error calculating area:', error);
      return 0;
    }
  }

  /**
   * Calcular longitud de una línea (en km)
   */
  getLength(feature: any): number {
    try {
      return turf.length(feature, { units: 'kilometers' });
    } catch (error) {
      console.error('Error calculating length:', error);
      return 0;
    }
  }

  /**
   * Buscar features cercanos a un punto
   */
  findNearby(point: L.LatLng, features: any[], radiusKm: number = 5): any[] {
    try {
      const turfPoint = turf.point([point.lng, point.lat]);
      return features.filter(feature => {
        const distance = turf.distance(turfPoint, feature, { units: 'kilometers' });
        return distance <= radiusKm;
      });
    } catch (error) {
      console.error('Error finding nearby features:', error);
      return [];
    }
  }

  /**
   * Calcular intersección entre dos geometrías
   */
  getIntersection(feature1: any, feature2: any): any {
    try {
      return turf.intersect(feature1, feature2);
    } catch (error) {
      console.error('Error calculating intersection:', error);
      return null;
    }
  }

  /**
   * Calcular unión entre dos geometrías
   */
  getUnion(feature1: any, feature2: any): any {
    try {
      // Use union directly with two features (casting to any to avoid type issues)
      return (turf.union as any)(feature1, feature2);
    } catch (error) {
      console.error('Error calculating union:', error);
      return null;
    }
  }

  /**
   * Obtener bounding box de una geometría
   */
  getBbox(feature: any): [number, number, number, number] {
    try {
      const bbox: any = (turf.bbox as any)(feature);
      // Turf returns [minX, minY, minZ, maxX, maxY, maxZ], convert to [minX, minY, maxX, maxY]
      return [bbox[0], bbox[1], bbox[3], bbox[4]] as [number, number, number, number];
    } catch (error) {
      console.error('Error getting bbox:', error);
      return [0, 0, 0, 0];
    }
  }

  /**
   * Crear círculo (puntos alrededor de un centro)
   */
  createCircle(center: L.LatLng, radiusKm: number, steps: number = 64): any {
    try {
      return turf.circle([center.lng, center.lat], radiusKm, { steps, units: 'kilometers' });
    } catch (error) {
      console.error('Error creating circle:', error);
      return null;
    }
  }

  /**
   * Simplificar geometría (reduce puntos)
   */
  simplifyGeometry(feature: any, tolerance: number = 0.01, highQuality: boolean = true): any {
    try {
      return turf.simplify(feature, { tolerance, highQuality });
    } catch (error) {
      console.error('Error simplifying geometry:', error);
      return feature;
    }
  }

  /**
   * Comprobar si un punto está dentro de un polígono
   */
  isPointInPolygon(point: L.LatLng, feature: any): boolean {
    try {
      const turfPoint = turf.point([point.lng, point.lat]);
      return turf.booleanPointInPolygon(turfPoint, feature);
    } catch (error) {
      console.error('Error checking point in polygon:', error);
      return false;
    }
  }

  /**
   * Calcular distancia entre dos puntos (en km)
   */
  getDistance(point1: L.LatLng, point2: L.LatLng): number {
    try {
      return turf.distance(
        turf.point([point1.lng, point1.lat]),
        turf.point([point2.lng, point2.lat]),
        { units: 'kilometers' }
      );
    } catch (error) {
      console.error('Error calculating distance:', error);
      return 0;
    }
  }

  /**
   * Obtener puntos equidistantes a lo largo de una línea
   */
  getPointsAlong(feature: any, distance: number = 1): any {
    try {
      // pointsAlong was removed in recent Turf.js, use alternative approach
      if (feature.geometry.type === 'LineString') {
        const coordinates: any[] = feature.geometry.coordinates;
        const line = (turf.lineString as any)(coordinates);
        const length = (turf.length as any)(line);
        const points: any[] = [];
        for (let i = 0; i <= length; i += distance) {
          points.push((turf.along as any)(line, i, { units: 'kilometers' }));
        }
        return (turf.featureCollection as any)(points);
      }
      return null;
    } catch (error) {
      console.error('Error getting points along:', error);
      return null;
    }
  }

  /**
   * Crear grid (malla) sobre un área
   */
  createGrid(bbox: [number, number, number, number], cellSize: number = 10): any {
    try {
      return turf.squareGrid(bbox, cellSize, { units: 'kilometers' });
    } catch (error) {
      console.error('Error creating grid:', error);
      return null;
    }
  }

  /**
   * Agrupar features por proximidad (clustering simple)
   */
  clusterFeatures(features: any[], maxDistance: number = 1): any[] {
    try {
      const collection = (turf.featureCollection as any)(features);
      const clustered = (turf.clustersDbscan as any)(collection, maxDistance, { units: 'kilometers' });
      return (clustered.features || []) as any[];
    } catch (error) {
      console.error('Error clustering features:', error);
      return features;
    }
  }

  /**
   * Obtener estadísticas de una colección de features
   */
  getStatistics(features: any[], property: string): {
    count: number;
    sum: number;
    mean: number;
    min: number;
    max: number;
  } {
    const values = features
      .map(f => f.properties[property])
      .filter(v => typeof v === 'number');

    if (values.length === 0) {
      return { count: 0, sum: 0, mean: 0, min: 0, max: 0 };
    }

    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return { count: values.length, sum, mean, min, max };
  }

  /**
   * Convertir LatLngBounds de Leaflet a GeoJSON bbox
   */
  boundsToGeoJSON(bounds: L.LatLngBounds): any {
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    return {
      type: 'Polygon',
      coordinates: [[
        [sw.lng, sw.lat],
        [ne.lng, sw.lat],
        [ne.lng, ne.lat],
        [sw.lng, ne.lat],
        [sw.lng, sw.lat]
      ]]
    };
  }

  /**
   * Validar GeoJSON
   */
  validateGeoJSON(feature: any): { valid: boolean; error?: string } {
    try {
      if (!feature.geometry || !feature.geometry.type) {
        return { valid: false, error: 'Geometría inválida' };
      }
      return { valid: true };
    } catch (error) {
      return { valid: false, error: String(error) };
    }
  }

  /**
   * Exportar feature a GeoJSON string
   */
  exportGeoJSON(features: any | any[]): string {
    const data = Array.isArray(features)
      ? { type: 'FeatureCollection', features }
      : features;
    return JSON.stringify(data, null, 2);
  }

  /**
   * Descargar GeoJSON
   */
  downloadGeoJSON(features: any | any[], filename: string = 'export.geojson'): void {
    const geojson = this.exportGeoJSON(features);
    const blob = new Blob([geojson], { type: 'application/geo+json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
