import { useState, useEffect, useCallback, useMemo } from "react";
import { GoogleMap, Marker, Polyline } from "@react-google-maps/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, FastForward, Rewind, MapPin, Clock, Navigation, Gauge, Route, Timer, Maximize2, Minimize2 } from "lucide-react";
import { TruckData, generateHistoricalPath, KHARADI_CENTER, gcpLocations, pickupPoints } from "@/data/fleetData";
import { useSmoothTruckAnimation } from "@/hooks/useSmoothTruckAnimation";

interface TruckJourneyReplayModalProps {
  truck: TruckData | null;
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
}

const containerStyle = { width: '100%', height: '100%' };
const expandedContainerStyle = { width: '100%', height: '100%' };

// Number of trail points to show behind the truck
const TRAIL_LENGTH = 8;

// Create a rotated truck icon for smooth animation
function createAnimatedTruckIcon(bearing: number, truckType: string): string {
  const isPrimary = truckType === 'primary';
  const mainColor = isPrimary ? '#22c55e' : '#3b82f6';
  const label = isPrimary ? 'P' : 'S';
  
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <g transform="rotate(${bearing}, 24, 24)">
        <!-- Shadow -->
        <ellipse cx="24" cy="42" rx="12" ry="4" fill="rgba(0,0,0,0.2)"/>
        <!-- Truck body -->
        <rect x="14" y="16" width="20" height="24" rx="3" fill="${mainColor}" stroke="white" stroke-width="2"/>
        <!-- Cabin -->
        <rect x="16" y="8" width="16" height="12" rx="2" fill="${mainColor}" stroke="white" stroke-width="2"/>
        <!-- Windshield -->
        <rect x="18" y="10" width="12" height="6" rx="1" fill="#1e293b"/>
        <!-- Arrow indicator (direction) -->
        <polygon points="24,4 28,12 20,12" fill="white"/>
        <!-- Type label -->
        <circle cx="24" cy="28" r="6" fill="white"/>
        <text x="24" y="32" text-anchor="middle" font-size="10" font-weight="bold" fill="${mainColor}">${label}</text>
        <!-- Wheels -->
        <rect x="12" y="32" width="4" height="6" rx="1" fill="#1e293b"/>
        <rect x="32" y="32" width="4" height="6" rx="1" fill="#1e293b"/>
      </g>
    </svg>
  `)}`;
}

// Create pickup point marker
function createPickupMarker(visited: boolean, type: string): string {
  const color = visited ? '#22c55e' : '#f59e0b';
  const typeIcon = type === 'hospital' ? '🏥' : type === 'market' ? '🏪' : type === 'commercial' ? '🏢' : '🏠';
  
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
      <circle cx="14" cy="14" r="12" fill="${color}" stroke="white" stroke-width="2"/>
      <text x="14" y="18" text-anchor="middle" font-size="10">${typeIcon}</text>
    </svg>
  `)}`;
}

// Generate a smoother, more realistic path through pickup points
function generateRealisticPath(truckId: string, date: string): { lat: number; lng: number; timestamp: string }[] {
  const routePickupPoints = pickupPoints.slice(0, 5); // First 5 pickup points for the route
  const gcp = gcpLocations[0]; // End at first GCP
  
  const path: { lat: number; lng: number; timestamp: string }[] = [];
  
  // Start position
  const startPos = { lat: 18.5480, lng: 73.9380 };
  path.push({ ...startPos, timestamp: `${date} 06:00:00` });
  
  // Generate smooth path through each pickup point
  const waypoints = [
    startPos,
    ...routePickupPoints.map(p => p.position),
    gcp.position
  ];
  
  let totalMinutes = 0;
  
  for (let i = 0; i < waypoints.length - 1; i++) {
    const from = waypoints[i];
    const to = waypoints[i + 1];
    
    // Generate intermediate points for smooth movement
    const segments = 15; // More segments = smoother movement
    for (let j = 1; j <= segments; j++) {
      const t = j / segments;
      
      // Add slight curve using bezier-like interpolation
      const midLat = (from.lat + to.lat) / 2 + (Math.random() - 0.5) * 0.001;
      const midLng = (from.lng + to.lng) / 2 + (Math.random() - 0.5) * 0.001;
      
      // Quadratic bezier interpolation for smoother curves
      const lat = (1 - t) * (1 - t) * from.lat + 2 * (1 - t) * t * midLat + t * t * to.lat;
      const lng = (1 - t) * (1 - t) * from.lng + 2 * (1 - t) * t * midLng + t * t * to.lng;
      
      totalMinutes += 2; // 2 minutes between points
      const hour = Math.floor(totalMinutes / 60) + 6;
      const minute = totalMinutes % 60;
      
      path.push({
        lat,
        lng,
        timestamp: `${date} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`,
      });
    }
    
    // Pause at pickup points (add duplicate point)
    if (i < waypoints.length - 2) {
      totalMinutes += 5; // 5 minute stop at each pickup
      const hour = Math.floor(totalMinutes / 60) + 6;
      const minute = totalMinutes % 60;
      path.push({
        lat: to.lat,
        lng: to.lng,
        timestamp: `${date} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`,
      });
    }
  }
  
  return path;
}

