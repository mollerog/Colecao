
import React, { useState } from 'react';
import { Firestore, collection, doc, writeBatch, serverTimestamp, getDocs } from 'firebase/firestore';

interface CardImportModalProps {
  db: Firestore;
  user: any;
  onClose: () => void;
  currentCount: number;
  onOpenBulk: () => void;
}

const CardImportModal: React.FC<CardImportModalProps> = ({ db, user, onClose, currentCount, onOpenBulk }) => {
  const [fileData, setFileData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [strategy, setStrategy] = useState<'merge' | 'replace'>('merge');

  const downloadTemplate = () => {
    const templateData = [{
      'Nome do Cartão *': 'Nubank Ultravioleta',
      'Banco / Emissor *': 'Nubank',
      'Bandeira *': 'Mastercard',
      'Categoria *': 'Black',
      'Ano de Lançamento': '2021',
      'Últimos 4 Dígitos': '1234',
      'Descrição da Imagem *': 'nubank-uv-front'
    }];
    const ws = (window as any).XLSX.utils.json_to_sheet(templateData);
    const wb = (window as any).XLSX.utils.book_new();
    (window as any).XLSX.utils.book_append_sheet(wb, ws, "Template");
    (window as any).XLSX.writeFile(wb, "template_cartoes.xlsx");
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as any);
        const workbook = (window as any).XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = (window as any).XLSX.utils.sheet_to_json(sheet);
        
        const normalized = rows.map((row: any) => {
          const getVal = (r: any, variations: string[]) => {
            const rowKeys = Object.keys(r);
            const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
            const normalizedVariations = variations.map(normalize);
            const foundKey = rowKeys.find(k => normalizedVariations.includes(normalize(k)));
            return foundKey ? String(r[foundKey] || '').trim() : '';
          };

          return {
            cardName: getVal(row, ['Nome do Cartão *', 'Nome', 'Cartão', 'Card Name']),
            issuer: getVal(row, ['Banco / Emissor *', 'Banco', 'Emissor', 'Issuer', 'Bank']),
            network: getVal(row, ['Bandeira *', 'Bandeira', 'Rede', 'Network']),
            category: getVal(row, ['Categoria *', 'Categoria', 'Category']),
            year: getVal(row, ['Ano de Lançamento', 'Ano', 'Year']),
            lastFourDigits: getVal(row, ['Últimos 4 Dígitos', 'Dígitos', 'Final']),
            imageDesc: getVal(row, ['Descrição da Imagem *', 'Desc Imagem', 'ID Imagem']),
          };
        });

        setFileData(normalized);
      } catch (err) {
        alert("Erro ao ler arquivo Excel.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = async () => {
    if (fileData.length === 0) return;
    setIsProcessing(true);

    try {
      const cardsRef = collection(db, 'users', user.uid, 'cards');

      if (strategy === 'replace') {
        const snapshot = await getDocs(cardsRef);
        const deleteBatch = writeBatch(db);
        snapshot.docs.forEach(d => deleteBatch.delete(d.ref));
        await deleteBatch.commit();
      }

      const CHUNK_SIZE = 400;
      for (let i = 0; i < fileData.length; i += CHUNK_SIZE) {
        const chunk = fileData.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);
        chunk.forEach(row => {
          const newDoc = doc(cardsRef);
          batch.set(newDoc, {
            ...row,
            photo: '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        });
        await batch.commit();
      }

      alert('Importação concluída!');
      onClose();
    } catch (e) {
      alert("Erro ao importar dados.");
    } finally {
      setIsProcessing(false);
    }
  };

  const cardBaseClass = "group relative bg-white p-8 rounded-[32px] border-2 border-slate-100 hover:border-indigo-500 shadow-sm transition-all text-left flex flex-col items-center text-center gap-6 h-full min-h-[280px] justify-center";

  return (
    <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-6xl rounded-[40px] shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in duration-300">
        <div className="p-6 sm:p-10 border-b flex justify-between items-center bg-indigo-600 text-white rounded-t-[40px]">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Hub de Importação</h2>
            <p className="text-white/60 font-bold text-[10px] sm:text-xs uppercase tracking-widest mt-1">Gerencie a entrada de novos cartões</p>
          </div>
          <button onClick={onClose} className="text-3xl font-thin text-white/40 hover:text-white transition-colors">×</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6 sm:space-y-10 bg-gray-50/50">
          {fileData.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <button onClick={onOpenBulk} className="group relative bg-white p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] border-2 border-slate-100 hover:border-indigo-500 shadow-sm transition-all text-left flex flex-col items-center text-center gap-4 sm:gap-6 h-full min-h-[200px] sm:min-h-[280px] justify-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-50 rounded-2xl sm:rounded-3xl flex items-center justify-center text-3xl sm:text-4xl group-hover:scale-110 transition-transform shadow-sm">📷</div>
                <div className="flex-1">
                  <h4 className="text-lg sm:text-xl font-black text-slate-800 mb-1 sm:mb-2">Vincular Fotos</h4>
                  <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed px-2">Vincule fotos aos cartões existentes usando o campo 'Desc Imagem'.</p>
                </div>
              </button>

              <div className="group relative bg-white p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] border-2 border-slate-100 hover:border-indigo-500 shadow-sm transition-all text-left flex flex-col items-center text-center gap-4 sm:gap-6 h-full min-h-[200px] sm:min-h-[280px] justify-center cursor-pointer">
                <input type="file" accept=".xlsx,.xls,.csv" className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={handleFile} />
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-50 rounded-2xl sm:rounded-3xl flex items-center justify-center text-3xl sm:text-4xl group-hover:scale-110 transition-transform shadow-sm">📊</div>
                <div className="flex-1">
                  <h4 className="text-lg sm:text-xl font-black text-slate-800 mb-1 sm:mb-2">Importar Planilha</h4>
                  <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed px-2">Carregue sua base de dados de cartões via arquivo Excel ou CSV.</p>
                </div>
              </div>

              <button onClick={downloadTemplate} className="group relative bg-white p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] border-2 border-slate-100 hover:border-indigo-500 shadow-sm transition-all text-left flex flex-col items-center text-center gap-4 sm:gap-6 h-full min-h-[200px] sm:min-h-[280px] justify-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-50 rounded-2xl sm:rounded-3xl flex items-center justify-center text-3xl sm:text-4xl group-hover:scale-110 transition-transform shadow-sm">📄</div>
                <div className="flex-1">
                  <h4 className="text-lg sm:text-xl font-black text-slate-800 mb-1 sm:mb-2">Baixar Modelo</h4>
                  <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed px-2">Obtenha o modelo de planilha oficial para preencher sua coleção.</p>
                </div>
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 text-center">
                  <p className="text-2xl sm:text-3xl font-black text-indigo-600 leading-none mb-1 sm:mb-2">{fileData.length}</p>
                  <p className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Detectado</p>
                </div>
                <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 text-center">
                  <p className="text-2xl sm:text-3xl font-black text-green-500 leading-none mb-1 sm:mb-2">{fileData.length} Válidos</p>
                  <p className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">Preparados</p>
                </div>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] shadow-sm border border-gray-100 space-y-4">
                <h4 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-widest">Escolha a Estratégia</h4>
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  <button 
                    onClick={() => setStrategy('merge')}
                    className={`flex-1 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all text-left flex items-start gap-3 sm:gap-4 ${strategy === 'merge' ? 'border-indigo-500 bg-indigo-50/50 shadow-md' : 'border-gray-100 hover:border-gray-200'}`}
                  >
                    <div className="text-xl sm:text-2xl mt-1">➕</div>
                    <div>
                      <p className="font-bold text-indigo-900 text-sm sm:text-base">Mesclar</p>
                      <p className="text-[10px] sm:text-[11px] text-indigo-400 font-medium">Adiciona à coleção atual</p>
                    </div>
                  </button>
                  <button 
                    onClick={() => setStrategy('replace')}
                    className={`flex-1 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all text-left flex items-start gap-3 sm:gap-4 ${strategy === 'replace' ? 'border-red-500 bg-red-50/50 shadow-md' : 'border-gray-100 hover:border-gray-200'}`}
                  >
                    <div className="text-xl sm:text-2xl mt-1">🔄</div>
                    <div>
                      <p className="font-bold text-red-900 text-sm sm:text-base">Substituir</p>
                      <p className="text-[10px] sm:text-[11px] text-red-400 font-medium">Limpa tudo e recomeça</p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-[24px] sm:rounded-[32px] shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm min-w-[500px]">
                  <thead className="bg-gray-50 text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 sm:py-4">Banco</th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4">Cartão</th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4">Bandeira</th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4">Categoria</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 font-medium">
                    {fileData.slice(0, 8).map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-700">{row.issuer || '-'}</td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-600 font-bold">{row.cardName || '-'}</td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-400">{row.network || '-'}</td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-600">{row.category || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button 
                onClick={() => setFileData([])}
                className="w-full py-3 rounded-xl sm:rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 font-bold text-[10px] sm:text-xs uppercase tracking-widest hover:text-indigo-600 hover:border-indigo-100 transition-all"
              >
                Trocar Arquivo / Voltar ao Início
              </button>
            </>
          )}
        </div>

        <div className="p-6 sm:p-10 border-t flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 bg-white rounded-b-[40px]">
          <button onClick={onClose} className="px-8 py-3 rounded-xl sm:rounded-2xl font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest text-[10px] sm:text-xs transition-colors order-2 sm:order-1">Cancelar</button>
          {fileData.length > 0 && (
            <button 
              disabled={isProcessing}
              onClick={handleImport}
              className="px-8 sm:px-12 py-3 bg-indigo-600 text-white rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs shadow-xl shadow-indigo-100 hover:scale-[1.05] active:scale-[0.95] disabled:opacity-20 transition-all order-1 sm:order-2"
            >
              {isProcessing ? 'Importando...' : `Importar ${fileData.length} itens`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardImportModal;
