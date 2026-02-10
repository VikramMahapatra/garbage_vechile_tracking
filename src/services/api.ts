import { API_BASE_URL } from '../config/api';

export interface TruckLive {
  id: string;
  registration_number: string;
  type: string;
  route_type: string;
  latitude: number | null;
  longitude: number | null;
  current_status: string;
  speed: number;
  trips_completed: number;
  trips_allowed: number;
  driver_name: string | null;
  route_name: string | null;
  vendor_id: string;
  zone_id: string;
  ward_id: string;
  is_spare: boolean;
  last_update: string | null;
}

export interface Zone {
  id: string;
  name: string;
  code: string;
  description: string;
  supervisor_name: string;
  supervisor_phone: string;
  total_wards: number;
  status: string;
}

export interface Alert {
  id: number;
  truck_id: string;
  alert_type: string;
  severity: string;
  message: string;
  timestamp: string;
  status: string;
  resolved_at: string | null;
}

export interface Statistics {
  total_trucks: number;
  active_trucks: number;
  idle_trucks: number;
  total_zones: number;
  total_wards: number;
  total_vendors: number;
  total_routes: number;
  total_pickup_points: number;
  active_alerts: number;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API fetch error for ${endpoint}:`, error);
      throw error;
    }
  }

  // Trucks
  async getLiveTrucks(): Promise<TruckLive[]> {
    return this.fetchApi<TruckLive[]>('/trucks/live');
  }

  async getTrucks(filters?: { zone_id?: string; vendor_id?: string; status?: string }): Promise<any[]> {
    const params = new URLSearchParams(filters as Record<string, string>);
    return this.fetchApi(`/trucks?${params.toString()}`);
  }

  async getSpareTrucks(): Promise<any[]> {
    return this.fetchApi('/trucks/spare');
  }

  // Zones
  async getZones(): Promise<Zone[]> {
    return this.fetchApi<Zone[]>('/zones/');
  }

  async getZone(zoneId: string): Promise<Zone> {
    return this.fetchApi<Zone>(`/zones/${zoneId}`);
  }

  async getZoneWards(zoneId: string): Promise<any[]> {
    return this.fetchApi(`/zones/${zoneId}/wards`);
  }

  // Alerts
  async getAlerts(filters?: { status?: string; severity?: string; truck_id?: string }): Promise<Alert[]> {
    const params = new URLSearchParams(filters as Record<string, string>);
    return this.fetchApi<Alert[]>(`/alerts/?${params.toString()}`);
  }

  async getActiveAlerts(): Promise<Alert[]> {
    return this.fetchApi<Alert[]>('/alerts/active');
  }

  async getExpiryAlerts(): Promise<any> {
    return this.fetchApi('/alerts/expiry');
  }

  // Reports
  async getStatistics(): Promise<Statistics> {
    return this.fetchApi<Statistics>('/reports/statistics');
  }

  async getZonePerformance(): Promise<any[]> {
    return this.fetchApi('/reports/zone-performance');
  }

  async getVendorPerformance(): Promise<any[]> {
    return this.fetchApi('/reports/vendor-performance');
  }

  async getCollectionEfficiency(): Promise<any> {
    return this.fetchApi('/reports/collection-efficiency');
  }

  // Vendors
  async getVendors(): Promise<any[]> {
    return this.fetchApi('/vendors/');
  }

  // Routes
  async getRoutes(filters?: { zone_id?: string; ward_id?: string }): Promise<any[]> {
    const params = new URLSearchParams(filters as Record<string, string>);
    return this.fetchApi(`/routes/?${params.toString()}`);
  }

  async getRoutePickupPoints(routeId: string): Promise<any[]> {
    return this.fetchApi(`/routes/${routeId}/pickup-points`);
  }

  // Pickup Points
  async getPickupPoints(filters?: { ward_id?: string; route_id?: string }): Promise<any[]> {
    const params = new URLSearchParams(filters as Record<string, string>);
    return this.fetchApi(`/pickup-points/?${params.toString()}`);
  }
}

export const apiService = new ApiService();
