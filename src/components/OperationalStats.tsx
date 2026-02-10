import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  mockZones, 
  mockWards, 
  mockVendors, 
  mockTrucks, 
  mockRoutes,
  mockDrivers 
} from "@/data/masterData";
import { 
  MapPin, 
  Building2, 
  Truck, 
  Users, 
  Route, 
  UserCheck,
  TrendingUp,
  AlertCircle,
  ChevronRight
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis } from "recharts";
import { useNavigate } from "react-router-dom";

const OperationalStats = () => {
  const navigate = useNavigate();
  // Calculate stats
  const activeZones = mockZones.filter(z => z.status === 'active').length;
  const activeWards = mockWards.filter(w => w.status === 'active').length;
  const activeVendors = mockVendors.filter(v => v.status === 'active').length;
  const activeTrucks = mockTrucks.filter(t => t.status === 'active').length;
  const maintenanceTrucks = mockTrucks.filter(t => t.status === 'maintenance').length;
  const activeDrivers = mockDrivers.filter(d => d.status === 'active').length;
  const activeRoutes = mockRoutes.filter(r => r.status === 'active').length;

  // Truck type distribution
  const truckTypeData = [
    { name: 'Compactor', value: mockTrucks.filter(t => t.type === 'compactor').length, fill: 'hsl(var(--chart-1))' },
    { name: 'Mini-truck', value: mockTrucks.filter(t => t.type === 'mini-truck').length, fill: 'hsl(var(--chart-2))' },
    { name: 'Dumper', value: mockTrucks.filter(t => t.type === 'dumper').length, fill: 'hsl(var(--chart-3))' },
    { name: 'Open-truck', value: mockTrucks.filter(t => t.type === 'open-truck').length, fill: 'hsl(var(--chart-4))' },
  ];

  // Vendor truck distribution
  const vendorData = mockVendors.map(v => ({
    name: v.name.split(' ')[0],
    trucks: v.trucksOwned.length,
    spare: v.spareTrucks.length,
  }));

  // Zone ward distribution
  const zoneData = mockZones.map(z => ({
    name: z.code,
    wards: z.totalWards,
  }));

  const chartConfig = {
    compactor: { label: "Compactor", color: "hsl(var(--chart-1))" },
    miniTruck: { label: "Mini-truck", color: "hsl(var(--chart-2))" },
    dumper: { label: "Dumper", color: "hsl(var(--chart-3))" },
    openTruck: { label: "Open-truck", color: "hsl(var(--chart-4))" },
    trucks: { label: "Trucks", color: "hsl(var(--primary))" },
    spare: { label: "Spare", color: "hsl(var(--chart-2))" },
    wards: { label: "Wards", color: "hsl(var(--chart-1))" },
  };

  const stats = [
    { label: "Zones", value: activeZones, total: mockZones.length, icon: MapPin, color: "text-chart-1", bgColor: "bg-chart-1/10", route: "/master/zones-wards" },
    { label: "Wards", value: activeWards, total: mockWards.length, icon: Building2, color: "text-chart-2", bgColor: "bg-chart-2/10", route: "/master/zones-wards" },
    { label: "Vendors", value: activeVendors, total: mockVendors.length, icon: Users, color: "text-chart-3", bgColor: "bg-chart-3/10", route: "/master/vendors" },
    { label: "Trucks", value: activeTrucks, total: mockTrucks.length, icon: Truck, color: "text-chart-4", bgColor: "bg-chart-4/10", route: "/master/trucks" },
    { label: "Drivers", value: activeDrivers, total: mockDrivers.length, icon: UserCheck, color: "text-primary", bgColor: "bg-primary/10", route: "/master/drivers" },
    { label: "Routes", value: activeRoutes, total: mockRoutes.length, icon: Route, color: "text-chart-5", bgColor: "bg-chart-5/10", route: "/master/routes-pickups" },
  ];

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Operational Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index} 
                className={`${stat.bgColor} rounded-lg p-3 flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity group`}
                onClick={() => navigate(stat.route)}
              >
                <Icon className={`h-4 w-4 ${stat.color}`} />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-sm font-semibold">
                    {stat.value}<span className="text-xs text-muted-foreground">/{stat.total}</span>
                  </p>
                </div>
                <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            );
          })}
        </div>

        {/* Maintenance Alert */}
        {maintenanceTrucks > 0 && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-warning/10 border border-warning/20">
            <AlertCircle className="h-4 w-4 text-warning" />
            <span className="text-sm text-warning">
              {maintenanceTrucks} truck{maintenanceTrucks > 1 ? 's' : ''} in maintenance
            </span>
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Truck Type Distribution */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Fleet by Type</p>
            <ChartContainer config={chartConfig} className="h-[120px]">
              <PieChart>
                <Pie
                  data={truckTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={45}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {truckTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            <div className="flex flex-wrap gap-2 justify-center">
              {truckTypeData.map((item, index) => (
                <div key={index} className="flex items-center gap-1 text-xs">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Vendor Distribution */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Trucks by Vendor</p>
            <ChartContainer config={chartConfig} className="h-[120px]">
              <BarChart data={vendorData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={50} 
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="trucks" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </div>
        </div>

        {/* Zone Summary */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Zone Coverage</p>
          <div className="flex gap-2">
            {mockZones.slice(0, 5).map((zone) => (
              <div 
                key={zone.id} 
                className="flex-1 text-center p-2 rounded-lg bg-muted/50"
              >
                <p className="text-xs font-semibold">{zone.code}</p>
                <p className="text-lg font-bold text-primary">{zone.totalWards}</p>
                <p className="text-[10px] text-muted-foreground">wards</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OperationalStats;
