import React, { useEffect, useRef } from 'react';
import { WEEKLY_DEVELOPMENT } from '../constants';
import { getFetalImageUrl } from '../utils';
import { Activity, Baby, Ruler, Scale } from 'lucide-react';

interface TimelineProps {
  currentWeek: number;
}

const Timeline: React.FC<TimelineProps> = ({ currentWeek }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to current week on mount
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Baby className="w-5 h-5 text-rose-500" />
        Desenvolvimento Fetal: Semana a Semana
      </h3>

      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-100" />

        <div className="space-y-8">
          {WEEKLY_DEVELOPMENT.map((info) => {
            const isPast = info.week < currentWeek;
            const isCurrent = info.week === currentWeek;
            const opacityClass = isPast || isCurrent ? 'opacity-100' : 'opacity-60 grayscale';

            return (
              <div
                key={info.week}
                ref={isCurrent ? scrollRef : null}
                className={`relative flex items-start group ${opacityClass} transition-all duration-300`}
              >
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
                  <span className="text-[10px] font-medium uppercase">Semana</span>
                  <span className="text-xl font-bold leading-none">{info.week}</span>
                </div>

                {/* Content Card */}
                <div className="ml-6 flex-1 bg-slate-50 hover:bg-white rounded-xl p-4 border border-transparent hover:border-slate-200 hover:shadow-sm transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                      {info.sizeComparison}
                    </span>
                    {isCurrent && <span className="bg-rose-100 text-rose-600 text-[10px] font-bold px-2 py-1 rounded-full">VOCÊ ESTÁ AQUI</span>}
                  </div>

                  <div className="flex gap-4 mb-3">
                    {/* Placeholder Image */}
                    <img
                      src={info.imageUrl || getFetalImageUrl(info.week)}
                      alt={`Semana ${info.week}`}
                      className="w-16 h-16 rounded-lg object-cover bg-slate-200"
                    />

                    <div className="flex-1 grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Scale className="w-3.5 h-3.5 text-slate-400" />
                        <span>Peso: <strong>{info.weight}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Ruler className="w-3.5 h-3.5 text-slate-400" />
                        <span>Tam: <strong>{info.length}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600 col-span-2">
                        <Activity className="w-3.5 h-3.5 text-slate-400" />
                        <span>Cor: <strong>{info.heartRate}</strong></span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {info.description}
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
