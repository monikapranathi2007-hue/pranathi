import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../services/authService';
import { Navigation, Loader2 } from 'lucide-react';

export default function Auth() {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 space-y-12">
      <div className="flex flex-col items-center space-y-4">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 bg-black text-white rounded-[2rem] flex items-center justify-center shadow-2xl"
        >
          <Navigation className="w-10 h-10" />
        </motion.div>
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">RouteAssist</h1>
          <p className="text-gray-500 font-medium tracking-wide">Civic Problem Routing for Karnataka</p>
        </div>
      </div>

      <div className="w-full max-w-sm bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Welcome back</h2>
          <p className="text-sm text-gray-500">Sign in to report and track issues near you.</p>
        </div>

        <button 
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full h-14 bg-white border border-gray-200 rounded-2xl flex items-center justify-center gap-3 font-semibold hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
            <>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
              Continue with Google
            </>
          )}
        </button>

        <div className="relative flex items-center gap-4 py-2">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-[10px] uppercase font-bold text-gray-300 tracking-[0.2em]">Regional Portal</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <p className="text-[10px] text-center text-gray-400 uppercase tracking-widest leading-loose">
          By continuing, you agree to local data usage for emergency & civic routing purposes.
        </p>
      </div>
    </div>
  );
}
