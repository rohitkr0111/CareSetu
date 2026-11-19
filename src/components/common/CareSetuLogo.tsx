import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

export const CareSetuLogo: React.FC<LogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  }[size];

  const titleSize = {
    sm: 'text-base font-semibold',
    md: 'text-lg font-semibold tracking-tight',
    lg: 'text-2xl font-bold tracking-tight',
  }[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`${iconDimensions} rounded-lg bg-[#FBFBF8] border border-subtle flex items-center justify-center relative overflow-hidden shadow-surface flex-shrink-0`}
      >
        {/* Minimal geometric symbol: Cross + Connected Nodes + Resource Flow */}
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5/6 h-5/6"
        >
          {/* Subtle connecting node lines */}
          <path
            d="M8 16H24M16 8V24"
            stroke="#A16207"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.7"
          />
          {/* Center core diamond node */}
          <rect
            x="13.5"
            y="13.5"
            width="5"
            height="5"
            transform="rotate(45 16 16)"
            fill="#243B80"
          />
          {/* Top-bottom and left-right pulse nodes */}
          <circle cx="16" cy="8" r="2" fill="#1C1C1E" />
          <circle cx="24" cy="16" r="2" fill="#243B80" />
          <circle cx="16" cy="24" r="2" fill="#A16207" />
          <circle cx="8" cy="16" r="2" fill="#1C1C1E" />
          
          {/* Dynamic flow arc */}
          <path
            d="M10 10C13 7 19 7 22 10"
            stroke="#243B80"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeDasharray="2 2"
          />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`text-[#1C1C1E] font-heading ${titleSize}`}>
            Care<span className="text-[#243B80]">Setu</span>
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FBFBF8] text-[#243B80] border border-[#243B80]/25 font-mono font-medium">
            OPS
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[11px] text-[#667085] tracking-normal -mt-0.5 font-medium">
            Intelligent Care Operations
          </span>
        )}
      </div>
    </div>
  );
};
