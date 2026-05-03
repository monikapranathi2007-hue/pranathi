import React, { useEffect, useState } from 'react';
import { 
  getCategories, 
  upsertCategory, 
  getMappings,
  upsertMapping,
  getUrgencyRules,
  upsertUrgencyRule,
  deleteUrgencyRule,
  Category,
  DepartmentMapping,
  UrgencyRule
} from '../../services/dbService';
import { 
  Settings as SettingsIcon, 
  Plus, 
  Trash2, 
  Save, 
  Layers,
  Map as MapIcon,
  Zap,
  Activity
} from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Settings() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [mappings, setMappings] = useState<DepartmentMapping[]>([]);
  const [urgencyRules, setUrgencyRules] = useState<UrgencyRule[]>([]);
  const [activeTab, setActiveTab] = useState<'categories' | 'mappings' | 'urgency'>('categories');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [c, m, u] = await Promise.all([getCategories(), getMappings(), getUrgencyRules()]);
    setCategories(c);
    setMappings(m);
    setUrgencyRules(u);
    setLoading(false);
  };

  const handleAddCategory = () => {
    const newCat: Partial<Category> = { name: 'New Category', department: 'Unassigned', contacts: [] };
    setCategories([...categories, newCat as Category]);
  };

  const handleAddMapping = () => {
    const newMap: Partial<DepartmentMapping> = { city: 'Bengaluru', department: 'Unassigned', officeAddress: '', contactPerson: '' };
    setMappings([...mappings, newMap as DepartmentMapping]);
  };

  const handleAddUrgencyRule = () => {
    const newRule: Partial<UrgencyRule> = { keyword: 'leakage', urgency: 'medium' };
    setUrgencyRules([...urgencyRules, newRule as UrgencyRule]);
  };

  const handleSaveCategory = async (cat: Category) => {
    await upsertCategory(cat);
    fetchData();
  };

  const handleSaveMapping = async (map: DepartmentMapping) => {
    await upsertMapping(map);
    fetchData();
  };

  const handleSaveUrgencyRule = async (rule: UrgencyRule) => {
    await upsertUrgencyRule(rule);
    fetchData();
  };

  const handleDeleteRule = async (id: string) => {
    if (id) {
      await deleteUrgencyRule(id);
      fetchData();
    }
  };

  return (
    <div className="p-12 space-y-12 max-w-6xl mx-auto">
      <header className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em]">
            <SettingsIcon className="w-3 h-3" />
            Infrastructure Node
          </div>
          <h1 className="text-4xl font-bold tracking-tighter text-black">System Protocols</h1>
        </div>

        <div className="flex p-1 bg-gray-50 rounded-2xl border border-gray-100">
          {[
            { id: 'categories', label: 'Categories', icon: Layers },
            { id: 'mappings', label: 'Mappings', icon: MapIcon },
            { id: 'urgency', label: 'Urgency', icon: Zap }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                activeTab === tab.id ? "bg-black text-white shadow-xl shadow-black/20" : "text-gray-400 hover:text-black"
              )}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>
      </header>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">
            {activeTab === 'categories' ? 'Operational Domains' : 
             activeTab === 'mappings' ? 'Geographic Routing' : 'NLP Urgency Logic'}
          </h2>
          <button 
            onClick={
              activeTab === 'categories' ? handleAddCategory : 
              activeTab === 'mappings' ? handleAddMapping : handleAddUrgencyRule
            }
            className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-98 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Protocol
          </button>
        </div>

        {loading ? (
          <div className="py-24 flex items-center justify-center">
            <Activity className="w-8 h-8 animate-spin text-gray-200" />
          </div>
        ) : activeTab === 'urgency' ? (
          <div className="grid grid-cols-1 gap-4">
             {urgencyRules.map((rule, idx) => (
               <div key={idx} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex items-center gap-8">
                  <div className="grid grid-cols-2 gap-4 flex-1">
                    <div className="space-y-1">
                       <label className="text-[9px] font-bold text-gray-300 uppercase tracking-widest px-2">Trigger Keyword</label>
                       <input 
                         value={rule.keyword}
                         onChange={(e) => {
                           const n = [...urgencyRules];
                           n[idx].keyword = e.target.value;
                           setUrgencyRules(n);
                         }}
                         className="w-full h-14 px-6 bg-gray-50 border border-transparent focus:border-black rounded-[1.5rem] text-sm font-bold outline-none transition-all"
                       />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[9px] font-bold text-gray-300 uppercase tracking-widest px-2">Override Priority</label>
                       <select 
                         value={rule.urgency}
                         onChange={(e) => {
                           const n = [...urgencyRules];
                           n[idx].urgency = e.target.value as any;
                           setUrgencyRules(n);
                         }}
                         className="w-full h-14 px-6 bg-gray-50 border border-transparent focus:border-black rounded-[1.5rem] text-sm font-bold outline-none transition-all appearance-none"
                       >
                         <option value="low">Low</option>
                         <option value="medium">Medium</option>
                         <option value="high">High</option>
                       </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleSaveUrgencyRule(rule)}
                      className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center hover:scale-105 transition-all"
                    >
                      <Save className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteRule(rule.id)}
                      className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
               </div>
             ))}
          </div>
        ) : activeTab === 'categories' ? (
          <div className="grid grid-cols-1 gap-4">
            {categories.map((cat, idx) => (
              <div key={idx} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1 space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                         <label className="text-[9px] font-bold text-gray-300 uppercase tracking-widest px-2">Domain Name</label>
                         <input 
                           value={cat.name}
                           onChange={(e) => {
                             const n = [...categories];
                             n[idx].name = e.target.value;
                             setCategories(n);
                           }}
                           className="w-full h-14 px-6 bg-gray-50 border border-transparent focus:border-black rounded-[1.5rem] text-sm font-bold outline-none transition-all"
                         />
                      </div>
                      <div className="space-y-1">
                         <label className="text-[9px] font-bold text-gray-300 uppercase tracking-widest px-2">Assigned Nodal Office</label>
                         <input 
                           value={cat.department}
                           onChange={(e) => {
                             const n = [...categories];
                             n[idx].department = e.target.value;
                             setCategories(n);
                           }}
                           className="w-full h-14 px-6 bg-gray-50 border border-transparent focus:border-black rounded-[1.5rem] text-sm font-bold outline-none transition-all"
                         />
                      </div>
                   </div>
                </div>
                <button 
                  onClick={() => handleSaveCategory(cat)}
                  className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 hover:bg-black hover:text-white transition-all shadow-inner"
                >
                  <Save className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
             {mappings.map((map, idx) => (
               <div key={idx} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
                 <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-1">
                       <label className="text-[9px] font-bold text-gray-300 uppercase tracking-widest px-2">City/Region</label>
                       <input 
                         value={map.city}
                         onChange={(e) => {
                           const n = [...mappings];
                           n[idx].city = e.target.value;
                           setMappings(n);
                         }}
                         className="w-full h-14 px-6 bg-gray-50 border border-transparent focus:border-black rounded-[1.5rem] text-sm font-bold outline-none transition-all"
                       />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[9px] font-bold text-gray-300 uppercase tracking-widest px-2">Department</label>
                       <input 
                         value={map.department}
                         onChange={(e) => {
                           const n = [...mappings];
                           n[idx].department = e.target.value;
                           setMappings(n);
                         }}
                         className="w-full h-14 px-6 bg-gray-50 border border-transparent focus:border-black rounded-[1.5rem] text-sm font-bold outline-none transition-all"
                       />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[9px] font-bold text-gray-300 uppercase tracking-widest px-2">Officer in Charge</label>
                       <input 
                         value={map.contactPerson}
                         onChange={(e) => {
                           const n = [...mappings];
                           n[idx].contactPerson = e.target.value;
                           setMappings(n);
                         }}
                         className="w-full h-14 px-6 bg-gray-50 border border-transparent focus:border-black rounded-[1.5rem] text-sm font-bold outline-none transition-all"
                       />
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <input 
                      placeholder="Physical Office Address"
                      value={map.officeAddress}
                      onChange={(e) => {
                        const n = [...mappings];
                        n[idx].officeAddress = e.target.value;
                        setMappings(n);
                      }}
                      className="flex-1 h-14 px-6 bg-gray-50 border border-transparent focus:border-black rounded-[1.5rem] text-sm font-bold outline-none transition-all"
                    />
                    <button 
                      onClick={() => handleSaveMapping(map)}
                      className="px-10 h-14 bg-black text-white rounded-[1.5rem] text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-all shadow-2xl shadow-black/20"
                    >
                      Commit Route
                    </button>
                 </div>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
}
