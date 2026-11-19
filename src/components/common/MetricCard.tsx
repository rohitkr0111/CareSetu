import React from 'react';
import {
  Bed,
  Stethoscope,
  Users,
  Activity,
  Calendar,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Shield,
  Clock,
  Brain,
} from 'lucide-react';
import { MetricCardData } from '../../types';

interface MetricCardProps {
  data: MetricCardData;
  onClick?: () => void;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ data, onClick, className = '' }) => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'Bed':
        return <Bed className="w-4 h-4 text-[#243B80]" />;
      case 'Stethoscope':
        return <Stethoscope className="w-4 h-4 text-[#243B80]" />;
      case 'Users':
        return <Users className="w-4 h-4 text-[#243B80]" />;
      case 'Activity':
        return <Activity className="w-4 h-4 text-[#243B80]" />;
      case 'Calendar':
        return <Calendar className="w-4 h-4 text-[#243B80]" />;
      case 'AlertTriangle':
        return <AlertTriangle className="w-4 h-4 text-[#A14D45]" />;
      case 'Shield':
        return <Shield className="w-4 h-4 text-[#243B80]" />;
      case 'Brain':
        return <Brain className="w-4 h-4 text-[#243B80]" />;
      default:
        return <Clock className="w-4 h-4 text-[#243B80]" />;
    }
  };

  const isCritical = data.status === 'CRITICAL';
  const isWarning = data.status === 'WARNING';

  let borderStyle = 'border-transparent hover:border-[#C9CED8]/70';
  let subColor = 'text-[#667085]';
  let iconSurface = 'bg-[#FBFBF8] border-[#D9DDE5]';

  if (isCritical) {
    borderStyle = 'border-transparent border-l-2 border-l-[#A14D45] hover:border-[#A14D45]/35';
    subColor = 'text-[#A14D45]';
    iconSurface = 'bg-[#A14D45]/10 border-[#A14D45]/20';
  } else if (isWarning) {
    borderStyle = 'border-transparent border-l-2 border-l-[#A16207] hover:border-[#A16207]/35';
    subColor = 'text-[#A16207]';
    iconSurface = 'bg-[#A16207]/10 border-[#A16207]/20';
  }

  return (
    <div
      id={`metric-card-${data.id}`}
      onClick={onClick}
      className={`metric-cell min-h-32 p-4 lg:p-5 transition-subtle flex flex-col justify-between cursor-pointer group ${borderStyle} ${className}`}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <p className="text-[10px] text-[#8B95A5] uppercase tracking-[0.16em] font-semibold leading-snug">
            {data.title}
          </p>
          <div className={`w-8 h-8 rounded-md border flex items-center justify-center group-hover:scale-105 transition-subtle ${iconSurface}`}>
            {getIcon(data.iconName)}
          </div>
        </div>

        <div className="flex items-end gap-2">
          <span className={`text-3xl lg:text-[2.15rem] leading-none font-semibold ${isCritical ? 'text-[#A14D45]' : 'text-[#1C1C1E]'}`}>
            {data.value}
          </span>
          {data.subvalue && (
            <span className="text-xs text-[#8B95A5] pb-0.5">
              {data.subvalue.startsWith('/') ? data.subvalue : ''}
            </span>
          )}
        </div>

        {data.trend && (
          <p className={`text-[10px] mt-2 ${subColor} font-sans font-semibold tracking-wide`}>
            {data.trend}
          </p>
        )}
      </div>
    </div>
  );
};
