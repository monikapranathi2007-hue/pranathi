import React, { useEffect, useState } from 'react';
import { 
  getGlobalQueries, 
  updateQueryStatus, 
  createNotification,
  QueryRecord,
  OperationType 
} from '../../services/dbService';
import { 
  Filter, 
  Search, 
  MoreVertical, 
  ChevronRight,
  MessageSquare,
  Mic,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';

export default function ComplaintManager() {
  const [queries, setQueries] = useState<QueryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'submitted' | 'assigned' | 'in-progress' | 'resolved'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    const data = await getGlobalQueries();
    setQueries(data);
    setLoading(false);
  };

  const handleStatusChange = async (id: string, status: QueryRecord['status'], userId: string, department: string) => {
    await updateQueryStatus(id, status);
    
    // Notify user
    await createNotification({
      userId,
      title: 'Status Update',
      message: `Your report for ${department} has been updated to ${status.replace('-', ' ')}.`,
      type: status === 'resolved' ? 'success' : 'info'
    });

    fetchQueries();
  };

  const filteredQueries = queries.filter(q => {
    const matchesFilter = filter === 'all' || q.status === filter;
    const matchesSearch = 
      q.input.toLowerCase().includes(searchTerm.toLowerCase()) || 
      q.result.department.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-12 space-y-12 max-w-6xl mx-auto">
      <header className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em]">
            <MessageSquare className="w-3 h-3" />
            Registry Hub
          </div>
          <h1 className="text-4xl font-bold tracking-tighter text-black">Active Complaints</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search registry..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 h-12 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-0 focus:border-black transition-all outline-none w-64"
            />
          </div>
          <div className="flex p-1 bg-gray-50 rounded-2xl border border-gray-100">
            {['all', 'submitted', 'assigned', 'in-progress', 'resolved'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                  filter === f ? "bg-black text-white shadow-xl shadow-black/20" : "text-gray-400 hover:text-black"
                )}
              >
                {f.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-50 rounded-3xl animate-pulse" />
          ))
        ) : filteredQueries.length === 0 ? (
          <div className="text-center py-24 space-y-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200">
              <MessageSquare className="w-10 h-10" />
            </div>
            <p className="text-gray-400 font-bold tracking-tight">No matching logs found</p>
          </div>
        ) : (
          filteredQueries.map((q) => (
            <div 
              key={q.id} 
              className={cn(
                "bg-white p-6 rounded-[2.5rem] border transition-all group",
                q.result.isFraud 
                  ? "border-amber-200 bg-amber-50/30 hover:border-amber-400 shadow-sm" 
                  : "border-gray-100 shadow-sm hover:shadow-xl hover:border-black"
              )}
            >
              <div className="flex items-center gap-8">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center border transition-colors",
                  q.result.isFraud 
                    ? "bg-amber-100 border-amber-200 text-amber-600" 
                    : "bg-gray-50 border-gray-100 group-hover:bg-black group-hover:text-white"
                )}>
                  {q.result.isFraud ? <AlertTriangle className="w-6 h-6" /> : q.mode === 'voice' ? <Mic className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold truncate tracking-tight">{q.input}</h3>
                    {q.result.isFraud && (
                      <span className="shrink-0 px-2 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-bold uppercase tracking-widest rounded-full border border-amber-200">
                        Flagged: Fraud
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                     <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                       {q.createdAt?.toDate ? format(q.createdAt.toDate(), 'dd MMM • HH:mm') : 'Just now'}
                     </span>
                     <span className="w-1 h-1 bg-gray-200 rounded-full" />
                     <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                        <MapPin className="w-3 h-3" />
                        {q.location?.city || 'Karnataka'}
                     </div>
                  </div>
                </div>

                <div className="flex items-center gap-12">
                   <div className="text-right space-y-1 flex flex-col items-end">
                      {q.result.isFraud && (
                        <p className="text-[8px] font-bold text-amber-600 uppercase tracking-widest mb-1 italic">
                          Reason: {q.result.fraudReason}
                        </p>
                      )}
                      <div className="px-3 py-1 bg-gray-50 rounded-full inline-block border border-gray-100">
                         <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{q.result.department}</span>
                      </div>
                      <div className="flex items-center justify-end gap-1.5">
                         <span className={cn(
                           "w-1.5 h-1.5 rounded-full",
                           q.result.urgency === 'high' || q.result.urgency === 'critical' ? "bg-red-500" : q.result.urgency === 'medium' ? "bg-orange-500" : "bg-blue-500"
                         )} />
                         <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{q.result.urgency} Priority</span>
                      </div>
                   </div>

                   <select 
                     value={q.status}
                     onChange={(e) => handleStatusChange(q.id!, e.target.value as any, q.userId, q.result.department)}
                     className={cn(
                       "h-12 pl-4 pr-10 rounded-2xl text-xs font-bold uppercase tracking-widest border border-gray-100 bg-gray-50 focus:ring-0 focus:border-black transition-all outline-none cursor-pointer appearance-none",
                       q.status === 'resolved' ? "text-green-500" : q.status === 'in-progress' ? "text-blue-500" : q.status === 'assigned' ? "text-orange-500" : "text-gray-400"
                     )}
                   >
                     <option value="submitted">Submitted</option>
                     <option value="assigned">Assigned</option>
                     <option value="in-progress">In Progress</option>
                     <option value="resolved">Resolved</option>
                   </select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
