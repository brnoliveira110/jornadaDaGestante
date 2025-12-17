import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Stethoscope, CheckCircle, ArrowLeft, Award, FileBadge } from 'lucide-react';

interface DoctorRegisterProps {
  onBack: () => void;
}

const DoctorRegister: React.FC<DoctorRegisterProps> = ({ onBack }) => {
  const { registerDoctor } = useData();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    crm: '',
    specialty: 'Obstetrícia',
    titles: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("As senhas não coincidem.");
      return;
    }
    // Simular registro
    registerDoctor(formData.name, formData.crm, formData.specialty, formData.titles, formData.email);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden flex flex-col md:flex-row">
        
        {/* Lado Esquerdo - Decorativo */}
        <div className="bg-teal-600 p-8 md:w-1/3 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-teal-500 rounded-full opacity-50 blur-3xl"></div>
          <div className="absolute -left-10 bottom-10 w-40 h-40 bg-teal-400 rounded-full opacity-30 blur-3xl"></div>
          
          <div>
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Junte-se à Jornada</h2>
            <p className="text-teal-100 text-sm">A plataforma mais completa para acompanhamento pré-natal digital.</p>
          </div>
          
          <div className="space-y-4 text-sm text-teal-50 mt-8">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-teal-300" />
              <span>Assinatura Digital</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-teal-300" />
              <span>Gestão de Pacientes</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-teal-300" />
              <span>Prontuário Integrado</span>
            </div>
          </div>
        </div>

        {/* Lado Direito - Formulário */}
        <div className="p-8 md:w-2/3">
          <button onClick={onBack} className="flex items-center gap-1 text-slate-400 hover:text-slate-600 text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar ao Login
          </button>

          <h2 className="text-2xl font-bold text-slate-800 mb-6">Cadastro Profissional</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Nome Completo</label>
              <input required name="name" value={formData.name} onChange={handleChange} type="text" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Dr(a). Nome Sobrenome" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">CRM / UF</label>
                <input required name="crm" value={formData.crm} onChange={handleChange} type="text" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="12345/SP" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Especialidade</label>
                <select name="specialty" value={formData.specialty} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none bg-white">
                  <option>Obstetrícia</option>
                  <option>Ginecologia</option>
                  <option>Medicina Fetal</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Títulos Acadêmicos (Opcional)</label>
              <input name="titles" value={formData.titles} onChange={handleChange} type="text" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Ex: Mestre pela USP, Especialista FEBRASGO" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">E-mail Profissional</label>
              <input required name="email" value={formData.email} onChange={handleChange} type="email" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="medico@clinica.com" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Senha</label>
                <input required name="password" value={formData.password} onChange={handleChange} type="password" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="••••••" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Confirmar Senha</label>
                <input required name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} type="password" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="••••••" />
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-teal-200 transition-all transform hover:-translate-y-0.5">
                Criar Conta e Acessar
              </button>
            </div>
            
            <p className="text-xs text-center text-slate-400 mt-4">
              Ao se cadastrar, você concorda em utilizar sua assinatura digital para validar documentos na plataforma.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DoctorRegister;