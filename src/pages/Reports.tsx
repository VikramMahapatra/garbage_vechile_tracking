import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { 
  Download, 
  FileText, 
  Truck, 
  MapPin, 
  Users, 
  Fuel, 
  AlertTriangle, 
  Scale,
  Calendar,
  Filter,
  FileSpreadsheet,
  Printer,
  TrendingUp,
  TrendingDown,
  Clock,
  Route,
  Trash2,
  Building,
  Shield,
  IdCard,
  Gauge,
  XCircle,
  WifiOff,
  Zap,
  ArrowRightLeft,
  Wrench,
  Mail,
  Send
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { mockTrucks, mockDrivers } from "@/data/masterData";
import { differenceInDays, parseISO, format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

// Mock data for reports
const dailyPickupCoverageData = [
  { id: 1, date: "2024-01-15", ward: "Kharadi East", zone: "Zone A", truck: "MH-12-AB-1234", driver: "Rajesh Kumar", totalPoints: 45, covered: 43, missed: 2, weight: 2.4, status: "completed" },
  { id: 2, date: "2024-01-15", ward: "Kharadi West", zone: "Zone A", truck: "MH-12-CD-5678", driver: "Amit Singh", totalPoints: 52, covered: 52, missed: 0, weight: 2.8, status: "completed" },
  { id: 3, date: "2024-01-15", ward: "Viman Nagar", zone: "Zone B", truck: "MH-12-EF-9012", driver: "Suresh Patil", totalPoints: 38, covered: 35, missed: 3, weight: 1.9, status: "partial" },
  { id: 4, date: "2024-01-15", ward: "Kalyani Nagar", zone: "Zone B", truck: "MH-12-GH-3456", driver: "Mahesh Yadav", totalPoints: 41, covered: 41, missed: 0, weight: 2.2, status: "completed" },
  { id: 5, date: "2024-01-15", ward: "Wadgaon Sheri", zone: "Zone C", truck: "MH-12-IJ-7890", driver: "Ravi Sharma", totalPoints: 35, covered: 30, missed: 5, weight: 1.6, status: "partial" },
  { id: 6, date: "2024-01-14", ward: "Hadapsar", zone: "Zone C", truck: "MH-12-KL-1122", driver: "Manoj Patil", totalPoints: 48, covered: 47, missed: 1, weight: 2.5, status: "completed" },
  { id: 7, date: "2024-01-14", ward: "Magarpatta", zone: "Zone D", truck: "MH-12-MN-3344", driver: "Ravi Deshmukh", totalPoints: 55, covered: 50, missed: 5, weight: 2.7, status: "partial" },
  { id: 8, date: "2024-01-14", ward: "Koregaon Park", zone: "Zone A", truck: "MH-12-OP-5566", driver: "Sunil Yadav", totalPoints: 42, covered: 42, missed: 0, weight: 2.3, status: "completed" },
  { id: 9, date: "2024-01-14", ward: "Mundhwa", zone: "Zone B", truck: "MH-12-QR-7788", driver: "Anil Sharma", totalPoints: 39, covered: 37, missed: 2, weight: 2.0, status: "completed" },
  { id: 10, date: "2024-01-14", ward: "Keshav Nagar", zone: "Zone C", truck: "MH-12-ST-9900", driver: "Deepak Jadhav", totalPoints: 44, covered: 40, missed: 4, weight: 2.1, status: "partial" },
  { id: 11, date: "2024-01-13", ward: "Wagholi", zone: "Zone D", truck: "MH-12-UV-1212", driver: "Vikram Singh", totalPoints: 50, covered: 50, missed: 0, weight: 2.6, status: "completed" },
  { id: 12, date: "2024-01-13", ward: "Lohegaon", zone: "Zone A", truck: "MH-12-WX-3434", driver: "Prakash Rane", totalPoints: 36, covered: 34, missed: 2, weight: 1.8, status: "completed" },
];

const routePerformanceData = [
  { route: "Route A1", completion: 98, avgTime: "4.2 hrs", deviations: 2, efficiency: 96 },
  { route: "Route A2", completion: 95, avgTime: "3.8 hrs", deviations: 5, efficiency: 91 },
  { route: "Route B1", completion: 100, avgTime: "4.5 hrs", deviations: 0, efficiency: 99 },
  { route: "Route B2", completion: 88, avgTime: "5.1 hrs", deviations: 8, efficiency: 82 },
  { route: "Route C1", completion: 92, avgTime: "4.0 hrs", deviations: 4, efficiency: 88 },
  { route: "Route C2", completion: 97, avgTime: "3.9 hrs", deviations: 1, efficiency: 95 },
  { route: "Route D1", completion: 85, avgTime: "5.5 hrs", deviations: 10, efficiency: 75 },
  { route: "Route D2", completion: 94, avgTime: "4.1 hrs", deviations: 3, efficiency: 90 },
  { route: "Route E1", completion: 99, avgTime: "3.7 hrs", deviations: 1, efficiency: 98 },
  { route: "Route E2", completion: 91, avgTime: "4.4 hrs", deviations: 6, efficiency: 85 },
  { route: "Route F1", completion: 96, avgTime: "4.0 hrs", deviations: 2, efficiency: 93 },
  { route: "Route F2", completion: 89, avgTime: "4.8 hrs", deviations: 7, efficiency: 80 },
];

const truckUtilizationData = [
  { truck: "MH-12-AB-1234", type: "Compactor", trips: 3, operatingHours: 8.5, idleTime: 1.2, distance: 45, utilization: 92 },
  { truck: "MH-12-CD-5678", type: "Mini Truck", trips: 4, operatingHours: 9.0, idleTime: 0.8, distance: 52, utilization: 95 },
  { truck: "MH-12-EF-9012", type: "Dumper", trips: 2, operatingHours: 7.2, idleTime: 2.1, distance: 38, utilization: 78 },
  { truck: "MH-12-GH-3456", type: "Open Truck", trips: 3, operatingHours: 8.0, idleTime: 1.5, distance: 41, utilization: 85 },
  { truck: "MH-12-IJ-7890", type: "Compactor", trips: 3, operatingHours: 8.8, idleTime: 0.5, distance: 48, utilization: 96 },
  { truck: "MH-12-KL-1122", type: "Mini Truck", trips: 5, operatingHours: 9.5, idleTime: 0.3, distance: 58, utilization: 98 },
  { truck: "MH-12-MN-3344", type: "Dumper", trips: 2, operatingHours: 6.5, idleTime: 2.5, distance: 32, utilization: 72 },
  { truck: "MH-12-OP-5566", type: "Compactor", trips: 4, operatingHours: 8.2, idleTime: 1.0, distance: 50, utilization: 91 },
  { truck: "MH-12-QR-7788", type: "Open Truck", trips: 3, operatingHours: 7.8, idleTime: 1.8, distance: 42, utilization: 82 },
  { truck: "MH-12-ST-9900", type: "Mini Truck", trips: 4, operatingHours: 8.6, idleTime: 0.9, distance: 54, utilization: 93 },
  { truck: "MH-12-UV-1212", type: "Compactor", trips: 3, operatingHours: 7.5, idleTime: 1.6, distance: 40, utilization: 83 },
  { truck: "MH-12-WX-3434", type: "Dumper", trips: 2, operatingHours: 6.8, idleTime: 2.3, distance: 35, utilization: 75 },
];

const fuelConsumptionData = [
  { truck: "MH-12-AB-1234", fuelUsed: 18.5, distance: 45, efficiency: 2.43, cost: 1850, anomaly: false, score: 92 },
  { truck: "MH-12-CD-5678", fuelUsed: 22.0, distance: 52, efficiency: 2.36, cost: 2200, anomaly: false, score: 95 },
  { truck: "MH-12-EF-9012", fuelUsed: 28.5, distance: 38, efficiency: 1.33, cost: 2850, anomaly: true, score: 45 },
  { truck: "MH-12-GH-3456", fuelUsed: 16.8, distance: 41, efficiency: 2.44, cost: 1680, anomaly: false, score: 94 },
  { truck: "MH-12-IJ-7890", fuelUsed: 19.2, distance: 48, efficiency: 2.50, cost: 1920, anomaly: false, score: 97 },
  { truck: "MH-12-KL-1122", fuelUsed: 20.5, distance: 58, efficiency: 2.83, cost: 2050, anomaly: false, score: 99 },
  { truck: "MH-12-MN-3344", fuelUsed: 25.0, distance: 32, efficiency: 1.28, cost: 2500, anomaly: true, score: 40 },
  { truck: "MH-12-OP-5566", fuelUsed: 19.8, distance: 50, efficiency: 2.53, cost: 1980, anomaly: false, score: 96 },
  { truck: "MH-12-QR-7788", fuelUsed: 17.5, distance: 42, efficiency: 2.40, cost: 1750, anomaly: false, score: 93 },
  { truck: "MH-12-ST-9900", fuelUsed: 21.2, distance: 54, efficiency: 2.55, cost: 2120, anomaly: false, score: 95 },
  { truck: "MH-12-UV-1212", fuelUsed: 18.0, distance: 40, efficiency: 2.22, cost: 1800, anomaly: false, score: 88 },
  { truck: "MH-12-WX-3434", fuelUsed: 26.5, distance: 35, efficiency: 1.32, cost: 2650, anomaly: true, score: 42 },
];

const driverAttendanceData = [
  { driver: "Rajesh Kumar", id: "DRV001", shiftStart: "06:00", shiftEnd: "14:30", hoursWorked: 8.5, routes: 2, onTime: true, violations: 0, score: 95 },
  { driver: "Amit Singh", id: "DRV002", shiftStart: "06:15", shiftEnd: "15:00", hoursWorked: 8.75, routes: 2, onTime: true, violations: 1, score: 88 },
  { driver: "Suresh Patil", id: "DRV003", shiftStart: "06:45", shiftEnd: "14:00", hoursWorked: 7.25, routes: 1, onTime: false, violations: 2, score: 72 },
  { driver: "Mahesh Yadav", id: "DRV004", shiftStart: "06:00", shiftEnd: "14:15", hoursWorked: 8.25, routes: 2, onTime: true, violations: 0, score: 98 },
  { driver: "Ravi Sharma", id: "DRV005", shiftStart: "06:30", shiftEnd: "14:45", hoursWorked: 8.25, routes: 2, onTime: false, violations: 1, score: 82 },
  { driver: "Manoj Patil", id: "DRV006", shiftStart: "06:00", shiftEnd: "14:00", hoursWorked: 8.0, routes: 2, onTime: true, violations: 0, score: 92 },
  { driver: "Ravi Deshmukh", id: "DRV007", shiftStart: "06:20", shiftEnd: "14:40", hoursWorked: 8.33, routes: 2, onTime: false, violations: 1, score: 85 },
  { driver: "Sunil Yadav", id: "DRV008", shiftStart: "06:00", shiftEnd: "14:30", hoursWorked: 8.5, routes: 2, onTime: true, violations: 0, score: 96 },
  { driver: "Anil Sharma", id: "DRV009", shiftStart: "06:10", shiftEnd: "14:20", hoursWorked: 8.17, routes: 2, onTime: true, violations: 0, score: 94 },
  { driver: "Deepak Jadhav", id: "DRV010", shiftStart: "07:00", shiftEnd: "15:00", hoursWorked: 8.0, routes: 1, onTime: false, violations: 3, score: 68 },
  { driver: "Vikram Singh", id: "DRV011", shiftStart: "06:05", shiftEnd: "14:35", hoursWorked: 8.5, routes: 2, onTime: true, violations: 1, score: 90 },
  { driver: "Prakash Rane", id: "DRV012", shiftStart: "06:00", shiftEnd: "14:00", hoursWorked: 8.0, routes: 2, onTime: true, violations: 0, score: 97 },
];

const complaintsData = [
  { id: "CMP001", date: "2024-01-15", ward: "Kharadi East", type: "Missed Pickup", status: "resolved", truck: "MH-12-AB-1234", responseTime: "2 hrs" },
  { id: "CMP002", date: "2024-01-15", ward: "Viman Nagar", type: "Irregular Timing", status: "pending", truck: "MH-12-EF-9012", responseTime: "-" },
  { id: "CMP003", date: "2024-01-14", ward: "Kalyani Nagar", type: "Irregular Timing", status: "resolved", truck: "MH-12-GH-3456", responseTime: "4 hrs" },
  { id: "CMP004", date: "2024-01-14", ward: "Wadgaon Sheri", type: "Missed Pickup", status: "in-progress", truck: "MH-12-IJ-7890", responseTime: "1 hr" },
  { id: "CMP005", date: "2024-01-13", ward: "Kharadi West", type: "Spillage", status: "resolved", truck: "MH-12-CD-5678", responseTime: "3 hrs" },
  { id: "CMP006", date: "2024-01-13", ward: "Hadapsar", type: "Missed Pickup", status: "pending", truck: "MH-12-KL-1122", responseTime: "-" },
  { id: "CMP007", date: "2024-01-12", ward: "Magarpatta", type: "Irregular Timing", status: "resolved", truck: "MH-12-MN-3344", responseTime: "1.5 hrs" },
  { id: "CMP008", date: "2024-01-12", ward: "Koregaon Park", type: "Spillage", status: "in-progress", truck: "MH-12-OP-5566", responseTime: "30 min" },
  { id: "CMP009", date: "2024-01-11", ward: "Mundhwa", type: "Irregular Timing", status: "resolved", truck: "MH-12-QR-7788", responseTime: "2.5 hrs" },
  { id: "CMP010", date: "2024-01-11", ward: "Keshav Nagar", type: "Missed Pickup", status: "pending", truck: "MH-12-ST-9900", responseTime: "-" },
  { id: "CMP011", date: "2024-01-10", ward: "Wagholi", type: "Irregular Timing", status: "resolved", truck: "MH-12-UV-1212", responseTime: "3.5 hrs" },
  { id: "CMP012", date: "2024-01-10", ward: "Lohegaon", type: "Spillage", status: "in-progress", truck: "MH-12-WX-3434", responseTime: "45 min" },
];

const dumpYardData = [
  { site: "GCP Kharadi", entries: 45, totalWeight: 112.5, avgWeight: 2.5, peakHour: "10:00-11:00", capacity: 78 },
  { site: "GCP Viman Nagar", entries: 38, totalWeight: 89.2, avgWeight: 2.35, peakHour: "11:00-12:00", capacity: 65 },
  { site: "Dump Site Alpha", entries: 22, totalWeight: 198.0, avgWeight: 9.0, peakHour: "14:00-15:00", capacity: 45 },
  { site: "Dump Site Beta", entries: 18, totalWeight: 162.0, avgWeight: 9.0, peakHour: "15:00-16:00", capacity: 38 },
  { site: "GCP Hadapsar", entries: 52, totalWeight: 130.0, avgWeight: 2.5, peakHour: "09:00-10:00", capacity: 82 },
  { site: "GCP Koregaon Park", entries: 35, totalWeight: 82.5, avgWeight: 2.36, peakHour: "10:30-11:30", capacity: 55 },
  { site: "Dump Site Gamma", entries: 28, totalWeight: 252.0, avgWeight: 9.0, peakHour: "13:00-14:00", capacity: 52 },
  { site: "GCP Magarpatta", entries: 40, totalWeight: 96.0, avgWeight: 2.4, peakHour: "11:00-12:00", capacity: 72 },
  { site: "Dump Site Delta", entries: 15, totalWeight: 135.0, avgWeight: 9.0, peakHour: "16:00-17:00", capacity: 30 },
  { site: "GCP Mundhwa", entries: 32, totalWeight: 76.8, avgWeight: 2.4, peakHour: "08:00-09:00", capacity: 60 },
  { site: "GCP Wagholi", entries: 28, totalWeight: 67.2, avgWeight: 2.4, peakHour: "09:30-10:30", capacity: 48 },
  { site: "Dump Site Epsilon", entries: 20, totalWeight: 180.0, avgWeight: 9.0, peakHour: "15:30-16:30", capacity: 42 },
];

const weeklyTrendData = [
  { day: "Mon", collected: 45.2, missed: 8, efficiency: 94 },
  { day: "Tue", collected: 48.5, missed: 5, efficiency: 96 },
  { day: "Wed", collected: 42.8, missed: 12, efficiency: 88 },
  { day: "Thu", collected: 50.1, missed: 4, efficiency: 97 },
  { day: "Fri", collected: 47.3, missed: 6, efficiency: 95 },
  { day: "Sat", collected: 52.0, missed: 3, efficiency: 98 },
  { day: "Sun", collected: 35.2, missed: 2, efficiency: 96 },
];

const zoneWiseData = [
  { name: "Zone A", value: 35, color: "hsl(var(--chart-1))" },
  { name: "Zone B", value: 28, color: "hsl(var(--chart-2))" },
  { name: "Zone C", value: 22, color: "hsl(var(--chart-3))" },
  { name: "Zone D", value: 15, color: "hsl(var(--chart-4))" },
];

// Late Arrival Report Data
const lateArrivalData = [
  { id: 1, date: "2024-01-15", truck: "MH-12-AB-1234", driver: "Rajesh Kumar", route: "Route A-12", scheduledTime: "06:00", actualTime: "06:25", delay: 25, reason: "Traffic congestion", status: "late", zone: "North Zone", ward: "Aundh", vendor: "Mahesh Enterprises", routeType: "primary" },
  { id: 2, date: "2024-01-15", truck: "MH-12-CD-5678", driver: "Amit Singh", route: "Route B-05", scheduledTime: "06:30", actualTime: "06:35", delay: 5, reason: "", status: "on-time", zone: "East Zone", ward: "Kharadi", vendor: "Mahesh Enterprises", routeType: "primary" },
  { id: 3, date: "2024-01-15", truck: "MH-12-EF-9012", driver: "Suresh Patil", route: "Route C-08", scheduledTime: "07:00", actualTime: "07:45", delay: 45, reason: "Vehicle breakdown", status: "late", zone: "East Zone", ward: "Viman Nagar", vendor: "Mahesh Enterprises", routeType: "secondary" },
  { id: 4, date: "2024-01-15", truck: "MH-12-GH-3456", driver: "Vikram Singh", route: "Route A-15", scheduledTime: "06:15", actualTime: "06:18", delay: 3, reason: "", status: "on-time", zone: "East Zone", ward: "Viman Nagar", vendor: "Mahesh Enterprises", routeType: "primary" },
  { id: 5, date: "2024-01-14", truck: "MH-12-IJ-7890", driver: "Deepak Jadhav", route: "Route D-03", scheduledTime: "06:00", actualTime: "06:32", delay: 32, reason: "Driver reported late", status: "late", zone: "North Zone", ward: "Baner", vendor: "Green Transport Co", routeType: "primary" },
  { id: 6, date: "2024-01-14", truck: "MH-12-KL-1122", driver: "Manoj Patil", route: "Route E-02", scheduledTime: "05:30", actualTime: "05:28", delay: -2, reason: "", status: "on-time", zone: "North Zone", ward: "Baner", vendor: "Green Transport Co", routeType: "secondary" },
  { id: 7, date: "2024-01-14", truck: "MH-12-MN-3344", driver: "Ravi Deshmukh", route: "Route F-01", scheduledTime: "06:45", actualTime: "07:15", delay: 30, reason: "Fuel filling", status: "late", zone: "North Zone", ward: "Aundh", vendor: "Green Transport Co", routeType: "primary" },
  { id: 8, date: "2024-01-13", truck: "MH-12-OP-5566", driver: "Sunil Yadav", route: "Route G-04", scheduledTime: "06:00", actualTime: "06:05", delay: 5, reason: "", status: "on-time", zone: "South Zone", ward: "Hadapsar", vendor: "City Waste Solutions", routeType: "primary" },
  { id: 9, date: "2024-01-13", truck: "MH-12-QR-7788", driver: "Anil Sharma", route: "Route H-02", scheduledTime: "06:30", actualTime: "07:00", delay: 30, reason: "Road construction", status: "late", zone: "South Zone", ward: "Kondhwa", vendor: "City Waste Solutions", routeType: "secondary" },
  { id: 10, date: "2024-01-13", truck: "MH-12-ST-9900", driver: "Prakash Rane", route: "Route I-01", scheduledTime: "06:15", actualTime: "06:12", delay: -3, reason: "", status: "on-time", zone: "West Zone", ward: "Kothrud", vendor: "City Waste Solutions", routeType: "primary" },
  { id: 11, date: "2024-01-12", truck: "MH-12-UV-1212", driver: "Mahesh Yadav", route: "Route J-03", scheduledTime: "06:00", actualTime: "06:40", delay: 40, reason: "Personal emergency", status: "late", zone: "West Zone", ward: "Warje", vendor: "Green Transport Co", routeType: "secondary" },
  { id: 12, date: "2024-01-12", truck: "MH-12-WX-3434", driver: "Ravi Sharma", route: "Route K-02", scheduledTime: "06:45", actualTime: "06:50", delay: 5, reason: "", status: "on-time", zone: "Central Zone", ward: "Deccan", vendor: "Mahesh Enterprises", routeType: "primary" },
];

// Driver Behavior Report Data
const driverBehaviorData = [
  { id: 1, date: "2024-01-15", time: "08:45", truck: "MH-12-AB-1234", driver: "Rajesh Kumar", driverId: "DRV001", incidentType: "Overspeeding", value: "72 km/h", limit: "60 km/h", location: "Kharadi Main Road", severity: "medium" },
  { id: 2, date: "2024-01-15", time: "09:12", truck: "MH-12-EF-9012", driver: "Suresh Patil", driverId: "DRV003", incidentType: "Harsh Braking", value: "9.2 m/s²", limit: "8 m/s²", location: "Viman Nagar Junction", severity: "low" },
  { id: 3, date: "2024-01-15", time: "10:30", truck: "MH-12-GH-3456", driver: "Vikram Singh", driverId: "DRV004", incidentType: "Overspeeding", value: "85 km/h", limit: "60 km/h", location: "Highway Section", severity: "high" },
  { id: 4, date: "2024-01-15", time: "11:05", truck: "MH-12-MN-3344", driver: "Ravi Deshmukh", driverId: "DRV007", incidentType: "Rapid Acceleration", value: "10.5 m/s²", limit: "8 m/s²", location: "Sector 22", severity: "medium" },
  { id: 5, date: "2024-01-14", time: "14:22", truck: "MH-12-AB-1234", driver: "Rajesh Kumar", driverId: "DRV001", incidentType: "Overspeeding", value: "68 km/h", limit: "60 km/h", location: "Wadgaon Sheri", severity: "low" },
  { id: 6, date: "2024-01-14", time: "16:45", truck: "MH-12-CD-5678", driver: "Amit Singh", driverId: "DRV002", incidentType: "Harsh Braking", value: "11.2 m/s²", limit: "8 m/s²", location: "Kalyani Nagar", severity: "high" },
  { id: 7, date: "2024-01-13", time: "07:30", truck: "MH-12-IJ-7890", driver: "Deepak Jadhav", driverId: "DRV005", incidentType: "Rapid Acceleration", value: "9.8 m/s²", limit: "8 m/s²", location: "Starting Point", severity: "medium" },
  { id: 8, date: "2024-01-13", time: "09:15", truck: "MH-12-OP-5566", driver: "Sunil Yadav", driverId: "DRV008", incidentType: "Overspeeding", value: "75 km/h", limit: "60 km/h", location: "Hadapsar Ring Road", severity: "medium" },
  { id: 9, date: "2024-01-13", time: "11:30", truck: "MH-12-QR-7788", driver: "Anil Sharma", driverId: "DRV009", incidentType: "Harsh Braking", value: "10.1 m/s²", limit: "8 m/s²", location: "Magarpatta Junction", severity: "medium" },
  { id: 10, date: "2024-01-12", time: "08:00", truck: "MH-12-ST-9900", driver: "Prakash Rane", driverId: "DRV012", incidentType: "Rapid Acceleration", value: "9.5 m/s²", limit: "8 m/s²", location: "Koregaon Park", severity: "low" },
  { id: 11, date: "2024-01-12", time: "13:45", truck: "MH-12-UV-1212", driver: "Mahesh Yadav", driverId: "DRV004", incidentType: "Overspeeding", value: "90 km/h", limit: "60 km/h", location: "Expressway", severity: "high" },
  { id: 12, date: "2024-01-12", time: "15:20", truck: "MH-12-WX-3434", driver: "Ravi Sharma", driverId: "DRV005", incidentType: "Harsh Braking", value: "12.5 m/s²", limit: "8 m/s²", location: "Mundhwa Bridge", severity: "high" },
];

// Vehicle Status Report Data
const vehicleStatusData = [
  { id: "TRK-001", truck: "MH-12-AB-1234", type: "primary", driver: "Rajesh Kumar", status: "active", gpsStatus: "online", lastUpdate: "2 mins ago", batteryLevel: 92, signalStrength: 85, route: "Route A-12" },
  { id: "TRK-002", truck: "MH-12-CD-5678", type: "secondary", driver: "Amit Singh", status: "active", gpsStatus: "online", lastUpdate: "5 mins ago", batteryLevel: 78, signalStrength: 72, route: "Route B-05" },
  { id: "TRK-003", truck: "MH-12-EF-9012", type: "primary", driver: "Suresh Patil", status: "active", gpsStatus: "online", lastUpdate: "1 min ago", batteryLevel: 65, signalStrength: 90, route: "Route C-08" },
  { id: "TRK-004", truck: "MH-12-GH-3456", type: "secondary", driver: "Vikram Singh", status: "active", gpsStatus: "online", lastUpdate: "Just now", batteryLevel: 88, signalStrength: 95, route: "Route A-15" },
  { id: "TRK-005", truck: "MH-12-IJ-7890", type: "primary", driver: "Deepak Jadhav", status: "warning", gpsStatus: "warning", lastUpdate: "8 mins ago", batteryLevel: 25, signalStrength: 45, route: "Route D-03" },
  { id: "TRK-006", truck: "MH-12-KL-1122", type: "primary", driver: "Manoj Patil", status: "inactive", gpsStatus: "offline", lastUpdate: "45 mins ago", batteryLevel: 12, signalStrength: 0, route: "Route E-02" },
  { id: "TRK-007", truck: "MH-12-MN-3344", type: "secondary", driver: "Ravi Deshmukh", status: "active", gpsStatus: "online", lastUpdate: "1 min ago", batteryLevel: 70, signalStrength: 80, route: "Route F-01" },
  { id: "TRK-008", truck: "MH-12-OP-5566", type: "primary", driver: "Sunil Yadav", status: "failed", gpsStatus: "offline", lastUpdate: "2 hours ago", batteryLevel: 0, signalStrength: 0, route: "Route G-04" },
  { id: "TRK-009", truck: "MH-12-QR-7788", type: "secondary", driver: "Anil Sharma", status: "inactive", gpsStatus: "offline", lastUpdate: "1 hour ago", batteryLevel: 5, signalStrength: 0, route: "Route H-02" },
  { id: "TRK-010", truck: "MH-12-ST-9900", type: "primary", driver: "Prakash Rane", status: "active", gpsStatus: "online", lastUpdate: "3 mins ago", batteryLevel: 85, signalStrength: 88, route: "Route I-01" },
  { id: "TRK-011", truck: "MH-12-UV-1212", type: "secondary", driver: "Mahesh Yadav", status: "warning", gpsStatus: "warning", lastUpdate: "10 mins ago", batteryLevel: 30, signalStrength: 40, route: "Route J-03" },
  { id: "TRK-012", truck: "MH-12-WX-3434", type: "primary", driver: "Ravi Sharma", status: "active", gpsStatus: "online", lastUpdate: "Just now", batteryLevel: 95, signalStrength: 92, route: "Route K-02" },
];

// Spare Truck Usage Report Data
const spareUsageData = [
  { id: 1, date: "2024-01-15", spareTruck: "MH-12-SP-1001", originalTruck: "MH-12-AB-1234", driver: "Spare Driver 1", route: "Route A-12", vendor: "Mahesh Fleet Services", breakdownReason: "Engine failure", activatedAt: "07:30", releasedAt: "14:45", duration: "7h 15m", status: "completed" },
  { id: 2, date: "2024-01-15", spareTruck: "MH-12-SP-2001", originalTruck: "MH-12-GH-3456", driver: "Spare Driver 2", route: "Route A-15", vendor: "Green Transport Solutions", breakdownReason: "Tire puncture", activatedAt: "09:15", releasedAt: "12:30", duration: "3h 15m", status: "completed" },
  { id: 3, date: "2024-01-14", spareTruck: "MH-12-SP-1001", originalTruck: "MH-12-EF-9012", driver: "Spare Driver 1", route: "Route C-08", vendor: "Mahesh Fleet Services", breakdownReason: "Brake issue", activatedAt: "06:45", releasedAt: "16:00", duration: "9h 15m", status: "completed" },
  { id: 4, date: "2024-01-14", spareTruck: "MH-12-SP-2001", originalTruck: "MH-12-IJ-7890", driver: "Spare Driver 2", route: "Route D-03", vendor: "Green Transport Solutions", breakdownReason: "Starter motor failure", activatedAt: "08:00", releasedAt: null, duration: "Active", status: "active" },
  { id: 5, date: "2024-01-13", spareTruck: "MH-12-SP-1001", originalTruck: "MH-12-CD-5678", driver: "Spare Driver 1", route: "Route B-05", vendor: "Mahesh Fleet Services", breakdownReason: "GPS device failure", activatedAt: "10:30", releasedAt: "15:45", duration: "5h 15m", status: "completed" },
  { id: 6, date: "2024-01-13", spareTruck: "MH-12-SP-3001", originalTruck: "MH-12-KL-1122", driver: "Spare Driver 3", route: "Route E-02", vendor: "City Transport Co", breakdownReason: "Battery dead", activatedAt: "07:00", releasedAt: "10:30", duration: "3h 30m", status: "completed" },
  { id: 7, date: "2024-01-12", spareTruck: "MH-12-SP-2001", originalTruck: "MH-12-MN-3344", driver: "Spare Driver 2", route: "Route F-01", vendor: "Green Transport Solutions", breakdownReason: "Clutch failure", activatedAt: "06:30", releasedAt: "15:00", duration: "8h 30m", status: "completed" },
  { id: 8, date: "2024-01-12", spareTruck: "MH-12-SP-1001", originalTruck: "MH-12-OP-5566", driver: "Spare Driver 1", route: "Route G-04", vendor: "Mahesh Fleet Services", breakdownReason: "Hydraulic leak", activatedAt: "08:45", releasedAt: null, duration: "Active", status: "active" },
  { id: 9, date: "2024-01-11", spareTruck: "MH-12-SP-3001", originalTruck: "MH-12-QR-7788", driver: "Spare Driver 3", route: "Route H-02", vendor: "City Transport Co", breakdownReason: "Fuel pump issue", activatedAt: "11:00", releasedAt: "16:30", duration: "5h 30m", status: "completed" },
  { id: 10, date: "2024-01-11", spareTruck: "MH-12-SP-2001", originalTruck: "MH-12-ST-9900", driver: "Spare Driver 2", route: "Route I-01", vendor: "Green Transport Solutions", breakdownReason: "AC failure", activatedAt: "09:00", releasedAt: "14:00", duration: "5h 00m", status: "completed" },
  { id: 11, date: "2024-01-10", spareTruck: "MH-12-SP-1001", originalTruck: "MH-12-UV-1212", driver: "Spare Driver 1", route: "Route J-03", vendor: "Mahesh Fleet Services", breakdownReason: "Radiator leak", activatedAt: "07:15", releasedAt: "13:45", duration: "6h 30m", status: "completed" },
  { id: 12, date: "2024-01-10", spareTruck: "MH-12-SP-3001", originalTruck: "MH-12-WX-3434", driver: "Spare Driver 3", route: "Route K-02", vendor: "City Transport Co", breakdownReason: "Suspension issue", activatedAt: "10:00", releasedAt: "17:00", duration: "7h 00m", status: "completed" },
];

const ITEMS_PER_PAGE = 5;

export default function Reports() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "daily";
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [dateFrom, setDateFrom] = useState("2024-01-15");
  const [dateTo, setDateTo] = useState("2024-01-15");
  const [selectedZone, setSelectedZone] = useState("all");
  const [selectedWard, setSelectedWard] = useState("all");
  const [selectedTruck, setSelectedTruck] = useState("all");
  
  // Email export dialog state
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [emailReportType, setEmailReportType] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  
  // Pagination states for each report
  const [dailyPage, setDailyPage] = useState(1);
  const [routePage, setRoutePage] = useState(1);
  const [truckPage, setTruckPage] = useState(1);
  const [fuelPage, setFuelPage] = useState(1);
  const [driverPage, setDriverPage] = useState(1);
  const [lateArrivalPage, setLateArrivalPage] = useState(1);
  const [behaviorPage, setBehaviorPage] = useState(1);
  const [vehicleStatusPage, setVehicleStatusPage] = useState(1);
  const [spareUsagePage, setSpareUsagePage] = useState(1);
  const [complaintsPage, setComplaintsPage] = useState(1);
  const [dumpYardPage, setDumpYardPage] = useState(1);
  const [expiryTruckPage, setExpiryTruckPage] = useState(1);
  const [expiryDriverPage, setExpiryDriverPage] = useState(1);

  // Filter states for each report
  const [dailyStatusFilter, setDailyStatusFilter] = useState("all");
  const [routeEfficiencyFilter, setRouteEfficiencyFilter] = useState("all");
  const [truckTypeFilter, setTruckTypeFilter] = useState("all");
  const [fuelAnomalyFilter, setFuelAnomalyFilter] = useState("all");
  const [driverOnTimeFilter, setDriverOnTimeFilter] = useState("all");
  const [lateStatusFilter, setLateStatusFilter] = useState("all");
  const [behaviorTypeFilter, setBehaviorTypeFilter] = useState("all");
  const [behaviorSeverityFilter, setBehaviorSeverityFilter] = useState("all");
  const [vehicleStatusFilter, setVehicleStatusFilter] = useState("all");
  const [spareStatusFilter, setSpareStatusFilter] = useState("all");
  const [complaintsStatusFilter, setComplaintsStatusFilter] = useState("all");
  const [complaintsTypeFilter, setComplaintsTypeFilter] = useState("all");
  const [expiryStatusFilter, setExpiryStatusFilter] = useState("all");
  const [dumpYardSiteFilter, setDumpYardSiteFilter] = useState("all");
  const [lateZoneFilter, setLateZoneFilter] = useState("all");
  const [lateWardFilter, setLateWardFilter] = useState("all");
  const [lateVendorFilter, setLateVendorFilter] = useState("all");
  const [lateRouteTypeFilter, setLateRouteTypeFilter] = useState("all");
  
  // Sync with URL param
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Pagination helper
  const paginate = <T,>(data: T[], page: number): T[] => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return data.slice(start, start + ITEMS_PER_PAGE);
  };

  const getTotalPages = (totalItems: number): number => {
    return Math.ceil(totalItems / ITEMS_PER_PAGE);
  };

  const renderPagination = (currentPage: number, totalItems: number, setPage: (page: number) => void) => {
    const totalPages = getTotalPages(totalItems);
    if (totalPages <= 1) return null;

    const handlePageChange = (e: React.MouseEvent, newPage: number) => {
      e.preventDefault();
      e.stopPropagation();
      setPage(newPage);
    };

    return (
      <div className="flex flex-col items-center gap-3 mt-4 pt-4 border-t">
        <Pagination>
          <PaginationContent className="gap-1">
            <PaginationItem>
              <PaginationPrevious 
                onClick={(e) => handlePageChange(e, Math.max(1, currentPage - 1))}
                className={`h-8 text-xs px-2 ${currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
              />
            </PaginationItem>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    onClick={(e) => handlePageChange(e, pageNum)}
                    isActive={currentPage === pageNum}
                    className="h-8 w-8 text-xs cursor-pointer"
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            <PaginationItem>
              <PaginationNext 
                onClick={(e) => handlePageChange(e, Math.min(totalPages, currentPage + 1))}
                className={`h-8 text-xs px-2 ${currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalItems)}-{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems} items
        </span>
      </div>
    );
  };

  const handleDownload = (reportType: string, format: string) => {
    toast({
      title: "Download Started",
      description: `Downloading ${reportType.replace(/_/g, ' ')} report as ${format.toUpperCase()} (with current filters applied)`,
    });
  };

  const handlePrint = (reportType: string) => {
    window.print();
  };
  
  const handleEmailExport = (reportType: string) => {
    setEmailReportType(reportType);
    setEmailDialogOpen(true);
  };
  
  const sendEmailReport = async () => {
    if (!emailAddress || !emailAddress.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    setSendingEmail(true);
    // Simulate sending email
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSendingEmail(false);
    setEmailDialogOpen(false);
    setEmailAddress("");
    
    toast({
      title: "Email Sent Successfully",
      description: `${emailReportType.replace(/_/g, ' ')} report has been sent to ${emailAddress} with current filters applied`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Email Export Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Report
            </DialogTitle>
            <DialogDescription>
              Send the {emailReportType.replace(/_/g, ' ')} report with current filters to an email address.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input
                type="email"
                placeholder="Enter email address"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Report will include:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Current filter selections applied</li>
                <li>Date range: {dateFrom} to {dateTo}</li>
                <li>Format: PDF attachment</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={sendEmailReport} disabled={sendingEmail}>
              {sendingEmail ? (
                <>Sending...</>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reports Center</h1>
          <p className="text-muted-foreground">Generate, filter and download comprehensive fleet reports</p>
        </div>
      <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            <FileText className="h-3 w-3 mr-1" />
            12 Report Types
          </Badge>
        </div>
      </div>

      {/* Global Filters */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Report Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">From Date</label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">To Date</label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Zone</label>
              <Select value={selectedZone} onValueChange={setSelectedZone}>
                <SelectTrigger>
                  <SelectValue placeholder="All Zones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Zones</SelectItem>
                  <SelectItem value="zone-a">Zone A</SelectItem>
                  <SelectItem value="zone-b">Zone B</SelectItem>
                  <SelectItem value="zone-c">Zone C</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ward</label>
              <Select value={selectedWard} onValueChange={setSelectedWard}>
                <SelectTrigger>
                  <SelectValue placeholder="All Wards" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Wards</SelectItem>
                  <SelectItem value="kharadi-east">Kharadi East</SelectItem>
                  <SelectItem value="kharadi-west">Kharadi West</SelectItem>
                  <SelectItem value="viman-nagar">Viman Nagar</SelectItem>
                  <SelectItem value="kalyani-nagar">Kalyani Nagar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Truck</label>
              <Select value={selectedTruck} onValueChange={setSelectedTruck}>
                <SelectTrigger>
                  <SelectValue placeholder="All Trucks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Trucks</SelectItem>
                  <SelectItem value="MH-12-AB-1234">MH-12-AB-1234</SelectItem>
                  <SelectItem value="MH-12-CD-5678">MH-12-CD-5678</SelectItem>
                  <SelectItem value="MH-12-EF-9012">MH-12-EF-9012</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 md:grid-cols-12 h-auto gap-1 bg-muted/50 p-1">
          <TabsTrigger value="daily" className="flex items-center gap-1 text-xs md:text-sm">
            <MapPin className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden md:inline">Pickup</span> Coverage
          </TabsTrigger>
          <TabsTrigger value="route" className="flex items-center gap-1 text-xs md:text-sm">
            <Route className="h-3 w-3 md:h-4 md:w-4" />
            Route
          </TabsTrigger>
          <TabsTrigger value="truck" className="flex items-center gap-1 text-xs md:text-sm">
            <Truck className="h-3 w-3 md:h-4 md:w-4" />
            Truck
          </TabsTrigger>
          <TabsTrigger value="fuel" className="flex items-center gap-1 text-xs md:text-sm">
            <Fuel className="h-3 w-3 md:h-4 md:w-4" />
            Fuel
          </TabsTrigger>
          <TabsTrigger value="driver" className="flex items-center gap-1 text-xs md:text-sm">
            <Users className="h-3 w-3 md:h-4 md:w-4" />
            Driver
          </TabsTrigger>
          <TabsTrigger value="late-arrival" className="flex items-center gap-1 text-xs md:text-sm">
            <Clock className="h-3 w-3 md:h-4 md:w-4" />
            Late Arrival
          </TabsTrigger>
          <TabsTrigger value="behavior" className="flex items-center gap-1 text-xs md:text-sm">
            <Gauge className="h-3 w-3 md:h-4 md:w-4" />
            Behavior
          </TabsTrigger>
          <TabsTrigger value="vehicle-status" className="flex items-center gap-1 text-xs md:text-sm">
            <WifiOff className="h-3 w-3 md:h-4 md:w-4" />
            Vehicle Status
          </TabsTrigger>
          <TabsTrigger value="spare-usage" className="flex items-center gap-1 text-xs md:text-sm">
            <ArrowRightLeft className="h-3 w-3 md:h-4 md:w-4" />
            Spare Usage
          </TabsTrigger>
          <TabsTrigger value="complaints" className="flex items-center gap-1 text-xs md:text-sm">
            <AlertTriangle className="h-3 w-3 md:h-4 md:w-4" />
            Complaints
          </TabsTrigger>
          <TabsTrigger value="dumpyard" className="flex items-center gap-1 text-xs md:text-sm">
            <Building className="h-3 w-3 md:h-4 md:w-4" />
            Dump Yard
          </TabsTrigger>
          <TabsTrigger value="expiry" className="flex items-center gap-1 text-xs md:text-sm">
            <Shield className="h-3 w-3 md:h-4 md:w-4" />
            Expiry
          </TabsTrigger>
        </TabsList>

        {/* Daily Collection Report */}
        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Daily Pickup Coverage Report
                </CardTitle>
                <CardDescription>Pickup points coverage by ward, zone, and truck with completion status</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleDownload("daily_collection", "csv")}>
                  <FileSpreadsheet className="h-4 w-4 mr-1" /> CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDownload("daily_collection", "pdf")}>
                  <Download className="h-4 w-4 mr-1" /> PDF
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleEmailExport("Daily Pickup Coverage")}>
                  <Mail className="h-4 w-4 mr-1" /> Email
                </Button>
                <Button variant="outline" size="sm" onClick={() => handlePrint("daily_collection")}>
                  <Printer className="h-4 w-4 mr-1" /> Print
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Filter by Status:</span>
                <div className="flex gap-1">
                  {["all", "completed", "partial"].map((status) => (
                    <Badge
                      key={status}
                      variant={dailyStatusFilter === status ? "default" : "outline"}
                      className={`cursor-pointer capitalize ${dailyStatusFilter === status ? "" : "hover:bg-muted"}`}
                      onClick={() => { setDailyStatusFilter(status); setDailyPage(1); }}
                    >
                      {status === "all" ? "All" : status}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="bg-emerald-500/10 border-emerald-500/20">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-600">211</p>
                    <p className="text-xs text-muted-foreground">Total Pickup Points</p>
                  </CardContent>
                </Card>
                <Card className="bg-green-500/10 border-green-500/20">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">201</p>
                    <p className="text-xs text-muted-foreground">Covered</p>
                  </CardContent>
                </Card>
                <Card className="bg-red-500/10 border-red-500/20">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-red-600">10</p>
                    <p className="text-xs text-muted-foreground">Missed</p>
                  </CardContent>
                </Card>
                <Card className="bg-blue-500/10 border-blue-500/20">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">10.9</p>
                    <p className="text-xs text-muted-foreground">Total Tons</p>
                  </CardContent>
                </Card>
                <Card className="bg-purple-500/10 border-purple-500/20">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-purple-600">95.3%</p>
                    <p className="text-xs text-muted-foreground">Completion</p>
                  </CardContent>
                </Card>
              </div>

              {/* Chart */}
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                    <Bar dataKey="collected" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Collected (tons)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Date</TableHead>
                      <TableHead>Ward</TableHead>
                      <TableHead>Zone</TableHead>
                      <TableHead>Truck</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead className="text-center">Pickup Points</TableHead>
                      <TableHead className="text-center">Covered</TableHead>
                      <TableHead className="text-center">Missed</TableHead>
                      <TableHead className="text-right">Weight (T)</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      const filteredData = dailyStatusFilter === "all" 
                        ? dailyPickupCoverageData 
                        : dailyPickupCoverageData.filter(d => d.status === dailyStatusFilter);
                      return paginate(filteredData, dailyPage).map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-medium">{row.date}</TableCell>
                          <TableCell>{row.ward}</TableCell>
                          <TableCell>{row.zone}</TableCell>
                          <TableCell className="font-mono text-xs">{row.truck}</TableCell>
                          <TableCell>{row.driver}</TableCell>
                          <TableCell className="text-center">{row.totalPoints}</TableCell>
                          <TableCell className="text-center text-green-600 font-medium">{row.covered}</TableCell>
                          <TableCell className="text-center text-red-600 font-medium">{row.missed}</TableCell>
                          <TableCell className="text-right">{row.weight}</TableCell>
                          <TableCell>
                            <Badge variant={row.status === "completed" ? "default" : "secondary"} 
                                   className={row.status === "completed" ? "bg-green-500/20 text-green-700 border-green-500/30" : "bg-yellow-500/20 text-yellow-700 border-yellow-500/30"}>
                              {row.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ));
                    })()}
                  </TableBody>
                </Table>
              </div>
              {(() => {
                const filteredData = dailyStatusFilter === "all" 
                  ? dailyPickupCoverageData 
                  : dailyPickupCoverageData.filter(d => d.status === dailyStatusFilter);
                return renderPagination(dailyPage, filteredData.length, setDailyPage);
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Route Performance Report */}
        <TabsContent value="route" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Route className="h-5 w-5 text-primary" />
                  Route Performance Report
                </CardTitle>
                <CardDescription>Route completion rates, deviations, and efficiency metrics</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleDownload("route_performance", "csv")}>
                  <FileSpreadsheet className="h-4 w-4 mr-1" /> CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDownload("route_performance", "pdf")}>
                  <Download className="h-4 w-4 mr-1" /> PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Filter by Efficiency:</span>
                <div className="flex gap-1">
                  {[
                    { key: "all", label: "All" },
                    { key: "high", label: "High (≥90%)" },
                    { key: "medium", label: "Medium (80-89%)" },
                    { key: "low", label: "Low (<80%)" }
                  ].map((filter) => (
                    <Badge
                      key={filter.key}
                      variant={routeEfficiencyFilter === filter.key ? "default" : "outline"}
                      className={`cursor-pointer ${routeEfficiencyFilter === filter.key ? "" : "hover:bg-muted"}`}
                      onClick={() => { setRouteEfficiencyFilter(filter.key); setRoutePage(1); }}
                    >
                      {filter.label}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-primary/10 border-primary/20">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-primary">94.6%</p>
                    <p className="text-xs text-muted-foreground">Avg Completion</p>
                  </CardContent>
                </Card>
                <Card className="bg-orange-500/10 border-orange-500/20">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-orange-600">19</p>
                    <p className="text-xs text-muted-foreground">Total Deviations</p>
                  </CardContent>
                </Card>
                <Card className="bg-blue-500/10 border-blue-500/20">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">4.3 hrs</p>
                    <p className="text-xs text-muted-foreground">Avg Route Time</p>
                  </CardContent>
                </Card>
                <Card className="bg-green-500/10 border-green-500/20">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">91.2%</p>
                    <p className="text-xs text-muted-foreground">Avg Efficiency</p>
                  </CardContent>
                </Card>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Route</TableHead>
                      <TableHead className="text-center">Completion %</TableHead>
                      <TableHead className="text-center">Avg Time</TableHead>
                      <TableHead className="text-center">Deviations</TableHead>
                      <TableHead>Efficiency</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      const filteredData = routePerformanceData.filter(row => {
                        if (routeEfficiencyFilter === "all") return true;
                        if (routeEfficiencyFilter === "high") return row.efficiency >= 90;
                        if (routeEfficiencyFilter === "medium") return row.efficiency >= 80 && row.efficiency < 90;
                        return row.efficiency < 80;
                      });
                      return paginate(filteredData, routePage).map((row, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{row.route}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center gap-2 justify-center">
                              <span className={row.completion >= 95 ? "text-green-600" : row.completion >= 90 ? "text-yellow-600" : "text-red-600"}>
                                {row.completion}%
                              </span>
                              {row.completion >= 95 ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">{row.avgTime}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant={row.deviations === 0 ? "default" : "destructive"} className={row.deviations === 0 ? "bg-green-500/20 text-green-700" : ""}>
                              {row.deviations}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={row.efficiency} className="h-2 w-20" />
                              <span className="text-sm font-medium">{row.efficiency}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ));
                    })()}
                  </TableBody>
                </Table>
              </div>
              {(() => {
                const filteredData = routePerformanceData.filter(row => {
                  if (routeEfficiencyFilter === "all") return true;
                  if (routeEfficiencyFilter === "high") return row.efficiency >= 90;
                  if (routeEfficiencyFilter === "medium") return row.efficiency >= 80 && row.efficiency < 90;
                  return row.efficiency < 80;
                });
                return renderPagination(routePage, filteredData.length, setRoutePage);
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Truck Utilization Report */}
        <TabsContent value="truck" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  Truck Utilization Report
                </CardTitle>
                <CardDescription>Trips, operating hours, idle time, and vehicle utilization</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleDownload("truck_utilization", "csv")}>
                  <FileSpreadsheet className="h-4 w-4 mr-1" /> CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDownload("truck_utilization", "pdf")}>
                  <Download className="h-4 w-4 mr-1" /> PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Filter by Type:</span>
                <div className="flex gap-1">
                  {["all", "Compactor", "Mini Truck", "Dumper", "Open Truck"].map((type) => (
                    <Badge
                      key={type}
                      variant={truckTypeFilter === type ? "default" : "outline"}
                      className={`cursor-pointer ${truckTypeFilter === type ? "" : "hover:bg-muted"}`}
                      onClick={() => { setTruckTypeFilter(type); setTruckPage(1); }}
                    >
                      {type === "all" ? "All Types" : type}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-primary/10 border-primary/20">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-primary">15</p>
                    <p className="text-xs text-muted-foreground">Total Trips</p>
                  </CardContent>
                </Card>
                <Card className="bg-blue-500/10 border-blue-500/20">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">41.5 hrs</p>
                    <p className="text-xs text-muted-foreground">Operating Hours</p>
                  </CardContent>
                </Card>
                <Card className="bg-orange-500/10 border-orange-500/20">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-orange-600">6.1 hrs</p>
                    <p className="text-xs text-muted-foreground">Total Idle Time</p>
                  </CardContent>
                </Card>
                <Card className="bg-green-500/10 border-green-500/20">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">89.2%</p>
                    <p className="text-xs text-muted-foreground">Avg Utilization</p>
                  </CardContent>
                </Card>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Truck</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-center">Trips</TableHead>
                      <TableHead className="text-center">Operating Hrs</TableHead>
                      <TableHead className="text-center">Idle Time</TableHead>
                      <TableHead className="text-center">Distance (km)</TableHead>
                      <TableHead>Utilization</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      const filteredData = truckTypeFilter === "all" 
                        ? truckUtilizationData 
                        : truckUtilizationData.filter(d => d.type === truckTypeFilter);
                      return paginate(filteredData, truckPage).map((row, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-mono text-xs font-medium">{row.truck}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{row.type}</Badge>
                          </TableCell>
                          <TableCell className="text-center">{row.trips}</TableCell>
                          <TableCell className="text-center">{row.operatingHours}</TableCell>
                          <TableCell className="text-center">
                            <span className={row.idleTime > 1.5 ? "text-red-600" : "text-green-600"}>
                              {row.idleTime} hrs
                            </span>
                          </TableCell>
                          <TableCell className="text-center">{row.distance}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={row.utilization} className="h-2 w-20" />
                              <span className={`text-sm font-medium ${row.utilization >= 90 ? "text-green-600" : row.utilization >= 80 ? "text-yellow-600" : "text-red-600"}`}>
                                {row.utilization}%
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ));
                    })()}
                  </TableBody>
                </Table>
              </div>
              {(() => {
                const filteredData = truckTypeFilter === "all" 
                  ? truckUtilizationData 
                  : truckUtilizationData.filter(d => d.type === truckTypeFilter);
                return renderPagination(truckPage, filteredData.length, setTruckPage);
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fuel Consumption Report */}
        <TabsContent value="fuel" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Fuel className="h-5 w-5 text-primary" />
                  Fuel Consumption Report
                </CardTitle>
                <CardDescription>Fuel usage, efficiency metrics, anomaly detection, and costs</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleDownload("fuel_consumption", "csv")}>
                  <FileSpreadsheet className="h-4 w-4 mr-1" /> CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDownload("fuel_consumption", "pdf")}>
                  <Download className="h-4 w-4 mr-1" /> PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Filter by Status:</span>
                <div className="flex gap-1">
                  {[
                    { key: "all", label: "All" },
                    { key: "normal", label: "Normal" },
                    { key: "anomaly", label: "Anomalies" }
                  ].map((filter) => (
                    <Badge
                      key={filter.key}
                      variant={fuelAnomalyFilter === filter.key ? "default" : "outline"}
                      className={`cursor-pointer ${fuelAnomalyFilter === filter.key ? "" : "hover:bg-muted"}`}
                      onClick={() => { setFuelAnomalyFilter(filter.key); setFuelPage(1); }}
                    >
                      {filter.label}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="bg-primary/10 border-primary/20">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-primary">105L</p>
                    <p className="text-xs text-muted-foreground">Total Fuel</p>
                  </CardContent>
                </Card>
                <Card className="bg-blue-500/10 border-blue-500/20">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">224 km</p>
                    <p className="text-xs text-muted-foreground">Total Distance</p>
                  </CardContent>
                </Card>
                <Card className="bg-green-500/10 border-green-500/20">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">2.21</p>
                    <p className="text-xs text-muted-foreground">Avg km/L</p>
                  </CardContent>
                </Card>
                <Card className="bg-orange-500/10 border-orange-500/20">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-orange-600">₹10,500</p>
                    <p className="text-xs text-muted-foreground">Total Cost</p>
                  </CardContent>
                </Card>
                <Card className="bg-red-500/10 border-red-500/20">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-red-600">1</p>
                    <p className="text-xs text-muted-foreground">Anomalies</p>
                  </CardContent>
                </Card>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Truck</TableHead>
                      <TableHead className="text-center">Fuel (L)</TableHead>
                      <TableHead className="text-center">Distance (km)</TableHead>
                      <TableHead className="text-center">Efficiency (km/L)</TableHead>
                      <TableHead className="text-right">Cost (₹)</TableHead>
                      <TableHead className="text-center">Anomaly</TableHead>
                      <TableHead>Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      const filteredData = fuelConsumptionData.filter(row => {
                        if (fuelAnomalyFilter === "all") return true;
                        if (fuelAnomalyFilter === "anomaly") return row.anomaly;
                        return !row.anomaly;
                      });
                      return paginate(filteredData, fuelPage).map((row, idx) => (
                        <TableRow key={idx} className={row.anomaly ? "bg-red-500/5" : ""}>
                          <TableCell className="font-mono text-xs font-medium">{row.truck}</TableCell>
                          <TableCell className="text-center">{row.fuelUsed}</TableCell>
                          <TableCell className="text-center">{row.distance}</TableCell>
                          <TableCell className="text-center">
                            <span className={row.efficiency >= 2.0 ? "text-green-600" : "text-red-600"}>
                              {row.efficiency.toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">₹{row.cost.toLocaleString()}</TableCell>
                          <TableCell className="text-center">
                            {row.anomaly ? (
                              <Badge variant="destructive" className="gap-1">
                                <AlertTriangle className="h-3 w-3" /> Detected
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-green-500/20 text-green-700 border-green-500/30">Normal</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={row.score} className="h-2 w-16" />
                              <span className={`text-sm font-medium ${row.score >= 80 ? "text-green-600" : row.score >= 60 ? "text-yellow-600" : "text-red-600"}`}>
                                {row.score}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ));
                    })()}
                  </TableBody>
                </Table>
              </div>
              {(() => {
                const filteredData = fuelConsumptionData.filter(row => {
                  if (fuelAnomalyFilter === "all") return true;
                  if (fuelAnomalyFilter === "anomaly") return row.anomaly;
                  return !row.anomaly;
                });
                return renderPagination(fuelPage, filteredData.length, setFuelPage);
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Driver Attendance Report */}
        <TabsContent value="driver" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Driver Attendance & Performance Report
                </CardTitle>
                <CardDescription>Shift timings, routes completed, violations, and driver scores</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleDownload("driver_attendance", "csv")}>
                  <FileSpreadsheet className="h-4 w-4 mr-1" /> CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDownload("driver_attendance", "pdf")}>
                  <Download className="h-4 w-4 mr-1" /> PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Filter by Attendance:</span>
                <div className="flex gap-1">
                  {[
                    { key: "all", label: "All" },
                    { key: "on-time", label: "On Time" },
                    { key: "late", label: "Late" }
                  ].map((filter) => (
                    <Badge
                      key={filter.key}
                      variant={driverOnTimeFilter === filter.key ? "default" : "outline"}
                      className={`cursor-pointer ${driverOnTimeFilter === filter.key ? "" : "hover:bg-muted"}`}
                      onClick={() => { setDriverOnTimeFilter(filter.key); setDriverPage(1); }}
                    >
                      {filter.label}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-primary/10 border-primary/20">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-primary">5</p>
                    <p className="text-xs text-muted-foreground">Active Drivers</p>
                  </CardContent>
                </Card>
                <Card className="bg-green-500/10 border-green-500/20">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">41 hrs</p>
                    <p className="text-xs text-muted-foreground">Total Hours</p>
                  </CardContent>
                </Card>
                <Card className="bg-red-500/10 border-red-500/20">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-red-600">4</p>
                    <p className="text-xs text-muted-foreground">Violations</p>
                  </CardContent>
                </Card>
                <Card className="bg-blue-500/10 border-blue-500/20">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">87</p>
                    <p className="text-xs text-muted-foreground">Avg Score</p>
                  </CardContent>
                </Card>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Driver</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead className="text-center">Shift Start</TableHead>
                      <TableHead className="text-center">Shift End</TableHead>
                      <TableHead className="text-center">Hours</TableHead>
                      <TableHead className="text-center">Routes</TableHead>
                      <TableHead className="text-center">On Time</TableHead>
                      <TableHead className="text-center">Violations</TableHead>
                      <TableHead>Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      const filteredData = driverAttendanceData.filter(row => {
                        if (driverOnTimeFilter === "all") return true;
                        if (driverOnTimeFilter === "on-time") return row.onTime;
                        return !row.onTime;
                      });
                      return paginate(filteredData, driverPage).map((row, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{row.driver}</TableCell>
                          <TableCell className="font-mono text-xs">{row.id}</TableCell>
                          <TableCell className="text-center">{row.shiftStart}</TableCell>
                          <TableCell className="text-center">{row.shiftEnd}</TableCell>
                          <TableCell className="text-center">{row.hoursWorked}</TableCell>
                          <TableCell className="text-center">{row.routes}</TableCell>
                          <TableCell className="text-center">
                            {row.onTime ? (
                              <Badge className="bg-green-500/20 text-green-700 border-green-500/30">Yes</Badge>
                            ) : (
                              <Badge variant="destructive">Late</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={row.violations > 0 ? "text-red-600 font-medium" : "text-green-600"}>
                              {row.violations}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={row.score} className="h-2 w-16" />
                              <span className={`text-sm font-medium ${row.score >= 90 ? "text-green-600" : row.score >= 75 ? "text-yellow-600" : "text-red-600"}`}>
                                {row.score}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ));
                    })()}
                  </TableBody>
                </Table>
              </div>
              {(() => {
                const filteredData = driverAttendanceData.filter(row => {
                  if (driverOnTimeFilter === "all") return true;
                  if (driverOnTimeFilter === "on-time") return row.onTime;
                  return !row.onTime;
                });
                return renderPagination(driverPage, filteredData.length, setDriverPage);
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Late Arrival Report */}
        <TabsContent value="late-arrival" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Late Arrival Report
                </CardTitle>
                <CardDescription>Trucks that did not reach first pickup point on time (Buffer: {localStorage.getItem('lateArrivalBuffer') || '10'} min)</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleDownload("late_arrival", "csv")}>
                  <FileSpreadsheet className="h-4 w-4 mr-1" /> CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDownload("late_arrival", "pdf")}>
                  <Download className="h-4 w-4 mr-1" /> PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {(() => {
                const buffer = parseInt(localStorage.getItem('lateArrivalBuffer') || '10');
                const allData = lateArrivalData.filter(row => {
                  const zoneMatch = lateZoneFilter === "all" || row.zone === lateZoneFilter;
                  const wardMatch = lateWardFilter === "all" || row.ward === lateWardFilter;
                  const vendorMatch = lateVendorFilter === "all" || row.vendor === lateVendorFilter;
                  const routeTypeMatch = lateRouteTypeFilter === "all" || row.routeType === lateRouteTypeFilter;
                  return zoneMatch && wardMatch && vendorMatch && routeTypeMatch;
                });
                const filteredByStatus = allData.filter(row => {
                  if (lateStatusFilter === "all") return true;
                  const isLate = row.delay > buffer;
                  if (lateStatusFilter === "late") return isLate;
                  return !isLate;
                });
                const lateCount = allData.filter(d => d.delay > buffer).length;
                const onTimeCount = allData.filter(d => d.delay <= buffer).length;
                const avgDelay = Math.round(allData.filter(d => d.delay > buffer).reduce((sum, d) => sum + d.delay, 0) / Math.max(lateCount, 1));

                const uniqueZones = [...new Set(lateArrivalData.map(d => d.zone))];
                const uniqueWards = [...new Set(lateArrivalData.filter(d => lateZoneFilter === "all" || d.zone === lateZoneFilter).map(d => d.ward))];
                const uniqueVendors = [...new Set(lateArrivalData.map(d => d.vendor))];

                return (
                  <>
                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-3">
                      <Select value={lateZoneFilter} onValueChange={(v) => { setLateZoneFilter(v); setLateWardFilter("all"); setLateArrivalPage(1); }}>
                        <SelectTrigger className="w-[160px] h-8 text-xs">
                          <SelectValue placeholder="Zone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Zones</SelectItem>
                          {uniqueZones.map(z => <SelectItem key={z} value={z}>{z}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select value={lateWardFilter} onValueChange={(v) => { setLateWardFilter(v); setLateArrivalPage(1); }}>
                        <SelectTrigger className="w-[160px] h-8 text-xs">
                          <SelectValue placeholder="Ward" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Wards</SelectItem>
                          {uniqueWards.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select value={lateVendorFilter} onValueChange={(v) => { setLateVendorFilter(v); setLateArrivalPage(1); }}>
                        <SelectTrigger className="w-[180px] h-8 text-xs">
                          <SelectValue placeholder="Vendor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Vendors</SelectItem>
                          {uniqueVendors.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select value={lateRouteTypeFilter} onValueChange={(v) => { setLateRouteTypeFilter(v); setLateArrivalPage(1); }}>
                        <SelectTrigger className="w-[160px] h-8 text-xs">
                          <SelectValue placeholder="Route Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="primary">Primary</SelectItem>
                          <SelectItem value="secondary">Secondary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Status Filter */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">Filter by Status:</span>
                      <div className="flex gap-1">
                        {[
                          { key: "all", label: "All" },
                          { key: "on-time", label: "On Time" },
                          { key: "late", label: "Late" }
                        ].map((filter) => (
                          <Badge
                            key={filter.key}
                            variant={lateStatusFilter === filter.key ? "default" : "outline"}
                            className={`cursor-pointer ${lateStatusFilter === filter.key ? "" : "hover:bg-muted"}`}
                            onClick={() => { setLateStatusFilter(filter.key); setLateArrivalPage(1); }}
                          >
                            {filter.label}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card className="bg-green-500/10 border-green-500/20">
                        <CardContent className="p-4 text-center">
                          <p className="text-2xl font-bold text-green-600">{onTimeCount}</p>
                          <p className="text-xs text-muted-foreground">On Time</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-red-500/10 border-red-500/20">
                        <CardContent className="p-4 text-center">
                          <p className="text-2xl font-bold text-red-600">{lateCount}</p>
                          <p className="text-xs text-muted-foreground">Late Arrivals</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-orange-500/10 border-orange-500/20">
                        <CardContent className="p-4 text-center">
                          <p className="text-2xl font-bold text-orange-600">{avgDelay} min</p>
                          <p className="text-xs text-muted-foreground">Avg Delay</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-primary/10 border-primary/20">
                        <CardContent className="p-4 text-center">
                          <p className="text-2xl font-bold text-primary">{allData.length > 0 ? Math.round((onTimeCount / allData.length) * 100) : 0}%</p>
                          <p className="text-xs text-muted-foreground">On-Time Rate</p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead>Date</TableHead>
                            <TableHead>Zone</TableHead>
                            <TableHead>Truck</TableHead>
                            <TableHead>Driver</TableHead>
                            <TableHead>Route</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-center">Scheduled</TableHead>
                            <TableHead className="text-center">Actual</TableHead>
                            <TableHead className="text-center">Delay</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginate(filteredByStatus, lateArrivalPage).map((row) => {
                            const isLate = row.delay > buffer;
                            return (
                              <TableRow key={row.id} className={isLate ? "bg-red-500/5" : ""}>
                                <TableCell className="font-medium">{row.date}</TableCell>
                                <TableCell className="text-xs">{row.zone}</TableCell>
                                <TableCell className="font-mono text-xs">{row.truck}</TableCell>
                                <TableCell>{row.driver}</TableCell>
                                <TableCell>{row.route}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="text-xs">
                                    {row.routeType === "primary" ? "P" : "S"}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center">{row.scheduledTime}</TableCell>
                                <TableCell className="text-center">{row.actualTime}</TableCell>
                                <TableCell className="text-center">
                                  <span className={`font-medium ${isLate ? "text-red-600" : row.delay <= 0 ? "text-green-600" : "text-yellow-600"}`}>
                                    {row.delay > 0 ? `+${row.delay}` : row.delay} min
                                  </span>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">{row.reason || "-"}</TableCell>
                                <TableCell>
                                  <Badge className={isLate ? "bg-red-500/20 text-red-700 border-red-500/30" : "bg-green-500/20 text-green-700 border-green-500/30"}>
                                    {isLate ? "Late" : "On Time"}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                    {renderPagination(lateArrivalPage, filteredByStatus.length, setLateArrivalPage)}
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Driver Behavior Report */}
        <TabsContent value="behavior" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-primary" />
                  Driver Behavior Report
                </CardTitle>
                <CardDescription>Overspeeding, harsh braking, and rapid acceleration incidents</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleDownload("driver_behavior", "csv")}>
                  <FileSpreadsheet className="h-4 w-4 mr-1" /> CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDownload("driver_behavior", "pdf")}>
                  <Download className="h-4 w-4 mr-1" /> PDF
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleEmailExport("Driver Behavior")}>
                  <Mail className="h-4 w-4 mr-1" /> Email
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Type:</span>
                  <div className="flex gap-1">
                    {[
                      { key: "all", label: "All" },
                      { key: "Overspeeding", label: "Overspeeding" },
                      { key: "Harsh Braking", label: "Harsh Braking" },
                      { key: "Rapid Acceleration", label: "Rapid Accel" }
                    ].map((filter) => (
                      <Badge
                        key={filter.key}
                        variant={behaviorTypeFilter === filter.key ? "default" : "outline"}
                        className={`cursor-pointer ${behaviorTypeFilter === filter.key ? "" : "hover:bg-muted"}`}
                        onClick={() => { setBehaviorTypeFilter(filter.key); setBehaviorPage(1); }}
                      >
                        {filter.label}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Severity:</span>
                  <div className="flex gap-1">
                    {[
                      { key: "all", label: "All" },
                      { key: "high", label: "High" },
                      { key: "medium", label: "Medium" },
                      { key: "low", label: "Low" }
                    ].map((filter) => (
                      <Badge
                        key={filter.key}
                        variant={behaviorSeverityFilter === filter.key ? "default" : "outline"}
                        className={`cursor-pointer ${behaviorSeverityFilter === filter.key ? "" : "hover:bg-muted"}`}
                        onClick={() => { setBehaviorSeverityFilter(filter.key); setBehaviorPage(1); }}
                      >
                        {filter.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {(() => {
                const filteredData = driverBehaviorData.filter(row => {
                  const typeMatch = behaviorTypeFilter === "all" || row.incidentType === behaviorTypeFilter;
                  const severityMatch = behaviorSeverityFilter === "all" || row.severity === behaviorSeverityFilter;
                  return typeMatch && severityMatch;
                });
                
                const overspeedCount = filteredData.filter(d => d.incidentType === "Overspeeding").length;
                const harshBrakingCount = filteredData.filter(d => d.incidentType === "Harsh Braking").length;
                const rapidAccelCount = filteredData.filter(d => d.incidentType === "Rapid Acceleration").length;
                const highSeverityCount = filteredData.filter(d => d.severity === "high").length;

                return (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card className="bg-red-500/10 border-red-500/20">
                        <CardContent className="p-4 text-center">
                          <p className="text-2xl font-bold text-red-600">{overspeedCount}</p>
                          <p className="text-xs text-muted-foreground">Overspeeding</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-orange-500/10 border-orange-500/20">
                        <CardContent className="p-4 text-center">
                          <p className="text-2xl font-bold text-orange-600">{harshBrakingCount}</p>
                          <p className="text-xs text-muted-foreground">Harsh Braking</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-yellow-500/10 border-yellow-500/20">
                        <CardContent className="p-4 text-center">
                          <p className="text-2xl font-bold text-yellow-600">{rapidAccelCount}</p>
                          <p className="text-xs text-muted-foreground">Rapid Acceleration</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-purple-500/10 border-purple-500/20">
                        <CardContent className="p-4 text-center">
                          <p className="text-2xl font-bold text-purple-600">{highSeverityCount}</p>
                          <p className="text-xs text-muted-foreground">High Severity</p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead>Date</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Truck</TableHead>
                            <TableHead>Driver</TableHead>
                            <TableHead>Incident Type</TableHead>
                            <TableHead className="text-center">Recorded</TableHead>
                            <TableHead className="text-center">Limit</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Severity</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginate(filteredData, behaviorPage).map((row) => (
                            <TableRow key={row.id} className={row.severity === "high" ? "bg-red-500/5" : ""}>
                              <TableCell className="font-medium">{row.date}</TableCell>
                              <TableCell>{row.time}</TableCell>
                              <TableCell className="font-mono text-xs">{row.truck}</TableCell>
                              <TableCell>{row.driver}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="gap-1">
                                  {row.incidentType === "Overspeeding" && <Zap className="h-3 w-3" />}
                                  {row.incidentType === "Harsh Braking" && <AlertTriangle className="h-3 w-3" />}
                                  {row.incidentType === "Rapid Acceleration" && <TrendingUp className="h-3 w-3" />}
                                  {row.incidentType}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center text-red-600 font-medium">{row.value}</TableCell>
                              <TableCell className="text-center text-muted-foreground">{row.limit}</TableCell>
                              <TableCell className="text-xs">{row.location}</TableCell>
                              <TableCell>
                                <Badge 
                                  className={
                                    row.severity === "high" 
                                      ? "bg-red-500/20 text-red-700 border-red-500/30"
                                      : row.severity === "medium"
                                      ? "bg-orange-500/20 text-orange-700 border-orange-500/30"
                                      : "bg-yellow-500/20 text-yellow-700 border-yellow-500/30"
                                  }
                                >
                                  {row.severity}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {renderPagination(behaviorPage, filteredData.length, setBehaviorPage)}
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vehicle Status Report */}
        <TabsContent value="vehicle-status" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <WifiOff className="h-5 w-5 text-primary" />
                  Vehicle Status Report
                </CardTitle>
                <CardDescription>Live status of all vehicles including inactive and failed devices</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleDownload("vehicle_status", "csv")}>
                  <FileSpreadsheet className="h-4 w-4 mr-1" /> CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDownload("vehicle_status", "pdf")}>
                  <Download className="h-4 w-4 mr-1" /> PDF
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleEmailExport("Vehicle Status")}>
                  <Mail className="h-4 w-4 mr-1" /> Email
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Filter by Status:</span>
                <div className="flex gap-1">
                  {[
                    { key: "all", label: "All" },
                    { key: "active", label: "Active" },
                    { key: "warning", label: "Warning" },
                    { key: "inactive", label: "Inactive" },
                    { key: "failed", label: "Failed" }
                  ].map((filter) => (
                    <Badge
                      key={filter.key}
                      variant={vehicleStatusFilter === filter.key ? "default" : "outline"}
                      className={`cursor-pointer ${vehicleStatusFilter === filter.key ? "" : "hover:bg-muted"}`}
                      onClick={() => { setVehicleStatusFilter(filter.key); setVehicleStatusPage(1); }}
                    >
                      {filter.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {(() => {
                const filteredData = vehicleStatusFilter === "all" 
                  ? vehicleStatusData 
                  : vehicleStatusData.filter(d => d.status === vehicleStatusFilter);
                  
                const activeCount = filteredData.filter(d => d.status === "active").length;
                const inactiveCount = filteredData.filter(d => d.status === "inactive").length;
                const warningCount = filteredData.filter(d => d.status === "warning").length;
                const failedCount = filteredData.filter(d => d.status === "failed").length;

                return (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card className="bg-green-500/10 border-green-500/20">
                        <CardContent className="p-4 text-center">
                          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
                          <p className="text-xs text-muted-foreground">Active</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-yellow-500/10 border-yellow-500/20">
                        <CardContent className="p-4 text-center">
                          <p className="text-2xl font-bold text-yellow-600">{warningCount}</p>
                          <p className="text-xs text-muted-foreground">Warning</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-gray-500/10 border-gray-500/20">
                        <CardContent className="p-4 text-center">
                          <p className="text-2xl font-bold text-gray-600">{inactiveCount}</p>
                          <p className="text-xs text-muted-foreground">Inactive</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-red-500/10 border-red-500/20">
                        <CardContent className="p-4 text-center">
                          <p className="text-2xl font-bold text-red-600">{failedCount}</p>
                          <p className="text-xs text-muted-foreground">Failed</p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead>Truck</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Driver</TableHead>
                            <TableHead>Route</TableHead>
                            <TableHead>GPS Status</TableHead>
                            <TableHead className="text-center">Battery</TableHead>
                            <TableHead className="text-center">Signal</TableHead>
                            <TableHead>Last Update</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginate(filteredData, vehicleStatusPage).map((row) => (
                            <TableRow key={row.id} className={row.status === "failed" || row.status === "inactive" ? "bg-red-500/5" : ""}>
                              <TableCell className="font-mono text-xs font-medium">{row.truck}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">{row.type}</Badge>
                              </TableCell>
                              <TableCell>{row.driver}</TableCell>
                              <TableCell>{row.route}</TableCell>
                              <TableCell>
                                <Badge 
                                  className={
                                    row.gpsStatus === "online"
                                      ? "bg-green-500/20 text-green-700 border-green-500/30"
                                      : row.gpsStatus === "warning"
                                      ? "bg-yellow-500/20 text-yellow-700 border-yellow-500/30"
                                      : "bg-red-500/20 text-red-700 border-red-500/30"
                                  }
                                >
                                  {row.gpsStatus === "online" ? "Online" : row.gpsStatus === "warning" ? "Weak Signal" : "Offline"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <Progress value={row.batteryLevel} className="h-2 w-12" />
                                  <span className={`text-xs font-medium ${row.batteryLevel < 20 ? "text-red-600" : row.batteryLevel < 50 ? "text-yellow-600" : "text-green-600"}`}>
                                    {row.batteryLevel}%
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className={`font-medium ${row.signalStrength < 30 ? "text-red-600" : row.signalStrength < 60 ? "text-yellow-600" : "text-green-600"}`}>
                                  {row.signalStrength}%
                                </span>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">{row.lastUpdate}</TableCell>
                              <TableCell>
                                <Badge 
                                  className={
                                    row.status === "active"
                                      ? "bg-green-500/20 text-green-700 border-green-500/30"
                                      : row.status === "warning"
                                      ? "bg-yellow-500/20 text-yellow-700 border-yellow-500/30"
                                      : row.status === "inactive"
                                      ? "bg-gray-500/20 text-gray-700 border-gray-500/30"
                                      : "bg-red-500/20 text-red-700 border-red-500/30"
                                  }
                                >
                                  {row.status === "failed" && <XCircle className="h-3 w-3 mr-1" />}
                                  {row.status === "inactive" && <WifiOff className="h-3 w-3 mr-1" />}
                                  {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {renderPagination(vehicleStatusPage, filteredData.length, setVehicleStatusPage)}
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Complaints Report */}
        <TabsContent value="complaints" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  Citizen Complaints Report
                </CardTitle>
                <CardDescription>Complaints mapped to truck movements and response times</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleDownload("complaints", "csv")}>
                  <FileSpreadsheet className="h-4 w-4 mr-1" /> CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDownload("complaints", "pdf")}>
                  <Download className="h-4 w-4 mr-1" /> PDF
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleEmailExport("Complaints")}>
                  <Mail className="h-4 w-4 mr-1" /> Email
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Status:</span>
                  <div className="flex gap-1">
                    {[
                      { key: "all", label: "All" },
                      { key: "resolved", label: "Resolved" },
                      { key: "in-progress", label: "In Progress" },
                      { key: "pending", label: "Pending" }
                    ].map((filter) => (
                      <Badge
                        key={filter.key}
                        variant={complaintsStatusFilter === filter.key ? "default" : "outline"}
                        className={`cursor-pointer ${complaintsStatusFilter === filter.key ? "" : "hover:bg-muted"}`}
                        onClick={() => { setComplaintsStatusFilter(filter.key); setComplaintsPage(1); }}
                      >
                        {filter.label}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Type:</span>
                  <div className="flex gap-1">
                    {[
                      { key: "all", label: "All" },
                      { key: "Missed Pickup", label: "Missed Pickup" },
                      { key: "Irregular Timing", label: "Irregular Timing" },
                      { key: "Spillage", label: "Spillage" }
                    ].map((filter) => (
                      <Badge
                        key={filter.key}
                        variant={complaintsTypeFilter === filter.key ? "default" : "outline"}
                        className={`cursor-pointer ${complaintsTypeFilter === filter.key ? "" : "hover:bg-muted"}`}
                        onClick={() => { setComplaintsTypeFilter(filter.key); setComplaintsPage(1); }}
                      >
                        {filter.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {(() => {
                const filteredData = complaintsData.filter(row => {
                  const statusMatch = complaintsStatusFilter === "all" || row.status === complaintsStatusFilter;
                  const typeMatch = complaintsTypeFilter === "all" || row.type === complaintsTypeFilter;
                  return statusMatch && typeMatch;
                });
                
                return (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card className="bg-primary/10 border-primary/20">
                        <CardContent className="p-4 text-center">
                          <p className="text-2xl font-bold text-primary">{filteredData.length}</p>
                          <p className="text-xs text-muted-foreground">Total Complaints</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-green-500/10 border-green-500/20">
                        <CardContent className="p-4 text-center">
                          <p className="text-2xl font-bold text-green-600">{filteredData.filter(d => d.status === "resolved").length}</p>
                          <p className="text-xs text-muted-foreground">Resolved</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-yellow-500/10 border-yellow-500/20">
                        <CardContent className="p-4 text-center">
                          <p className="text-2xl font-bold text-yellow-600">{filteredData.filter(d => d.status === "in-progress").length}</p>
                          <p className="text-xs text-muted-foreground">In Progress</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-red-500/10 border-red-500/20">
                        <CardContent className="p-4 text-center">
                          <p className="text-2xl font-bold text-red-600">{filteredData.filter(d => d.status === "pending").length}</p>
                          <p className="text-xs text-muted-foreground">Pending</p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead>ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Ward</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Truck</TableHead>
                            <TableHead className="text-center">Response Time</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginate(filteredData, complaintsPage).map((row) => (
                            <TableRow key={row.id}>
                              <TableCell className="font-mono text-xs font-medium">{row.id}</TableCell>
                              <TableCell>{row.date}</TableCell>
                              <TableCell>{row.ward}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{row.type}</Badge>
                              </TableCell>
                              <TableCell className="font-mono text-xs">{row.truck}</TableCell>
                              <TableCell className="text-center">{row.responseTime}</TableCell>
                              <TableCell>
                                <Badge 
                                  className={
                                    row.status === "resolved" 
                                      ? "bg-green-500/20 text-green-700 border-green-500/30" 
                                      : row.status === "in-progress" 
                                      ? "bg-yellow-500/20 text-yellow-700 border-yellow-500/30"
                                      : "bg-red-500/20 text-red-700 border-red-500/30"
                                  }
                                >
                                  {row.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {renderPagination(complaintsPage, filteredData.length, setComplaintsPage)}
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dump Yard Log Report */}
        <TabsContent value="dumpyard" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-primary" />
                  Dump Yard & GCP Log Report
                </CardTitle>
                <CardDescription>Entry counts, weight per trip, and site capacity utilization</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleDownload("dumpyard_log", "csv")}>
                  <FileSpreadsheet className="h-4 w-4 mr-1" /> CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDownload("dumpyard_log", "pdf")}>
                  <Download className="h-4 w-4 mr-1" /> PDF
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleEmailExport("Dump Yard")}>
                  <Mail className="h-4 w-4 mr-1" /> Email
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-primary/10 border-primary/20">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-primary">123</p>
                    <p className="text-xs text-muted-foreground">Total Entries</p>
                  </CardContent>
                </Card>
                <Card className="bg-blue-500/10 border-blue-500/20">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">561.7 T</p>
                    <p className="text-xs text-muted-foreground">Total Weight</p>
                  </CardContent>
                </Card>
                <Card className="bg-green-500/10 border-green-500/20">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">4.57 T</p>
                    <p className="text-xs text-muted-foreground">Avg per Entry</p>
                  </CardContent>
                </Card>
                <Card className="bg-orange-500/10 border-orange-500/20">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-orange-600">56.5%</p>
                    <p className="text-xs text-muted-foreground">Avg Capacity</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="h-64">
                  <p className="text-sm font-medium mb-2 text-muted-foreground">Zone-wise Distribution</p>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={zoneWiseData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {zoneWiseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Site</TableHead>
                        <TableHead className="text-center">Entries</TableHead>
                        <TableHead className="text-center">Total (T)</TableHead>
                        <TableHead className="text-center">Avg (T)</TableHead>
                        <TableHead>Capacity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dumpYardData.map((row, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{row.site}</TableCell>
                          <TableCell className="text-center">{row.entries}</TableCell>
                          <TableCell className="text-center">{row.totalWeight}</TableCell>
                          <TableCell className="text-center">{row.avgWeight}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={row.capacity} className="h-2 w-16" />
                              <span className={`text-xs ${row.capacity >= 70 ? "text-orange-600" : "text-green-600"}`}>
                                {row.capacity}%
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expiry Report */}
        <TabsContent value="expiry" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Insurance & License Expiry Report
                </CardTitle>
                <CardDescription>Track truck insurance, fitness certificates, and driver license expiration dates</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleDownload("expiry_report", "csv")}>
                  <FileSpreadsheet className="h-4 w-4 mr-1" /> CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDownload("expiry_report", "pdf")}>
                  <Download className="h-4 w-4 mr-1" /> PDF
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleEmailExport("Expiry Report")}>
                  <Mail className="h-4 w-4 mr-1" /> Email
                </Button>
                <Button variant="outline" size="sm" onClick={() => handlePrint("expiry_report")}>
                  <Printer className="h-4 w-4 mr-1" /> Print
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary Cards */}
              {(() => {
                const today = new Date();
                const truckInsuranceExpiring = mockTrucks.filter(t => {
                  const days = differenceInDays(parseISO(t.insuranceExpiry), today);
                  return days >= 0 && days <= 30;
                }).length;
                const truckInsuranceExpired = mockTrucks.filter(t => differenceInDays(parseISO(t.insuranceExpiry), today) < 0).length;
                const truckFitnessExpiring = mockTrucks.filter(t => {
                  const days = differenceInDays(parseISO(t.fitnessExpiry), today);
                  return days >= 0 && days <= 30;
                }).length;
                const truckFitnessExpired = mockTrucks.filter(t => differenceInDays(parseISO(t.fitnessExpiry), today) < 0).length;
                const driverLicenseExpiring = mockDrivers.filter(d => {
                  const days = differenceInDays(parseISO(d.licenseExpiry), today);
                  return days >= 0 && days <= 30;
                }).length;
                const driverLicenseExpired = mockDrivers.filter(d => differenceInDays(parseISO(d.licenseExpiry), today) < 0).length;

                return (
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    <Card className="bg-red-500/10 border-red-500/20">
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-red-600">{truckInsuranceExpired}</p>
                        <p className="text-xs text-muted-foreground">Insurance Expired</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-orange-500/10 border-orange-500/20">
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-orange-600">{truckInsuranceExpiring}</p>
                        <p className="text-xs text-muted-foreground">Insurance Expiring</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-red-500/10 border-red-500/20">
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-red-600">{truckFitnessExpired}</p>
                        <p className="text-xs text-muted-foreground">Fitness Expired</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-orange-500/10 border-orange-500/20">
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-orange-600">{truckFitnessExpiring}</p>
                        <p className="text-xs text-muted-foreground">Fitness Expiring</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-red-500/10 border-red-500/20">
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-red-600">{driverLicenseExpired}</p>
                        <p className="text-xs text-muted-foreground">License Expired</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-orange-500/10 border-orange-500/20">
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-orange-600">{driverLicenseExpiring}</p>
                        <p className="text-xs text-muted-foreground">License Expiring</p>
                      </CardContent>
                    </Card>
                  </div>
                );
              })()}

              {/* Truck Insurance & Fitness Table */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Truck className="h-5 w-5 text-primary" />
                    Truck Insurance & Fitness Expiry
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {mockTrucks.length} Trucks
                  </Badge>
                </div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Vehicle No.</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Insurance Expiry</TableHead>
                        <TableHead>Insurance Status</TableHead>
                        <TableHead>Fitness Expiry</TableHead>
                        <TableHead>Fitness Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginate(mockTrucks, expiryTruckPage).map((truck) => {
                        const today = new Date();
                        const insuranceDays = differenceInDays(parseISO(truck.insuranceExpiry), today);
                        const fitnessDays = differenceInDays(parseISO(truck.fitnessExpiry), today);
                        
                        const getStatusBadge = (days: number) => {
                          if (days < 0) return <Badge variant="destructive">Expired</Badge>;
                          if (days <= 7) return <Badge className="bg-orange-500 text-white">Critical ({days}d)</Badge>;
                          if (days <= 30) return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700">Warning ({days}d)</Badge>;
                          return <Badge variant="secondary" className="bg-green-500/20 text-green-700">Valid ({days}d)</Badge>;
                        };

                        return (
                          <TableRow key={truck.id}>
                            <TableCell className="font-mono font-medium">{truck.registrationNumber}</TableCell>
                            <TableCell className="capitalize">{truck.type.replace('-', ' ')}</TableCell>
                            <TableCell>{truck.vendorId}</TableCell>
                            <TableCell>{format(parseISO(truck.insuranceExpiry), 'dd MMM yyyy')}</TableCell>
                            <TableCell>{getStatusBadge(insuranceDays)}</TableCell>
                            <TableCell>{format(parseISO(truck.fitnessExpiry), 'dd MMM yyyy')}</TableCell>
                            <TableCell>{getStatusBadge(fitnessDays)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                {renderPagination(expiryTruckPage, mockTrucks.length, setExpiryTruckPage)}
              </div>

              {/* Driver License Table */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <IdCard className="h-5 w-5 text-primary" />
                    Driver License Expiry
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {mockDrivers.length} Drivers
                  </Badge>
                </div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Driver ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>License Number</TableHead>
                        <TableHead>License Expiry</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Days Left</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginate(mockDrivers, expiryDriverPage).map((driver) => {
                        const today = new Date();
                        const licenseDays = differenceInDays(parseISO(driver.licenseExpiry), today);
                        
                        const getStatusBadge = (days: number) => {
                          if (days < 0) return <Badge variant="destructive">Expired</Badge>;
                          if (days <= 7) return <Badge className="bg-orange-500 text-white">Critical</Badge>;
                          if (days <= 30) return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700">Warning</Badge>;
                          return <Badge variant="secondary" className="bg-green-500/20 text-green-700">Valid</Badge>;
                        };

                        return (
                          <TableRow key={driver.id}>
                            <TableCell className="font-mono">{driver.id}</TableCell>
                            <TableCell className="font-medium">{driver.name}</TableCell>
                            <TableCell>{driver.phone}</TableCell>
                            <TableCell className="font-mono text-xs">{driver.licenseNumber}</TableCell>
                            <TableCell>{format(parseISO(driver.licenseExpiry), 'dd MMM yyyy')}</TableCell>
                            <TableCell>{getStatusBadge(licenseDays)}</TableCell>
                            <TableCell className={`font-medium ${licenseDays < 0 ? 'text-red-600' : licenseDays <= 7 ? 'text-orange-600' : licenseDays <= 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                              {licenseDays < 0 ? `${Math.abs(licenseDays)} days ago` : `${licenseDays} days`}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                {renderPagination(expiryDriverPage, mockDrivers.length, setExpiryDriverPage)}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Spare Truck Usage Report */}
        <TabsContent value="spare-usage" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ArrowRightLeft className="h-5 w-5 text-primary" />
                  Spare Truck Usage Report
                </CardTitle>
                <CardDescription>Track spare truck deployments and breakdown replacements</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleDownload("spare_usage", "csv")}>
                  <FileSpreadsheet className="h-4 w-4 mr-1" /> CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDownload("spare_usage", "pdf")}>
                  <Download className="h-4 w-4 mr-1" /> PDF
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleEmailExport("Spare Usage")}>
                  <Mail className="h-4 w-4 mr-1" /> Email
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Filter by Status:</span>
                <div className="flex gap-1">
                  {[
                    { key: "all", label: "All" },
                    { key: "active", label: "Active" },
                    { key: "completed", label: "Completed" }
                  ].map((filter) => (
                    <Badge
                      key={filter.key}
                      variant={spareStatusFilter === filter.key ? "default" : "outline"}
                      className={`cursor-pointer ${spareStatusFilter === filter.key ? "" : "hover:bg-muted"}`}
                      onClick={() => { setSpareStatusFilter(filter.key); setSpareUsagePage(1); }}
                    >
                      {filter.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {(() => {
                const filteredData = spareStatusFilter === "all" 
                  ? spareUsageData 
                  : spareUsageData.filter(d => d.status === spareStatusFilter);
                  
                return (
                  <>
                    {/* Summary Cards */}
                    <div className="grid gap-4 md:grid-cols-4">
                      <Card className="bg-primary/10 border-primary/30">
                        <CardContent className="pt-4">
                          <div className="text-2xl font-bold text-primary">{filteredData.length}</div>
                          <p className="text-sm text-muted-foreground">Total Deployments</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-green-500/10 border-green-500/30">
                        <CardContent className="pt-4">
                          <div className="text-2xl font-bold text-green-600">{filteredData.filter(s => s.status === "completed").length}</div>
                          <p className="text-sm text-muted-foreground">Completed</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-yellow-500/10 border-yellow-500/30">
                        <CardContent className="pt-4">
                          <div className="text-2xl font-bold text-yellow-600">{filteredData.filter(s => s.status === "active").length}</div>
                          <p className="text-sm text-muted-foreground">Currently Active</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted">
                        <CardContent className="pt-4">
                          <div className="text-2xl font-bold">~5.5h</div>
                          <p className="text-sm text-muted-foreground">Avg Duration</p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead>Date</TableHead>
                            <TableHead>Spare Truck</TableHead>
                            <TableHead>Original Truck</TableHead>
                            <TableHead>Route</TableHead>
                            <TableHead>Vendor</TableHead>
                            <TableHead>Breakdown Reason</TableHead>
                            <TableHead>Activated</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginate(filteredData, spareUsagePage).map((record) => (
                            <TableRow key={record.id}>
                              <TableCell>{record.date}</TableCell>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">SPARE</Badge>
                                  {record.spareTruck}
                                </div>
                              </TableCell>
                              <TableCell>{record.originalTruck}</TableCell>
                              <TableCell>{record.route}</TableCell>
                              <TableCell className="text-sm">{record.vendor}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Wrench className="h-3 w-3 text-muted-foreground" />
                                  {record.breakdownReason}
                                </div>
                              </TableCell>
                              <TableCell>{record.activatedAt}</TableCell>
                              <TableCell className="font-medium">{record.duration}</TableCell>
                              <TableCell>
                                {record.status === "active" ? (
                                  <Badge className="bg-yellow-500/20 text-yellow-700">Active</Badge>
                                ) : (
                                  <Badge className="bg-green-500/20 text-green-700">Completed</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {renderPagination(spareUsagePage, filteredData.length, setSpareUsagePage)}
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
