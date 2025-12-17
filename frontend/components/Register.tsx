import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Baby, ArrowRight, User, Mail, Lock, ArrowLeft, Heart } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import PregnancySetup from '../pages/SetupPage';

interface RegisterProps {
  onBack: () => void;
}

const Register: React.FC<RegisterProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const { register } = useData();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);

    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 800));

    // Registrar e logar
    const success = await register(formData.name, formData.email);

    if (success) {
      setShowSetupModal(true);
    } else {
      setError('Erro ao criar conta. Tente novamente.');
      setLoading(false);
    }
  };

  const handleSetupComplete = () => {
    navigate('/');
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-right-8 duration-300">

          {/* Header */}
          <div className="p-8 pb-4 text-center bg-gradient-to-b from-white to-slate-50">
            <button
              onClick={onBack}
              className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            <div className="w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-200">
              <Heart className="text-white w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Crie sua conta</h1>
            <p className="text-slate-500 text-sm mt-1">Comece a monitorar sua gestação hoje.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-4 pt-2">

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Maria Oliveira"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="seu@email.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Crie uma senha"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">Confirmar Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Repita a senha"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-xs text-center font-medium bg-red-50 p-2 rounded-lg animate-in fade-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`
              w-full py-3 rounded-xl font-bold text-white shadow-lg shadow-rose-200 hover:shadow-rose-300 transition-all flex items-center justify-center gap-2 bg-rose-600 mt-2
              ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'}
            `}
            >
              {loading ? 'Criando conta...' : (
                <>
                  Começar Jornada <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-center text-xs text-slate-400 mt-6">
              Já tem uma conta? <button onClick={onBack} className="text-rose-600 font-bold hover:underline">Fazer Login</button>
            </p>
          </form>
        </div>
      </div>

      <Dialog open={showSetupModal} onOpenChange={handleSetupComplete}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-full">
          <DialogHeader>
            <DialogTitle>Bem-vinda, mamãe! 🎉</DialogTitle>
            <DialogDescription>
              Para começarmos, precisamos de algumas informações importantes sobre sua gestação.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <PregnancySetup onSave={handleSetupComplete} />
          </div>
          <div className="flex justify-end mt-4">
            <button onClick={handleSetupComplete} className="text-sm text-slate-400 hover:text-slate-600">Pular por enquanto</button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Register;