import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Check, ArrowRight, Navigation } from 'lucide-react';
import { useAuth } from '../services/authService';
import { createUserProfile } from '../services/dbService';

export default function Onboarding() {
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await createUserProfile(user.uid, {
        displayName: name || user.displayName || 'User',
        phoneNumber: phone,
        onboarded: true
      });
      await refreshProfile();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8 flex flex-col items-center justify-center space-y-12 max-w-md mx-auto">
      <div className="w-full space-y-4">
        <div className="flex gap-2 mb-8">
           {[1,2,3].map(i => (
             <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? "bg-black" : "bg-gray-100"}`} />
           ))}
        </div>

        {step === 1 && (
           <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
           >
             <div className="space-y-2">
               <h1 className="text-3xl font-bold tracking-tight">How should we call you?</h1>
               <p className="text-gray-500">Government services use official names for tracking resolutions.</p>
             </div>
             <div className="relative">
               <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
               <input 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full h-14 pl-12 pr-4 bg-gray-50 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-black outline-none"
               />
             </div>
             <button 
              onClick={() => name.length > 2 && setStep(2)}
              disabled={name.length < 3}
              className="w-full h-14 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
             >
               Next <ArrowRight className="w-5 h-5" />
             </button>
           </motion.div>
        )}

        {step === 2 && (
           <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
           >
             <div className="space-y-2">
               <h1 className="text-3xl font-bold tracking-tight">Contact Number</h1>
               <p className="text-gray-500">Required for department callbacks regarding your reports.</p>
             </div>
             <div className="relative">
               <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
               <input 
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 Mobile Number"
                className="w-full h-14 pl-12 pr-4 bg-gray-50 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-black outline-none"
               />
             </div>
             <button 
              onClick={() => phone.length >= 10 && setStep(3)}
              disabled={phone.length < 10}
              className="w-full h-14 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
             >
               Next <ArrowRight className="w-5 h-5" />
             </button>
           </motion.div>
        )}

        {step === 3 && (
           <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8 text-center"
           >
             <div className="w-24 h-24 bg-green-50 rounded-[2rem] flex items-center justify-center mx-auto text-green-500 border-2 border-dashed border-green-200">
               <Navigation className="w-12 h-12" />
             </div>
             <div className="space-y-2">
               <h1 className="text-3xl font-bold tracking-tight">Access Location</h1>
               <p className="text-gray-500">RouteAssist uses your GPS to find the nearest local authority in Karnataka.</p>
             </div>
             <button 
              onClick={handleComplete}
              disabled={loading}
              className="w-full h-16 bg-black text-white rounded-[2rem] font-bold flex items-center justify-center gap-2 shadow-2xl shadow-black/20"
             >
               {loading ? "Finishing..." : "Continue to Dashboard"}
             </button>
           </motion.div>
        )}
      </div>
    </div>
  );
}
