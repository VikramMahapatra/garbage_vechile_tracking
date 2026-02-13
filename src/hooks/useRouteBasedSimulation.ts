import { useState, useEffect } from "react";
import { useRoutes } from "./useDataQueries";

interface TruckWithRoute {
  id: string;
  routeId: string;
  status: string;
  position: { lat: number; lng: number };
  speed: number;
  [key: string]: any;
}

interface PickupPoint {
  id?: string;
  lat: number;
  lng: number;
  name: string;
  latitude?: number;
  longitude?: number;
}

interface RoadCoordinate {
  lat: number;
  lng: number;
}

interface TruckSimulation {
  truckId: string;
  position: { lat: number; lng: number };
  bearing: number; // Direction the truck is facing (0-360 degrees)
  speed: number; // Speed in km/h
  status: string; // Current simulated status (may differ from truck.status)
  statusCooldown: number; // Cycles remaining before status can change
  currentPickupIndex: number;
  roadPathIndex: number; // Current position in road path
  progressOnPath: number; // 0-1, progress through current road segment
  lastPosition: { lat: number; lng: number }; // For speed calculation
}

const SIMULATION_INTERVAL = 2000; // Update every 2 seconds
const EARTH_RADIUS_KM = 6371;

/**
 * Haversine distance calculation between two points (in km)
 */
