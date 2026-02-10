import { useState, useEffect, useRef, useCallback } from 'react';

interface PathPoint {
  lat: number;
  lng: number;
  timestamp: string;
}

interface AnimationState {
  position: { lat: number; lng: number };
  bearing: number;
  progress: number;
  currentSegment: number;
  isComplete: boolean;
}

// Calculate bearing between two points
function calculateBearing(from: { lat: number; lng: number }, to: { lat: number; lng: number }): number {
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  let bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

// Smoothly interpolate between two values
function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

// Ease function for smoother animation
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function useSmoothTruckAnimation(
  pathData: PathPoint[],
  isPlaying: boolean,
  playbackSpeed: number,
  onComplete?: () => void
) {
  const [animationState, setAnimationState] = useState<AnimationState>({
    position: { lat: 0, lng: 0 },
    bearing: 0,
    progress: 0,
    currentSegment: 0,
    isComplete: false,
  });

  const animationRef = useRef<number | null>(null);
  const progressRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const targetBearingRef = useRef(0);
  const currentBearingRef = useRef(0);
  const playbackSpeedRef = useRef(playbackSpeed);
  
  // Keep playback speed ref updated
  useEffect(() => {
    playbackSpeedRef.current = playbackSpeed;
  }, [playbackSpeed]);

  // Calculate interpolated position
  const getInterpolatedPosition = useCallback((progress: number) => {
    if (pathData.length === 0) return { position: { lat: 0, lng: 0 }, bearing: 0, segment: 0 };
    if (pathData.length === 1) return { position: pathData[0], bearing: 0, segment: 0 };

    const totalSegments = pathData.length - 1;
    const scaledProgress = progress * totalSegments;
    const currentSegment = Math.min(Math.floor(scaledProgress), totalSegments - 1);
    const segmentProgress = scaledProgress - currentSegment;

    const from = pathData[currentSegment];
    const to = pathData[Math.min(currentSegment + 1, pathData.length - 1)];

    // Apply easing for smoother movement
    const easedProgress = easeInOutCubic(segmentProgress);

    const position = {
      lat: lerp(from.lat, to.lat, easedProgress),
      lng: lerp(from.lng, to.lng, easedProgress),
    };

    const bearing = calculateBearing(from, to);

    return { position, bearing, segment: currentSegment };
  }, [pathData]);

  // Smooth bearing interpolation
  const smoothBearing = useCallback((current: number, target: number, delta: number) => {
    // Normalize the difference to handle 360° wrapping
    let diff = target - current;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    
    // Smooth interpolation
    const smoothFactor = Math.min(1, delta * 8); // Adjust smoothness
    return (current + diff * smoothFactor + 360) % 360;
  }, []);

  // Animation loop using requestAnimationFrame
  const animate = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) {
      lastTimeRef.current = timestamp;
    }

    const deltaTime = (timestamp - lastTimeRef.current) / 1000;
    lastTimeRef.current = timestamp;

    // Speed: complete entire journey in ~20 seconds at 1x speed
    const baseSpeed = 0.05; // 5% per second at 1x
    const speed = baseSpeed * playbackSpeedRef.current;

    progressRef.current = Math.min(progressRef.current + speed * deltaTime, 1);

    const { position, bearing, segment } = getInterpolatedPosition(progressRef.current);
    
    // Smooth bearing transition
    targetBearingRef.current = bearing;
    currentBearingRef.current = smoothBearing(
      currentBearingRef.current,
      targetBearingRef.current,
      deltaTime
    );

    setAnimationState({
      position,
      bearing: currentBearingRef.current,
      progress: progressRef.current,
      currentSegment: segment,
      isComplete: progressRef.current >= 1,
    });

    if (progressRef.current >= 1) {
      onComplete?.();
      return;
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [getInterpolatedPosition, smoothBearing, onComplete]);

  // Start/stop animation
  useEffect(() => {
    if (isPlaying && pathData.length > 0) {
      // If animation completed, don't restart automatically
      // User must use reset or setProgress to restart
      if (progressRef.current >= 1) {
        return;
      }
      lastTimeRef.current = null;
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isPlaying, pathData.length]); // Removed animate from deps to prevent re-triggering

  // Initialize position
  useEffect(() => {
    if (pathData.length > 0) {
      const { position, bearing } = getInterpolatedPosition(progressRef.current);
      currentBearingRef.current = bearing;
      setAnimationState(prev => ({
        ...prev,
        position,
        bearing,
      }));
    }
  }, [pathData, getInterpolatedPosition]);

  // Set progress externally
  const setProgress = useCallback((newProgress: number) => {
    progressRef.current = Math.max(0, Math.min(1, newProgress));
    const { position, bearing, segment } = getInterpolatedPosition(progressRef.current);
    currentBearingRef.current = bearing;
    setAnimationState({
      position,
      bearing,
      progress: progressRef.current,
      currentSegment: segment,
      isComplete: progressRef.current >= 1,
    });
  }, [getInterpolatedPosition]);

  // Reset animation
  const reset = useCallback(() => {
    progressRef.current = 0;
    lastTimeRef.current = null;
    if (pathData.length > 0) {
      const { position, bearing } = getInterpolatedPosition(0);
      currentBearingRef.current = bearing;
      setAnimationState({
        position,
        bearing,
        progress: 0,
        currentSegment: 0,
        isComplete: false,
      });
    }
  }, [pathData, getInterpolatedPosition]);

  return {
    ...animationState,
    setProgress,
    reset,
  };
}
