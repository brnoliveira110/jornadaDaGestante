import React from 'react';
import { TIMELINE_INFO } from '../constants';
import { Baby } from 'lucide-react';

interface TimelineProps {
  currentWeek: number;
}

const Timeline: React.FC<TimelineProps> = ({ currentWeek }) => {
  // Determine current month roughly (4 weeks per month approx)
  const currentMonth = Math.ceil(currentWeek / 4.3);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Baby className="w-5 h-5 text-rose-500" />
        Desenvolvimento Fetal
      </h3>

      <div className="relative">
        {/* Linha vertical de conexão */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-100" />

        <div className="space-y-8">
          {TIMELINE_INFO.map((info) => {
            const isPast = info.month < currentMonth;
            const isCurrent = info.month === currentMonth;

            return (
              <div key={info.month} className={`relative flex items-start group ${isPast || isCurrent ? 'opacity-100' : 'opacity-50 grayscale'}`}>
                {/* Circle Marker */}
                <div className={`
                  flex-shrink-0 w-16 h-16 rounded-full flex flex-col items-center justify-center z-10 border-4 transition-all
                  ${isCurrent 
                    ? 'bg-rose-500 border-rose-100 text-white shadow-lg scale-110' 
                    : isPast 
                      ? 'bg-teal-500 border-teal-100 text-white' 
                      : 'bg-white border-slate-200 text-slate-400'
                  }
                `}>
                  <span className="text-xs font-medium uppercase">Mês</span>
                  <span className="text-xl font-bold leading-none">{info.month}</span>
                </div>

                {/* Content Card */}
                <div className="ml-6 flex-1 bg-slate-50 hover:bg-white rounded-xl p-4 border border-transparent hover:border-slate-200 hover:shadow-sm transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Semanas {info.weeks}</span>
                    {isCurrent && <span className="bg-rose-100 text-rose-600 text-[10px] font-bold px-2 py-1 rounded-full">ATUAL</span>}
                  </div>
                  <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                    Tamanho: <span className="text-rose-500">{info.size}</span>
                  </h4>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    {info.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
