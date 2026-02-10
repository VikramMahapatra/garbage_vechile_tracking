import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { mockTrucks, mockVendors, mockDrivers, TruckMaster } from '@/data/masterData';
import { Plus, Search, Edit, Trash2, Truck, Download, Fuel, Calendar, Shield } from 'lucide-react';

export default function MasterTrucks() {
  const { toast } = useToast();
  const [trucks, setTrucks] = useState<TruckMaster[]>(mockTrucks);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTruck, setEditingTruck] = useState<TruckMaster | null>(null);
  
  const [formData, setFormData] = useState<Partial<TruckMaster>>({
    registrationNumber: '',
    type: 'compactor',
    capacity: 8,
    capacityUnit: 'tons',
    routeType: 'primary',
    vendorId: '',
    driverId: '',
    imeiNumber: '',
    fuelType: 'diesel',
    manufacturingYear: new Date().getFullYear(),
    insuranceExpiry: '',
    fitnessExpiry: '',
    status: 'active',
    lastServiceDate: ''
  });

  const filteredTrucks = trucks.filter(truck => {
    const matchesSearch = truck.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         truck.imeiNumber.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || truck.status === statusFilter;
    const matchesType = typeFilter === 'all' || truck.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-success/20 text-success border-success/30">Active</Badge>;
      case 'maintenance': return <Badge className="bg-warning/20 text-warning border-warning/30">Maintenance</Badge>;
      case 'inactive': return <Badge variant="secondary">Inactive</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      'mini-truck': 'bg-blue-500/20 text-blue-600 border-blue-500/30',
      'compactor': 'bg-purple-500/20 text-purple-600 border-purple-500/30',
      'dumper': 'bg-orange-500/20 text-orange-600 border-orange-500/30',
      'open-truck': 'bg-teal-500/20 text-teal-600 border-teal-500/30'
    };
    return <Badge className={colors[type] || ''}>{type.replace('-', ' ')}</Badge>;
  };

  const getVendorName = (vendorId: string) => mockVendors.find(v => v.id === vendorId)?.companyName || 'Unknown';
  const getDriverName = (driverId?: string) => driverId ? mockDrivers.find(d => d.id === driverId)?.name || 'Unknown' : 'Not Assigned';

  const handleSubmit = () => {
    if (editingTruck) {
      setTrucks(prev => prev.map(t => t.id === editingTruck.id ? { ...t, ...formData } as TruckMaster : t));
      toast({ title: "Truck Updated", description: "Truck information has been updated." });
    } else {
      const newTruck: TruckMaster = {
        ...formData as TruckMaster,
        id: `TRK${String(trucks.length + 1).padStart(3, '0')}`
      };
      setTrucks(prev => [...prev, newTruck]);
      toast({ title: "Truck Added", description: "New truck has been added successfully." });
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    setTrucks(prev => prev.filter(t => t.id !== id));
    toast({ title: "Truck Deleted", description: "Truck has been removed from the system." });
  };

  const resetForm = () => {
    setFormData({ registrationNumber: '', type: 'compactor', capacity: 8, capacityUnit: 'tons', routeType: 'primary', vendorId: '', driverId: '', imeiNumber: '', fuelType: 'diesel', manufacturingYear: new Date().getFullYear(), insuranceExpiry: '', fitnessExpiry: '', status: 'active', lastServiceDate: '' });
    setEditingTruck(null);
    setIsAddDialogOpen(false);
  };

  const openEditDialog = (truck: TruckMaster) => {
    setEditingTruck(truck);
    setFormData(truck);
    setIsAddDialogOpen(true);
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Registration', 'Type', 'Capacity', 'Route Type', 'Vendor', 'Driver', 'IMEI', 'Fuel Type', 'Status'];
    const rows = filteredTrucks.map(t => [t.id, t.registrationNumber, t.type, `${t.capacity} ${t.capacityUnit}`, t.routeType, getVendorName(t.vendorId), getDriverName(t.driverId), t.imeiNumber, t.fuelType, t.status]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trucks.csv';
    a.click();
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Truck Management</h1>
          <p className="text-muted-foreground">Manage fleet vehicles and assignments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsAddDialogOpen(open); }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Add Truck</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingTruck ? 'Edit Truck' : 'Add New Truck'}</DialogTitle>
                <DialogDescription>Enter the truck details below</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Registration Number</Label>
                    <Input value={formData.registrationNumber} onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>IMEI Number</Label>
                    <Input value={formData.imeiNumber} onChange={(e) => setFormData({ ...formData, imeiNumber: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Truck Type</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as TruckMaster['type'] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mini-truck">Mini Truck</SelectItem>
                        <SelectItem value="compactor">Compactor</SelectItem>
                        <SelectItem value="dumper">Dumper</SelectItem>
                        <SelectItem value="open-truck">Open Truck</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Route Type</Label>
                    <Select value={formData.routeType} onValueChange={(value) => setFormData({ ...formData, routeType: value as 'primary' | 'secondary' })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primary">Primary</SelectItem>
                        <SelectItem value="secondary">Secondary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Capacity</Label>
                    <Input type="number" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <Select value={formData.capacityUnit} onValueChange={(value) => setFormData({ ...formData, capacityUnit: value as 'tons' | 'cubic-meters' })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tons">Tons</SelectItem>
                        <SelectItem value="cubic-meters">Cubic Meters</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Fuel Type</Label>
                    <Select value={formData.fuelType} onValueChange={(value) => setFormData({ ...formData, fuelType: value as TruckMaster['fuelType'] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="diesel">Diesel</SelectItem>
                        <SelectItem value="cng">CNG</SelectItem>
                        <SelectItem value="electric">Electric</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Vendor</Label>
                    <Select value={formData.vendorId} onValueChange={(value) => setFormData({ ...formData, vendorId: value })}>
                      <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                      <SelectContent>
                        {mockVendors.map(v => <SelectItem key={v.id} value={v.id}>{v.companyName}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Driver</Label>
                    <Select value={formData.driverId || 'none'} onValueChange={(value) => setFormData({ ...formData, driverId: value === 'none' ? '' : value })}>
                      <SelectTrigger><SelectValue placeholder="Select driver" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Not Assigned</SelectItem>
                        {mockDrivers.filter(d => d.status === 'active').map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Manufacturing Year</Label>
                    <Input type="number" value={formData.manufacturingYear} onChange={(e) => setFormData({ ...formData, manufacturingYear: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Insurance Expiry</Label>
                    <Input type="date" value={formData.insuranceExpiry} onChange={(e) => setFormData({ ...formData, insuranceExpiry: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Fitness Expiry</Label>
                    <Input type="date" value={formData.fitnessExpiry} onChange={(e) => setFormData({ ...formData, fitnessExpiry: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Last Service Date</Label>
                    <Input type="date" value={formData.lastServiceDate} onChange={(e) => setFormData({ ...formData, lastServiceDate: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as TruckMaster['status'] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
                <Button onClick={handleSubmit}>{editingTruck ? 'Update' : 'Add'} Truck</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Trucks</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{trucks.length}</div></CardContent>
        </Card>
        <Card className="bg-success/10 border-success/30">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-success">Active</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-success">{trucks.filter(t => t.status === 'active').length}</div></CardContent>
        </Card>
        <Card className="bg-warning/10 border-warning/30">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-warning">Maintenance</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-warning">{trucks.filter(t => t.status === 'maintenance').length}</div></CardContent>
        </Card>
        <Card className="bg-primary/10 border-primary/30">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-primary">Primary</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-primary">{trucks.filter(t => t.routeType === 'primary').length}</div></CardContent>
        </Card>
        <Card className="bg-secondary/10 border-secondary/30">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-secondary">Secondary</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-secondary">{trucks.filter(t => t.routeType === 'secondary').length}</div></CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by registration, IMEI..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="mini-truck">Mini Truck</SelectItem>
                <SelectItem value="compactor">Compactor</SelectItem>
                <SelectItem value="dumper">Dumper</SelectItem>
                <SelectItem value="open-truck">Open Truck</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Vendor / Driver</TableHead>
                <TableHead>Expiry Dates</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrucks.map((truck) => (
                <TableRow key={truck.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Truck className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{truck.registrationNumber}</div>
                        <div className="text-sm text-muted-foreground">{truck.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {getTypeBadge(truck.type)}
                      <Badge variant="outline" className="text-xs">{truck.routeType}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{truck.capacity}</span>
                      <span className="text-muted-foreground text-sm">{truck.capacityUnit}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Fuel className="h-3 w-3" /> {truck.fuelType}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{getVendorName(truck.vendorId)}</div>
                    <div className="text-xs text-muted-foreground">{getDriverName(truck.driverId)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-1"><Shield className="h-3 w-3" /> Ins: {truck.insuranceExpiry}</div>
                      <div className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Fit: {truck.fitnessExpiry}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(truck.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(truck)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(truck.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
