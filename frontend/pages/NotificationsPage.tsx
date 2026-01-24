import React from 'react';
import { useData } from '../context/DataContext';
import { Bell, Check, AlertTriangle, Info, CheckCircle, Clock } from 'lucide-react';

interface AlertsProps {
  fullPage?: boolean;
}

const Alerts: React.FC<AlertsProps> = ({ fullPage = false }) => {
  const { alerts, markAlertRead, requestNotificationPermission } = useData();
  const unreadCount = alerts.filter(a => !a.read).length;

  if (alerts.length === 0 && !fullPage) return null;

  return (
    <div className={`animate-in slide-in-from-top-4 duration-500 ${fullPage ? 'h-full' : 'mb-8'}`}>

      {!fullPage && (
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bell className="w-5 h-5 text-slate-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-slate-50"></span>
              )}
            </div>
            <h3 className="text-lg font-bold text-slate-800">Alertas e Notificações</h3>
          </div>
          <button onClick={requestNotificationPermission} className="text-xs font-bold text-teal-600 hover:text-teal-700 bg-teal-50 px-3 py-1 rounded-full transition-colors">
            Ativar Alertas
          </button>
        </div>
      )}

      {alerts.length === 0 && fullPage && (
        <div className="text-center p-12 text-slate-400 bg-white rounded-2xl border border-slate-100">
          <Bell className="w-12 h-12 mx-auto mb-4 text-slate-200" />
          <p>Você não tem nenhuma notificação no momento.</p>
        </div>
      )}

      <div className={`grid gap-4 ${fullPage ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`
              relative p-4 rounded-xl border flex items-start gap-3 transition-all
              ${alert.read ? 'bg-white border-slate-100 opacity-60' : 'bg-white border-slate-200 shadow-sm'}
              ${alert.type === 'WARNING' && !alert.read ? 'border-l-4 border-l-amber-500' : ''}
              ${alert.type === 'INFO' && !alert.read ? 'border-l-4 border-l-blue-500' : ''}
              ${alert.type === 'SUCCESS' && !alert.read ? 'border-l-4 border-l-green-500' : ''}
            `}
          >
            <div className="mt-0.5">
              {alert.type === 'WARNING' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
              {alert.type === 'INFO' && <Info className="w-5 h-5 text-blue-500" />}
              {alert.type === 'SUCCESS' && <CheckCircle className="w-5 h-5 text-green-500" />}
            </div>

            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className={`text-sm font-bold ${alert.read ? 'text-slate-500' : 'text-slate-800'}`}>
                  {alert.title}
                </h4>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {new Date(alert.date).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {alert.message}
              </p>
            </div>

            {!alert.read && (
              <button
                onClick={() => markAlertRead(alert.id)}
                className="text-slate-400 hover:text-teal-600 transition-colors p-1"
                title="Marcar como lida"
              >
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Alerts;