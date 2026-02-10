import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  MapPinOff,
  Clock,
  Navigation,
  Shield,
  Gauge,
  Bell,
  BellOff,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  Download,
  Search,
  TrendingUp,
  TrendingDown,
  Zap,
  MapPin,
  Truck,
  Calendar,
  RefreshCw,
  Phone,
  MessageCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { ActionDropdown } from "@/components/ActionDropdown";

// Alert types and data
const alertTypes = [
  { id: "all", label: "All Alerts", icon: Bell },
  { id: "route_deviation", label: "Route Deviation", icon: Navigation },
  { id: "missed_pickup", label: "Missed Pickup", icon: MapPinOff },
  { id: "unauthorized_halt", label: "Unauthorized Halt", icon: Clock },
  { id: "speed_violation", label: "Speed Violation", icon: Gauge },
  { id: "geofence_breach", label: "Geofence Breach", icon: Shield },
  { id: "device_tamper", label: "Device Tamper", icon: AlertTriangle },
];

const activeAlerts = [
  {
    id: 1,
    type: "route_deviation",
    truck: "TRK-002",
    driver: "Ramesh Kumar",
    driverPhone: "+919876543210",
    vendorName: "FleetCo Transport",
    vendorPhone: "+919876543220",
    message: "Deviated from assigned route by 350m near Kharadi IT Park",
    location: "18.5523, 73.9423",
    time: "5 min ago",
    timestamp: "2024-01-15 09:45:00",
    severity: "high",
    zone: "Zone A",
    status: "active",
  },
  {
    id: 2,
    type: "missed_pickup",
    truck: "TRK-004",
    driver: "Suresh Patil",
    driverPhone: "+919876543211",
    vendorName: "Metro Logistics",
    vendorPhone: "+919876543221",
    message: "Missed scheduled pickup at Zone C - Point 12 (Hospital Waste)",
    location: "18.5612, 73.9356",
    time: "12 min ago",
    timestamp: "2024-01-15 09:38:00",
    severity: "critical",
    zone: "Zone C",
    status: "active",
  },
  {
    id: 3,
    type: "unauthorized_halt",
    truck: "TRK-002",
    driver: "Ramesh Kumar",
    driverPhone: "+919876543210",
    vendorName: "FleetCo Transport",
    vendorPhone: "+919876543220",
    message: "Unauthorized halt detected for 15 minutes outside designated area",
    location: "18.5534, 73.9445",
    time: "18 min ago",
    timestamp: "2024-01-15 09:32:00",
    severity: "medium",
    zone: "Zone A",
    status: "active",
  },
  {
    id: 4,
    type: "speed_violation",
    truck: "TRK-007",
    driver: "Mahesh Jadhav",
    driverPhone: "+919876543212",
    vendorName: "City Fleet Services",
    vendorPhone: "+919876543222",
    message: "Speed limit exceeded: 65 km/h in 40 km/h zone",
    location: "18.5489, 73.9312",
    time: "25 min ago",
    timestamp: "2024-01-15 09:25:00",
    severity: "high",
    zone: "Zone B",
    status: "active",
  },
  {
    id: 5,
    type: "geofence_breach",
    truck: "TRK-011",
    driver: "Prakash More",
    driverPhone: "+919876543213",
    vendorName: "Metro Logistics",
    vendorPhone: "+919876543221",
    message: "Exited designated collection zone boundary",
    location: "18.5678, 73.9234",
    time: "32 min ago",
    timestamp: "2024-01-15 09:18:00",
    severity: "medium",
    zone: "Zone D",
    status: "acknowledged",
  },
  {
    id: 6,
    type: "device_tamper",
    truck: "TRK-015",
    driver: "Vijay Shinde",
    driverPhone: "+919876543214",
    vendorName: "FleetCo Transport",
    vendorPhone: "+919876543220",
    message: "GPS device disconnection detected - possible tampering",
    location: "18.5456, 73.9567",
    time: "45 min ago",
    timestamp: "2024-01-15 09:05:00",
    severity: "critical",
    zone: "Zone E",
    status: "investigating",
  },
  {
    id: 7,
    type: "route_deviation",
    truck: "TRK-009",
    driver: "Anil Gaikwad",
    driverPhone: "+919876543215",
    vendorName: "City Fleet Services",
    vendorPhone: "+919876543222",
    message: "Off-route for extended period (>500m deviation)",
    location: "18.5398, 73.9478",
    time: "52 min ago",
    timestamp: "2024-01-15 08:58:00",
    severity: "high",
    zone: "Zone B",
    status: "active",
  },
  {
    id: 8,
    type: "missed_pickup",
    truck: "TRK-003",
    driver: "Santosh Kulkarni",
    driverPhone: "+919876543216",
    vendorName: "Metro Logistics",
    vendorPhone: "+919876543221",
    message: "Skipped 3 consecutive pickup points in residential area",
    location: "18.5567, 73.9289",
    time: "1 hr ago",
    timestamp: "2024-01-15 08:50:00",
    severity: "critical",
    zone: "Zone A",
    status: "active",
  },
];

