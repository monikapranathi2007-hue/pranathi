import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Info, CheckCircle, AlertTriangle, Trash2 } from 'lucide-react';
import { useAuth } from '../services/authService';
import { subscribeToNotifications, markNotificationAsRead, AppNotification } from '../services/dbService';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export default function NotificationCenter() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToNotifications(user.uid, (notifs) => {
      setNotifications(notifs);
    });
    return () => unsubscribe();
  }, [user]);

  const handleRead = async (id: string) => {
    await markNotificationAsRead(id);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/5 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-4 w-[320px] md:w-[400px] bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 z-50 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">Nodal Alerts</h3>
                <button onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-black">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-[400px] overflow-y-auto px-2 py-4 scrollbar-hide">
                {notifications.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <p className="text-sm font-bold text-gray-300">Quiet at the node</p>
                    <p className="text-[10px] text-gray-200 uppercase tracking-widest">No recent broadcasts</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id}
                      onClick={() => !n.read && handleRead(n.id)}
                      className={cn(
                        "p-6 rounded-[2rem] mb-2 flex gap-4 transition-all cursor-pointer",
                        n.read ? "opacity-60" : "bg-gray-50 shadow-sm border border-gray-100"
                      )}
                    >
                      <div className="pt-1">{getIcon(n.type)}</div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold tracking-tight">{n.title}</p>
                        <p className="text-[11px] text-gray-500 leading-relaxed">{n.message}</p>
                        <p className="text-[8px] font-bold text-gray-300 uppercase tracking-widest pt-1">
                          {n.createdAt?.toDate ? format(n.createdAt.toDate(), 'HH:mm • dd MMM') : 'Just now'}
                        </p>
                      </div>
                      {!n.read && (
                        <div className="ml-auto flex items-start pt-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
