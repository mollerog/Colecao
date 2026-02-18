
import React from 'react';

interface ToolbarProps {
  onOpenImport: () => void;
  onOpenExport: () => void;
  onClearAll: () => void;
  openBulk: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onClearAll, openBulk, onOpenImport, onOpenExport }) => {
  const btnBase = "px-6 py-2.5 rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.05] active:scale-[0.95] shadow-md";

  const downloadTemplate = () => {
    const templateData = [{
      'Grupo *': 'Coca-Cola',
      'Sigla *': 'TCCC',
      'Marca da Bebida *': 'Fanta',
      'Nome da Bebida': 'Fanta Uva',
      'Descrição da Lata': 'Edição Especial Halloween',
      'Ano de Lançamento': '2024',
      'Tamanho (ml) *': '350ml',
      'Descrição da Imagem *': 'fanta-uva-halloween-2024'
    }];
    const ws = (window as any).XLSX.utils.json_to_sheet(templateData);
    const wb = (window as any).XLSX.utils.book_new();
    (window as any).XLSX.utils.book_append_sheet(wb, ws, "Template");
    (window as any).XLSX.writeFile(wb, "template_colecao.xlsx");
  };

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
        onClick={downloadTemplate}
        className={`${btnBase} bg-orange-500 text-white`}
      >
        📄 Baixar Template
      </button>
      <button 
        onClick={openBulk}
        className={`${btnBase} bg-purple-600 text-white`}
      >
        📷 Upload de Fotos
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
