import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useData } from '../context/DataContext';
import { generateChartData } from '../utils';
import { Activity } from 'lucide-react';

const NutritionalCurve: React.FC = () => {
  const { consultations, pregnancyData } = useData();

  if (!pregnancyData) return <div>Selecione um paciente</div>;

  const chartData = generateChartData(consultations, pregnancyData.preGestationalHeight);

  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-teal-50 border border-teal-100 p-8 flex flex-col h-[600px] relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <Activity className="w-64 h-64 text-teal-600" />
      </div>
      
      <div className="relative z-10 mb-6">
        <h3 className="text-2xl font-bold text-teal-800 flex items-center gap-3">
          <div className="p-2 bg-teal-100 rounded-lg">
            <Activity className="w-6 h-6 text-teal-700" />
          </div>
          Curva Nutricional (IMC)
        </h3>
        <p className="text-slate-500 mt-1 ml-11">
          Acompanhamento detalhado do ganho de peso e IMC vs Idade Gestacional.
        </p>
      </div>
      
      <div className="flex-1 w-full min-h-0 border rounded-2xl p-4 bg-slate-50/50">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="week" 
              name="Semana" 
              label={{ value: 'Idade Gestacional (Semanas)', position: 'insideBottom', offset: -10, fontSize: 12, fill: '#64748b' }} 
              stroke="#94a3b8"
              tick={{fill: '#64748b'}}
            />
            <YAxis 
              domain={['dataMin - 2', 'dataMax + 2']} 
              label={{ value: 'IMC (kg/m²)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 12, fill: '#64748b' }}
              stroke="#94a3b8"
              tick={{fill: '#64748b'}}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
              cursor={{ stroke: '#cbd5e1', strokeWidth: 2 }}
            />
            <Legend verticalAlign="top" height={40} iconType="circle"/>
            <Line 
              type="monotone" 
              dataKey="maxNormal" 
              stroke="#94a3b8" 
              strokeDasharray="5 5" 
              strokeWidth={2}
              dot={false} 
              name="Limite Superior Esperado" 
            />
            <Line 
              type="monotone" 
              dataKey="bmi" 
              stroke="#0d9488" 
              strokeWidth={4} 
              activeDot={{ r: 8, stroke: '#fff', strokeWidth: 2 }} 
              dot={{ r: 4, fill: '#0d9488', strokeWidth: 0 }}
              name="IMC da Paciente"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default NutritionalCurve;