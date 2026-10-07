import React from 'react';
import timacaLogoImg from '../assets/timaca-logo.png';

interface TimacaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  showRif?: boolean;
}

export const TimacaLogo: React.FC<TimacaLogoProps> = ({
  className = '',
  size = 'md',
}) => {
  const logoHeight = {
    sm: 'h-8 sm:h-9',
    md: 'h-9 sm:h-10',
    lg: 'h-12 sm:h-14'
  };

  return (
    <div 
      className={`flex items-center gap-2.5 select-none ${className}`}
      title="TALLER INDUSTRIAL METALÚRGICO ANTONIO, C.A. · RIF: J-09500315-9"
    >
      <img
        src={timacaLogoImg}
        alt="TIMACA"
        className={`${logoHeight[size]} w-auto object-contain drop-shadow-xs`}
      />
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5 leading-none">
          <span className="font-heading font-black text-sm sm:text-base tracking-tight text-slate-900">
            Núcleo <span className="text-blue-700">· Costos</span>
          </span>
          <span className="text-[9px] font-mono font-bold bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded border border-blue-300">
            CST
          </span>
          <span className="text-[9px] font-mono font-bold bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded border border-amber-300 hidden sm:inline-block">
            2026
          </span>
        </div>
        <span className="text-[10px] font-sans text-slate-500 font-medium tracking-tight mt-0.5">
          Control de Gestión & Auditoría · Modelo Estrella
        </span>
      </div>
    </div>
  );
};
