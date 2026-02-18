
import React, { useState } from 'react';
import { CreditCard } from '../types';

interface CardExportModalProps {
  allCards: CreditCard[];
  selectedCards: CreditCard[];
  onClose: () => void;
  onEnterSelectionMode?: () => void;
}

const CardExportModal: React.FC<CardExportModalProps> = ({ allCards, selectedCards, onClose, onEnterSelectionMode }) => {
  const [scope, setScope] = useState<'all' | 'selected'>(selectedCards.length > 0 ? 'selected' : 'all');
  const [isExporting, setIsExporting] = useState(false);

  const activeData = scope === 'all' ? allCards : selectedCards;

  const exportExcel = () => {
    const data = activeData.map(c => ({
      'Nome do Cartão': c.cardName,
      'Banco / Emissor': c.issuer,
      'Bandeira': c.network,
      'Categoria': c.category,
      'Ano': c.year || '',
      'Final': c.lastFourDigits || '',
      'ID Imagem': c.imageDesc
    }));
    const ws = (window as any).XLSX.utils.json_to_sheet(data);
    const wb = (window as any).XLSX.utils.book_new();
    (window as any).XLSX.utils.book_append_sheet(wb, ws, "Cartões");
    (window as any).XLSX.writeFile(wb, `cartoes_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportPDF = () => {
    const { jsPDF } = (window as any).jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.text("Minha Coleção de Cartões", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Exportado em: ${new Date().toLocaleDateString()} | Total: ${activeData.length} cartões`, 14, 28);

    const tableData = activeData.map(c => [
      c.issuer,
      c.cardName,
      c.network,
      c.category,
      c.year || '-'
    ]);

    (doc as any).autoTable({
      startY: 35,
      head: [['Banco', 'Nome', 'Rede', 'Cat', 'Ano']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241] },
      styles: { fontSize: 8 }
    });

    doc.save(`cartoes_${new Date().getTime()}.pdf`);
  };

  const exportZip = async () => {
    setIsExporting(true);
    try {
      const JSZip = (window as any).JSZip;
      const zip = new JSZip();

      // Excel info
      const data = activeData.map(c => ({
        'Nome do Cartão': c.cardName,
        'Banco / Emissor': c.issuer,
        'Bandeira': c.network,
        'Categoria': c.category,
        'Ano': c.year || '',
        'Final': c.lastFourDigits || '',
        'ID Imagem': c.imageDesc
      }));
      const ws = (window as any).XLSX.utils.json_to_sheet(data);
      const wb = (window as any).XLSX.utils.book_new();
      (window as any).XLSX.utils.book_append_sheet(wb, ws, "Dados");
      const excelBuffer = (window as any).XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      zip.file("dados_cartoes.xlsx", excelBuffer);

      // Photos
      const imgFolder = zip.folder("fotos");
      activeData.forEach(card => {
        if (card.photo && card.photo.includes('base64,')) {
          const base64Data = card.photo.split(',')[1];
          imgFolder.file(`${card.imageDesc || card.id}.jpg`, base64Data, { base64: true });
        }
      });

      const content = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `colecao_completa_cartoes_${new Date().getTime()}.zip`;
      a.click();
    } catch (e) {
      alert("Erro ao gerar pacote ZIP.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300">
        <div className="p-10 border-b flex justify-between items-center bg-indigo-600 text-white">
          <div>
            <h2 className="text-3xl font-black tracking-tight">Exportar Cartões</h2>
            <p className="text-white/60 font-bold text-xs uppercase tracking-widest mt-1">Escolha o formato e o alcance</p>
          </div>
          <button onClick={onClose} className="text-3xl font-thin text-white/40 hover:text-white transition-colors">×</button>
        </div>

        <div className="p-10 space-y-10">
          <div className="space-y-4">
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">O que exportar?</h4>
            <div className="flex gap-4">
               <button 
                onClick={() => setScope('all')}
                className={`flex-1 p-5 rounded-2xl border-2 transition-all text-left ${scope === 'all' ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-100 hover:border-gray-200'}`}
               >
                 <p className="font-bold text-slate-700">Toda a Coleção</p>
                 <p className="text-xs text-slate-400">{allCards.length} itens detectados</p>
               </button>
               <button 
                onClick={onEnterSelectionMode}
                className={`flex-1 p-5 rounded-2xl border-2 transition-all text-left ${scope === 'selected' ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-100 hover:border-gray-200'}`}
               >
                 <p className="font-bold text-slate-700">Escolher na Grade</p>
                 <p className="text-xs text-slate-400">Ativar checkboxes nos cards</p>
               </button>
            </div>
            
            {selectedCards.length > 0 && (
              <button 
                onClick={() => setScope('selected')}
                className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${scope === 'selected' ? 'border-green-500 bg-green-50/50' : 'border-gray-100'}`}
              >
                <span className="font-bold text-slate-700">✓ Usar Seleção Atual</span>
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-black">{selectedCards.length} ITENS</span>
              </button>
            )}
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Escolha o Formato</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button onClick={exportExcel} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:scale-[1.03] transition-all flex flex-col items-center gap-3 group">
                <div className="text-3xl group-hover:scale-110">📊</div>
                <div className="text-center">
                  <p className="text-[11px] font-black uppercase">Excel</p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Planilha</p>
                </div>
              </button>
              <button onClick={exportPDF} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:scale-[1.03] transition-all flex flex-col items-center gap-3 group">
                <div className="text-3xl group-hover:scale-110">📄</div>
                <div className="text-center">
                  <p className="text-[11px] font-black uppercase">PDF</p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Relatório</p>
                </div>
              </button>
              <button onClick={exportZip} disabled={isExporting} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:scale-[1.03] transition-all flex flex-col items-center gap-3 group relative overflow-hidden">
                {isExporting && <div className="absolute inset-0 bg-indigo-600/10 animate-pulse"></div>}
                <div className="text-3xl group-hover:scale-110">📦</div>
                <div className="text-center">
                  <p className="text-[11px] font-black uppercase">ZIP + Fotos</p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Coleção Full</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 bg-gray-50 flex justify-center">
          <button onClick={onClose} className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] hover:text-indigo-600">Fechar Janela</button>
        </div>
      </div>
    </div>
  );
};

export default CardExportModal;
