import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { Home, FileText, Bell, Calendar, LogOut, TrendingUp, Zap, Sparkles, BrainCircuit, ChevronRight } from "lucide-react";
import { DashboardShell } from "./DashboardShell";
import { Avatar, Btn, Card, Badge } from "./UI";
import { db, auth } from '../lib/firebaseInit';
import { collection, query, where, onSnapshot, orderBy, collectionGroup, limit } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';

const C = { teal:"#1B4F5E", gold:"#C9A84C", navy:"#0D1B2A", gray:"#6B7280" };

export function ParentDashboard({ profile, onBack }:{ profile: any, onBack: () => void }) {
  const [tab, setTab] = useState("overview");
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.children || profile.children.length === 0) {
      setLoading(false);
      return;
    }

    // In this app, student IDs are the names for simplicity in some places, 
    // but the business plan suggests student_id. Let's use name for now as existing code does.
    const qChildren = query(
      collectionGroup(db, 'students'), 
      where('name', 'in', profile.children)
    );

    const unsubChildren = onSnapshot(qChildren, (snap) => {
      const childrenData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChildren(childrenData);
      if (childrenData.length > 0 && !selectedChild) {
        setSelectedChild(childrenData[0]);
      }
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'collectionGroup/students'));

    return () => unsubChildren();
  }, [profile?.children]);

  useEffect(() => {
    if (!selectedChild) return;

    const qReports = query(
      collection(db, "weeklyReports"),
      where("studentId", "==", selectedChild.studentId || selectedChild.id),
      orderBy("createdAt", "desc"),
      limit(10)
    );

    const unsubReports = onSnapshot(qReports, (snap) => {
      setReports(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'weeklyReports'));

    const qAlerts = query(
      collection(db, "alerts"),
      where("studentId", "==", selectedChild.studentId || selectedChild.id),
      orderBy("date", "desc"),
      limit(5)
    );

    const unsubAlerts = onSnapshot(qAlerts, (snap) => {
      setAlerts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'alerts'));

    return () => {
      unsubReports();
      unsubAlerts();
    };
  }, [selectedChild]);

  const navItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "reports", label: "Weekly Reports", icon: FileText, badge: "New" },
    { id: "alerts", label: "Alerts", icon: Bell, badge: alerts.length > 0 ? alerts.length : null },
    { id: "bookings", label: "1:1 Sessions", icon: Calendar },
  ];

  if (loading) {
    return <div className="flex items-center justify-center p-20 animate-pulse text-fluent-navy font-serif">Initialising Parent Portal...</div>;
  }

  if (children.length === 0) {
    return (
      <DashboardShell role="parent" title={profile?.name} navItems={navItems} activeNav={tab} setActiveNav={setTab} onBack={onBack}>
         <div className="p-20 text-center space-y-4">
            <AlertCircle size={48} className="mx-auto text-slate-200" />
            <h2 className="text-2xl font-serif font-bold text-fluent-navy">No Registered Scholars</h2>
            <p className="text-slate-500 max-w-sm mx-auto">Please contact administrative support to link your child's academic node to your account.</p>
         </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role="parent" title={profile?.name} navItems={navItems} activeNav={tab} setActiveNav={setTab} onBack={onBack}>
      <div className="p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {tab === "overview" && (
            <div className="space-y-10">
              <header className="flex flex-col lg:flex-row justify-between items-start gap-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge color="navy">Parental Oversight</Badge>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">• Secured Node</span>
                  </div>
                  <h1 className="text-3xl font-serif font-bold text-fluent-navy">Welcome, <span className="font-normal text-fluent-teal">{profile?.name?.split(' ')[1] || 'Guardian'}</span> ✦</h1>
                  <p className="text-slate-500 mt-1.5 text-sm font-medium">Monitoring academic momentum for <span className="text-fluent-navy font-bold">{selectedChild.name}</span>.</p>
                </div>
                
                {children.length > 1 && (
                  <div className="flex gap-2 p-1.5 bg-gray-50 rounded-2xl border border-black/5">
                    {children.map(c => (
                      <button 
                        key={c.id} 
                        onClick={() => setSelectedChild(c)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedChild.id === c.id ? 'bg-fluent-navy text-white shadow-lg' : 'text-slate-400 hover:text-fluent-navy'}`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
              </header>

              {/* Scholar Highlight Card */}
              <Card className="p-10 bg-fluent-navy text-white overflow-hidden relative border-none">
                 <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12 scale-150">
                    <ShieldCheck size={120} className="" />
                 </div>
                 <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex items-center gap-6">
                       <Avatar name={selectedChild.name} size={84} color="#C9A84C" />
                       <div>
                          <div className="text-[10px] font-black text-fluent-gold uppercase tracking-[0.4em] mb-2">Primary Scholar</div>
                          <h2 className="text-4xl font-serif font-bold tracking-tight">{selectedChild.name}</h2>
                          <div className="flex gap-2 mt-4">
                             <Badge color="navy" className="bg-white/10 text-white border-transparent">{selectedChild.grade}</Badge>
                             <Badge color="teal" className="bg-white/10 text-white border-transparent">{selectedChild.subject}</Badge>
                          </div>
                       </div>
                    </div>

                    <div className="flex gap-12 border-l border-white/10 pl-12 py-2">
                       <div className="text-center">
                          <div className="text-4xl font-mono font-bold text-fluent-gold">{selectedChild.total > 0 ? Math.round((selectedChild.attended/selectedChild.total)*100) : 0}%</div>
                          <div className="text-[9px] font-black uppercase text-white/40 tracking-widest mt-2">Attendance</div>
                       </div>
                       <div className="text-center">
                          <div className="text-4xl font-mono font-bold text-white">{selectedChild.avgScore || 0}%</div>
                          <div className="text-[9px] font-black uppercase text-white/40 tracking-widest mt-2">Mastery Index</div>
                       </div>
                       <div className="text-center">
                          <div className={`text-xl font-black uppercase tracking-tighter mt-1 ${selectedChild.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                             {selectedChild.trend === 'up' ? '↑ Rising' : '→ Stable'}
                          </div>
                          <div className="text-[9px] font-black uppercase text-white/40 tracking-widest mt-2">Momentum</div>
                       </div>
                    </div>
                 </div>
              </Card>

              <div className="grid lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-2 space-y-8">
                    <Card className="p-8">
                       <div className="flex justify-between items-center mb-8">
                          <h3 className="text-xl font-serif font-bold text-fluent-navy">Academic Pulse</h3>
                          <div className="flex items-center gap-2">
                             <TrendingUp size={16} className="text-fluent-teal" />
                             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mastery Arc</span>
                          </div>
                       </div>
                       <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                             <LineChart data={reports.slice().reverse()}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} domain={[0, 100]} />
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} />
                                <Line type="monotone" dataKey="marks" stroke="#1B4F5E" strokeWidth={5} dot={{ r: 6, fill: '#1B4F5E' }} activeDot={{ r: 10 }} />
                             </LineChart>
                          </ResponsiveContainer>
                       </div>
                    </Card>

                    <div className="grid md:grid-cols-2 gap-6">
                       <Card className="p-6 bg-fluent-teal/5 border-fluent-teal/10">
                          <div className="flex items-center gap-3 mb-4">
                             <Zap size={18} className="text-fluent-teal" />
                             <h4 className="text-xs font-black uppercase tracking-widest text-fluent-navy">Latest Milestone</h4>
                          </div>
                          <p className="text-sm font-serif italic italic leading-relaxed text-slate-600">
                             "{reports[0]?.strengths || "Scholastic momentum is consistent with institutional standards."}"
                          </p>
                       </Card>
                       <Card className="p-6 bg-fluent-gold/5 border-fluent-gold/10">
                          <div className="flex items-center gap-3 mb-4">
                             <BrainCircuit size={18} className="text-fluent-gold" />
                             <h4 className="text-xs font-black uppercase tracking-widest text-fluent-navy">Synthesizer Goal</h4>
                          </div>
                          <p className="text-sm font-bold leading-relaxed text-fluent-navy">
                             {reports[0]?.actionPlan || "Initialize next-tier conceptual scaffolding phase."}
                          </p>
                       </Card>
                    </div>
                 </div>

                 <div className="space-y-8">
                    <Card className="p-6">
                       <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Alert Dispatch</h3>
                       <div className="space-y-4">
                          {alerts.length === 0 ? (
                            <div className="p-8 text-center text-xs text-slate-300 font-medium italic">No active alerts.</div>
                          ) : alerts.map(a => (
                            <div key={a.id} className="p-4 bg-gray-50 rounded-2xl border border-black/5 flex items-start gap-4">
                               <div className="w-8 h-8 rounded-lg bg-white border border-black/5 flex items-center justify-center text-fluent-gold shadow-sm"><Bell size={14} /></div>
                               <div>
                                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{a.type}</div>
                                  <p className="text-xs font-bold text-fluent-navy mt-0.5 leading-tight">{a.message}</p>
                               </div>
                            </div>
                          ))}
                       </div>
                       <Btn variant="outline" size="sm" className="w-full mt-6 py-3 text-[9px]">VIEW ALL DISPATCHES</Btn>
                    </Card>

                    <Card className="p-8 bg-fluent-gold text-fluent-navy shadow-xl shadow-fluent-gold/20">
                       <h3 className="text-xl font-serif font-bold mb-2">Book 1:1 Consultation</h3>
                       <p className="text-xs font-medium opacity-70 mb-8 leading-relaxed">Direct synch with {selectedChild.teacherName || 'Faculty Node'} to discuss scholastic strategy.</p>
                       <Btn variant="primary" size="md" className="w-full bg-fluent-navy text-white py-4 shadow-2xl shadow-fluent-navy/30">INITIATE REQUEST</Btn>
                    </Card>
                 </div>
              </div>
            </div>
        )}

        {tab === "reports" && (
          <div className="space-y-8 max-w-4xl">
             <h2 className="text-3xl font-serif font-bold text-fluent-navy">Weekly Accountability Logs</h2>
             <div className="space-y-6">
                {reports.map((r, i) => (
                  <Card key={r.id} className="p-8 border-black/5">
                     <div className="flex justify-between items-start mb-6">
                        <div>
                           <Badge color="gold" className="mb-2">{r.week}</Badge>
                           <h3 className="text-2xl font-serif font-bold">{r.subject || selectedChild.subject} Audit</h3>
                        </div>
                        <div className="text-4xl font-mono font-bold text-fluent-teal">{r.marks}%</div>
                     </div>
                     <div className="grid md:grid-cols-2 gap-8 py-8 border-y border-black/5 my-8">
                        <div>
                           <div className="text-[10px] font-black uppercase text-green-600 mb-4 tracking-widest">Strengths</div>
                           <p className="text-sm font-serif leading-relaxed">"{r.strengths}"</p>
                        </div>
                        <div>
                           <div className="text-[10px] font-black uppercase text-red-600 mb-4 tracking-widest">Scaffolding Gaps</div>
                           <p className="text-sm italic font-serif leading-relaxed">"{r.weaknesses}"</p>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <div className="p-6 bg-gray-50 rounded-2xl">
                           <div className="text-[10px] font-black uppercase text-slate-400 mb-2">Faculty Analysis</div>
                           <p className="text-sm font-bold leading-relaxed text-fluent-navy">"{r.teacherComment}"</p>
                        </div>
                        <div className="p-6 bg-fluent-navy text-white rounded-2xl">
                           <div className="text-[10px] font-black uppercase text-fluent-gold mb-2">Action Directive</div>
                           <p className="text-sm font-bold leading-relaxed">{r.actionPlan}</p>
                        </div>
                     </div>
                  </Card>
                ))}
             </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

function AlertCircle({ size, className }: { size: number, className: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function ShieldCheck({ size, className }: { size: number, className: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

