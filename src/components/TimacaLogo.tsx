import React from 'react';
import timacaLogoImg from '../assets/timaca-logo.png';

interface TimacaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  showRif?: boolean;
  variant?: 'light' | 'dark';
  titulo?: string;
  subtitulo?: string;
  badge?: string;
}

export const TimacaLogo: React.FC<TimacaLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
  showRif = false,
  variant = 'light',
  titulo,
  subtitulo,
  badge
}) => {
  const logoHeight = {
    sm: 'h-8 sm:h-9',
    md: 'h-9 sm:h-10',
    lg: 'h-11 sm:h-13'
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
          size === 'sm' ? 'h-7' : size === 'lg' ? 'h-11' : 'h-9'
        } ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} 
      />

      {/* Bloque de Identidad Oficial: SIGMA TIMACA */}
      <div className="flex flex-col text-left justify-center min-w-0">
        <div className="flex items-center gap-2 leading-none flex-wrap">
          <span className={`font-heading font-black tracking-tight ${
            size === 'sm' ? 'text-sm sm:text-base' : size === 'lg' ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
          } ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {titulo ? (
              <span>{titulo}</span>
            ) : (
              <>
                <span className="text-[#020C54] tracking-tight">SIGMA</span>
                <span className="text-blue-600 font-extrabold ml-1.5">TIMACA</span>
              </>
            )}
          </span>
          <span className="text-xs font-mono font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded border border-blue-300">
            {badge || 'SIGMA 2026'}
          </span>
        </div>
        <span className={`text-xs font-sans font-medium tracking-tight mt-1 truncate ${
          isDark ? 'text-slate-300' : 'text-slate-600'
        }`}>
          {subtitulo || 'Sistema Integrado de Gestión de Materiales y Activos'}
        </span>
        {showRif && (
          <span className="text-xs font-mono text-slate-400 mt-0.5">
            RIF: J-09500315-9
          </span>
        )}
      </div>
    </div>
  );
};
