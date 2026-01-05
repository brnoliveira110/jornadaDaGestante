import React, { useState } from 'react';
import {
    LayoutDashboard,
    CalendarClock,
    FileText,
    TestTube,
    Users,
    LogOut,
    Menu,
    X,
    Bell,
    Syringe,
    TrendingUp,
    Lightbulb,
    Settings,
    Baby
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { Link, useLocation } from 'react-router-dom';
import { calculateGestationalAge } from '../utils';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser, logout, pregnancyData } = useData();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
    const location = useLocation();

    React.useEffect(() => {
        if (pregnancyData?.theme) {
            document.documentElement.setAttribute('data-theme', pregnancyData.theme);
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }, [pregnancyData?.theme]);


    const currentWeek = pregnancyData?.dum ? calculateGestationalAge(pregnancyData.dum) : 0;

    if (!currentUser) return <>{children}</>;

    const NavItem = ({ to, icon: Icon, label, badge }: { to: string; icon: any; label: string, badge?: number }) => {
        const isActive = location.pathname === to;
        return (
            <Link
                to={to}
                onClick={() => setIsSidebarOpen(false)}
                className={`
            w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm relative
            ${isActive
                        ? 'bg-primary-500 text-white shadow-md shadow-primary-200'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}
        `}
            >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
                {badge && badge > 0 && (
                    <span className="absolute right-3 top-3 bg-secondary-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {badge}
                    </span>
                )}
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-primary-50 flex overflow-hidden relative">

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar Navigation - Always Neutral Pastel */}
            <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#fff8e7] border-r border-[#ffeebb] transform transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <div className="h-full flex flex-col p-6">
                    <div className="flex items-center gap-3 mb-10 px-2">
                        <div className="w-10 h-10 bg-amber-400 rounded-lg flex items-center justify-center shadow-lg shadow-amber-100">
                            <Baby className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="font-bold text-slate-800 text-lg leading-tight">Jornada<br />da Gestante</h1>
                        </div>
                    </div>

                    <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2">
                        <div className="px-4 text-xs font-bold text-slate-400 uppercase mb-2">
                            Menu Principal
                        </div>

                        <NavItem to="/" icon={LayoutDashboard} label="Visão Geral" />
                        <NavItem to="/timeline" icon={CalendarClock} label="Linha do Tempo" />
                        <NavItem to="/medical-records" icon={FileText} label="Meu Diário" />
                        <NavItem to="/exams" icon={TestTube} label="Meus Exames" />
                        <NavItem to="/vaccines" icon={Syringe} label="Minhas Vacinas" />
                        <NavItem to="/nutritional-curve" icon={TrendingUp} label="Curva de Peso" />
                        <NavItem to="/tips" icon={Lightbulb} label="Dicas & Bem-estar" />

                        <div className="my-4 border-t border-[#ffeebb]"></div>

                        <NavItem to="/setup" icon={Settings} label="Meus Dados Clínicos" />
                    </nav>

                    <div className="pt-6 border-t border-[#ffeebb] mt-6">
                        <div className="bg-white/60 p-4 rounded-xl flex items-center gap-3 mb-4">
                            <img src={currentUser.avatarUrl} alt="User" className="w-10 h-10 rounded-full object-cover" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 truncate">{currentUser.name}</p>
                                <p className="text-xs text-slate-500 truncate">
                                    Gestante
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={logout}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Sair
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header - Always Neutral Pastel */}
                <header className="bg-[#fff8e7] border-b border-[#ffeebb] px-8 py-4 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-4 lg:hidden">
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600 hover:bg-white rounded-lg">
                            {isSidebarOpen ? <X /> : <Menu />}
                        </button>
                        <span className="font-bold text-slate-800">Jornada</span>
                    </div>

                    <div className="flex-1 flex justify-end items-center gap-6">
                        {/* BMI Calculator Widget */}
                        {/* BMI Calculator Button */}
                        <button
                            onClick={() => setIsCalculatorOpen(true)}
                            className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/60 hover:bg-white text-slate-600 rounded-lg border border-neutral-200 transition-colors text-xs font-bold uppercase"
                        >
                            <TrendingUp className="w-4 h-4" />
                            Calc. IMC
                        </button>

                        <div className="text-sm text-slate-500 pl-4 border-l border-neutral-200">
                            Semana atual: <span className="font-bold text-primary-600">{currentWeek}</span>
                        </div>
                    </div>
                </header>

                {/* Scrollable Content - Dynamic Theme Pastel */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-primary-50">
                    <div className="max-w-6xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
            {/* BMI Calculator Modal */}
            {isCalculatorOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95">
                        <div className="bg-primary-50 px-6 py-4 border-b border-primary-100 flex items-center justify-between">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-primary-600" />
                                Calculadora de IMC
                            </h3>
                            <button onClick={() => setIsCalculatorOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Peso (kg)</label>
                                    <input
                                        type="number"
                                        id="modal-bmi-weight"
                                        placeholder="0.0"
                                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-lg"
                                        onChange={() => {
                                            const wInput = document.getElementById('modal-bmi-weight') as HTMLInputElement;
                                            const hInput = document.getElementById('modal-bmi-height') as HTMLInputElement;
                                            const result = document.getElementById('modal-bmi-result');
                                            const status = document.getElementById('modal-bmi-status');

                                            const w = parseFloat(wInput?.value || '0');
                                            const h = parseFloat(hInput?.value || '0');

                                            if (w > 0 && h > 0 && result && status) {
                                                const bmi = w / (h * h);
                                                result.innerText = bmi.toFixed(1);

                                                let text = '';
                                                let color = '';
                                                if (bmi < 18.5) { text = 'Abaixo do peso'; color = 'text-blue-500'; }
                                                else if (bmi < 24.9) { text = 'Peso normal'; color = 'text-green-500'; }
                                                else if (bmi < 29.9) { text = 'Sobrepeso'; color = 'text-amber-500'; }
                                                else { text = 'Obesidade'; color = 'text-red-500'; }

                                                status.innerText = text;
                                                status.className = `text-sm font-bold ${color}`;
                                            } else if (result && status) {
                                                result.innerText = '--';
                                                status.innerText = 'Aguardando dados...';
                                                status.className = 'text-sm text-slate-400';
                                            }
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Altura (m)</label>
                                    <input
                                        type="number"
                                        id="modal-bmi-height"
                                        placeholder="0.00"
                                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-lg"
                                        onChange={() => {
                                            const wInput = document.getElementById('modal-bmi-weight') as HTMLInputElement;
                                            const hInput = document.getElementById('modal-bmi-height') as HTMLInputElement;
                                            const result = document.getElementById('modal-bmi-result');
                                            const status = document.getElementById('modal-bmi-status');

                                            const w = parseFloat(wInput?.value || '0');
                                            const h = parseFloat(hInput?.value || '0');

                                            if (w > 0 && h > 0 && result && status) {
                                                const bmi = w / (h * h);
                                                result.innerText = bmi.toFixed(1);

                                                let text = '';
                                                let color = '';
                                                if (bmi < 18.5) { text = 'Abaixo do peso'; color = 'text-blue-500'; }
                                                else if (bmi < 24.9) { text = 'Peso normal'; color = 'text-green-500'; }
                                                else if (bmi < 29.9) { text = 'Sobrepeso'; color = 'text-amber-500'; }
                                                else { text = 'Obesidade'; color = 'text-red-500'; }

                                                status.innerText = text;
                                                status.className = `text-sm font-bold ${color}`;
                                            } else if (result && status) {
                                                result.innerText = '--';
                                                status.innerText = 'Aguardando dados...';
                                                status.className = 'text-sm text-slate-400';
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-4 flex flex-col items-center justify-center border border-slate-100">
                                <span className="text-xs text-slate-500 uppercase font-bold mb-1">Seu IMC</span>
                                <span id="modal-bmi-result" className="text-4xl font-extrabold text-slate-800">--</span>
                                <span id="modal-bmi-status" className="text-sm text-slate-400 mt-1">Aguardando dados...</span>
                            </div>

                            <p className="text-[10px] text-center text-slate-400 leading-tight">
                                * O cálculo de IMC é apenas uma referência. Consulte sempre seu obstetra para avaliação adequada do ganho de peso na gestação.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
