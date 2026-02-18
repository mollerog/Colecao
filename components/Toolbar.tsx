
import React from 'react';

interface ToolbarProps {
  onOpenImport: () => void;
  onOpenExport: () => void;
  onClearAll: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onClearAll, onOpenImport, onOpenExport }) => {
  const btnBase = "px-6 py-2.5 rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.05] active:scale-[0.95] shadow-md";

  return (
    <div className="flex flex-wrap gap-4 justify-center items-center">
      <button 
        onClick={onOpenImport}
        className={`${btnBase} bg-white text-indigo-600`}
      >
        📥 Importar Coleção
      </button>
      <button 
        onClick={onOpenExport}
        className={`${btnBase} bg-white text-indigo-600`}
      >
        📤 Exportar Coleção
      </button>
      <button 
        onClick={onClearAll}
        className={`${btnBase} bg-red-600 text-white`}
      >
        🗑️ Limpar Coleção
      </button>
    </div>
  );
};

export default Toolbar;
