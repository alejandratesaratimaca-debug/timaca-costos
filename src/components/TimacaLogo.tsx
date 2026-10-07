import React from 'react';
import timacaLogoImg from '../assets/timaca-logo.png';

interface TimacaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  showRif?: boolean;
  variant?: 'light' | 'dark';
}

export const TimacaLogo: React.FC<TimacaLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
  showRif = false,
  variant = 'light',
}) => {
  const logoHeight = {
    sm: 'h-7 sm:h-8',
    md: 'h-8 sm:h-9',
    lg: 'h-10 sm:h-12'
  };

  const isDark = variant === 'dark';

  // Si no requiere subtítulo ni texto, renderizamos solo la imagen oficial del logo
  if (!showSubtitle) {
    return (
      <div 
        className={`inline-flex items-center select-none ${className}`}
        title="TALLER INDUSTRIAL METALÚRGICO ANTONIO, C.A. · RIF: J-09500315-9"
      >
        <img
          src={timacaLogoImg}
          alt="TIMACA"
          className={`${logoHeight[size]} w-auto object-contain drop-shadow-xs`}
        />
      </div>
    );
  }

  return (
    <div 
      className={`inline-flex items-center gap-3 select-none ${className}`}
      title="TALLER INDUSTRIAL METALÚRGICO ANTONIO, C.A. · RIF: J-09500315-9"
    >
      {/* Logotipo Oficial TIMACA */}
      <img
        src={timacaLogoImg}
        alt="TIMACA"
        className={`${logoHeight[size]} w-auto object-contain shrink-0 drop-shadow-xs`}
      />

      {/* Separador Vertical Elegante */}
      <div 
        className={`w-px shrink-0 ${
          size === 'sm' ? 'h-6' : size === 'lg' ? 'h-10' : 'h-8'
        } ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} 
      />

      {/* Bloque de Identidad: Control de Costos */}
      <div className="flex flex-col text-left justify-center min-w-0">
        <div className="flex items-center gap-1.5 leading-none flex-wrap">
          <span className={`font-heading font-black tracking-tight ${
            size === 'sm' ? 'text-xs sm:text-sm' : size === 'lg' ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
          } ${isDark ? 'text-white' : 'text-slate-900'}`}>
            CONTROL DE <span className="text-blue-600">COSTOS</span>
          </span>
          <span className="text-[9px] font-mono font-bold bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded border border-blue-300">
            CST
          </span>
          <span className="text-[9px] font-mono font-bold bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded border border-amber-300 hidden sm:inline-block">
            2026
          </span>
        </div>
        <span className={`text-[10px] font-sans font-medium tracking-tight mt-1 truncate ${
          isDark ? 'text-slate-300' : 'text-slate-500'
        }`}>
          Auditoría & Gestión de Proyectos · TIMACA
        </span>
        {showRif && (
          <span className="text-[9px] font-mono text-slate-400 mt-0.5">
            RIF: J-09500315-9
          </span>
        )}
      </div>
    </div>
  );
};
