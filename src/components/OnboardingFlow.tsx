import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Sparkles, GraduationCap, Users, BookOpen, X, Calendar, ArrowRight, ShieldCheck, Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth } from '../lib/firebaseInit';
import { collection, addDoc, serverTimestamp, doc, setDoc, onSnapshot, query, where, getDocs } from 'firebase/firestore';
import { Logo, Btn, Card } from './UI';

import { initiatePayment } from '../lib/paymentService';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';

export const OnboardingFlow = ({ onComplete, onBack }: { onComplete: (view: string, profile: any) => void, onBack: () => void }) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ 
    role: "", 
    name: "", 
    email: auth.currentUser?.email || "",
    studentCount: 0,
    school: "", 
    grade: "", 
    subjects: [] as string[], 
    goal: "", 
    learningGoals: [] as string[], 
    preferredStudyMethods: [] as string[], 
    learningStyles: [] as string[], 
    studyTime: "",
    preferences: [] as string[], 
    isPaid: false,
    schoolId: "",
    linkCode: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [schools, setSchools] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'schools'), (snap) => {
      setSchools(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const checkPreProvisioned = async () => {
      if (!auth.currentUser?.email) return;
      try {
        const q = query(collection(db, 'users'), where('email', '==', auth.currentUser.email));
        const snap = await getDocs(q);
        if (!snap.empty) {
          // If multiple, just take first
          const preData = snap.docs[0].data();
          setData(d => ({ ...d, ...preData }));
          // If they are a school admin, they might want to skip role selection
          if (preData.role) {
             setStep(1); // Move to name entry
          }
        }
      } catch (e) {
        console.error("Error checking pre-provisioned data", e);
      }
    };
    checkPreProvisioned();
  }, []);

  const handleBack = () => {
    if (step === 0) {
      onBack();
    } else {
      setStep(s => s - 1);
    }
  };

  const getSteps = () => {
    const baseSteps = [
      { title: "Academic Role", subtitle: "Experience tailored to your perspective." },
      { title: "Verification", subtitle: "Establishing your institutional footprint." },
    ];
    
    if (data.role === "teacher") {
      return [
        ...baseSteps,
        { title: "Department Focus", subtitle: "British school subject standards." },
        { title: "Training Goal", subtitle: "Primary instructional focus." },
        { title: "Synthesis Complete", subtitle: "Ready." },
      ];
    }

    if (data.role === "parent") {
      return [
        ...baseSteps,
        { title: "Student Connection", subtitle: "Legal names of students." },
        { title: "Monitoring Goal", subtitle: "Primary milestones." },
        { title: "Institutional Levy", subtitle: "Secure your child's cohort seat." },
        { title: "Synthesis Complete", subtitle: "Ready." },
      ];
    }

    if (data.role === "school_admin") {
      return [
        ...baseSteps,
        { title: "Node Selection", subtitle: "Connecting to your academic institution." },
        { title: "Synthesis Complete", subtitle: "Ready." },
      ];
    }

    if (data.role === "admin") {
      return [
        ...baseSteps,
        { title: "Strategic Parameters", subtitle: "Configuring global system nodes." },
        { title: "Synthesis Complete", subtitle: "Ready." },
      ];
    }

    return [
      ...baseSteps,
      { title: "Mastery Focus", subtitle: "Core subjects and technical focus." },
      { title: "Learning Goals", subtitle: "Specific areas for improvement." },
      { title: "Study Methods", subtitle: "How do you prefer to learn?" },
      { title: "Academic Goal", subtitle: "What success looks like for 2026-27." },
      { title: "Institutional Levy", subtitle: "Secure your technical academic seat." },
      { title: "Synthesis Complete", subtitle: "Elite journey begins." },
    ];
  };

  const handlePayment = () => {
    initiatePayment({
      amount: 3999,
      currency: "INR",
      name: data.name,
      description: "Synthesis Mastery Subscription",
      email: auth.currentUser?.email || "",
      phone: "",
      onSuccess: (res) => {
        update("isPaid", true);
        setStep(s => s + 1);
      },
      onFailure: (err) => {
        alert("Payment verification failed. Please try again.");
      }
    });
  };

  const steps = getSteps();
  const roles = [
    { id: "student", label: "Elite Student", icon: GraduationCap, desc: "Mastery tracking and live sessions." },
    { id: "parent", label: "Academic Parent", icon: Users, desc: "Monitor child and book consultations." },
    { id: "teacher", label: "Expert Faculty", icon: BookOpen, desc: "Cohorts and curriculum tools." },
    { id: "school_admin", label: "Institutional Admin", icon: Building2, desc: "Manage school nodes and students." },
    ...(auth.currentUser?.email === 'drbiryanihelp@gmail.com' || auth.currentUser?.email === 'gnaneshwer.jadav@gmail.com' || auth.currentUser?.email === 'mindmeshaisolutions@gmail.com' ? [
       { id: "admin", label: "Academy Provost", icon: ShieldCheck, desc: "Global system oversight and nodes." }
    ] : [])
  ];

  const grades = ["Grade 9", "Grade 10", "Grade 11", "Grade 12"];
  const subjectsList = ["Mathematics", "Physics", "Chemistry", "Biology", "English"];
  const learningGoalsList = ["Conceptual Clarity", "Problem Solving", "Exam Strategy", "Time Management", "Deep Work"];
  const studyMethodsList = ["Active Recall", "Visual Synthesis", "Deep Focus Intervals", "Peer Mentorship", "Conceptual Mapping"];
  
  const goals = data.role === "teacher" 
    ? ["Advanced Delivery", "Exam Prep", "Confidence Building"]
    : data.role === "parent"
    ? ["Academic Support", "Monitoring Stability", "Ivy League Prep"]
    : ["Board Exam Elite (95%+)", "Ivy League Prep", "STEM Mastery", "Custom Goal"];

  const update = (key: string, val: any) => {
    setData(d => ({ ...d, [key]: val }));
    if (errors[key]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const toggleSelection = (listKey: string, val: string) => {
    const list = (data as any)[listKey] as string[];
    update(listKey, list.includes(val) ? list.filter(x => x !== val) : [...list, val]);
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!data.name || data.name.trim().length < 2) {
        newErrors.name = "Name must be at least 2 characters.";
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!data.email || !emailRegex.test(data.email)) {
        newErrors.email = "Please enter a valid institutional email.";
      }

      if (['teacher', 'school_admin'].includes(data.role)) {
        if (!data.studentCount || data.studentCount <= 0) {
          newErrors.studentCount = "Student count must be a positive number.";
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(s => s + 1);
    }
  };

  const handleComplete = async () => {
    if (!auth.currentUser) return;
    setIsLoading(true);
    let finalData = { ...data };
    
    // Auto-link school if code matches
    if (data.linkCode) {
      const matchedSchool = schools.find(s => s.id === data.linkCode);
      if (matchedSchool) {
        finalData.schoolId = matchedSchool.id;
        finalData.school = matchedSchool.name;
      }
    }

    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        ...finalData,
        createdAt: serverTimestamp()
      }, { merge: true });
      onComplete(finalData.role + "-dashboard", finalData);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 0) return !!data.role;
    if (step === 1) {
      const basic = data.name.trim().length >= 2 && data.email.includes('@');
      if (['teacher', 'school_admin'].includes(data.role)) {
        return basic && data.studentCount > 0;
      }
      return basic;
    }
    if (step === 2) {
      if (data.role === 'school_admin') return !!data.schoolId;
      if (data.role === 'admin') return true; // Just strategic parameters
      return data.subjects.length > 0;
    }
    if (step === 3) {
      if (data.role === 'student') return data.learningGoals.length > 0;
      return !!data.goal;
    }
    if (step === 4 && data.role === 'student') return data.preferredStudyMethods.length > 0;
    if (step === 5 && data.role === 'student') return !!data.goal;
    return true;
  };

  return (
    <div className="min-h-screen bg-fluent-cream flex">
      <div className="w-72 md:w-80 bg-fluent-navy p-8 flex flex-col hidden md:flex relative overflow-hidden">
        {/* Dynamic Glow background */}
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-fluent-teal/20 blur-[100px] rounded-full -translate-y-1/2 -translate-x-1/2" />
        
        <Logo variant="light" className="mb-12 relative z-10" />
        <div className="flex-1 space-y-8 relative z-10">
          {steps.map((s, i) => (
            <div key={i} className={`flex gap-5 items-start transition-all duration-500 ${i <= step ? "opacity-100" : "opacity-20"}`}>
              <div 
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-bold border transition-all duration-300 ${
                  i < step 
                    ? "bg-fluent-gold text-fluent-navy border-fluent-gold shadow-[0_0_10px_rgba(201,168,76,0.3)]" 
                    : i === step 
                      ? "bg-white/10 text-white border-white/20 shadow-lg" 
                      : "bg-transparent text-white border-white/5"
                }`}
              >
                {i < step ? <CheckCircle2 size={14} /> : i + 1}
              </div>
              <div className="pt-1">
                <div className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors duration-300 ${i === step ? "text-fluent-gold" : "text-white/40"}`}>{s.title}</div>
                <div className="text-[8px] text-white/30 font-medium mt-0.5 leading-tight">{s.subtitle}</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="relative z-10 pt-10 border-t border-white/5">
           <div className="text-[9px] font-mono text-white/20 uppercase tracking-widest whitespace-nowrap">Institutional Synthesis Protocol v4.2</div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-8 overflow-auto relative">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{ backgroundImage: `radial-gradient(circle at 1px 1px, #1B4F5E 1px, transparent 0)`, backgroundSize: '40px 40px' }} 
        />
        
        <div className="max-w-xl w-full relative z-10">
          <AnimatePresence mode="wait">
            <motion.div 
              key={step} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: "circOut" }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                 <div className="w-1 h-1 rounded-full bg-fluent-teal" />
                 <span className="text-[9px] font-black text-fluent-teal uppercase tracking-[0.4em]">Step {step + 1} of {steps.length}</span>
              </div>
              <h2 className="text-3xl font-serif font-bold mb-6 tracking-tight text-fluent-navy italic">{steps[step].title}</h2>
              
              <div className="min-h-[220px]">
                {step === 0 && (
                  <div className="grid gap-3">
                    {roles.map(r => (
                      <div 
                        key={r.id} 
                        onClick={() => update("role", r.id)} 
                        className={`group p-6 rounded-2xl border-2 cursor-pointer flex items-center gap-5 transition-all duration-300 ${
                          data.role === r.id 
                            ? "border-fluent-teal bg-fluent-teal/5 shadow-lg shadow-fluent-teal/5 ring-1 ring-fluent-teal/5" 
                            : "border-black/5 bg-white hover:border-black/10 hover:shadow-md"
                        }`}
                      >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                          data.role === r.id ? "bg-fluent-teal text-white shadow-lg shadow-fluent-teal/10" : "bg-gray-50 text-slate-400"
                        }`}>
                          <r.icon size={24} />
                        </div>
                        <div>
                          <div className="font-bold text-lg text-fluent-navy tracking-tight">{r.label}</div>
                          <div className="text-xs text-slate-500 font-medium mt-0.5">{r.desc}</div>
                        </div>
                        <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          data.role === r.id ? "border-fluent-teal bg-fluent-teal" : "border-black/5"
                        }`}>
                          {data.role === r.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                 {step === 1 && (
                  <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
                    <div className="space-y-1.5">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Institutional Name</label>
                       <input 
                         value={data.name} 
                         onChange={e => update("name", e.target.value)} 
                         placeholder="Legal Full Name..." 
                         className={`w-full p-5 bg-white border rounded-xl text-base font-bold tracking-tight outline-none transition-all placeholder:text-slate-300 ${
                           errors.name ? 'border-red-500 ring-1 ring-red-100' : 'border-black/5 focus:ring-1 focus:ring-fluent-teal'
                         }`}
                       />
                       {errors.name && <p className="text-[9px] text-red-500 font-bold ml-1">{errors.name}</p>}
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Institutional Email</label>
                       <input 
                         value={data.email} 
                         onChange={e => update("email", e.target.value)}
                         placeholder="email@institution.ac.uk"
                         className={`w-full p-5 bg-white border rounded-xl text-base font-bold tracking-tight outline-none transition-all placeholder:text-slate-300 ${
                           errors.email ? 'border-red-500 ring-1 ring-red-100' : 'border-black/5 focus:ring-1 focus:ring-fluent-teal'
                         }`}
                       />
                       {errors.email && <p className="text-[9px] text-red-500 font-bold ml-1">{errors.email}</p>}
                    </div>

                    {['teacher', 'school_admin'].includes(data.role) && (
                      <div className="space-y-1.5">
                         <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Managed Student Capacity</label>
                         <input 
                           type="number"
                           value={data.studentCount || ""} 
                           onChange={e => update("studentCount", parseInt(e.target.value) || 0)}
                           placeholder="Expected cohort size..." 
                           className={`w-full p-5 bg-white border rounded-xl text-base font-bold tracking-tight outline-none transition-all placeholder:text-slate-300 ${
                             errors.studentCount ? 'border-red-500 ring-1 ring-red-100' : 'border-black/5 focus:ring-1 focus:ring-fluent-teal'
                           }`}
                         />
                         {errors.studentCount && <p className="text-[9px] text-red-500 font-bold ml-1">{errors.studentCount}</p>}
                      </div>
                    )}
                    {data.role === 'student' && (
                      <div className="space-y-3">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Institutional Link Code (Optional)</label>
                        <input 
                          value={data.linkCode} 
                          onChange={e => update("linkCode", e.target.value)} 
                          placeholder="Node ID or School Code..." 
                          className="w-full p-5 bg-white border border-black/5 rounded-xl text-base font-bold tracking-tight focus:ring-1 focus:ring-fluent-teal outline-none transition-all placeholder:text-slate-300" 
                        />
                      </div>
                    )}
                    {data.role === 'student' && (
                      <div className="space-y-3">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Academic Level</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                           {grades.map(g => (
                             <button 
                               key={g} 
                               onClick={() => update("grade", g)}
                               className={`py-3.5 rounded-lg text-[10px] font-black transition-all border ${
                                 data.grade === g 
                                   ? "bg-fluent-navy text-white border-transparent shadow-lg shadow-fluent-navy/10" 
                                   : "bg-white text-slate-400 border-black/5 hover:border-black/20"
                               }`}
                             >
                               {g}
                             </button>
                           ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="space-y-3">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">
                          {data.role === 'teacher' 
                            ? 'Departmental Specialisation' 
                            : data.role === 'parent'
                              ? 'Audit Focus (Student Subjects)'
                              : data.role === 'school_admin'
                                ? 'Assigned Institutional Node'
                                : 'Mastery Focus (Subjects)'}
                       </label>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {data.role === 'school_admin' ? (
                            schools.map(s => (
                              <button 
                                key={s.id} 
                                onClick={() => update("schoolId", s.id)}
                                className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all ${
                                  data.schoolId === s.id 
                                    ? "border-fluent-teal bg-fluent-teal/5 text-fluent-navy" 
                                    : "border-black/5 bg-white text-slate-400"
                                }`}
                              >
                                 <span className="font-bold text-xs tracking-tight">{s.name}</span>
                                 {data.schoolId === s.id && <CheckCircle2 size={16} className="text-fluent-teal" />}
                              </button>
                            ))
                          ) : (
                            subjectsList.map(s => (
                              <button 
                                key={s} 
                                onClick={() => toggleSelection("subjects", s)}
                                className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all ${
                                  data.subjects.includes(s) 
                                    ? "border-fluent-teal bg-fluent-teal/5 text-fluent-navy" 
                                    : "border-black/5 bg-white text-slate-400"
                                }`}
                              >
                                 <span className="font-bold text-xs tracking-tight">{s}</span>
                                 {data.subjects.includes(s) && <CheckCircle2 size={16} className="text-fluent-teal" />}
                              </button>
                            ))
                          )}
                       </div>
                       {data.role === 'school_admin' && schools.length === 0 && (
                         <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-black/10">
                            <p className="text-xs text-slate-400 font-medium">No schools detected. Please contact the Academy Provost for account provisioning.</p>
                         </div>
                       )}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                          {data.role === 'teacher' 
                            ? 'Primary Instructional Goal' 
                            : data.role === 'parent'
                              ? 'Audit & Monitoring Priority'
                              : 'Specific Areas for Improvement'}
                       </label>
                       <div className="grid gap-3">
                          {data.role === 'student' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {learningGoalsList.map(g => (
                                <button 
                                  key={g} 
                                  onClick={() => toggleSelection("learningGoals", g)}
                                  className={`p-6 rounded-2xl border-2 flex items-center justify-between transition-all ${
                                    data.learningGoals.includes(g) 
                                      ? "border-fluent-teal bg-fluent-teal/5 text-fluent-navy" 
                                      : "border-black/5 bg-white text-slate-400"
                                  }`}
                                >
                                   <span className="font-bold text-sm tracking-tight">{g}</span>
                                   {data.learningGoals.includes(g) && <CheckCircle2 size={18} className="text-fluent-teal" />}
                                </button>
                              ))}
                            </div>
                          ) : (
                            goals.map(g => (
                              <button 
                                key={g} 
                                onClick={() => update("goal", g)}
                                className={`p-6 rounded-2xl border-2 flex items-center justify-between transition-all ${
                                  data.goal === g 
                                    ? "border-fluent-teal bg-fluent-teal/5 text-fluent-navy" 
                                    : "border-black/5 bg-white text-slate-400"
                                }`}
                              >
                                 <span className="font-bold text-sm tracking-tight">{g}</span>
                                 <div className={`w-5 h-5 rounded-full border-2 ${data.goal === g ? "bg-fluent-teal border-fluent-teal" : "border-black/5"}`} />
                              </button>
                            ))
                          )}
                       </div>
                    </div>
                  </div>
                )}

                {step === 4 && data.role === 'student' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Study Method Preferences</label>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {studyMethodsList.map(m => (
                            <button 
                              key={m} 
                              onClick={() => toggleSelection("preferredStudyMethods", m)}
                              className={`p-6 rounded-2xl border-2 flex items-center justify-between transition-all ${
                                data.preferredStudyMethods.includes(m) 
                                  ? "border-fluent-teal bg-fluent-teal/5 text-fluent-navy" 
                                  : "border-black/5 bg-white text-slate-400"
                              }`}
                            >
                               <span className="font-bold text-sm tracking-tight">{m}</span>
                               {data.preferredStudyMethods.includes(m) && <CheckCircle2 size={18} className="text-fluent-teal" />}
                            </button>
                          ))}
                       </div>
                    </div>
                  </div>
                )}

                {step === 5 && data.role === 'student' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">What is your primary academic goal for this year?</label>
                       <div className="grid gap-3">
                          {goals.map(g => (
                            <button 
                              key={g} 
                              onClick={() => update("goal", g)}
                              className={`p-6 rounded-2xl border-2 flex items-center justify-between transition-all ${
                                data.goal === g || (g === "Custom Goal" && !["Board Exam Elite (95%+)", "Ivy League Prep", "STEM Mastery"].includes(data.goal) && data.goal !== "")
                                  ? "border-fluent-teal bg-fluent-teal/5 text-fluent-navy" 
                                  : "border-black/5 bg-white text-slate-400"
                              }`}
                            >
                               <span className="font-bold text-sm tracking-tight">{g}</span>
                               <div className={`w-5 h-5 rounded-full border-2 ${
                                 (data.goal === g || (g === "Custom Goal" && !["Board Exam Elite (95%+)", "Ivy League Prep", "STEM Mastery"].includes(data.goal) && data.goal !== "")) 
                                   ? "bg-fluent-teal border-fluent-teal" 
                                   : "border-black/5"
                               }`} />
                            </button>
                          ))}
                       </div>
                       
                       {(data.goal === "Custom Goal" || (!["Board Exam Elite (95%+)", "Ivy League Prep", "STEM Mastery", ""].includes(data.goal))) && (
                         <div className="animate-in fade-in slide-in-from-top-2">
                           <input 
                             autoFocus
                             placeholder="Type your custom goal here..."
                             className="w-full p-6 bg-white border border-fluent-teal/30 rounded-2xl text-lg font-bold tracking-tight outline-none shadow-lg shadow-fluent-teal/5"
                             onChange={(e) => update("goal", e.target.value)}
                             value={["Board Exam Elite (95%+)", "Ivy League Prep", "STEM Mastery", "Custom Goal"].includes(data.goal) ? "" : data.goal}
                           />
                         </div>
                       )}
                    </div>
                  </div>
                )}
                
                {(((data.role === 'student' && step > 5) || (['teacher', 'parent'].includes(data.role) && step > 3) || (['school_admin', 'admin'].includes(data.role) && step > 1))) && step < steps.length - 1 && steps[step].title !== "Institutional Levy" && (
                   <div className="p-12 text-center border-2 border-dashed border-black/5 rounded-3xl opacity-60">
                      <div className="text-sm font-bold text-slate-400 tracking-widest uppercase">Protocol Configuration Step {step + 1}</div>
                      <p className="text-xs text-slate-400 mt-2 italic font-medium">Finalising institutional parameters for your {data.role} profile.</p>
                      <Btn variant="primary" className="mt-8 px-12" onClick={() => setStep(s => s + 1)}>Complete Step</Btn>
                   </div>
                )}

                {step === steps.length - 1 && (
                  <div className="text-center py-6">
                    <div className="w-20 h-20 bg-fluent-teal/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                       <Sparkles size={40} className="text-fluent-teal" />
                       <div className="absolute inset-0 rounded-full border border-fluent-teal/20 animate-ping" />
                    </div>
                    <h3 className="text-2xl font-serif font-bold italic text-fluent-navy mb-3">Environment Ready</h3>
                    <p className="text-xs text-slate-500 font-medium mb-8 max-w-xs mx-auto">Your institutional profile has been synthesised. Welcome to British Standard delivery.</p>
                    <Btn variant="primary" className="w-full py-5 text-[10px] font-black tracking-[0.2em]" onClick={handleComplete}>{isLoading ? "SYNTHESISING..." : "ENTER COMMAND CENTER"}</Btn>
                  </div>
                )}

                {steps[step].title === "Institutional Levy" && (
                  <div className="text-center py-10">
                    <div className="w-24 h-24 bg-fluent-navy/5 rounded-2xl flex items-center justify-center mx-auto mb-8">
                       <ShieldCheck size={48} className="text-fluent-navy" />
                    </div>
                    <h3 className="text-3xl font-serif font-bold text-fluent-navy mb-4">Strategic Commitment</h3>
                    <p className="text-sm text-slate-500 font-medium mb-10 max-w-sm mx-auto">To maintain institutional standards and faculty ratios, we require a commitment to the Synthesis standard.</p>
                    
                    <Card className="p-8 border-fluent-teal border-2 ring-8 ring-fluent-teal/5 mb-10 text-left">
                       <div className="flex justify-between items-center mb-6">
                          <span className="text-[10px] font-black uppercase tracking-widest text-fluent-teal">Standard Synthesis</span>
                          <span className="text-2xl font-serif font-bold text-fluent-navy">₹3,999<span className="text-xs font-sans text-slate-400">/mo</span></span>
                       </div>
                       <ul className="space-y-3">
                          {["Full Subject Access", "Expert British Faculty", "Weekly Momentum Reports"].map(f => (
                            <li key={f} className="flex items-center gap-2 text-xs font-medium text-slate-500">
                               <CheckCircle2 size={14} className="text-fluent-teal" /> {f}
                            </li>
                          ))}
                       </ul>
                    </Card>

                    <Btn variant="primary" className="w-full py-6 text-sm font-black tracking-[0.2em] shadow-2xl shadow-fluent-navy/20" onClick={handlePayment}>
                       INITIATE PAYMENT ✦
                    </Btn>
                  </div>
                )}
              </div>

              {step < steps.length - 1 && steps[step].title !== "Institutional Levy" && (
                <div className="flex justify-between mt-20 pt-8 border-t border-black/5">
                   <Btn variant="ghost" className="text-slate-400 font-black tracking-widest text-[10px] uppercase" onClick={handleBack}>Back</Btn>
                   <Btn variant="primary" className="px-12 py-4 shadow-xl shadow-fluent-teal/10" onClick={nextStep} disabled={!canProceed()}>Continue</Btn>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
