import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Fleet from "./pages/Fleet";
import RoutesPage from "./pages/Routes";
import PickupPoints from "./pages/PickupPoints";
import Alerts from "./pages/Alerts";
import Reports from "./pages/Reports";
import Analytics from "./pages/Analytics";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import TwitterMentions from "./pages/TwitterMentions";
import Tickets from "./pages/Tickets";
import MasterDrivers from "./pages/MasterDrivers";
import MasterVendors from "./pages/MasterVendors";
import MasterTrucks from "./pages/MasterTrucks";
import MasterZonesWards from "./pages/MasterZonesWards";
import MasterRoutesPickups from "./pages/MasterRoutesPickups";
import SpareVehicles from "./pages/SpareVehicles";
import ActiveTrucks from "./pages/ActiveTrucks";
import TripsCompleted from "./pages/TripsCompleted";
import ActiveAlertsDetail from "./pages/ActiveAlertsDetail";
import CollectionRate from "./pages/CollectionRate";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <Layout>{children}</Layout>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/fleet" element={<ProtectedRoute><Fleet /></ProtectedRoute>} />
            <Route path="/spare-vehicles" element={<ProtectedRoute><SpareVehicles /></ProtectedRoute>} />
            <Route path="/routes" element={<ProtectedRoute><RoutesPage /></ProtectedRoute>} />
            <Route path="/pickup-points" element={<ProtectedRoute><PickupPoints /></ProtectedRoute>} />
            <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/twitter" element={<ProtectedRoute><TwitterMentions /></ProtectedRoute>} />
            <Route path="/tickets" element={<ProtectedRoute><Tickets /></ProtectedRoute>} />
            <Route path="/master/drivers" element={<ProtectedRoute><MasterDrivers /></ProtectedRoute>} />
            <Route path="/master/vendors" element={<ProtectedRoute><MasterVendors /></ProtectedRoute>} />
            <Route path="/master/trucks" element={<ProtectedRoute><MasterTrucks /></ProtectedRoute>} />
            <Route path="/master/zones-wards" element={<ProtectedRoute><MasterZonesWards /></ProtectedRoute>} />
            <Route path="/master/routes-pickups" element={<ProtectedRoute><MasterRoutesPickups /></ProtectedRoute>} />
            <Route path="/active-trucks" element={<ProtectedRoute><ActiveTrucks /></ProtectedRoute>} />
            <Route path="/trips-completed" element={<ProtectedRoute><TripsCompleted /></ProtectedRoute>} />
            <Route path="/active-alerts" element={<ProtectedRoute><ActiveAlertsDetail /></ProtectedRoute>} />
            <Route path="/collection-rate" element={<ProtectedRoute><CollectionRate /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