// Speed options for playback
const SPEED_OPTIONS = [0.5, 1, 2, 4, 8];

export function TruckJourneyReplayModal({ 
  truck, 
  isOpen, 
  onClose, 
  selectedDate 
}: TruckJourneyReplayModalProps) {
  const [pathData, setPathData] = useState<{ lat: number; lng: number; timestamp: string }[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Route waypoints (pickup points + GCP)
  const routeWaypoints = useMemo(() => {
    const points = pickupPoints.slice(0, 5).map(p => ({
      ...p,
      visited: false,
    }));
    return points;
  }, []);

  // Use smooth animation hook
  const {
    position: currentPosition,
    bearing,
    progress,
    currentSegment,
    isComplete,
    setProgress,
    reset,
  } = useSmoothTruckAnimation(
    pathData,
    isPlaying,
    playbackSpeed,
    () => setIsPlaying(false)
  );

  // Load path data when truck or date changes
  useEffect(() => {
    if (truck && isOpen) {
      const path = generateRealisticPath(truck.id, selectedDate);
      setPathData(path);
      setIsPlaying(false);
    }
  }, [truck, selectedDate, isOpen]);

  // Reset animation when path data changes
  useEffect(() => {
    if (pathData.length > 0) {
      reset();
    }
  }, [pathData.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-pan map to follow truck
  useEffect(() => {
    if (mapRef && isPlaying && currentPosition.lat !== 0) {
      mapRef.panTo(currentPosition);
    }
  }, [mapRef, currentPosition, isPlaying]);

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleRestart = () => {
    reset();
    setIsPlaying(true);
  };

  const handleSliderChange = (value: number[]) => {
    const newProgress = value[0] / 100;
    setProgress(newProgress);
    setIsPlaying(false);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
  };

  const cycleSpeed = () => {
    const currentIndex = SPEED_OPTIONS.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % SPEED_OPTIONS.length;
    setPlaybackSpeed(SPEED_OPTIONS[nextIndex]);
  };

  const handleSkipBack = () => {
    setProgress(Math.max(0, progress - 0.1));
    setIsPlaying(false);
  };

  const handleSkipForward = () => {
    setProgress(Math.min(1, progress + 0.1));
    setIsPlaying(false);
  };

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMapRef(map);
    setIsMapLoaded(true);
  }, []);

  const handleClose = () => {
    setIsPlaying(false);
    setIsExpanded(false);
    reset();
    onClose();
  };

  if (!truck) return null;

  // Calculate which waypoints have been visited
  const visitedWaypoints = routeWaypoints.map((wp, idx) => {
    // Each waypoint takes approximately 1/(total waypoints + 1) of progress
    const waypointProgress = (idx + 1) / (routeWaypoints.length + 1);
    return progress >= waypointProgress;
  });

  // Split path for visualization
  const progressIndex = Math.floor(progress * (pathData.length - 1));
  const traveledPath = pathData.slice(0, progressIndex + 1).map(p => ({ lat: p.lat, lng: p.lng }));
  const remainingPath = pathData.slice(progressIndex).map(p => ({ lat: p.lat, lng: p.lng }));

  // Get current timestamp
  const currentTimeIndex = Math.floor(progress * (pathData.length - 1));
  const currentTime = pathData[currentTimeIndex]?.timestamp?.split(' ')[1] || '--:--';
  const startTime = pathData[0]?.timestamp?.split(' ')[1] || '--:--';
  const endTime = pathData[pathData.length - 1]?.timestamp?.split(' ')[1] || '--:--';

  // Calculate real-time stats
  const calculateStats = () => {
    // Calculate current speed based on segment distance and time
    const baseSpeed = 25 + Math.random() * 15; // Simulated speed 25-40 km/h
    const currentSpeed = isPlaying ? baseSpeed.toFixed(1) : '0.0';
    
    // Calculate total distance and traveled distance
    const totalDistanceKm = 8.5; // Approximate total route distance
    const traveledDistanceKm = (totalDistanceKm * progress).toFixed(2);
    
    // Calculate elapsed time based on timestamps
    const parseTime = (timeStr: string) => {
      const [h, m, s] = timeStr.split(':').map(Number);
      return h * 60 + m + s / 60;
    };
    
    const startMinutes = parseTime(startTime);
    const currentMinutes = parseTime(currentTime);
    const elapsedMinutes = currentMinutes - startMinutes;
    const elapsedHours = Math.floor(elapsedMinutes / 60);
    const elapsedMins = Math.floor(elapsedMinutes % 60);
    
    // Calculate wait time at pickup points (5 min each)
    const visitedCount = visitedWaypoints.filter(Boolean).length;
    const totalWaitTime = visitedCount * 5;
    
    // Calculate average speed
    const avgSpeed = elapsedMinutes > 0 
      ? ((parseFloat(traveledDistanceKm) / (elapsedMinutes / 60))).toFixed(1)
      : '0.0';
    
    return {
      currentSpeed,
      traveledDistanceKm,
      totalDistanceKm: totalDistanceKm.toFixed(2),
      elapsedTime: `${elapsedHours}h ${elapsedMins}m`,
      totalWaitTime: `${totalWaitTime} min`,
      avgSpeed,
      remainingDistance: (totalDistanceKm - parseFloat(traveledDistanceKm)).toFixed(2),
    };
  };

  const stats = calculateStats();

  // Generate trail points for visual effect (computed inline, not a hook)
  const trailPoints = progressIndex < 1 
    ? [] 
    : pathData.slice(Math.max(0, progressIndex - TRAIL_LENGTH), progressIndex).map((p, idx, arr) => ({
        lat: p.lat,
        lng: p.lng,
        opacity: (idx + 1) / arr.length,
      }));

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={`${isExpanded ? 'max-w-[95vw] h-[95vh]' : 'max-w-5xl h-[85vh]'} flex flex-col overflow-hidden transition-all duration-300`}>
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-3">
            <Navigation className="h-5 w-5 text-primary" />
            Journey Replay - {truck.truckNumber}
            <Badge variant="outline" className="capitalize ml-2">{truck.truckType}</Badge>
            <Badge variant="secondary" className="ml-2">
              {(progress * 100).toFixed(0)}% Complete
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? "Minimize" : "Expand"}
            >
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col flex-1 min-h-0 gap-2">
          {/* Map Container - Takes 75% of available space */}
          <div className="flex-[3] min-h-0 rounded-lg overflow-hidden border border-border relative">
            <GoogleMap
              mapContainerStyle={isExpanded ? expandedContainerStyle : containerStyle}
              center={currentPosition.lat !== 0 ? currentPosition : KHARADI_CENTER}
              zoom={16}
              onLoad={onMapLoad}
              options={{
                styles: [
                  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
                  { featureType: "transit", stylers: [{ visibility: "off" }] },
                ],
                streetViewControl: false,
                fullscreenControl: true,
                mapTypeControl: false,
                zoomControl: true,
                zoomControlOptions: {
                  position: typeof google !== 'undefined' ? google.maps.ControlPosition.RIGHT_CENTER : undefined,
                },
                gestureHandling: 'greedy',
              }}
            >
              {isMapLoaded && window.google && (
                <>
                  {/* Start Marker */}
                  {pathData.length > 0 && (
                    <Marker
                      position={pathData[0]}
                      icon={{
                        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="16" cy="16" r="14" fill="#22c55e" stroke="white" stroke-width="2"/>
                            <polygon points="16,8 20,16 16,14 12,16" fill="white"/>
                            <text x="16" y="26" text-anchor="middle" font-size="8" fill="white" font-weight="bold">START</text>
                          </svg>
                        `)}`,
                        scaledSize: new window.google.maps.Size(32, 32),
                        anchor: new window.google.maps.Point(16, 16),
                      }}
                      title="Start Point"
                      zIndex={1}
                    />
                  )}

                  {/* GCP End Marker */}
                  {pathData.length > 0 && (
                    <Marker
                      position={gcpLocations[0].position}
                      icon={{
                        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                          <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="18" cy="18" r="16" fill="${isComplete ? '#22c55e' : '#6366f1'}" stroke="white" stroke-width="2"/>
                            <text x="18" y="15" text-anchor="middle" font-size="12">🏭</text>
                            <text x="18" y="28" text-anchor="middle" font-size="6" fill="white" font-weight="bold">GCP</text>
                          </svg>
                        `)}`,
                        scaledSize: new window.google.maps.Size(36, 36),
                        anchor: new window.google.maps.Point(18, 18),
                      }}
                      title={gcpLocations[0].name}
                      zIndex={1}
                    />
                  )}

                  {/* Pickup Point Markers */}
                  {routeWaypoints.map((wp, idx) => (
                    <Marker
                      key={wp.id}
                      position={wp.position}
                      icon={{
                        url: createPickupMarker(visitedWaypoints[idx], wp.type),
                        scaledSize: new window.google.maps.Size(28, 28),
                        anchor: new window.google.maps.Point(14, 14),
                      }}
                      title={`${wp.name} ${visitedWaypoints[idx] ? '✓' : ''}`}
                      zIndex={2}
                    />
                  ))}

                  {/* Remaining Path (dashed gray) */}
                  {remainingPath.length > 1 && (
                    <Polyline
                      path={remainingPath}
                      options={{
                        strokeColor: "#94a3b8",
                        strokeOpacity: 0.5,
                        strokeWeight: 4,
                        icons: [{
                          icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 3 },
                          offset: '0',
                          repeat: '12px'
                        }],
                      }}
                    />
                  )}

                  {/* Traveled Path (solid gradient-like) */}
                  {traveledPath.length > 1 && (
                    <Polyline
                      path={traveledPath}
                      options={{
                        strokeColor: "#22c55e",
                        strokeOpacity: 1,
                        strokeWeight: 5,
                      }}
                    />
                  )}

                  {/* Trail Effect - Fading circles behind truck */}
                  {trailPoints.map((point, idx) => (
                    <Marker
                      key={`trail-${idx}`}
                      position={{ lat: point.lat, lng: point.lng }}
                      icon={{
                        path: window.google.maps.SymbolPath.CIRCLE,
                        scale: 4 + (point.opacity * 4),
                        fillColor: truck.truckType === 'primary' ? '#22c55e' : '#3b82f6',
                        fillOpacity: point.opacity * 0.6,
                        strokeColor: 'white',
                        strokeWeight: 1,
                        strokeOpacity: point.opacity * 0.4,
                      }}
                      zIndex={5}
                    />
                  ))}

                  {/* Animated Truck Marker */}
                  {currentPosition.lat !== 0 && (
                    <Marker
                      position={currentPosition}
                      icon={{
                        url: createAnimatedTruckIcon(bearing, truck.truckType),
                        scaledSize: new window.google.maps.Size(48, 48),
                        anchor: new window.google.maps.Point(24, 24),
                      }}
                      zIndex={10}
                    />
                  )}
                </>
              )}
            </GoogleMap>

            {/* Stats overlay */}
            <div className="absolute top-3 right-3 bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-border min-w-[180px]">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Gauge className="h-3.5 w-3.5" />
                    <span>Speed</span>
                  </div>
                  <span className="font-mono font-bold text-primary">{stats.currentSpeed} km/h</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Route className="h-3.5 w-3.5" />
                    <span>Distance</span>
                  </div>
                  <span className="font-mono text-sm">{stats.traveledDistanceKm}/{stats.totalDistanceKm} km</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Timer className="h-3.5 w-3.5" />
                    <span>Elapsed</span>
                  </div>
                  <span className="font-mono text-sm">{stats.elapsedTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>Wait Time</span>
                  </div>
                  <span className="font-mono text-sm text-amber-500">{stats.totalWaitTime}</span>
                </div>
                <div className="border-t border-border pt-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Avg Speed</span>
                    <span className="font-mono text-sm text-green-500">{stats.avgSpeed} km/h</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Playback speed badge */}
            <div className="absolute top-3 left-3 bg-background/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-border">
              <div className="flex items-center gap-2 text-sm">
                <Navigation className="h-4 w-4 text-primary" style={{ transform: `rotate(${bearing}deg)` }} />
                <span className="font-bold">{playbackSpeed}x</span>
              </div>
            </div>
          </div>

          {/* Controls Section - Compact at bottom */}
          <div className="flex-shrink-0 space-y-2 pb-1">
            {/* Time Display + Progress Slider Combined */}
            <div className="flex items-center gap-3 px-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                <Clock className="h-3.5 w-3.5" />
                <span>{startTime}</span>
              </div>
              <div className="flex-1">
                <Slider
                  value={[progress * 100]}
                  max={100}
                  step={0.5}
                  onValueChange={handleSliderChange}
                  className="cursor-pointer"
                />
              </div>
              <Badge variant="secondary" className="text-sm px-2 py-0.5 font-mono">
                {currentTime}
              </Badge>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                <span>{endTime}</span>
              </div>
            </div>

            {/* Playback Controls + Info Row */}
            <div className="flex items-center justify-between gap-4 px-2">
              {/* Journey Info - Left side */}
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground">Driver: </span>
                  <span className="font-medium">{truck.driver}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Route: </span>
                  <span className="font-medium">{truck.route}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Pickups: </span>
                  <span className="font-medium text-green-600">
                    {visitedWaypoints.filter(Boolean).length}/{routeWaypoints.length}
                  </span>
                </div>
              </div>

              {/* Playback Controls - Center */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRestart}
                  title="Restart"
                  className="h-8 w-8 p-0"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSkipBack}
                  title="Skip Back 10%"
                  className="h-8 w-8 p-0"
                >
                  <Rewind className="h-3.5 w-3.5" />
                </Button>

                {isPlaying ? (
                  <Button
                    size="default"
                    onClick={handlePause}
                    className="w-10 h-10 rounded-full shadow-md"
                  >
                    <Pause className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    size="default"
                    onClick={handlePlay}
                    className="w-10 h-10 rounded-full shadow-md"
                    disabled={isComplete}
                  >
                    <Play className="h-4 w-4 ml-0.5" />
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSkipForward}
                  title="Skip Forward 10%"
                  className="h-8 w-8 p-0"
                >
                  <FastForward className="h-3.5 w-3.5" />
                </Button>

                {/* Speed selector buttons */}
                <div className="flex items-center gap-0.5 ml-1 bg-muted rounded-md p-0.5">
                  {SPEED_OPTIONS.map((speed) => (
                    <Button
                      key={speed}
                      variant={playbackSpeed === speed ? "default" : "ghost"}
                      size="sm"
                      onClick={() => handleSpeedChange(speed)}
                      className={`min-w-[36px] h-7 font-mono text-xs px-1.5 ${playbackSpeed === speed ? '' : 'hover:bg-background'}`}
                    >
                      {speed}x
                    </Button>
                  ))}
                </div>
              </div>

              {/* Status - Right side */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">{selectedDate}</span>
                <Badge variant={isComplete ? "default" : isPlaying ? "secondary" : "outline"} className="text-xs">
                  {isComplete ? "Completed" : isPlaying ? "Playing" : "Paused"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