const violationHistory = [
  { id: 1, truck: "TRK-002", driver: "Ramesh Kumar", type: "Route Deviation", count: 12, lastOccurrence: "Today", trend: "up" },
  { id: 2, truck: "TRK-004", driver: "Suresh Patil", type: "Missed Pickup", count: 8, lastOccurrence: "Today", trend: "up" },
  { id: 3, truck: "TRK-007", driver: "Mahesh Jadhav", type: "Speed Violation", count: 15, lastOccurrence: "Today", trend: "stable" },
  { id: 4, truck: "TRK-011", driver: "Prakash More", type: "Geofence Breach", count: 5, lastOccurrence: "Yesterday", trend: "down" },
  { id: 5, truck: "TRK-015", driver: "Vijay Shinde", type: "Device Tamper", count: 2, lastOccurrence: "Today", trend: "up" },
  { id: 6, truck: "TRK-009", driver: "Anil Gaikwad", type: "Unauthorized Halt", count: 7, lastOccurrence: "Yesterday", trend: "down" },
  { id: 7, truck: "TRK-003", driver: "Santosh Kulkarni", type: "Missed Pickup", count: 11, lastOccurrence: "Today", trend: "stable" },
  { id: 8, truck: "TRK-006", driver: "Dinesh Pawar", type: "Route Deviation", count: 4, lastOccurrence: "2 days ago", trend: "down" },
];

const alertTrendData = [
  { time: "6 AM", routeDeviation: 2, missedPickup: 1, speedViolation: 0, geofenceBreach: 1, other: 0 },
  { time: "7 AM", routeDeviation: 5, missedPickup: 3, speedViolation: 2, geofenceBreach: 0, other: 1 },
  { time: "8 AM", routeDeviation: 8, missedPickup: 4, speedViolation: 4, geofenceBreach: 2, other: 2 },
  { time: "9 AM", routeDeviation: 12, missedPickup: 6, speedViolation: 5, geofenceBreach: 3, other: 1 },
  { time: "10 AM", routeDeviation: 7, missedPickup: 5, speedViolation: 3, geofenceBreach: 1, other: 2 },
  { time: "11 AM", routeDeviation: 4, missedPickup: 2, speedViolation: 2, geofenceBreach: 0, other: 1 },
];

const alertDistribution = [
  { name: "Route Deviation", value: 35, color: "hsl(var(--chart-1))" },
  { name: "Missed Pickup", value: 25, color: "hsl(var(--chart-2))" },
  { name: "Speed Violation", value: 20, color: "hsl(var(--chart-3))" },
  { name: "Unauthorized Halt", value: 12, color: "hsl(var(--chart-4))" },
  { name: "Geofence Breach", value: 5, color: "hsl(var(--chart-5))" },
  { name: "Device Tamper", value: 3, color: "hsl(var(--destructive))" },
];

