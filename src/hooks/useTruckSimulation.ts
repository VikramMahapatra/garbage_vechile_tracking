import { useState, useEffect, useCallback } from "react";
import { trucks, TruckData, TruckStatus, KHARADI_CENTER } from "@/data/fleetData";

interface SimulatedTruck extends TruckData {
  bearing: number;
}

// Simulate realistic movement patterns
const MOVEMENT_INTERVAL = 2000; // Update every 2 seconds
const SPEED_VARIANCE = 0.0001; // Position change magnitude

export function useTruckSimulation() {
  const [simulatedTrucks, setSimulatedTrucks] = useState<SimulatedTruck[]>(() =>
    trucks.map(truck => ({
      ...truck,
      bearing: Math.random() * 360,
    }))
  );

  const updateTruckPositions = useCallback(() => {
    setSimulatedTrucks(prevTrucks =>
      prevTrucks.map(truck => {
        // Skip offline trucks
        if (truck.status === "offline") return truck;

        // Randomly change status occasionally (5% chance)
        let newStatus: TruckStatus = truck.status;
        if (Math.random() < 0.05) {
          const statuses: TruckStatus[] = ["moving", "idle", "dumping"];
          newStatus = statuses[Math.floor(Math.random() * statuses.length)];
        }

        // Only move if status is "moving"
        if (newStatus !== "moving") {
          return { ...truck, status: newStatus, speed: newStatus === "idle" ? 0 : truck.speed };
        }

        // Calculate new position with slight randomness
        const bearingChange = (Math.random() - 0.5) * 30; // ±15 degrees
        const newBearing = (truck.bearing + bearingChange + 360) % 360;
        
        // Convert bearing to radians
        const bearingRad = (newBearing * Math.PI) / 180;
        
        // Calculate movement based on speed (faster = more movement)
        const speedFactor = (truck.speed / 40) * SPEED_VARIANCE;
        const latChange = Math.cos(bearingRad) * speedFactor;
        const lngChange = Math.sin(bearingRad) * speedFactor;

        let newLat = truck.position.lat + latChange;
        let newLng = truck.position.lng + lngChange;

        // Keep trucks within bounds of Kharadi area
        const maxOffset = 0.02;
        if (Math.abs(newLat - KHARADI_CENTER.lat) > maxOffset) {
          newLat = KHARADI_CENTER.lat + (Math.random() - 0.5) * maxOffset;
        }
        if (Math.abs(newLng - KHARADI_CENTER.lng) > maxOffset) {
          newLng = KHARADI_CENTER.lng + (Math.random() - 0.5) * maxOffset;
        }

        // Vary speed slightly
        const newSpeed = Math.max(5, Math.min(45, truck.speed + (Math.random() - 0.5) * 10));

        return {
          ...truck,
          position: { lat: newLat, lng: newLng },
          bearing: newBearing,
          speed: Math.round(newSpeed),
          status: newStatus,
        };
      })
    );
  }, []);

  useEffect(() => {
    const interval = setInterval(updateTruckPositions, MOVEMENT_INTERVAL);
    return () => clearInterval(interval);
  }, [updateTruckPositions]);

  return { simulatedTrucks };
}
