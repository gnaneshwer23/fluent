import React, { useState, useEffect } from 'react';
import { 
  Home, BookOpen, Calendar, BarChart3, Award, Settings, Bell, Play, 
  Sparkles, Zap, CheckCircle2, ArrowRight, Target, ClipboardList, MessageCircle, LogOut, Library, ChevronRight, MessageSquare, TrendingUp, BrainCircuit
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
      <div className="p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center gap-2 text-[9px] uppercase font-black text-slate-500 mb-6 tracking-[0.2em]">
          <button onClick={() => setActiveNav("overview")} className="hover:text-fluent-teal transition-colors">Studio</button>
          {activeNav !== 'overview' && (
            <>
              <ChevronRight size={10} className="text-slate-400" />
              <span className="text-fluent-teal">{navItems.find(i => i.id === activeNav)?.label}</span>
            </>
          )}
        </div>

        {/* Teacher Profiles Quick Access */}
        {teachers.length > 0 && activeNav === 'overview' && (
          <div className="mb-10">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4">Faculty Nodes</div>
            <div className="flex flex-wrap gap-4">
              {teachers.map(t => (
                <div 
                  key={t.id} 
                  onClick={() => setSelectedTeacher(t)}
                  className="flex items-center gap-3 bg-white border border-black/5 p-3 rounded-2xl hover:shadow-lg hover:border-fluent-teal/20 transition-all cursor-pointer group"
                >
                  <Avatar name={t.name} size={40} />
                  <div>
                    <div className="text-xs font-bold text-fluent-navy group-hover:text-fluent-teal transition-colors">{t.name}</div>
                    <div className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter">
                      {t.subjects?.[0] || 'Faculty'} Specialist
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
              ))}
            </div>
          </div>
        )}

        <header className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
          <div>
            <div className="text-[9px] text-gray-700 font-bold uppercase tracking-[0.15em] mb-1.5">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} • {studentGrade}</div>
            <h1 className="text-3xl font-serif font-bold tracking-tight">
              Good morning, <span className="text-fluent-teal font-normal">{studentName.split(' ')[0]}</span> ✦
            </h1>
            {alerts.length > 0 && (
              <div className="flex items-center gap-2 mt-3 px-3 py-1.5 bg-red-50 border border-red-100 rounded-full w-fit animate-pulse">
                <Zap size={12} className="text-red-500 fill-red-500" />
                <span className="text-[9px] font-black uppercase tracking-widest text-red-600">{alerts.length} Critical System Warnings</span>
              </div>
            )}
            <p className="text-slate-700 mt-1.5 text-sm">Targeting {profile?.goal || "Academic Excellence"} • Momentum looks strong.</p>
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
            <div className="bg-fluent-navy rounded-[32px] p-10 flex flex-wrap justify-between items-center gap-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
                  <Sparkles size={160} />
               </div>
               <div className="relative z-10">
                  <div className="text-[10px] font-black uppercase text-fluent-gold tracking-[0.4em] mb-4">Aitken Standard v2.1 Sync</div>
                  <h1 className="text-4xl lg:text-5xl font-serif font-bold text-white mb-2 tracking-tight">Good morning, {studentName.split(' ')[0]}! ✦</h1>
                  <p className="text-white/70 text-sm font-serif">Focusing on <strong className="text-white not-italic">{profile?.goal || "Academic Excellence"}</strong> today.</p>
               </div>
               <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 text-center border border-white/10 min-w-[140px] relative z-10">
                  <div className="text-5xl font-mono font-black text-white">{overallMastery}%</div>
                  <div className="text-[9px] font-black uppercase text-white/60 tracking-widest mt-2">Week {new Date().getMonth() + 1} Index</div>
                  <div className="text-[9px] text-green-400 mt-2 font-black uppercase tracking-tighter flex items-center justify-center gap-1">
                    <TrendingUp size={10} /> +2.4% Momentum
                  </div>
               </div>
            </div>

            {/* AI Call to Action */}
            <Card 
              className="p-8 bg-gradient-to-br from-fluent-teal to-fluent-teal/80 text-white cursor-pointer group hover:shadow-2xl hover:shadow-fluent-teal/20 transition-all border-none"
              onClick={() => setActiveNav("ai-tutor")}
            >
               <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white animate-pulse">
                        <BrainCircuit size={32} />
                     </div>
                     <div>
                        <h3 className="text-2xl font-serif font-bold text-white">Neural Scaffolding Protocol</h3>
                        <p className="text-white/60 text-sm mt-1">Your AI Persona is ready for today's mastery dialogue. Initialise synthesis?</p>
                     </div>
                  </div>
                  <Btn variant="primary" className="bg-white text-fluent-teal hover:bg-white/90 px-8 py-5 text-sm tracking-[0.2em] font-black">START STUDIING ✦</Btn>
               </div>
            </Card>

            {/* Stat row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricTile label="Mastery Index" value={`${overallMastery}%`} delta="+2.4%" icon={BarChart3} color="#1B4F5E" />
              <MetricTile label="Academic Points" value="1,240 XP" delta="Top 10%" icon={Star} color="#C9A84C" />
              <MetricTile label="Current Streak" value="5 Days" icon={Zap} color="#7C3AED" />
              <MetricTile label="Global Rank" value="#04" icon={Award} color="#C9A84C" />
            </div>

            {/* Next Milestone Section */}
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 p-8 border-none bg-white shadow-xl flex gap-8 items-center overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Target size={120} />
                 </div>
                 <div className="w-20 h-20 bg-fluent-teal/10 rounded-full flex items-center justify-center text-fluent-teal shrink-0">
                    <CheckCircle2 size={40} />
                 </div>
                 <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Next Recommended Concept</div>
                    <h3 className="text-2xl font-serif font-black text-fluent-navy mb-2">Bernoulli's Principle: Synthesis Lab</h3>
                    <p className="text-sm text-slate-500 font-serif italic mb-6">"Masters expect you to synthesise this with your recent Maths Logic quiz results."</p>
                    <div className="flex gap-4">
                       <Btn variant="primary" size="sm" onClick={() => setActiveNav("ai-tutor")} className="text-[9px] px-6">Initialise AI Prep</Btn>
                       <Btn variant="outline" size="sm" className="text-[9px] px-6">View Theory</Btn>
                    </div>
                 </div>
              </Card>

              <Card className="p-8 border-none bg-fluent-gold/5 shadow-xl flex flex-col justify-between">
                 <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-fluent-gold mb-6">Achievement Pulse</div>
                    <div className="flex gap-4 mb-4">
                       {[1, 2, 3].map(i => (
                          <div key={i} className={`w-10 h-10 rounded-xl flex items-center justify-center ${i === 1 ? 'bg-fluent-gold text-white shadow-lg' : 'bg-white text-slate-300 opacity-40'}`}>
                             <Award size={20} />
                          </div>
                       ))}
                    </div>
                    <div className="text-sm font-bold text-fluent-navy">Concept Crusader</div>
                    <div className="text-[10px] text-slate-500 mt-1 uppercase font-black tracking-widest">2/5 Labs Completed</div>
                 </div>
                 <div className="mt-8">
                    <ProgressBar progress={40} color="#C9A84C" />
                 </div>
              </Card>
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
        ) : activeNav === "ai-tutor" ? (
          <AITutor profile={profile} />
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
             <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Professional Bio</div>
             <p className="text-sm text-slate-700 leading-relaxed italic font-serif">
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
