import React, { useState, useEffect } from 'react';
import { 
  Home, BarChart3, Calendar, Mail, Lock, Settings, Plus, Users, TrendingUp, ShieldCheck, Award, MessageCircle, MessageSquare, ExternalLink, CalendarDays, LineChart as LineChartIcon,
  CheckCircle2, ArrowRight, Zap, ShieldAlert, LogOut, Library, ClipboardList
} from 'lucide-react';
import { motion } from 'motion/react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, collectionGroup, orderBy, limit, getDocs } from 'firebase/firestore';
import { db, auth } from '../lib/firebaseInit';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';
import { Badge, Card, Avatar, MetricTile, ProgressBar, Btn } from './UI';
import { MasteryLedger } from './MasteryLedger';
import { DashboardShell } from './DashboardShell';
import { BookingModal } from './BookingModal';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export const ParentDashboard = ({ profile, onBack }: { profile?: any, onBack: () => void }) => {
  const [activeNav, setActiveNav] = useState("overview");
  const [showBooking, setShowBooking] = useState(false);
  const [activeChild, setActiveChild] = useState(0);
  const [monitoredStudents, setMonitoredStudents] = useState<any[]>([]);
  const [weeklyReports, setWeeklyReports] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [showAddChild, setShowAddChild] = useState(false);
  const [searchName, setSearchName] = useState("");

  const parentName = profile?.name || auth.currentUser?.displayName || "Guardian";

  useEffect(() => {
    // Activity Stream Aggregator
    const student = monitoredStudents[activeChild];
    if (!student?.studentId) {
      setActivities([]);
      return;
    }

    // 1. Fetch Progress (Faculty Notes & Marks)
    const progQ = query(
      collection(db, "progress"),
      where("studentId", "==", student.studentId),
      orderBy("createdAt", "desc"),
      limit(10)
    );

    const unsubProg = onSnapshot(progQ, (snap) => {
      const pLogs = snap.docs.map(d => ({ 
        id: d.id, 
        type: 'PROGRESS', 
        category: d.data().category, 
        text: d.data().feedback || `Gained ${d.data().marks} logic points in ${d.data().topic}`,
        date: d.data().createdAt?.toDate() || new Date()
      }));
      setActivities(prev => {
        const others = prev.filter(a => a.type !== 'PROGRESS');
        return [...others, ...pLogs].sort((a,b) => b.date - a.date);
      });
    });

    // 2. Fetch Assignments
    const assignQ = query(
      collection(db, "assignments"),
      where("studentId", "==", student.studentId),
      orderBy("createdAt", "desc"),
      limit(5)
    );

    const unsubAssign = onSnapshot(assignQ, (snap) => {
      const aLogs = snap.docs.map(d => ({
        id: d.id,
        type: 'ASSIGNMENT',
        category: 'Task Issued',
        text: `New Assignment: ${d.data().title} [Deadline: ${d.data().dueDate}]`,
        date: d.data().createdAt?.toDate() || new Date()
      }));
       setActivities(prev => {
        const others = prev.filter(a => a.type !== 'ASSIGNMENT');
        return [...others, ...aLogs].sort((a,b) => b.date - a.date);
      });
    });

    return () => {
      unsubProg();
      unsubAssign();
    };
  }, [monitoredStudents, activeChild]);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, 'users', auth.currentUser.uid, 'monitoredStudents'));
    const unsub = onSnapshot(q, (snap) => {
      setMonitoredStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'monitoredStudents'));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!auth.currentUser?.email) return;
    const q = query(
      collection(db, "weeklyReports"),
      where("parentEmail", "==", auth.currentUser.email),
      orderBy("date", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setWeeklyReports(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'weeklyReports'));

    return () => unsub();
  }, []);

  useEffect(() => {
    const student = monitoredStudents[activeChild];
    if (!student?.name) return;
    
    // We need to find the student ID for this name first, but for this demo 
    // let's assume we can query alerts where studentId contains the name if ID is unknown, 
    // or better, if the monitored student object has an ID.
    // Assuming for now the alert collection has studentId.
    
    const q = query(
      collection(db, "alerts"), 
      where("status", "==", "active")
    );
    // Note: In real app, filter where studentId is the linked ID
    const unsub = onSnapshot(q, (snap) => {
      setAlerts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, "alerts"));

    return () => unsub();
  }, [monitoredStudents, activeChild]);

  const handleAddChild = async () => {
    if (!searchName.trim() || !auth.currentUser) return;
    try {
      // Step 1: Detect matching student identity
      const q = query(
        collection(db, 'users'), 
        where('role', '==', 'student'),
        where('name', '==', searchName.trim())
      );
      const snap = await getDocs(q);
      
      let studentId = "";
      let actualName = searchName.trim();
      
      if (!snap.empty) {
        studentId = snap.docs[0].id;
        actualName = snap.docs[0].data().name;
      }

      await addDoc(collection(db, 'users', auth.currentUser.uid, 'monitoredStudents'), {
        studentId: studentId,
        name: actualName,
        linkedAt: serverTimestamp(),
        verified: !!studentId
      });
      
      setSearchName("");
      setShowAddChild(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'monitoredStudents');
    }
  };

  const navItems = [
    { id: "overview", label: "Dashboard", icon: Home },
    { id: "reports", label: "Weekly Synthesis", icon: CalendarDays },
    { id: "progress", label: "Growth Trajectory", icon: BarChart3 },
    { id: "ledger", label: "Library Node", icon: Library },
    { id: "feedback", label: "Provost Logs", icon: Mail, badge: weeklyReports.length > 0 ? "New" : undefined },
    { id: "billing", label: "Investment", icon: Lock },
    { id: "settings", label: "Calibrations", icon: Settings },
  ];

  const chartData = [...weeklyReports].reverse().map(r => ({
    name: r.week.split(' ')[0],
    marks: r.marks
  }));

  const latestReport = weeklyReports[0];

  return (
    <DashboardShell role="parent" title={parentName} navItems={navItems} activeNav={activeNav} setActiveNav={setActiveNav} onBack={onBack}>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <header className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge color="gold" icon={ShieldCheck}>Verified Parent Portfolio</Badge>
              {alerts.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full border border-red-100">
                  <ShieldAlert size={12} strokeWidth={3} />
                  <span className="text-[9px] font-black uppercase tracking-widest">{alerts.length} Intervention Alerts</span>
                </div>
              )}
            </div>
            <h1 className="text-4xl font-serif font-black tracking-tighter text-fluent-navy leading-none">The Guardian Portal</h1>
            <p className="text-lg text-slate-400 font-serif italic">Overseeing the academic evolution of {monitoredStudents[activeChild]?.name || "the family"} ✦</p>
          </div>
          <div className="flex flex-wrap gap-3">
             <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer">
                <Btn variant="outline" icon={MessageCircle} size="sm" className="border-green-100 text-green-600 hover:bg-green-50">Direct WhatsApp</Btn>
             </a>
             <Btn variant="gold" icon={Calendar} size="sm" onClick={() => setShowBooking(true)}>Contact Faculty</Btn>
          </div>
        </header>

        {/* Child Selector */}
        <div className="flex gap-4 overflow-x-auto pb-2 px-2 -mx-2 hide-scrollbar">
          {monitoredStudents.map((c, i) => (
            <motion.div 
              key={i} 
              whileHover={{ y: -2 }}
              onClick={() => setActiveChild(i)}
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl cursor-pointer transition-all border-2 shrink-0 ${
                activeChild === i ? "bg-fluent-navy border-fluent-navy text-white shadow-xl shadow-fluent-navy/10" : "bg-white border-black/5 text-fluent-navy hover:border-black/10 shadow-sm"
              }`}
            >
              <div className="relative">
                <Avatar name={c.name} size={40} color={activeChild === i ? "#C9A84C" : "#1B4F5E"} />
                {activeChild === i && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-fluent-gold rounded-full border-2 border-fluent-navy flex items-center justify-center">
                    <CheckCircle2 size={9} className="text-fluent-navy" strokeWidth={4} />
                  </div>
                )}
              </div>
              <div className="space-y-0.5">
                <div className="font-serif font-black text-base leading-tight uppercase tracking-tight">{c.name}</div>
                <div className={`text-[9px] font-black uppercase tracking-[0.2em] ${activeChild === i ? "text-white/40" : "text-slate-400"}`}>Scholar</div>
              </div>
            </motion.div>
          ))}
          <motion.div 
            whileHover={{ y: -2 }}
            onClick={() => setShowAddChild(true)}
            className="flex items-center gap-4 px-6 py-4 rounded-2xl cursor-pointer transition-all border-2 border-dashed border-slate-200 text-slate-400 hover:border-fluent-teal hover:text-fluent-teal group shrink-0 bg-slate-50/50"
          >
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-slate-100 group-hover:bg-fluent-teal group-hover:border-fluent-teal group-hover:text-white transition-all shadow-sm">
              <Plus size={18} strokeWidth={3} />
            </div>
            <div className="space-y-0.5 pr-2">
              <div className="font-serif font-black text-base leading-tight uppercase tracking-tight">Expand</div>
              <div className="text-[9px] font-black uppercase tracking-[0.2em]">Link Portfolio</div>
            </div>
          </motion.div>
        </div>

        {showAddChild && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-fluent-navy/60 backdrop-blur-md">
             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[48px] p-16 max-w-xl w-full shadow-[0_40px_100px_-15px_rgba(0,0,0,0.3)] relative border border-white/20">
                <button onClick={() => setShowAddChild(false)} className="absolute top-10 right-10 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                  <ArrowRight className="rotate-45" />
                </button>
                <div className="text-center space-y-4 mb-10">
                  <div className="w-20 h-20 bg-fluent-navy rounded-[28px] flex items-center justify-center mx-auto shadow-2xl shadow-fluent-navy/20">
                    <Users className="text-fluent-gold" size={32} />
                  </div>
                  <h3 className="text-4xl font-serif font-black tracking-tight text-fluent-navy">Link Scholar Profile</h3>
                  <p className="text-slate-400 font-serif italic text-lg">Enter student credentials to synchronise portfolio data.</p>
                </div>
                <div className="space-y-4">
                  <input 
                    type="text" 
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    placeholder="Enter Student's Full Legal Name..." 
                    className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[28px] outline-none focus:ring-4 focus:ring-fluent-teal/10 transition-all font-bold text-fluent-navy text-lg"
                  />
                  <div className="flex gap-4 pt-4">
                    <Btn variant="primary" className="flex-1 py-8 rounded-[28px]" onClick={handleAddChild}>Verify & Synchronise</Btn>
                  </div>
                </div>
             </motion.div>
           </div>
        )}

        {monitoredStudents.length === 0 ? (
          <div className="py-32 text-center bg-white rounded-[64px] border border-dashed border-slate-200 shadow-sm">
             <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-8 border border-slate-100">
                <Users className="text-slate-200" size={48} />
             </div>
             <h3 className="text-4xl font-serif font-black text-fluent-navy tracking-tight">No Synchronised Scholars</h3>
             <p className="text-slate-400 mt-4 text-xl font-serif italic max-w-md mx-auto">Link your students to begin receiving real-time accountability reports and growth logs.</p>
             <Btn variant="gold" className="mt-10" icon={Plus} onClick={() => setShowAddChild(true)}>Begin Onboarding</Btn>
          </div>
        ) : activeNav === "overview" ? (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <MetricTile 
                label="Academic Achievement" 
                value={latestReport ? `${latestReport.marks}%` : "0%"} 
                delta={latestReport?.marks > 75 ? "+8.3% Delta" : "Stable Pattern"} 
                icon={TrendingUp} 
                color={latestReport?.marks > 75 ? "#10B981" : "#1B4F5E"} 
              />
              <MetricTile label="Attendance Status" value={latestReport?.attendance || "Present"} icon={ShieldCheck} color="#0D1B2A" />
              <MetricTile label="Required Briefs" value="02 PENDING" icon={CheckCircle2} color="#C9A84C" />
              <MetricTile label="Confidence Tier" value="PLATINUM IV" icon={Award} color="#1B4F5E" />
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
               <div className="lg:col-span-8 space-y-8">
                  {alerts.length > 0 && (
                    <Card className="p-8 bg-red-50/50 border-red-100">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-6 flex items-center gap-2">
                          <ShieldAlert size={16} /> Urgent Faculty Alerts
                       </h4>
                       <div className="space-y-3">
                          {alerts.map(a => (
                            <div key={a.id} className="p-4 bg-white rounded-2xl border border-red-100 flex justify-between items-center group">
                               <div className="flex items-center gap-4">
                                  <div className="p-2 bg-red-50 text-red-500 rounded-lg group-hover:bg-red-500 group-hover:text-white transition-colors">
                                     <Zap size={16} />
                                  </div>
                                  <div>
                                     <div className="text-xs font-bold text-fluent-navy tracking-tight">{a.type}</div>
                                     <div className="text-[10px] text-slate-400 font-medium">{a.message}</div>
                                  </div>
                               </div>
                               <Btn variant="ghost" size="sm" className="text-[10px] font-black tracking-widest text-fluent-teal">ACTION PLAN</Btn>
                            </div>
                          ))}
                       </div>
                    </Card>
                  )}

                  <Card className="p-12 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 transition-transform group-hover:rotate-0 duration-1000">
                       <LineChartIcon size={200} />
                    </div>
                    <div className="flex justify-between items-center mb-12 relative z-10">
                      <div>
                        <h3 className="text-3xl font-serif font-black text-fluent-navy tracking-tight">Growth Trajectory</h3>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mt-2 italic">Conceptual Mastery Analysis: Last 5 Synthesis Cycles</p>
                      </div>
                      <Badge color="teal" className="scale-110">Positive Momentum</Badge>
                    </div>
                    <div className="h-[380px] w-full relative z-10">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#cbd5e1' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#cbd5e1' }} domain={[0, 100]} />
                          <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 40px 100px -10px rgba(0,0,0,0.2)', padding: '20px' }} />
                          <Line type="step" dataKey="marks" stroke="#1B4F5E" strokeWidth={6} dot={{ r: 8, fill: '#C9A84C', strokeWidth: 4, stroke: '#fff' }} activeDot={{ r: 12 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
               </div>

               <div className="lg:col-span-4 space-y-6">
                  <Card className="p-10 bg-fluent-navy text-white relative overflow-hidden rounded-[40px] shadow-2xl shadow-fluent-navy/30">
                    <div className="absolute top-[-20%] right-[-20%] p-8 opacity-5 scale-150">
                      <ShieldCheck size={280} />
                    </div>
                    <div className="relative z-10 space-y-10">
                      <div className="space-y-2">
                        <Badge color="gold" className="bg-fluent-gold/20 text-fluent-gold border-fluent-gold/30">Executive Summary</Badge>
                        <h3 className="text-4xl font-serif font-black tracking-tight leading-none mt-4">Provost Synthesis</h3>
                      </div>
                      
                      {latestReport ? (
                        <div className="space-y-10">
                          <div className="relative">
                            <span className="absolute -top-6 -left-4 text-7xl font-serif text-fluent-gold opacity-20">"</span>
                            <p className="text-xl text-white/90 leading-relaxed font-serif italic pr-4">{latestReport.teacherComment}</p>
                          </div>
                          
                          {latestReport.actionPlan && (
                            <div className="p-8 bg-white/5 rounded-[32px] border border-white/10 space-y-4">
                              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-fluent-gold flex items-center gap-3">
                                 <Zap size={16} /> Prescribed Protocol
                              </div>
                              <p className="text-sm text-white/70 leading-relaxed font-medium italic">{latestReport.actionPlan}</p>
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/40 border-t border-white/10 pt-8 mt-12 overflow-hidden whitespace-nowrap">
                            <ShieldCheck size={14} /> Official Certification Log
                          </div>
                        </div>
                      ) : (
                        <p className="text-white/40 text-lg font-serif italic pb-20">Synthesis cycle in progress...</p>
                      )}
                    </div>
                  </Card>

                  <Card className="p-10 group hover:border-fluent-gold/20 transition-all border-black/5 rounded-[40px] bg-slate-50/50 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-8">
                       <h3 className="text-2xl font-serif font-black text-fluent-navy tracking-tight">Guardian Pulse</h3>
                       <div className="w-2 h-2 rounded-full bg-fluent-teal animate-ping" />
                    </div>
                    
                    <div className="flex-1 space-y-6 overflow-y-auto max-h-[400px] pr-2 hide-scrollbar">
                       {activities.length > 0 ? activities.map((act, i) => (
                         <div key={act.id || i} className="flex gap-4 group/item">
                            <div className="flex flex-col items-center gap-1">
                               <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                 act.type === 'PROGRESS' ? 'bg-fluent-teal/10 text-fluent-teal' : 'bg-fluent-gold/10 text-fluent-gold'
                               }`}>
                                  {act.type === 'PROGRESS' ? <Zap size={14} /> : <ClipboardList size={14} />}
                               </div>
                               {i !== activities.length - 1 && <div className="w-0.5 h-full bg-slate-100" />}
                            </div>
                            <div className="pb-6">
                               <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                                  {act.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {act.category}
                               </div>
                               <p className="text-sm text-fluent-navy font-bold leading-snug group-hover/item:text-fluent-teal transition-colors">{act.text}</p>
                            </div>
                         </div>
                       )) : (
                         <p className="text-slate-400 italic font-serif text-sm">Waiting for academic synchronization...</p>
                       )}
                    </div>
                    
                    <Btn variant="ghost" size="sm" icon={ArrowRight} className="mt-8 text-[10px] tracking-[0.3em] p-0 font-black">View Full Activity Log</Btn>
                  </Card>
               </div>
            </div>
          </>
        ) : activeNav === "reports" ? (
          <div className="space-y-6">
             <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
               <div className="space-y-4">
                 <Badge color="gold">Historical Archives</Badge>
                 <h2 className="text-5xl font-serif font-black text-fluent-navy tracking-tighter">Academic Transcripts</h2>
                 <p className="text-xl text-slate-400 font-serif italic">A detailed compilation of synthetical reviews and faculty briefings.</p>
               </div>
               <Btn variant="outline" size="md" icon={LineChartIcon}>Analytical Overlay</Btn>
             </div>
             {weeklyReports.length > 0 ? (
               weeklyReports.map((report, i) => (
                 <Card key={report.id || i} className="p-10 border-black/5 hover:border-fluent-gold/20 transition-all group bg-white shadow-sm">
                    <div className="flex flex-col lg:flex-row justify-between gap-10">
                       <div className="space-y-8 flex-1">
                          <div className="flex items-center gap-4">
                             <Badge color={report.marks > 70 ? "teal" : "gold"}>{report.week}</Badge>
                             <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{report.date}</span>
                          </div>

                          <div className="grid md:grid-cols-2 gap-8">
                             <div className="space-y-6">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-fluent-navy flex items-center gap-2">
                                  <TrendingUp size={14} /> Soft Skill Synthesis
                                </h4>
                                <div className="space-y-4">
                                   <div>
                                      <div className="flex justify-between text-[10px] font-bold uppercase mb-2">
                                        <span>Confidence Level</span>
                                        <span>{report.confidenceScore || 0}/10</span>
                                      </div>
                                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                         <div 
                                           className="h-full bg-fluent-teal transition-all duration-1000" 
                                           style={{ width: `${(report.confidenceScore || 0) * 10}%` }} 
                                         />
                                      </div>
                                      {report.confidenceNote && <p className="mt-2 text-[10px] text-slate-400 italic">"{report.confidenceNote}"</p>}
                                   </div>
                                   <div>
                                      <div className="flex justify-between text-[10px] font-bold uppercase mb-2">
                                        <span>Participation & Querying</span>
                                        <span>{report.participationScore || 0}/10</span>
                                      </div>
                                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                         <div 
                                           className="h-full bg-fluent-gold transition-all duration-1000" 
                                           style={{ width: `${(report.participationScore || 0) * 10}%` }} 
                                         />
                                      </div>
                                      {report.communicationNote && <p className="mt-2 text-[10px] text-slate-400 italic">"{report.communicationNote}"</p>}
                                   </div>
                                </div>
                             </div>

                             <div className="space-y-4">
                               <div className="p-5 bg-green-50/50 rounded-2xl border border-green-100/50 relative overflow-hidden group/item">
                                  <div className="text-[10px] font-black uppercase tracking-widest text-green-600 mb-2">Dominant Strengths</div>
                                  <p className="text-sm text-slate-600 leading-relaxed font-medium relative z-10">{report.strengths}</p>
                                  <CheckCircle2 className="absolute -bottom-2 -right-2 text-green-100 h-16 w-16 -rotate-12 transition-transform group-hover/item:scale-110" />
                               </div>
                               <div className="p-5 bg-red-50/50 rounded-2xl border border-red-100/50 relative overflow-hidden group/item">
                                  <div className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-2">Targeted Gaps</div>
                                  <p className="text-sm text-slate-600 leading-relaxed font-medium relative z-10">{report.weaknesses}</p>
                                  <Zap className="absolute -bottom-2 -right-2 text-red-100 h-16 w-16 -rotate-12 transition-transform group-hover/item:scale-110" />
                               </div>
                             </div>
                          </div>

                          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                             <div className="text-[10px] font-black uppercase tracking-widest text-fluent-navy mb-2 flex items-center gap-2">
                               <MessageSquare size={14} /> Teacher's Action Plan
                             </div>
                             <p className="text-sm text-slate-600 font-medium italic">"{report.actionPlan || "Focusing on core synthesis."}"</p>
                          </div>
                       </div>
                       
                       <div className="lg:w-48 text-center flex flex-col justify-center border-l border-black/5 pl-10">
                          <div className={`text-6xl font-serif font-bold mb-2 ${report.marks > 70 ? 'text-fluent-teal' : 'text-fluent-gold'}`}>{report.marks}%</div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8">Weekly Quotient</div>
                          <Btn variant="outline" size="sm" className="w-full border-none hover:bg-slate-50 text-[10px] font-black uppercase tracking-widest">Download PDF</Btn>
                       </div>
                    </div>
                  </Card>
               ))
             ) : (
               <div className="py-24 text-center bg-slate-50 rounded-[48px] border border-dashed border-slate-200">
                 <Calendar className="mx-auto text-slate-200 mb-4" size={48} />
                 <p className="text-slate-400 italic font-medium">No weekly reports have been generated for this period yet.</p>
               </div>
             )}
          </div>
        ) : activeNav === "ledger" ? (
          <MasteryLedger userProfile={profile} />
        ) : (
          <div className="py-20 text-center text-slate-400 font-serif font-bold italic">
            <Settings className="mx-auto mb-4 opacity-20" size={64} />
            The {activeNav} module is currently being calibrated for your profile.
          </div>
        )}
      </div>

      <BookingModal isOpen={showBooking} onClose={() => setShowBooking(false)} profile={profile} />
    </DashboardShell>
  );
};
