import React from 'react';
import { Lightbulb, Apple, Heart, Brain, ArrowRight, Baby, Activity, Calendar, Coffee, Moon } from 'lucide-react';
import { useData } from '../context/DataContext';

const Tips: React.FC = () => {
  const { tips } = useData();

  // Helper para mapear string de categoria/mês para ícone e cor
  const getTipTheme = (category: string, month: number) => {
    const cat = category.toLowerCase();
    if (cat.includes('nutrição') || cat.includes('alimentação')) return { icon: Apple, color: 'bg-green-100 text-green-600' };
    if (cat.includes('exame') || cat.includes('médico')) return { icon: Activity, color: 'bg-blue-100 text-blue-600' };
    if (cat.includes('bem-estar') || cat.includes('enjoo') || cat.includes('energia')) return { icon: Coffee, color: 'bg-amber-100 text-amber-600' };
    if (cat.includes('sono') || cat.includes('preparação')) return { icon: Moon, color: 'bg-indigo-100 text-indigo-600' };
    if (cat.includes('bebê') || cat.includes('desenvolvimento')) return { icon: Baby, color: 'bg-purple-100 text-purple-600' };
    if (cat.includes('parto') || cat.includes('final') || cat.includes('início')) return { icon: Lightbulb, color: 'bg-orange-100 text-orange-600' };
    if (cat.includes('coração') || cat.includes('sintoma') || cat.includes('monitoramento')) return { icon: Heart, color: 'bg-rose-100 text-rose-600' };
    
    // Default fallback based on month parity
    return month % 2 === 0 
      ? { icon: Calendar, color: 'bg-teal-100 text-teal-600' }
      : { icon: Brain, color: 'bg-rose-100 text-rose-600' };
  };

  // Sort tips by month
  const sortedTips = [...tips].sort((a, b) => a.month - b.month);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section */}
      <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-amber-50 rounded-full">
            <Lightbulb className="w-8 h-8 text-amber-500" />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-slate-800">Guia Mensal da Gestação</h2>
            <p className="text-slate-500 mt-2 max-w-xl">
              Acompanhe as principais recomendações para cada etapa da sua jornada, do positivo ao parto.
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedTips.map((tip) => {
          const theme = getTipTheme(tip.category, tip.month);
          const Icon = theme.icon;

          return (
            <div key={tip.id} className="bg-white flex flex-col p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all group cursor-pointer relative overflow-hidden">
              
              {/* Número do Mês no Fundo */}
              <div className="absolute -right-4 -bottom-4 text-9xl font-bold text-slate-50 pointer-events-none group-hover:text-teal-50 transition-colors">
                {tip.month}
              </div>

              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`p-3 rounded-xl ${theme.color} shadow-sm`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="px-2 py-1 rounded bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wide">
                  {tip.category}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-teal-600 transition-colors relative z-10">
                {tip.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-6 flex-1 relative z-10">
                {tip.content}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-50 relative z-10">
                <span className="text-xs text-slate-400 font-medium">{tip.readTime} leitura</span>
                <button className="text-sm font-bold text-teal-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                  Ler Detalhes <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Tips;