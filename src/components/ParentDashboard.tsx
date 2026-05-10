import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { motion } from "motion/react";
import { 
  Home, 
  FileText, 
  Bell, 
  Calendar, 
  LogOut, 
  TrendingUp, 
  Zap, 
  Sparkles, 
  BrainCircuit, 
  ChevronRight, 
  User, 
  MessageSquare, 
  Target, 
  CreditCard, 
  Settings, 
  ShieldCheck,
  Activity,
  Award,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ChevronDown,
  Search,
  Filter,
  MoreVertical,
  ThumbsUp,
  Download,
  AlertCircle
} from "lucide-react";
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
    { id: "scholar", label: "Scholar Profile", icon: User },
    { id: "reports", label: "Weekly Reports", icon: FileText, badge: "New" },
    { id: "attendance", label: "Attendance", icon: Calendar },
    { id: "alerts", label: "Alerts", icon: Bell, badge: alerts.length > 0 ? alerts.length : null },
    { id: "messaging", label: "Faculty Messaging", icon: MessageSquare, badge: "2" },
    { id: "sessions", label: "1:1 Sessions", icon: Clock },
    { id: "goals", label: "Academic Goals", icon: Target },
    { id: "payment", label: "Subscription", icon: CreditCard, badge: "Active" },
    { id: "settings", label: "Settings", icon: Settings },
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
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {tab === "overview" && (
            <div className="space-y-10">
              <header className="flex flex-col md:flex-row justify-between items-start gap-8">
                <div>
                  <div className="text-[10px] text-fluent-gold font-display font-medium uppercase tracking-[0.4em] mb-2">Guardian Protocol · Scholar Node Active</div>
                  <h1 className="text-4xl font-serif font-black text-fluent-midnight leading-none">Scholar <em className="not-italic text-fluent-gold italic">Overview</em></h1>
                  <p className="text-sm text-stone-500 font-serif italic mt-2">Real-time visibility into your scholar's academic pulse.</p>
                </div>
                <div className="flex gap-3">
                  <Btn variant="primary" size="sm" icon={Download} className="text-[9px] font-black tracking-widest uppercase px-6">Download Summary</Btn>
                  {children.length > 1 && (
                    <div className="flex gap-1 p-1 bg-white rounded border border-black/5 shadow-sm">
                      {children.map(c => (
                        <button 
                          key={c.id} 
                          onClick={() => setSelectedChild(c)}
                          className={`px-3 py-1.5 rounded text-[9px] font-black uppercase tracking-widest transition-all ${selectedChild.id === c.id ? 'bg-fluent-midnight text-white shadow-lg' : 'text-stone-400 hover:text-fluent-midnight'}`}
                        >
                          {c.name.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </header>

              {/* Scholar Highlight Card */}
              <div className="relative bg-fluent-midnight rounded-xl p-10 overflow-hidden shadow-2xl">
                 <div className="absolute inset-0 opacity-5 pointer-events-none">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(184,151,58,0.3),transparent_50%)]" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(184,151,58,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(184,151,58,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
                 </div>
                 
                 <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                    <div className="flex items-center gap-8">
                       <div className="relative group">
                          <Avatar name={selectedChild.name} size={100} />
                          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-fluent-gold rounded-full flex items-center justify-center text-fluent-midnight shadow-lg border-2 border-fluent-midnight">
                             <ShieldCheck size={14} className="text-fluent-midnight" />
                          </div>
                       </div>
                       <div>
                          <div className="text-[9px] font-black text-fluent-gold uppercase tracking-[0.4em] mb-3 flex items-center gap-2">
                             <div className="w-4 h-[1px] bg-fluent-gold" /> Week 5 Node
                          </div>
                          <h2 className="text-4xl font-serif font-bold text-fluent-cream leading-tight">{selectedChild.name.split(' ')[0]} <em className="not-italic text-fluent-gold italic">{selectedChild.name.split(' ')[1]}</em></h2>
                          <p className="text-xs text-white/40 mt-3 font-serif italic max-w-xs leading-relaxed">
                            <strong className="text-white/60 font-medium not-italic">{selectedChild.grade} · Mastery Cohort</strong> · Board Exam Elite Performance Protocol (95%+)
                          </p>
                       </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6 border-l border-white/10 pl-12">
                       <div className="space-y-1">
                          <div className="text-3xl font-serif font-bold text-fluent-gold">{selectedChild.total > 0 ? Math.round((selectedChild.attended/selectedChild.total)*100) : 0}%</div>
                          <div className="text-[8px] font-display font-medium uppercase text-white/30 tracking-widest">Attendance</div>
                          <div className="text-[9px] text-green-400 font-bold">▲ Optimal</div>
                       </div>
                       <div className="space-y-1">
                          <div className="text-3xl font-serif font-bold text-fluent-cream">{selectedChild.avgScore || 0}%</div>
                          <div className="text-[8px] font-display font-medium uppercase text-white/30 tracking-widest">Mastery Index</div>
                          <div className="text-[9px] text-fluent-gold font-bold">▲ +2.4%</div>
                       </div>
                       <div className="space-y-1">
                          <div className="text-xl font-serif font-bold text-fluent-gold uppercase tracking-tighter pt-2">
                             #04
                          </div>
                          <div className="text-[8px] font-display font-medium uppercase text-white/30 tracking-widest">Global Rank</div>
                          <div className="text-[9px] text-green-400 font-bold">▲ Up 2</div>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <div className="bg-white p-8 border border-black/5 rounded-xl group hover:border-fluent-gold transition-all">
                    <div className="flex justify-between items-start mb-6">
                       <div className="w-12 h-12 bg-stone-50 rounded flex items-center justify-center text-stone-400 group-hover:bg-fluent-gold group-hover:text-fluent-midnight transition-colors">
                          <Clock size={24} />
                       </div>
                       <Badge color="gold">2 Remaining</Badge>
                    </div>
                    <div className="text-[9px] font-display font-medium uppercase text-stone-400 tracking-widest mb-2">Sessions This Week</div>
                    <div className="text-3xl font-serif font-bold text-fluent-midnight">3 <span className="text-lg text-stone-300">/ 5</span></div>
                 </div>
                 
                 <div className="bg-white p-8 border border-black/5 rounded-xl group hover:border-fluent-gold transition-all">
                    <div className="flex justify-between items-start mb-6">
                       <div className="w-12 h-12 bg-stone-50 rounded flex items-center justify-center text-stone-400 group-hover:bg-green-500 group-hover:text-white transition-colors">
                          <Activity size={24} />
                       </div>
                       <Badge color="green">Peak</Badge>
                    </div>
                    <div className="text-[9px] font-display font-medium uppercase text-stone-400 tracking-widest mb-2">Study Streak</div>
                    <div className="text-3xl font-serif font-bold text-fluent-midnight">5 <span className="text-lg text-stone-400">Days</span></div>
                 </div>

                 <div className="bg-white p-8 border border-black/5 rounded-xl group hover:border-fluent-gold transition-all">
                    <div className="flex justify-between items-start mb-6">
                       <div className="w-12 h-12 bg-stone-50 rounded flex items-center justify-center text-stone-400 group-hover:bg-red-500 group-hover:text-white transition-colors">
                          <FileText size={24} />
                       </div>
                       <Badge color="red">1 Overdue</Badge>
                    </div>
                    <div className="text-[9px] font-display font-medium uppercase text-stone-400 tracking-widest mb-2">Assignments Due</div>
                    <div className="text-3xl font-serif font-bold text-red-600">2</div>
                 </div>

                 <div className="bg-white p-8 border border-black/5 rounded-xl group hover:border-fluent-gold transition-all">
                    <div className="flex justify-between items-start mb-6">
                       <div className="w-12 h-12 bg-stone-50 rounded flex items-center justify-center text-stone-400 group-hover:bg-fluent-midnight group-hover:text-fluent-gold transition-colors">
                          <Sparkles size={24} />
                       </div>
                       <Badge color="navy">High Activity</Badge>
                    </div>
                    <div className="text-[9px] font-display font-medium uppercase text-stone-400 tracking-widest mb-2">AI Tutor Queries</div>
                    <div className="text-3xl font-serif font-bold text-fluent-midnight">12</div>
                 </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-10">
                 <div className="lg:col-span-2 space-y-10">
                    <Card className="p-10">
                       <div className="flex justify-between items-start mb-10">
                          <div>
                             <div className="text-[10px] font-display font-medium uppercase text-fluent-gold tracking-[0.3em] mb-2">Subject Mastery Index</div>
                             <h3 className="text-2xl font-serif font-bold text-fluent-midnight italic underline decoration-fluent-gold/30 underline-offset-8">Cognitive Load Distribution</h3>
                          </div>
                          <Btn variant="outline" size="sm" className="text-[8px] tracking-[0.2em]">View Detailed Audit</Btn>
                       </div>
                       
                       <div className="space-y-8">
                          <div className="flex items-center gap-6">
                             <div className="w-12 h-12 bg-blue-50 rounded flex items-center justify-center text-blue-500">📐</div>
                             <div className="flex-1">
                                <div className="flex justify-between items-end mb-3">
                                   <div>
                                      <div className="text-sm font-bold text-fluent-midnight">Mathematics</div>
                                      <div className="text-[10px] text-stone-400 font-serif italic">Trigonometric Identities</div>
                                   </div>
                                   <div className="text-xl font-serif font-bold text-fluent-gold">68%</div>
                                </div>
                                <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                                   <motion.div initial={{ width: 0 }} animate={{ width: '68%' }} className="h-full bg-fluent-gold" />
                                </div>
                             </div>
                             <Badge color="gold">Needs Intervention</Badge>
                          </div>

                          <div className="flex items-center gap-6">
                             <div className="w-12 h-12 bg-purple-50 rounded flex items-center justify-center text-purple-500">⚗️</div>
                             <div className="flex-1">
                                <div className="flex justify-between items-end mb-3">
                                   <div>
                                      <div className="text-sm font-bold text-fluent-midnight">Physics</div>
                                      <div className="text-[10px] text-stone-400 font-serif italic">Newtonian Mechanics</div>
                                   </div>
                                   <div className="text-xl font-serif font-bold text-green-600">85%</div>
                                </div>
                                <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                                   <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} className="h-full bg-green-500" />
                                </div>
                             </div>
                             <Badge color="green">Excelled</Badge>
                          </div>

                          <div className="flex items-center gap-6">
                             <div className="w-12 h-12 bg-red-50 rounded flex items-center justify-center text-red-500">📝</div>
                             <div className="flex-1">
                                <div className="flex justify-between items-end mb-3">
                                   <div>
                                      <div className="text-sm font-bold text-fluent-midnight">English</div>
                                      <div className="text-[10px] text-stone-400 font-serif italic">Synthesis & Rhetoric</div>
                                   </div>
                                   <div className="text-xl font-serif font-bold text-red-600">44%</div>
                                </div>
                                <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                                   <motion.div initial={{ width: 0 }} animate={{ width: '44%' }} className="h-full bg-red-500" />
                                </div>
                             </div>
                             <Badge color="red">Critical Gap</Badge>
                          </div>
                       </div>
                    </Card>

                    <Card className="p-10">
                       <div className="text-[10px] font-display font-medium uppercase text-fluent-gold tracking-[0.3em] mb-10">Mastery Arc trajectory</div>
                       <div className="h-[250px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                             <LineChart data={reports.slice().reverse()}>
                                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#9CA3AF', fontFamily: 'Cinzel' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#9CA3AF', fontFamily: 'Cinzel' }} domain={[0, 100]} />
                                <Tooltip 
                                  contentStyle={{ 
                                    borderRadius: '8px', 
                                    border: '1px solid rgba(0,0,0,0.05)', 
                                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)',
                                    fontFamily: 'Cormorant Garamond',
                                    fontStyle: 'italic'
                                  }} 
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="marks" 
                                  stroke="#B8973A" 
                                  strokeWidth={4} 
                                  dot={{ r: 4, fill: '#B8973A', stroke: 'white', strokeWidth: 2 }} 
                                  activeDot={{ r: 8, fill: '#0A0E1A' }} 
                                />
                             </LineChart>
                          </ResponsiveContainer>
                       </div>
                    </Card>
                 </div>

                 <div className="space-y-8">
                    <Card className="p-8 border-fluent-gold/20 bg-fluent-gold/5">
                       <div className="text-[10px] font-display font-medium uppercase text-fluent-gold tracking-[0.3em] mb-6">Latest Faculty Directives</div>
                       <div className="space-y-6">
                          <div className="border-l-2 border-fluent-gold pl-4 space-y-2">
                             <div className="text-[9px] font-bold text-fluent-midnight uppercase tracking-widest">Ms. Priya Mehta · Week 5</div>
                             <p className="text-sm font-serif italic text-stone-600 leading-relaxed">"Newton's Laws much improved. Prioritise English tense work before Thursday."</p>
                             <div className="text-[9px] text-stone-400">9 May 2026</div>
                          </div>
                          <div className="border-l-2 border-red-500 pl-4 space-y-2">
                             <div className="text-[9px] font-bold text-red-600 uppercase tracking-widest">Dr. Collins · Critical</div>
                             <p className="text-sm font-serif italic text-stone-600 leading-relaxed">"Ensure 20 min daily AI Tutor sessions for tense synthesis — this is critical."</p>
                             <div className="text-[9px] text-stone-400">8 May 2026</div>
                          </div>
                       </div>
                    </Card>

                    <Card className="p-8">
                       <div className="text-[10px] font-display font-medium uppercase text-stone-400 tracking-[0.3em] mb-6">Recent Alerts</div>
                       <div className="space-y-4">
                          {alerts.length === 0 ? (
                            <div className="p-8 text-center text-[10px] text-stone-300 font-bold uppercase tracking-widest italic">Node Silent.</div>
                          ) : alerts.map(a => (
                            <div key={a.id} className="flex gap-4 group cursor-pointer hover:translate-x-1 transition-transform">
                               <div className="w-8 h-8 rounded bg-stone-50 border border-black/5 flex items-center justify-center text-stone-400 group-hover:text-fluent-gold shadow-sm"><Bell size={14} /></div>
                               <div>
                                  <div className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">{a.type}</div>
                                  <p className="text-xs font-bold text-fluent-midnight mt-0.5 leading-tight">{a.message}</p>
                                  <div className="text-[8px] text-stone-300 mt-1 uppercase tracking-widest">Recent</div>
                               </div>
                            </div>
                          ))}
                       </div>
                       <Btn variant="outline" size="sm" className="w-full mt-8 text-[8px] tracking-[0.2em] uppercase font-black">Open Alert Node</Btn>
                    </Card>

                    <Card className="p-10 bg-fluent-midnight text-white shadow-2xl relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                          <Calendar size={120} />
                       </div>
                       <div className="relative z-10">
                          <h3 className="text-2xl font-serif font-bold mb-3 italic">Book 1:1 Consultation</h3>
                          <p className="text-xs font-serif italic text-white/40 mb-10 leading-relaxed">Direct synch with Faculty Lead to discuss scholastic strategy and gap closure.</p>
                          <Btn variant="gold" size="md" className="w-full py-5 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-fluent-gold/10">Initiate Strategy Session</Btn>
                       </div>
                    </Card>
                 </div>
              </div>
            </div>
        )}

        {tab === "scholar" && (
           <div className="space-y-12">
             <header>
               <div className="text-[10px] text-fluent-gold font-display font-medium uppercase tracking-[0.4em] mb-2">Guardian Protocol · Academic Identity</div>
               <h1 className="text-4xl font-serif font-black text-fluent-midnight leading-none">Scholar <em className="not-italic text-fluent-gold italic">Profile</em></h1>
               <p className="text-sm text-stone-500 font-serif italic mt-2">Full academic identity, cohort details, and performance snapshot.</p>
             </header>

             <Card className="p-10 bg-white border-black/5 shadow-sm">
                <div className="grid lg:grid-cols-3 gap-12 items-center">
                   <div className="flex items-center gap-8 lg:col-span-2">
                      <Avatar name={selectedChild.name} size={112} />
                      <div className="space-y-3">
                         <h2 className="text-4xl font-serif font-bold text-fluent-midnight">{selectedChild.name}</h2>
                         <div className="text-sm text-stone-500 font-serif italic leading-relaxed">
                            <strong className="text-fluent-midnight not-italic font-bold">{selectedChild.grade}</strong> · Mastery Cohort · British Pedagogy Stream<br/>
                            <strong className="text-fluent-midnight not-italic">Scholar ID:</strong> FI-2026-G9-{selectedChild.id.slice(-4).toUpperCase()} · <strong className="text-fluent-midnight not-italic">Enrolled:</strong> Jan 2026
                         </div>
                         <div className="flex gap-2 pt-2">
                            <Badge color="gold">Verified Scholar</Badge>
                            <Badge color="green">Active Mastery</Badge>
                            <Badge color="navy">High Traction</Badge>
                         </div>
                      </div>
                   </div>
                   <div className="text-right space-y-6 border-l border-black/5 pl-12 lg:block hidden">
                      <div>
                         <div className="text-4xl font-serif font-bold text-fluent-gold leading-none">68%</div>
                         <div className="text-[9px] font-display font-bold uppercase text-stone-400 tracking-widest mt-1">Holistic Mastery</div>
                      </div>
                      <div>
                         <div className="text-4xl font-serif font-bold text-fluent-midnight leading-none">#04</div>
                         <div className="text-[9px] font-display font-bold uppercase text-stone-400 tracking-widest mt-1">Global Rank</div>
                      </div>
                   </div>
                </div>
             </Card>

             <div className="grid lg:grid-cols-2 gap-10">
                <Card className="p-10">
                   <div className="text-[10px] font-display font-medium uppercase text-fluent-gold tracking-[0.3em] mb-8">Cohort Parameters</div>
                   <div className="space-y-6">
                      {[
                        { label: 'Plan', val: 'Mastery Cohort', sub: '₹14,500/mo' },
                        { label: 'Cohort Batch', val: 'G9-MC-04', sub: '18/20 scholars' },
                        { label: 'Weekly Sessions', val: '5 Scheduled', sub: 'In-person / Virtual Sync' },
                        { label: 'AI Tutor Status', val: 'Tier 1 Access', sub: '24/7 Unlimited' },
                        { label: 'Next Assessment', val: 'Sunday, 17 May', sub: 'Weekly Synthesis Audit' }
                      ].map((item, id) => (
                        <div key={id} className="flex justify-between items-center py-4 border-b border-black/5 last:border-0">
                           <div>
                              <div className="text-[9px] font-display font-medium text-stone-400 uppercase tracking-widest">{item.label}</div>
                              <div className="text-sm font-bold text-fluent-midnight mt-1">{item.val}</div>
                           </div>
                           <div className="text-xs font-serif italic text-stone-400">{item.sub}</div>
                        </div>
                      ))}
                   </div>
                </Card>

                <Card className="p-10 bg-fluent-gold/5 border-fluent-gold/10">
                   <div className="text-[10px] font-display font-medium uppercase text-fluent-gold tracking-[0.3em] mb-8">Faculty Oversight</div>
                   <div className="space-y-8">
                      <div className="flex gap-6">
                         <Avatar name="Priya Mehta" size={48} />
                         <div>
                            <div className="text-sm font-bold text-fluent-midnight">Ms. Priya Mehta</div>
                            <div className="text-[9px] font-display text-fluent-gold uppercase tracking-widest font-bold">Physics Lead · British Trained</div>
                            <p className="text-[11px] text-stone-500 font-serif italic mt-2 leading-relaxed">"Akshu is responding well to the structural logic of Newtonian mechanics. Need to boost English synthesis to prevent a drag on interdisciplinary outcomes."</p>
                         </div>
                      </div>
                      <div className="flex gap-6">
                         <Avatar name="James Collins" size={48} />
                         <div>
                            <div className="text-sm font-bold text-fluent-midnight">Dr. James Collins</div>
                            <div className="text-[9px] font-display text-fluent-gold uppercase tracking-widest font-bold">English & Rhetoric Lead</div>
                            <p className="text-[11px] text-stone-500 font-serif italic mt-2 leading-relaxed">"Critical gap and fossilization in tense synthesis. We are prioritizing this in the next three sessions."</p>
                         </div>
                      </div>
                      <Btn variant="primary" className="w-full mt-4 text-[9px] uppercase font-black tracking-widest">Connect with Lead Faculty</Btn>
                   </div>
                </Card>
             </div>
           </div>
        )}

        {tab === "reports" && (
          <div className="space-y-12">
             <header className="flex flex-col md:flex-row justify-between items-start gap-8">
               <div>
                 <div className="text-[10px] text-fluent-gold font-display font-medium uppercase tracking-[0.4em] mb-2">Guardian Protocol · Reports Archive</div>
                 <h1 className="text-4xl font-serif font-black text-fluent-midnight leading-none">Weekly <em className="not-italic text-fluent-gold italic">Reports</em></h1>
                 <p className="text-sm text-stone-500 font-serif italic mt-2">Full narrative audits of your scholar's cognitive trajectory, delivered every Sunday.</p>
               </div>
               <Btn variant="primary" size="sm" icon={Download} className="text-[9px] font-black tracking-widest uppercase px-6">Download All</Btn>
             </header>

             <div className="space-y-8">
                {reports.length === 0 ? (
                  <Card className="p-20 text-center flex flex-col items-center gap-4 bg-white/50 border-dashed border-2">
                     <FileText size={48} className="text-stone-300" />
                     <div className="font-serif text-xl font-bold text-stone-400 italic">No audits generated for the current node.</div>
                  </Card>
                ) : reports.map((r, i) => (
                  <Card key={r.id} className={`overflow-hidden border-black/5 ${i === 0 ? 'ring-2 ring-fluent-gold/20' : ''}`}>
                     <div className="p-8 border-b border-black/5 bg-stone-50/50 flex justify-between items-center">
                        <div className="space-y-1">
                           <div className="text-[10px] font-display font-bold text-fluent-gold uppercase tracking-[0.2em]">{r.week} · {r.date || 'Pending Date'}</div>
                           <h3 className="text-2xl font-serif font-bold text-fluent-midnight">Synthesis Progress Delta Report</h3>
                        </div>
                        <div className="flex gap-3 items-center">
                           {i === 0 && <Badge color="gold">Latest Audit</Badge>}
                           <Btn variant="outline" size="sm" className="text-[8px] font-black tracking-widest uppercase px-4">View Analysis</Btn>
                        </div>
                     </div>
                     <div className="p-10 grid md:grid-cols-4 gap-10">
                        <div className="space-y-2">
                           <div className="text-[9px] font-display font-medium uppercase text-stone-400 tracking-widest">Holistic Mastery</div>
                           <div className="text-4xl font-serif font-bold text-fluent-gold">{r.marks}%</div>
                           <div className="text-[10px] text-green-500 font-bold">▲ +2.4% Delta</div>
                        </div>
                        <div className="space-y-2">
                           <div className="text-[9px] font-display font-medium uppercase text-stone-400 tracking-widest">Confidence Index</div>
                           <div className="text-4xl font-serif font-bold text-fluent-midnight">7.2<span className="text-lg text-stone-300">/10</span></div>
                           <div className="text-[10px] text-green-500 font-bold">▲ +0.5 Delta</div>
                        </div>
                        <div className="space-y-2">
                           <div className="text-[9px] font-display font-medium uppercase text-stone-400 tracking-widest">Sessions Logged</div>
                           <div className="text-4xl font-serif font-bold text-fluent-midnight">3<span className="text-lg text-stone-300">/5</span></div>
                           <div className="text-[10px] text-fluent-gold font-bold italic">2 Synch Gaps</div>
                        </div>
                        <div className="space-y-2 text-right">
                           <div className="text-[9px] font-display font-medium uppercase text-stone-400 tracking-widest">Global Node Rank</div>
                           <div className="text-4xl font-serif font-bold text-fluent-midnight italic underline decoration-fluent-gold/30">#04</div>
                           <div className="text-[10px] text-green-500 font-bold">▲ Up 2</div>
                        </div>
                     </div>
                     <div className="p-6 bg-fluent-midnight text-fluent-cream flex justify-between items-center text-[9px] font-display uppercase tracking-[0.25em] font-medium px-10">
                        <div>Verified Faculty: Ms. Priya Mehta · Dr. Collins · AI Synthesis Engine</div>
                        <div className="flex items-center gap-2 text-green-400 font-bold">
                           <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                           Institutional Grade Audit
                        </div>
                     </div>
                  </Card>
                ))}
             </div>
          </div>
        )}

        {tab === "attendance" && (
           <div className="space-y-12">
             <header>
               <div className="text-[10px] text-fluent-gold font-display font-medium uppercase tracking-[0.4em] mb-2">Guardian Protocol · Attendance Tracker</div>
               <h1 className="text-4xl font-serif font-black text-fluent-midnight leading-none">Attendance <em className="not-italic text-fluent-gold italic">Record</em></h1>
               <p className="text-sm text-stone-500 font-serif italic mt-2">Full session attendance log across all subjects and cohort classes.</p>
             </header>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-8 border-l-4 border-l-green-500">
                   <div className="text-[9px] font-display font-bold uppercase text-stone-400 tracking-widest mb-2">Sessions Attended</div>
                   <div className="text-4xl font-serif font-bold text-green-600">18</div>
                   <div className="text-[10px] text-stone-400 mt-2 italic">Out of 25 scheduled sessions</div>
                </Card>
                <Card className="p-8 border-l-4 border-l-red-500">
                   <div className="text-[9px] font-display font-bold uppercase text-stone-400 tracking-widest mb-2">Sessions Missed</div>
                   <div className="text-4xl font-serif font-bold text-red-600">5</div>
                   <div className="text-[10px] text-red-400 mt-2 font-bold uppercase tracking-widest">2 Unexcused Gaps</div>
                </Card>
                <Card className="p-8 border-l-4 border-l-fluent-gold">
                   <div className="text-[9px] font-display font-bold uppercase text-stone-400 tracking-widest mb-2">Late Arrivals</div>
                   <div className="text-4xl font-serif font-bold text-fluent-gold">2</div>
                   <div className="text-[10px] text-stone-400 mt-2 italic">Within 5 min institutional tolerance</div>
                </Card>
             </div>

             <Card className="p-10">
                <div className="flex justify-between items-center mb-10">
                   <h3 className="text-2xl font-serif font-bold text-fluent-midnight underline decoration-fluent-gold/20 underline-offset-8">May 2026 · Attendance Node</h3>
                   <div className="flex gap-4">
                      <div className="flex items-center gap-2 text-[9px] font-display font-bold uppercase tracking-widest text-stone-400 border border-black/5 px-3 py-1.5 rounded">
                         <div className="w-2 h-2 rounded-full bg-green-500" /> Present
                      </div>
                      <div className="flex items-center gap-2 text-[9px] font-display font-bold uppercase tracking-widest text-stone-400 border border-black/5 px-3 py-1.5 rounded">
                         <div className="w-2 h-2 rounded-full bg-red-500" /> Absent
                      </div>
                      <div className="flex items-center gap-2 text-[9px] font-display font-bold uppercase tracking-widest text-stone-400 border border-black/5 px-3 py-1.5 rounded">
                         <div className="w-2 h-2 rounded-full bg-fluent-gold" /> Scheduled
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-7 gap-3">
                   {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                     <div key={d} className="text-center text-[9px] font-display font-black text-stone-400 uppercase tracking-widest pb-4">{d}</div>
                   ))}
                   {Array.from({ length: 31 }).map((_, i) => {
                     const status = i < 10 ? 'present' : (i < 15 ? 'scheduled' : 'none');
                     const isToday = i + 1 === 10;
                     return (
                       <div key={i} className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all border ${
                         isToday ? 'ring-2 ring-fluent-gold ring-offset-2' : ''
                       } ${
                         status === 'present' ? 'bg-green-50 text-green-600 border-green-100' :
                         status === 'scheduled' ? 'bg-fluent-gold/10 text-fluent-gold border-fluent-gold/20' :
                         'bg-stone-50/50 text-stone-300 border-black/5'
                       }`}>
                         {i + 1}
                       </div>
                     );
                   })}
                </div>
             </Card>
           </div>
        )}

        {tab === "alerts" && (
           <div className="space-y-12">
             <header className="flex flex-col md:flex-row justify-between items-start gap-8">
               <div>
                 <div className="text-[10px] text-fluent-gold font-display font-medium uppercase tracking-[0.4em] mb-2">Guardian Protocol · Real-Time Alerts</div>
                 <h1 className="text-4xl font-serif font-black text-fluent-midnight leading-none">Protocol <em className="not-italic text-fluent-gold italic">Alerts</em></h1>
                 <p className="text-sm text-stone-500 font-serif italic mt-2">Immediate notifications on your scholar's academic pulse, performance, and behaviour.</p>
               </div>
               <Btn variant="outline" size="sm" className="text-[9px] font-black tracking-widest uppercase px-6">Mark All Read</Btn>
             </header>

             <div className="space-y-4">
                <Card className="p-8 border-l-4 border-l-red-600 group hover:shadow-xl transition-all cursor-pointer">
                   <div className="flex gap-6 items-start">
                      <div className="w-12 h-12 bg-red-50 rounded flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                         <AlertCircle size={24} className="text-red-600" />
                      </div>
                      <div className="flex-1 space-y-2">
                         <div className="flex justify-between items-center text-[10px] font-display font-medium text-stone-400 uppercase tracking-widest">
                            <span>Critical Gap · English</span>
                            <span>Today · 9:14 AM</span>
                         </div>
                         <h3 className="text-xl font-serif font-black text-fluent-midnight italic underline decoration-red-600/20 underline-offset-8">Tense Synthesis Intervention Required</h3>
                         <p className="text-sm font-serif italic text-stone-600 leading-relaxed max-w-2xl">
                           Dr. Collins has flagged English tense synthesis as critically below standard (44%). Immediate AI Tutor intervention and daily 20-min practice sessions are advised to prevent interdisciplinary friction.
                         </p>
                      </div>
                      <Btn variant="primary" size="sm" className="text-[8px] tracking-[0.2em] px-5">DEPLOY INTERVENTION</Btn>
                   </div>
                </Card>

                <Card className="p-8 border-l-4 border-l-fluent-gold group hover:shadow-xl transition-all cursor-pointer opacity-80">
                   <div className="flex gap-6 items-start">
                      <div className="w-12 h-12 bg-stone-50 rounded flex items-center justify-center text-fluent-gold">
                         <FileText size={24} />
                      </div>
                      <div className="flex-1 space-y-2">
                         <div className="flex justify-between items-center text-[10px] font-display font-medium text-stone-400 uppercase tracking-widest">
                            <span>Assignment · History</span>
                            <span>Yesterday · 6:00 PM</span>
                         </div>
                         <h3 className="text-xl font-serif font-black text-fluent-midnight italic">Assignment Overdue: Restoration Period Node</h3>
                         <p className="text-sm font-serif italic text-stone-600 leading-relaxed max-w-2xl">
                           The Restoration Period synthesis node was due 9 May and remains unsubmitted. Please encourage your scholar to complete the node before the next cohort sync.
                         </p>
                      </div>
                   </div>
                </Card>

                <Card className="p-8 border-l-4 border-l-green-600 group hover:shadow-xl transition-all cursor-pointer opacity-70">
                   <div className="flex gap-6 items-start">
                      <div className="w-12 h-12 bg-green-50 rounded flex items-center justify-center text-green-600">
                         <Award size={24} />
                      </div>
                      <div className="flex-1 space-y-2">
                         <div className="flex justify-between items-center text-[10px] font-display font-medium text-stone-400 uppercase tracking-widest">
                            <span>Milestone Node</span>
                            <span>9 May · 8:00 AM</span>
                         </div>
                         <h3 className="text-xl font-serif font-black text-fluent-midnight italic">Rank Improved → #04 Global Node</h3>
                         <p className="text-sm font-serif italic text-stone-600 leading-relaxed max-w-2xl">
                           Akshu has moved up 2 places to Global Rank #04. This reflects a consistent 2.4% improvement in the Week 5 Mastery Index. Positive momentum detected.
                         </p>
                      </div>
                   </div>
                </Card>
             </div>
           </div>
        )}

        {tab === "messaging" && (
           <div className="space-y-12">
             <header>
               <div className="text-[10px] text-fluent-gold font-display font-medium uppercase tracking-[0.4em] mb-2">Guardian Protocol · Direct Faculty Messaging</div>
               <h1 className="text-4xl font-serif font-black text-fluent-midnight leading-none">Faculty <em className="not-italic text-fluent-gold italic">Messaging</em></h1>
               <p className="text-sm text-stone-500 font-serif italic mt-2">Direct, encrypted communication with your scholar's teaching faculty.</p>
             </header>

             <Card className="p-0 overflow-hidden min-h-[600px] flex">
                <div className="w-80 border-r border-black/5 bg-stone-50/50 flex flex-col">
                   <div className="p-6 border-b border-black/5">
                      <div className="relative">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={14} />
                         <input className="w-full bg-white border border-black/5 rounded py-2.5 pl-10 pr-4 text-xs font-serif italic outline-none focus:border-fluent-gold transition-all" placeholder="Search faculty nodes..." />
                      </div>
                   </div>
                   <div className="flex-1 overflow-y-auto">
                      {[
                        { name: 'Ms. Priya Mehta', role: 'Physics Lead', last: 'Focus on Tense before Thursday', active: true, unread: 2 },
                        { name: 'Dr. James Collins', role: 'English Lead', last: 'Daily AI sessions are essential', active: false },
                        { name: 'Mr. Arjun Sharma', role: 'Math Lead', last: 'Great work on problem set', active: false },
                        { name: 'Ms. Sunita Rao', role: 'Chemistry Lead', last: 'Quiz rescheduled node', active: false },
                      ].map((c, id) => (
                        <div key={id} className={`p-6 border-b border-black/5 cursor-pointer transition-all hover:bg-white ${c.active ? 'bg-white ring-inset ring-1 ring-fluent-gold/20' : ''}`}>
                           <div className="flex gap-4">
                              <Avatar name={c.name} size={40} />
                              <div className="flex-1 min-w-0">
                                 <div className="flex justify-between items-start">
                                    <div className="text-xs font-bold text-fluent-midnight truncate">{c.name}</div>
                                    <div className="text-[8px] text-stone-400 font-display font-medium uppercase">9 May</div>
                                 </div>
                                 <div className="text-[9px] font-display text-fluent-gold uppercase tracking-widest mt-0.5">{c.role}</div>
                                 <div className="text-[11px] text-stone-400 font-serif italic truncate mt-1">{c.last}</div>
                              </div>
                              {c.unread && <div className="w-4 h-4 rounded-full bg-fluent-gold text-fluent-midnight text-[8px] font-black flex items-center justify-center shrink-0">{c.unread}</div>}
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
                <div className="flex-1 flex flex-col">
                   <div className="p-6 border-b border-black/5 flex justify-between items-center bg-white">
                      <div className="flex gap-4 items-center">
                         <Avatar name="Priya Mehta" size={44} />
                         <div>
                            <div className="text-sm font-bold text-fluent-midnight">Ms. Priya Mehta</div>
                            <div className="text-[10px] font-display text-fluent-gold uppercase tracking-widest font-bold">Physics Lead · British Trained Node</div>
                         </div>
                      </div>
                      <div className="flex gap-2">
                         <Btn variant="outline" size="sm" icon={Activity} className="text-[8px] font-black tracking-widest uppercase">Node Health</Btn>
                         <Btn variant="primary" size="sm" icon={MoreVertical} className="p-0 w-8 h-8 flex items-center justify-center" />
                      </div>
                   </div>
                   <div className="flex-1 p-10 space-y-8 overflow-y-auto bg-stone-50/20">
                      <div className="flex gap-6 max-w-2xl">
                         <Avatar name="Priya Mehta" size={40} />
                         <div className="space-y-2">
                            <div className="bg-white p-6 rounded-2xl rounded-tl-none border border-black/5 shadow-sm text-sm font-serif italic text-stone-600 leading-relaxed">
                               "Good afternoon, Kapisha. Akshu's understanding of Newton's Laws has shown remarkable improvement this week. The synthesis approach is clearly working."
                            </div>
                            <div className="text-[9px] text-stone-400 font-display font-medium uppercase">Ms. Mehta · 2:14 PM</div>
                         </div>
                      </div>

                      <div className="flex gap-6 justify-end">
                         <div className="space-y-2 text-right flex flex-col items-end">
                            <div className="bg-fluent-midnight p-6 rounded-2xl rounded-tr-none text-white text-sm font-serif italic leading-relaxed max-w-2xl">
                               Thank you, Ms. Mehta. We\'ve been encouraging the AI Tutor sessions at home. Should we be concerned about the English gap?
                            </div>
                            <div className="text-[9px] text-stone-400 font-display font-medium uppercase">You · 2:22 PM</div>
                         </div>
                         <Avatar name={profile?.name || 'Guardian'} size={40} />
                      </div>
                   </div>
                   <div className="p-6 border-t border-black/5 bg-white">
                      <div className="flex gap-4">
                         <input className="flex-1 bg-stone-50 border border-black/5 rounded-xl px-6 py-4 text-sm font-serif italic outline-none focus:border-fluent-gold transition-all" placeholder="Message Ms. Priya Mehta..." />
                         <Btn variant="primary" className="px-8 text-[10px] font-black tracking-widest uppercase">Send Dispatch</Btn>
                      </div>
                   </div>
                </div>
             </Card>
           </div>
        )}

        {tab === "sessions" && (
           <div className="space-y-12">
             <header className="flex flex-col md:flex-row justify-between items-start gap-8">
               <div>
                 <div className="text-[10px] text-fluent-gold font-display font-medium uppercase tracking-[0.4em] mb-2">Guardian Protocol · 1:1 Sessions</div>
                 <h1 className="text-4xl font-serif font-black text-fluent-midnight leading-none">1:1 <em className="not-italic text-fluent-gold italic">Sessions</em></h1>
                 <p className="text-sm text-stone-500 font-serif italic mt-2">Targeted intervention sessions with British-trained faculty, outside standard cohort hours.</p>
               </div>
               <Btn variant="gold" size="sm" icon={Calendar} className="text-[9px] font-black tracking-widest uppercase px-6">+ Book New Session</Btn>
             </header>

             <div className="space-y-10">
                <div>
                   <div className="text-[10px] font-display font-medium uppercase text-stone-400 tracking-[0.3em] mb-8">Upcoming Sessions</div>
                   <div className="space-y-4">
                      <Card className="p-8 group hover:border-fluent-gold transition-all cursor-pointer">
                         <div className="flex items-center gap-10">
                            <div className="w-20 h-20 bg-fluent-midnight rounded flex flex-col items-center justify-center text-fluent-gold">
                               <div className="text-3xl font-serif font-bold">13</div>
                               <div className="text-[8px] font-display font-black uppercase tracking-widest">May</div>
                            </div>
                            <div className="flex-1 space-y-2">
                               <div className="flex gap-3">
                                  <Badge color="red">Critical Intervention</Badge>
                                  <div className="text-[9px] font-display font-medium text-fluent-gold uppercase tracking-widest">English · Tense Synthesis</div>
                               </div>
                               <h3 className="text-2xl font-serif font-bold text-fluent-midnight italic underline decoration-fluent-gold/20 underline-offset-4">Tense Synthesis Targeted Remediation</h3>
                               <div className="flex items-center gap-4 text-xs text-stone-400 font-serif italic">
                                  <span>Dr. James Collins · British Faculty Node</span>
                                  <span className="w-1 h-1 rounded-full bg-stone-300" />
                                  <span>1:1 Protocol · Secure Video</span>
                               </div>
                            </div>
                            <div className="text-right space-y-4">
                               <div>
                                  <div className="text-2xl font-serif font-bold text-fluent-midnight leading-none">11:00 AM</div>
                                  <div className="text-[10px] font-display font-medium text-stone-400 uppercase tracking-widest mt-1">45 min · Included in plan</div>
                               </div>
                               <Btn variant="outline" size="sm" className="text-[8px] font-black tracking-widest uppercase px-4">Reschedule</Btn>
                            </div>
                         </div>
                      </Card>

                      <Card className="p-8 group hover:border-fluent-gold transition-all cursor-pointer">
                         <div className="flex items-center gap-10">
                            <div className="w-20 h-20 bg-fluent-midnight rounded flex flex-col items-center justify-center text-fluent-gold">
                               <div className="text-3xl font-serif font-bold">15</div>
                               <div className="text-[8px] font-display font-black uppercase tracking-widest">May</div>
                            </div>
                            <div className="flex-1 space-y-2">
                               <div className="flex gap-3">
                                  <Badge color="gold">Scheduled</Badge>
                                  <div className="text-[9px] font-display font-medium text-fluent-gold uppercase tracking-widest">Mathematics · Analysis</div>
                               </div>
                               <h3 className="text-2xl font-serif font-bold text-fluent-midnight italic">Quadratic Equations: Problem Walkthrough</h3>
                               <div className="flex items-center gap-4 text-xs text-stone-400 font-serif italic">
                                  <span>Mr. Arjun Sharma · India Node</span>
                                  <span className="w-1 h-1 rounded-full bg-stone-300" />
                                  <span>1:1 Protocol · Secure Video</span>
                               </div>
                            </div>
                            <div className="text-right space-y-4">
                               <div>
                                  <div className="text-2xl font-serif font-bold text-fluent-midnight leading-none">3:00 PM</div>
                                  <div className="text-[10px] font-display font-medium text-stone-400 uppercase tracking-widest mt-1">30 min · Included in plan</div>
                               </div>
                               <Btn variant="outline" size="sm" className="text-[8px] font-black tracking-widest uppercase px-4">Reschedule</Btn>
                            </div>
                         </div>
                      </Card>
                   </div>
                </div>

                <Card className="p-10 bg-fluent-midnight text-white shadow-2xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                      <Sparkles size={180} />
                   </div>
                   <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                      <div className="space-y-4">
                         <div className="text-[10px] font-display font-medium uppercase text-fluent-gold tracking-[0.3em]">Need More Support?</div>
                         <h3 className="text-4xl font-serif font-bold text-fluent-cream leading-tight italic">Book an Additional <em className="not-italic text-fluent-gold italic underline decoration-fluent-gold/30 underline-offset-8">1:1 Session</em></h3>
                         <p className="text-sm font-serif italic text-white/40 leading-relaxed max-w-sm">
                           Faculty available for targeted gap closure outside standard cohort hours. All sessions are curriculum-mapped to identified mastery gaps.
                         </p>
                      </div>
                      <div className="flex flex-col gap-3">
                         <Btn variant="gold" className="py-5 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-fluent-gold/10">Initiate Strategy Session</Btn>
                         <Btn variant="outline" className="py-5 text-[10px] font-black uppercase tracking-widest text-white border-white/10 hover:border-white transition-all">View Available Faculty Node →</Btn>
                      </div>
                   </div>
                </Card>
             </div>
           </div>
        )}

        {tab === "goals" && (
           <div className="space-y-12">
             <header className="flex flex-col md:flex-row justify-between items-start gap-8">
               <div>
                 <div className="text-[10px] text-fluent-gold font-display font-medium uppercase tracking-[0.4em] mb-2">Guardian Protocol · Academic Trajectory</div>
                 <h1 className="text-4xl font-serif font-black text-fluent-midnight leading-none">Academic <em className="not-italic text-fluent-gold italic">Goals</em></h1>
                 <p className="text-sm text-stone-500 font-serif italic mt-2">Set, track, and review your scholar's short and long-term academic objectives.</p>
               </div>
               <Btn variant="primary" size="sm" icon={Target} className="text-[9px] font-black tracking-widest uppercase px-6">+ Add New Goal</Btn>
             </header>

             <div className="space-y-6">
                {[
                  { title: 'Board Exam Elite Performance', desc: 'Achieve 95%+ aggregate across all subjects in the 2026 Board Examination.', status: 'In Progress', color: 'gold', progress: 68, due: 'Jun 2026' },
                  { title: 'English Tense Synthesis Remediation', desc: 'Bring English tense mastery from 44% to 75%+ within 3 weeks through daily AI Tutor practice.', status: 'Urgent', color: 'red', progress: 44, due: '31 May' },
                  { title: 'Top 3 Global Rank', desc: 'Achieve a Global Rank of #03 or higher by end of Week 8.', status: 'On Track', color: 'gold', progress: 75, val: '#04', due: 'Week 8' },
                  { title: '10-Day AI Tutor Streak', desc: 'Maintain daily AI Tutor engagement for 10 consecutive days.', status: 'In Progress', color: 'green', progress: 50, due: 'Ongoing' }
                ].map((g, idx) => (
                  <Card key={idx} className="p-8 group hover:border-fluent-gold transition-all cursor-pointer">
                     <div className="flex gap-10 items-center">
                        <div className={`w-16 h-16 rounded flex items-center justify-center text-2xl shadow-sm ${
                          g.color === 'red' ? 'bg-red-50 text-red-500' : 
                          g.color === 'gold' ? 'bg-fluent-gold/10 text-fluent-gold' : 'bg-green-50 text-green-500'
                        }`}>
                           {idx === 0 ? '🎯' : idx === 1 ? '📝' : idx === 2 ? '🏅' : '⚡'}
                        </div>
                        <div className="flex-1 space-y-4">
                           <div className="space-y-1">
                              <div className="flex gap-3 items-center">
                                 <h3 className="text-xl font-serif font-bold text-fluent-midnight italic">{g.title}</h3>
                                 <Badge color={g.color as any}>{g.status}</Badge>
                              </div>
                              <p className="text-sm font-serif italic text-stone-500 leading-relaxed">{g.desc}</p>
                           </div>
                           <div className="space-y-3">
                              <div className="flex justify-between items-center text-[10px] font-display font-bold uppercase tracking-widest text-stone-400">
                                 <span>Impact Progress: {g.progress}%</span>
                                 <span>{g.due} deadline</span>
                              </div>
                              <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                                 <motion.div initial={{ width: 0 }} animate={{ width: `${g.progress}%` }} className={`h-full ${
                                    g.color === 'red' ? 'bg-red-500' : g.color === 'gold' ? 'bg-fluent-gold' : 'bg-green-500'
                                 }`} />
                              </div>
                           </div>
                        </div>
                        <div className="text-right shrink-0">
                           <div className={`text-4xl font-serif font-bold ${g.color === 'red' ? 'text-red-600' : 'text-fluent-gold'}`}>{g.val || `${g.progress}%`}</div>
                           <div className="text-[10px] font-display font-medium text-stone-400 uppercase tracking-widest mt-2">{g.status}</div>
                        </div>
                     </div>
                  </Card>
                ))}
             </div>
           </div>
        )}

        {tab === "payment" && (
           <div className="space-y-12">
             <header>
               <div className="text-[10px] text-fluent-gold font-display font-medium uppercase tracking-[0.4em] mb-2">Guardian Protocol · Subscription</div>
               <h1 className="text-4xl font-serif font-black text-fluent-midnight leading-none">Subscription & <em className="not-italic text-fluent-gold italic">Billing</em></h1>
               <p className="text-sm text-stone-500 font-serif italic mt-2">Manage your Fluent Institute plan, invoices, and payment details.</p>
             </header>

             <Card className="p-10 bg-fluent-gold/5 border-fluent-gold/20 shadow-xl shadow-fluent-gold/5">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                   <div className="space-y-4">
                      <div className="text-[10px] font-display font-bold text-fluent-gold uppercase tracking-[0.3em]">Current Institutional Plan</div>
                      <h3 className="text-3xl font-serif font-bold text-fluent-midnight italic underline decoration-fluent-gold/30 underline-offset-8 leading-tight">Mastery Cohort Engagement</h3>
                      <p className="text-sm font-serif italic text-stone-600 leading-relaxed max-w-sm">
                        Direct faculty instruction, AI grounding, synthesis labs, and weekly guardian reports. Small batches of max 20 scholars.
                      </p>
                      <div className="flex gap-2 pt-4">
                         <Badge color="green">✓ Active Status</Badge>
                         <Badge color="gold">Renews 10 June 2026</Badge>
                      </div>
                   </div>
                   <div className="text-right space-y-6">
                      <div>
                         <div className="text-5xl font-serif font-bold text-fluent-midnight leading-none">₹14,500<span className="text-xl text-stone-300">/mo</span></div>
                         <div className="text-[9px] font-display font-bold uppercase text-stone-400 tracking-widest mt-2">Institutional Grade Node Fee</div>
                      </div>
                      <Btn variant="outline" className="text-[9px] font-black tracking-widest uppercase px-8 border-stone-200">Change Enrollment Plan</Btn>
                   </div>
                </div>
             </Card>

             <div className="grid lg:grid-cols-2 gap-10">
                <Card className="p-10">
                   <div className="text-[10px] font-display font-medium uppercase text-stone-400 tracking-[0.3em] mb-8">Payment Instrument</div>
                   <div className="flex gap-6 items-center">
                      <div className="w-20 h-12 bg-fluent-midnight rounded flex items-center justify-center text-fluent-gold text-xs font-black italic tracking-widest">VISA</div>
                      <div className="flex-1">
                         <div className="text-sm font-bold text-fluent-midnight">•••• •••• •••• 4521</div>
                         <div className="text-[9px] font-display font-medium text-stone-400 uppercase tracking-widest mt-1">Expires 09/27 · Primary Node</div>
                      </div>
                      <Btn variant="outline" size="sm" className="text-[8px] font-black tracking-widest uppercase">Update Node</Btn>
                   </div>
                </Card>
                <Card className="p-10">
                   <div className="text-[10px] font-display font-medium uppercase text-stone-400 tracking-[0.3em] mb-8">Next Cycle Dispatch</div>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm font-serif italic leading-relaxed">
                         <span className="text-stone-400">Next billing date</span>
                         <span className="text-fluent-midnight font-bold not-italic">10 June 2026</span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-serif italic leading-relaxed">
                         <span className="text-stone-400">Projected amount due</span>
                         <span className="text-fluent-midnight font-bold not-italic">₹14,500</span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-serif italic leading-relaxed">
                         <span className="text-stone-400">Auto-renewal status</span>
                         <span className="text-green-600 font-bold uppercase text-[9px] tracking-widest">Active Node</span>
                      </div>
                   </div>
                </Card>
             </div>

             <Card className="p-10">
                <div className="text-[10px] font-display font-medium uppercase text-stone-400 tracking-[0.3em] mb-10">Invoice Node Archeology</div>
                <div className="space-y-4">
                   {[
                     { desc: 'May 2026 — Mastery Cohort', date: '10 May 2026', amt: '₹14,500', status: 'Paid' },
                     { desc: 'April 2026 — Mastery Cohort', date: '10 Apr 2026', amt: '₹14,500', status: 'Paid' },
                     { desc: 'March 2026 — Mastery Cohort', date: '10 Mar 2026', amt: '₹14,500', status: 'Paid' }
                   ].map((inv, idx) => (
                     <div key={idx} className="flex justify-between items-center py-6 border-b border-black/5 last:border-0 hover:bg-stone-50 transition-all px-4 rounded-xl">
                        <div className="flex gap-6 items-center">
                           <div className="w-10 h-10 bg-white border border-black/5 rounded flex items-center justify-center text-stone-300">
                             <FileText size={18} />
                           </div>
                           <div>
                              <div className="text-sm font-bold text-fluent-midnight">{inv.desc}</div>
                              <div className="text-[10px] text-stone-400 uppercase tracking-widest font-bold mt-1">{inv.date} · {inv.status}</div>
                           </div>
                        </div>
                        <div className="flex gap-10 items-center">
                           <div className="text-2xl font-serif font-bold text-fluent-midnight">{inv.amt}</div>
                           <Btn variant="outline" size="sm" icon={Download} className="text-[8px] font-black tracking-widest uppercase p-0 w-8 h-8 flex items-center justify-center" />
                        </div>
                     </div>
                   ))}
                </div>
             </Card>
           </div>
        )}

        {tab === "settings" && (
           <div className="space-y-12">
             <header>
               <div className="text-[10px] text-fluent-gold font-display font-medium uppercase tracking-[0.4em] mb-2">Guardian Protocol · Preferences</div>
               <h1 className="text-4xl font-serif font-black text-fluent-midnight leading-none">Guardian <em className="not-italic text-fluent-gold italic">Settings</em></h1>
               <p className="text-sm text-stone-500 font-serif italic mt-2">Manage your profile, notification preferences, and account configuration.</p>
             </header>

             <div className="grid lg:grid-cols-4 gap-10">
                <div className="lg:col-span-1 space-y-2">
                   {[
                     { id: 'profile', label: 'Profile Node', icon: User },
                     { id: 'notifications', label: 'Dispatch Control', icon: Bell },
                     { id: 'privacy', label: 'Privacy Protocol', icon: ShieldCheck },
                     { id: 'danger', label: 'Danger Zone', icon: AlertCircle },
                   ].map((item) => (
                     <button 
                       key={item.id}
                       className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                         item.id === 'profile' ? 'bg-fluent-midnight text-white shadow-xl' : 'text-stone-400 hover:bg-stone-50'
                       }`}
                     >
                       <item.icon size={16} className={item.id === 'profile' ? 'text-fluent-gold' : 'text-stone-300'} />
                       {item.label}
                     </button>
                   ))}
                </div>

                <div className="lg:col-span-3 space-y-10">
                   <Card className="p-10">
                      <div className="text-[10px] font-display font-medium uppercase text-fluent-gold tracking-[0.3em] mb-10">Guardian Information Profile</div>
                      <div className="grid md:grid-cols-2 gap-8">
                         <div className="space-y-2">
                            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Full Legal Name</label>
                            <input className="w-full bg-stone-50 border border-black/5 rounded-xl px-6 py-4 text-sm font-serif italic font-bold outline-none focus:border-fluent-gold transition-all" defaultValue={profile?.name} />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Guardian Protocol ID</label>
                            <input className="w-full bg-stone-100 border border-black/5 rounded-xl px-6 py-4 text-sm font-mono text-stone-400 outline-none" readOnly value={`FI-G-2026-${profile?.id?.slice(-4).toUpperCase()}`} />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Official Dispatch Email</label>
                            <input className="w-full bg-stone-50 border border-black/5 rounded-xl px-6 py-4 text-sm font-serif italic font-bold outline-none focus:border-fluent-gold transition-all" defaultValue={profile?.email} />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Sync Priority Node (WhatsApp)</label>
                            <input className="w-full bg-stone-50 border border-black/5 rounded-xl px-6 py-4 text-sm font-serif italic font-bold outline-none focus:border-fluent-gold transition-all" defaultValue="+91 98765 43210" />
                         </div>
                      </div>
                      <Btn variant="primary" className="mt-10 px-10 text-[10px] font-black tracking-widest uppercase">Update Protocol Node</Btn>
                   </Card>

                   <Card className="p-10">
                      <div className="text-[10px] font-display font-medium uppercase text-fluent-gold tracking-[0.3em] mb-10">Notification Dispatch Logic</div>
                      <div className="space-y-6">
                         {[
                           { label: 'Weekly Delta Reports', desc: 'Full narrative audit delivered every Sunday morning.', active: true },
                           { label: 'Critical Gap Alerts', desc: 'Immediate priority-red dispatch when mastery index falls below 50%.', active: true },
                           { label: 'Session Synchronization', desc: 'T-30 min automated reminder before cohort or 1:1 sessions.', active: true },
                           { label: 'Waitlist & Enrollment Peaks', desc: 'Updates on cohort capacity and upcoming semester priority.', active: false },
                         ].map((notif, idx) => (
                           <div key={idx} className="flex justify-between items-center py-6 border-b border-black/5 last:border-0">
                              <div className="space-y-1">
                                 <div className="text-sm font-bold text-fluent-midnight">{notif.label}</div>
                                 <div className="text-xs text-stone-400 font-serif italic">{notif.desc}</div>
                              </div>
                              <button className={`w-12 h-6 rounded-full relative transition-all ${notif.active ? 'bg-fluent-gold' : 'bg-stone-200'}`}>
                                 <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${notif.active ? 'right-1' : 'left-1'}`} />
                              </button>
                           </div>
                         ))}
                      </div>
                   </Card>
                </div>
             </div>
           </div>
        )}
      </div>
    </DashboardShell>
  );
}



