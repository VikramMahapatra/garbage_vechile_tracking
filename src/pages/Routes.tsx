import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Route, MapPin, Truck, Clock, ArrowRight, 
  Plus, Edit, Trash2 
} from "lucide-react";
import { routes as initialRoutes, trucks, gcpLocations, finalDumpingSites, RouteData, TruckType } from "@/data/fleetData";
import { toast } from "sonner";
import RouteMapBuilder from "@/components/RouteMapBuilder";
import RouteListView from "@/components/RouteListView";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Routes() {
  const [routes, setRoutes] = useState<RouteData[]>(initialRoutes);
  const [selectedRoute, setSelectedRoute] = useState<RouteData | null>(null);
  const [filterType, setFilterType] = useState<"all" | "primary" | "secondary">("all");
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<RouteData | null>(null);
  const [newRouteType, setNewRouteType] = useState<TruckType>("primary");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState<string | null>(null);

  const primaryRoutes = routes.filter(r => r.type === "primary");
  const secondaryRoutes = routes.filter(r => r.type === "secondary");

  // Handle creating a new route
  const handleCreateRoute = (type: TruckType) => {
    setNewRouteType(type);
    setEditingRoute(null);
    setIsBuilderOpen(true);
  };

  // Handle editing a route
  const handleEditRoute = (route: RouteData) => {
    setNewRouteType(route.type);
    setEditingRoute(route);
    setIsBuilderOpen(true);
  };

  // Handle saving route from builder
  const handleSaveRoute = (route: RouteData) => {
    if (editingRoute) {
      // Update existing route
      setRoutes(routes.map(r => r.id === route.id ? route : r));
      toast.success(`Route "${route.name}" updated successfully`);
    } else {
      // Add new route
      setRoutes([...routes, route]);
      toast.success(`Route "${route.name}" created successfully`);
    }
    setIsBuilderOpen(false);
    setEditingRoute(null);
    setSelectedRoute(route);
  };

  // Handle delete confirmation
  const handleDeleteRoute = (routeId: string) => {
    setRouteToDelete(routeId);
    setDeleteConfirmOpen(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (routeToDelete) {
      const routeName = routes.find(r => r.id === routeToDelete)?.name;
      setRoutes(routes.filter(r => r.id !== routeToDelete));
      if (selectedRoute?.id === routeToDelete) {
        setSelectedRoute(null);
      }
      toast.success(`Route "${routeName}" deleted`);
    }
    setDeleteConfirmOpen(false);
    setRouteToDelete(null);
  };

  // Cancel builder
  const handleCancelBuilder = () => {
    setIsBuilderOpen(false);
    setEditingRoute(null);
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Route Management</h1>
          <p className="text-muted-foreground">
            {isBuilderOpen 
              ? `${editingRoute ? "Edit" : "Create"} ${newRouteType} collection route`
              : "Create and manage collection routes for primary and secondary trucks"}
          </p>
        </div>
        {!isBuilderOpen && (
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => handleCreateRoute("primary")}>
              <Plus className="h-4 w-4" />
              Primary Route
            </Button>
            <Button className="gap-2" onClick={() => handleCreateRoute("secondary")}>
              <Plus className="h-4 w-4" />
              Secondary Route
            </Button>
          </div>
        )}
      </div>

      {isBuilderOpen ? (
        // Route Builder View
        <RouteMapBuilder
          route={editingRoute}
          routeType={newRouteType}
          onSave={handleSaveRoute}
          onCancel={handleCancelBuilder}
        />
      ) : (
        <>
          {/* Route Type Explanation */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Truck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary">Primary Routes ({primaryRoutes.length})</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Primary trucks collect garbage from pickup points and dump at GCPs (Garbage Collection Points).
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> Pickup Points → <ArrowRight className="h-3 w-3" /> GCP
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-secondary/5 border-secondary/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-secondary/20 rounded-lg">
                    <Truck className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary">Secondary Routes ({secondaryRoutes.length})</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Secondary trucks pick garbage from GCPs and transport to final dumping areas.
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> GCP → <ArrowRight className="h-3 w-3" /> Final Dumping Site
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="routes" className="space-y-4">
            <TabsList>
              <TabsTrigger value="routes">All Routes ({routes.length})</TabsTrigger>
              <TabsTrigger value="gcp">GCP Locations ({gcpLocations.length})</TabsTrigger>
              <TabsTrigger value="dumping">Final Dumping Sites ({finalDumpingSites.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="routes">
              <RouteListView
                routes={routes}
                selectedRoute={selectedRoute}
                filterType={filterType}
                onFilterChange={setFilterType}
                onSelectRoute={setSelectedRoute}
                onEditRoute={handleEditRoute}
                onDeleteRoute={handleDeleteRoute}
                onCreateRoute={handleCreateRoute}
              />
            </TabsContent>

            <TabsContent value="gcp">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {gcpLocations.map((gcp) => (
                  <Card key={gcp.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2 bg-amber-500/20 rounded-lg">
                          <MapPin className="h-5 w-5 text-amber-500" />
                        </div>
                        <Badge variant="outline">{gcp.ward}</Badge>
                      </div>
                      <h3 className="font-semibold mb-1">{gcp.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">Capacity: {gcp.capacity}</p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Current Fill</span>
                          <span className={gcp.currentFill > 80 ? "text-destructive" : gcp.currentFill > 60 ? "text-amber-500" : "text-green-500"}>
                            {gcp.currentFill}%
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${gcp.currentFill > 80 ? "bg-destructive" : gcp.currentFill > 60 ? "bg-amber-500" : "bg-green-500"}`}
                            style={{ width: `${gcp.currentFill}%` }}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {gcp.position.lat.toFixed(4)}, {gcp.position.lng.toFixed(4)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="dumping">
              <div className="grid md:grid-cols-2 gap-4">
                {finalDumpingSites.map((site) => (
                  <Card key={site.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-destructive/20 rounded-lg">
                          <MapPin className="h-6 w-6 text-destructive" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{site.name}</h3>
                          <p className="text-muted-foreground mb-2">Final Dumping Site</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <Truck className="h-4 w-4" /> Capacity: {site.capacity}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Coordinates: {site.position.lat.toFixed(4)}, {site.position.lng.toFixed(4)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Route?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the route
              and remove it from assigned trucks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
