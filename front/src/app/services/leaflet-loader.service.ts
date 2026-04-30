import { Injectable } from '@angular/core';

/**
 * Service to dynamically load Leaflet library
 * This avoids SSR issues with Leaflet accessing window object
 */
@Injectable({
  providedIn: 'root'
})
export class LeafletLoaderService {
  private static leafletInstance: any = null;
  private loadingPromise: Promise<any> | null = null;

  /**
   * Load Leaflet library dynamically
   * Returns a promise that resolves with the Leaflet instance
   */
  async loadLeaflet(): Promise<any> {
    // Return cached instance if already loaded
    if (LeafletLoaderService.leafletInstance) {
      return LeafletLoaderService.leafletInstance;
    }

    // Return existing loading promise if already loading
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    // Create new loading promise
    this.loadingPromise = import('leaflet').then((leaflet) => {
      LeafletLoaderService.leafletInstance = leaflet.default || leaflet;
      return LeafletLoaderService.leafletInstance;
    });

    return this.loadingPromise;
  }

  /**
   * Get Leaflet instance (must be called after loadLeaflet)
   */
  getLeaflet(): any {
    return LeafletLoaderService.leafletInstance;
  }

  /**
   * Check if Leaflet is loaded
   */
  isLoaded(): boolean {
    return LeafletLoaderService.leafletInstance !== null;
  }
}
