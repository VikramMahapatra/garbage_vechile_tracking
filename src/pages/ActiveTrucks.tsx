import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ArrowLeft, Search, Download, Truck, MapPin, User, Building2, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { trucks } from "@/data/fleetData";
import { mockVendors, mockZones, mockWards } from "@/data/masterData";

const ITEMS_PER_PAGE = 10;

const ActiveTrucks = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [vendorFilter, setVendorFilter] = useState("all");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [wardFilter, setWardFilter] = useState("all");
  const [routeTypeFilter, setRouteTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const activeTrucks = useMemo(() => {
    return trucks.filter(truck => 
      truck.status === 'moving' || truck.status === 'idle' || truck.status === 'dumping'
    );
  }, []);

  const vendors = useMemo(() => {
    return mockVendors.map(v => ({ id: v.id, name: v.companyName }));
  }, []);

  const filteredWards = zoneFilter !== "all" 
    ? mockWards.filter(w => w.zoneId === zoneFilter) 
    : mockWards;

  const filteredTrucks = useMemo(() => {
    return activeTrucks.filter(truck => {
      const matchesSearch = searchQuery === "" || 
        truck.truckNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        truck.driver.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesVendor = vendorFilter === "all" || truck.vendorId === vendorFilter;
      const matchesZone = zoneFilter === "all" || truck.zoneId === zoneFilter;
      const matchesWard = wardFilter === "all" || truck.wardId === wardFilter;
      const matchesRouteType = routeTypeFilter === "all" || truck.truckType === routeTypeFilter;
      return matchesSearch && matchesVendor && matchesZone && matchesWard && matchesRouteType;
    });
  }, [activeTrucks, searchQuery, vendorFilter, zoneFilter, wardFilter, routeTypeFilter]);

  const totalPages = Math.ceil(filteredTrucks.length / ITEMS_PER_PAGE);
  const paginatedTrucks = filteredTrucks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getVendorName = (vendorId?: string) => {
    if (!vendorId) return "—";
    const vendor = mockVendors.find(v => v.id === vendorId);
    return vendor?.companyName || "—";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "moving":
        return <Badge className="bg-success/10 text-success border-success/30">Moving</Badge>;
      case "dumping":
        return <Badge className="bg-chart-2/10 text-chart-2 border-chart-2/30">Dumping</Badge>;
      case "idle":
        return <Badge className="bg-warning/10 text-warning border-warning/30">Idle</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleExport = () => {
    const csvContent = [
      ["Truck", "Driver", "Vendor", "Route", "Zone", "Block", "Type", "Status", "Speed", "Last Update"].join(","),
      ...filteredTrucks.map(truck => {
        const zone = mockZones.find(z => z.id === truck.zoneId);
        const ward = mockWards.find(w => w.id === truck.wardId);
        return [truck.truckNumber, truck.driver, getVendorName(truck.vendorId), truck.route || '', zone?.name || '', ward?.name || '', truck.truckType, truck.status, truck.speed || 0, truck.lastUpdate].join(",");
      })
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "active_trucks.csv";
    a.click();
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Active Trucks</h1>
            <p className="text-muted-foreground text-sm">All currently active trucks in the fleet</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-success">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center"><Truck className="h-5 w-5 text-success" /></div>
            <div><p className="text-sm text-muted-foreground">Total Active</p><p className="text-xl font-bold">{filteredTrucks.length}</p></div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-chart-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-chart-2/10 flex items-center justify-center"><Activity className="h-5 w-5 text-chart-2" /></div>
            <div><p className="text-sm text-muted-foreground">Moving</p><p className="text-xl font-bold">{filteredTrucks.filter(t => t.status === 'moving').length}</p></div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-primary">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><MapPin className="h-5 w-5 text-primary" /></div>
            <div><p className="text-sm text-muted-foreground">Dumping</p><p className="text-xl font-bold">{filteredTrucks.filter(t => t.status === 'dumping').length}</p></div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-warning">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center"><Truck className="h-5 w-5 text-warning" /></div>
            <div><p className="text-sm text-muted-foreground">Idle</p><p className="text-xl font-bold">{filteredTrucks.filter(t => t.status === 'idle').length}</p></div>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by truck number or driver..." className="pl-10" value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
          </div>
          <Select value={zoneFilter} onValueChange={(v) => { setZoneFilter(v); setWardFilter("all"); setCurrentPage(1); }}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Zones" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Zones</SelectItem>
              {mockZones.map(z => <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={wardFilter} onValueChange={(v) => { setWardFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Wards" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Wards</SelectItem>
              {filteredWards.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={vendorFilter} onValueChange={(v) => { setVendorFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[180px]">
              <Building2 className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Vendors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Vendors</SelectItem>
              {vendors.map(vendor => <SelectItem key={vendor.id} value={vendor.id}>{vendor.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={routeTypeFilter} onValueChange={(v) => { setRouteTypeFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="All Types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="primary">Primary</SelectItem>
              <SelectItem value="secondary">Secondary</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Truck</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Zone</TableHead>
              <TableHead>Block</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Speed</TableHead>
              <TableHead>Last Update</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTrucks.map((truck) => {
              const zone = mockZones.find(z => z.id === truck.zoneId);
              const ward = mockWards.find(w => w.id === truck.wardId);
              return (
                <TableRow key={truck.id}>
                  <TableCell className="font-medium">{truck.truckNumber}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {truck.driver}
                    </div>
                  </TableCell>
                  <TableCell>{getVendorName(truck.vendorId)}</TableCell>
                  <TableCell>{truck.route || "—"}</TableCell>
                  <TableCell className="text-xs">{zone?.name || "—"}</TableCell>
                  <TableCell className="text-xs">{ward?.name || "—"}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs capitalize">{truck.truckType === "primary" ? "P" : "S"}</Badge></TableCell>
                  <TableCell>{getStatusBadge(truck.status)}</TableCell>
                  <TableCell>{truck.speed ? `${truck.speed} km/h` : "—"}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{truck.lastUpdate}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {totalPages > 1 && (
          <div className="p-4 border-t">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink onClick={() => setCurrentPage(page)} isActive={currentPage === page} className="cursor-pointer">{page}</PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ActiveTrucks;