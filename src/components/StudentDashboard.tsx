import React, { useState, useEffect } from 'react';
import { 
  Home, BookOpen, Calendar, BarChart3, Award, Settings, Bell, Play, 
  Sparkles, Zap, CheckCircle2, ArrowRight, Target, ClipboardList, MessageCircle, LogOut, Library, ChevronRight, MessageSquare
} from 'lucide-react';
import { motion } from 'motion/react';
import { collectionGroup, query, where, onSnapshot, collection, limit } from 'firebase/firestore';
import { db, auth } from '../lib/firebaseInit';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';
import { Badge, Card, Avatar, MetricTile, ProgressBar, Btn } from './UI';
import { FeedbackModal } from './FeedbackModal';
import { DashboardShell } from './DashboardShell';
import { BookingModal } from './BookingModal';
import { MasteryHeatmap } from './Charts';
import { LiveLab } from './LiveLab';
import { Forum } from './Forum';
import { MasteryLedger } from './MasteryLedger';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';

// New Sub-components
import StudentAssignments from './StudentAssignments';
import StudentProgress from './StudentProgress';
import ConfidenceTraining from './ConfidenceTraining';

export const StudentDashboard = ({ profile, onBack }: { profile?: any, onBack: () => void }) => {
  const [activeNav, setActiveNav] = useState("overview");
  const [showBooking, setShowBooking] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
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
    { id: "ledger", label: "Mastery Ledger", icon: Library, badge: "New" },
    { id: "progress", label: "Progress Report", icon: BarChart3 },
    { id: "forum", label: "Global Forum", icon: MessageCircle, badge: "Comm" },
    { id: "confidence", label: "Confidence", icon: Sparkles },
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
      <div className="p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center gap-2 text-[9px] uppercase font-black text-slate-400 mb-6 tracking-[0.2em] opacity-60">
          <button onClick={() => setActiveNav("overview")} className="hover:text-fluent-teal transition-colors">Studio</button>
          {activeNav !== 'overview' && (
            <>
              <ChevronRight size={10} className="text-slate-300" />
              <span className="text-fluent-teal">{navItems.find(i => i.id === activeNav)?.label}</span>
            </>
          )}
        </div>
        <header className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
          <div>
            <div className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.15em] mb-1.5">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} • {studentGrade}</div>
            <h1 className="text-3xl font-serif font-bold tracking-tight">
              Good morning, <span className="text-fluent-teal italic font-normal">{studentName.split(' ')[0]}</span> ✦
            </h1>
            {alerts.length > 0 && (
              <div className="flex items-center gap-2 mt-3 px-3 py-1.5 bg-red-50 border border-red-100 rounded-full w-fit animate-pulse">
                <Zap size={12} className="text-red-500 fill-red-500" />
                <span className="text-[9px] font-black uppercase tracking-widest text-red-600">{alerts.length} Critical System Warnings</span>
              </div>
            )}
            <p className="text-slate-500 mt-1.5 text-sm">Targeting {profile?.goal || "Academic Excellence"} • Momentum looks strong.</p>
          </div>

          <div className="p-4 bg-fluent-teal/5 border border-fluent-teal/10 rounded-2xl">
            <div className="font-bold text-fluent-teal mb-1.5 uppercase text-[9px] tracking-widest flex items-center gap-2">
              <Sparkles size={12} /> Personalised Focus
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-slate-600">Goal: <span className="font-bold text-fluent-navy">{profile?.goal || "Academic Excellence"}</span></p>
              {profile?.learningGoals && <p className="text-[10px] text-slate-500 italic">Objectives: {profile.learningGoals}</p>}
              {profile?.preferredStudyMethods && <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Method: {profile.preferredStudyMethods}</p>}
            </div>
          </div>
          
          <div className="flex gap-3 relative">
            <Btn variant="outline" size="sm" icon={Bell} onClick={() => setShowNotification(!showNotification)}>Notifications</Btn>
            <Btn variant="primary" size="sm" icon={isJoining ? Sparkles : Play} onClick={handleJoin} disabled={isJoining}>
              {isJoining ? "Connecting..." : "Join Session"}
            </Btn>
            <Btn variant="ghost" size="sm" icon={MessageSquare} onClick={() => setShowFeedback(true)}>Feedback</Btn>
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
          <div className="space-y-6">
            {/* Welcome + goal */}
            <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-2xl p-8 flex flex-wrap justify-between items-center gap-6">
              <div>
                <h1 className="text-3xl font-serif font-bold text-white mb-2 tracking-tight">Good morning, {studentName.split(' ')[0]}! 🎯</h1>
                <p className="text-indigo-200 text-sm">Goal: <strong className="text-white">{profile?.goal || "Academic Excellence"}</strong></p>
              </div>
              <div className="bg-white/10 rounded-xl p-5 text-center">
                <div className="text-4xl font-extrabold text-white">{overallMastery}%</div>
                <div className="text-xs text-indigo-200">This week's score</div>
                <div className="text-xs text-emerald-400 mt-1 font-medium">↑ +2.4% from last week</div>
              </div>
            </div>

            {/* Stat row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricTile label="Mastery Index" value={`${overallMastery}%`} delta="+2.4%" icon={BarChart3} color="#1B4F5E" />
              <MetricTile label="Live Credits" value={`${totalSessions}`} icon={Calendar} color="#0D1B2A" />
              <MetricTile label="Current Streak" value="5 Days" icon={Zap} color="#7C3AED" />
              <MetricTile label="Leaderboard" value="#04" icon={Award} color="#C9A84C" />
            </div>

            {/* Growth chart */}
            <Card className="p-6">
              <h3 className="text-lg font-serif font-bold text-slate-900 mb-6">My Score Journey — Last 5 Weeks</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={subjectProgress[0]?.history || []}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="week" tick={{fontSize: 12}} />
                  <YAxis tick={{fontSize: 12}} domain={[50, 100]} />
                  <Tooltip contentStyle={{borderRadius: 12}} />
                  <Area type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={3} fill="url(#scoreGrad)" name="Score" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* AI Action plan */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">🤖</span>
                <h3 className="text-lg font-serif font-bold text-slate-900">AI-Generated Action Plan for This Week</h3>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {["Practice 5 word problems daily — your biggest gap this week","Revisit Chapter 4 geometry theorems before Thursday's test","Book a 15-min session with Ms. Mehta on construction problems"].map((item,i)=>(
                  <div key={i} className="bg-white rounded-xl p-4 flex items-start gap-3 shadow-sm border border-slate-100">
                    <span className="text-xl">{"🎯📚💬"[i]}</span>
                    <p className="text-sm text-slate-600 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : activeNav === "assignments" ? (
          <StudentAssignments />
        ) : activeNav === "ledger" ? (
          <MasteryLedger userProfile={profile} />
        ) : activeNav === "progress" ? (
          <StudentProgress />
        ) : activeNav === "forum" ? (
          <Forum userProfile={profile} />
        ) : activeNav === "confidence" ? (
          <ConfidenceTraining />
        ) : activeNav === "sessions" ? (
          activeSessionId ? (
            <LiveLab sessionId={activeSessionId} role="student" onExit={() => setActiveNav("overview")} userProfile={profile} />
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
      <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} />
    </DashboardShell>
  );
};
