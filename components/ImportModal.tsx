
import React, { useState } from 'react';
import { Firestore, collection, doc, writeBatch, serverTimestamp, deleteDoc, getDocs } from 'firebase/firestore';

interface ImportModalProps {
  db: Firestore;
  user: any;
  onClose: () => void;
  currentCount: number;
}

const ImportModal: React.FC<ImportModalProps> = ({ db, user, onClose, currentCount }) => {
  const [fileData, setFileData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [strategy, setStrategy] = useState<'merge' | 'replace'>('merge');

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
            group: getVal(row, ['Grupo', 'Empresa', 'Group']),
            acronym: getVal(row, ['Sigla', 'Abreviação', 'Acronym']),
            brand: getVal(row, ['Marca da Bebida', 'Marca', 'Brand']),
            name: getVal(row, ['Nome da Bebida', 'Nome', 'Produto', 'Name']),
            description: getVal(row, ['Descrição da Lata', 'Descrição', 'Obs', 'Observação']),
            year: getVal(row, ['Ano de Lançamento', 'Ano', 'Year', 'Data']),
            size: getVal(row, ['Tamanho (ml) *', 'Tamanho', 'Volume', 'Capacidade', 'Size', 'Ml', 'Conteúdo']),
            imageDesc: getVal(row, ['Descrição da Imagem', 'Desc Imagem', 'ID Imagem', 'Image ID']),
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
      const cansRef = collection(db, 'users', user.uid, 'cans');

      if (strategy === 'replace') {
        const snapshot = await getDocs(cansRef);
        const deleteBatch = writeBatch(db);
        snapshot.docs.forEach(d => deleteBatch.delete(d.ref));
        await deleteBatch.commit();
      }

      // Firestore batches have a limit of 500 ops
      const CHUNK_SIZE = 400;
      for (let i = 0; i < fileData.length; i += CHUNK_SIZE) {
        const chunk = fileData.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);
        chunk.forEach(row => {
          const newDoc = doc(cansRef);
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

  const validRows = fileData.filter(r => r.brand && r.group && r.size && r.imageDesc);
  const invalidCount = fileData.length - validRows.length;

  return (
    <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in duration-300">
        <div className="p-10 border-b flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Importar Dados</h2>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Excel (.xlsx, .csv)</p>
          </div>
          <button onClick={onClose} className="text-3xl font-thin text-gray-400 hover:text-red-500 transition-colors">×</button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-8 bg-gray-50/50">
          {fileData.length === 0 ? (
            <div className="h-64 border-4 border-dashed border-indigo-100 rounded-[32px] flex flex-col items-center justify-center text-center p-10 hover:border-indigo-400 transition-all cursor-pointer relative group">
              <input type="file" accept=".xlsx,.xls,.csv" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFile} />
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">📊</div>
              <h3 className="text-xl font-bold text-slate-700">Arraste ou selecione seu arquivo</h3>
              <p className="text-gray-400 text-sm mt-2">Formatos aceitos: Excel e CSV</p>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
                  <p className="text-3xl font-black text-indigo-600 leading-none mb-2">{fileData.length}</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Detectado</p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
                  <p className="text-3xl font-black text-green-500 leading-none mb-2">{validRows.length}</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Válidos para Importar</p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
                  <p className="text-3xl font-black text-red-400 leading-none mb-2">{invalidCount}</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Incompletos (Avisos)</p>
                </div>
              </div>

              {/* Strategy */}
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 space-y-4">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Como processar os dados?</h4>
                <div className="flex gap-6">
                  <button 
                    onClick={() => setStrategy('merge')}
                    className={`flex-1 p-6 rounded-2xl border-2 transition-all text-left ${strategy === 'merge' ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-100 hover:border-gray-200'}`}
                  >
                    <p className="font-bold text-indigo-900 mb-1">➕ Mesclar com Atual</p>
                    <p className="text-xs text-indigo-400">Adiciona os {fileData.length} itens aos {currentCount} que você já tem.</p>
                  </button>
                  <button 
                    onClick={() => setStrategy('replace')}
                    className={`flex-1 p-6 rounded-2xl border-2 transition-all text-left ${strategy === 'replace' ? 'border-red-500 bg-red-50/50' : 'border-gray-100 hover:border-gray-200'}`}
                  >
                    <p className="font-bold text-red-900 mb-1">🔄 Substituir Tudo</p>
                    <p className="text-xs text-red-400">Apaga sua coleção atual e recomeça apenas com estes novos itens.</p>
                  </button>
                </div>
              </div>

              {/* Preview Table */}
              <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">
                    <tr>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Grupo</th>
                      <th className="px-6 py-4">Marca</th>
                      <th className="px-6 py-4">Ano</th>
                      <th className="px-6 py-4">Tamanho</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {fileData.slice(0, 10).map((row, i) => {
                      const isValid = row.brand && row.group && row.size && row.imageDesc;
                      return (
                        <tr key={i} className="hover:bg-gray-50/50">
                          <td className="px-6 py-4">{isValid ? '✅' : '⚠️'}</td>
                          <td className="px-6 py-4 font-bold text-slate-700">{row.group || '-'}</td>
                          <td className="px-6 py-4 text-slate-600">{row.brand || '-'}</td>
                          <td className="px-6 py-4 text-slate-400">{row.year || '-'}</td>
                          <td className="px-6 py-4 text-slate-600 font-medium">{row.size || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {fileData.length > 10 && (
                  <p className="px-6 py-4 text-center text-xs text-gray-400 font-bold bg-gray-50/20">
                    + {fileData.length - 10} itens não mostrados no preview...
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        <div className="p-10 border-t flex justify-end gap-4 bg-white rounded-b-[40px]">
          <button onClick={onClose} className="px-8 py-3 rounded-2xl font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest text-xs transition-colors">Cancelar</button>
          <button 
            disabled={fileData.length === 0 || isProcessing}
            onClick={handleImport}
            className="px-12 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-100 hover:scale-[1.05] active:scale-[0.95] disabled:opacity-20 transition-all"
          >
            {isProcessing ? 'Importando...' : `Importar ${fileData.length} itens`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
