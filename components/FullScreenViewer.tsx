
import React, { useState, useEffect, useRef, useCallback } from 'react';

interface FullScreenViewerProps {
  imageUrl: string;
  onClose: () => void;
}

const FullScreenViewer: React.FC<FullScreenViewerProps> = ({ imageUrl, onClose }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imgWrapperRef = useRef<HTMLDivElement>(null);

  // Gerenciamento de Scroll Lock e Eventos Nativos
  useEffect(() => {
    // 1. Bloqueia o scroll da página de fundo
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    // 2. Listener nativo para o Wheel (necessário para preventDefault funcionar no Chrome/Safari)
    const handleNativeWheel = (e: WheelEvent) => {
      // Previne que a página role
      e.preventDefault();
      
      const delta = -e.deltaY;
      const zoomSpeed = 0.0025;
      
      setScale(prevScale => {
        const newScale = prevScale + delta * zoomSpeed;
        return Math.min(Math.max(newScale, 1), 5);
      });
    };

    // 3. Atalho ESC para fechar
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleNativeWheel, { passive: false });
    }
    window.addEventListener('keydown', handleEsc);

    return () => {
      // Cleanup: restaura scroll e remove listeners
      document.body.style.overflow = originalStyle;
      if (container) {
        container.removeEventListener('wheel', handleNativeWheel);
      }
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  // Handler para clique duplo ou botão de toggle (Zoom Rápido)
  const handleZoomToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (scale > 1) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    } else {
      setScale(2.5);
    }
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  const getCursor = () => {
    if (scale <= 1) return 'cursor-zoom-in';
    return isDragging ? 'cursor-grabbing' : 'cursor-grab';
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[300] bg-slate-950/98 backdrop-blur-3xl flex flex-col items-center justify-center overflow-hidden transition-all duration-500 animate-in fade-in"
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {/* HUD Superior */}
      <div className="absolute top-0 left-0 w-full p-6 sm:p-10 flex justify-between items-start z-[320] pointer-events-none">
        <div className="flex flex-col gap-3">
          <div className="bg-white/10 backdrop-blur-2xl border border-white/20 px-6 py-2.5 rounded-full flex items-center gap-4 pointer-events-auto shadow-2xl">
            <div className="relative flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping absolute"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 relative"></span>
            </div>
            <div className="flex items-center gap-3 divide-x divide-white/10">
              <span className="text-[11px] font-black text-white uppercase tracking-[4px]">Inspeção HD</span>
              <span className="pl-3 text-[11px] font-black text-emerald-400 font-mono tracking-widest">
                {Math.round(scale * 100)}%
              </span>
            </div>
          </div>
          
          <div className={`ml-4 transition-all duration-500 ${scale > 1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
             <p className="text-white/40 text-[9px] font-black uppercase tracking-[2px] flex items-center gap-2">
               <span className="text-lg">🖱️</span> Role para Zoom • Arraste para mover
             </p>
          </div>
        </div>

        <div className="flex items-center gap-4 pointer-events-auto">
          <button 
            onClick={handleZoomToggle}
            className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all shadow-2xl ${scale > 1 ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}
          >
            <span className="text-2xl font-light">{scale > 1 ? '−' : '+'}</span>
          </button>
          <button 
            onClick={onClose}
            className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 text-4xl font-thin transition-all hover:bg-red-500 hover:text-white hover:rotate-90 shadow-2xl"
          >
            ×
          </button>
        </div>
      </div>

      {/* Container de Imagem */}
      <div 
        className={`relative w-full h-full flex items-center justify-center transition-all duration-500 ${getCursor()}`}
        onClick={scale === 1 ? handleZoomToggle : undefined}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
      >
        <div
          ref={imgWrapperRef}
          className="transition-transform duration-300 ease-out will-change-transform"
          style={{ 
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})` 
          }}
        >
          <img 
            src={imageUrl} 
            draggable={false}
            className={`rounded-lg shadow-[0_20px_80px_rgba(0,0,0,0.5)] max-w-[85vw] max-h-[80vh] object-contain ${isDragging ? 'select-none' : ''}`}
            alt="Visualização HD"
          />
        </div>
      </div>

      <div className="absolute bottom-10 flex flex-col items-center gap-2 pointer-events-none opacity-20">
        <p className="text-white text-[9px] font-black uppercase tracking-[8px]">Precision Graphics Engine</p>
      </div>
    </div>
  );
};

export default FullScreenViewer;
