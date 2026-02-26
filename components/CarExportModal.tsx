
import React, { useState } from 'react';
import { CarMiniature } from '../types';

interface CarExportModalProps {
  allCars: CarMiniature[];
  selectedCars: CarMiniature[];
  onClose: () => void;
  onEnterSelectionMode?: () => void;
}

const CarExportModal: React.FC<CarExportModalProps> = ({ allCars, selectedCars, onClose, onEnterSelectionMode }) => {
  const [scope, setScope] = useState<'all' | 'selected'>(selectedCars.length > 0 ? 'selected' : 'all');
  const [isExporting, setIsExporting] = useState(false);

  const activeData = scope === 'all' ? allCars : selectedCars;

  const exportExcel = () => {
    const data = activeData.map(c => ({
      'Nome da Miniatura': c.minatureName,
      'Marca da Miniatura': c.miniatureBrand,
      'Linha': c.line,
      'Ano de Lançamento': c.year || '',
      'Escala': c.scale || '',
      'Estado de Conservação': c.condition || '',
      'Cor Predominante': c.mainColor || '',
      'Material': c.material || '',
      'Origem do Modelo': c.origin || '',
      'Marca do Carro Real': c.realCarBrand || '',
      'Modelo Real': c.realCarModel || '',
      'Segmento': c.segment || '',
      'Descrição da Imagem': c.imageDesc
    }));
    const ws = (window as any).XLSX.utils.json_to_sheet(data);
    const wb = (window as any).XLSX.utils.book_new();
    (window as any).XLSX.utils.book_append_sheet(wb, ws, "Garagem");
    (window as any).XLSX.writeFile(wb, `garagem_autos_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportPDF = () => {
    const { jsPDF } = (window as any).jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.text("Garagem de Miniaturas", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Exportado em: ${new Date().toLocaleDateString()} | Itens: ${activeData.length}`, 14, 28);

    const tableData = activeData.map(c => [
      c.miniatureBrand,
      c.minatureName,
      c.line,
      c.year || '-',
      c.scale || '-'
    ]);

    (doc as any).autoTable({
      startY: 35,
      head: [['Marca Min', 'Modelo Min', 'Linha', 'Ano', 'Escala']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 8 }
    });

    doc.save(`relatorio_garagem_${new Date().getTime()}.pdf`);
  };

  const exportZip = async () => {
    setIsExporting(true);
    try {
      const JSZip = (window as any).JSZip;
      const zip = new JSZip();

      // Excel info
      const data = activeData.map(c => ({
        'Nome': c.minatureName,
        'Marca': c.miniatureBrand,
        'ID Imagem': c.imageDesc
      }));
      const ws = (window as any).XLSX.utils.json_to_sheet(data);
      const wb = (window as any).XLSX.utils.book_new();
      (window as any).XLSX.utils.book_append_sheet(wb, ws, "Dados");
      const excelBuffer = (window as any).XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      zip.file("dados_garagem.xlsx", excelBuffer);

      // Photos
      const imgFolder = zip.folder("fotos");
      activeData.forEach(car => {
        if (car.photo && car.photo.includes('base64,')) {
          const base64Data = car.photo.split(',')[1];
          imgFolder.file(`${car.imageDesc || car.id}.jpg`, base64Data, { base64: true });
        }
      });

      const content = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `garagem_completa_fotos_${new Date().getTime()}.zip`;
      a.click();
    } catch (e) {
      alert("Erro ao gerar pacote ZIP.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in duration-300">
        <div className="p-4 sm:p-6 border-b flex justify-between items-center bg-indigo-600 text-white">
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">Exportar Garagem</h2>
            <p className="text-white/60 font-bold text-[10px] sm:text-xs uppercase tracking-widest mt-1">Gere relatórios e backups completos</p>
          </div>
          <button onClick={onClose} className="text-3xl font-thin text-white/40 hover:text-white transition-colors">×</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="space-y-3">
            <h4 className="text-[10px] sm:text-xs font-black text-slate-800 uppercase tracking-widest">O que exportar?</h4>
            <div className="flex gap-2 sm:gap-4">
               <button 
                onClick={() => setScope('all')}
                className={`flex-1 p-3 sm:p-4 rounded-2xl border-2 transition-all text-left ${scope === 'all' ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-100 hover:border-gray-200'}`}
               >
                 <p className="font-bold text-slate-700 leading-tight text-xs sm:text-base">Toda a Garagem</p>
                 <p className="text-[9px] sm:text-xs text-slate-400 font-bold">{allCars.length} itens</p>
               </button>
               <button 
                onClick={onEnterSelectionMode}
                className={`flex-1 p-3 sm:p-4 rounded-2xl border-2 transition-all text-left ${scope === 'selected' ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-100 hover:border-gray-200'}`}
               >
                 <p className="font-bold text-slate-700 leading-tight text-xs sm:text-base">Escolher na Grade</p>
                 <p className="text-[9px] sm:text-xs text-slate-400 font-bold">Via Checkboxes</p>
               </button>
            </div>
            
            {selectedCars.length > 0 && (
              <button 
                onClick={() => setScope('selected')}
                className={`w-full p-3 rounded-2xl border-2 transition-all flex items-center justify-between ${scope === 'selected' ? 'border-green-500 bg-green-50/50' : 'border-gray-100'}`}
              >
                <span className="font-bold text-slate-700 text-xs sm:text-base">✓ Usar Seleção Atual</span>
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{selectedCars.length} ITENS</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] sm:text-xs font-black text-slate-800 uppercase tracking-widest">Escolha o Formato</h4>
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-4">
              <button onClick={exportExcel} className="bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:scale-[1.03] transition-all flex flex-col items-center gap-1 sm:gap-2 group">
                <div className="text-xl sm:text-2xl group-hover:scale-110">📊</div>
                <div className="text-center">
                  <p className="text-[8px] sm:text-[10px] font-black uppercase">Excel</p>
                  <p className="hidden sm:block text-[8px] text-gray-400 font-bold uppercase tracking-tighter">Planilha</p>
                </div>
              </button>
              <button onClick={exportPDF} className="bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:scale-[1.03] transition-all flex flex-col items-center gap-1 sm:gap-2 group">
                <div className="text-xl sm:text-2xl group-hover:scale-110">📄</div>
                <div className="text-center">
                  <p className="text-[8px] sm:text-[10px] font-black uppercase">PDF</p>
                  <p className="hidden sm:block text-[8px] text-gray-400 font-bold uppercase tracking-tighter">Catálogo</p>
                </div>
              </button>
              <button onClick={exportZip} disabled={isExporting} className="bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:scale-[1.03] transition-all flex flex-col items-center gap-1 sm:gap-2 group relative overflow-hidden">
                {isExporting && <div className="absolute inset-0 bg-indigo-600/10 animate-pulse"></div>}
                <div className="text-xl sm:text-2xl group-hover:scale-110">📦</div>
                <div className="text-center">
                  <p className="text-[8px] sm:text-[10px] font-black uppercase">ZIP</p>
                  <p className="hidden sm:block text-[8px] text-gray-400 font-bold uppercase tracking-tighter">Backup</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-4 bg-gray-50 flex justify-center">
          <button onClick={onClose} className="text-[9px] font-black text-gray-400 uppercase tracking-[2px] hover:text-indigo-600">Fechar Janela</button>
        </div>
      </div>
    </div>
  );
};

export default CarExportModal;
