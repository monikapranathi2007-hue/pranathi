import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History as HistoryIcon, 
  MapPin, 
  ChevronRight, 
  MessageSquare, 
  Mic, 
  Star, 
  CheckCircle2, 
  Send,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  Activity,
  UserCheck,
  Zap,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../services/authService';
import { getUserQueries, QueryRecord, saveFeedback, resolveQuery } from '../services/dbService';
import { cn } from '../lib/utils';

function FeedbackForm({ queryId, existingFeedback, onSubmitted }: { queryId: string, existingFeedback?: any, onSubmitted: () => void }) {
  const [accuracy, setAccuracy] = useState(existingFeedback?.accuracy || 0);
  const [helpfulness, setHelpfulness] = useState(existingFeedback?.helpfulness || 0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(!!existingFeedback);

  const handleSubmit = async () => {
    if (accuracy === 0 || helpfulness === 0) return;
    setLoading(true);
    try {
      await saveFeedback(queryId, { accuracy, helpfulness });
      setSubmitted(true);
      onSubmitted();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 p-4 rounded-2xl flex items-center gap-3 text-green-700 text-xs font-bold border border-green-100">
        <CheckCircle2 className="w-4 h-4" /> Thank you for your feedback!
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6 rounded-3xl space-y-6 border border-gray-100">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Rate this Routing</p>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-600">How accurate was the routing?</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button 
                key={star} 
                onClick={() => setAccuracy(star)}
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                  accuracy >= star ? "bg-black text-white shadow-lg" : "bg-white text-gray-300 border border-gray-100"
                )}
              >
                <Star className={cn("w-4 h-4", accuracy >= star ? "fill-current" : "")} />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-600">How helpful were the next steps?</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button 
                key={star} 
                onClick={() => setHelpfulness(star)}
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                  helpfulness >= star ? "bg-black text-white shadow-lg" : "bg-white text-gray-300 border border-gray-100"
                )}
              >
                <Star className={cn("w-4 h-4", helpfulness >= star ? "fill-current" : "")} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <button 
        onClick={handleSubmit}
        disabled={loading || accuracy === 0 || helpfulness === 0}
        className="w-full h-12 bg-black text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-black/10 disabled:opacity-50"
      >
        {loading ? "Submitting..." : <>Submit Feedback <Send className="w-3 h-3" /></>}
      </button>
    </div>
  );
}

