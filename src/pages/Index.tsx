import { useState, useCallback, useEffect, useMemo } from "react";
import { GoogleMap, Marker, Polyline, InfoWindow, Polygon } from "@react-google-maps/api";
import FleetStats from "@/components/FleetStats";
import TruckList from "@/components/TruckList";
import AlertsPanel from "@/components/AlertsPanel";
import ExpiryAlerts from "@/components/ExpiryAlerts";
import OperationalStats from "@/components/OperationalStats";
import { HeroKPI } from "@/components/HeroKPI";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Clock, TrendingUp, Play, LayoutDashboard, Search, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { 
  gtpLocations, finalDumpingSites, KHARADI_CENTER, TruckData 
} from "@/data/fleetData";
import { createTruckMarkerIcon } from "@/components/TruckIcon";
import { TruckJourneyReplayModal } from "@/components/TruckJourneyReplayModal";
import { useTrucks, useRoutes, useDrivers, useZones } from "@/hooks/useDataQueries";
import { useRouteBasedSimulation } from "@/hooks/useRouteBasedSimulation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiService } from "@/services/api";

const containerStyle = { width: '100%', height: '100%' };

const statusConfig: Record<string, { color: string; label: string; bgClass: string }> = {
  moving: { color: "#22c55e", label: "Moving", bgClass: "bg-success" },
  idle: { color: "#f59e0b", label: "Idle", bgClass: "bg-warning" },
  dumping: { color: "#3b82f6", label: "Dumping", bgClass: "bg-chart-1" },
  offline: { color: "#6b7280", label: "Offline", bgClass: "bg-muted-foreground" },
  breakdown: { color: "#ef4444", label: "Breakdown", bgClass: "bg-destructive" },
};

