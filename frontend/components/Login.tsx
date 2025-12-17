import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Baby, ArrowRight, User } from 'lucide-react';
import { MOCK_CREDENTIALS } from '../constants';

interface LoginProps {
  onRegisterClick: () => void;
}

const Login: React.FC<LoginProps> = ({ onRegisterClick }) => {
  const { login } = useData();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 800));

    // No modo autogestão, o login é simplificado (aceita o usuário de teste ou qualquer nome para demo)
    const success = await login(username);

    if (!success) {
      setError('Erro ao acessar. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-300">

        {/* Header */}
        <div className="p-8 text-center bg-gradient-to-b from-white to-slate-50">
          <div className="w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rose-200 transform rotate-3">
            <Baby className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Jornada da Gestante</h1>
          <p className="text-slate-500 text-sm mt-1">Seu diário completo de saúde e bem-estar.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-4 pt-4">

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">Seu Nome ou Login</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: Maria Silva"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all text-sm"
            />
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
              w-full py-3 rounded-xl font-bold text-white shadow-lg shadow-rose-200 hover:shadow-rose-300 transition-all flex items-center justify-center gap-2 bg-rose-600
              ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'}
            `}
          >
            {loading ? 'Entrando...' : (
              <>
                Acessar meu Diário <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="pt-4 border-t border-slate-50 mt-2 text-center">
            <p className="text-xs text-slate-500 mb-3">Ainda não tem cadastro?</p>
            <button
              type="button"
              onClick={onRegisterClick}
              className="text-sm font-bold text-rose-600 hover:text-rose-700 hover:underline transition-all"
            >
              Criar minha conta grátis
            </button>
          </div>

          <p className="text-center text-[10px] text-slate-300 mt-6">
            Login demo: <strong>{MOCK_CREDENTIALS.PATIENT_1.login}</strong> / <strong>123</strong>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;