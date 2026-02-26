
import React, { useState } from 'react';
import { Firestore, collection, doc, writeBatch, serverTimestamp, getDocs } from 'firebase/firestore';

interface CarImportModalProps {
  db: Firestore;
  user: any;
  onClose: () => void;
  currentCount: number;
  onOpenBulk: () => void;
}

const CarImportModal: React.FC<CarImportModalProps> = ({ db, user, onClose, currentCount, onOpenBulk }) => {
  const [fileData, setFileData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [strategy, setStrategy] = useState<'merge' | 'replace'>('merge');

  const downloadTemplate = () => {
    const templateData = [{
      'Nome da Miniatura': '17 Nissan GT-R (R35)',
      'Marca da Miniatura': 'Hot Wheels',
      'Linha': 'Mainline',
      'Ano de Lançamento': '2017',
      'Escala': '1:64',
      'Estado de Conservação': 'Mint',
      'Cor Predominante': 'Branco',
      'Material': 'Diecast',
      'Origem do Modelo': 'Real',
      'Marca do Carro Real': 'Nissan',
      'Modelo Real': 'GT-R',
      'Segmento': 'Supercar',
      'Descrição da Imagem': 'hotwheels-gtr-r35-white'
    }];
    try {
      const ws = (window as any).XLSX.utils.json_to_sheet(templateData);
      const wb = (window as any).XLSX.utils.book_new();
      (window as any).XLSX.utils.book_append_sheet(wb, ws, "Garagem");
      
      const wbout = (window as any).XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = "template_miniaturas_autos.xlsx";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
    } catch (err) {
      console.error("Erro ao baixar template:", err);
      alert("Erro ao gerar arquivo de template.");
    }
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
            const normalize = (s: string) => s.toLowerCase().trim();
            const normalizedVariations = variations.map(normalize);
            const foundKey = rowKeys.find(k => normalizedVariations.includes(normalize(k)));
            return foundKey ? String(r[foundKey] || '').trim() : '';
          };

          return {
            minatureName: getVal(row, ['Nome da Miniatura', 'Nome']),
            miniatureBrand: getVal(row, ['Marca da Miniatura', 'Marca']),
            line: getVal(row, ['Linha']),
            year: getVal(row, ['Ano de Lançamento', 'Ano']),
            scale: getVal(row, ['Escala']),
            condition: getVal(row, ['Estado de Conservação', 'Estado']),
            mainColor: getVal(row, ['Cor Predominante', 'Cor']),
            material: getVal(row, ['Material']),
            origin: (getVal(row, ['Origem do Modelo', 'Origem']).toLowerCase() || 'real') as any,
            realCarBrand: getVal(row, ['Marca do Carro Real', 'Marca Carro']),
            realCarModel: getVal(row, ['Modelo Real', 'Carro Real']),
            segment: getVal(row, ['Segmento']),
            imageDesc: getVal(row, ['Descrição da Imagem', 'ID Imagem']),
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
      const carsRef = collection(db, 'users', user.uid, 'cars');

      if (strategy === 'replace') {
        const snapshot = await getDocs(carsRef);
        const deleteBatch = writeBatch(db);
        snapshot.docs.forEach(d => deleteBatch.delete(d.ref));
        await deleteBatch.commit();
      }

      const CHUNK_SIZE = 400;
      for (let i = 0; i < fileData.length; i += CHUNK_SIZE) {
        const chunk = fileData.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);
        chunk.forEach(row => {
          const newDoc = doc(carsRef);
          batch.set(newDoc, {
            ...row,
            photo: '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        });
        await batch.commit();
      }

      alert('Garagem atualizada com sucesso!');
      onClose();
    } catch (e) {
      alert("Erro ao importar dados.");
    } finally {
      setIsProcessing(false);
    }
  };

  const validRows = fileData.filter(r => r.minatureName && r.miniatureBrand && r.imageDesc);
  const invalidCount = fileData.length - validRows.length;

  const cardBaseClass = "group relative bg-white p-3 sm:p-6 rounded-[20px] sm:rounded-[32px] border-2 border-slate-100 hover:border-indigo-500 shadow-sm transition-all text-left flex flex-col items-center text-center gap-2 sm:gap-4 h-full min-h-[140px] sm:min-h-[240px] justify-center";

  return (
    <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-6xl rounded-[40px] shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in duration-300">
        <div className="p-4 sm:p-6 border-b flex justify-between items-center bg-indigo-600 text-white rounded-t-[40px]">
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">Hub de Importação</h2>
            <p className="text-white/60 font-bold text-[10px] sm:text-xs uppercase tracking-widest mt-1">Gerencie sua garagem em massa</p>
          </div>
          <button onClick={onClose} className="text-3xl font-thin text-white/40 hover:text-white transition-colors">×</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50/50">
          {fileData.length === 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-3 gap-3 sm:gap-6">
              {/* Opção 1: Upload de Fotos */}
              <button onClick={onOpenBulk} className={cardBaseClass}>
                <div className="w-10 h-10 sm:w-20 sm:h-20 bg-purple-50 rounded-2xl sm:rounded-3xl flex items-center justify-center text-xl sm:text-4xl group-hover:scale-110 transition-transform shadow-sm">📷</div>
                <div className="flex-1">
                  <h4 className="text-[10px] sm:text-xl font-black text-slate-800 mb-0.5 sm:mb-2 leading-tight">Fotos</h4>
                  <p className="hidden sm:block text-sm text-slate-400 font-medium leading-relaxed px-2">Vincule fotos às miniaturas existentes usando o campo 'Desc Imagem'.</p>
                </div>
              </button>

              {/* Opção 2: Importar Planilha Excel */}
              <div className={`${cardBaseClass} cursor-pointer`}>
                <input type="file" accept=".xlsx,.xls,.csv" className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={handleFile} />
                <div className="w-10 h-10 sm:w-20 sm:h-20 bg-indigo-50 rounded-2xl sm:rounded-3xl flex items-center justify-center text-xl sm:text-4xl group-hover:scale-110 transition-transform shadow-sm">📊</div>
                <div className="flex-1">
                  <h4 className="text-[10px] sm:text-xl font-black text-slate-800 mb-0.5 sm:mb-2 leading-tight">Planilha</h4>
                  <p className="hidden sm:block text-sm text-slate-400 font-medium leading-relaxed px-2">Carregue sua base de dados de miniaturas via arquivo Excel ou CSV.</p>
                </div>
              </div>

              {/* Opção 3: Baixar Template */}
              <button onClick={downloadTemplate} className={cardBaseClass}>
                <div className="w-10 h-10 sm:w-20 sm:h-20 bg-orange-50 rounded-2xl sm:rounded-3xl flex items-center justify-center text-xl sm:text-4xl group-hover:scale-110 transition-transform shadow-sm">📄</div>
                <div className="flex-1">
                  <h4 className="text-[10px] sm:text-xl font-black text-slate-800 mb-0.5 sm:mb-2 leading-tight">Modelo</h4>
                  <p className="hidden sm:block text-sm text-slate-400 font-medium leading-relaxed px-2">Obtenha o modelo de planilha oficial para preencher sua coleção.</p>
                </div>
              </button>
            </div>
          ) : (
            <>
              {/* Resumo da Importação */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 text-center">
                  <p className="text-2xl sm:text-3xl font-black text-indigo-600 leading-none mb-2">{fileData.length}</p>
                  <p className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Detectado</p>
                </div>
                <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 text-center">
                  <p className="text-2xl sm:text-3xl font-black text-green-500 leading-none mb-2">{validRows.length}</p>
                  <p className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">Válidos para Importar</p>
                </div>
                <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 text-center">
                  <p className="text-2xl sm:text-3xl font-black text-red-400 leading-none mb-2">{invalidCount}</p>
                  <p className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">Campos Incompletos</p>
                </div>
              </div>

              {/* Estratégia */}
              <div className="bg-white p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] shadow-sm border border-gray-100 space-y-4">
                <h4 className="text-[10px] sm:text-sm font-black text-slate-800 uppercase tracking-widest">Escolha a Estratégia</h4>
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  <button 
                    onClick={() => setStrategy('merge')}
                    className={`flex-1 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all text-left flex items-start gap-4 ${strategy === 'merge' ? 'border-indigo-500 bg-indigo-50/50 shadow-md' : 'border-gray-100 hover:border-gray-200'}`}
                  >
                    <div className="text-xl sm:text-2xl mt-1">➕</div>
                    <div>
                      <p className="font-bold text-indigo-900 text-sm sm:text-base">Mesclar</p>
                      <p className="text-[9px] sm:text-[11px] text-indigo-400 font-medium">Adiciona à coleção atual</p>
                    </div>
                  </button>
                  <button 
                    onClick={() => setStrategy('replace')}
                    className={`flex-1 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all text-left flex items-start gap-4 ${strategy === 'replace' ? 'border-red-500 bg-red-50/50 shadow-md' : 'border-gray-100 hover:border-gray-200'}`}
                  >
                    <div className="text-xl sm:text-2xl mt-1">🔄</div>
                    <div>
                      <p className="font-bold text-red-900 text-sm sm:text-base">Substituir</p>
                      <p className="text-[9px] sm:text-[11px] text-red-400 font-medium">Limpa tudo e recomeça</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Tabela de Preview */}
              <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">
                    <tr>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Marca (Min)</th>
                      <th className="px-6 py-4">Nome Miniatura</th>
                      <th className="px-6 py-4">Linha</th>
                      <th className="px-6 py-4">Carro Real</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 font-medium">
                    {fileData.slice(0, 8).map((row, i) => {
                      const isValid = row.minatureName && row.miniatureBrand && row.imageDesc;
                      return (
                        <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">{isValid ? '✅' : '⚠️'}</td>
                          <td className="px-6 py-4 text-slate-700 font-bold">{row.miniatureBrand || '-'}</td>
                          <td className="px-6 py-4 text-slate-600">{row.minatureName || '-'}</td>
                          <td className="px-6 py-4 text-slate-400">{row.line || '-'}</td>
                          <td className="px-6 py-4 text-slate-500 font-medium">{row.realCarBrand} {row.realCarModel}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {fileData.length > 8 && (
                  <p className="px-6 py-4 text-center text-xs text-gray-400 font-bold bg-gray-50/20">
                    E mais {fileData.length - 8} itens...
                  </p>
                )}
              </div>

              <button 
                onClick={() => setFileData([])}
                className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-indigo-600 hover:border-indigo-100 transition-all"
              >
                Trocar Arquivo / Voltar ao Início
              </button>
            </>
          )}
        </div>

        <div className="p-4 sm:p-4 border-t flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 bg-white rounded-b-[40px]">
          <button onClick={onClose} className="w-full sm:w-auto px-8 py-3 rounded-2xl font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest text-[10px] sm:text-xs transition-colors order-2 sm:order-1">Cancelar</button>
          {fileData.length > 0 && (
            <button 
              disabled={isProcessing}
              onClick={handleImport}
              className="w-full sm:w-auto px-12 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs shadow-xl shadow-indigo-100 hover:scale-[1.05] active:scale-[0.95] disabled:opacity-20 transition-all order-1 sm:order-2"
            >
              {isProcessing ? 'Importando...' : `Importar ${fileData.length} itens`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarImportModal;
