import React from 'react';

export function XanhLogo({ size = 'default' }: { size?: 'default' | 'large' }) {
  const dimensions = size === 'large' ? 40 : 32;
  const fontSize = size === 'large' ? 'text-2xl' : 'text-xl';
  
  return (
    <div className="flex items-center gap-3">
      {/* Leaf Icon with Gradient */}
      <div className="relative">
        <svg 
          width={dimensions} 
          height={dimensions} 
          viewBox="0 0 40 40" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4CAF50" />
              <stop offset="100%" stopColor="#2E7D32" />
            </linearGradient>
          </defs>
          {/* Minimalist leaf shape */}
          <path
            d="M20 4C20 4 8 8 8 20C8 28 14 34 20 36C26 34 32 28 32 20C32 8 20 4 20 4Z"
            fill="url(#leafGradient)"
            opacity="0.9"
          />
          <path
            d="M20 4V36"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.6"
          />
          <path
            d="M14 16C16 14 18 13 20 13C22 13 24 14 26 16"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.5"
          />
          <path
            d="M12 22C14 20 17 19 20 19C23 19 26 20 28 22"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.5"
          />
        </svg>
      </div>
      
      {/* XANHinsights Text with Gradient */}
      <div className={`${fontSize} font-semibold tracking-tight leading-none`}>
        <span 
          className="bg-gradient-to-r from-[#4CAF50] to-[#2E7D32] bg-clip-text text-transparent"
          style={{ fontFamily: 'Satoshi, sans-serif' }}
        >
          XANHinsights
        </span>
      </div>
    </div>
  );
}