export default function History() {
  const { user } = useAuth();
  const [queries, setQueries] = useState<QueryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchQueries = () => {
    if (user) {
      getUserQueries(user.uid).then(qs => {
        setQueries(qs);
        setLoading(false);
      });
    }
  };

  useEffect(() => {
    fetchQueries();
  }, [user]);

  return (
    <div className="pb-24 h-full overflow-y-auto space-y-6">
      {/* Editorial Header */}
      <div className="relative h-40 w-full overflow-hidden rounded-b-[3.5rem] shadow-xl">
        <img 
          src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2670&auto=format&fit=crop" 
          alt="Timeline"
          className="w-full h-full object-cover opacity-80"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white tracking-tighter">Civic Log</h1>
            <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
               <span className="text-[10px] font-bold text-white uppercase tracking-widest">{queries.length} Entries</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-32 bg-white rounded-[2.5rem] animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : queries.length === 0 ? (
          <div className="text-center py-20 space-y-4">
             <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-300">
               <HistoryIcon className="w-10 h-10" />
             </div>
             <div className="space-y-1">
               <p className="text-gray-500 font-bold tracking-tight">No active logs</p>
               <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Your civic footprint starts here</p>
             </div>
          </div>
        ) : (
          <div className="space-y-4">
            {queries.map((q) => (
              <div 
                key={q.id} 
                className={cn(
                  "bg-white rounded-[2.5rem] shadow-[0_15px_40px_-10px_rgba(0,0,0,0.05)] border transition-all overflow-hidden",
                  expandedId === q.id ? "border-black shadow-2xl scale-[1.02]" : "border-gray-100 hover:border-gray-200"
                )}
              >
                <button 
                  onClick={() => setExpandedId(expandedId === q.id ? null : (q.id || null))}
                  className="w-full text-left p-6 space-y-5"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 border border-gray-100">
                        {q.mode === 'voice' ? <Mic className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold truncate max-w-[140px] tracking-tight">{q.input}</h3>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em]">
                          {q.createdAt?.toDate ? format(q.createdAt.toDate(), 'dd MMM • HH:mm') : 'Syncing...'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <div className="px-3 py-1 rounded-full bg-black text-white text-[10px] font-bold uppercase tracking-widest border border-black shadow-lg shadow-black/10">
                          {q.result.department}
                       </div>
                       <div className="flex items-center gap-1.5 px-2">
                          <span className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            q.status === 'resolved' ? "bg-green-500" : "bg-blue-500 animate-pulse"
                          )} />
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.25em]">{q.status.replace('-', ' ')}</span>
                       </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                      <MapPin className="w-3 h-3 text-blue-500" />
                      {q.location?.city || 'Karnataka Region'}
                    </div>
                    <div className="flex items-center gap-2">
                      {q.feedback && <Star className="w-3 h-3 text-orange-400 fill-current" />}
                      <ChevronDown className={cn("w-4 h-4 text-gray-300 transition-all", expandedId === q.id && "rotate-180 text-black")} />
                    </div>
                  </div>
                </button>

              <AnimatePresence>
                {expandedId === q.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-50 p-5 pt-0"
                  >
                    <div className="pt-5 space-y-6">
                       {/* Real-time Tracking System */}
                       <div className="space-y-4">
                          <div className="flex items-center justify-between px-2">
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nodal Pulse Tracking</p>
                             <p className="text-[8px] font-bold text-blue-500 uppercase tracking-widest animate-pulse">Live Link Active</p>
                          </div>
                          
                          <div className="bg-gray-50/50 p-6 rounded-[2.5rem] border border-gray-100 flex items-center justify-between">
                             {[
                               { id: 'submitted', label: 'Submitted', icon: Activity },
                               { id: 'assigned', label: 'Assigned', icon: UserCheck },
                               { id: 'in-progress', label: 'In Progress', icon: Zap },
                               { id: 'resolved', label: 'Resolved', icon: CheckCircle },
                             ].map((stage, idx, arr) => {
                               const stages = ['submitted', 'assigned', 'in-progress', 'resolved'] as const;
                               const currentIdx = stages.indexOf(q.status as any);
                               const stageIdx = stages.indexOf(stage.id as any);
                               const isActive = stageIdx <= currentIdx;
                               const isCurrent = stageIdx === currentIdx;

                               return (
                                 <React.Fragment key={stage.id}>
                                   <div className="flex flex-col items-center gap-3 relative z-10">
                                      <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center transition-all border-2",
                                        isCurrent ? "bg-black text-white border-black scale-110 shadow-xl" :
                                        isActive ? "bg-green-500 text-white border-green-500" : "bg-white text-gray-200 border-gray-100"
                                      )}>
                                         <stage.icon className="w-5 h-5" />
                                      </div>
                                      <span className={cn(
                                        "text-[8px] font-bold uppercase tracking-widest whitespace-nowrap",
                                        isActive ? "text-black" : "text-gray-300"
                                      )}>
                                        {stage.label}
                                      </span>
                                   </div>
                                   {idx < arr.length - 1 && (
                                     <div className={cn(
                                       "flex-1 h-0.5 mx-2 bg-gray-100 rounded-full",
                                       idx < currentIdx && "bg-green-500"
                                     )} />
                                   )}
                                 </React.Fragment>
                               );
                             })}
                          </div>
                          <div className="px-4 py-2 bg-blue-50/30 rounded-2xl border border-blue-100/50">
                            <p className="text-[9px] font-bold text-blue-600/60 uppercase tracking-widest text-center mt-1">
                              This ensures transparency and builds user trust.
                            </p>
                          </div>
                       </div>

                       <FeedbackForm 
                         queryId={q.id!} 
                         existingFeedback={q.feedback} 
                         onSubmitted={() => fetchQueries()} 
                       />
                       
                       <div className="bg-white p-5 rounded-3xl border border-gray-100 space-y-2">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Administrative Context</p>
                          <p className="text-xs text-gray-600 leading-relaxed italic">"{q.result.analysis}"</p>
                       </div>

                       {q.status !== 'resolved' && (
                         <button 
                           onClick={async () => {
                             await resolveQuery(q.id!);
                             await new Promise(r => setTimeout(r, 500));
                             fetchQueries();
                           }}
                           className="w-full py-5 rounded-[2rem] bg-black text-white font-bold text-xs uppercase tracking-[0.2em] shadow-2xl shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                         >
                           <CheckCircle2 className="w-4 h-4" /> Finalize Resolution
                         </button>
                       )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
