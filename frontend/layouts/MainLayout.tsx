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
    const { currentUser, logout, pregnancyData, alerts } = useData();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    const unreadAlerts = alerts.filter(a => !a.read).length;
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
                        ? 'bg-rose-500 text-white shadow-md shadow-rose-200'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}
        `}
            >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
                {badge && badge > 0 && (
                    <span className="absolute right-3 top-3 bg-teal-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {badge}
                    </span>
                )}
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 flex overflow-hidden relative">

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar Navigation */}
            <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-100 transform transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <div className="h-full flex flex-col p-6">
                    <div className="flex items-center gap-3 mb-10 px-2">
                        <div className="w-10 h-10 bg-rose-500 rounded-lg flex items-center justify-center shadow-lg shadow-rose-200">
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
                        <NavItem to="/community" icon={Users} label="Comunidade" />

                        <div className="my-4 border-t border-slate-100"></div>

                        <NavItem to="/setup" icon={Settings} label="Meus Dados Clínicos" />
                        <NavItem to="/notifications" icon={Bell} label="Notificações" badge={unreadAlerts} />
                    </nav>

                    <div className="pt-6 border-t border-slate-100 mt-6">
                        <div className="bg-slate-50 p-4 rounded-xl flex items-center gap-3 mb-4">
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
                {/* Header */}
                <header className="bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-4 lg:hidden">
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg">
                            {isSidebarOpen ? <X /> : <Menu />}
                        </button>
                        <span className="font-bold text-slate-800">Jornada</span>
                    </div>

                    <div className="flex-1 flex justify-end items-center gap-4">
                        <div className="text-sm text-slate-500 pl-4 border-l border-slate-200">
                            Semana atual: <span className="font-bold text-rose-500">{currentWeek}</span>
                        </div>
                    </div>
                </header>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-slate-50/50">
                    <div className="max-w-6xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};
