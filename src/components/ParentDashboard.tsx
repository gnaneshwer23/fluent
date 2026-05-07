import React, { useState, useEffect } from 'react';
import { 
  Home, BarChart3, Calendar, Mail, Lock, Settings, Plus, Users, TrendingUp, ShieldCheck, Award, MessageCircle, MessageSquare, ExternalLink, CalendarDays, LineChart as LineChartIcon,
  CheckCircle2, ArrowRight, Zap, ShieldAlert, LogOut
} from 'lucide-react';
import { motion } from 'motion/react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, collectionGroup, orderBy } from 'firebase/firestore';
import { db, auth } from '../lib/firebaseInit';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';
import { Badge, Card, Avatar, MetricTile, ProgressBar, Btn } from './UI';
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
  const [showAddChild, setShowAddChild] = useState(false);
  const [searchName, setSearchName] = useState("");

  const parentName = profile?.name || auth.currentUser?.displayName || "Mr. Rohit Sharma";

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
      await addDoc(collection(db, 'users', auth.currentUser.uid, 'monitoredStudents'), {
        name: searchName.trim(),
        linkedAt: serverTimestamp()
      });
      setSearchName("");
      setShowAddChild(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'monitoredStudents');
    }
  };

  const navItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "reports", label: "Weekly Reports", icon: CalendarDays },
    { id: "progress", label: "Performance", icon: BarChart3 },
    { id: "feedback", label: "Teacher Logs", icon: Mail, badge: weeklyReports.length > 0 ? "New" : undefined },
    { id: "billing", label: "Billing", icon: Lock },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const chartData = [...weeklyReports].reverse().map(r => ({
    name: r.week.split(' ')[0],
    marks: r.marks
  }));

  const latestReport = weeklyReports[0];

  return (
    <DashboardShell role="parent" title={parentName} navItems={navItems} activeNav={activeNav} setActiveNav={setActiveNav} onBack={onBack}>
      <div className="p-10 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
          <div>
            <h1 className="text-3xl font-serif font-bold tracking-tight">Parent Portal ✦</h1>
            {alerts.length > 0 && (
              <div className="flex items-center gap-2 mt-4 px-4 py-2 bg-red-50 border border-red-100 rounded-full w-fit">
                <ShieldAlert size={14} className="text-red-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-red-600">{alerts.length} Attention Required</span>
              </div>
            )}
            <p className="text-slate-500 mt-1">Real-time accountability for {monitoredStudents[activeChild]?.name || "your family"}.</p>
          </div>
          <div className="flex gap-4">
             <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer">
                <Btn variant="outline" icon={MessageCircle} className="border-green-500 text-green-600 hover:bg-green-50">Direct WhatsApp</Btn>
             </a>
             <Btn variant="gold" icon={Calendar} size="sm" onClick={() => setShowBooking(true)}>Book Faculty Consultation</Btn>
             <Btn variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" icon={LogOut} onClick={onBack}>Sign Out</Btn>
          </div>
        </header>

        {/* Child Selector */}
        <div className="flex gap-4 mb-10 overflow-x-auto pb-2 px-2">
          {monitoredStudents.map((c, i) => (
            <div 
              key={i} 
              onClick={() => setActiveChild(i)}
              className={`flex items-center gap-4 px-6 py-4 rounded-xl cursor-pointer transition-all border-2 shrink-0 ${
                activeChild === i ? "bg-fluent-navy border-fluent-navy text-white shadow-xl shadow-fluent-navy/10" : "bg-white border-black/5 text-fluent-navy hover:border-black/20"
              }`}
            >
              <Avatar name={c.name} size={40} />
              <div>
                <div className="font-bold text-sm">{c.name}</div>
                <div className={`text-[10px] font-bold uppercase tracking-wider ${activeChild === i ? "text-white/40" : "text-gray-400"}`}>Active Scholar</div>
              </div>
            </div>
          ))}
          <div 
            onClick={() => setShowAddChild(true)}
            className="flex items-center gap-4 px-6 py-4 rounded-xl cursor-pointer transition-all border-2 border-dashed border-slate-300 text-slate-400 hover:border-fluent-teal hover:text-fluent-teal group shrink-0"
          >
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-fluent-teal group-hover:text-white transition-colors">
              <Plus size={20} />
            </div>
            <div className="font-bold text-sm">Link Student</div>
          </div>
        </div>

        {showAddChild && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-fluent-navy/20 backdrop-blur-sm">
             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl">
                <h3 className="text-2xl font-serif font-bold mb-4">Link Student Profile</h3>
                <input 
                  type="text" 
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="Student Full Name..." 
                  className="w-full p-4 bg-gray-50 border border-black/10 rounded-2xl mb-6 outline-none"
                />
                <div className="flex gap-4">
                  <Btn variant="outline" className="flex-1" onClick={() => setShowAddChild(false)}>Cancel</Btn>
                  <Btn variant="primary" className="flex-1" onClick={handleAddChild}>Verify & Link</Btn>
                </div>
             </motion.div>
           </div>
        )}

        {monitoredStudents.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-[48px] border border-dashed border-slate-200">
             <Users className="mx-auto text-slate-200 mb-4" size={64} />
             <h3 className="text-2xl font-serif font-bold">No Students Linked</h3>
             <p className="text-slate-400 mt-2">Use the button above to link your child's academic profile.</p>
          </div>
        ) : activeNav === "overview" ? (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <MetricTile 
                label="Latest Mark" 
                value={latestReport ? `${latestReport.marks}%` : "0%"} 
                delta={latestReport?.marks > 75 ? "+Improved" : "-Stable"} 
                icon={TrendingUp} 
                color={latestReport?.marks > 75 ? "#10B981" : "#1B4F5E"} 
              />
              <MetricTile label="Attendance" value={latestReport?.attendance || "Present"} icon={ShieldCheck} color="#0D1B2A" />
              <MetricTile label="Assignments" value="2 Pending" icon={CheckCircle2} color="#C9A84C" />
              <MetricTile label="Confidence" value="Rank 4" icon={Award} color="#7C3AED" />
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

                  <Card className="p-8">
                  <div className="flex justify-between items-center mb-10">
                    <div>
                      <h3 className="text-xl font-serif font-bold text-fluent-navy">Mastery Trajectory</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Conceptual Growth over Last 5 Weeks</p>
                    </div>
                    <Badge color="teal">Improving</Badge>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} domain={[0, 100]} />
                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                        <Line type="monotone" dataKey="marks" stroke="#1B4F5E" strokeWidth={4} dot={{ r: 6, fill: '#1B4F5E', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
               </div>

               <div className="lg:col-span-4 space-y-6">
                  <Card className="p-8 bg-fluent-navy text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <ShieldCheck size={120} />
                    </div>
                    <h3 className="text-xl font-serif font-bold mb-6">Faculty Log</h3>
                    {latestReport ? (
                      <div className="space-y-6 relative z-10">
                        <p className="text-sm text-white/70 italic leading-relaxed">"{latestReport.teacherComment}"</p>
                        
                        {latestReport.actionPlan && (
                          <div className="pt-6 border-t border-white/10">
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-fluent-gold mb-3 flex items-center gap-2">
                               <Zap size={14} /> Critical Action Plan
                            </div>
                            <p className="text-xs text-white/80 leading-relaxed font-medium">{latestReport.actionPlan}</p>
                          </div>
                        )}
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Directly from the Provost's office</div>
                      </div>
                    ) : (
                      <p className="text-white/40 text-sm italic">Pending weekly review.</p>
                    )}
                  </Card>

                  <Card className="p-8 group hover:border-fluent-teal/20 transition-all border-black/5">
                    <h3 className="text-lg font-serif font-bold text-fluent-navy mb-4">Top Focus</h3>
                    <div className="p-4 bg-fluent-teal/5 rounded-xl border border-fluent-teal/10">
                       <div className="text-[10px] font-black uppercase tracking-widest text-fluent-teal mb-1">Recommended Skill</div>
                       <div className="font-bold text-sm text-fluent-navy">{latestReport?.weaknesses || "Conceptual Stacking"}</div>
                    </div>
                    <Btn variant="ghost" size="sm" icon={ArrowRight} className="mt-4 text-[10px] uppercase font-bold tracking-widest p-0">View Mastery Plan</Btn>
                  </Card>
               </div>
            </div>
          </>
        ) : activeNav === "reports" ? (
          <div className="space-y-6">
             <div className="flex justify-between items-center mb-8">
               <h2 className="text-3xl font-serif font-bold text-fluent-navy">Historical Performance Logs</h2>
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
