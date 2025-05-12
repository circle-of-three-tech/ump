'use client';

import { useTheme } from 'next-themes';

export default function Logo({ className = '', size = 32 }: { className?: string; size?: number }) {
  const { theme } = useTheme();
  const primaryColor = theme === 'dark' ? '#ffffff' : '#4F46E5';
  const secondaryColor = theme === 'dark' ? '#374151' : '#E0E7FF';
  const bgColor = theme === 'dark' ? '#1F2937' : '#F8F8FC';

  return (
    <svg className={className} width={size} height={size} viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
      {/* Background circle */}
      <circle cx="250" cy="250" r="200" fill={bgColor} />
      
      {/* Marketplace building blocks */}
      <g>
        {/* Central marketplace hub */}
        <path 
          d="M180,200 L320,200 L340,240 L160,240 Z" 
          fill={primaryColor} 
          opacity="0.9"
        />
        
        {/* Connected network lines */}
        <path 
          d="M250,140 L250,360" 
          stroke={primaryColor} 
          strokeWidth="8" 
          strokeDasharray="4 4"
        />
        <path 
          d="M160,240 L340,240" 
          stroke={primaryColor} 
          strokeWidth="8" 
          strokeDasharray="4 4"
        />
        
        {/* Transaction flow indicators */}
        <circle cx="250" cy="140" r="15" fill={secondaryColor} stroke={primaryColor} strokeWidth="3"/>
        <circle cx="250" cy="360" r="15" fill={secondaryColor} stroke={primaryColor} strokeWidth="3"/>
        <circle cx="160" cy="240" r="15" fill={secondaryColor} stroke={primaryColor} strokeWidth="3"/>
        <circle cx="340" cy="240" r="15" fill={secondaryColor} stroke={primaryColor} strokeWidth="3"/>
        
        {/* Dynamic marketplace elements */}
        <path 
          d="M200,260 C200,300 300,300 300,260" 
          fill="none" 
          stroke={primaryColor} 
          strokeWidth="6" 
          strokeLinecap="round"
        />
        
        {/* Connection points */}
        <circle cx="200" cy="280" r="8" fill={primaryColor}/>
        <circle cx="250" cy="290" r="8" fill={primaryColor}/>
        <circle cx="300" cy="280" r="8" fill={primaryColor}/>
      </g>

      {/* Brand Text */}
      <text 
        x="250" 
        y="390" 
        fontFamily="Arial, sans-serif" 
        fontWeight="bold" 
        fontSize="60" 
        textAnchor="middle" 
        fill={primaryColor}
      >
        UMP
      </text>
      
      {/* Tagline */}
      <text 
        x="250" 
        y="420" 
        fontFamily="Arial, sans-serif" 
        fontSize="16" 
        textAnchor="middle" 
        fill={primaryColor}
      >
        Campus Marketplace
      </text>
    </svg>
  );
}