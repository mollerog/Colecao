
import React, { useEffect, useRef, useMemo } from 'react';
import { CreditCard } from '../types';

declare const Chart: any;

interface CardStatsChartsProps {
  cards: CreditCard[];
  onClose: () => void;
}

const CardStatsCharts: React.FC<CardStatsChartsProps> = ({ cards, onClose }) => {
  const networkChartRef = useRef<HTMLCanvasElement>(null);
  const issuerChartRef = useRef<HTMLCanvasElement>(null);
  const categoryChartRef = useRef<HTMLCanvasElement>(null);

  const stats = useMemo(() => {
    const networks: Record<string, number> = {};
    const issuers: Record<string, number> = {};
    const categories: Record<string, number> = {};

    cards.forEach(c => {
      networks[c.network] = (networks[c.network] || 0) + 1;
      issuers[c.issuer] = (issuers[c.issuer] || 0) + 1;
      categories[c.category] = (categories[c.category] || 0) + 1;
    });

    return {
      networkData: Object.entries(networks).sort((a, b) => b[1] - a[1]),
      issuerData: Object.entries(issuers).sort((a, b) => b[1] - a[1]).slice(0, 5),
      categoryData: Object.entries(categories).sort((a, b) => b[1] - a[1])
    };
  }, [cards]);

  useEffect(() => {
    if (!networkChartRef.current || !issuerChartRef.current || !categoryChartRef.current) return;

    const netChart = new Chart(networkChartRef.current, {
      type: 'doughnut',
      data: {
        labels: stats.networkData.map(d => d[0]),
        datasets: [{
          data: stats.networkData.map(d => d[1]),
          backgroundColor: ['#6366F1', '#F59E0B', '#10B981', '#F43F5E', '#8B5CF6'],
          borderWidth: 0
        }]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } }, cutout: '70%' }
    });

    const isChart = new Chart(issuerChartRef.current, {
      type: 'bar',
      data: {
        labels: stats.issuerData.map(d => d[0]),
        datasets: [{
          data: stats.issuerData.map(d => d[1]),
          backgroundColor: '#6366F1',
          borderRadius: 8
        }]
      },
      options: { responsive: true, plugins: { legend: { display: false } } }
    });

    const catChart = new Chart(categoryChartRef.current, {
      type: 'pie',
      data: {
        labels: stats.categoryData.map(d => d[0]),
        datasets: [{
          data: stats.categoryData.map(d => d[1]),
          backgroundColor: ['#8B5CF6', '#EC4899', '#6366F1', '#F59E0B', '#10B981'],
          borderWidth: 0
        }]
      },
      options: { responsive: true, plugins: { legend: { position: 'right' } } }
    });

    return () => {
      netChart.destroy();
      isChart.destroy();
      catChart.destroy();
    };
  }, [stats]);

  return (
    <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in duration-300">
        <div className="px-10 py-8 flex justify-between items-center border-b border-gray-50 bg-indigo-600 text-white">
          <div>
            <h2 className="text-3xl font-black tracking-tight">Estatísticas de Cartões</h2>
            <p className="text-white/60 font-bold text-xs uppercase tracking-widest mt-1">Análise da sua carteira de colecionador</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all text-2xl">×</button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-10 bg-[#F8FAFF]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col items-center">
                <p className="text-4xl font-black text-indigo-600 mb-1">{cards.length}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cartões Totais</p>
             </div>
             <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col items-center">
                <p className="text-4xl font-black text-purple-600 mb-1">{stats.issuerData.length}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bancos/Emissores</p>
             </div>
             <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col items-center">
                <p className="text-4xl font-black text-emerald-600 mb-1">{stats.networkData.length}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bandeiras Diferentes</p>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
               <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">Bandeiras Dominantes</h3>
               <div className="aspect-square max-h-[300px] mx-auto">
                 <canvas ref={networkChartRef}></canvas>
               </div>
            </div>
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
               <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">Categorias (Gold, Black...)</h3>
               <div className="aspect-square max-h-[300px] mx-auto">
                 <canvas ref={categoryChartRef}></canvas>
               </div>
            </div>
            <div className="lg:col-span-2 bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
               <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">Top Emissores</h3>
               <div className="h-[300px]">
                 <canvas ref={issuerChartRef}></canvas>
               </div>
            </div>
          </div>
        </div>

        <div className="px-10 py-6 bg-white border-t border-gray-50 flex justify-end shrink-0">
          <button onClick={onClose} className="px-10 py-3 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-[2px] hover:bg-indigo-600 transition-all">Fechar Relatório</button>
        </div>
      </div>
    </div>
  );
};

export default CardStatsCharts;
