import React, { useState, useEffect } from 'react';
import { 
  Home, BookOpen, Calendar, BarChart3, Award, Settings, Bell, Play, 
  Sparkles, Zap, CheckCircle2, ArrowRight, Target, ClipboardList, MessageCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { collectionGroup, query, where, onSnapshot, collection, limit } from 'firebase/firestore';
import { db, auth } from '../lib/firebaseInit';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';
import { Badge, Card, Avatar, MetricTile, ProgressBar, Btn } from './UI';
import { DashboardShell } from './DashboardShell';
import { BookingModal } from './BookingModal';
import { MasteryHeatmap } from './Charts';
import { LiveLab } from './LiveLab';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';

// New Sub-components
import StudentAssignments from './StudentAssignments';
import StudentProgress from './StudentProgress';
import ConfidenceTraining from './ConfidenceTraining';

export const StudentDashboard = ({ profile, onBack }: { profile?: any, onBack: () => void }) => {
  const [activeNav, setActiveNav] = useState("overview");
  const [showBooking, setShowBooking] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [myRecords, setMyRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);

  const studentName = profile?.name || auth.currentUser?.displayName || "Arjun Sharma";
  const studentGrade = profile?.grade || "Grade 10";

  useEffect(() => {
    if (!auth.currentUser) return;
    // Check for any active live session
    const q = query(collection(db, 'liveSessions'), limit(1));
    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        setActiveSessionId(snap.docs[0].id);
      } else {
        setActiveSessionId(null);
      }
    }, (error) => {
      if (auth.currentUser) {
        handleFirestoreError(error, OperationType.LIST, 'liveSessions');
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!studentName || !auth.currentUser) return;
    const q = query(collectionGroup(db, 'students'), where('name', '==', studentName));
    const unsub = onSnapshot(q, (snap) => {
      const records = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMyRecords(records);
      setLoading(false);
    }, (error) => {
      if (auth.currentUser) {
        handleFirestoreError(error, OperationType.LIST, 'collectionGroup/students');
      }
    });
    return () => unsub();
  }, [studentName]);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, "alerts"), 
      where("studentId", "==", auth.currentUser.uid),
      where("status", "==", "active")
    );
    const unsub = onSnapshot(q, (snap) => {
      setAlerts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, "alerts"));
    return () => unsub();
  }, []);

  const navItems = [
    { id: "overview", label: "Home", icon: Home },
    { id: "sessions", label: "My Classes", icon: Calendar, badge: "Live" },
    { id: "assignments", label: "Assignments", icon: ClipboardList },
    { id: "progress", label: "Progress Report", icon: BarChart3 },
    { id: "confidence", label: "Confidence", icon: MessageCircle },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const subjectProgress = myRecords.map(r => {
    const score = r.total > 0 ? Math.round((r.attended / r.total) * 100) : 0;
    const lastScores = (r.history || []).slice(-4);
    const trend = lastScores.length > 1 ? (score - (lastScores[0].status === 'present' ? 50 : 0)) : 0; 

    const colors: any = {
      "Mathematics": "#1B4F5E",
      "Physics": "#0D1B2A",
      "Chemistry": "#7C3AED",
      "Biology": "#10B981",
      "English": "#C9A84C"
    };

    const isFocus = (profile?.interests || []).includes(r.subject) || (profile?.goal || "").toLowerCase().includes(r.subject?.toLowerCase());

    return {
      name: r.subject || "General",
      className: r.className || "Class",
      score,
      sessions: r.total,
      trend: trend >= 0 ? `+${trend}%` : `${trend}%`,
      color: colors[r.subject] || "#1B4F5E",
      history: (r.history || []).map((h: any, idx: number) => ({ week: `S${idx + 1}`, score: h.status === 'present' ? 100 : 0 })),
      isFocus
    };
  }).sort((a, b) => (b.isFocus ? 1 : 0) - (a.isFocus ? 1 : 0));

  const overallMastery = subjectProgress.length > 0 
    ? Math.round(subjectProgress.reduce((acc, curr) => acc + curr.score, 0) / subjectProgress.length) 
    : 0;
  
  const totalSessions = myRecords.reduce((acc, curr) => acc + (curr.total || 0), 0);
  
  const allFeedback = myRecords.flatMap(r => 
    (r.privateFeedback || []).map((f: any) => ({ ...f, subject: r.subject }))
  ).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const upcomingSessions = [
    { subject: "Mathematics", topic: "Quadratic Equations", time: "Today, 4:00 PM", teacher: "Dr. Sarah Mills", color: "#1B4F5E" },
    { subject: "English", topic: "Academic Writing Techniques", time: "Tomorrow, 10:00 AM", teacher: "Mr. James Harrow", color: "#C9A84C" },
    { subject: "Physics", topic: "Laws of Motion", time: "Wed, 3:00 PM", teacher: "Dr. Priya Mehta", color: "#0D1B2A" },
  ];

  const handleJoin = () => {
    setActiveNav("sessions");
  };

  return (
    <DashboardShell role="student" title={studentName} navItems={navItems} activeNav={activeNav} setActiveNav={setActiveNav} onBack={onBack}>
      <div className="p-10 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
          <div>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.15em] mb-2">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} • {studentGrade}</div>
            <h1 className="text-4xl font-serif font-bold tracking-tight">
              Good morning, <span className="text-fluent-teal italic font-normal">{studentName.split(' ')[0]}</span> ✦
            </h1>
            {alerts.length > 0 && (
              <div className="flex items-center gap-2 mt-4 px-4 py-2 bg-red-50 border border-red-100 rounded-full w-fit animate-pulse">
                <Zap size={14} className="text-red-500 fill-red-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-red-600">{alerts.length} Critical System Warnings</span>
              </div>
            )}
            <p className="text-slate-500 mt-2">Targeting {profile?.goal || "Academic Excellence"} • Momentum looks strong.</p>
          </div>

          <div className="p-6 bg-fluent-teal/5 border border-fluent-teal/10 rounded-2xl">
            <div className="font-bold text-fluent-teal mb-2 uppercase text-xs tracking-widest flex items-center gap-2">
              <Sparkles size={14} /> Personalised Focus
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-600">Goal: <span className="font-bold text-fluent-navy">{profile?.goal || "Academic Excellence"}</span></p>
              {profile?.learningGoals && <p className="text-[11px] text-slate-500 italic">Objectives: {profile.learningGoals}</p>}
              {profile?.preferredStudyMethods && <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter">Method: {profile.preferredStudyMethods}</p>}
            </div>
          </div>
          
          <div className="flex gap-3 relative">
            <Btn variant="outline" size="sm" icon={Bell} onClick={() => setShowNotification(!showNotification)}>Notifications</Btn>
            <Btn variant="primary" size="sm" icon={isJoining ? Sparkles : Play} onClick={handleJoin} disabled={isJoining}>
              {isJoining ? "Connecting..." : "Join Session"}
            </Btn>
            {showNotification && (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute top-full right-0 mt-2 w-80 bg-white border border-black/5 rounded-xl shadow-2xl z-50 p-6">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Dispatch Ledger</div>
                  
                  {alerts.length > 0 && (
                    <div className="mb-6 space-y-3">
                      <div className="text-[9px] font-bold text-red-500 uppercase tracking-widest">Active Alerts</div>
                      {alerts.map(a => (
                        <div key={a.id} className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                          <Zap size={14} className="text-red-500 mt-0.5 shrink-0" />
                          <div>
                            <div className="text-[10px] font-bold text-red-600 uppercase tracking-tight">{a.type}</div>
                            <div className="text-[10px] text-red-400 leading-tight mt-0.5">{a.message}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Faculty Feedback</div>
                    {allFeedback.slice(0, 3).map((f: any, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="text-xs font-bold text-fluent-teal">{f.category || f.subject}</div>
                        <div className="text-[10px] text-slate-600 mt-1">{f.text}</div>
                      </div>
                    ))}
                  </div>
               </motion.div>
            )}
          </div>
        </header>

        {activeNav === "overview" ? (
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Stats & Timetable */}
            <div className="lg:col-span-8 space-y-8">
              <div className="grid sm:grid-cols-4 gap-4">
                <MetricTile label="Mastery Index" value={`${overallMastery}%`} delta="+2.4%" icon={BarChart3} color="#1B4F5E" />
                <MetricTile label="Live Credits" value={`${totalSessions}`} icon={Calendar} color="#0D1B2A" />
                <MetricTile label="Current Streak" value="5 Days" icon={Zap} color="#7C3AED" />
                <MetricTile label="Leaderboard" value="#04" icon={Award} color="#C9A84C" />
              </div>

              {/* Live Session Timetable - Visible Grid Style */}
              <Card className="overflow-hidden border-black/5 shadow-none ring-1 ring-black/5">
                <div className="p-6 border-b border-black/5 bg-gray-50/50 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <span>Standardised Timetable • Week 18</span>
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-fluent-teal" /> Live</span>
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-200" /> Planned</span>
                  </div>
                </div>
                <div className="divide-y divide-black/5">
                  {upcomingSessions.map((s, i) => (
                    <div key={i} className="flex hover:bg-slate-50 transition-all cursor-pointer group">
                      <div className="w-20 p-6 border-r border-black/5 flex flex-col items-center justify-center bg-gray-50/30 group-hover:bg-white transition-colors">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{s.time.split(',')[0]}</span>
                        <span className="text-xl font-serif font-bold text-fluent-navy">16</span>
                      </div>
                      <div className="flex-1 p-6 flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-[11px] font-bold text-fluent-teal uppercase tracking-widest">{s.subject}</span>
                            <Badge color="gold" className="text-[9px] px-1.5 py-0">Main Stage</Badge>
                          </div>
                          <div className="text-lg font-bold text-fluent-navy tracking-tight">{s.topic}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[11px] font-bold text-slate-600">{s.teacher}</div>
                          <div className="text-[10px] text-slate-400">British Faculty Board</div>
                        </div>
                      </div>
                      <div className="w-32 border-l border-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <Btn variant="primary" size="sm" icon={Play} onClick={handleJoin}>Join Now</Btn>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Personalised Path */}
              <Card className="p-10 border-fluent-teal/20 bg-gradient-to-br from-white to-fluent-teal/5 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Sparkles size={120} className="text-fluent-teal" />
                 </div>
                 <div className="relative z-10">
                    <div className="flex justify-between items-start mb-10">
                       <div>
                          <h3 className="text-2xl font-serif font-bold tracking-tight">Synthesis Trajectory</h3>
                          <p className="text-sm text-slate-500 mt-1 italic font-medium leading-relaxed">Generated by Provost Alpheus for {studentName}</p>
                       </div>
                       <Badge color="teal" className="p-2 px-6 shadow-xl shadow-fluent-teal/10 uppercase tracking-widest text-[9px] font-black">AI Orchestrated</Badge>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-10">
                       <div className="space-y-6">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Core Concepts Identified</div>
                          <div className="space-y-3">
                             {(profile?.learningGoals || ["Elite Board Performance", "STEM Logic"]).map((goal: string, idx: number) => (
                                <div key={idx} className="flex items-center gap-4 group">
                                   <div className="w-2 h-2 rounded-full border-2 border-fluent-teal group-hover:bg-fluent-teal transition-colors" />
                                   <span className="text-xs font-bold text-fluent-navy tracking-tight uppercase tracking-widest">{goal}</span>
                                </div>
                             ))}
                          </div>
                       </div>
                       <div className="p-8 bg-fluent-navy text-white rounded-3xl shadow-2xl relative overflow-hidden">
                          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
                          <div className="text-[10px] font-medium text-white/40 uppercase tracking-widest mb-2">Current Protocol</div>
                          <div className="text-xl font-serif font-medium mb-6">
                             {(profile?.preferredStudyMethods || ["Adaptive Synthesis"]).join(" & ")}
                          </div>
                          <Btn variant="gold" size="sm" className="w-full py-4 text-[10px] tracking-widest font-black" onClick={() => setActiveNav("sessions")}>RESUME MASTERCLASS</Btn>
                       </div>
                    </div>
                 </div>
              </Card>
            </div>

            {/* Right Column: Feedback & Progress */}
            <div className="lg:col-span-4 space-y-8">
              <Card className="p-8 bg-white border-black/5">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-lg font-serif font-bold italic">Mastery Matrix</h3>
                  <div className="text-[10px] font-mono text-slate-400">Ver: 2.0.4</div>
                </div>
                <div className="space-y-10">
                  {subjectProgress.map(s => (
                    <div key={s.name} className="group">
                      <div className="flex justify-between items-end mb-3">
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 group-hover:text-fluent-teal transition-colors">{s.name}</div>
                          <div className="text-xs font-bold text-fluent-navy">{s.sessions} Transmission units</div>
                        </div>
                        <div className="text-xl font-mono font-medium tracking-tighter">{s.score}%</div>
                      </div>
                      <ProgressBar value={s.score} color={s.color} showPct={false} />
                    </div>
                  ))}
                </div>
                <div className="mt-12 pt-8 border-t border-black/5">
                   <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                         <Target size={18} className="text-fluent-teal" />
                      </div>
                      <div>
                         <div className="text-[10px] font-bold uppercase text-slate-400">Focus Subject</div>
                         <div className="text-sm font-bold text-fluent-navy">Physics :: Advanced Kinetics</div>
                      </div>
                   </div>
                </div>
              </Card>

              <Card className="p-8 border-black/5 bg-fluent-gold/5">
                <h3 className="text-sm font-bold text-fluent-navy uppercase tracking-widest mb-6">Provost Dispatch</h3>
                <div className="space-y-4">
                  {allFeedback.slice(0, 2).map((f: any, idx: number) => (
                    <div key={idx} className="p-5 bg-white rounded-2xl border border-fluent-gold/10 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-12 h-12 bg-fluent-gold/5 -mr-6 -mt-6 rounded-full" />
                      <div className="text-[10px] font-bold text-fluent-gold mb-2 uppercase tracking-tighter">{f.subject} Dispatch</div>
                      <p className="text-xs text-slate-600 leading-relaxed italic">{f.text}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        ) : activeNav === "assignments" ? (
          <StudentAssignments />
        ) : activeNav === "progress" ? (
          <StudentProgress />
        ) : activeNav === "confidence" ? (
          <ConfidenceTraining />
        ) : activeNav === "sessions" ? (
          activeSessionId ? (
            <LiveLab sessionId={activeSessionId} role="student" onExit={() => setActiveNav("overview")} />
          ) : (
            <div className="p-20 text-center">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                  <Play size={24} />
               </div>
               <h3 className="text-xl font-serif font-bold text-fluent-navy">No Active Synthesis</h3>
               <p className="text-sm text-slate-400 mt-2">Check your timetable for upcoming scheduled sessions.</p>
            </div>
          )
        ) : (
          <div className="py-20 text-center">
            <h3 className="text-2xl font-serif font-bold mb-4 uppercase tracking-tighter opacity-20">{activeNav} Module</h3>
            <p className="text-slate-400">This feature is currently in refinement.</p>
            <Btn variant="outline" className="mt-8" onClick={() => setActiveNav("overview")}>Return Overview</Btn>
          </div>
        )}
      </div>

      <BookingModal isOpen={showBooking} onClose={() => setShowBooking(false)} profile={profile} />
    </DashboardShell>
  );
};
