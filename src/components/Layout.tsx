import React from 'react';
import { Outlet, NavLink, useLocation as useRouterLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  History, 
  TrendingUp,
  User, 
  MapPin, 
  Bell,
  Navigation
} from 'lucide-react';
import { useLocation } from '../hooks/useLocation';
import { cn } from '../lib/utils';
import NotificationCenter from './NotificationCenter';

export default function Layout() {
  const { location } = useLocation();
  const routerLocation = useRouterLocation();

  return (
    <div className="flex flex-col h-screen bg-white max-w-md mx-auto relative shadow-2xl overflow-hidden border-x border-gray-100">
      {/* Header with GPS */}
      <header className="px-8 py-6 bg-white flex items-center justify-between z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">
            <MapPin className="w-3 h-3 text-blue-500" />
            Live Region
          </div>
          <h2 className="text-lg font-bold text-black tracking-tighter">
            {location?.city || 'Detecting...'}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <NotificationCenter />
          <div className="w-10 h-10 bg-black rounded-2xl flex items-center justify-center text-white shadow-lg shadow-black/20">
            <Navigation className="w-6 h-6" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative bg-gray-50">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="px-8 py-6 border-t border-gray-100 bg-white/90 backdrop-blur-xl flex justify-between items-center z-10">
        <NavLink 
          to="/" 
          className={({ isActive }) => cn(
            "flex flex-col items-center gap-1 p-3 rounded-[1.5rem] transition-all",
            isActive ? "bg-black text-white shadow-2xl shadow-black/40 scale-110" : "text-gray-300 hover:text-black"
          )}
        >
          <LayoutDashboard className="w-6 h-6" />
        </NavLink>
        <NavLink 
          to="/history" 
          className={({ isActive }) => cn(
            "flex flex-col items-center gap-1 p-3 rounded-[1.5rem] transition-all",
            isActive ? "bg-black text-white shadow-2xl shadow-black/40 scale-110" : "text-gray-300 hover:text-black"
          )}
        >
          <History className="w-6 h-6" />
        </NavLink>
        <NavLink 
          to="/trends" 
          className={({ isActive }) => cn(
            "flex flex-col items-center gap-1 p-3 rounded-[1.5rem] transition-all",
            isActive ? "bg-black text-white shadow-2xl shadow-black/40 scale-110" : "text-gray-300 hover:text-black"
          )}
        >
          <TrendingUp className="w-6 h-6" />
        </NavLink>
        <NavLink 
          to="/profile" 
          className={({ isActive }) => cn(
            "flex flex-col items-center gap-1 p-3 rounded-[1.5rem] transition-all",
            isActive ? "bg-black text-white shadow-2xl shadow-black/40 scale-110" : "text-gray-300 hover:text-black"
          )}
        >
          <User className="w-6 h-6" />
        </NavLink>
      </nav>
    </div>
  );
}
