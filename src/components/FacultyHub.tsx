import React, { useState, useEffect, useMemo } from 'react';
import { 
  Home, Users, Database, Calendar, Play, BookOpen, Settings, Plus, Search, 
  Trash2, Edit2, BarChart3, TrendingUp, Zap, CheckCircle2, ArrowRight, X, Mail, Phone, Shield, ShieldCheck, Lock, Check,
  ClipboardList, FileText, CalendarDays, LogOut, Library, MessageSquare, Layers
} from 'lucide-react';
import { motion } from 'motion/react';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, deleteDoc, serverTimestamp, orderBy, limit, collectionGroup, setDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebaseInit';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';
import { Badge, Card, Avatar, MetricTile, ProgressBar, Btn } from './UI';
import { DashboardShell } from './DashboardShell';
import { LiveLab } from './LiveLab';
import { Forum } from './Forum';
import { MasteryLedger } from './MasteryLedger';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

import TeacherAssignments from './TeacherAssignments';
import TeacherReports from './TeacherReports';
import TeacherAttendance from './TeacherAttendance';
import TeacherAnalytics from './TeacherAnalytics';
import { CurriculumManager } from './CurriculumManager';

export const FacultyHub = ({ profile, onBack }: { profile?: any, onBack: () => void }) => {
  const [activeNav, setActiveNav] = useState("overview");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.currentUser) return;
    // Check for active live session by this teacher
    const q = query(collection(db, 'liveSessions'), where('teacherId', '==', auth.currentUser.uid), limit(1));
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);
  const [selectedClassForStudents, setSelectedClassForStudents] = useState<any>(null);
  const [selectedPoolStudents, setSelectedPoolStudents] = useState<string[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentSort, setStudentSort] = useState("name-asc");
  const [feedbackCategory, setFeedbackCategory] = useState("Academic Improvement");
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackFilter, setFeedbackFilter] = useState("All");
  const [feedbackSort, setFeedbackSort] = useState("newest");
  const [feedbackDate, setFeedbackDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewingHistory, setViewingHistory] = useState<any>(null);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [viewingStudentDetail, setViewingStudentDetail] = useState<any>(null);
  const [studentModalTab, setStudentModalTab] = useState<'overview' | 'history'>('overview');
  const [studentHistory, setStudentHistory] = useState<any[]>([]);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  useEffect(() => {
    if (!viewingStudentDetail?.id || studentModalTab !== 'history') return;
    
    // Students might be identified by sid or id in progress collection
    const sid = viewingStudentDetail.id;
    const q = query(
      collection(db, 'progress'), 
      where('studentId', '==', sid),
      orderBy('createdAt', 'desc')
    );
    
    const unsub = onSnapshot(q, (snap) => {
      setStudentHistory(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'progress');
    });
    
    return () => unsub();
  }, [viewingStudentDetail?.id, studentModalTab]);
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [unassignedStudents, setUnassignedStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cohortSubjectFilter, setCohortSubjectFilter] = useState<string[]>(profile?.subjects?.[0] ? [profile?.subjects[0]] : ["All"]);
  const [cohortGradeFilter, setCohortGradeFilter] = useState("All");

  const teacherName = profile?.name || auth.currentUser?.displayName || "Dr. Sarah Mills";
  const department = profile?.subjects?.[0] || "Physics";

  useEffect(() => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;

    const classesQuery = query(collection(db, 'cohorts'), where('tutorId', '==', uid));
    const unsubClasses = onSnapshot(classesQuery, (snap) => {
      const classData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClasses(classData);
      setLoading(false);
    }, (error) => {
      if (auth.currentUser) {
        handleFirestoreError(error, OperationType.LIST, 'cohorts');
      }
    });

    const poolQuery = query(collection(db, 'studentPool'), where('tutorId', '==', uid));
    const unsubPool = onSnapshot(poolQuery, (snap) => {
      const poolData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUnassignedStudents(poolData);
    }, (error) => {
      if (auth.currentUser) {
        handleFirestoreError(error, OperationType.LIST, 'studentPool');
      }
    });

    const bookingsQuery = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'), limit(50));
    const unsubBookings = onSnapshot(bookingsQuery, (snap) => {
      setBookings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      if (auth.currentUser) {
        handleFirestoreError(error, OperationType.LIST, 'bookings');
      }
    });

    return () => {
      unsubClasses();
      unsubPool();
      unsubBookings();
    };
  }, []);

  const filteredClasses = useMemo(() => {
    return classes.filter(c => {
      const subjectMatch = cohortSubjectFilter.includes("All") || cohortSubjectFilter.includes(c.subject);
      const gradeMatch = cohortGradeFilter === "All" || c.grade === cohortGradeFilter;
      return subjectMatch && gradeMatch;
    });
  }, [classes, cohortSubjectFilter, cohortGradeFilter]);

  const toggleSubjectFilter = (subject: string) => {
    if (subject === "All") {
      setCohortSubjectFilter(["All"]);
    } else {
      setCohortSubjectFilter(prev => {
        const withoutAll = prev.filter(s => s !== "All");
        const next = withoutAll.includes(subject) 
          ? withoutAll.filter(s => s !== subject) 
          : [...withoutAll, subject];
        return next.length === 0 ? ["All"] : next;
      });
    }
  };

  const [classStudents, setClassStudents] = useState<any[]>([]);
  useEffect(() => {
    if (!selectedClassForStudents?.id) {
      setClassStudents([]);
      return;
    }
    const studentsRef = collection(db, 'cohorts', selectedClassForStudents.id, 'students');
    const unsub = onSnapshot(studentsRef, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClassStudents(data);
    }, (error) => {
      if (auth.currentUser) {
        handleFirestoreError(error, OperationType.LIST, `cohorts/${selectedClassForStudents.id}/students`);
      }
    });
    return () => unsub();
  }, [selectedClassForStudents?.id]);

  const [allStudents, setAllStudents] = useState<any[]>([]);
  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collectionGroup(db, 'students'), where('teacherId', '==', auth.currentUser.uid));
    const unsub = onSnapshot(q, (snap) => {
      setAllStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      if (auth.currentUser) {
        handleFirestoreError(error, OperationType.LIST, 'collectionGroup/students');
      }
    });
    return () => unsub();
  }, []);

  const [dbAlerts, setDbAlerts] = useState<any[]>([]);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, 'alerts'),
      where('status', '==', 'active'),
      orderBy('date', 'desc'),
      limit(20)
    );
    const unsub = onSnapshot(q, (snap) => {
      setDbAlerts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      if (auth.currentUser) {
        handleFirestoreError(error, OperationType.LIST, 'alerts');
      }
    });
    return () => unsub();
  }, []);

  const criticalAlerts = useMemo(() => {
    const teacherStudentIds = new Set(allStudents.map(s => s.id));
    return dbAlerts
      .filter(a => teacherStudentIds.has(a.studentId))
      .slice(0, 3)
      .map(a => {
        const student = allStudents.find(s => s.id === a.studentId);
        return {
          ...a,
          studentName: student?.name || "Unknown Scholar",
          className: student?.cohortName || student?.className || "General Cohort"
        };
      });
  }, [dbAlerts, allStudents]);

  const handleIntervene = async (alertId: string) => {
    try {
      await updateDoc(doc(db, 'alerts', alertId), { 
        status: 'resolved', 
        resolvedAt: serverTimestamp(),
        resolvedBy: auth.currentUser?.uid
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `alerts/${alertId}`);
    }
  };

  const navItems = [
    { id: "overview", label: "Dashboard", icon: Home },
    { id: "cohorts", label: "Cohorts", icon: Users },
    { id: "assignments", label: "Assignments", icon: ClipboardList },
    { id: "analytics", label: "Analytics", icon: BarChart3, badge: "AI" },
    { id: "ledger", label: "Mastery Ledger", icon: Library },
    { id: "forum", label: "Global Forum", icon: MessageSquare, badge: "Comm" },
    { id: "reports", label: "Accountability", icon: FileText, badge: "Weekly" },
    { id: "attendance", label: "Roll Call", icon: CalendarDays },
    { id: "live", label: "Live Lab", icon: Play, badge: "Live" },
    { id: "registry", label: "Registry", icon: Database },
    { id: "curriculum", label: "Curriculum Nodes", icon: Layers, badge: "RAG" },
    { id: "profile", label: "Profile", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const sessions = [
    { time: "09:00 - 10:30", class: "Cohort 10A", subject: "Physics", topic: "Energy Conservation", status: "completed" },
    { time: "11:00 - 12:30", class: "Cohort 9B", subject: "Maths", topic: "Geometric Logic", status: "live" },
    { time: "14:00 - 15:30", class: "Cohort 11C", subject: "English", topic: "Shakespearean Flow", status: "upcoming" },
  ];

  const handleCreateClass = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    const formData = new FormData(e.currentTarget);
    const newClass = {
      name: formData.get('name') as string,
      grade: formData.get('grade') as string,
      subject: formData.get('subject') as string,
      students: 0,
      avgScore: 0,
      attendance: 0,
      tutorId: auth.currentUser.uid,
      createdAt: serverTimestamp()
    };
    try {
      await addDoc(collection(db, 'cohorts'), newClass);
      setShowCreateModal(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'cohorts');
    }
  };

  const handleUpdateClass = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingClass) return;
    const formData = new FormData(e.currentTarget);
    try {
      await updateDoc(doc(db, 'cohorts', editingClass.id), {
        name: formData.get('name') as string,
        grade: formData.get('grade') as string,
        subject: formData.get('subject') as string,
      });
      setEditingClass(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `cohorts/${editingClass.id}`);
    }
  };

  const handleAddStudent = async (classId: string, name: string) => {
    if (!auth.currentUser) return;
    try {
      const classRef = doc(db, 'cohorts', classId);
      await addDoc(collection(classRef, 'students'), {
        name,
        tutorId: auth.currentUser.uid,
        cohortName: selectedClassForStudents.name,
        subject: selectedClassForStudents.subject,
        grade: selectedClassForStudents.grade,
        attended: 0,
        total: 0,
        enrolledAt: serverTimestamp(),
        studentId: `UK-SYNT-${Math.floor(1000 + Math.random() * 9000)}`
      });
      // Increment student count
      await updateDoc(classRef, { students: (selectedClassForStudents.students || 0) + 1 });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `cohorts/${classId}/students`);
    }
  };

  const handleBulkAdd = async () => {
    if (!bulkText.trim() || !selectedClassForStudents) return;
    const names = bulkText.split('\n').map(n => n.trim()).filter(n => n !== "");
    for (const name of names) {
      await handleAddStudent(selectedClassForStudents.id, name);
    }
    setBulkText("");
    setShowBulkAdd(false);
  };

  const handleDeleteClass = async (classId: string) => {
    if (!window.confirm("Delete this cohort?")) return;
    try {
      await deleteDoc(doc(db, 'cohorts', classId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `cohorts/${classId}`);
    }
  };

  const handleStartSession = async (cls: any) => {
    if (!auth.currentUser) return;
    try {
      const sessionId = `live-${cls.id}`;
      await setDoc(doc(db, 'liveSessions', sessionId), {
        id: sessionId,
        className: cls.name,
        subject: cls.subject,
        topic: cls.topic || `Live ${cls.subject} Synthesis`,
        teacherId: auth.currentUser.uid,
        teacherName,
        activeCount: 0,
        currentProtocol: "Initialising British Standard synthesis protocol...",
        createdAt: serverTimestamp(),
      });
      setActiveNav("live");
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'liveSessions');
    }
  };

  return (
    <DashboardShell role="teacher" title={teacherName} navItems={navItems} activeNav={activeNav} setActiveNav={setActiveNav} onBack={onBack}>
      <div className="p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge color="teal">Expert Faculty</Badge>
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] text-green-600 font-bold uppercase tracking-wider">• {department} Department Access</span>
            </div>
            <h1 className="text-3xl font-serif font-bold tracking-tight">
              Welcome, <span className="text-fluent-teal italic font-normal">{teacherName.split(' ')[0]}</span> ✦
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              Focusing on <span className="font-bold text-fluent-navy">{profile?.goal || "British Scaffolding"}</span> • {classes.length} cohorts active.
            </p>
          </div>
          <div className="flex gap-2">
             <Btn variant="outline" size="sm" icon={Plus} onClick={() => setShowCreateModal(true)}>New Cohort</Btn>
             {activeNav === 'overview' && <Btn variant="gold" size="sm" icon={Play} onClick={() => setActiveNav("live")}>Enter Lab</Btn>}
          </div>
        </header>

        {activeNav === 'overview' ? (
          <div className="grid lg:grid-cols-12 gap-6 items-start">
            {/* Main Command Console */}
            <div className="lg:col-span-8 space-y-6">
              <div className="grid sm:grid-cols-4 gap-4">
                <MetricTile label="Total Cohorts" value={classes.length.toString()} icon={Users} color="#1B4F5E" />
                <MetricTile label="Avg Mastery" value="84%" delta="+4.2%" icon={TrendingUp} color="#0D1B2A" />
                <MetricTile label="Live Minutes" value="7.2k" icon={Calendar} color="#C9A84C" />
                <MetricTile label="System Pulse" value="Online" icon={Zap} color="#7C3AED" />
              </div>

              {/* Critical Alerts - Priority Synthesis Interventions */}
              {criticalAlerts.length > 0 && (
                <Card className="border-red-400/20 bg-red-400/5 overflow-hidden shadow-none ring-1 ring-red-400/10">
                  <div className="p-4 border-b border-red-400/10 bg-red-400/10 flex items-center justify-between">
                     <div className="text-[9px] font-black text-red-500 uppercase tracking-[0.3em] flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        Critical Cohort Alerts
                     </div>
                     <span className="text-[8px] font-bold text-red-400/60 uppercase">Action Required</span>
                  </div>
                  <div className="divide-y divide-red-400/10">
                    {criticalAlerts.map((a) => (
                      <div key={a.id} className="p-4 flex justify-between items-center group hover:bg-red-400/5 transition-all">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge color="red" className="text-[7px] uppercase tracking-tighter h-4 px-1.5">{a.type}</Badge>
                            <span className="text-[9px] font-bold text-red-400/60 uppercase">{a.className}</span>
                          </div>
                          <div className="text-base font-bold text-fluent-navy tracking-tight">{a.studentName}</div>
                          <p className="text-xs text-slate-500 mt-0.5 italic">{a.message}</p>
                        </div>
                        <Btn 
                          variant="primary" 
                          size="sm" 
                          className="bg-red-500 hover:bg-red-600 border-none shadow-lg shadow-red-500/20 text-[9px] px-4"
                          onClick={() => handleIntervene(a.id)}
                        >
                          Intervene
                        </Btn>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Orchestration Feed - Technical Grid */}
              <Card className="overflow-hidden border-black/5 shadow-none ring-1 ring-black/5">
                <div className="p-4 border-b border-black/5 bg-gray-50/50 flex justify-between items-center">
                   <h3 className="text-xs font-bold text-fluent-navy uppercase tracking-widest flex items-center gap-2">
                      <Database size={14} className="text-slate-400" />
                      Synthetic Delivery Feed
                   </h3>
                   <div className="flex gap-2">
                      <Badge color="navy" className="text-[8px]">Active</Badge>
                   </div>
                </div>
                <div className="divide-y divide-black/5">
                  {sessions.map((s, i) => (
                    <div key={i} className="flex hover:bg-slate-50 transition-all group">
                      <div className="w-20 p-4 border-r border-black/5 flex flex-col items-center justify-center bg-gray-50/30 group-hover:bg-white transition-colors">
                        <span className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-1">{s.time.split(' - ')[0]}</span>
                        <div className="h-3 w-px bg-slate-200 my-1" />
                        <span className="text-[9px] font-bold text-slate-400 uppercase leading-none">{s.time.split(' - ')[1]}</span>
                      </div>
                      <div className="flex-1 p-4 flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-black text-fluent-navy uppercase tracking-[0.15em]">{s.class}</span>
                            <span className="text-[9px] text-slate-400 font-medium">// {s.subject} Unit</span>
                          </div>
                          <div className="text-base font-serif font-bold text-fluent-navy">{s.topic}</div>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="text-right">
                              {s.status === 'live' ? (
                                <div className="flex items-center gap-1.5 text-fluent-teal font-black text-[9px] uppercase tracking-widest">
                                   <div className="w-1.5 h-1.5 rounded-full bg-fluent-teal animate-pulse" />
                                   Transmitting
                                </div>
                              ) : (
                                <Badge color={s.status === 'completed' ? 'gray' : 'gold'} className="text-[8px] uppercase tracking-widest">{s.status}</Badge>
                              )}
                           </div>
                           <Btn 
                             variant={s.status === 'upcoming' ? 'primary' : 'outline'} 
                             size="sm" 
                             className={`min-w-[100px] text-[9px] font-black uppercase tracking-widest ${s.status === 'upcoming' ? 'shadow-lg shadow-fluent-teal/10' : ''}`}
                             icon={Play} 
                             onClick={() => handleStartSession({
                               id: s.class.replace(/\s+/g, '-').toLowerCase(), 
                               name: s.class, 
                               subject: s.subject,
                               topic: s.topic
                             })}
                           >
                             {s.status === 'live' ? 'Re-Enter' : s.status === 'completed' ? 'Review' : 'Initialize'}
                           </Btn>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Assignment Overview Section */}
              <Card className="overflow-hidden border-black/5 shadow-none ring-1 ring-black/5">
                <div className="p-4 border-b border-black/5 bg-gray-50/50 flex justify-between items-center">
                   <h3 className="text-xs font-bold text-fluent-navy uppercase tracking-widest flex items-center gap-2">
                      <ClipboardList size={14} className="text-slate-400" />
                      Challenges
                   </h3>
                   <Btn variant="ghost" size="sm" className="text-[9px] font-bold uppercase tracking-widest" onClick={() => setActiveNav("assignments")}>View All</Btn>
                </div>
                <div className="p-0">
                   <TeacherAssignments mini />
                </div>
              </Card>
            </div>

            {/* Right Side: Registry & Quick Stats */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="p-8 bg-fluent-navy text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                   <ShieldCheck size={120} />
                </div>
                <div className="relative z-10">
                   <h3 className="text-xl font-serif font-bold mb-1 italic">Institutional Reach</h3>
                   <div className="text-white/40 text-[9px] font-bold uppercase tracking-[0.3em] mb-6">Analytic Summary</div>
                   
                   <div className="space-y-6">
                      {classes.slice(0, 3).map((c, i) => (
                        <div key={i} className="space-y-2">
                           <div className="flex justify-between items-end">
                              <div>
                                 <div className="text-[10px] font-bold text-fluent-gold uppercase tracking-widest">{c.name}</div>
                                 <div className="text-[9px] text-white/40 font-mono mt-0.5">{c.students} active scholars</div>
                              </div>
                              <div className="text-xl font-mono font-medium tracking-tighter">{c.avgScore}%</div>
                           </div>
                           <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${c.avgScore}%` }}
                                className="h-full bg-fluent-gold"
                              />
                           </div>
                        </div>
                      ))}
                   </div>
                   
                   <Btn variant="gold" size="md" className="w-full mt-8 py-4 text-[9px] font-black tracking-[0.2em]" onClick={() => setActiveNav("cohorts")}>FULL AUDIT</Btn>
                </div>
              </Card>

              <Card className="p-6 border-black/5 group cursor-pointer" onClick={() => setActiveNav("registry")}>
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-[10px] font-bold text-fluent-navy uppercase tracking-widest">Registry Intake</h3>
                    <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-fluent-teal group-hover:text-white transition-all">
                       <Plus size={12} />
                    </div>
                 </div>
                 <div className="space-y-3">
                    {unassignedStudents.slice(0, 3).map((s, i) => (
                       <div key={i} className="flex items-center gap-3">
                          <Avatar name={s.name} size={28} />
                          <div className="text-[11px] font-bold text-slate-600">{s.name}</div>
                          <Badge color="gray" className="ml-auto text-[8px]">Draft</Badge>
                       </div>
                    ))}
                 </div>
              </Card>
            </div>
          </div>
        ) : activeNav === 'settings' ? (
          <div className="max-w-2xl">
            <h2 className="text-3xl font-serif font-bold mb-8">Faculty Preferences</h2>
            <Card className="p-8">
              <h3 className="text-lg font-bold mb-6">Subject Specializations</h3>
              <p className="text-sm text-slate-500 mb-6">Select the subjects you specialize in to improve student matching and class management.</p>
              <div className="grid grid-cols-2 gap-3">
                {["Mathematics", "Physics", "Chemistry", "Biology", "English", "Science (All)"].map(s => (
                  <div 
                    key={s} 
                    onClick={async () => {
                      if (!auth.currentUser) return;
                      const newSubjects = (profile?.subjects || []).includes(s) 
                        ? (profile?.subjects || []).filter((x: string) => x !== s)
                        : [...(profile?.subjects || []), s];
                      try {
                        await updateDoc(doc(db, 'users', auth.currentUser.uid), { subjects: newSubjects });
                      } catch (e) { handleFirestoreError(e, OperationType.WRITE, 'users'); }
                    }}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between group ${
                      (profile?.subjects || []).includes(s) ? "border-fluent-teal bg-fluent-teal/5" : "border-black/5 bg-white hover:border-black/20"
                    }`}
                  >
                    <span className="font-bold text-sm">{s}</span>
                    {(profile?.subjects || []).includes(s) && <CheckCircle2 size={18} className="text-fluent-teal" />}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        ) : activeNav === 'profile' ? (
          <div className="max-w-3xl">
            <h2 className="text-3xl font-serif font-bold mb-8">Faculty Profile</h2>
            <Card className="p-8">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative group">
                    <Avatar name={teacherName} size={120} />
                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                      <Edit2 size={24} className="text-white" />
                    </div>
                  </div>
                  <Badge color="gold">Verified Instructor</Badge>
                </div>
                
                <div className="flex-1 space-y-6 w-full">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block px-1">Full Name</label>
                       <input 
                         type="text" 
                         defaultValue={profile?.name || ""} 
                         onBlur={async (e) => {
                            if (!auth.currentUser) return;
                            try {
                              await updateDoc(doc(db, 'users', auth.currentUser.uid), { name: e.target.value });
                            } catch (err) { handleFirestoreError(err, OperationType.UPDATE, 'users'); }
                         }}
                         className="w-full bg-slate-50 border border-black/5 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-fluent-teal outline-none"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block px-1">Primary Subject</label>
                       <select 
                         defaultValue={department} 
                         onChange={async (e) => {
                            if (!auth.currentUser) return;
                            const newSubjects = [e.target.value, ...(profile?.subjects || []).filter((s: string) => s !== e.target.value)];
                            try {
                              await updateDoc(doc(db, 'users', auth.currentUser.uid), { subjects: Array.from(new Set(newSubjects)) });
                            } catch (err) { handleFirestoreError(err, OperationType.UPDATE, 'users'); }
                         }}
                         className="w-full bg-slate-50 border border-black/5 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-fluent-teal outline-none"
                       >
                         {["Mathematics", "Physics", "Chemistry", "Biology", "English", "Science"].map(s => <option key={s} value={s}>{s}</option>)}
                       </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block px-1">Professional Bio</label>
                     <textarea 
                       rows={4}
                       defaultValue={profile?.bio || ""} 
                       placeholder="Tell your students about your instructional methodology and background..."
                       onBlur={async (e) => {
                          if (!auth.currentUser) return;
                          try {
                            await updateDoc(doc(db, 'users', auth.currentUser.uid), { bio: e.target.value });
                          } catch (err) { handleFirestoreError(err, OperationType.UPDATE, 'users'); }
                       }}
                       className="w-full bg-slate-50 border border-black/5 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-fluent-teal outline-none resize-none"
                     />
                  </div>

                  <div className="p-6 bg-fluent-navy/5 border border-fluent-navy/10 rounded-2xl">
                     <div className="flex items-center gap-3 mb-2">
                        <ShieldCheck size={18} className="text-fluent-teal" />
                        <h4 className="text-sm font-bold text-fluent-navy tracking-tight">Institutional Bio Policy</h4>
                     </div>
                     <p className="text-[11px] text-slate-500 leading-relaxed italic">
                        "Bios should reflect the British Scaffolding standard, highlighting global academic mastery and adaptive synthesis techniques."
                     </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ) : activeNav === 'cohorts' ? (
          <div className="space-y-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-8 rounded-[32px] border border-black/5 shadow-sm">
              <div className="flex flex-wrap gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block px-1">Subject Filter</label>
                  <div className="flex gap-2 p-1 bg-gray-50 rounded-xl border border-black/5">
                    {["All", "Mathematics", "Physics", "Chemistry", "Biology", "English"].map(subject => {
                      const isActive = cohortSubjectFilter.includes(subject);
                      return (
                        <button
                          key={subject}
                          onClick={() => toggleSubjectFilter(subject)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            isActive 
                              ? 'bg-fluent-navy text-white shadow-md' 
                              : 'text-slate-400 hover:text-fluent-navy hover:bg-white'
                          }`}
                        >
                          {subject}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block px-1">Grade Level</label>
                  <div className="flex gap-2 p-1 bg-gray-50 rounded-xl border border-black/5">
                    {["All", "Grade 9", "Grade 10", "Grade 11", "Grade 12"].map(grade => (
                      <button
                        key={grade}
                        onClick={() => setCohortGradeFilter(grade)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          cohortGradeFilter === grade 
                            ? 'bg-fluent-navy text-white shadow-md' 
                            : 'text-slate-400 hover:text-fluent-navy hover:bg-white'
                        }`}
                      >
                        {grade}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="text-right">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Impact Score</div>
                  <div className="text-2xl font-serif font-bold text-fluent-navy">
                    {filteredClasses.reduce((sum, c) => sum + (c.students || 0), 0)} <span className="text-xs text-slate-300 font-sans uppercase">Scholars</span>
                  </div>
                </div>
                <div className="w-px h-10 bg-slate-100 hidden md:block" />
                <div className="text-right">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Global Mastery</div>
                  <div className="text-2xl font-serif font-bold text-fluent-teal text-right">
                    {filteredClasses.length > 0 
                      ? Math.round(filteredClasses.reduce((sum, c) => sum + (c.avgScore || 0), 0) / filteredClasses.length) 
                      : 0}%
                  </div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 p-8 relative overflow-hidden">
                <div className="flex justify-between items-center mb-8 relative z-10">
                  <div>
                    <h3 className="text-xl font-serif font-bold">Performance Trajectory</h3>
                    <p className="text-xs text-slate-400 font-medium">Aggregate mastery trend across {cohortSubjectFilter.join(", ")} {cohortGradeFilter !== 'All' ? `(${cohortGradeFilter})` : ''} cohorts</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-fluent-teal"></div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Mastery %</span>
                  </div>
                </div>
                
                <div className="h-[240px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={[
                        { name: 'Jan', value: 65 },
                        { name: 'Feb', value: 68 },
                        { name: 'Mar', value: 75 },
                        { name: 'Apr', value: 72 },
                        { name: 'May', value: 80 },
                        { name: 'Jun', value: 84 },
                      ]}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-fluent-teal)" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="var(--color-fluent-teal)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}}/>
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} domain={[0, 100]}/>
                      <Tooltip contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                      <Area type="monotone" dataKey="value" stroke="var(--color-fluent-teal)" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <div className="grid grid-cols-1 gap-6">
                <MetricTile 
                  label="Avg Attendance" 
                  value={`${filteredClasses.length > 0 ? Math.round(filteredClasses.reduce((sum, c) => sum + (c.attendance || 0), 0) / filteredClasses.length) : 0}%`} 
                  icon={CheckCircle2} 
                  color="#1B4F5E" 
                />
                <MetricTile 
                  label="Cohorts Tracked" 
                  value={filteredClasses.length.toString()} 
                  icon={BookOpen} 
                  color="#C9A84C" 
                />
                <div className="bg-fluent-navy text-white rounded-xl p-6 shadow-lg shadow-fluent-navy/20 flex flex-col justify-center">
                  <div className="text-[10px] font-bold text-fluent-gold uppercase tracking-[0.3em] mb-4">Focus Directive</div>
                  <p className="text-xs text-white/50 leading-relaxed font-medium">
                    Priority given to <span className="text-white font-bold">{!cohortSubjectFilter.includes('All') ? cohortSubjectFilter.join(", ") : 'all subjects'}</span> engagement.
                  </p>
                  <Btn variant="gold" size="sm" className="mt-6 w-full text-[9px] py-1.5">Download Insights Report</Btn>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClasses.map(c => (
              <Card key={c.id} className="p-6 flex flex-col" hover onClick={() => setSelectedClassForStudents(c)}>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-fluent-navy/5 flex items-center justify-center text-fluent-navy">
                    <Users size={20} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); setEditingClass(c); }} className="p-2 text-slate-400 hover:text-fluent-navy transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteClass(c.id); }} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <h3 className="font-serif font-bold text-lg mb-1">{c.name}</h3>
                <div className="flex gap-2 mb-6">
                  <Badge color="navy">{c.grade}</Badge>
                  <Badge color="teal">{c.subject}</Badge>
                </div>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-widest">Enrolled</span>
                    <span className="font-bold">{c.students} Students</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-widest">Avg Mastery</span>
                    <span className="font-bold text-fluent-navy">{c.avgScore}%</span>
                  </div>
                </div>
                <div className="mt-auto pt-6 border-t border-black/5 flex gap-2">
                  <Btn variant="primary" size="sm" className="flex-1" onClick={() => setSelectedClassForStudents(c)}>Manage Students</Btn>
                  <Btn variant="outline" size="sm" className="flex-1">View Stats</Btn>
                </div>
              </Card>
            ))}
            <button 
              onClick={() => setShowCreateModal(true)}
              className="border-2 border-dashed border-black/5 rounded-xl p-8 flex flex-col items-center justify-center gap-4 text-slate-400 hover:border-fluent-navy/20 hover:text-fluent-navy hover:bg-fluent-navy/5 transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-white transition-colors"><Plus size={24} /></div>
              <span className="text-sm font-bold uppercase tracking-widest">Create New Class</span>
            </button>
            </div>
          </div>
        ) : activeNav === "registry" ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-serif font-bold">Student Registry</h2>
                <p className="text-slate-500 mt-2">Manage unassigned students and the institutional pool.</p>
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input placeholder="Global student search..." className="pl-12 pr-4 py-3 bg-white border border-black/5 rounded-xl text-sm focus:ring-1 focus:ring-fluent-teal outline-none w-64" />
                </div>
                <Btn variant="primary" icon={Plus} onClick={() => {
                    const name = prompt("Enter student's full name:");
                    if (!name || !auth.currentUser) return;
                    addDoc(collection(db, 'studentPool'), { name, ownerId: auth.currentUser.uid }).catch(e => handleFirestoreError(e, OperationType.WRITE, 'studentPool'));
                  }}>
                  Register Student
                </Btn>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 p-8">
                <h3 className="text-lg font-serif font-bold mb-6">Available Pool ({unassignedStudents.length})</h3>
                <div className="space-y-3">
                  {unassignedStudents.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 italic">No students currently in the pool.</div>
                  ) : unassignedStudents.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-black/5">
                      <div className="flex items-center gap-4">
                        <Avatar name={s.name} size={40} />
                        <div>
                          <div className="font-bold text-sm tracking-tight">{s.name}</div>
                          <div className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Unassigned Student</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Btn variant="ghost" size="sm" className="text-slate-400" onClick={() => {
                          const newName = prompt("Rename student:", s.name);
                          if (newName) updateDoc(doc(db, 'studentPool', s.id), { name: newName });
                        }}><Edit2 size={16} /></Btn>
                        <Btn variant="ghost" size="sm" className="text-red-400 hover:bg-red-50" onClick={() => {
                          if (confirm("Delete this student from registry?")) deleteDoc(doc(db, 'studentPool', s.id));
                        }}><Trash2 size={16} /></Btn>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="p-8 bg-fluent-navy text-white">
                <h3 className="text-lg font-serif font-bold mb-4">Placement Guidance</h3>
                <p className="text-sm text-white/60 mb-8 font-medium leading-relaxed">Students in the pool are visible to all your classes.</p>
              </Card>
            </div>
          </div>
        ) : activeNav === "curriculum" ? (
          <CurriculumManager />
        ) : activeNav === "assignments" ? (
          <TeacherAssignments />
        ) : activeNav === "analytics" ? (
          <TeacherAnalytics teacherId={auth.currentUser?.uid || "system"} />
        ) : activeNav === "ledger" ? (
          <MasteryLedger userProfile={profile} />
        ) : activeNav === "forum" ? (
          <Forum userProfile={profile} />
        ) : activeNav === "reports" ? (
          <TeacherReports />
        ) : activeNav === "attendance" ? (
          <TeacherAttendance />
        ) : activeNav === "live" ? (
          activeSessionId ? (
            <LiveLab sessionId={activeSessionId} role="teacher" onExit={() => setActiveNav("overview")} userProfile={profile} />
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
               <div className="max-w-2xl">
                  <h2 className="text-3xl font-serif font-bold">Synchronous Delivery Lab</h2>
                  <p className="text-slate-500 mt-2">Initialise elite real-time instruction for your active cohorts.</p>
               </div>
               
               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {classes.map(c => (
                    <Card key={c.id} className="p-8 group shadow-sm hover:shadow-xl transition-all">
                       <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex justify-between items-center">
                          Cohort Ready
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                       </div>
                       <h3 className="text-xl font-serif font-bold mb-2 group-hover:text-fluent-teal transition-colors">{c.name}</h3>
                       <div className="flex gap-2 mb-8">
                          <Badge color="navy">{c.subject}</Badge>
                          <Badge color="gray">{c.grade}</Badge>
                       </div>
                       <Btn variant="primary" className="w-full" icon={Play} onClick={() => handleStartSession(c)}>Initialize Lab</Btn>
                    </Card>
                  ))}
               </div>
            </div>
          )
        ) : activeNav === "settings" ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
              <h2 className="text-3xl font-serif font-bold">Preferences</h2>
              <p className="text-slate-500 mt-2">Customise your faculty profile and specialization area.</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
               <Card className="p-8">
                  <h3 className="text-lg font-serif font-bold mb-6">Subject Specializations</h3>
                  <p className="text-sm text-slate-400 mb-6 font-medium">Select subjects you are certified to deliver. This influences cohort assignment and scholar matching.</p>
                  <div className="flex flex-wrap gap-2">
                     {["Biology", "Physics", "Chemistry", "Mathematics", "English", "History", "Computer Science"].map(subj => {
                        const isSelected = (profile?.subjects || []).includes(subj);
                        return (
                          <button 
                            key={subj}
                            onClick={async () => {
                               if (!auth.currentUser) return;
                               const current = profile?.subjects || [];
                               const updated = isSelected ? current.filter((s: string) => s !== subj) : [...current, subj];
                               try {
                                  await updateDoc(doc(db, 'users', auth.currentUser.uid), { subjects: updated });
                               } catch (e) {
                                  handleFirestoreError(e, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
                                }
                            }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                              isSelected 
                                ? 'bg-fluent-navy text-white border-transparent shadow-lg' 
                                : 'bg-white text-slate-400 border-black/5 hover:border-fluent-navy/20'
                            }`}
                          >
                            {subj}
                          </button>
                        );
                     })}
                  </div>
               </Card>

               <Card className="p-8 bg-gray-50 border-none shadow-none">
                  <h3 className="text-lg font-serif font-bold mb-4">Institutional Verification</h3>
                  <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-black/5 mb-4">
                     <div className="w-10 h-10 rounded-xl bg-fluent-teal/10 flex items-center justify-center text-fluent-teal"><ShieldCheck size={20} /></div>
                     <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Status</div>
                        <div className="text-sm font-bold text-fluent-navy">Verified British Faculty</div>
                     </div>
                  </div>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">Your credentials have been verified against the institutional registry for the 2026 academic year.</p>
               </Card>
            </div>
          </div>
        ) : null}

        {/* Classes List */}
        {activeNav === "cohorts" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map(c => (
                <Card key={c.id} className="p-6 flex flex-col" hover onClick={() => setSelectedClassForStudents(c)}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-fluent-navy/5 flex items-center justify-center text-fluent-navy">
                      <Users size={20} />
                    </div>
                    <div className="flex gap-2">
                       <button onClick={(e) => { e.stopPropagation(); setEditingClass(c); }} className="p-2 text-slate-400 hover:text-fluent-navy">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteClass(c.id); }} className="p-2 text-slate-400 hover:text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-serif font-bold text-lg mb-1">{c.name}</h3>
                  <div className="flex gap-2 mb-6">
                    <Badge color="navy">{c.grade}</Badge>
                    <Badge color="teal">{c.subject}</Badge>
                  </div>
                  <div className="space-y-4 mb-8 text-xs font-bold uppercase tracking-widest text-slate-400">
                    <div className="flex justify-between"><span>Enrolled</span><span className="text-fluent-navy">{c.students} Students</span></div>
                    <div className="flex justify-between"><span>Avg Mastery</span><span className="text-fluent-teal">{c.avgScore}%</span></div>
                  </div>
                  <div className="mt-auto flex gap-2">
                    <Btn variant="primary" size="sm" className="flex-1" onClick={() => setSelectedClassForStudents(c)}>Students</Btn>
                    <Btn variant="outline" size="sm" className="flex-1">Analytics</Btn>
                  </div>
                </Card>
              ))}
              <button 
                onClick={() => setShowCreateModal(true)}
                className="border-2 border-dashed border-black/5 rounded-xl p-8 flex flex-col items-center justify-center gap-4 text-slate-400 hover:border-fluent-navy/20 hover:text-fluent-navy hover:bg-fluent-navy/5 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-white transition-colors"><Plus size={24} /></div>
                <span className="text-sm font-bold uppercase tracking-widest">Create New Class</span>
              </button>
          </div>
        )}

        {/* Student Management / Roster View */}
        {selectedClassForStudents && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-6">
             <div className="absolute inset-0 bg-fluent-navy/60 backdrop-blur-md" onClick={() => setSelectedClassForStudents(null)} />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               className="relative w-full max-w-4xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
             >
                <div className="p-8 border-b border-black/5 flex justify-between items-center bg-gray-50/50">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-fluent-navy flex items-center justify-center text-white">
                         <Users size={24} />
                      </div>
                      <div>
                         <h2 className="text-2xl font-serif font-bold">{selectedClassForStudents.name} Roster</h2>
                         <div className="flex gap-2 mt-1">
                            <Badge color="navy">{selectedClassForStudents.grade}</Badge>
                            <Badge color="teal">{selectedClassForStudents.subject}</Badge>
                         </div>
                      </div>
                   </div>
                   <button onClick={() => setSelectedClassForStudents(null)} className="p-2 text-slate-400 hover:text-black">
                      <X size={24} />
                   </button>
                </div>

                <div className="flex-1 overflow-auto p-8">
                   {/* Performance Summary Header */}
                   <div className="grid md:grid-cols-2 gap-4 mb-8">
                      <Card className="p-6 bg-fluent-teal/5 border-fluent-teal/10">
                         <div className="text-[10px] font-bold text-fluent-teal uppercase tracking-widest mb-1">Class Attendance Rate</div>
                         <div className="text-3xl font-mono font-bold text-fluent-navy">{selectedClassForStudents.attendance || 0}%</div>
                      </Card>
                      <Card className="p-6 bg-fluent-navy text-white relative overflow-hidden">
                         <div className="relative z-10">
                            <div className="text-[10px] font-bold text-fluent-gold uppercase tracking-widest mb-1">Avg Student Mastery</div>
                            <div className="text-3xl font-mono font-bold">{selectedClassForStudents.avgScore || 0}%</div>
                         </div>
                         <Btn variant="outline" size="sm" className="absolute top-6 right-6 text-white border-white/20 hover:bg-white/10">Full Report</Btn>
                      </Card>
                   </div>

                   <div className="flex justify-between items-center mb-6">
                      <div className="relative flex-1 max-w-md">
                         <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                         <input 
                           placeholder="Search roster..." 
                           className="w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl"
                           onChange={(e) => setStudentSearch(e.target.value)}
                         />
                      </div>
                      <div className="flex gap-2">
                        <Btn variant="outline" size="sm" onClick={() => setShowBulkAdd(true)}>Bulk Enrol</Btn>
                        <Btn variant="primary" size="sm" icon={Plus} onClick={() => {
                          const name = prompt("Enter student name:");
                          if (name) handleAddStudent(selectedClassForStudents.id, name);
                        }}>Add Student</Btn>
                      </div>
                   </div>

                   <div className="grid md:grid-cols-2 gap-4">
                      {classStudents
                        .filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase()))
                        .map(s => (
                        <div key={s.id} onClick={() => { setViewingStudentDetail(s); setStudentModalTab('overview'); }} className="p-5 border border-black/5 rounded-2xl hover:border-fluent-teal transition-all flex items-center justify-between group cursor-pointer">
                           <div className="flex items-center gap-4">
                              <Avatar name={s.name} size={44} />
                              <div>
                                 <div className="font-bold text-sm tracking-tight">{s.name}</div>
                                 <div className="text-[10px] text-slate-400 font-bold uppercase">{s.studentId || "UK-SYNT-001"}</div>
                              </div>
                           </div>
                           <div className="text-right">
                              <div className="font-mono font-bold text-sm">{s.total > 0 ? Math.round((s.attended / s.total) * 100) : 0}% Mastery</div>
                              <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Attendance: {s.attended}/{s.total}</div>
                           </div>
                        </div>
                      ))}
                      {classStudents.length === 0 && (
                        <div className="md:col-span-2 text-center py-12 text-slate-400 italic bg-gray-50 rounded-2xl border border-dashed border-black/10">
                           No students enrolled in this cohort.
                        </div>
                      )}
                   </div>
                </div>
             </motion.div>
          </div>
        )}

        {/* Modals (Create/Edit) */}
        {(showCreateModal || editingClass) && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-fluent-navy/40 backdrop-blur-sm" onClick={() => { setShowCreateModal(false); setEditingClass(null); }} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-md bg-white rounded-3xl p-10 shadow-2xl">
              <h2 className="text-2xl font-serif font-bold mb-6">{editingClass ? "Edit Cohort" : "Create New Cohort"}</h2>
              <form onSubmit={editingClass ? handleUpdateClass : handleCreateClass} className="space-y-6">
                <div>
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Cohort Name</label>
                   <input name="name" defaultValue={editingClass?.name} placeholder="e.g. Physics A1" className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-fluent-teal/20" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Grade Level</label>
                    <select name="grade" defaultValue={editingClass?.grade} className="w-full p-4 bg-gray-50 border rounded-2xl outline-none">
                      {["Grade 9", "Grade 10", "Grade 11", "Grade 12"].map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Subject Area</label>
                    <select name="subject" defaultValue={editingClass?.subject} className="w-full p-4 bg-gray-50 border rounded-2xl outline-none">
                      {["Mathematics", "Physics", "Chemistry", "Biology", "English"].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <Btn type="submit" variant="primary" className="w-full py-4 shadow-xl">
                  {editingClass ? "Update Strategy" : "Initialize Cohort"}
                </Btn>
              </form>
            </motion.div>
          </div>
        )}

        {/* Bulk Add Modal */}
        {showBulkAdd && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-6">
             <div className="absolute inset-0 bg-fluent-navy/50 backdrop-blur-sm" onClick={() => setShowBulkAdd(false)} />
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-lg bg-white rounded-3xl p-10 shadow-2xl">
                <h2 className="text-2xl font-serif font-bold mb-2">Bulk Enrolment</h2>
                <p className="text-slate-400 text-sm mb-6">Enter student names line by line to batch register into this cohort.</p>
                <textarea 
                  className="w-full h-64 p-6 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-fluent-teal/10 font-mono text-sm mb-6"
                  placeholder="John Smith&#10;Jane Doe&#10;..."
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                />
                <div className="flex gap-3">
                  <Btn variant="outline" className="flex-1" onClick={() => setShowBulkAdd(false)}>Cancel</Btn>
                  <Btn variant="primary" className="flex-1" onClick={handleBulkAdd}>Add Group</Btn>
                </div>
             </motion.div>
          </div>
        )}

        {/* Detailed Student Profile View */}
        {viewingStudentDetail && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 text-fluent-navy">
              <div className="absolute inset-0 bg-fluent-navy/70 backdrop-blur-md" onClick={() => setViewingStudentDetail(null)} />
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative w-full max-w-2xl bg-white rounded-[48px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
              >
                  <div className="p-10 border-b border-black/5 bg-fluent-navy text-white relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -mr-32 -mt-32" />
                    <button onClick={() => setViewingStudentDetail(null)} className="absolute top-8 right-8 text-white/40 hover:text-white"><X size={24} /></button>
                    
                    <div className="flex items-center gap-6 relative z-10">
                       <Avatar name={viewingStudentDetail.name} size={84} color="#C9A84C" />
                       <div>
                          <div className="flex items-center gap-2 mb-2">
                             <Badge color="gold">Scholar Profile</Badge>
                             <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">• ID: {viewingStudentDetail.studentId || "VERIFIED"}</span>
                          </div>
                          <h2 className="text-4xl font-serif font-bold tracking-tight">{viewingStudentDetail.name}</h2>
                          <p className="text-white/40 text-sm font-medium mt-1">Enrolled: {viewingStudentDetail.enrolledAt ? new Date(viewingStudentDetail.enrolledAt).toLocaleDateString() : "Recent"}</p>
                       </div>
                    </div>

                    <div className="flex gap-8 mt-8 relative z-10">
                       <button 
                         onClick={() => setStudentModalTab('overview')}
                         className={`text-[10px] font-black uppercase tracking-[0.2em] pb-2 transition-all ${studentModalTab === 'overview' ? 'text-fluent-gold border-b-2 border-fluent-gold' : 'text-white/40 hover:text-white'}`}
                       >
                         Overview
                       </button>
                       <button 
                         onClick={() => setStudentModalTab('history')}
                         className={`text-[10px] font-black uppercase tracking-[0.2em] pb-2 transition-all ${studentModalTab === 'history' ? 'text-fluent-gold border-b-2 border-fluent-gold' : 'text-white/40 hover:text-white'}`}
                       >
                         Performance History
                       </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-auto p-10 space-y-10">
                    {studentModalTab === 'overview' ? (
                      <>
                        <section>
                           <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Academic Performance Overview</h3>
                           <div className="grid grid-cols-2 gap-4">
                              <Card className="bg-gray-50 border-black/5 shadow-none">
                                 <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Average Mastery</div>
                                 <div className="text-3xl font-mono font-bold text-fluent-navy">{viewingStudentDetail.total > 0 ? Math.round((viewingStudentDetail.attended/viewingStudentDetail.total)*100) : 0}%</div>
                                 <ProgressBar value={viewingStudentDetail.total > 0 ? Math.round((viewingStudentDetail.attended/viewingStudentDetail.total)*100) : 0} showPct={false} />
                              </Card>
                              <Card className="bg-gray-50 border-black/5 shadow-none">
                                 <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Attendance Rate</div>
                                 <div className="text-3xl font-mono font-bold text-fluent-teal">{viewingStudentDetail.total > 0 ? Math.round((viewingStudentDetail.attended/viewingStudentDetail.total)*100) : 100}%</div>
                                 <div className="text-[10px] text-slate-400 font-bold uppercase mt-2">{viewingStudentDetail.attended} / {viewingStudentDetail.total} Sessions</div>
                              </Card>
                           </div>
                        </section>

                        <section>
                           <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Contact Intelligence</h3>
                           <div className="space-y-4">
                              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-black/5">
                                 <div className="w-10 h-10 rounded-xl bg-white border border-black/5 flex items-center justify-center text-slate-400"><Mail size={18} /></div>
                                 <div className="flex-1">
                                    <div className="text-[9px] font-bold text-slate-400 uppercase">Guardian Contact</div>
                                    <input className="w-full bg-transparent font-bold text-sm text-fluent-navy outline-none" defaultValue={viewingStudentDetail.email || "notset@student.com"} />
                                 </div>
                              </div>
                           </div>
                         </section>
                         <section>
                           <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Faculty Assessment</h3>
                           <div className="space-y-4">
                              <div className="flex flex-col gap-4">
                                 <div className="flex flex-col sm:flex-row gap-4 items-start">
                                   <div className="w-full sm:w-64">
                                     <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 block px-1">Evaluation Category</label>
                                     <select 
                                       value={feedbackCategory}
                                       onChange={(e) => setFeedbackCategory(e.target.value)}
                                       className="w-full p-3 bg-gray-50 border border-black/5 rounded-xl text-xs font-bold text-fluent-navy outline-none focus:ring-2 focus:ring-fluent-teal/10 transition-all"
                                     >
                                       <option value="Academic Improvement">Academic Improvement</option>
                                       <option value="Behavioral Analysis">Behavioral Analysis</option>
                                       <option value="Engagement Level">Engagement Level</option>
                                       <option value="Technical Synthesis">Technical Synthesis</option>
                                       <option value="Executive Function">Executive Function</option>
                                     </select>
                                   </div>
                                 </div>
                                 
                                 <div className="space-y-2">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 block px-1">Private Observations</label>
                                    <textarea 
                                      placeholder="Log faculty observations, scaffolding needs, or diagnostic notes..."
                                      className="w-full p-4 bg-gray-50 border border-black/5 rounded-2xl text-sm min-h-[120px] outline-none focus:bg-white focus:ring-4 focus:ring-fluent-teal/5 focus:border-fluent-teal/20 transition-all"
                                      value={feedbackText}
                                      onChange={(e) => setFeedbackText(e.target.value)}
                                    />
                                 </div>
                                 
                                 <div className="flex justify-end">
                                    <Btn 
                                      variant="primary" 
                                      size="sm" 
                                      disabled={isSubmittingFeedback || !feedbackText.trim()}
                                      onClick={async () => {
                                        if (!feedbackText.trim() || isSubmittingFeedback) return;
                                        
                                        setIsSubmittingFeedback(true);
                                        try {
                                          // 1. Log to global progress collection for cross-node tracking
                                          await addDoc(collection(db, 'progress'), {
                                            studentId: viewingStudentDetail.id,
                                            studentName: viewingStudentDetail.name,
                                            teacherId: auth.currentUser?.uid,
                                            teacherName: teacherName,
                                            topic: feedbackCategory,
                                            feedback: feedbackText.trim(),
                                            marks: 0,
                                            category: "Faculty Feedback",
                                            createdAt: serverTimestamp()
                                          });

                                          // 2. Generate Critical Alert if assessment marks are included (placeholder check)
                                          // Note: In this view we are logging 'feedback', if we want to log 'marks' we'd use a different flow, 
                                          // but let's add a generic behavioral alert trigger here for certain phrases.
                                          if (feedbackText.toLowerCase().includes("at risk") || feedbackText.toLowerCase().includes("urgent")) {
                                            await addDoc(collection(db, "alerts"), {
                                              type: "FACULTY_NOTE",
                                              level: "critical",
                                              message: `Urgent Faculty Note for ${viewingStudentDetail.name}: ${feedbackText.substring(0, 50)}...`,
                                              studentId: viewingStudentDetail.id,
                                              schoolId: profile?.schoolId || "",
                                              status: "active",
                                              date: serverTimestamp()
                                            });
                                          }
  
                                          // 2. Update the specific student document in the class subcollection if possible
                                          if (selectedClassForStudents?.id) {
                                            const studentRef = doc(db, 'cohorts', selectedClassForStudents.id, 'students', viewingStudentDetail.id);
                                            const newFeedback = {
                                              id: Date.now().toString(),
                                              text: feedbackText.trim(),
                                              category: feedbackCategory,
                                              date: new Date().toISOString(),
                                              authorName: teacherName
                                            };
                                            const existing = viewingStudentDetail.privateFeedback || [];
                                            await updateDoc(studentRef, { privateFeedback: [newFeedback, ...existing] });
                                          }
                                          
                                          setFeedbackText("");
                                          alert("Faculty assessment synchronised successfully.");
                                        } catch (e) {
                                           handleFirestoreError(e, OperationType.WRITE, `progress`);
                                        } finally {
                                          setIsSubmittingFeedback(false);
                                        }
                                     }}>
                                      {isSubmittingFeedback ? "Synchronising..." : "Log Assessment"}
                                     </Btn>
                                 </div>
                              </div>
                           </div>
                        </section>
                      </>
                    ) : (
                      <section className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Performance & Feedback History</h3>
                        <div className="space-y-6">
                           {studentHistory.length === 0 && (viewingStudentDetail.privateFeedback || []).length === 0 ? (
                             <div className="p-20 text-center border-2 border-dashed border-black/5 rounded-[32px]">
                                <div className="text-slate-300 mb-2"><ClipboardList size={40} className="mx-auto opacity-20" /></div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No historical logs found</p>
                             </div>
                           ) : (
                             <div className="space-y-4">
                                {[
                                  ...studentHistory.map(h => ({ 
                                    ...h, 
                                    type: h.marks > 0 ? 'report' : 'feedback',
                                    sortDate: h.createdAt?.toDate ? h.createdAt.toDate() : new Date(h.createdAt || 0) 
                                  })),
                                  ...(viewingStudentDetail.privateFeedback || []).map((f: any) => ({ 
                                    ...f, 
                                    type: 'feedback', 
                                    sortDate: new Date(f.date || 0) 
                                  }))
                                ]
                                .filter((v, i, a) => a.findIndex(t => (t.id === v.id || t.text === v.text)) === i) // Deduplicate
                                .sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime())
                                .map((item, idx) => (
                                  <div key={idx} className="p-6 bg-slate-50 rounded-2xl border border-black/5 transition-all hover:bg-white hover:shadow-lg group">
                                     <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                           <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.type === 'report' ? 'bg-fluent-teal/10 text-fluent-teal' : 'bg-fluent-gold/10 text-fluent-gold'}`}>
                                              {item.type === 'report' ? <TrendingUp size={14} /> : <ClipboardList size={14} />}
                                           </div>
                                           <div>
                                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.type === 'report' ? 'Assessment Report' : 'Faculty Feedback'}</div>
                                              <div className="text-xs font-bold text-fluent-navy mt-0.5">{item.topic || item.category || "General Synthesis"}</div>
                                           </div>
                                        </div>
                                        <div className="text-[10px] font-bold text-slate-300">
                                           {item.sortDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </div>
                                     </div>
                                     <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                        {item.feedback || item.text}
                                     </p>
                                     {item.marks !== undefined && item.marks > 0 && (
                                       <div className="mt-4 flex items-center gap-4 pt-4 border-t border-black/5">
                                          <div className="flex-1 h-1 bg-black/5 rounded-full overflow-hidden">
                                             <div className="h-full bg-fluent-teal" style={{ width: `${item.marks}%` }} />
                                          </div>
                                          <div className="text-xs font-bold text-fluent-teal">{item.marks}% Score</div>
                                       </div>
                                     )}
                                  </div>
                                ))}
                             </div>
                           )}
                        </div>
                      </section>
                    )}
                  </div>
                 
                 <div className="p-8 bg-gray-50 border-t border-black/5 flex gap-3">
                    <Btn variant="primary" className="flex-1" onClick={() => setViewingStudentDetail(null)}>Close Profile</Btn>
                 </div>
              </motion.div>
           </div>
        )}
      </div>
    </DashboardShell>
  );
};
