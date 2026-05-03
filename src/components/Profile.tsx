import React, { useState, useEffect } from 'react';
import { LogOut, User as UserIcon, Shield, Bell, Phone, HelpCircle, ChevronRight, Save, X, Edit2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../services/authService';
import { Link } from 'react-router-dom';
import { createUserProfile } from '../services/dbService';
import { cn } from '../lib/utils';

export default function Profile() {
  const { user, profile, logout, refreshProfile, isAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.displayName || '');
      setPhone(profile.phoneNumber || '');
    }
  }, [profile, isEditing]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await createUserProfile(user.uid, {
        displayName: name,
        phoneNumber: phone
      });
      await refreshProfile();
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pb-24 overflow-y-auto h-full space-y-12">
      {/* Cinematic Profile Header */}
      <div className="relative h-64 w-full overflow-hidden rounded-b-[4.5rem] shadow-2xl">
        <img 
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2669&auto=format&fit=crop" 
          alt="Office space"
          className="w-full h-full object-cover grayscale opacity-40 scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          <div className="relative">
            <div className="w-40 h-40 bg-white rounded-[3.5rem] flex items-center justify-center text-5xl font-bold shadow-2xl border-8 border-[#f9fafb] overflow-hidden uppercase tracking-tighter text-black">
               {profile?.displayName?.[0] || user?.email?.[0] || '?'}
            </div>
            <div className="absolute bottom-2 right-2 w-12 h-12 bg-black border-4 border-white rounded-full flex items-center justify-center shadow-xl">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-12 px-8 flex flex-col items-center text-center space-y-12">
        <div className="w-full">
          {isEditing ? (
            <div className="bg-white p-8 rounded-[3.5rem] border border-gray-100 shadow-2xl space-y-6 text-left">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] px-2">Operator Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-14 px-6 rounded-[1.5rem] bg-gray-50 border border-gray-100 focus:border-black focus:ring-0 transition-all font-bold text-lg outline-none"
                  placeholder="Sync name..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] px-2">Phone Uplink</label>
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-14 px-6 rounded-[1.5rem] bg-gray-50 border border-gray-100 focus:border-black focus:ring-0 transition-all font-bold text-lg outline-none"
                  placeholder="+91..."
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 h-14 bg-black text-white rounded-[1.2rem] font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-2xl shadow-black/20 active:scale-95 transition-all"
                >
                  {saving ? 'UPDATING...' : <><Save className="w-4 h-4" /> COMMIT CHANGES</>}
                </button>
                <button 
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                  className="w-14 h-14 bg-gray-100 text-gray-400 rounded-[1.2rem] flex items-center justify-center border border-gray-200 active:scale-95 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-3 group">
                <h2 className="text-4xl font-bold tracking-tight text-black">{profile?.displayName || 'Citizen Auth'}</h2>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-gray-300 hover:text-black hover:bg-gray-100 rounded-xl transition-all"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm font-bold text-gray-400 tracking-tighter opacity-60 uppercase">{user?.email}</p>
            </div>
          )}
        </div>

        <div className="w-full grid grid-cols-1 gap-3">
           {isAdmin && (
             <Link 
              to="/admin"
              className="w-full flex items-center justify-between p-7 bg-black text-white rounded-[2.5rem] border border-black shadow-xl hover:scale-[1.02] transition-all group"
             >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <span className="block text-sm font-bold tracking-tight">Admin Intelligence</span>
                    <span className="block text-[10px] font-medium text-white/40 uppercase tracking-widest">Nodal Management System</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/40 group-hover:translate-x-1 transition-transform" />
             </Link>
           )}
           {[
             { icon: UserIcon, label: 'Identity Matrix', color: 'text-black', sub: 'Personal data & biometrics' },
             { icon: Shield, label: 'Secure Protocols', color: 'text-black', sub: 'Privacy & encryption' },
             { icon: Bell, label: 'Signal Feed', color: 'text-black', sub: 'Notification preferences' },
           ].map((item, idx) => (
             <button 
               key={idx}
               className="w-full flex items-center justify-between p-7 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:border-black transition-all group"
             >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-black group-hover:text-white transition-colors">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <span className="block text-sm font-bold text-black tracking-tight">{item.label}</span>
                    <span className="block text-[10px] font-medium text-gray-400 uppercase tracking-widest">{item.sub}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:translate-x-1 transition-transform" />
             </button>
           ))}
        </div>

        <div className="w-full pt-8">
           <button 
             onClick={() => logout()}
             className="w-full h-20 rounded-[2.5rem] bg-red-50 text-red-600 font-bold border border-red-100 flex items-center justify-between px-10 hover:bg-red-600 hover:text-white transition-all group shadow-xl shadow-red-500/5"
           >
             <div className="flex items-center gap-4">
                <LogOut className="w-6 h-6" />
                <span className="text-lg">Terminate Session</span>
             </div>
             <ChevronRight className="w-6 h-6 opacity-30 group-hover:translate-x-1 transition-transform" />
           </button>
        </div>
      </div>

      {message && (
        <div className={cn(
          "p-4 rounded-2xl flex items-center gap-3 text-xs font-bold border",
          message.type === 'success' ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-700 border-red-100"
        )}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] px-2 mb-2">Account Settings</h3>
        <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
           {[
             { icon: UserIcon, label: 'Personal Information', color: 'text-blue-500', onClick: () => setIsEditing(true) },
             { icon: Shield, label: 'Privacy & Security', color: 'text-gray-500' },
             { icon: Bell, label: 'Notifications', color: 'text-orange-500' },
             { icon: Phone, label: 'Emergency Contacts', color: 'text-red-500' }
           ].map((item, idx) => (
             <button 
               key={idx} 
               onClick={item.onClick}
               className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-all border-b border-gray-50 last:border-0 group"
             >
                <div className="flex items-center gap-4">
                  <div className={cn("p-2 rounded-xl bg-gray-50", item.color.replace('text-', 'bg-').replace('-500', '-50'))}>
                    <item.icon className={cn("w-4 h-4", item.color)} />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:translate-x-1 transition-transform" />
             </button>
           ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
           <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] px-2 mb-2">Support & Feedback</h3>
           <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
              <button className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-all group border-b border-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-xl bg-purple-50">
                      <HelpCircle className="w-4 h-4 text-purple-500" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Help Center</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:translate-x-1 transition-transform" />
               </button>
               <button 
                onClick={() => logout()}
                className="w-full flex items-center justify-between p-5 hover:bg-red-50/50 transition-all group group"
              >
                  <div className="flex items-center gap-4 text-red-500">
                    <div className="p-2 rounded-xl bg-red-50">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold">Log Out</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-red-200 group-hover:translate-x-1 transition-transform text-red-300" />
               </button>
           </div>
        </div>
      </div>

      <div className="text-center pt-8 opacity-40">
        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-[0.4em]">RouteAssist • Version 2.5.0</p>
      </div>
    </div>
  );
}
