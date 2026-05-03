import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  Type as TextIcon, 
  Send, 
  X, 
  Navigation, 
  Phone, 
  MapPin, 
  Globe, 
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Volume2,
  LifeBuoy,
  ChevronRight
} from 'lucide-react';
import { analyzeProblem, RoutingResult } from '../services/geminiService';
import { saveQuery } from '../services/dbService';
import { useAuth } from '../services/authService';
import { useLocation } from '../hooks/useLocation';
import { cn } from '../lib/utils';

export default function Dashboard() {
  const { user } = useAuth();
  const { location } = useLocation();
  const [mode, setMode] = useState<'text' | 'voice'>('text');
  const [language, setLanguage] = useState('English');
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RoutingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSOS, setShowSOS] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [urgencyRules, setUrgencyRules] = useState<{ keyword: string, urgency: string }[]>([]);
  
  useEffect(() => {
    // Fetch categories and urgency rules for context
    import('../services/dbService').then(m => {
      m.getCategories().then(cats => setCategories(cats.map(c => c.name)));
      m.getUrgencyRules().then(rules => setUrgencyRules(rules.map(r => ({ keyword: r.keyword, urgency: r.urgency }))));
    });
  }, []);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef(input);

  useEffect(() => {
    inputRef.current = input;
  }, [input]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-IN';

      recognitionRef.current.onstart = () => {
        setIsRecording(true);
        setError(null);
      };

      recognitionRef.current.onerror = (event: any) => {
        setIsRecording(false);
        if (event.error === 'not-allowed') {
          setError('Microphone access denied. Please enable it in browser settings.');
        } else {
          setError('Speech recognition error: ' + event.error);
        }
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => (result as any).transcript)
          .join('');
        setInput(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
        const finalInput = inputRef.current;
        if (finalInput.trim()) {
           handleAnalyze(finalInput);
        }
      };
    } else {
      setError('Your browser does not support voice features. Please use Chrome.');
    }
  }, []); // Only initialize once

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      setError('Voice features not supported on this browser.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setInput('');
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Recognition start error:', err);
        setError('Could not start microphone. Try again.');
      }
    }
  };

  const handleAnalyze = async (text: string) => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await analyzeProblem(text, language, categories, urgencyRules);
      setResult(res);
      if (user) {
        await saveQuery(user.uid, text, mode, res, location);
      }

      // Voice response if in voice mode
      if (mode === 'voice') {
        const utterance = new SpeechSynthesisUtterance(`I've routed your issue to ${res.department}. ${res.analysis}`);
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      setError('Failed to analyze. Please try speaking clearly or typing the issue.');
    } finally {
      setLoading(false);
    }
  };

  const emergencyContacts = [
    { name: 'Emerency (Global)', number: '112', bg: 'bg-red-500' },
    { name: 'Police', number: '100', bg: 'bg-blue-600' },
    { name: 'Ambulance', number: '108', bg: 'bg-green-600' },
    { name: 'Fire Force', number: '101', bg: 'bg-orange-600' }
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden relative">
      <AnimatePresence>
         {isOffline && (
           <motion.div 
             initial={{ y: -50, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             exit={{ y: -50, opacity: 0 }}
             className="absolute top-0 left-0 right-0 z-[60] bg-orange-500 text-white py-1 px-4 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
           >
             <AlertTriangle className="w-3 h-3" /> Offline Mode Active
           </motion.div>
         )}
      </AnimatePresence>

      {/* Floating SOS Toggle */}
      <button 
        onClick={() => setShowSOS(true)}
        className="fixed top-6 right-6 z-50 w-14 h-14 bg-red-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-red-500/40 hover:scale-110 active:scale-95 transition-all animate-pulse"
      >
         <AlertTriangle className="w-7 h-7" />
      </button>

      <AnimatePresence>
         {showSOS && (
           <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 p-8 flex flex-col items-center justify-center space-y-12 backdrop-blur-xl"
           >
              <button 
                onClick={() => setShowSOS(false)}
                className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors"
              >
                <X className="w-8 h-8" />
              </button>

              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-red-500 rounded-full mx-auto flex items-center justify-center animate-ping absolute opacity-50 blur-xl" />
                <div className="w-24 h-24 bg-red-500 rounded-full mx-auto flex items-center justify-center relative">
                  <Phone className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-white tracking-tighter">One-Tap Emergency</h1>
                <p className="text-white/40 font-medium">Safe Mode Active • Karnataka Helpline</p>
              </div>

              <div className="w-full max-w-md grid grid-cols-1 gap-4">
                {emergencyContacts.map((contact) => (
                  <a 
                    key={contact.number}
                    href={`tel:${contact.number}`}
                    className={cn(
                      "w-full h-20 rounded-[2rem] flex items-center justify-between px-8 text-white font-bold text-xl shadow-xl transition-all active:scale-95",
                      contact.bg
                    )}
                  >
                    <span>{contact.name}</span>
                    <span className="text-2xl">{contact.number}</span>
                  </a>
                ))}
              </div>
           </motion.div>
         )}
      </AnimatePresence>

      {/* Mode & Language Toggle */}
      <div className="px-8 flex flex-col items-center gap-4 py-4">
        <div className="bg-gray-100/50 p-1 rounded-[1.5rem] flex gap-1 w-full max-w-[280px]">
          <button 
            onClick={() => { setMode('text'); setResult(null); }}
            className={cn(
              "flex-1 py-3 rounded-[1.2rem] text-xs font-bold flex items-center justify-center gap-2 transition-all",
              mode === 'text' ? "bg-white text-black shadow-sm" : "text-gray-400 hover:text-black"
            )}
          >
            <TextIcon className="w-4 h-4" /> TEXT
          </button>
          <button 
            onClick={() => { setMode('voice'); setResult(null); }}
            className={cn(
              "flex-1 py-3 rounded-[1.2rem] text-xs font-bold flex items-center justify-center gap-2 transition-all",
              mode === 'voice' ? "bg-white text-black shadow-sm" : "text-gray-400 hover:text-black"
            )}
          >
            <Mic className="w-4 h-4" /> VOICE
          </button>
        </div>

        <div className="flex gap-2 justify-center">
          {['English', 'ಕನ್ನಡ', 'हिन्दी'].map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-bold transition-all border",
                language === lang ? "bg-black text-white border-black" : "bg-white text-gray-400 border-gray-100 hover:border-gray-300"
              )}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div 
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="px-6 space-y-12">
                        {/* Hero Section */}
                        <div className="relative pt-10 text-center space-y-4">
                           <motion.div 
                             initial={{ scale: 0.9, opacity: 0 }}
                             animate={{ scale: 1, opacity: 1 }}
                             className="inline-block px-4 py-1 bg-black text-white rounded-full text-[10px] font-bold uppercase tracking-[0.4em] mb-4"
                           >
                             Civic Intelligence Node
                           </motion.div>
                           <h1 className="text-5xl md:text-6xl font-bold tracking-tighter text-black leading-tight">
                             Bridge the <span className="text-gray-300 italic">gap</span> between you & your city.
                           </h1>
                           <p className="text-sm font-medium text-gray-400 max-w-[280px] mx-auto tracking-tight">
                             Report utilities, infrastructure, or emergency issues directly to nodal offices.
                           </p>
                        </div>

                        {mode === 'text' ? (
                          <div className="w-full max-w-xl mx-auto space-y-10">
                            <div className="space-y-4">
                               <div className="flex items-center justify-between px-6">
                                 <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">Entry Command</h2>
                                 <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-500 uppercase">
                                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                  Ready
                                 </div>
                               </div>
                               <div className="relative group p-1 bg-gradient-to-br from-gray-100 to-white rounded-[3.5rem] shadow-2xl">
                                <textarea 
                                  value={input}
                                  onChange={(e) => setInput(e.target.value)}
                                  placeholder="Type your civic issue here..."
                                  className="w-full h-64 p-10 bg-white rounded-[3.2rem] focus:ring-0 outline-none resize-none text-xl font-medium transition-all placeholder:text-gray-200"
                                />
                                <button 
                                  onClick={() => handleAnalyze(input)}
                                  disabled={loading || !input.trim()}
                                  className="absolute bottom-10 right-10 w-20 h-20 bg-black text-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all disabled:opacity-30 shadow-2xl shadow-black/40"
                                >
                                  {loading ? <Loader2 className="animate-spin w-8 h-8" /> : <Send className="w-8 h-8" />}
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                              <div className="p-10 bg-white border border-gray-100 rounded-[3rem] shadow-sm space-y-3 relative group overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                   <Globe className="w-12 h-12" />
                                </div>
                                <div className="w-12 h-12 rounded-[1.2rem] bg-blue-50 flex items-center justify-center border border-blue-100">
                                  <Navigation className="w-6 h-6 text-blue-600 animate-pulse" />
                                </div>
                                <div>
                                  <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Live Node Track</p>
                                  <p className="text-md font-bold text-black tracking-tight">{location?.city || 'Resolving...'}</p>
                                  {location?.latitude && (
                                    <p className="text-[8px] font-mono text-gray-400 mt-1">
                                      {location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°E
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="p-10 bg-gray-50 border border-gray-100 rounded-[3rem] space-y-3 hover:bg-black hover:text-white transition-all cursor-crosshair">
                                <div className="w-12 h-12 rounded-[1.2rem] bg-white flex items-center justify-center border border-gray-100">
                                  <Smartphone className="w-6 h-6 text-black" />
                                </div>
                                <div>
                                  <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Protocol</p>
                                  <p className="text-md font-bold tracking-tight">AI Integrated</p>
                                  <p className="text-[8px] font-mono opacity-40 mt-1 uppercase">RouteAssist v4.2</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center space-y-16 py-20 px-8">
                     <div className="text-center space-y-4">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.6em] mb-4">Aural Interface Node</p>
                      <h2 className="text-6xl font-bold tracking-tighter text-black">Ready to <span className="italic text-gray-300 underline decoration-black/5">Listen.</span></h2>
                    </div>
                    
                    <div className="relative group">
                      {isRecording && (
                        <>
                          <motion.div 
                            animate={{ scale: [1, 2.8, 1], opacity: [0.2, 0, 0.2] }}
                            transition={{ repeat: Infinity, duration: 4 }}
                            className="absolute inset-0 bg-black rounded-[4rem] blur-3xl"
                          />
                          <motion.div 
                            animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }}
                            transition={{ repeat: Infinity, duration: 3, delay: 1 }}
                            className="absolute inset-0 bg-gray-200 rounded-[4rem] blur-2xl"
                          />
                        </>
                      )}
                      <button 
                        onClick={toggleRecording}
                        className={cn(
                          "relative w-72 h-72 rounded-[4rem] flex items-center justify-center shadow-3xl transition-all active:scale-95 border-[2rem]",
                          isRecording ? "bg-red-500 text-white border-red-500/10" : "bg-black text-white hover:bg-gray-900 border-black/5 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)]"
                        )}
                      >
                        {isRecording ? <X className="w-24 h-24 stroke-[1.5]" /> : <Mic className="w-24 h-24 stroke-[1.5]" />}
                      </button>
                    </div>
 
                    <div className="max-w-md text-center min-h-[100px] px-8">
                      <p className={cn("text-2xl font-bold transition-all tracking-tighter leading-tight", isRecording ? "text-black animate-pulse" : "text-gray-200 uppercase tracking-[0.2em] text-[10px]")}>
                        {input || (isRecording ? "Capturing Node Transmission..." : "TAP COMMAND TO INITIATE UPLINK")}
                      </p>
                    </div>
                  </div>
                )}

                {/* Live Location Visualizer */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mx-8 mt-12 bg-white rounded-[3.5rem] border border-gray-100 shadow-2xl overflow-hidden group"
                >
                  <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">Neural GPS Link</p>
                      <h3 className="text-xl font-bold tracking-tighter">Live Deployment Map</h3>
                    </div>
                    <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center">
                       <Navigation className="w-5 h-5 text-blue-500 animate-bounce" />
                    </div>
                  </div>
                  <div className="h-64 bg-gray-100 relative">
                     {location?.latitude ? (
                        <iframe 
                          width="100%" 
                          height="100%" 
                          frameBorder="0" 
                          style={{ border: 0 }}
                          src={`https://www.google.com/maps/embed/v1/view?key=${((import.meta as any).env).VITE_GOOGLE_MAPS_API_KEY || ''}&center=${location.latitude},${location.longitude}&zoom=15`}
                          allowFullScreen
                        ></iframe>
                     ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3">
                           <Loader2 className="w-8 h-8 text-gray-300 animate-spin" />
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Awaiting Satellite Uplink...</p>
                        </div>
                     )}
                     <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/80 backdrop-blur-md rounded-full text-white text-[8px] font-bold uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        Precise Coord Lock
                     </div>
                  </div>
                  <div className="p-6 bg-gray-50/50 flex items-center justify-between">
                     <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                       Accuracy: High • {location?.city || 'Karnataka'} Station
                     </p>
                     <div className="flex gap-1">
                        <div className="w-1 h-1 bg-blue-500 rounded-full" />
                        <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
                        <div className="w-1 h-1 bg-blue-500 rounded-full" />
                     </div>
                  </div>
                </motion.div>

                {/* Emergency SOS - One Tap */}
                <div className="py-12">
                   <button 
                     onClick={() => setShowSOS(true)}
                     className="w-full h-32 bg-red-600 rounded-[4rem] text-white flex items-center justify-between px-12 shadow-[0_40px_80px_-15px_rgba(220,38,38,0.4)] hover:scale-[1.02] active:scale-95 transition-all group border-8 border-red-500/20"
                   >
                      <div className="flex items-center gap-8">
                        <div className="w-20 h-20 bg-black/20 rounded-[2rem] flex items-center justify-center backdrop-blur-xl border border-white/10 shadow-inner">
                          <LifeBuoy className="w-10 h-10 animate-[spin_3s_linear_infinite] text-white" />
                        </div>
                        <div className="text-left">
                          <span className="block text-2xl font-bold tracking-tighter uppercase italic leading-none">Emergency Node</span>
                          <span className="text-[10px] font-bold text-white/50 tracking-[0.4em] mt-2 block">DIRECT AUTHORITIES UPLINK</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
                          <ChevronRight className="w-8 h-8" />
                        </div>
                        <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">TAP TO ENGAGE</span>
                      </div>
                   </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
               key="result"
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               className="max-w-2xl mx-auto space-y-6 pt-6 pb-12 px-6"
            >
              <div className="bg-white rounded-[3.5rem] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] border border-gray-100">
                {/* Header Section with Dynamic Image */}
                <div className="relative h-64 md:h-80 overflow-hidden">
                  <img 
                    src={
                      result.category.toLowerCase().includes('electricity') ? "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=2670&auto=format&fit=crop" :
                      result.category.toLowerCase().includes('water') ? "https://images.unsplash.com/photo-1471074454408-f7db62d99254?q=80&w=2573&auto=format&fit=crop" :
                      result.category.toLowerCase().includes('road') ? "https://images.unsplash.com/photo-1545143333-e18eacc894ad?q=80&w=2670&auto=format&fit=crop" :
                      result.category.toLowerCase().includes('health') ? "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=2670&auto=format&fit=crop" :
                      "https://images.unsplash.com/photo-1541829070764-84a7d30dee6d?q=80&w=2670&auto=format&fit=crop"
                    } 
                    alt="Civic Infrastructure"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-10 space-y-4">
                    <div className={cn(
                      "inline-block px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border shadow-lg backdrop-blur-md",
                      result.urgency === 'critical' || result.urgency === 'high' ? "bg-red-500/90 text-white border-red-400" : "bg-green-500/90 text-white border-green-400"
                    )}>
                      {result.urgency} Action Protocol
                    </div>
                    <div className="space-y-1">
                       <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em]">{result.category}</p>
                       <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tighter leading-none">
                        {result.department}
                      </h2>
                    </div>
                  </div>
                </div>

                {result.isFraud && (
                  <div className="mx-8 mt-8 p-6 bg-amber-50 border border-amber-100 rounded-[2rem] flex items-start gap-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-amber-900 leading-tight">Irregularity Detected</p>
                      <p className="text-xs text-amber-700 font-medium leading-relaxed">
                        {result.fraudReason || "This report has been flagged for administrative review to ensure system integrity."}
                      </p>
                    </div>
                  </div>
                )}

                {/* Analysis Insight */}
                <div className="p-8 md:p-10 space-y-10">
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                      <Volume2 className="w-4 h-4 text-black" />
                      AI Analysis & Context
                    </div>
                    
                    {(result.analysis.toLowerCase().includes('suspicious') || result.analysis.toLowerCase().includes('fraud')) && (
                      <div className="bg-orange-50 p-6 rounded-[2rem] border border-orange-100 flex gap-4 text-orange-800 mb-4">
                        <AlertTriangle className="w-6 h-6 shrink-0" />
                        <div className="space-y-1">
                          <p className="text-sm font-bold">Integrity Warning</p>
                          <p className="text-[11px] leading-relaxed opacity-80">This report has been flagged for verification. Intentionally false reporting is a punishable offense under civic laws.</p>
                        </div>
                      </div>
                    )}

                    <p className="text-xl text-gray-600 leading-relaxed font-medium italic">
                      "{result.analysis}"
                    </p>
                  </section>

                  {/* High Contrast Actions */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <button 
                      onClick={() => result.actions.phone && (window.location.href = `tel:${result.actions.phone}`)}
                      className="group flex flex-col items-center justify-center p-6 bg-gray-50 rounded-[2rem] border border-gray-100 hover:bg-black hover:text-white transition-all cursor-pointer"
                    >
                      <Phone className="w-6 h-6 mb-3 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Helpline</span>
                      <p className="text-[10px] opacity-60 font-semibold">{result.actions.phone || 'N/A'}</p>
                    </button>

                    <button 
                      onClick={() => result.actions.office && window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(result.actions.office)}`)}
                      className="group flex flex-col items-center justify-center p-6 bg-gray-50 rounded-[2rem] border border-gray-100 hover:bg-black hover:text-white transition-all cursor-pointer"
                    >
                      <MapPin className="w-6 h-6 mb-3 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Office</span>
                      <p className="text-[10px] opacity-60 font-semibold">Map View</p>
                    </button>

                    <button 
                      onClick={() => result.actions.website && window.open(result.actions.website)}
                      className="group flex flex-col items-center justify-center p-6 bg-gray-50 rounded-[2rem] border border-gray-100 hover:bg-black hover:text-white transition-all cursor-pointer"
                    >
                      <Globe className="w-6 h-6 mb-3 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Portal</span>
                      <p className="text-[10px] opacity-60 font-semibold">Official Web</p>
                    </button>

                    <button 
                      className="group flex flex-col items-center justify-center p-6 bg-gray-50 rounded-[2rem] border border-gray-100 hover:bg-black hover:text-white transition-all cursor-pointer"
                    >
                      <Smartphone className="w-6 h-6 mb-3 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Mobile</span>
                      <p className="text-[10px] opacity-60 font-semibold">{result.actions.app || 'N/A'}</p>
                    </button>
                  </div>

                  {/* Resolution Roadmap */}
                  <section className="space-y-6 pt-4">
                    <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                      <CheckCircle2 className="w-4 h-4 text-green-500" /> Resolution Roadmap
                    </h4>
                    <div className="relative space-y-8 pl-4 border-l-2 border-gray-100">
                      {result.nextSteps.map((step, idx) => (
                        <div key={idx} className="relative group">
                          <div className="absolute -left-[25px] top-0 w-4 h-4 rounded-full bg-white border-2 border-black group-hover:bg-black transition-colors" />
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Step {idx + 1}</p>
                            <p className="text-gray-700 leading-relaxed font-medium">{step}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Result Actions */}
                  <div className="pt-6 flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={() => setResult(null)}
                      className="flex-1 py-5 px-8 bg-black text-white rounded-[2rem] font-bold text-sm tracking-tight hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-black/10"
                    >
                      New Report
                    </button>
                    <button 
                      onClick={() => window.print()}
                      className="flex-1 py-5 px-8 bg-gray-100 text-gray-600 rounded-[2rem] font-bold text-sm tracking-tight hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                    >
                      Print Summary
                    </button>
                  </div>
                </div>
              </div>

              <div className="text-center px-8">
                <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em] leading-relaxed">
                  Issued by RouteAssist Civic AI • Official Guidance for Karnataka
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <div className="fixed bottom-24 left-6 right-6 p-4 bg-red-500 text-white rounded-2xl shadow-xl flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}
