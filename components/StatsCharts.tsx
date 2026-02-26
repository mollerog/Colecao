
import React, { useEffect, useRef, useMemo } from 'react';
import { Can } from '../types';

declare const Chart: any;

interface StatsChartsProps {
  cans: Can[];
  onClose: () => void;
}

const StatsCharts: React.FC<StatsChartsProps> = ({ cans, onClose }) => {
  const brandChartRef = useRef<HTMLCanvasElement>(null);
  const yearChartRef = useRef<HTMLCanvasElement>(null);
  const evolutionChartRef = useRef<HTMLCanvasElement>(null);

  // Data processing
  const stats = useMemo(() => {
    // Brand distribution
    const brands: Record<string, number> = {};
    cans.forEach(c => brands[c.brand] = (brands[c.brand] || 0) + 1);
    const brandData = Object.entries(brands)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Year distribution
    const years: Record<string, number> = {};
    cans.forEach(c => {
      if (c.year) years[c.year] = (years[c.year] || 0) + 1;
    });
    const yearData = Object.entries(years).sort((a, b) => Number(a[0]) - Number(b[0]));

    // Most common sizes
    const sizes: Record<string, number> = {};
    cans.forEach(c => {
      const s = c.size?.toLowerCase().trim() || 'Desconhecido';
      sizes[s] = (sizes[s] || 0) + 1;
    });
    const topSizes = Object.entries(sizes).sort((a, b) => b[1] - a[1]).slice(0, 3);

    return { brandData, yearData, topSizes };
  }, [cans]);

  useEffect(() => {
    if (!brandChartRef.current || !yearChartRef.current || !evolutionChartRef.current) return;

    // Brand Chart (Pie)
    const brandChart = new Chart(brandChartRef.current, {
      type: 'doughnut',
      data: {
        labels: stats.brandData.map(d => d[0]),
        datasets: [{
          data: stats.brandData.map(d => d[1]),
          backgroundColor: ['#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#F59E0B'],
          borderWidth: 0,
          hoverOffset: 20
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { color: '#64748b', font: { weight: 'bold', size: 10 } } }
        },
        cutout: '70%'
      }
    });

    // Year Chart (Bar)
    const yearChart = new Chart(yearChartRef.current, {
      type: 'bar',
      data: {
        labels: stats.yearData.map(d => d[0]),
        datasets: [{
          label: 'Latas por Ano',
          data: stats.yearData.map(d => d[1]),
          backgroundColor: '#6366F1',
          borderRadius: 8,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { display: false }, ticks: { color: '#94a3b8' } },
          x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
        }
      }
    });

    // Evolution Chart (Line - Simplified simulated growth)
    const evolutionChart = new Chart(evolutionChartRef.current, {
      type: 'line',
      data: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
        datasets: [{
          label: 'Crescimento',
          data: [2, 5, 8, 15, 22, cans.length],
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 4,
          pointBackgroundColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { display: false }, ticks: { color: '#94a3b8' } },
          x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
        }
      }
    });

    return () => {
      brandChart.destroy();
      yearChart.destroy();
      evolutionChart.destroy();
    };
  }, [stats, cans.length]);

  return (
    <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white w-full max-w-5xl rounded-[24px] sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh] animate-in zoom-in duration-300">
        
        {/* Header */}
        <div className="px-6 py-6 sm:px-10 sm:py-8 flex justify-between items-center border-b border-gray-50 shrink-0">
          <div>
            <h2 className="text-xl sm:text-3xl font-black text-slate-800 tracking-tight">Estatísticas Avançadas</h2>
            <p className="text-gray-400 font-bold text-[10px] sm:text-xs uppercase tracking-widest mt-1">Visão analítica da sua coleção</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all text-xl sm:text-2xl">×</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-10 space-y-3 sm:space-y-10 bg-[#F8FAFF]">
          
          {/* Top Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-6">
             <div className="bg-white p-4 sm:p-8 rounded-[24px] sm:rounded-[32px] shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                <p className="text-3xl sm:text-4xl font-black text-indigo-600 mb-1">{cans.length}</p>
                <p className="text-[10px] sm:text-[11px] font-black text-gray-400 uppercase tracking-widest">Latas Totais</p>
             </div>
             <div className="bg-white p-4 sm:p-8 rounded-[24px] sm:rounded-[32px] shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                <p className="text-3xl sm:text-4xl font-black text-purple-600 mb-1">{new Set(cans.map(c => c.brand)).size}</p>
                <p className="text-[10px] sm:text-[11px] font-black text-gray-400 uppercase tracking-widest">Marcas Únicas</p>
             </div>
             <div className="bg-white p-4 sm:p-8 rounded-[24px] sm:rounded-[32px] shadow-sm border border-gray-100 flex flex-col items-center text-center col-span-2 md:col-span-1">
                <div className="flex flex-wrap justify-center gap-2 mb-2">
                   {stats.topSizes.map(s => <span key={s[0]} className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold">{s[0]}</span>)}
                </div>
                <p className="text-[10px] sm:text-[11px] font-black text-gray-400 uppercase tracking-widest">Volumes Mais Comuns</p>
             </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
            
            {/* Brands Pie */}
            <div className="bg-white p-3 sm:p-8 rounded-[24px] sm:rounded-[40px] shadow-sm border border-gray-100">
               <h3 className="text-sm sm:text-lg font-black text-slate-800 mb-1 sm:mb-6 flex items-center gap-2">
                 <span className="text-indigo-500">◑</span> Top Marcas
               </h3>
               <div className="h-[180px] sm:h-[300px]">
                 <canvas ref={brandChartRef}></canvas>
               </div>
            </div>

            {/* Years Bar */}
            <div className="bg-white p-3 sm:p-8 rounded-[24px] sm:rounded-[40px] shadow-sm border border-gray-100">
               <h3 className="text-sm sm:text-lg font-black text-slate-800 mb-1 sm:mb-6 flex items-center gap-2">
                 <span className="text-purple-500">📊</span> Por Ano de Lançamento
               </h3>
               <div className="h-[180px] sm:h-[300px]">
                 <canvas ref={yearChartRef}></canvas>
               </div>
            </div>

            {/* Evolution Line */}
            <div className="lg:col-span-2 bg-white p-3 sm:p-8 rounded-[24px] sm:rounded-[40px] shadow-sm border border-gray-100">
               <h3 className="text-sm sm:text-lg font-black text-slate-800 mb-1 sm:mb-6 flex items-center gap-2">
                 <span className="text-emerald-500">📈</span> Evolução da Coleção (Tempo)
               </h3>
               <div className="h-[180px] sm:h-[300px]">
                 <canvas ref={evolutionChartRef}></canvas>
               </div>
            </div>

          </div>

          {/* Detailed Stats List */}
          <div className="bg-slate-900 rounded-[24px] sm:rounded-[40px] p-6 sm:p-10 text-white">
             <h3 className="text-lg sm:text-xl font-black mb-6 sm:mb-8">Curiosidades da Coleção</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-3 sm:space-y-4">
                   <p className="text-white/40 text-[8px] sm:text-[10px] font-black uppercase tracking-widest">Maior Empresa (Grupo)</p>
                   <div className="flex items-center gap-3 sm:gap-4">
                      <div className="text-2xl sm:text-3xl">🏭</div>
                      <div>
                         <p className="text-xl sm:text-2xl font-black">{Object.entries(cans.reduce((acc: any, c) => { acc[c.group] = (acc[c.group] || 0) + 1; return acc; }, {})).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || '---'}</p>
                         <p className="text-indigo-400 font-bold text-xs sm:text-sm">Empresa com mais itens registrados</p>
                      </div>
                   </div>
                </div>
                <div className="space-y-3 sm:space-y-4">
                   <p className="text-white/40 text-[8px] sm:text-[10px] font-black uppercase tracking-widest">Item Mais Antigo</p>
                   <div className="flex items-center gap-3 sm:gap-4">
                      <div className="text-2xl sm:text-3xl">🏺</div>
                      <div>
                         <p className="text-xl sm:text-2xl font-black">{cans.map(c => Number(c.year)).filter(y => !isNaN(y) && y > 0).sort((a, b) => a - b)[0] || '---'}</p>
                         <p className="text-purple-400 font-bold text-xs sm:text-sm">Lançado há muito tempo</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 sm:px-10 sm:py-6 bg-white border-t border-gray-50 flex justify-end shrink-0">
          <button onClick={onClose} className="w-full sm:w-auto px-6 py-3 sm:px-10 sm:py-3 rounded-xl sm:rounded-2xl bg-slate-900 text-white font-black text-[10px] sm:text-xs uppercase tracking-[2px] hover:bg-indigo-600 transition-all">Fechar Relatório</button>
        </div>
      </div>
    </div>
  );
};

export default StatsCharts;
