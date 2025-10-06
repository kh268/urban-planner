import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
}

const defaultProps: IconProps = {
  size: 24,
  strokeWidth: 2,
  className: ""
};

// Tree Icons - 2 variants
export const Tree1 = ({ size = 24, className = "", strokeWidth = 2 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth}
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 22V12" />
    <path d="M17 8c0-3.5-2.5-6-5-6s-5 2.5-5 6c0 1.5.5 2.5 1.5 3.5C7.5 12.5 7 13.5 7 15c0 2.5 2 4.5 4.5 4.5h1c2.5 0 4.5-2 4.5-4.5 0-1.5-.5-2.5-1.5-3.5C16.5 10.5 17 9.5 17 8z" />
  </svg>
);

export const Tree2 = ({ size = 24, className = "", strokeWidth = 2 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth}
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 22V10" />
    <circle cx="12" cy="7" r="5" />
    <path d="M8 12c-1.5 0-3 1-3 2.5S6.5 17 8 17h8c1.5 0 3-1 3-2.5S17.5 12 16 12" />
  </svg>
);

// Canopy Coverage Icons - 2 variants
export const Canopy1 = ({ size = 24, className = "", strokeWidth = 2 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth}
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 18h18" />
    <circle cx="6" cy="12" r="4" />
    <circle cx="12" cy="10" r="5" />
    <circle cx="18" cy="13" r="3" />
    <path d="M6 16v2M12 15v3M18 16v2" />
  </svg>
);

export const Canopy2 = ({ size = 24, className = "", strokeWidth = 2 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth}
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M2 20h20" />
    <path d="M5 20V15c0-2 1-3 2.5-3.5" />
    <path d="M12 20V12c0-3 2-5 4-5" />
    <path d="M19 20V16c0-1.5-1-2.5-2-2.5" />
    <ellipse cx="7" cy="8" rx="3" ry="2" />
    <ellipse cx="12" cy="6" rx="4" ry="2.5" />
    <ellipse cx="17" cy="9" rx="2.5" ry="1.5" />
  </svg>
);

// Heat/Temperature Icons - 2 variants
export const Heat1 = ({ size = 24, className = "", strokeWidth = 2 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth}
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
    <path d="M12 17h.01" />
    <path d="M18 6l2-2M22 10h-2M18 14l2 2M6 6L4 4M2 10h2M6 14l-2 2" />
  </svg>
);

export const Heat2 = ({ size = 24, className = "", strokeWidth = 2 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth}
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M8 2v4M12 2v4M16 2v4" />
    <path d="M3 8h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" />
    <path d="M7 12h10M7 16h6" />
  </svg>
);

// Wind/Air Flow Icons - 2 variants
export const Wind1 = ({ size = 24, className = "", strokeWidth = 2 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth}
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
    <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
    <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
  </svg>
);

export const Wind2 = ({ size = 24, className = "", strokeWidth = 2 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth}
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 8h14l-2-2M3 12h14l-2-2M3 16h14l-2-2" />
    <path d="M19 8l-2 2 2 2M19 12l-2 2 2 2M19 16l-2 2 2 2" />
  </svg>
);

// Population Icons - 2 variants
export const Population1 = ({ size = 24, className = "", strokeWidth = 2 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth}
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const Population2 = ({ size = 24, className = "", strokeWidth = 2 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth}
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="7" cy="7" r="3" />
    <circle cx="17" cy="7" r="3" />
    <circle cx="12" cy="15" r="3" />
    <path d="M7 10v2a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3v-2" />
    <path d="M12 18v3" />
  </svg>
);

// Air Quality Sensor Icons - 2 variants
export const AirSensor1 = ({ size = 24, className = "", strokeWidth = 2 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth}
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <rect x="4" y="6" width="16" height="12" rx="2" />
    <circle cx="12" cy="12" r="3" />
    <path d="M12 9v6M9 12h6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M7 18v2M17 18v2" />
  </svg>
);

export const AirSensor2 = ({ size = 24, className = "", strokeWidth = 2 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth}
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <rect x="6" y="8" width="12" height="10" rx="2" />
    <path d="M12 8V4" />
    <circle cx="12" cy="6" r="2" />
    <path d="M9 13h6M9 15h4" />
    <circle cx="9" cy="11" r="1" />
    <circle cx="15" cy="11" r="1" />
    <path d="M12 18v4M10 22h4" />
  </svg>
);

// Sunlight/Light Exposure Icons - 2 variants
export const Sun1 = ({ size = 24, className = "", strokeWidth = 2 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth}
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);

export const Sun2 = ({ size = 24, className = "", strokeWidth = 2 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth}
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v6M12 17v6M5.6 5.6l4.2 4.2M14.2 14.2l4.2 4.2M1 12h6M17 12h6M5.6 18.4l4.2-4.2M14.2 9.8l4.2-4.2" />
  </svg>
);

// Sustainable City Icons - 2 variants
export const SustainableCity1 = ({ size = 24, className = "", strokeWidth = 2 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth}
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <rect x="2" y="12" width="4" height="10" />
    <rect x="6" y="8" width="4" height="14" />
    <rect x="10" y="4" width="4" height="18" />
    <rect x="14" y="10" width="4" height="12" />
    <rect x="18" y="14" width="4" height="8" />
    <path d="M12 2L9 4l3-2 3 2z" />
    <circle cx="4" cy="10" r="1" />
    <circle cx="8" cy="6" r="1" />
    <circle cx="16" cy="8" r="1" />
    <circle cx="20" cy="12" r="1" />
  </svg>
);

export const SustainableCity2 = ({ size = 24, className = "", strokeWidth = 2 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth}
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 21h18" />
    <rect x="5" y="13" width="3" height="8" />
    <rect x="10" y="9" width="4" height="12" />
    <rect x="16" y="15" width="3" height="6" />
    <circle cx="6.5" cy="7" r="2" />
    <circle cx="12" cy="5" r="2.5" />
    <circle cx="17.5" cy="9" r="1.5" />
    <path d="M6.5 9v4M12 7.5v1.5M17.5 10.5v4.5" />
  </svg>
);

// Additional Environmental Icons
export const Leaf = ({ size = 24, className = "", strokeWidth = 2 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth}
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);

export const Building = ({ size = 24, className = "", strokeWidth = 2 }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth}
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <rect x="6" y="4" width="12" height="18" />
    <rect x="4" y="8" width="16" height="14" />
    <path d="M9 8v2M15 8v2M9 12v2M15 12v2M9 16v2M15 16v2" />
    <path d="M2 22h20" />
  </svg>
);

// Export all icons as a collection
export const UrbanIcons = {
  // Trees
  Tree1,
  Tree2,
  
  // Canopy
  Canopy1,
  Canopy2,
  
  // Heat/Temperature
  Heat1,
  Heat2,
  
  // Wind/Air Flow
  Wind1,
  Wind2,
  
  // Population
  Population1,
  Population2,
  
  // Air Quality Sensors
  AirSensor1,
  AirSensor2,
  
  // Sunlight
  Sun1,
  Sun2,
  
  // Sustainable City
  SustainableCity1,
  SustainableCity2,
  
  // Additional
  Leaf,
  Building
};

export default UrbanIcons;