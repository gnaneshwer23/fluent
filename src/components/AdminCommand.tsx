import React, { useState, useEffect } from 'react';
import { 
  Home, Globe, BarChart3, Award, BookOpen, Settings, Plus, ShieldCheck, Zap, Users, ClipboardList, PieChart
} from 'lucide-react';
import { motion } from 'motion/react';
import { collection, onSnapshot, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebaseInit';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';
import { Badge, Card, MetricTile, Btn, Avatar } from './UI';
import { DashboardShell } from './DashboardShell';

import AdminLeads from './AdminLeads';
import AdminStudents from './AdminStudents';
import AdminTeachers from './AdminTeachers';
import AdminAnalytics from './AdminAnalytics';
import AdminAlerts from './AdminAlerts';

export const AdminCommand = ({ onBack }: { onBack: () => void }) => {
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("overview");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'waitlist'), (snap) => {
      setWaitlist(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'waitlist'));
    return () => unsub();
  }, []);

  const handleResolve = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'waitlist', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `waitlist/${id}`);
    }
  };

  const navItems = [
    { id: "overview", label: "Operations Control", icon: Home },
    { id: "leads", label: "Lead Pipeline", icon: Globe },
    { id: "students", label: "Scholar Registry", icon: Users },
    { id: "teachers", label: "Faculty Command", icon: Award },
    { id: "alerts", label: "Interventions", icon: ShieldCheck, badge: "Live" },
    { id: "analytics", label: "System Analytics", icon: BarChart3, badge: "AI" },
    { id: "settings", label: "System Config", icon: Settings },
  ];

  return (
    <DashboardShell role="admin" title="Institutional Oversight" navItems={navItems} activeNav={activeNav} setActiveNav={setActiveNav} onBack={onBack}>
      <div className="p-10 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge color="gold">Global Administrator</Badge>
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">All Systems Operational</span>
            </div>
            <h1 className="text-3xl font-serif font-bold tracking-tight">{navItems.find(n => n.id === activeNav)?.label || 'Institutional Command'}</h1>
          </div>
          <div className="flex gap-3">
            <Btn variant="outline" size="sm" icon={ShieldCheck}>Security Audit</Btn>
            <Btn variant="primary" size="sm" icon={Plus}>Onboard Partner</Btn>
          </div>
        </header>

        {activeNav === "overview" ? (
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* System Pulse Metrics */}
            <div className="lg:col-span-12 grid sm:grid-cols-4 gap-4 mb-4">
              <MetricTile label="Global Reach" value="1,452" delta="+12.8%" icon={Globe} color="#1B4F5E" />
              <MetricTile label="Active Cohorts" value="84" icon={Home} color="#0D1B2A" />
              <MetricTile label="Avg Mastery" value="89.2%" icon={Award} color="#C9A84C" />
              <MetricTile label="System Latency" value="14ms" icon={Zap} color="#7C3AED" />
            </div>

            {/* Strategic Oversight Rail */}
            <div className="lg:col-span-8 space-y-8">
               <Card className="p-12 bg-fluent-navy text-white relative overflow-hidden flex flex-col justify-center min-h-[300px]">
                  <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
                    <ShieldCheck size={200} />
                  </div>
                  <div className="relative z-10 space-y-6">
                    <h2 className="text-4xl font-serif font-bold italic max-w-lg leading-tight">The platform is operating at 94.2% efficiency baseline.</h2>
                    <p className="text-sm text-white/60 max-w-md italic">Institutional protocols are being maintained across all 3 active regions. Automated audits suggest no critical interventions required within the next 24 hours.</p>
                    <div className="flex gap-4">
                       <Btn variant="gold" size="sm" className="px-8">System Deep Audit</Btn>
                       <Btn variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">Protocols Registry</Btn>
                    </div>
                  </div>
               </Card>

               <div className="grid md:grid-cols-2 gap-8">
                  <Card className="p-8 bg-white border-black/5 shadow-xl">
                     <div className="flex justify-between items-center mb-6">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Regional Distribution</h4>
                        <PieChart size={16} className="text-slate-300" />
                     </div>
                     <div className="space-y-6">
                        {[
                          { l: "United Kingdom", v: 64, c: "bg-fluent-teal" },
                          { l: "Middle East", v: 22, c: "bg-fluent-gold" },
                          { l: "South East Asia", v: 14, c: "bg-slate-200" }
                        ].map((r, i) => (
                          <div key={i} className="group">
                             <div className="flex justify-between items-end mb-2">
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-fluent-teal transition-colors">{r.l}</div>
                                <div className="text-sm font-mono font-bold text-fluent-navy">{r.v}%</div>
                             </div>
                             <div className="h-1 bg-slate-50 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${r.v}%` }} className={`h-full ${r.c}`} />
                             </div>
                          </div>
                        ))}
                     </div>
                  </Card>
                  <Card className="p-8 bg-slate-50 border-black/5 border-dashed flex flex-col justify-center items-center text-center">
                     <Award size={48} className="text-fluent-gold mb-4 opacity-40" />
                     <h4 className="text-lg font-serif font-bold text-fluent-navy mb-2">Annual Excellence Award</h4>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Top performing faculty recognition scheduled for June 15th, 2026.</p>
                  </Card>
               </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
               <Card className="p-8 border-black/5 bg-white shadow-xl">
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="text-xs font-black text-fluent-navy uppercase tracking-widest">Urgent Audits</h3>
                     <Badge color="red">{waitlist.length}</Badge>
                  </div>
                  <div className="space-y-4">
                     {waitlist.slice(0, 3).map(lead => (
                       <div key={lead.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-3">
                             <Avatar name={lead.email} size={32} />
                             <div className="text-[10px] font-bold text-fluent-navy truncate max-w-[100px]">{lead.email}</div>
                          </div>
                          <Btn variant="primary" size="sm" className="h-8 px-3 text-[8px]" onClick={() => setActiveNav("leads")}>AUDIT</Btn>
                       </div>
                     ))}
                     {waitlist.length === 0 && <p className="text-[10px] text-slate-400 italic text-center py-8">No critical audits pending.</p>}
                  </div>
               </Card>

               <Card className="p-8 border-black/5 bg-white shadow-xl">
                  <h3 className="text-xs font-black text-fluent-navy uppercase tracking-widest mb-6">Security Terminal</h3>
                  <div className="space-y-3">
                     {[
                       "ENCRYPTION: AES-256 ACTIVE",
                       "ACCESS LOGS: SECURE",
                       "DB REPLICATION: SYNCED"
                     ].map(log => (
                       <div key={log} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                          <ShieldCheck size={14} className="text-fluent-teal" />
                          <span className="text-[10px] font-bold text-slate-600">{log}</span>
                       </div>
                     ))}
                  </div>
               </Card>
            </div>
          </div>
        ) : activeNav === "leads" ? (
          <AdminLeads />
        ) : activeNav === "students" ? (
          <AdminStudents />
        ) : activeNav === "teachers" ? (
          <AdminTeachers />
        ) : activeNav === "alerts" ? (
          <AdminAlerts />
        ) : activeNav === "analytics" ? (
          <AdminAnalytics />
        ) : activeNav === "settings" ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
              <h2 className="text-3xl font-serif font-bold italic">System Configuration</h2>
              <p className="text-slate-500 mt-2">Manage global environment variables and platform constraints.</p>
            </div>
            <Card className="p-8 border-black/5 divide-y divide-slate-50">
               {[
                 { label: "Public Registrations", status: "Active" },
                 { label: "Faculty Onboarding", status: "Restricted" },
                 { label: "Beta Node Access", status: "Inactive" },
                 { label: "Global Chat Protocol", status: "Active" }
               ].map(setting => (
                 <div key={setting.label} className="py-6 flex justify-between items-center first:pt-0 last:pb-0">
                    <div>
                      <div className="text-sm font-bold text-fluent-navy">{setting.label}</div>
                      <div className="text-[10px] text-slate-400 font-medium tracking-tight">Status: {setting.status}</div>
                    </div>
                    <div className="w-12 h-6 bg-slate-200 rounded-full relative p-1 cursor-pointer">
                       <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all ${setting.status === 'Active' ? 'ml-6 bg-fluent-teal' : ''}`} />
                    </div>
                 </div>
               ))}
            </Card>
          </div>
        ) : null}
      </div>
    </DashboardShell>
  );
};