const Index = () => {
  // API Hooks
  const { data: trucksApiData = [] } = useTrucks();
  const { data: routesData = [] } = useRoutes();
  const { data: driversData = [] } = useDrivers();
  const { data: zonesData = [] } = useZones();

  // State
  const [selectedTruck, setSelectedTruck] = useState<TruckData | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [replayModalOpen, setReplayModalOpen] = useState(false);
  const [replayTruck, setReplayTruck] = useState<TruckData | null>(null);
  const [wardPolygons, setWardPolygons] = useState<Array<Array<{ lat: number; lng: number }>>>([]);
  const [routeSearch, setRouteSearch] = useState("");
  const [filterZone, setFilterZone] = useState<string>("ZN003");
  const [filterWard, setFilterWard] = useState<string>("WD006");
  const [availableWards, setAvailableWards] = useState<Array<{ id: string; name: string; zoneId: string }>>([]);

  useEffect(() => {
    if (filterZone === "all") {
      setAvailableWards([]);
      setFilterWard("all");
      return;
    }

    const loadWards = async () => {
      try {
        const wards = await apiService.getZoneWards(filterZone);
        const normalizedWards = (wards as any[]).map((ward) => ({
          id: String(ward.id),
          name: ward.name || ward.id,
          zoneId: ward.zone_id || ward.zoneId,
        }));
        setAvailableWards(normalizedWards);
      } catch (error) {
        console.error("Failed to load wards:", error);
        setAvailableWards([]);
      }
    };

    loadWards();
  }, [filterZone]);

  useEffect(() => {
    if (filterZone === "all" || filterWard === "all") {
      setWardPolygons([]);
      return;
    }

    const selectedWard = availableWards.find((ward) => ward.id === filterWard);
    if (!selectedWard) {
      setWardPolygons([]);
      return;
    }

    const normalizeText = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
    const parseCoordinates = (value: string) => value
      .trim()
      .split(/\s+/)
      .map((pair) => {
        const [lng, lat] = pair.split(",").map(Number);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
        return { lat, lng };
      })
      .filter((point): point is { lat: number; lng: number } => point !== null);

    const loadWardBoundary = async () => {
      try {
        const response = await fetch("/ward-boundaries.kml");
        if (!response.ok) {
          setWardPolygons([]);
          return;
        }

        const kmlText = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(kmlText, "application/xml");
        const placemarks = Array.from(xml.getElementsByTagName("Placemark"));
        const target = normalizeText(selectedWard.name);

        const extractSimpleData = (placemark: Element, name: string) => {
          const entries = Array.from(placemark.getElementsByTagName("SimpleData"));
          const match = entries.find((entry) => entry.getAttribute("name") === name);
          return match?.textContent?.trim() || "";
        };

        const matchPlacemark = placemarks.find((placemark) => {
          const wardName = normalizeText(extractSimpleData(placemark, "ward"));
          const prabhagName = normalizeText(extractSimpleData(placemark, "prabhag"));
          return wardName.includes(target) || prabhagName.includes(target) || target.includes(wardName) || target.includes(prabhagName);
        });

        if (!matchPlacemark) {
          setWardPolygons([]);
          return;
        }

        const boundaries = Array.from(matchPlacemark.getElementsByTagName("outerBoundaryIs"));
        const polygons = boundaries
          .map((boundary) => boundary.getElementsByTagName("coordinates")[0]?.textContent || "")
          .map((coords) => parseCoordinates(coords))
          .filter((path) => path.length > 0);

        setWardPolygons(polygons);
      } catch (error) {
        console.error("Ward boundaries not available", error);
        setWardPolygons([]);
      }
    };

    loadWardBoundary();
  }, [filterZone, filterWard, availableWards]);

  // Normalize truck data from API
  const normalizedTrucks = useMemo(() => {
    const routesById = new Map((routesData as any[]).map(route => [route.id, route]));
    const driversById = new Map((driversData as any[]).map(driver => [driver.id, driver]));

    return (trucksApiData as any[]).map(truck => {
      const route = routesById.get(truck.assigned_route_id);
      const driver = driversById.get(truck.driver_id);
      const currentStatus = truck.current_status || "idle";

      return {
        id: truck.id,
        truckNumber: truck.registration_number || truck.id,
        truckType: truck.route_type || "primary",
        vehicleType: truck.type || "compactor",
        position: { lat: truck.latitude ?? 18.5516, lng: truck.longitude ?? 73.9483 },
        status: currentStatus,
        driver: driver?.name || "Unassigned",
        driverId: truck.driver_id || "-",
        route: route?.name || "Unassigned",
        routeId: truck.assigned_route_id || "",
        speed: truck.speed ?? 0,
        bearing: 0,
        zoneId: truck.zone_id || "",
        wardId: truck.ward_id || "",
      } as TruckData;
    });
  }, [trucksApiData, routesData, driversData]);

  // Apply route-based simulation
  const { simulatedTrucks } = useRouteBasedSimulation(normalizedTrucks);

  const filteredMapTrucks = useMemo(() => {
    const search = routeSearch.trim().toLowerCase();
    return simulatedTrucks.filter((truck) => {
      const matchesRoute =
        !search ||
        truck.route.toLowerCase().includes(search) ||
        truck.routeId.toLowerCase().includes(search);
      const matchesZone = filterZone === "all" || truck.zoneId === filterZone;
      const matchesWard = filterWard === "all" || truck.wardId === filterWard;
      return matchesRoute && matchesZone && matchesWard;
    });
  }, [simulatedTrucks, routeSearch, filterZone, filterWard]);

  // Calculate status counts
  const onlineDevices = filteredMapTrucks.filter(t => t.status !== "offline" && t.status !== "breakdown");
  const offlineDevices = filteredMapTrucks.filter(t => t.status === "offline" || t.status === "breakdown");

  const onMapLoad = useCallback(() => {
    setIsMapLoaded(true);
  }, []);

  const handleTruckSelect = (truck: TruckData) => {
    setSelectedTruck(truck);
    setSelectedMarker(truck.id);
  };

  const handleOpenReplay = (truck: TruckData) => {
    setReplayTruck(truck);
    setReplayModalOpen(true);
  };

  const currentSelectedTruck = selectedTruck
    ? simulatedTrucks.find(t => t.id === selectedTruck.id) || selectedTruck
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header Section - animate in */}
        <div className="animate-in fade-in slide-in-from-top-4 duration-700">
          <PageHeader
          category="Dashboard"
          title="Fleet Dashboard"
          description="Real-time monitoring and fleet management"
          icon={LayoutDashboard}
          actions={
            <Card className="flex items-center gap-4 px-4 py-2 bg-gradient-to-r from-success/10 to-background border-success/20">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-success" />
                <span className="text-sm font-medium text-success">System Online</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
            </Card>
          }
        />
        </div>

        {/* Operations Summary Context Strip - staggered */}
        <div className="animate-in fade-in slide-in-from-top-4 duration-700 delay-100">
          <Card className="border border-primary/20 bg-gradient-to-r from-primary/5 via-background to-secondary/5">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Zones Active</p>
                    <p className="text-sm font-bold">5 / 5</p>
                  </div>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/10 ring-1 ring-secondary/20">
                    <LayoutDashboard className="h-4 w-4 text-secondary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Wards Monitored</p>
                    <p className="text-sm font-bold">12 / 12</p>
                  </div>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10 ring-1 ring-warning/20">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Alerts Today</p>
                    <p className="text-sm font-bold text-warning">3 Active</p>
                  </div>
                </div>
              </div>
              <Badge className="bg-success/10 text-success border-success/20">
                All Systems Operational
              </Badge>
            </div>
          </CardContent>
        </Card>
        </div>

        {/* Hero KPI Row - staggered */}
        <div className="animate-in fade-in slide-in-from-top-4 duration-700 delay-200">
          <HeroKPI
          simulatedTrucks={simulatedTrucks}
          onlineDevices={onlineDevices}
          todayCollection={85.2}
          trend={5.3}
          status="on-track"
          totalPickups={120}
          completedPickups={98}
        />
        </div>

        {/* Stats Section - staggered */}
        <div className="animate-in fade-in slide-in-from-top-4 duration-700 delay-300">
          <FleetStats />
        </div>

        {/* Live Fleet Map + Fleet Overview - staggered */}
        <div className="grid grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
          <div className="col-span-12 lg:col-span-8">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Live Fleet Map</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="gap-1 text-success border-success">
                      {onlineDevices.length} Online
                    </Badge>
                    {offlineDevices.length > 0 && (
                      <Badge variant="destructive" className="gap-1">
                        {offlineDevices.length} Offline
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="mt-3 rounded-lg border border-border/60 bg-card/80 p-2.5 backdrop-blur">
                  <div className="grid gap-2 md:grid-cols-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search route"
                        className="h-9 border-0 bg-background/60 pl-9 text-xs shadow-sm"
                        value={routeSearch}
                        onChange={(event) => setRouteSearch(event.target.value)}
                      />
                    </div>
                    <Select
                      value={filterZone}
                      onValueChange={(value) => {
                        setFilterZone(value);
                        setFilterWard("all");
                      }}
                    >
                      <SelectTrigger className="h-9 border-0 bg-background/60 text-xs shadow-sm">
                        <SelectValue placeholder="Select zone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Zones</SelectItem>
                        {zonesData.map((zone: any) => (
                          <SelectItem key={zone.id} value={String(zone.id)}>
                            {zone.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={filterWard}
                      onValueChange={setFilterWard}
                      disabled={filterZone === "all" || availableWards.length === 0}
                    >
                      <SelectTrigger className="h-9 border-0 bg-background/60 text-xs shadow-sm">
                        <SelectValue placeholder="Select ward" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Wards</SelectItem>
                        {availableWards.map((ward) => (
                          <SelectItem key={ward.id} value={ward.id}>
                            {ward.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 relative">
                {/* Floating Glass Legend */}
                <div className="absolute top-4 left-4 z-10 rounded-lg border border-border/60 bg-card/90 p-3 shadow-lg backdrop-blur animate-in fade-in slide-in-from-left-4 duration-700 delay-500">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Legend
                  </p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-success animate-pulse" />
                      <span className="text-xs text-foreground">Moving</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-warning" />
                      <span className="text-xs text-foreground">Idle</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-chart-1" />
                      <span className="text-xs text-foreground">Dumping</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-destructive" />
                      <span className="text-xs text-foreground">Breakdown</span>
                    </div>
                  </div>
                </div>

                <div className="h-[420px] rounded-b-lg overflow-hidden relative">
                  {/* Map glow effect on load */}
                  <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent opacity-0 animate-in fade-in duration-1000 delay-700 pointer-events-none" />
                  
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={KHARADI_CENTER}
                    zoom={14}
                    onLoad={onMapLoad}
                    options={{
                      styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }],
                      streetViewControl: false,
                      zoomControl: true,
                      zoomControlOptions: {
                        position: window.google?.maps?.ControlPosition?.TOP_RIGHT,
                      },
                    }}
                  >
                    {/* Ward Boundary Polygons */}
                    {isMapLoaded && window.google && wardPolygons.map((path, index) => (
                      <Polygon
                        key={`ward-boundary-${index}`}
                        paths={path}
                        options={{
                          fillColor: "#60a5fa",
                          fillOpacity: 0.2,
                          strokeColor: "#2563eb",
                          strokeOpacity: 0.6,
                          strokeWeight: 2,
                          clickable: false,
                        }}
                      />
                    ))}

                    {/* GTP Markers */}
                    {isMapLoaded && window.google && gtpLocations.map(gtp => (
                      <Marker
                        key={gtp.id}
                        position={gtp.position}
                        icon={{
                          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="10" fill="#f59e0b" stroke="white" stroke-width="2"/>
                              <text x="12" y="16" text-anchor="middle" font-size="8" fill="white" font-weight="bold">GTP</text>
                            </svg>
                          `)}`,
                          scaledSize: new window.google.maps.Size(24, 24),
                        }}
                        title={gtp.name}
                      />
                    ))}

                    {/* Final Dumping Sites */}
                    {isMapLoaded && window.google && finalDumpingSites.map(site => (
                      <Marker
                        key={site.id}
                        position={site.position}
                        icon={{
                          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                            <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
                              <rect x="2" y="2" width="24" height="24" rx="4" fill="#ef4444" stroke="white" stroke-width="2"/>
                              <text x="14" y="18" text-anchor="middle" font-size="10" fill="white" font-weight="bold">FD</text>
                            </svg>
                          `)}`,
                          scaledSize: new window.google.maps.Size(28, 28),
                        }}
                        title={site.name}
                      />
                    ))}

                    {/* Truck Markers */}
                    {isMapLoaded && window.google && filteredMapTrucks.map(truck => (
                      <Marker
                        key={truck.id}
                        position={truck.position}
                        onClick={() => handleTruckSelect(truck)}
                        icon={{
                          url: createTruckMarkerIcon(truck.status, truck.truckType, truck.bearing || 0, truck.speed || 0),
                          scaledSize: new window.google.maps.Size(56, 48),
                          anchor: new window.google.maps.Point(28, 40),
                        }}
                      >
                        {selectedMarker === truck.id && (
                          <InfoWindow onCloseClick={() => setSelectedMarker(null)}>
                            <div className="p-2 min-w-[220px]">
                              <h3 className="font-bold text-gray-900">{truck.truckNumber}</h3>
                              <p className="text-sm text-gray-600 capitalize">{truck.truckType} Truck</p>
                              <div className="mt-2 space-y-1 text-sm">
                                <p><span className="font-medium">Driver:</span> {truck.driver}</p>
                                <p><span className="font-medium">Route:</span> {truck.route}</p>
                                <p><span className="font-medium">Speed:</span> {truck.speed} km/h</p>
                              </div>
                              <button
                                onClick={() => handleOpenReplay(truck)}
                                className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
                              >
                                <Play className="h-4 w-4" />
                                Journey Replay
                              </button>
                            </div>
                          </InfoWindow>
                        )}
                      </Marker>
                    ))}
                  </GoogleMap>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-12 lg:col-span-4">
            <TruckList
              onSelectTruck={handleTruckSelect}
              selectedTruck={selectedTruck}
              trucks={filteredMapTrucks}
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Selected Truck Details */}
          {currentSelectedTruck && (
            <div className="col-span-12">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    {currentSelectedTruck.truckNumber}
                    <Badge variant="outline" className="ml-2 capitalize">{currentSelectedTruck.truckType}</Badge>
                    <Badge className={`ml-2 ${statusConfig[currentSelectedTruck.status]?.bgClass || ''}`}>
                      {statusConfig[currentSelectedTruck.status]?.label || currentSelectedTruck.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Driver</p>
                      <p className="font-medium">{currentSelectedTruck.driver}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Route</p>
                      <p className="font-medium">{currentSelectedTruck.route}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Speed</p>
                      <p className="font-medium">{currentSelectedTruck.speed} km/h</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-medium capitalize">{currentSelectedTruck.status}</p>
                    </div>
                  </div>
                  <Button onClick={() => handleOpenReplay(currentSelectedTruck)} className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    View Journey Replay
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Alerts & Stats Section */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-4">
            <AlertsPanel />
          </div>
          <div className="col-span-12 lg:col-span-4">
            <ExpiryAlerts />
          </div>
          <div className="col-span-12 lg:col-span-4">
            <OperationalStats />
          </div>
        </div>

        {/* Quick Stats Footer */}
        <Card className="p-4 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 border-primary/10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-success animate-pulse" />
                <span className="text-sm text-muted-foreground">{onlineDevices.length} trucks online</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-warning" />
                <span className="text-sm text-muted-foreground">{simulatedTrucks.filter(t => t.status === "idle").length} trucks idle</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-chart-1" />
                <span className="text-sm text-muted-foreground">{simulatedTrucks.filter(t => t.status === "dumping").length} at dump</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-success" />
              <span>Real-time fleet tracking enabled</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Journey Replay Modal */}
      <TruckJourneyReplayModal
        truck={replayTruck}
        isOpen={replayModalOpen}
        onClose={() => {
          setReplayModalOpen(false);
          setReplayTruck(null);
        }}
        selectedDate={new Date().toISOString().split('T')[0]}
      />
    </div>
  );
};

export default Index;
