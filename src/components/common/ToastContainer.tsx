import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useHospital();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-50 flex flex-col gap-2 max-w-[18rem] sm:max-w-sm w-[calc(100vw-1.5rem)] sm:w-full pointer-events-none">
      {toasts.map((toast) => {
        let border = 'border-[#D9DDE5]';
        let icon = <Info className="w-4 h-4 text-[#243B80] flex-shrink-0" />;

        if (toast.type === 'success') {
          border = 'border-[#4F7A5F]/40';
          icon = <CheckCircle2 className="w-4 h-4 text-[#4F7A5F] flex-shrink-0" />;
        } else if (toast.type === 'warning') {
          border = 'border-[#A16207]/40';
          icon = <AlertTriangle className="w-4 h-4 text-[#A16207] flex-shrink-0" />;
        } else if (toast.type === 'critical') {
          border = 'border-[#A14D45]/50';
          icon = <AlertTriangle className="w-4 h-4 text-[#A14D45] flex-shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className={`pointer-events-auto bg-white border ${border} rounded-xl p-3 sm:p-3.5 shadow-modal transition-subtle flex items-start gap-2.5 sm:gap-3`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h5 className="text-xs font-semibold text-[#1C1C1E] truncate">{toast.title}</h5>
                <span className="text-[10px] text-[#8B95A5] font-mono">{toast.timestamp}</span>
              </div>
              <p className="text-xs text-[#667085] mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-[#8B95A5] hover:text-[#1C1C1E] p-0.5 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
