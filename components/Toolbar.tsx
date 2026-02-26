
import React from 'react';

interface ToolbarProps {
  onOpenImport: () => void;
  onOpenExport: () => void;
  onClearAll: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onClearAll, onOpenImport, onOpenExport }) => {
  const btnBase = "px-2 sm:px-8 py-2 sm:py-2.5 rounded-[24px] text-[9px] sm:text-[12px] font-black uppercase tracking-wider flex items-center justify-center gap-1 sm:gap-2 transition-all hover:scale-[1.05] active:scale-[0.95] shadow-lg whitespace-nowrap";

  return (
    <div className="flex flex-row justify-center items-center gap-2 sm:gap-6 w-full">
      <button 
        onClick={onOpenImport}
        className={`${btnBase} bg-white text-indigo-600`}
      >
        <span className="text-xs sm:text-sm">📥</span> Importar
      </button>
      <button 
        onClick={onOpenExport}
        className={`${btnBase} bg-white text-indigo-600`}
      >
        <span className="text-xs sm:text-sm">📤</span> Exportar
      </button>
      <button 
        onClick={onClearAll}
        className={`${btnBase} bg-[#E11D48] text-white`}
      >
        <span className="text-xs sm:text-sm">🗑️</span> Limpar
      </button>
    </div>
  );
};

export default Toolbar;
