import React from 'react';
import { StatusLevel } from '../../types';

interface StatusBadgeProps {
  status: StatusLevel | string;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'sm',
  className = '',
  showDot = true,
}) => {
  const normStatus = (status || 'NORMAL').toUpperCase();

  let dotColor = 'bg-[#4F7A5F]';
  let textColor = 'text-[#4F7A5F]';
  let bgColor = 'bg-[#4F7A5F]/10 border-[#4F7A5F]/25';

  if (normStatus === 'CRITICAL' || normStatus === 'DELAYED' || normStatus === 'SURGE' || normStatus === 'OCCUPIED' || normStatus === 'ERROR') {
    dotColor = 'bg-[#A14D45]';
    textColor = 'text-[#A14D45]';
    bgColor = 'bg-[#A14D45]/10 border-[#A14D45]/25';
  } else if (normStatus === 'WARNING' || normStatus === 'MODERATE' || normStatus === 'RESERVED' || normStatus === 'MEDIUM') {
    dotColor = 'bg-[#A16207]';
    textColor = 'text-[#A16207]';
    bgColor = 'bg-[#A16207]/10 border-[#A16207]/25';
  } else if (normStatus === 'INFO' || normStatus === 'PROTECTED' || normStatus === 'CONFIRMED' || normStatus === 'HIGH PRIORITY' || normStatus === 'PENDING') {
    dotColor = 'bg-[#243B80]';
    textColor = 'text-[#243B80]';
    bgColor = 'bg-[#243B80]/10 border-[#243B80]/25';
  } else if (normStatus === 'NORMAL' || normStatus === 'COMPLETED' || normStatus === 'OPTIMAL' || normStatus === 'APPROVED' || normStatus === 'AVAILABLE' || normStatus === 'ACTIVE' || normStatus === 'OPERATIONAL') {
    dotColor = 'bg-[#4F7A5F]';
    textColor = 'text-[#4F7A5F]';
    bgColor = 'bg-[#4F7A5F]/10 border-[#4F7A5F]/25';
  } else {
    dotColor = 'bg-[#8B95A5]';
    textColor = 'text-[#667085]';
    bgColor = 'bg-[#FBFBF8] border-subtle';
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border font-medium ${padding} ${bgColor} ${textColor} ${className}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor} flex-shrink-0`} />}
      <span className="whitespace-nowrap tracking-wide">{label || status}</span>
    </span>
  );
};
