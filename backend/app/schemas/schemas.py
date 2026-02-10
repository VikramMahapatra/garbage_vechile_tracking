from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Zone Schemas
class ZoneBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    supervisor_name: Optional[str] = None
    supervisor_phone: Optional[str] = None
    total_wards: int = 0
    status: str = "active"

class ZoneCreate(ZoneBase):
    id: str

class Zone(ZoneBase):
    id: str
    
    class Config:
        from_attributes = True

# Ward Schemas
class WardBase(BaseModel):
    name: str
    code: str
    zone_id: str
    population: int = 0
    area: float = 0.0
    total_pickup_points: int = 0
    status: str = "active"

class WardCreate(WardBase):
    id: str

class Ward(WardBase):
    id: str
    
    class Config:
        from_attributes = True

# Vendor Schemas
class VendorBase(BaseModel):
    name: str
    company_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    gst_number: Optional[str] = None
    contract_start: Optional[str] = None
    contract_end: Optional[str] = None
    status: str = "active"
    supervisor_name: Optional[str] = None
    supervisor_phone: Optional[str] = None

class VendorCreate(VendorBase):
    id: str

class Vendor(VendorBase):
    id: str
    
    class Config:
        from_attributes = True

# Driver Schemas
class DriverBase(BaseModel):
    name: str
    phone: Optional[str] = None
    license_number: Optional[str] = None
    license_expiry: Optional[str] = None
    vendor_id: str
    status: str = "active"

class DriverCreate(DriverBase):
    id: str

class Driver(DriverBase):
    id: str
    
    class Config:
        from_attributes = True

# Truck Schemas
class TruckBase(BaseModel):
    registration_number: str
    type: str
    capacity: float
    capacity_unit: str
    route_type: str
    vendor_id: str
    driver_id: Optional[str] = None
    imei_number: str
    fuel_type: str
    manufacturing_year: int
    insurance_expiry: str
    fitness_expiry: str
    status: str = "active"
    last_service_date: Optional[str] = None
    is_spare: bool = False
    zone_id: str
    ward_id: str
    assigned_route_id: Optional[str] = None

class TruckCreate(TruckBase):
    id: str

class TruckLive(BaseModel):
    id: str
    registration_number: str
    type: str
    route_type: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    current_status: str = "idle"
    speed: float = 0.0
    trips_completed: int = 0
    trips_allowed: int = 5
    driver_name: Optional[str] = None
    route_name: Optional[str] = None
    vendor_id: str
    zone_id: str
    ward_id: str
    is_spare: bool = False
    last_update: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class Truck(TruckBase):
    id: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    current_status: str = "idle"
    speed: float = 0.0
    trips_completed: int = 0
    trips_allowed: int = 5
    last_update: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Route Schemas
class RouteBase(BaseModel):
    name: str
    code: str
    type: str
    ward_id: str
    zone_id: str
    total_pickup_points: int = 0
    estimated_distance: float = 0.0
    estimated_time: int = 0
    status: str = "active"

class RouteCreate(RouteBase):
    id: str

class Route(RouteBase):
    id: str
    
    class Config:
        from_attributes = True

# Pickup Point Schemas
class PickupPointBase(BaseModel):
    point_code: str
    name: str
    address: Optional[str] = None
    latitude: float
    longitude: float
    route_id: str
    ward_id: str
    waste_type: str
    type: str
    expected_pickup_time: Optional[str] = None
    schedule: Optional[str] = None
    geofence_radius: int = 30
    status: str = "active"
    last_collection: Optional[str] = None

class PickupPointCreate(PickupPointBase):
    id: str

class PickupPoint(PickupPointBase):
    id: str
    
    class Config:
        from_attributes = True

# Alert Schemas
class AlertBase(BaseModel):
    truck_id: str
    alert_type: str
    severity: str
    message: str
    status: str = "active"

class AlertCreate(AlertBase):
    pass

class Alert(AlertBase):
    id: int
    timestamp: datetime
    resolved_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Response Models
class TruckWithDetails(Truck):
    vendor_name: Optional[str] = None
    driver_name: Optional[str] = None
    route_name: Optional[str] = None
    zone_name: Optional[str] = None
    ward_name: Optional[str] = None
