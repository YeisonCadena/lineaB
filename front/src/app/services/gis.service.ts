import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface GeoFeature {
  id: number;
  type: string;
  properties: Record<string, any>;
  geometry: any;
  geom?: string;
}

export interface LayerData {
  success: boolean;
  total: number;
  data: GeoFeature[];
  limit?: number;
  offset?: number;
}

export interface SatelliteLayer {
  id: string;
  name: string;
  url: string;
  provider: string;
  type: string;
  attribution: string;
  maxZoom: number;
  minZoom: number;
  description: string;
  requiresAuth?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class GisService {
  private apiUrl = 'http://localhost:3000/api';
  private authToken = signal<string | null>(null);
  private loading = signal(false);
  private error$ = new BehaviorSubject<string | null>(null);
  private platformId = inject(PLATFORM_ID);

  constructor(private http: HttpClient) {
    this.loadAuthToken();
  }

  // ============= AUTH =============

  private loadAuthToken(): void {
    // Only access localStorage in browser environment
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        this.authToken.set(token);
      }
    }
  }

  setAuthToken(token: string): void {
    this.authToken.set(token);
    // Only access localStorage in browser environment
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('auth_token', token);
    }
  }

  getAuthToken(): string | null {
    return this.authToken();
  }

  logout(): void {
    this.authToken.set(null);
    localStorage.removeItem('auth_token');
  }

  // ============= DEPARTAMENTOS =============

  getDepartamentos(): Observable<GeoFeature[]> {
    this.loading.set(true);
    return this.http.get<LayerData>(`${this.apiUrl}/departamentos`).pipe(
      map(res => this.parseGeoFeatures(res.data)),
      catchError(err => this.handleError(err))
    );
  }

  getDepartamento(id: number): Observable<GeoFeature> {
    return this.http.get<any>(`${this.apiUrl}/departamentos/${id}`).pipe(
      map(res => this.parseGeoFeature(res.data)),
      catchError(err => this.handleError(err))
    );
  }

  // ============= MUNICIPIOS =============

  getMunicipios(limit: number = 50, offset: number = 0): Observable<GeoFeature[]> {
    this.loading.set(true);
    let params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString());

    return this.http.get<LayerData>(`${this.apiUrl}/municipios`, { params }).pipe(
      map(res => {
        this.loading.set(false);
        return this.parseGeoFeatures(res.data);
      }),
      catchError(err => this.handleError(err))
    );
  }

  getMunicipio(id: number): Observable<GeoFeature> {
    return this.http.get<any>(`${this.apiUrl}/municipios/${id}`).pipe(
      map(res => this.parseGeoFeature(res.data)),
      catchError(err => this.handleError(err))
    );
  }

  getMunicipiosPorDepartamento(departamento: string): Observable<GeoFeature[]> {
    this.loading.set(true);
    return this.http.get<LayerData>(`${this.apiUrl}/municipios/departamento/${departamento}`).pipe(
      map(res => {
        this.loading.set(false);
        return this.parseGeoFeatures(res.data);
      }),
      catchError(err => this.handleError(err))
    );
  }

  getMunicipiosCercanos(lat: number, lon: number, radio: number = 5000): Observable<GeoFeature[]> {
    this.loading.set(true);
    let params = new HttpParams()
      .set('lat', lat.toString())
      .set('lon', lon.toString())
      .set('radio', radio.toString());

    return this.http.get<LayerData>(`${this.apiUrl}/municipios/cercanos`, { params }).pipe(
      map(res => {
        this.loading.set(false);
        return this.parseGeoFeatures(res.data);
      }),
      catchError(err => this.handleError(err))
    );
  }

  // ============= VÍAS =============

  getVias(): Observable<GeoFeature[]> {
    this.loading.set(true);
    return this.http.get<LayerData>(`${this.apiUrl}/vias`).pipe(
      map(res => {
        this.loading.set(false);
        return this.parseGeoFeatures(res.data);
      }),
      catchError(err => this.handleError(err))
    );
  }

  getVia(id: number): Observable<GeoFeature> {
    return this.http.get<any>(`${this.apiUrl}/vias/${id}`).pipe(
      map(res => this.parseGeoFeature(res.data)),
      catchError(err => this.handleError(err))
    );
  }

  // ============= SITIOS TURÍSTICOS =============

  getSitiosTuristicos(limit: number = 50, offset: number = 0): Observable<GeoFeature[]> {
    this.loading.set(true);
    let params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString());

    return this.http.get<LayerData>(`${this.apiUrl}/sitios-turisticos`, { params }).pipe(
      map(res => {
        this.loading.set(false);
        return this.parseGeoFeatures(res.data);
      }),
      catchError(err => this.handleError(err))
    );
  }

  getSitioTuristico(id: number): Observable<GeoFeature> {
    return this.http.get<any>(`${this.apiUrl}/sitios-turisticos/${id}`).pipe(
      map(res => this.parseGeoFeature(res.data)),
      catchError(err => this.handleError(err))
    );
  }

  getSitiosPorCategoria(categoria: string): Observable<GeoFeature[]> {
    return this.http.get<LayerData>(`${this.apiUrl}/sitios-turisticos/categoria/${categoria}`).pipe(
      map(res => this.parseGeoFeatures(res.data)),
      catchError(err => this.handleError(err))
    );
  }

  getSitiosPorCiudad(ciudad: string): Observable<GeoFeature[]> {
    return this.http.get<LayerData>(`${this.apiUrl}/sitios-turisticos/ciudad/${ciudad}`).pipe(
      map(res => this.parseGeoFeatures(res.data)),
      catchError(err => this.handleError(err))
    );
  }

  // ============= SATÉLITE =============

  getSatelliteLayers(): Observable<SatelliteLayer[]> {
    return this.http.get<any>(`${this.apiUrl}/satellite-layers`).pipe(
      map(res => res.data),
      catchError(err => this.handleError(err))
    );
  }

  getFreeSatelliteLayers(): Observable<SatelliteLayer[]> {
    return this.http.get<any>(`${this.apiUrl}/satellite-layers/free`).pipe(
      map(res => res.data),
      catchError(err => this.handleError(err))
    );
  }

  getRecommendedLayers(region: string = 'colombia'): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/satellite-layers/recommended/${region}`).pipe(
      catchError(err => this.handleError(err))
    );
  }

  getSatelliteLayer(layerId: string): Observable<SatelliteLayer> {
    return this.http.get<any>(`${this.apiUrl}/satellite-layers/${layerId}`).pipe(
      map(res => res.data),
      catchError(err => this.handleError(err))
    );
  }

  // ============= UTILIDADES =============

  private parseGeoFeatures(data: any[]): GeoFeature[] {
    return data.map(item => this.parseGeoFeature(item));
  }

  private parseGeoFeature(item: any): GeoFeature {
    return {
      id: item.id,
      type: 'Feature',
      properties: item,
      geometry: item.geom ? JSON.parse(item.geom) : item.geometry
    };
  }

  private handleError(error: any): Observable<never> {
    const errorMsg = error.error?.error || error.message || 'Error desconocido';
    this.error$.next(errorMsg);
    console.error('GIS Service Error:', errorMsg);
    throw error;
  }

  isLoading() {
    return this.loading.asReadonly();
  }

  getError$() {
    return this.error$.asObservable();
  }

  clearError(): void {
    this.error$.next(null);
  }
}
