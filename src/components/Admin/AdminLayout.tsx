import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Settings, 
  MessageSquare, 
  Map as MapIcon, 
  LogOut, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../services/authService';

export default function AdminLayout() {
  const { logout } = useAuth();

  return (
    <div className="flex h-screen bg-gray-50 w-full overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 bg-black text-white p-10 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tighter leading-none">Admin Node</h1>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mt-2">Super Control</p>
            </div>
          </div>

          <nav className="space-y-2">
            <NavItem to="/admin" icon={LayoutDashboard} label="Overview" end />
            <NavItem to="/admin/complaints" icon={MessageSquare} label="Complaints" />
            <NavItem to="/admin/categories" icon={Settings} label="Categories" />
            <NavItem to="/admin/mappings" icon={MapIcon} label="Location Mapping" />
          </nav>
        </div>

        <div className="space-y-6">
          <Link to="/" className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/5">
            <div className="text-left flex-1">
              <span className="block text-xs font-bold text-white tracking-tight">Switch to User View</span>
              <span className="block text-[8px] font-bold text-white/30 uppercase tracking-widest mt-0.5">Citizen Portal</span>
            </div>
            <ChevronRight className="w-4 h-4 text-white/40" />
          </Link>
          
          <button 
            onClick={() => logout()}
            className="w-full flex items-center gap-3 p-4 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold tracking-tight">Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative rounded-l-[4rem] bg-white shadow-2xl border-l border-gray-100">
        <Outlet />
      </main>
    </div>
  );
}

function NavItem({ to, icon: Icon, label, end = false }: { to: string; icon: any; label: string; end?: boolean }) {
  return (
    <NavLink 
      to={to} 
      end={end}
      className={({ isActive }) => cn(
        "flex items-center gap-4 p-5 rounded-[1.5rem] transition-all group",
        isActive 
          ? "bg-white text-black shadow-2xl shadow-black/20" 
          : "text-white/50 hover:bg-white/5 hover:text-white"
      )}
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm font-bold tracking-tight">{label}</span>
      <ChevronRight className={cn(
        "w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all",
        "translate-x-0 group-hover:translate-x-1"
      )} />
    </NavLink>
  );
}
