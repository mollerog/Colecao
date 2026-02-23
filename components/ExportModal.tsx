
import React, { useState } from 'react';
import { Can } from '../types';

interface ExportModalProps {
  allCans: Can[];
  selectedCans: Can[];
  onClose: () => void;
  onEnterSelectionMode?: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ allCans, selectedCans, onClose, onEnterSelectionMode }) => {
  const [scope, setScope] = useState<'all' | 'selected'>(selectedCans.length > 0 ? 'selected' : 'all');
  const [isExporting, setIsExporting] = useState(false);

  const activeData = scope === 'all' ? allCans : selectedCans;

  const exportExcel = () => {
    const exportData = activeData.map(c => ({
      'Grupo *': c.group || '',
      'Sigla *': c.acronym || '',
      'Marca da Bebida *': c.brand || '',
      'Nome da Bebida': c.name || '',
      'Descrição da Lata': c.description || '',
      'Ano de Lançamento': c.year || '',
      'Tamanho (ml) *': c.size || '',
      'Descrição da Imagem *': c.imageDesc || ''
    }));

    const ws = (window as any).XLSX.utils.json_to_sheet(exportData);
    const wb = (window as any).XLSX.utils.book_new();
    (window as any).XLSX.utils.book_append_sheet(wb, ws, "Coleção");
    (window as any).XLSX.writeFile(wb, `colecao_latas_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportPDF = () => {
    const { jsPDF } = (window as any).jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.text("Minha Coleção de Latas", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Exportado em: ${new Date().toLocaleDateString()} | Total: ${activeData.length} latas`, 14, 28);

    const tableData = activeData.map(c => [
      c.group,
      c.brand,
      c.name || '-',
      c.year || '-',
      c.size || '-'
    ]);

    (doc as any).autoTable({
      startY: 35,
      head: [['Grupo', 'Marca', 'Nome', 'Ano', 'Tam.']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241] },
      styles: { fontSize: 8 }
    });

    doc.save(`relatorio_colecao_${new Date().getTime()}.pdf`);
  };

  const exportZip = async () => {
    setIsExporting(true);
    try {
      const JSZip = (window as any).JSZip;
      const zip = new JSZip();

      // Excel info
      const exportData = activeData.map(c => ({
        'Grupo *': c.group || '',
        'Sigla *': c.acronym || '',
        'Marca da Bebida *': c.brand || '',
        'Nome da Bebida': c.name || '',
        'Descrição da Lata': c.description || '',
        'Ano de Lançamento': c.year || '',
        'Tamanho (ml) *': c.size || '',
        'Descrição da Imagem *': c.imageDesc || ''
      }));
      const ws = (window as any).XLSX.utils.json_to_sheet(exportData);
      const wb = (window as any).XLSX.utils.book_new();
      (window as any).XLSX.utils.book_append_sheet(wb, ws, "Dados");
      const excelBuffer = (window as any).XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      zip.file("dados_colecao.xlsx", excelBuffer);

      // Photos
      const imgFolder = zip.folder("fotos");
      activeData.forEach(can => {
        if (can.photo && can.photo.includes('base64,')) {
          const base64Data = can.photo.split(',')[1];
          imgFolder.file(`${can.imageDesc || can.id}.jpg`, base64Data, { base64: true });
        }
      });

      const content = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `colecao_completa_fotos_${new Date().getTime()}.zip`;
      a.click();
    } catch (e) {
      alert("Erro ao gerar pacote ZIP.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in duration-300 overflow-hidden">
        <div className="p-6 sm:p-10 border-b flex justify-between items-center bg-indigo-600 text-white">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Exportar Dados</h2>
            <p className="text-white/60 font-bold text-[10px] sm:text-xs uppercase tracking-widest mt-1">Escolha o formato e o alcance</p>
          </div>
          <button onClick={onClose} className="text-3xl font-thin text-white/40 hover:text-white transition-colors">×</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6 sm:space-y-10">
          {/* Scope Select */}
          <div className="space-y-4">
            <h4 className="text-[10px] sm:text-sm font-black text-slate-800 uppercase tracking-widest">O que exportar?</h4>
            <div className="flex gap-3 sm:gap-4">
               <button 
                onClick={() => setScope('all')}
                className={`flex-1 p-4 sm:p-5 rounded-2xl border-2 transition-all text-left ${scope === 'all' ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-100 hover:border-gray-200'}`}
               >
                 <p className="font-bold text-slate-700 text-sm sm:text-base">Toda a Coleção</p>
                 <p className="text-[10px] sm:text-xs text-slate-400">{allCans.length} itens detectados</p>
               </button>
               <button 
                onClick={onEnterSelectionMode}
                className={`flex-1 p-4 sm:p-5 rounded-2xl border-2 transition-all text-left ${scope === 'selected' ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-100 hover:border-gray-200'}`}
               >
                 <p className="font-bold text-slate-700 text-sm sm:text-base">Escolher na Grade</p>
                 <p className="text-[10px] sm:text-xs text-slate-400">Ativar checkboxes</p>
               </button>
            </div>
            
            {selectedCans.length > 0 && (
              <button 
                onClick={() => setScope('selected')}
                className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${scope === 'selected' ? 'border-green-500 bg-green-50/50' : 'border-gray-100'}`}
              >
                <span className="font-bold text-slate-700">✓ Usar Seleção Atual</span>
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-black">{selectedCans.length} ITENS</span>
              </button>
            )}
          </div>

          {/* Formats */}
          <div className="space-y-4">
            <h4 className="text-[10px] sm:text-sm font-black text-slate-800 uppercase tracking-widest">Escolha o Formato</h4>
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-3 sm:gap-4">
              <button 
                onClick={exportExcel}
                className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:scale-[1.03] transition-all flex flex-col items-center gap-2 sm:gap-3 group"
              >
                <div className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform">📊</div>
                <div className="text-center">
                  <p className="text-[9px] sm:text-[11px] font-black text-slate-800 uppercase">Excel</p>
                  <p className="hidden sm:block text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Planilha Editável</p>
                </div>
              </button>

              <button 
                onClick={exportPDF}
                className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:scale-[1.03] transition-all flex flex-col items-center gap-2 sm:gap-3 group"
              >
                <div className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform">📄</div>
                <div className="text-center">
                  <p className="text-[9px] sm:text-[11px] font-black text-slate-800 uppercase">PDF</p>
                  <p className="hidden sm:block text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Relatório Prático</p>
                </div>
              </button>

              <button 
                onClick={exportZip}
                disabled={isExporting}
                className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:scale-[1.03] transition-all flex flex-col items-center gap-2 sm:gap-3 group overflow-hidden relative"
              >
                {isExporting && (
                  <div className="absolute inset-0 bg-indigo-600/10 animate-pulse"></div>
                )}
                <div className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform">📦</div>
                <div className="text-center">
                  <p className="text-[9px] sm:text-[11px] font-black text-slate-800 uppercase">ZIP</p>
                  <p className="hidden sm:block text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Dados Completo</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 bg-gray-50 flex justify-center">
          <button onClick={onClose} className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] hover:text-indigo-600 transition-colors">Fechar Janela</button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
