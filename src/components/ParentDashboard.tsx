import React, { useState, useEffect } from 'react';
import { 
  Home, BarChart3, Calendar, Mail, Lock, Settings, Plus, Users, TrendingUp, ShieldCheck, Award, CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, collectionGroup } from 'firebase/firestore';
import { db, auth } from '../lib/firebaseInit';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';
import { Badge, Card, Avatar, MetricTile, ProgressBar, Btn } from './UI';
import { DashboardShell } from './DashboardShell';
import { BookingModal } from './BookingModal';

export const ParentDashboard = ({ profile, onBack }: { profile?: any, onBack: () => void }) => {
  const [activeNav, setActiveNav] = useState("overview");
  const [showBooking, setShowBooking] = useState(false);
  const [activeChild, setActiveChild] = useState(0);
  const [monitoredStudents, setMonitoredStudents] = useState<any[]>([]);
  const [childRecords, setChildRecords] = useState<any[]>([]);
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
    if (monitoredStudents.length === 0 || activeChild >= monitoredStudents.length) {
      setChildRecords([]);
      return;
    }
    const childName = monitoredStudents[activeChild].name;
    const q = query(collectionGroup(db, 'students'), where('name', '==', childName));
    const unsub = onSnapshot(q, (snap) => {
      setChildRecords(snap.docs.map(doc => doc.data()));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'collectionGroup/students'));
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
    { id: "overview", label: "Family Overview", icon: Home },
    { id: "progress", label: "Progress Reports", icon: BarChart3 },
    { id: "sessions", label: "Sessions", icon: Calendar },
    { id: "messages", label: "Messages", icon: Mail, badge: "3" },
    { id: "billing", label: "Billing", icon: Lock },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const subjectData = childRecords.map(r => ({
    subject: r.subject || "General",
    score: r.total > 0 ? Math.round((r.attended / r.total) * 100) : 0,
    lastWeek: 0,
    teacher: "Faculty"
  }));

  return (
    <DashboardShell role="parent" title={parentName} navItems={navItems} activeNav={activeNav} setActiveNav={setActiveNav} onBack={onBack}>
      <div className="p-10 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
          <div>
            <h1 className="text-3xl font-serif font-bold tracking-tight">Welcome, {parentName.split(' ')[0]} ✦</h1>
            <p className="text-slate-500 mt-1">Focusing on {profile?.goal || "Holistic Academic Support"} for your family.</p>
          </div>
          <Btn variant="gold" icon={Calendar} size="sm" onClick={() => setShowBooking(true)}>Book Faculty Consultation</Btn>
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
                <div className={`text-[10px] font-bold uppercase tracking-wider ${activeChild === i ? "text-white/40" : "text-gray-400"}`}>Account Active</div>
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
              <MetricTile label="Family Mastery" value={`${Math.round(subjectData.reduce((acc, curr) => acc + curr.score, 0) / (subjectData.length || 1))}%`} delta="+0%" icon={TrendingUp} color="#1B4F5E" />
              <MetricTile label="Sessions" value={`${childRecords.length}`} delta="+0" icon={Calendar} color="#0D1B2A" />
              <MetricTile label="Assignments" value="Pending" delta="+0%" icon={CheckCircle2} color="#C9A84C" />
              <MetricTile label="Attendance" value="98%" icon={ShieldCheck} color="#C9A84C" />
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-start">
              <Card className="lg:col-span-2 p-8">
                <h3 className="text-xl font-serif font-bold mb-8">{monitoredStudents[activeChild].name}'s Subject Mastery</h3>
                <div className="space-y-6">
                  {subjectData.map(s => (
                    <div key={s.subject} className="p-5 bg-gray-50 rounded-xl hover:shadow-md transition-all">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <div className="font-bold text-sm text-fluent-navy">{s.subject}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tutor: {s.teacher}</div>
                        </div>
                        <div className="font-mono font-bold text-xl leading-none">{s.score}%</div>
                      </div>
                      <ProgressBar value={s.score} color={s.subject.includes('English') ? '#C9A84C' : '#1B4F5E'} showPct={false} />
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-8">
                <h3 className="text-xl font-serif font-bold mb-6">Faculty Feedback</h3>
                <div className="p-5 bg-fluent-navy text-white rounded-xl">
                  <p className="text-xs text-white/70 leading-relaxed italic">"Student demonstrating consistent effort. Trajectory is positive."</p>
                </div>
              </Card>
            </div>
          </>
        ) : (
          <div className="py-20 text-center text-slate-400 font-serif font-bold">
            {activeNav} Module in refinement.
          </div>
        )}
      </div>

      <BookingModal isOpen={showBooking} onClose={() => setShowBooking(false)} profile={profile} />
    </DashboardShell>
  );
};
