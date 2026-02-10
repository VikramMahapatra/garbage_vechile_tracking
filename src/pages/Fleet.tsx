import { useState, useCallback, useEffect } from "react";
import { GoogleMap, LoadScript, Marker, Polyline, InfoWindow } from "@react-google-maps/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Truck, MapPin, Calendar, Signal, Battery, AlertTriangle, 
  CheckCircle, XCircle, Search, Filter, ChevronRight, Play, Radio
} from "lucide-react";
import { 
  trucks, gcpLocations, finalDumpingSites, generateHistoricalPath,
  GOOGLE_MAPS_API_KEY, KHARADI_CENTER, TruckData, TruckStatus 
} from "@/data/fleetData";
import { createTruckMarkerIcon } from "@/components/TruckIcon";
import { TruckJourneyReplayModal } from "@/components/TruckJourneyReplayModal";
import { useTruckSimulation } from "@/hooks/useTruckSimulation";

const containerStyle = { width: '100%', height: '100%' };

const statusConfig: Record<TruckStatus, { color: string; label: string; bgClass: string }> = {
  moving: { color: "#22c55e", label: "Moving", bgClass: "bg-success" },
  idle: { color: "#f59e0b", label: "Idle", bgClass: "bg-warning" },
  dumping: { color: "#3b82f6", label: "Dumping", bgClass: "bg-chart-1" },
  offline: { color: "#6b7280", label: "Offline", bgClass: "bg-muted-foreground" },
  breakdown: { color: "#ef4444", label: "Breakdown", bgClass: "bg-destructive" },
};

