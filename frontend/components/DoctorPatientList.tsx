import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { calculateGestationalAge, formatDate } from '../utils';
import { ChevronRight, Calendar, Baby, AlertCircle, UserPlus, X, Copy, CheckCircle } from 'lucide-react';
import { MOCK_PREGNANCY_DATA } from '../constants';

const DoctorPatientList: React.FC = () => {
  const { availablePatients, selectPatient, registerPatient } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Registration States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [generatedPass, setGeneratedPass] = useState('');
  const [copied, setCopied] = useState(false);

  // Helper para buscar dados mockados da gestação baseados no ID do user
  const getPatientOverview = (patientId: string) => {
    if (patientId === 'u3') {
        return {
            week: 32,
            dpp: '2024-05-20',
            risk: 'High'
        };
    }
    // Para novos pacientes, retorna dados zerados ou padrão
    const isMock = ['u2'].includes(patientId);
    if (!isMock) {
        return { week: 0, dpp: undefined, risk: 'Normal' };
    }

    const dum = MOCK_PREGNANCY_DATA.dum;
    return {
        week: calculateGestationalAge(dum),
        dpp: MOCK_PREGNANCY_DATA.dpp,
        risk: 'Normal'
    };
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email) {
      const pass = registerPatient(name, email);
      setGeneratedPass(pass);
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setGeneratedPass('');
    setName('');
    setEmail('');
    setCopied(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`Login: ${email}\nSenha: ${generatedPass}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Meus Pacientes</h2>
          <p className="text-slate-500">Gerencie o acompanhamento pré-natal das suas gestantes.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-teal-700 transition-all shadow-md"
        >
          <UserPlus className="w-5 h-5" />
          Novo Paciente
        </button>
      </div>

      <div className="grid gap-4">
        {availablePatients.filter(u => u.role === 'PATIENT').map((patient) => {
          const info = getPatientOverview(patient.id);
          
          return (
            <div 
              key={patient.id}
              onClick={() => selectPatient(patient.id)}
              className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-teal-500 hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <img 
                  src={patient.avatarUrl} 
                  alt={patient.name} 
                  className="w-14 h-14 rounded-full object-cover border-2 border-slate-100 group-hover:border-teal-500 transition-colors"
                />
                <div>
                  <h3 className="font-bold text-lg text-slate-800 group-hover:text-teal-700 transition-colors">
                    {patient.name}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Baby className="w-4 h-4" /> {info.week} Semanas
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" /> DPP: {info.dpp ? formatDate(info.dpp) : 'A definir'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                {info.risk === 'High' && (
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Atenção
                  </span>
                )}
                <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-teal-50 flex items-center justify-center transition-colors">
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-teal-600" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Cadastro */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-teal-600" />
                Cadastrar Paciente
              </h3>
              <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              {!generatedPass ? (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Nome Completo</label>
                    <input 
                      required 
                      type="text" 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" 
                      placeholder="Ex: Maria Oliveira"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">E-mail</label>
                    <input 
                      required 
                      type="email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" 
                      placeholder="Ex: maria@email.com"
                    />
                  </div>
                  <div className="bg-teal-50 p-3 rounded-lg text-xs text-teal-700 mb-2">
                    Uma senha segura será gerada automaticamente após o cadastro.
                  </div>
                  <button 
                    type="submit" 
                    className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700 transition-colors"
                  >
                    Gerar Acesso
                  </button>
                </form>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-800">Cadastro Realizado!</h4>
                  <p className="text-sm text-slate-500">
                    Copie as credenciais abaixo e envie para a paciente.
                  </p>
                  
                  <div className="bg-slate-100 p-4 rounded-xl text-left space-y-2 border border-slate-200 relative">
                    <div>
                      <span className="text-xs text-slate-400 uppercase font-bold">Login</span>
                      <p className="font-mono text-slate-800 font-bold">{email}</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 uppercase font-bold">Senha Provisória</span>
                      <p className="font-mono text-teal-600 font-bold text-lg tracking-wider">{generatedPass}</p>
                    </div>
                    
                    <button 
                      onClick={handleCopy}
                      className="absolute top-2 right-2 p-2 hover:bg-white rounded-lg transition-colors text-slate-500"
                      title="Copiar"
                    >
                      {copied ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>

                  <button 
                    onClick={handleClose} 
                    className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-900 transition-colors"
                  >
                    Concluir
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorPatientList;