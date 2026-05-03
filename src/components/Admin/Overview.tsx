import React, { useEffect, useState } from 'react';
import { 
  getGlobalQueries, 
  QueryRecord 
} from '../../services/dbService';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  Activity, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

const COLORS = ['#000000', '#F59E0B', '#3B82F6', '#EF4444', '#10B981'];

export default function Overview() {
  const [data, setData] = useState<QueryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const queries = await getGlobalQueries();
    setData(queries);
    setLoading(false);
  };

  const stats = React.useMemo(() => {
    if (!data.length) return null;

    const categories = data.reduce((acc: any, curr) => {
      acc[curr.result.department] = (acc[curr.result.department] || 0) + 1;
      return acc;
    }, {});

    const urgency = data.reduce((acc: any, curr) => {
      acc[curr.result.urgency] = (acc[curr.result.urgency] || 0) + 1;
      return acc;
    }, {});

    const status = data.reduce((acc: any, curr) => {
      acc[curr.status || 'pending'] = (acc[curr.status || 'pending'] || 0) + 1;
      return acc;
    }, {});

    const categoryData = Object.entries(categories).map(([name, value]) => ({ name, value }));
    const urgencyData = Object.entries(urgency).map(([name, value]) => ({ name, value }));
    const statusData = Object.entries(status).map(([name, value]) => ({ name, value }));

    // Time series for last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return format(d, 'MMM dd');
    }).reverse();

    const timeline = last7Days.map(date => {
      const count = data.filter(q => q.createdAt?.toDate && format(q.createdAt.toDate(), 'MMM dd') === date).length;
      return { name: date, count };
    });

    return { categoryData, urgencyData, statusData, timeline };
  }, [data]);

  if (loading) return (
    <div className="p-12 flex items-center justify-center h-full">
      <Activity className="w-10 h-10 animate-spin text-gray-200" />
    </div>
  );

  return (
    <div className="p-12 space-y-12 max-w-6xl mx-auto">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em]">
          <TrendingUp className="w-3 h-3" />
          Intelligence Center
        </div>
        <h1 className="text-4xl font-bold tracking-tighter text-black">Control Dashboard</h1>
      </header>

      {/* Hero Stats */}
      <div className="grid grid-cols-4 gap-6">
        <StatsCard 
          icon={Activity} 
          label="Active Node Volume" 
          value={data.length.toString()} 
          sub="Total reports handled"
        />
        <StatsCard 
          icon={CheckCircle2} 
          label="Resolution Rate" 
          value={`${Math.round((data.filter(q => q.status === 'resolved').length / data.length) * 100 || 0)}%`} 
          sub="Efficiency Index"
          primary
        />
        <StatsCard 
          icon={AlertCircle} 
          label="Critical Influx" 
          value={data.filter(q => q.result.urgency === 'high').length.toString()} 
          sub="Immediate action required"
          danger
        />
        <StatsCard 
          icon={Users} 
          label="Unique Citizens" 
          value={new Set(data.map(q => q.userId)).size.toString()} 
          sub="Active civic node users"
        />
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Main Volume Chart */}
        <section className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2">
              <Clock className="w-4 h-4 text-black" /> Reporting Velocity
            </h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.timeline}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="count" stroke="#000" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Categories Pie */}
        <section className="bg-black p-10 rounded-[3.5rem] shadow-2xl space-y-8 text-white">
           <h3 className="text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Sector Distribution
          </h3>
          <div className="h-64 w-full flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats?.categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px' }}
                   itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-1/2 space-y-3">
              {stats?.categoryData.map((item: { name: string, value: number }, idx) => (
                <div key={idx} className="flex items-center justify-between text-[10px] font-bold">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-white/60 truncate max-w-[80px] uppercase tracking-widest">{item.name}</span>
                  </div>
                  <span className="text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Urgency breakdown */}
      <section className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm space-y-8">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-black" /> Criticality Heatmap
        </h3>
        <div className="grid grid-cols-4 gap-8">
           {stats?.urgencyData.map((item: { name: string, value: number }, idx) => (
             <div key={idx} className="space-y-4">
                <div className="flex justify-between items-end">
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.name}</p>
                   <p className="text-xl font-bold tracking-tight">{item.value}</p>
                </div>
                <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-black rounded-full transition-all duration-1000"
                     style={{ width: `${(item.value / (data.length || 1)) * 100}%` }}
                   />
                </div>
             </div>
           ))}
        </div>
      </section>
    </div>
  );
}

function StatsCard({ icon: Icon, label, value, sub, primary, danger }: any) {
  return (
    <div className={cn(
      "p-8 rounded-[2.5rem] border space-y-3 relative overflow-hidden group transition-all",
      primary ? "bg-black text-white border-black shadow-2xl" : 
      danger ? "bg-red-50 text-red-900 border-red-100" :
      "bg-white text-black border-gray-100 shadow-sm hover:border-black"
    )}>
      <div className={cn(
        "w-10 h-10 rounded-2xl flex items-center justify-center transition-colors",
        primary ? "bg-white/10" : "bg-gray-50 group-hover:bg-black group-hover:text-white"
      )}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className={cn("text-[10px] font-bold uppercase tracking-widest", primary ? "text-white/40" : "text-gray-400")}>{label}</p>
        <p className="text-3xl font-bold tracking-tighter">{value}</p>
        <p className={cn("text-[9px] font-bold mt-1", primary ? "text-white/20" : "text-gray-300")}>{sub}</p>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