function calculateDistance(from: { lat: number; lng: number }, to: { lat: number; lng: number }): number {
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((from.lat * Math.PI) / 180) *
    Math.cos((to.lat * Math.PI) / 180) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

/**
 * Interpolate position between two points
 */
function interpolatePosition(
  from: RoadCoordinate,
  to: RoadCoordinate,
  progress: number
): { lat: number; lng: number } {
  return {
    lat: from.lat + (to.lat - from.lat) * progress,
    lng: from.lng + (to.lng - from.lng) * progress,
  };
}

/**
 * Calculate bearing (direction) between two points in degrees (0-360)
 * 0 = North, 90 = East, 180 = South, 270 = West
 */
function calculateBearing(from: RoadCoordinate, to: RoadCoordinate): number {
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  const bearing = Math.atan2(y, x) * (180 / Math.PI);

  return (bearing + 360) % 360;
}

/**
 * Find nearest road path between two pickup points using export.geojson
 */
async function findRoadPath(
  from: PickupPoint,
  to: PickupPoint
): Promise<RoadCoordinate[]> {
  try {
    const response = await fetch('/export.geojson');
    const geojson = await response.json();

    if (!geojson.type || geojson.type !== 'FeatureCollection' || !geojson.features) {
      return [from, to]; // Fallback to straight line
    }

    // Find all road segments
    const roadSegments = geojson.features
      .filter((feature: any) =>
        feature.geometry?.type === 'LineString' &&
        feature.geometry?.coordinates?.length > 0
      )
      .map((feature: any) => ({
        coordinates: feature.geometry.coordinates.map((coord: [number, number]) => ({
          lat: coord[1],
          lng: coord[0],
        })),
      }));

    if (roadSegments.length === 0) {
      return [from, to];
    }

    // Find road segments near start point
    const nearbyStartRoads = roadSegments.filter((road) => {
      const firstCoord = road.coordinates[0];
      const lastCoord = road.coordinates[road.coordinates.length - 1];
      const distToFirst = calculateDistance(from, firstCoord);
      const distToLast = calculateDistance(from, lastCoord);
      return Math.min(distToFirst, distToLast) < 1; // Within 1 km
    });

    if (nearbyStartRoads.length === 0) {
      return [from, to]; // No nearby roads
    }

    // Find road segments near end point
    const nearbyEndRoads = roadSegments.filter((road) => {
      const firstCoord = road.coordinates[0];
      const lastCoord = road.coordinates[road.coordinates.length - 1];
      const distToFirst = calculateDistance(to, firstCoord);
      const distToLast = calculateDistance(to, lastCoord);
      return Math.min(distToFirst, distToLast) < 1; // Within 1 km
    });

    if (nearbyEndRoads.length === 0) {
      return [from, to];
    }

    // Find best start and end coordinates
    let bestStartRoad = nearbyStartRoads[0];
    let bestStartCoord = bestStartRoad.coordinates[0];
    let minStartDist = calculateDistance(from, bestStartCoord);

    for (const road of nearbyStartRoads) {
      for (const coord of road.coordinates) {
        const dist = calculateDistance(from, coord);
        if (dist < minStartDist) {
          minStartDist = dist;
          bestStartCoord = coord;
          bestStartRoad = road;
        }
      }
    }

    let bestEndRoad = nearbyEndRoads[0];
    let bestEndCoord = bestEndRoad.coordinates[0];
    let minEndDist = calculateDistance(to, bestEndCoord);

    for (const road of nearbyEndRoads) {
      for (const coord of road.coordinates) {
        const dist = calculateDistance(to, coord);
        if (dist < minEndDist) {
          minEndDist = dist;
          bestEndCoord = coord;
          bestEndRoad = road;
        }
      }
    }

    // Simple path: start point → start road segment → end road segment → end point
    // For now, just connect them
    const roadPath: RoadCoordinate[] = [from];

    // Add best start road
    const startCoordIndex = bestStartRoad.coordinates.indexOf(bestStartCoord);
    if (startCoordIndex >= 0) {
      const isForward = startCoordIndex < bestStartRoad.coordinates.length / 2;
      const startSegment = isForward
        ? bestStartRoad.coordinates.slice(startCoordIndex)
        : bestStartRoad.coordinates.slice(0, startCoordIndex + 1).reverse();
      roadPath.push(...startSegment);
    }

    // Add connecting segment if different roads
    if (bestStartRoad !== bestEndRoad) {
      // Simple: just add a point at the midpoint
      const mid = {
        lat: (bestStartCoord.lat + bestEndCoord.lat) / 2,
        lng: (bestStartCoord.lng + bestEndCoord.lng) / 2,
      };
      roadPath.push(mid);
    }

    // Add end road
    const endCoordIndex = bestEndRoad.coordinates.indexOf(bestEndCoord);
    if (endCoordIndex >= 0) {
      const isForward = endCoordIndex < bestEndRoad.coordinates.length / 2;
      const endSegment = isForward
        ? bestEndRoad.coordinates.slice(endCoordIndex)
        : bestEndRoad.coordinates.slice(0, endCoordIndex + 1).reverse();
      roadPath.push(...endSegment);
    }

    roadPath.push(to);

    console.log(`🛣️ Road path: ${roadPath.length} coordinates`);
    return roadPath;
  } catch (error) {
    console.error('Error loading road path:', error);
    return [from, to]; // Fallback
  }
}

/**
 * Simulates truck movement along routes following actual roads
 */
export function useRouteBasedSimulation(trucks: TruckWithRoute[]) {
  const { data: routesData = [] } = useRoutes();

  // Store truck simulations: Map<truckId, TruckSimulation>
  const [simulations, setSimulations] = useState<Map<string, TruckSimulation>>(new Map());

  // Store route pickup points: Map<routeId, PickupPoint[]>
  const [routePickupPointsCache, setRoutePickupPointsCache] = useState<Map<string, PickupPoint[]>>(new Map());

  // Store road paths: Map<"routeId-fromIndex-toIndex", RoadCoordinate[]>
  const [roadPathsCache, setRoadPathsCache] = useState<Map<string, RoadCoordinate[]>>(new Map());

  // Load pickup points from routes
  useEffect(() => {
    if (routesData.length === 0) return;

    const cache = new Map<string, PickupPoint[]>();
    console.log(`📦 Loading pickup points from ${routesData.length} routes...`);

    for (const route of (routesData as any[])) {
      const pickupPoints = route.pickup_points;

      if (!pickupPoints || !Array.isArray(pickupPoints) || pickupPoints.length === 0) {
        continue;
      }

      const points: PickupPoint[] = pickupPoints
        .filter((pp: any) => pp.latitude && pp.longitude)
        .map((pp: any) => ({
          lat: pp.latitude,
          lng: pp.longitude,
          name: pp.name || "Pickup Point",
        }));

      if (points.length > 0) {
        cache.set(route.id, points);
        console.log(`✅ Route ${route.id}: ${points.length} pickup points`);
      }
    }

    console.log(`📍 Total routes: ${cache.size}`);
    setRoutePickupPointsCache(cache);
  }, [routesData]);

  // Preload road paths for all routes
  useEffect(() => {
    if (routePickupPointsCache.size === 0) return;

    const loadRoadPaths = async () => {
      const pathsCache = new Map<string, RoadCoordinate[]>();
      console.log(`🛣️ Loading road paths for ${routePickupPointsCache.size} routes...`);

      for (const [routeId, points] of routePickupPointsCache) {
        if (points.length < 2) continue;

        for (let i = 0; i < points.length; i++) {
          const from = points[i];
          const to = points[(i + 1) % points.length];
          const pathKey = `${routeId}-${i}`;

          if (!pathsCache.has(pathKey)) {
            const roadPath = await findRoadPath(from, to);
            pathsCache.set(pathKey, roadPath);
            console.log(`✅ Path ${routeId}-${i}: ${roadPath.length} nodes`);
          }
        }
      }

      setRoadPathsCache(pathsCache);
      console.log(`🗺️ Total paths cached: ${pathsCache.size}`);
    };

    loadRoadPaths();
  }, [routePickupPointsCache]);

  // Initialize truck simulations
  useEffect(() => {
    if (routePickupPointsCache.size === 0) return;

    const newSimulations = new Map<string, TruckSimulation>();
    console.log(`🚛 Initializing ${trucks.length} trucks...`);

    for (const truck of trucks) {
      if (!truck.routeId || truck.status === "offline" || truck.status === "breakdown") {
        continue;
      }

      const points = routePickupPointsCache.get(truck.routeId);
      if (!points || points.length === 0) {
        continue;
      }

      newSimulations.set(truck.id, {
        truckId: truck.id,
        position: { ...points[0] },
        bearing: 0,
        speed: 0,
        status: "moving", // Default to moving for simulation
        statusCooldown: 5 + Math.floor(Math.random() * 5), // Start with moving for 10-20 cycles
        currentPickupIndex: 0,
        roadPathIndex: 0,
        progressOnPath: 0,
        lastPosition: { ...points[0] },
      });

      console.log(`✅ Truck ${truck.id}: Initialized`);
    }

    console.log(`🚦 Total trucks: ${newSimulations.size}/${trucks.length}`);
    setSimulations(newSimulations);
  }, [routePickupPointsCache, trucks]);

  // Update truck positions
  useEffect(() => {
    const interval = setInterval(() => {
      setSimulations((prevSimulations) => {
        const updated = new Map(prevSimulations);

        for (const truck of trucks) {
          if (!truck.routeId || truck.status === "offline" || truck.status === "breakdown") {
            continue;
          }

          const sim = updated.get(truck.id);
          if (!sim) continue;

          const points = routePickupPointsCache.get(truck.routeId);
          if (!points || points.length === 0) continue;

          // Get road path
          const pathKey = `${truck.routeId}-${sim.currentPickupIndex}`;
          const roadPath = roadPathsCache.get(pathKey);
          if (!roadPath || roadPath.length < 2) continue;

          // Status management: Decrement cooldown and randomly change status
          let currentStatus = sim.status;
          let newCooldown = Math.max(0, sim.statusCooldown - 1);
          
          if (newCooldown === 0) {
            if (sim.status === "moving") {
              // 10% chance to become idle/dumping (for 2-3 cycles = 4-6 seconds)
              if (Math.random() < 0.1) {
                currentStatus = Math.random() < 0.5 ? "idle" : "dumping";
                newCooldown = 2 + Math.floor(Math.random() * 2); // 2-4 cycles
              } else {
                // Refresh cooldown to stay moving longer
                newCooldown = 5 + Math.floor(Math.random() * 5); // 10-20 cycles
              }
            } else if (sim.status === "idle" || sim.status === "dumping") {
              // 40% chance to resume moving (to prevent long idle periods)
              if (Math.random() < 0.4) {
                currentStatus = "moving";
                newCooldown = 5 + Math.floor(Math.random() * 5); // Stay moving for 10-20 cycles
              } else {
                // Stay idle/dumping
                newCooldown = 2 + Math.floor(Math.random() * 2); // 2-4 more cycles
              }
            }
          }

          // Calculate distance covered in this update interval
          // Only move if truck is actually moving
          const distanceCoveredKm = currentStatus === "moving" ? (truck.speed || 30) * (SIMULATION_INTERVAL / (1000 * 3600)) : 0;

          const intervalHours = SIMULATION_INTERVAL / (1000 * 3600);

          // Current position on road path
          let roadIndex = sim.roadPathIndex;
          let progress = sim.progressOnPath;

          // Total distance we need to cover
          let remainingDistance = distanceCoveredKm;

          // Move along the road path
          while (remainingDistance > 0 && roadIndex < roadPath.length - 1) {
            const currentCoord = roadPath[roadIndex];
            const nextCoord = roadPath[roadIndex + 1];

            const segmentDistance = calculateDistance(currentCoord, nextCoord);
            const distanceOnSegment = segmentDistance * (1 - progress);

            if (remainingDistance >= distanceOnSegment) {
              // Move to next segment
              remainingDistance -= distanceOnSegment;
              roadIndex++;
              progress = 0;
            } else {
              // Stay on current segment
              progress += remainingDistance / segmentDistance;
              remainingDistance = 0;
            }
          }

          // Check if we reached the end of road path
          if (roadIndex >= roadPath.length - 1) {
            // Move to next pickup point
            const nextPickupIndex = (sim.currentPickupIndex + 1) % points.length;
            const nextPoint = points[nextPickupIndex];

            updated.set(truck.id, {
              ...sim,
              position: nextPoint,
              bearing: sim.bearing,
              speed: currentStatus === "moving" ? (truck.speed || 25) : 0,
              status: currentStatus,
              statusCooldown: newCooldown,
              lastPosition: nextPoint,
              currentPickupIndex: nextPickupIndex,
              roadPathIndex: 0,
              progressOnPath: 0,
            });
          } else {
          // Interpolate position on current segment
            const currentCoord = roadPath[roadIndex];
            const nextCoord = roadPath[roadIndex + 1];
            const newPosition = interpolatePosition(currentCoord, nextCoord, progress);
            const bearing = calculateBearing(currentCoord, nextCoord);

            updated.set(truck.id, {
              ...sim,
              position: newPosition,
              bearing: bearing,
              speed: currentStatus === "moving" ? (truck.speed || 25) : 0,
              status: currentStatus,
              statusCooldown: newCooldown,
              lastPosition: newPosition,
              roadPathIndex: roadIndex,
              progressOnPath: progress,
            });
          }
        }

        return updated;
      });
    }, SIMULATION_INTERVAL);

    return () => clearInterval(interval);
  }, [trucks, routePickupPointsCache, roadPathsCache]);

  // Merge simulated positions with truck data
  const simulatedTrucks = trucks.map((truck) => {
    const sim = simulations.get(truck.id);
    if (!sim) return truck;

    return {
      ...truck,
      position: sim.position,
      bearing: sim.bearing,
      speed: sim.speed,
      status: sim.status, // Use simulated status for marker display
    };
  });

  return {
    simulatedTrucks,
    routePickupPointsCache,
  };
}

