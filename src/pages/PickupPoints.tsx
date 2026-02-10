import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { 
  MapPin, Plus, Building2, Home, Hospital, 
  ShoppingBag, Trash2, Edit, Route, Map
} from "lucide-react";
import { pickupPoints, gcpLocations, routes, PickupPoint } from "@/data/fleetData";
import { mockZones, mockWards, mockRoutes } from "@/data/masterData";

const typeConfig = {
  residential: { icon: Home, color: "text-primary", bgColor: "bg-primary/20", label: "Residential" },
  commercial: { icon: Building2, color: "text-chart-1", bgColor: "bg-chart-1/20", label: "Commercial" },
  hospital: { icon: Hospital, color: "text-destructive", bgColor: "bg-destructive/20", label: "Hospital" },
  market: { icon: ShoppingBag, color: "text-warning", bgColor: "bg-warning/20", label: "Market" },
};

export default function PickupPoints() {
  const [filterZone, setFilterZone] = useState<string>("all");
  const [filterWard, setFilterWard] = useState<string>("all");
  const [filterRoute, setFilterRoute] = useState<string>("all");
  const [selectedPoint, setSelectedPoint] = useState<PickupPoint | null>(null);

  // Get unique zones
  const allZones = mockZones.filter(z => z.status === 'active');
  
  // Get wards based on selected zone
  const filteredWards = useMemo(() => {
    if (filterZone === "all") {
      return mockWards.filter(w => w.status === 'active');
    }
    return mockWards.filter(w => w.zoneId === filterZone && w.status === 'active');
  }, [filterZone]);

  // Get ward names from ward IDs in pickup points
  const getWardNameFromPoint = (wardName: string) => {
    // pickupPoints use ward names like "Ward 12", map to mockWards
    return wardName;
  };

  // Filter points based on selections
  const filteredPoints = useMemo(() => {
    return pickupPoints.filter(point => {
      // Zone filtering - check if point's ward belongs to selected zone
      let matchesZone = true;
      if (filterZone !== "all") {
        const wardsInZone = mockWards.filter(w => w.zoneId === filterZone).map(w => w.name);
        matchesZone = wardsInZone.some(wardName => point.ward.includes(wardName) || wardName.includes(point.ward.replace('Ward ', '')));
      }
      
      const matchesWard = filterWard === "all" || point.ward === filterWard || 
        mockWards.find(w => w.id === filterWard)?.name === point.ward.replace('Ward ', '');
      const matchesRoute = filterRoute === "all" || point.assignedRoute === filterRoute;
      return matchesZone && matchesWard && matchesRoute;
    });
  }, [filterZone, filterWard, filterRoute]);

  // Calculate stats based on filtered points
  const stats = useMemo(() => ({
    totalPoints: filteredPoints.length,
    gcpCount: gcpLocations.length,
    assignedToRoutes: filteredPoints.filter(p => p.assignedRoute).length,
  }), [filteredPoints]);

  const getRouteInfo = (routeId?: string) => routes.find(r => r.id === routeId);

  // Reset ward when zone changes
  const handleZoneChange = (value: string) => {
    setFilterZone(value);
    setFilterWard("all");
  };

  const hasActiveFilters = filterZone !== "all" || filterWard !== "all" || filterRoute !== "all";

  const clearFilters = () => {
    setFilterZone("all");
    setFilterWard("all");
    setFilterRoute("all");
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pickup Points</h1>
          <p className="text-muted-foreground">Manage pickup point locations and schedules</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Pickup Point
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <Select value={filterZone} onValueChange={handleZoneChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Zone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Zones</SelectItem>
                {allZones.map(zone => (
                  <SelectItem key={zone.id} value={zone.id}>{zone.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterWard} onValueChange={setFilterWard}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Ward" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Wards</SelectItem>
                {filteredWards.map(ward => (
                  <SelectItem key={ward.id} value={ward.id}>{ward.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterRoute} onValueChange={setFilterRoute}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Route" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Routes</SelectItem>
                {routes.map(route => (
                  <SelectItem key={route.id} value={route.id}>{route.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalPoints}</p>
                <p className="text-sm text-muted-foreground">Total Points</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/20 rounded-lg">
                <Map className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.gcpCount}</p>
                <p className="text-sm text-muted-foreground">GCP Locations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/20 rounded-lg">
                <Route className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.assignedToRoutes}</p>
                <p className="text-sm text-muted-foreground">Assigned to Routes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Points List */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle>Pickup Points ({filteredPoints.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <div className="grid md:grid-cols-2 gap-3 p-4">
                {filteredPoints.map((point) => {
                  const config = typeConfig[point.type];
                  const TypeIcon = config.icon;
                  const route = getRouteInfo(point.assignedRoute);
                  
                  return (
                    <div
                      key={point.id}
                      onClick={() => setSelectedPoint(point)}
                      className={`p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedPoint?.id === point.id ? "bg-primary/10 border-primary" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${config.bgColor}`}>
                            <TypeIcon className={`h-4 w-4 ${config.color}`} />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">{point.name}</h4>
                            <p className="text-xs text-muted-foreground">{point.id}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">{point.ward}</Badge>
                      </div>
                      
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Schedule:</span>
                          <span>{point.schedule}</span>
                        </div>
                        
                        {route && (
                          <div className="flex items-center justify-between pt-1 border-t border-border">
                            <span className="text-muted-foreground">Route:</span>
                            <Badge variant="outline" className="text-xs">{route.name}</Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Details Panel */}
        <Card>
          {selectedPoint ? (
            <>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{selectedPoint.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  {(() => {
                    const config = typeConfig[selectedPoint.type];
                    const TypeIcon = config.icon;
                    return (
                      <>
                        <div className={`p-2 rounded-lg ${config.bgColor}`}>
                          <TypeIcon className={`h-5 w-5 ${config.color}`} />
                        </div>
                        <div>
                          <Badge variant="outline" className="capitalize">{config.label}</Badge>
                          <p className="text-xs text-muted-foreground mt-1">{selectedPoint.ward}</p>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">ID</span>
                    <span className="font-medium">{selectedPoint.id}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Schedule</span>
                    <span className="font-medium">{selectedPoint.schedule}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Coordinates</span>
                    <span className="font-medium text-xs">
                      {selectedPoint.position.lat.toFixed(4)}, {selectedPoint.position.lng.toFixed(4)}
                    </span>
                  </div>
                  {selectedPoint.lastCollection && (
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Last Collection</span>
                      <span className="font-medium text-sm">{selectedPoint.lastCollection}</span>
                    </div>
                  )}
                </div>

                {selectedPoint.assignedRoute && (
                  <div className="p-4 bg-primary/10 rounded-lg">
                    <h4 className="font-medium mb-2">Assigned Route</h4>
                    {(() => {
                      const route = getRouteInfo(selectedPoint.assignedRoute);
                      return route ? (
                        <div className="flex items-center justify-between">
                          <span>{route.name}</span>
                          <Badge variant="outline" className="capitalize">{route.type}</Badge>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Not assigned</span>
                      );
                    })()}
                  </div>
                )}
              </CardContent>
            </>
          ) : (
            <CardContent className="h-[500px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a pickup point to view details</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}