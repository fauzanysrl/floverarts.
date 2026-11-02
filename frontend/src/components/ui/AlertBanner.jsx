import React from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

const VARIANTS = {
  error: {
    container: 'bg-semantic-errorBg border-red-200 text-semantic-error',
    icon: <AlertCircle size={18} className="shrink-0" />,
    role: 'alert',
  },
  success: {
    container: 'bg-semantic-successBg border-emerald-200 text-semantic-success',
    icon: <CheckCircle2 size={18} className="shrink-0" />,
    role: 'status',
  },
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-700',
    icon: <Info size={18} className="shrink-0" />,
    role: 'status',
  },
};

export function AlertBanner({ type = 'error', title, message, className = '', id }) {
  const config = VARIANTS[type] || VARIANTS.error;

  return (
    <div
      id={id}
      role={config.role}
      className={`w-full flex items-start gap-3 p-3.5 rounded-sm border text-xs leading-relaxed transition-[opacity,transform] duration-base ease-out ${config.container} ${className}`}
    >
      {config.icon}
      <div className="flex flex-col">
        {title && <strong className="font-semibold">{title}</strong>}
        {message && <span>{message}</span>}
      </div>
    </div>
  );
}

export default AlertBanner;
