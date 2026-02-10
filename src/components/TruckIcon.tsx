import { TruckStatus, TruckType } from "@/data/fleetData";

interface TruckIconProps {
  status: TruckStatus;
  type: TruckType;
  size?: number;
  className?: string;
}

const statusColors: Record<TruckStatus, string> = {
  moving: "#22c55e",
  idle: "#f59e0b",
  dumping: "#3b82f6",
  offline: "#6b7280",
  breakdown: "#ef4444",
};

export const TruckIcon = ({ status, type, size = 32, className = "" }: TruckIconProps) => {
  const color = statusColors[status];
  const isPrimary = type === "primary";
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Truck body */}
      <rect x="2" y="12" width="20" height="12" rx="2" fill={color} />
      {/* Cabin */}
      <rect x="18" y="8" width="10" height="16" rx="2" fill={color} />
      {/* Window */}
      <rect x="20" y="10" width="6" height="5" rx="1" fill="white" fillOpacity="0.8" />
      {/* Wheels */}
      <circle cx="8" cy="26" r="3" fill="#374151" stroke="white" strokeWidth="1" />
      <circle cx="24" cy="26" r="3" fill="#374151" stroke="white" strokeWidth="1" />
      {/* Type indicator */}
      {isPrimary ? (
        <text x="11" y="20" fontSize="8" fill="white" fontWeight="bold" textAnchor="middle">P</text>
      ) : (
        <text x="11" y="20" fontSize="8" fill="white" fontWeight="bold" textAnchor="middle">S</text>
      )}
      {/* Status indicator dot */}
      <circle cx="28" cy="6" r="4" fill={color} stroke="white" strokeWidth="2">
        {status === "moving" && (
          <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite" />
        )}
      </circle>
    </svg>
  );
};

// SVG data URL for Google Maps marker - Flat truck icon without pin/bubble
export const createTruckMarkerIcon = (status: TruckStatus, type: TruckType): string => {
  const color = statusColors[status];
  const typeLabel = type === "primary" ? "P" : "S";
  const typeBgColor = type === "primary" ? "#1e40af" : "#7c3aed";
  
  const svg = `
    <svg width="48" height="32" viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg">
      <!-- Shadow -->
      <ellipse cx="24" cy="30" rx="18" ry="2" fill="rgba(0,0,0,0.15)"/>
      
      <!-- Truck body/compactor -->
      <rect x="1" y="6" width="22" height="16" rx="2" fill="${color}" stroke="white" stroke-width="1.5"/>
      <rect x="3" y="8" width="18" height="12" rx="1" fill="white" opacity="0.2"/>
      
      <!-- Hydraulic lines -->
      <line x1="6" y1="9" x2="6" y2="19" stroke="white" stroke-width="0.8" opacity="0.5"/>
      <line x1="18" y1="9" x2="18" y2="19" stroke="white" stroke-width="0.8" opacity="0.5"/>
      
      <!-- Cab -->
      <rect x="23" y="4" width="14" height="18" rx="2.5" fill="${color}" stroke="white" stroke-width="1.5"/>
      
      <!-- Windshield -->
      <rect x="25" y="6" width="10" height="6" rx="1.5" fill="white" opacity="0.85"/>
      
      <!-- Door line -->
      <rect x="26" y="13" width="8" height="6" rx="0.5" fill="white" opacity="0.15" stroke="white" stroke-width="0.5" stroke-opacity="0.4"/>
      
      <!-- Side mirror -->
      <rect x="22" y="9" width="1.5" height="2.5" rx="0.5" fill="white" opacity="0.7"/>
      
      <!-- Headlight -->
      <circle cx="36" cy="16" r="1.5" fill="#fbbf24" opacity="0.9"/>
      
      <!-- Wheels -->
      <circle cx="8" cy="24" r="3.5" fill="#1f2937" stroke="white" stroke-width="1"/>
      <circle cx="8" cy="24" r="1.5" fill="#6b7280"/>
      <circle cx="32" cy="24" r="3.5" fill="#1f2937" stroke="white" stroke-width="1"/>
      <circle cx="32" cy="24" r="1.5" fill="#6b7280"/>
      
      <!-- Type badge -->
      <circle cx="42" cy="5" r="6" fill="${typeBgColor}" stroke="white" stroke-width="1.5"/>
      <text x="42" y="8" font-size="7" fill="white" font-weight="bold" text-anchor="middle" font-family="Arial, sans-serif">${typeLabel}</text>
      
      <!-- Status pulse for moving trucks -->
      ${status === "moving" ? `<circle cx="42" cy="5" r="6" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.6"><animate attributeName="r" values="6;11;6" dur="1.5s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.6;0;0.6" dur="1.5s" repeatCount="indefinite"/></circle>` : ''}
    </svg>
  `;
  
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export default TruckIcon;
