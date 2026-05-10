import React, { useState, useEffect } from 'react';
import { 
  Home, BookOpen, Calendar, BarChart3, Award, Settings, Bell, Play, 
  Sparkles, Zap, CheckCircle2, ArrowRight, Target, ClipboardList, MessageCircle, LogOut, Library, ChevronRight, MessageSquare, TrendingUp, BrainCircuit, Star
} from 'lucide-react';
import { motion } from 'motion/react';
import { collectionGroup, query, where, onSnapshot, collection, limit } from 'firebase/firestore';
import { db, auth } from '../lib/firebaseInit';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';
import { Badge, Card, Avatar, MetricTile, ProgressBar, Btn, Modal } from './UI';
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
import { AITutor } from './AITutor';

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
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);

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
    // Querying cohort students subcollections to find which cohorts the student belongs to
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

  useEffect(() => {
    if (myRecords.length === 0) return;
    const tutorIds = Array.from(new Set(myRecords.map(r => r.tutorId).filter(id => !!id)));
    if (tutorIds.length === 0) return;

    // Fetch tutor details
    const q = query(collection(db, 'users'), where('role', '==', 'teacher'));
    const unsub = onSnapshot(q, (snap) => {
      const allFaculty = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeachers(allFaculty.filter(f => tutorIds.includes(f.id)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'users/faculty'));

    return () => unsub();
  }, [myRecords]);

  const navItems = [
    { id: "overview", label: "Home", icon: Home },
    { id: "ai-tutor", label: "AI Tutor", icon: Sparkles, badge: "Mastery" },
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
      <div className="p-8">
        {activeNav === "overview" ? (
          <div className="space-y-6">
            {/* Hero Section */}
            <div className="bg-fluent-midnight rounded-xl p-10 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8 border border-fluent-gold/20">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(184,151,58,0.12)_0%,transparent_60%),radial-gradient(ellipse_at_80%_20%,rgba(184,151,58,0.06)_0%,transparent_50%)] pointer-events-none" />
              <div 
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{
                  backgroundImage: "linear-gradient(rgba(184,151,58,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(184,151,58,0.06) 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />
              
              <div className="relative z-10 flex-1">
                <div className="flex items-center gap-3 font-display text-[8px] tracking-[0.3em] uppercase text-fluent-gold mb-4">
                  <div className="w-6 h-px bg-fluent-gold" />
                  Aitken Standard V2.1 Sync
                </div>
                <h2 className="font-serif text-3xl md:text-4xl font-semibold text-fluent-cream leading-tight mb-2">
                  Good morning, <em>{studentName.split(' ')[0]}!</em> ✦
                </h2>
                <p className="text-stone-300 text-sm font-serif italic max-w-md">
                  Focusing on <strong className="text-fluent-gold font-normal not-italic">{profile?.goal || "Board Exam Elite Performance (95%+)"}</strong> today.
                </p>
              </div>

              <div className="relative z-10 bg-white/5 backdrop-blur-md border border-fluent-gold/25 p-7 rounded-lg text-center min-w-[200px]">
                <div className="font-serif text-5xl font-semibold text-fluent-cream leading-none">
                  {overallMastery}<span className="text-fluent-gold">%</span>
                </div>
                <div className="font-display text-[8px] tracking-[0.2em] uppercase text-fluent-gold mt-3">Week 5 Index</div>
                <div className="text-[10px] text-green-400 font-medium uppercase tracking-tighter mt-1 flex items-center justify-center gap-1">
                  ▲ +2.4% Momentum
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Mastery Index", val: `${overallMastery}%`, delta: "+2.4%", icon: "▦", color: "text-fluent-gold" },
                { label: "Academic Points", val: "1,240 XP", delta: "Top 10%", icon: "★", color: "text-blue-500" },
                { label: "Current Streak", val: "5 Days", delta: "Personal Best", icon: "⚡", color: "text-purple-500" },
                { label: "Global Rank", val: "#04", delta: "Up 2 places", icon: "🏅", color: "text-green-500" },
              ].map((stat, i) => (
                <div key={i} className="bg-white border border-black/5 p-6 rounded-lg group hover:border-fluent-gold/30 transition-all">
                  <div className={`w-9 h-9 rounded-lg bg-stone-100/50 flex items-center justify-center text-lg mb-4 ${stat.color}`}>{stat.icon}</div>
                  <div className="font-display text-[7px] tracking-[0.2em] uppercase text-stone-500 mb-1">{stat.label}</div>
                  <div className="font-serif text-3xl font-semibold text-fluent-ink leading-none">{stat.val}</div>
                  <div className="text-[11px] font-medium text-green-600 mt-2">▲ {stat.delta}</div>
                </div>
              ))}
            </div>

            {/* Main Grid */}
            <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
              <div className="space-y-6">
                {/* Recommended Concept */}
                <div className="bg-white border border-black/5 p-8 rounded-lg">
                  <div className="font-display text-[8px] tracking-[0.2em] uppercase text-fluent-gold mb-4">Next Recommended Concept</div>
                  <h3 className="font-serif text-2xl font-semibold text-fluent-ink mb-2">Bernoulli's Principle: Synthesis Lab</h3>
                  <p className="font-serif text-sm italic text-stone-600 mb-6">"Masters expect you to synthesise this with your recent Maths Logic quiz results."</p>
                  <div className="flex flex-wrap gap-2 mb-8">
                    <span className="text-[8px] font-display tracking-[0.1em] uppercase px-3 py-1 bg-stone-200/50 text-stone-600">Physics</span>
                    <span className="text-[8px] font-display tracking-[0.1em] uppercase px-3 py-1 bg-fluent-gold/10 text-fluent-gold">Synthesis Lab</span>
                    <span className="text-[8px] font-display tracking-[0.1em] uppercase px-3 py-1 text-stone-500">Estimated 45 min</span>
                  </div>
                  <div className="flex gap-4">
                    <button className="bg-fluent-midnight text-fluent-cream px-8 py-3.5 font-display text-[9px] tracking-[0.15em] uppercase hover:bg-fluent-gold hover:text-fluent-midnight transition-all">Initialise AI Prep</button>
                    <button className="bg-transparent border border-black/5 px-8 py-3.5 font-display text-[9px] tracking-[0.15em] uppercase hover:border-fluent-ink transition-all">View Theory</button>
                  </div>
                </div>

                {/* Score Journey */}
                <div className="bg-white border border-black/5 p-8 rounded-lg">
                  <div className="font-display text-[8px] tracking-[0.25em] uppercase text-stone-500 mb-6 flex items-center gap-4">
                    My Score Journey — Last 5 Weeks
                    <div className="flex-1 h-px bg-stone-200/50" />
                  </div>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { week: 'W1', score: 65 },
                        { week: 'W2', score: 72 },
                        { week: 'W3', score: 70 },
                        { week: 'W4', score: 85 },
                        { week: 'W5', score: 92 },
                      ]}>
                        <defs>
                          <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#b8973a" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#b8973a" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="week" tick={{fontSize: 10, fontFamily: 'DM Sans', fill: '#8896aa'}} axisLine={false} tickLine={false} />
                        <YAxis tick={{fontSize: 10, fontFamily: 'DM Sans', fill: '#8896aa'}} axisLine={false} tickLine={false} domain={[0, 100]} />
                        <Tooltip contentStyle={{borderRadius: 8, border: '1px solid rgba(0,0,0,0.05)', fontSize: 10}} />
                        <Area type="monotone" dataKey="score" stroke="#b8973a" strokeWidth={2} fill="url(#scoreGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-2 text-[10px] text-stone-500">
                      <div className="w-2 h-2 rounded-full bg-fluent-gold" />
                      Score Trajectory
                    </div>
                  </div>
                </div>

                {/* Action Plan */}
                <div className="bg-white border border-black/5 p-8 rounded-lg">
                  <div className="font-display text-[8px] tracking-[0.25em] uppercase text-stone-500 mb-6">AI-Generated Action Plan · This Week</div>
                  <div className="space-y-2">
                    {[
                      "Practice 5 word problems daily — your biggest gap this week",
                      "Revisit Chapter 4 geometry theorems before Thursday's test",
                      "Book a 15-min session with Ms. Mehta on construction problems"
                    ].map((plan, i) => (
                      <div key={i} className="flex gap-4 p-4 bg-stone-100/50 rounded border-l-2 border-fluent-gold text-sm text-fluent-ink">
                        <span className="text-fluent-gold py-0.5">◆</span>
                        {plan}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar Widgets */}
              <div className="space-y-6">
                {/* Achievement Pulse */}
                <div className="bg-white border border-black/5 p-6 rounded-lg">
                  <div className="font-display text-[8px] tracking-[0.25em] uppercase text-stone-500 mb-6">Achievement Pulse</div>
                  <div className="flex gap-2 mb-6">
                    <div className="w-11 h-11 rounded-full bg-fluent-gold/10 border border-fluent-gold/20 flex items-center justify-center text-xl">🏅</div>
                    <div className="w-11 h-11 rounded-full bg-stone-100 text-stone-400 opacity-40 flex items-center justify-center text-xl grayscale">⭐</div>
                    <div className="w-11 h-11 rounded-full bg-stone-100 text-stone-400 opacity-40 flex items-center justify-center text-xl grayscale">🎯</div>
                  </div>
                  <div className="font-medium text-sm text-fluent-ink">Concept Crusader</div>
                  <div className="text-[10px] text-stone-600 mt-1 uppercase font-display tracking-widest">2/5 Labs Completed</div>
                  <div className="h-1 bg-stone-200/50 rounded-full mt-4 overflow-hidden">
                    <div className="h-full bg-fluent-gold" style={{ width: '40%' }} />
                  </div>
                  <div className="text-[10px] text-stone-500 mt-2 font-medium">40% · 3 labs to next badge</div>
                </div>

                {/* Weekly Pulse */}
                <div className="bg-white border border-black/5 p-6 rounded-lg">
                  <div className="font-display text-[8px] tracking-[0.25em] uppercase text-stone-500 mb-6">This Week's Pulse</div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div className="text-[12px] text-stone-700">Sessions attended</div>
                      <div className="font-serif text-lg font-semibold leading-none">3/5</div>
                    </div>
                    <div className="h-1 bg-stone-200/50 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: '60%' }} />
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="text-[12px] text-stone-700">Assignments submitted</div>
                      <div className="font-serif text-lg font-semibold leading-none">0/2</div>
                    </div>
                    <div className="h-1 bg-stone-200/50 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500" style={{ width: '0%' }} />
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="text-[12px] text-stone-700">AI Tutor queries</div>
                      <div className="font-serif text-lg font-semibold leading-none">12</div>
                    </div>
                  </div>
                </div>

                {/* Quick Navigate */}
                <div className="bg-white border border-black/5 p-6 rounded-lg">
                  <div className="font-display text-[8px] tracking-[0.25em] uppercase text-stone-500 mb-6">Quick Navigate</div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { icon: "✦", label: "AI Tutor", id: "ai-tutor" },
                      { icon: "↗", label: "Progress", id: "progress" },
                      { icon: "≡", label: "Assignments", id: "assignments" },
                      { icon: "◎", label: "Forum", id: "forum" },
                    ].map(nav => (
                      <button key={nav.id} onClick={() => setActiveNav(nav.id)} className="p-4 bg-stone-100/50 rounded hover:bg-fluent-gold/5 border border-transparent hover:border-fluent-gold/20 transition-all text-center group">
                        <div className="text-lg mb-1.5 group-hover:scale-110 transition-transform">{nav.icon}</div>
                        <div className="text-[10px] text-stone-500 group-hover:text-fluent-midnight font-medium">{nav.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Next Session */}
                <div className="bg-white border-l-4 border-fluent-gold border-y border-r border-black/5 p-6 rounded-lg">
                  <div className="font-display text-[8px] tracking-[0.25em] uppercase text-stone-500 mb-4">Next Session</div>
                  <h4 className="font-serif text-xl font-bold text-fluent-ink">Physics · Mechanics</h4>
                  <div className="text-xs text-stone-500 mt-1 mb-1">Tomorrow · 10:00 AM</div>
                  <div className="text-xs text-stone-500 mb-6 italic">Ms. Priya Mehta · British Trained</div>
                  <button className="w-full py-3 border border-black/10 rounded font-display text-[9px] tracking-[0.2em] uppercase hover:border-fluent-ink transition-all">Add to Calendar</button>
                </div>
              </div>
            </div>
          </div>
        ) : activeNav === "ai-tutor" ? (
          <AITutor profile={profile} />
        ) : activeNav === "assignments" ? (
          <StudentAssignments />
        ) : activeNav === "ledger" ? (
          <MasteryLedger userProfile={profile} />
        ) : activeNav === "progress" ? (
          <StudentProgress profile={profile} />
        ) : activeNav === "forum" ? (
          <Forum userProfile={profile} />
        ) : activeNav === "confidence" ? (
          <ConfidenceTraining />
        ) : activeNav === "sessions" ? (
          activeSessionId ? (
            <LiveLab sessionId={activeSessionId} role="student" onExit={() => setActiveNav("overview")} userProfile={profile} />
          ) : (
            <div className="p-20 text-center flex flex-col items-center">
               <div className="w-16 h-16 bg-white border border-black/5 rounded-full flex items-center justify-center mb-6 text-2xl opacity-20">▶</div>
               <h3 className="text-2xl font-serif font-bold text-fluent-midnight">No Active Synthesis</h3>
               <p className="text-sm text-stone-600 mt-2 font-serif italic">Check your timetable for upcoming scheduled sessions.</p>
               <button onClick={() => setActiveNav('overview')} className="mt-8 bg-fluent-midnight text-fluent-cream px-10 py-4 font-display text-[10px] tracking-[0.2em] uppercase hover:bg-fluent-gold transition-all">View Full Schedule</button>
            </div>
          )
        ) : (
          <div className="py-20 text-center flex flex-col items-center">
            <h3 className="text-3xl font-serif font-bold mb-4 uppercase tracking-tighter opacity-10">{activeNav} Module</h3>
            <p className="text-stone-400 italic font-serif">This feature is currently in refinement.</p>
            <button className="mt-8 border border-black/10 px-10 py-3.5 font-display text-[10px] tracking-[0.2em] uppercase hover:border-fluent-ink transition-all" onClick={() => setActiveNav("overview")}>Return Overview</button>
          </div>
        )}
      </div>

      <BookingModal isOpen={showBooking} onClose={() => setShowBooking(false)} profile={profile} />
      <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} />

      {/* Teacher Profile Modal */}
      <Modal 
        isOpen={!!selectedTeacher} 
        onClose={() => setSelectedTeacher(null)} 
        title="Faculty Profile"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-3xl border border-black/5">
             <Avatar name={selectedTeacher?.name || ""} size={80} />
             <div>
                <h4 className="text-2xl font-serif font-bold text-fluent-navy">{selectedTeacher?.name}</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                   {selectedTeacher?.subjects?.map((s: string) => (
                      <span key={s}>
                        <Badge color="teal">{s}</Badge>
                      </span>
                   ))}
                </div>
             </div>
          </div>

          <div className="space-y-2 px-2">
             <div className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-700">Professional Bio</div>
             <p className="text-sm text-stone-800 leading-relaxed italic font-serif">
                {selectedTeacher?.bio || "This faculty node focuses on high-performance British instruction and adaptive synthesis. Bio currently being synchronised."}
             </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 bg-fluent-teal/5 rounded-2xl border border-fluent-teal/10">
                <div className="text-[9px] font-black text-fluent-teal uppercase tracking-widest mb-1">Status</div>
                <div className="text-sm font-bold text-fluent-navy">Active Faculty</div>
             </div>
             <div className="p-4 bg-fluent-gold/5 rounded-2xl border border-fluent-gold/10">
                <div className="text-[9px] font-black text-fluent-gold uppercase tracking-widest mb-1">Standard</div>
                <div className="text-sm font-bold text-fluent-navy">British Synthesis</div>
             </div>
          </div>

          <Btn variant="primary" className="w-full mt-4" onClick={() => setSelectedTeacher(null)}>Close Profile</Btn>
        </div>
      </Modal>
    </DashboardShell>
  );
};
