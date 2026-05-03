import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, 
} from 'recharts';
import { 
  TrendingUp, 
  Activity, 
  PieChart as PieChartIcon, 
  BarChart3, 
  Clock, 
  Map as MapIcon,
  Zap,
  Droplets,
  ShieldCheck,
  AlertCircle,
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';
import { getGlobalQueries, QueryRecord } from '../services/dbService';
import { format, startOfDay, subDays, isWithinInterval } from 'date-fns';
import { cn } from '../lib/utils';

const COLORS = ['#000000', '#2563EB', '#7C3AED', '#DB2777', '#F59E0B'];
const URGENCY_COLORS = {
  low: '#10B981',
  medium: '#3B82F6',
  high: '#F59E0B',
  critical: '#EF4444'
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl space-y-1">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">{label}</p>
        <div className="flex items-center gap-3">
          <p className="text-xl font-bold text-white tracking-tighter">{payload[0].value} <span className="text-[10px] font-medium text-gray-400">Reports</span></p>
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function Trends() {
  const [data, setData] = useState<QueryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGlobalQueries().then(qs => {
      setData(qs);
      setLoading(false);
    });
  }, []);

  const stats = useMemo(() => {
    if (data.length === 0) return null;

    // Category Distribution
    const categoryMap: Record<string, number> = {};
    data.forEach(q => {
      const cat = q.result.category || 'Other';
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });
    const categoryData = Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Urgency Distribution
    const urgencyMap: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
    data.forEach(q => {
      const u = q.result.urgency || 'low';
      urgencyMap[u] = (urgencyMap[u] || 0) + 1;
    });
    const urgencyData = Object.entries(urgencyMap).map(([name, value]) => ({ name, value }));

    // Volume Trends (Past 7 Days)
    const now = new Date();
    const timeline = Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(now, 6 - i);
      const dayStr = format(date, 'MMM dd');
      const count = data.filter(q => {
        const qDate = q.createdAt?.toDate ? q.createdAt.toDate() : new Date();
        return isWithinInterval(qDate, {
          start: startOfDay(date),
          end: new Date(startOfDay(date).getTime() + 86400000)
        });
      }).length;
      return { name: dayStr, count };
    });

    return { categoryData, urgencyData, timeline };
  }, [data]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-12 space-y-4">
        <Activity className="w-12 h-12 text-gray-200 animate-pulse" />
        <p className="text-gray-400 font-medium">Aggregating real-time city data...</p>
      </div>
    );
  }

  return (
    <div className="pb-12 overflow-y-auto h-full space-y-10 scrollbar-hide">
      {/* Cinematic Header with Glassmorphism */}
      <div className="relative h-64 w-full overflow-hidden">
        <motion.img 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.6 }}
          transition={{ duration: 1.5 }}
          src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop" 
          alt="Data Analytics"
          className="w-full h-full object-cover grayscale"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-gray-50/20 to-transparent flex flex-col justify-end p-10">
          <div className="space-y-4">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-3"
            >
              <div className="px-3 py-1 bg-black text-white rounded-full text-[8px] font-bold uppercase tracking-[0.3em]">
                Live Analytics
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
            </motion.div>
            <h1 className="text-5xl font-bold text-black tracking-tighter leading-none mb-2">City Intelligence <br/>Dynamics</h1>
          </div>
        </div>
      </div>

      <div className="px-8 space-y-12">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active Reports', value: data.length, icon: Activity, trend: '+12%', bg: 'bg-white' },
            { label: 'Resolution Index', value: '94.2%', icon: ShieldCheck, trend: '+0.4%', bg: 'bg-black text-white' },
            { label: 'Avg Latency', value: '1.2h', icon: Clock, trend: '-18%', bg: 'bg-blue-50' },
            { label: 'Nodal Coverage', value: '100%', icon: MapIcon, trend: 'Stable', bg: 'bg-gray-50' }
          ].map((kpi, idx) => (
            <motion.div 
              key={idx}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                "p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group",
                kpi.bg
              )}
            >
              <div className="space-y-2">
                <p className={cn("text-[9px] font-bold uppercase tracking-[0.2em]", kpi.bg.includes('black') ? 'text-gray-500' : 'text-gray-400')}>{kpi.label}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold tracking-tight">{kpi.value}</p>
                  <span className={cn("text-[8px] font-bold", kpi.trend.includes('+') ? 'text-green-500' : 'text-blue-500')}>{kpi.trend}</span>
                </div>
              </div>
              <kpi.icon className={cn("absolute -bottom-2 -right-2 w-16 h-16 opacity-5", kpi.bg.includes('black') ? 'text-white' : 'text-black')} />
            </motion.div>
          ))}
        </div>

        {/* Volume Velocity - The Main Event */}
        <section className="bg-white p-10 rounded-[4rem] border border-gray-100 shadow-2xl space-y-10">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-bold uppercase tracking-[0.25em] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" /> Volume Velocity
              </h3>
              <p className="text-xs text-gray-400 font-medium ml-6">Temporal distribution of civic report throughput</p>
            </div>
            <div className="flex gap-2">
              <div className="px-5 py-2 bg-gray-50 rounded-full border border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                 Rolling 7 Days
              </div>
            </div>
          </div>

          <div className="h-72 w-full -ml-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.timeline}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#9CA3AF' }}
                  dy={15}
                />
                <YAxis hide />
                <Tooltip 
                  content={<CustomTooltip />} 
                  cursor={{ stroke: '#3B82F6', strokeWidth: 2, strokeDasharray: '5 5' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3B82F6" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-6 border-t border-gray-50 grid grid-cols-3 gap-8">
            <div className="space-y-1">
               <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Peak Load</p>
               <p className="text-lg font-bold tracking-tight">{Math.max(...(stats?.timeline.map(t => t.count) || [0]))} <span className="text-[10px] text-gray-400">Reports/Day</span></p>
            </div>
            <div className="space-y-1">
               <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Growth Rate</p>
               <p className="text-lg font-bold text-green-500 tracking-tight">+4.2% <span className="text-[10px] text-gray-400">Trend Blue</span></p>
            </div>
            <div className="space-y-1">
               <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Data Points</p>
               <p className="text-lg font-bold tracking-tight">Real-time <span className="text-[10px] text-blue-500 font-bold uppercase tracking-widest ml-1 animate-pulse">Sync</span></p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sector Matrix */}
          <section className="bg-black p-10 rounded-[4rem] shadow-2xl shadow-black/30 space-y-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 blur-[100px] -mr-32 -mt-32" />
            <h3 className="text-sm font-bold text-white uppercase tracking-[0.25em] flex items-center gap-2 relative z-10">
              <PieChartIcon className="w-4 h-4 text-blue-400" /> Issue Spectrum
            </h3>
            <div className="space-y-8 relative z-10">
              {stats?.categoryData.map((item, idx) => (
                <div key={idx} className="space-y-3 group cursor-default">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest group-hover:text-white transition-colors">{item.name}</span>
                    </div>
                    <span className="text-base font-bold text-white tracking-tight">{item.value} <span className="text-[9px] text-gray-600 font-bold uppercase">Nodes</span></span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.value / data.length) * 100}%` }}
                      transition={{ duration: 1, delay: idx * 0.1 }}
                      className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full py-5 border border-white/10 rounded-3xl text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all">
               View Full Node Registry
            </button>
          </section>

          {/* Criticality Pulse */}
          <section className="bg-white p-10 rounded-[4rem] border border-gray-100 shadow-xl space-y-10">
             <div className="flex items-center justify-between">
               <h3 className="text-sm font-bold uppercase tracking-[0.25em] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" /> Criticality Pulse
              </h3>
              <Activity className="w-4 h-4 text-gray-200" />
             </div>
             
             <div className="grid grid-cols-2 gap-4">
              {stats?.urgencyData.map((item, idx) => (
                <motion.div 
                  key={idx} 
                  whileHover={{ scale: 1.02 }}
                  className="p-6 rounded-[2.5rem] bg-gray-50/50 border border-gray-100 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.name}</p>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: (URGENCY_COLORS as any)[item.name] }} />
                  </div>
                  <p className="text-3xl font-bold tracking-tighter" style={{ color: (URGENCY_COLORS as any)[item.name] }}>{item.value}</p>
                  <div className="h-1 w-12 bg-gray-200 rounded-full overflow-hidden">
                     <div 
                       className="h-full rounded-full" 
                       style={{ 
                         width: `${(item.value / data.length) * 100}%`,
                         backgroundColor: (URGENCY_COLORS as any)[item.name]
                       }} 
                     />
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="p-6 bg-red-50 rounded-[2.5rem] border border-red-100 flex items-center justify-between">
               <div className="space-y-1">
                 <p className="text-[10px] font-bold text-red-800 uppercase tracking-widest">Immediate Response</p>
                 <p className="text-xs text-red-600/80 font-medium">Critical issues require <span className="font-bold">Nodal Override</span></p>
               </div>
               <ArrowUpRight className="w-5 h-5 text-red-500" />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