export default function Fleet() {
  const { simulatedTrucks } = useTruckSimulation();
  const [selectedTruck, setSelectedTruck] = useState<TruckData | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "primary" | "secondary">("all");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [historicalPath, setHistoricalPath] = useState<{ lat: number; lng: number }[]>([]);
  const [showHistorical, setShowHistorical] = useState(false);
  const [replayModalOpen, setReplayModalOpen] = useState(false);
  const [replayTruck, setReplayTruck] = useState<TruckData | null>(null);

  const onMapLoad = useCallback(() => {
    setIsMapLoaded(true);
  }, []);

  // Use simulated trucks for filtering and display
  const filteredTrucks = simulatedTrucks.filter(truck => {
    const matchesSearch = truck.truckNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         truck.driver.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || truck.truckType === filterType;
    return matchesSearch && matchesType;
  });

  // Update selected truck data when simulation updates
  const currentSelectedTruck = selectedTruck 
    ? simulatedTrucks.find(t => t.id === selectedTruck.id) || selectedTruck
    : null;

  const handleTruckSelect = (truck: TruckData) => {
    setSelectedTruck(truck);
    setSelectedMarker(truck.id);
  };

  const handleViewHistory = () => {
    if (selectedTruck) {
      const history = generateHistoricalPath(selectedTruck.id, selectedDate);
      setHistoricalPath(history.path.map(p => ({ lat: p.lat, lng: p.lng })));
      setShowHistorical(true);
    }
  };

  const handleOpenReplay = (truck: TruckData) => {
    setReplayTruck(truck);
    setReplayModalOpen(true);
    setSelectedMarker(null);
  };

  const offlineDevices = trucks.filter(t => t.gpsDevice.status === "offline");
  const warningDevices = trucks.filter(t => t.gpsDevice.status === "warning");

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Fleet Management</h1>
          <p className="text-muted-foreground">Manage all vehicles, drivers, and GPS devices</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="gap-1">
            <Truck className="h-3 w-3" />
            {trucks.length} Trucks
          </Badge>
          <Badge variant="outline" className="gap-1 text-success border-success">
            <CheckCircle className="h-3 w-3" />
            {trucks.filter(t => t.gpsDevice.status === "online").length} Online
          </Badge>
          {offlineDevices.length > 0 && (
            <Badge variant="destructive" className="gap-1">
              <XCircle className="h-3 w-3" />
              {offlineDevices.length} Offline
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="map" className="space-y-4">
        <TabsList>
          <TabsTrigger value="map" className="gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            Live Map
          </TabsTrigger>
          <TabsTrigger value="list">Truck List</TabsTrigger>
          <TabsTrigger value="devices">GPS Devices Report</TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="space-y-4">
          <div className="grid lg:grid-cols-4 gap-4">
            {/* Truck List Sidebar */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search trucks..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-1 mt-2">
                  {["all", "primary", "secondary"].map((type) => (
                    <Button
                      key={type}
                      variant={filterType === type ? "default" : "outline"}
                      size="sm"
                      className="flex-1 text-xs capitalize"
                      onClick={() => setFilterType(type as typeof filterType)}
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  {filteredTrucks.map((truck) => (
                    <div
                      key={truck.id}
                      onClick={() => handleTruckSelect(truck)}
                      className={`p-3 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedTruck?.id === truck.id ? "bg-primary/10 border-l-2 border-l-primary" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Truck className={`h-8 w-8 ${truck.truckType === "primary" ? "text-primary" : "text-secondary"}`} />
                          <span className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background ${statusConfig[truck.status].bgClass}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm truncate">{truck.truckNumber}</span>
                            <Badge variant="outline" className="text-[10px] px-1">
                              {truck.truckType === "primary" ? "P" : "S"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{truck.driver}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`text-[10px] px-1 ${statusConfig[truck.status].bgClass}`}>
                              {statusConfig[truck.status].label}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">{truck.speed} km/h</span>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Map */}
            <Card className="lg:col-span-3 overflow-hidden">
              <div className="h-[560px]">
                <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={KHARADI_CENTER}
                    zoom={14}
                    onLoad={onMapLoad}
                    options={{
                      styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }],
                      streetViewControl: false,
                    }}
                  >
                    {/* GCP Markers */}
                    {isMapLoaded && window.google && gcpLocations.map((gcp) => (
                      <Marker
                        key={gcp.id}
                        position={gcp.position}
                        icon={{
                          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="10" fill="#f59e0b" stroke="white" stroke-width="2"/>
                              <text x="12" y="16" text-anchor="middle" font-size="10" fill="white" font-weight="bold">G</text>
                            </svg>
                          `)}`,
                          scaledSize: new window.google.maps.Size(24, 24),
                        }}
                        title={gcp.name}
                      />
                    ))}

                    {/* Final Dumping Sites */}
                    {isMapLoaded && window.google && finalDumpingSites.map((site) => (
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
                    {isMapLoaded && window.google && filteredTrucks.map((truck) => (
                      <Marker
                        key={truck.id}
                        position={truck.position}
                        onClick={() => setSelectedMarker(truck.id)}
                        icon={{
                          url: createTruckMarkerIcon(truck.status, truck.truckType),
                          scaledSize: new window.google.maps.Size(48, 32),
                          anchor: new window.google.maps.Point(24, 28),
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
                                <p><span className="font-medium">Trips:</span> {truck.tripsCompleted}/{truck.tripsAllowed}</p>
                                {truck.assignedGCP && <p><span className="font-medium">GCP:</span> {truck.assignedGCP}</p>}
                              </div>
                              <button
                                onClick={() => handleOpenReplay(truck)}
                                className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
                              >
                                <Play className="h-4 w-4" />
                                View Journey Replay
                              </button>
                            </div>
                          </InfoWindow>
                        )}
                      </Marker>
                    ))}

                    {/* Historical Path */}
                    {isMapLoaded && window.google && showHistorical && historicalPath.length > 0 && (
                      <Polyline
                        path={historicalPath}
                        options={{
                          strokeColor: "#8b5cf6",
                          strokeOpacity: 0.8,
                          strokeWeight: 3,
                        }}
                      />
                    )}
                  </GoogleMap>
                </LoadScript>
              </div>
            </Card>
          </div>

          {/* Selected Truck Details */}
          {currentSelectedTruck && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    {currentSelectedTruck.truckNumber}
                    <Badge variant="outline" className="ml-2 capitalize">{currentSelectedTruck.truckType}</Badge>
                    <Badge className={`ml-2 ${statusConfig[currentSelectedTruck.status].bgClass}`}>
                      {statusConfig[currentSelectedTruck.status].label}
                    </Badge>
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      {currentSelectedTruck.speed} km/h
                    </span>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-40"
                    />
                    <Button onClick={handleViewHistory} variant="outline" size="sm">
                      <Calendar className="h-4 w-4 mr-1" />
                      View Path
                    </Button>
                    {showHistorical && (
                      <Button onClick={() => setShowHistorical(false)} variant="ghost" size="sm">
                        Clear Path
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Driver</p>
                    <p className="font-medium">{currentSelectedTruck.driver}</p>
                    <p className="text-xs text-muted-foreground">{currentSelectedTruck.driverId}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Route</p>
                    <p className="font-medium">{currentSelectedTruck.route}</p>
                    <p className="text-xs text-muted-foreground">Capacity: {currentSelectedTruck.vehicleCapacity}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Trips Today</p>
                    <p className="font-medium">{currentSelectedTruck.tripsCompleted} / {currentSelectedTruck.tripsAllowed}</p>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(currentSelectedTruck.tripsCompleted / currentSelectedTruck.tripsAllowed) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">GPS Device</p>
                    <div className="flex items-center gap-2">
                      <Signal className={`h-4 w-4 ${currentSelectedTruck.gpsDevice.status === "online" ? "text-success" : "text-destructive"}`} />
                      <span className="text-sm">{currentSelectedTruck.gpsDevice.signalStrength}%</span>
                      <Battery className={`h-4 w-4 ${currentSelectedTruck.gpsDevice.batteryLevel > 20 ? "text-success" : "text-destructive"}`} />
                      <span className="text-sm">{currentSelectedTruck.gpsDevice.batteryLevel}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">IMEI: {currentSelectedTruck.gpsDevice.imei}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="p-3 text-left text-sm font-medium">Truck</th>
                      <th className="p-3 text-left text-sm font-medium">Type</th>
                      <th className="p-3 text-left text-sm font-medium">Driver</th>
                      <th className="p-3 text-left text-sm font-medium">Route</th>
                      <th className="p-3 text-left text-sm font-medium">Status</th>
                      <th className="p-3 text-left text-sm font-medium">Trips</th>
                      <th className="p-3 text-left text-sm font-medium">GPS</th>
                      <th className="p-3 text-left text-sm font-medium">Last Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trucks.map((truck) => (
                      <tr key={truck.id} className="border-b border-border hover:bg-muted/30">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-primary" />
                            <span className="font-medium">{truck.truckNumber}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="capitalize">{truck.truckType}</Badge>
                        </td>
                        <td className="p-3">{truck.driver}</td>
                        <td className="p-3">{truck.route}</td>
                        <td className="p-3">
                          <Badge className={statusConfig[truck.status].bgClass}>
                            {statusConfig[truck.status].label}
                          </Badge>
                        </td>
                        <td className="p-3">{truck.tripsCompleted}/{truck.tripsAllowed}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <Signal className={`h-3 w-3 ${truck.gpsDevice.status === "online" ? "text-success" : truck.gpsDevice.status === "warning" ? "text-warning" : "text-destructive"}`} />
                            <span className="text-xs">{truck.gpsDevice.signalStrength}%</span>
                          </div>
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">{truck.lastUpdate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices">
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <Card className="bg-success/10 border-success/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-success" />
                  <div>
                    <p className="text-2xl font-bold text-success">{trucks.filter(t => t.gpsDevice.status === "online").length}</p>
                    <p className="text-sm text-muted-foreground">Online Devices</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-warning/10 border-warning/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-8 w-8 text-warning" />
                  <div>
                    <p className="text-2xl font-bold text-warning">{warningDevices.length}</p>
                    <p className="text-sm text-muted-foreground">Warning (Low Battery/Signal)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-destructive/10 border-destructive/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <XCircle className="h-8 w-8 text-destructive" />
                  <div>
                    <p className="text-2xl font-bold text-destructive">{offlineDevices.length}</p>
                    <p className="text-sm text-muted-foreground">Offline Devices</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Signal className="h-5 w-5" />
                GPS Device Status Report
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="p-3 text-left text-sm font-medium">IMEI</th>
                      <th className="p-3 text-left text-sm font-medium">Truck</th>
                      <th className="p-3 text-left text-sm font-medium">Status</th>
                      <th className="p-3 text-left text-sm font-medium">Signal</th>
                      <th className="p-3 text-left text-sm font-medium">Battery</th>
                      <th className="p-3 text-left text-sm font-medium">Last Ping</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trucks.map((truck) => (
                      <tr key={truck.id} className={`border-b border-border ${truck.gpsDevice.status === "offline" ? "bg-destructive/5" : truck.gpsDevice.status === "warning" ? "bg-warning/5" : ""}`}>
                        <td className="p-3 font-mono text-sm">{truck.gpsDevice.imei}</td>
                        <td className="p-3">{truck.truckNumber}</td>
                        <td className="p-3">
                          <Badge className={
                            truck.gpsDevice.status === "online" ? "bg-success" : 
                            truck.gpsDevice.status === "warning" ? "bg-warning" : "bg-destructive"
                          }>
                            {truck.gpsDevice.status}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${truck.gpsDevice.signalStrength > 50 ? "bg-success" : truck.gpsDevice.signalStrength > 20 ? "bg-warning" : "bg-destructive"}`}
                                style={{ width: `${truck.gpsDevice.signalStrength}%` }}
                              />
                            </div>
                            <span className="text-sm">{truck.gpsDevice.signalStrength}%</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Battery className={`h-4 w-4 ${truck.gpsDevice.batteryLevel > 20 ? "text-success" : "text-destructive"}`} />
                            <span className="text-sm">{truck.gpsDevice.batteryLevel}%</span>
                          </div>
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">{truck.gpsDevice.lastPing}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Journey Replay Modal */}
      <TruckJourneyReplayModal
        truck={replayTruck}
        isOpen={replayModalOpen}
        onClose={() => setReplayModalOpen(false)}
        selectedDate={selectedDate}
      />
    </div>
  );
}
