
import React from 'react';

interface ToolbarProps {
  onOpenImport: () => void;
  onOpenExport: () => void;
  onClearAll: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onClearAll, onOpenImport, onOpenExport }) => {
  const btnBase = "px-3 sm:px-6 py-2.5 rounded-xl text-[10px] sm:text-[12px] font-bold flex items-center justify-center gap-1 sm:gap-2 transition-all hover:scale-[1.05] active:scale-[0.95] shadow-md whitespace-nowrap";

  return (
    <div className="flex flex-row justify-between sm:justify-center items-center gap-2 sm:gap-4 w-full">
      <button 
        onClick={onOpenImport}
        className={`${btnBase} bg-white text-indigo-600 flex-1 sm:flex-none`}
      >
        📥 <span className="hidden sm:inline">Importar</span><span className="sm:hidden">Imp.</span>
      </button>
      <button 
        onClick={onOpenExport}
        className={`${btnBase} bg-white text-indigo-600 flex-1 sm:flex-none`}
      >
        📤 <span className="hidden sm:inline">Exportar</span><span className="sm:hidden">Exp.</span>
      </button>
      <button 
        onClick={onClearAll}
        className={`${btnBase} bg-red-600 text-white flex-1 sm:flex-none hidden sm:flex`}
      >
        🗑️ <span className="hidden sm:inline">Limpar</span><span className="sm:hidden">Limpar</span>
      </button>
    </div>
  );
};

export default Toolbar;
