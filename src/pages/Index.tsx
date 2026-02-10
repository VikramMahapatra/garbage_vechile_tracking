import { useState } from "react";
import FleetStats from "@/components/FleetStats";
import MapView from "@/components/MapView";
import TruckList from "@/components/TruckList";
import AlertsPanel from "@/components/AlertsPanel";
import ExpiryAlerts from "@/components/ExpiryAlerts";
import OperationalStats from "@/components/OperationalStats";
import { Card } from "@/components/ui/card";
import { Activity, Clock, TrendingUp } from "lucide-react";

const Index = () => {
  const [selectedTruck, setSelectedTruck] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Fleet Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Real-time monitoring and fleet management
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Card className="px-4 py-2 flex items-center gap-2 bg-success/10 border-success/20">
              <Activity className="h-4 w-4 text-success" />
              <span className="text-sm font-medium text-success">System Online</span>
            </Card>
            <Card className="px-4 py-2 flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </Card>
          </div>
        </div>

        {/* Stats Section */}
        <FleetStats />
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Map */}
          <div className="col-span-12 xl:col-span-8">
            <div className="h-[500px]">
              <MapView selectedTruck={selectedTruck} allowFullscreen />
            </div>
          </div>
          
          {/* Right Column - Truck List */}
          <div className="col-span-12 xl:col-span-4">
            <TruckList onSelectTruck={setSelectedTruck} selectedTruck={selectedTruck} />
          </div>
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
                <span className="text-sm text-muted-foreground">24 trucks active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-warning" />
                <span className="text-sm text-muted-foreground">3 trucks idle</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-chart-1" />
                <span className="text-sm text-muted-foreground">5 at dump yard</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-success" />
              <span>87% collection efficiency today</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