const zoneAlertData = [
  { zone: "Zone A", critical: 5, high: 8, medium: 12, low: 3 },
  { zone: "Zone B", critical: 3, high: 6, medium: 9, low: 5 },
  { zone: "Zone C", critical: 7, high: 4, medium: 6, low: 2 },
  { zone: "Zone D", critical: 2, high: 5, medium: 8, low: 4 },
  { zone: "Zone E", critical: 4, high: 7, medium: 5, low: 6 },
];

export default function Alerts() {
  const [selectedType, setSelectedType] = useState("all");
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [selectedZone, setSelectedZone] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAlert, setSelectedAlert] = useState<typeof activeAlerts[0] | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "route_deviation": return Navigation;
      case "missed_pickup": return MapPinOff;
      case "unauthorized_halt": return Clock;
      case "speed_violation": return Gauge;
      case "geofence_breach": return Shield;
      case "device_tamper": return AlertTriangle;
      default: return Bell;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-destructive/10 text-destructive border-destructive/30";
      case "high": return "bg-orange-500/10 text-orange-500 border-orange-500/30";
      case "medium": return "bg-warning/10 text-warning border-warning/30";
      case "low": return "bg-muted text-muted-foreground border-border";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-destructive/10 text-destructive";
      case "acknowledged": return "bg-warning/10 text-warning";
      case "investigating": return "bg-blue-500/10 text-blue-500";
      case "resolved": return "bg-emerald-500/10 text-emerald-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const filteredAlerts = activeAlerts.filter((alert) => {
    const matchesType = selectedType === "all" || alert.type === selectedType;
    const matchesSeverity = selectedSeverity === "all" || alert.severity === selectedSeverity;
    const matchesZone = selectedZone === "all" || alert.zone === selectedZone;
    const matchesSearch = searchQuery === "" || 
      alert.truck.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSeverity && matchesZone && matchesSearch;
  });

  const criticalCount = activeAlerts.filter(a => a.severity === "critical").length;
  const highCount = activeAlerts.filter(a => a.severity === "high").length;
  const resolvedToday = 24;
  const avgResponseTime = "4.2 min";

  const handleViewDetails = (alert: typeof activeAlerts[0]) => {
    setSelectedAlert(alert);
    setIsDetailOpen(true);
  };

  const handleExportAlerts = () => {
    const csvContent = [
      ["ID", "Type", "Truck", "Driver", "Message", "Zone", "Severity", "Status", "Time"].join(","),
      ...filteredAlerts.map(alert => 
        [alert.id, alert.type, alert.truck, alert.driver, `"${alert.message}"`, alert.zone, alert.severity, alert.status, alert.timestamp].join(",")
      )
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "alerts_export.csv";
    a.click();
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Alerts & Violations</h1>
          <p className="text-muted-foreground">Real-time monitoring of route deviations, missed pickups, and violations</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-destructive/10 rounded-full animate-pulse">
            <span className="h-2 w-2 bg-destructive rounded-full" />
            <span className="text-sm font-medium text-destructive">{activeAlerts.filter(a => a.status === "active").length} Active</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleExportAlerts}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-destructive">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Critical Alerts</p>
              <p className="text-2xl font-bold text-destructive">{criticalCount}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-destructive">
            <TrendingUp className="h-3 w-3" />
            <span>+2 from last hour</span>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">High Priority</p>
              <p className="text-2xl font-bold text-orange-500">{highCount}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Bell className="h-6 w-6 text-orange-500" />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingDown className="h-3 w-3 text-emerald-500" />
            <span>-3 from last hour</span>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Resolved Today</p>
              <p className="text-2xl font-bold text-emerald-500">{resolvedToday}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-emerald-500" />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-emerald-500">
            <TrendingUp className="h-3 w-3" />
            <span>85% resolution rate</span>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Response Time</p>
              <p className="text-2xl font-bold text-blue-500">{avgResponseTime}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Zap className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-emerald-500">
            <TrendingDown className="h-3 w-3" />
            <span>-30s improvement</span>
          </div>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="live" className="space-y-4">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="live" className="data-[state=active]:bg-background">
            <Zap className="h-4 w-4 mr-2" />
            Live Alerts
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-background">
            <Clock className="h-4 w-4 mr-2" />
            Violation History
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-background">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Live Alerts Tab */}
        <TabsContent value="live" className="space-y-4">
          {/* Filters */}
          <Card className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by truck, driver, or message..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-[160px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Alert Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {alertTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severity</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedZone} onValueChange={setSelectedZone}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Zone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Zones</SelectItem>
                    <SelectItem value="Zone A">Zone A</SelectItem>
                    <SelectItem value="Zone B">Zone B</SelectItem>
                    <SelectItem value="Zone C">Zone C</SelectItem>
                    <SelectItem value="Zone D">Zone D</SelectItem>
                    <SelectItem value="Zone E">Zone E</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Alert Type Pills */}
          <div className="flex flex-wrap gap-2">
            {alertTypes.map((type) => {
              const Icon = type.icon;
              const count = type.id === "all" 
                ? activeAlerts.length 
                : activeAlerts.filter(a => a.type === type.id).length;
              return (
                <Button
                  key={type.id}
                  variant={selectedType === type.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType(type.id)}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {type.label}
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                    {count}
                  </Badge>
                </Button>
              );
            })}
          </div>

          {/* Alerts List */}
          <Card className="overflow-hidden">
            <ScrollArea className="h-[500px]">
              <div className="p-4 space-y-3">
                {filteredAlerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <BellOff className="h-12 w-12 mb-4" />
                    <p className="text-lg font-medium">No alerts found</p>
                    <p className="text-sm">Try adjusting your filters</p>
                  </div>
                ) : (
                  filteredAlerts.map((alert) => {
                    const Icon = getAlertIcon(alert.type);
                    return (
                      <Card
                        key={alert.id}
                        className={`p-4 border-l-4 hover:shadow-lg transition-all cursor-pointer ${
                          alert.severity === "critical" ? "border-l-destructive" :
                          alert.severity === "high" ? "border-l-orange-500" :
                          alert.severity === "medium" ? "border-l-warning" : "border-l-border"
                        }`}
                        onClick={() => handleViewDetails(alert)}
                      >
                        <div className="flex gap-4">
                          <div className="flex-shrink-0">
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                              alert.severity === "critical" ? "bg-destructive/10" :
                              alert.severity === "high" ? "bg-orange-500/10" :
                              alert.severity === "medium" ? "bg-warning/10" : "bg-muted"
                            }`}>
                              <Icon className={`h-5 w-5 ${
                                alert.severity === "critical" ? "text-destructive" :
                                alert.severity === "high" ? "text-orange-500" :
                                alert.severity === "medium" ? "text-warning" : "text-muted-foreground"
                              }`} />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-foreground flex items-center gap-1">
                                  <Truck className="h-4 w-4" />
                                  {alert.truck}
                                </span>
                                <span className="text-muted-foreground">•</span>
                                <span className="text-sm text-muted-foreground">{alert.driver}</span>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                                  {alert.severity}
                                </Badge>
                                <Badge variant="secondary" className={getStatusColor(alert.status)}>
                                  {alert.status}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm text-foreground mb-2">{alert.message}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {alert.zone}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {alert.time}
                              </span>
                            </div>
                          </div>
                          <div className="flex-shrink-0 flex items-center gap-2">
                            <ActionDropdown
                              truckId={alert.truck}
                              driverName={alert.driver}
                              driverPhone={alert.driverPhone}
                              vendorName={alert.vendorName}
                              vendorPhone={alert.vendorPhone}
                              alertType={alert.type.replace(/_/g, " ").toUpperCase()}
                              alertMessage={alert.message}
                              size="sm"
                            />
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>

        {/* Violation History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <div className="p-4 border-b border-border">
              <h3 className="text-lg font-semibold">Violation Summary by Vehicle</h3>
              <p className="text-sm text-muted-foreground">Track repeat offenders and violation patterns</p>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Truck</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Violation Type</TableHead>
                  <TableHead className="text-center">Count (30 days)</TableHead>
                  <TableHead>Last Occurrence</TableHead>
                  <TableHead>Trend</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {violationHistory.map((violation) => (
                  <TableRow key={violation.id}>
                    <TableCell className="font-medium">{violation.truck}</TableCell>
                    <TableCell>{violation.driver}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{violation.type}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`font-semibold ${violation.count > 10 ? "text-destructive" : violation.count > 5 ? "text-warning" : "text-foreground"}`}>
                        {violation.count}
                      </span>
                    </TableCell>
                    <TableCell>{violation.lastOccurrence}</TableCell>
                    <TableCell>
                      {violation.trend === "up" && (
                        <div className="flex items-center gap-1 text-destructive">
                          <TrendingUp className="h-4 w-4" />
                          <span className="text-xs">Increasing</span>
                        </div>
                      )}
                      {violation.trend === "down" && (
                        <div className="flex items-center gap-1 text-emerald-500">
                          <TrendingDown className="h-4 w-4" />
                          <span className="text-xs">Decreasing</span>
                        </div>
                      )}
                      {violation.trend === "stable" && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <span className="text-xs">Stable</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">View Details</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Alert Trend Chart */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Alert Trend Today</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={alertTrendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="time" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--background))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }} 
                    />
                    <Area type="monotone" dataKey="routeDeviation" stackId="1" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.6} name="Route Deviation" />
                    <Area type="monotone" dataKey="missedPickup" stackId="1" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.6} name="Missed Pickup" />
                    <Area type="monotone" dataKey="speedViolation" stackId="1" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3))" fillOpacity={0.6} name="Speed Violation" />
                    <Area type="monotone" dataKey="geofenceBreach" stackId="1" stroke="hsl(var(--chart-4))" fill="hsl(var(--chart-4))" fillOpacity={0.6} name="Geofence Breach" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Alert Distribution Pie */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Alert Distribution</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={alertDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {alertDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--background))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }} 
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Zone Alert Comparison */}
            <Card className="p-4 lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4">Alerts by Zone & Severity</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={zoneAlertData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="zone" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--background))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }} 
                    />
                    <Legend />
                    <Bar dataKey="critical" fill="hsl(var(--destructive))" name="Critical" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="high" fill="hsl(32, 95%, 44%)" name="High" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="medium" fill="hsl(var(--warning))" name="Medium" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="low" fill="hsl(var(--muted-foreground))" name="Low" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Alert Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedAlert && (
                <>
                  {(() => {
                    const Icon = getAlertIcon(selectedAlert.type);
                    return <Icon className="h-5 w-5 text-destructive" />;
                  })()}
                  Alert Details
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Complete information about this alert
            </DialogDescription>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Truck</p>
                  <p className="font-semibold">{selectedAlert.truck}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Driver</p>
                  <p className="font-semibold">{selectedAlert.driver}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Zone</p>
                  <p className="font-semibold">{selectedAlert.zone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Severity</p>
                  <Badge variant="outline" className={getSeverityColor(selectedAlert.severity)}>
                    {selectedAlert.severity}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-semibold flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {selectedAlert.location}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Timestamp</p>
                  <p className="font-semibold flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {selectedAlert.timestamp}
                  </p>
                </div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Alert Message</p>
                <p className="text-foreground">{selectedAlert.message}</p>
              </div>
            </div>
          )}
          <DialogFooter className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Close
            </Button>
            {selectedAlert && (
              <ActionDropdown
                truckId={selectedAlert.truck}
                driverName={selectedAlert.driver}
                driverPhone={selectedAlert.driverPhone}
                vendorName={selectedAlert.vendorName}
                vendorPhone={selectedAlert.vendorPhone}
                alertType={selectedAlert.type.replace(/_/g, " ").toUpperCase()}
                alertMessage={selectedAlert.message}
              />
            )}
            <Button variant="secondary">
              <CheckCircle className="h-4 w-4 mr-2" />
              Acknowledge
            </Button>
            <Button>
              <Navigation className="h-4 w-4 mr-2" />
              View on Map
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
