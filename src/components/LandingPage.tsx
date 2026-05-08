import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Sparkles, Target, Zap, ShieldCheck, Award, Users, BookOpen, GraduationCap, UserCheck, LayoutDashboard, Settings, X } from 'lucide-react';
import { Logo, Btn, Badge, Card } from './UI';
import { db, auth } from '../lib/firebaseInit';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';

import { notifyNewLead } from '../lib/communicationService';

const googleProvider = new GoogleAuthProvider();

export const LandingPage = () => {
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const [leadData, setLeadData] = useState({
    schoolName: "",
    contactPerson: "",
    designation: "Principal / Admin",
    phone: "",
    email: "",
    studentCount: "",
    classes: "6-12"
  });
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingLead(true);
    try {
      await addDoc(collection(db, 'schoolLeads'), {
        ...leadData,
        status: 'pending',
        requestedAt: serverTimestamp()
      });
      setShowLeadModal(false);
      setWaitlistSuccess(true);
      notifyNewLead(leadData.email);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'schoolLeads');
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail) return;
    try {
      await addDoc(collection(db, 'waitlist'), {
        email: waitlistEmail,
        requestedAt: serverTimestamp()
      });
      setWaitlistSuccess(true);
      notifyNewLead(waitlistEmail);
      setWaitlistEmail("");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'waitlist');
    }
  };

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code !== 'auth/cancelled-popup-request' && error.code !== 'auth/popup-closed-by-user') {
        console.error("Login failed", error);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-fluent-cream selection:bg-fluent-gold/30 font-sans relative overflow-x-hidden">
      {/* Premium Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03] select-none" style={{ backgroundImage: 'radial-gradient(#0D1B2A 0.5px, transparent 0.5px)', backgroundSize: '32px 32px' }} />

      <nav className={`fixed top-0 w-full z-[100] transition-all duration-700 ${scrolled ? 'bg-white/80 backdrop-blur-2xl border-b border-black/5 py-3' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-8 md:px-12 flex justify-between items-center text-fluent-navy">
          <Logo onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
          
          <div className="hidden lg:flex gap-10 items-center">
            {["Benefits", "Programs", "Methodology", "Investment"].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-[9px] font-black uppercase tracking-[0.4em] text-fluent-navy/50 hover:text-fluent-navy transition-all duration-500 hover:tracking-[0.5em]">{item}</a>
            ))}
            <div className="h-4 w-px bg-black/10 mx-2" />
            <Btn variant="primary" size="sm" className="shadow-2xl shadow-fluent-navy/10 px-8 rounded-full bg-fluent-navy hover:bg-fluent-teal text-[9px] font-black uppercase tracking-[0.2em]" onClick={handleLogin} disabled={isLoggingIn}>
              {isLoggingIn ? "Authenticating..." : "ESTABLISH ACCESS"}
            </Btn>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        <section className="relative pt-44 pb-20 px-8 overflow-hidden min-h-[90vh] flex items-center">
          {/* Architectural Background elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden translate-y-[-10%]">
             <div className="absolute top-0 right-0 w-1/2 h-[120%] bg-slate-50/50 skew-x-[-18deg] origin-top translate-x-1/4 shadow-inner" />
             <div className="absolute top-[10%] left-[-5%] w-[800px] h-[800px] bg-fluent-gold/5 blur-[160px] rounded-full animate-pulse" />
             <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-fluent-teal/5 blur-[180px] rounded-full" />
          </div>

          <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-24 items-center relative z-10">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="max-w-2xl"
            >
              <motion.div variants={itemVariants} className="mb-12 inline-flex items-center gap-4 px-6 py-2.5 rounded-full border border-fluent-gold/20 bg-white/50 backdrop-blur-sm shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-fluent-gold animate-pulse shadow-[0_0_8px_rgba(180,140,84,0.6)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-fluent-gold font-mono">Institutional Protocol 4.0 Alpha</span>
              </motion.div>

              <motion.h1 variants={itemVariants} className="text-8xl md:text-[130px] font-serif font-bold tracking-tighter text-fluent-navy mb-12 leading-[0.82]">
                Master the <br />
                <span className="italic font-light text-fluent-navy/40 pr-4">Global</span> <br />
                <span className="text-fluent-teal">Standard.</span>
              </motion.h1>
              
              <motion.p variants={itemVariants} className="text-2xl text-slate-500/80 max-w-lg mb-16 leading-relaxed font-light font-serif italic">
                A synthesis of British pedagogical precision and adaptive technology, architected for the elite scholar cohort.
              </motion.p>

              <div className="flex flex-col sm:flex-row gap-6 mb-16">
                <Btn variant="primary" size="lg" className="px-14 py-6 shadow-2xl shadow-fluent-navy/30 bg-fluent-navy hover:bg-fluent-navy/95 transition-all text-[11px] font-black uppercase tracking-[0.2em] rounded-full group" onClick={handleLogin} disabled={isLoggingIn}>
                  <span>{isLoggingIn ? "Authenticating..." : "Commence Transformation"}</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Btn>
              </div>

              <div className="flex items-center gap-6">
                 <div className="flex -space-x-4">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-12 h-12 rounded-full border-4 border-fluent-cream bg-slate-200 overflow-hidden shadow-sm transition-transform hover:scale-110 hover:z-10">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=student-${i + 10}`} alt="user" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    ))}
                 </div>
                 <div className="space-y-1">
                    <div className="text-[10px] font-black text-fluent-navy uppercase tracking-[0.25em]">Global Cohort</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                       <span className="text-fluent-teal">1.4k+</span> Scholars currently synthesising
                    </div>
                 </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative lg:pl-12"
            >
              <div className="relative z-20 w-full max-w-lg mx-auto lg:ml-auto">
                 <div className="bg-fluent-navy p-12 rounded-[80px] shadow-[0_40px_100px_-20px_rgba(13,27,42,0.4)] relative overflow-hidden ring-1 ring-white/10 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-fluent-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <div className="absolute -top-24 -right-24 w-80 h-80 bg-fluent-gold/10 rounded-full blur-[100px]" />
                    
                    <div className="relative z-10 space-y-12">
                       <div className="space-y-3">
                          <div className="flex items-center gap-3">
                             <motion.div 
                               animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                               transition={{ duration: 3, repeat: Infinity }}
                               className="w-2.5 h-2.5 rounded-full bg-fluent-gold shadow-[0_0_15px_rgba(180,140,84,1)]" 
                             />
                             <span className="text-[10px] font-black text-fluent-gold uppercase tracking-[0.4em] font-mono">Cognitive Node Alpha</span>
                          </div>
                          <h3 className="text-5xl font-serif text-white font-bold tracking-tight">Scholar Index</h3>
                       </div>

                       <div className="space-y-12">
                          {[
                            { name: 'Pure Mathematics', progress: 94, color: 'bg-fluent-gold' },
                            { name: 'Advanced Science', progress: 89, color: 'bg-fluent-teal' },
                            { name: 'Global Literature', progress: 97, color: 'bg-white' }
                          ].map((subject, idx) => (
                            <div key={subject.name} className="space-y-5">
                               <div className="flex justify-between items-end">
                                  <div className="space-y-1.5">
                                     <span className="text-white font-serif text-2xl block leading-none">{subject.name}</span>
                                     <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] font-mono">Protocol {idx + 1}</span>
                                  </div>
                                  <span className="text-fluent-gold font-mono font-bold text-lg tracking-widest">{subject.progress}%</span>
                                </div>
                               <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${subject.progress}%` }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 2.5, delay: 0.6 + (idx * 0.2), ease: [0.16, 1, 0.3, 1] }}
                                    className={`h-full ${subject.color} shadow-[0_0_20px_rgba(255,255,255,0.3)]`} 
                                  />
                               </div>
                            </div>
                          ))}
                       </div>

                       <div className="pt-12 border-t border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-5">
                             <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner group-hover:scale-110 transition-transform">
                                <Users size={20} className="text-white/80" />
                             </div>
                             <div>
                                <div className="text-[11px] font-black text-white/40 uppercase tracking-[0.25em]">Registry Intake</div>
                                <div className="text-[10px] font-bold text-fluent-teal uppercase tracking-widest">Active Synthesis Phase</div>
                             </div>
                          </div>
                          <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
                       </div>
                    </div>
                 </div>

                 {/* Floating Decorative Orbs */}
                 <motion.div 
                    animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-12 -right-12 w-32 h-32 bg-white/5 backdrop-blur-3xl rounded-[40px] border border-white/10 flex items-center justify-center shadow-2xl z-30"
                 >
                    <BookOpen size={40} className="text-fluent-gold/40" />
                 </motion.div>
              </div>

              {/* Architectural Decorative elements */}
              <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-fluent-gold/5 blur-[150px] rounded-full pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] border border-black/5 rounded-full opacity-10 pointer-events-none" />
            </motion.div>
          </div>
        </section>

        <section id="diagnosis" className="py-24 px-8 bg-white relative overflow-hidden">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent to-black/5" />
          
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-20 items-center mb-16">
              <div>
                <div className="text-[10px] font-black text-red-500 uppercase tracking-[0.5em] mb-4 font-mono">Status Audit: CRITICAL</div>
                <h2 className="text-6xl md:text-7xl font-serif font-bold text-fluent-navy leading-[0.9] mb-6 tracking-tight">
                  Identifying the <br />
                  <span className="italic font-light text-red-500/80">Quiet Barriers.</span>
                </h2>
                <p className="text-lg text-slate-500 leading-relaxed max-w-lg mb-8 font-serif opacity-80">
                  Academic stagnation is rarely a lack of effort. It is almost always a structural failure in confidence and methodology.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Anxiety", desc: "Fear of vocal participation in group academic settings.", code: "ANX-404" },
                  { label: "Stagnation", desc: "Performance plateaus despite increased study hours.", code: "PLT-500" },
                  { label: "Deficit", desc: "Internalised doubt regarding global capability.", code: "CNF-000" },
                  { label: "Dependency", desc: "A reliance on rote learning over synthesis.", code: "ROT-101" }
                ].map((problem, i) => (
                  <div key={i} className="p-6 border border-black/5 rounded-[32px] bg-slate-50/50 shadow-sm relative overflow-hidden group hover:bg-red-500 hover:border-red-500 transition-all duration-700">
                    <div className="text-[9px] font-black text-slate-300 group-hover:text-white/40 uppercase tracking-widest mb-8 font-mono">{problem.code}</div>
                    <h3 className="font-serif text-xl font-bold text-fluent-navy group-hover:text-white mb-2">{problem.label}</h3>
                    <p className="text-[11px] text-slate-400 group-hover:text-white/70 leading-relaxed font-sans">{problem.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="methodology" className="py-24 px-6 bg-fluent-cream/30 relative overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-24 items-center">
               <motion.div
                 initial={{ opacity: 0, x: -30 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 1 }}
               >
                  <div className="text-[10px] font-black text-fluent-teal uppercase tracking-[0.5em] mb-8 uppercase">The Synthesis Methodology</div>
                  <h2 className="text-6xl md:text-7xl font-serif font-bold text-fluent-navy mb-10 leading-[0.9] tracking-tight">
                    A Deep <br />
                    <span className="italic font-light">Architectural</span> <br />
                    Shift.
                  </h2>
                  <div className="space-y-8">
                    {[
                      { icon: <BookOpen size={20} className="text-fluent-teal" />, title: "Conceptual Frameworks", desc: "Moving beyond rote learning into first-principles thinking. We architect understanding from the foundation up." },
                      { icon: <Zap size={20} className="text-fluent-gold" />, title: "Adaptive Scaffolding", desc: "Our AI-powered engine adjusts the support level in real-time based on the scholar's cognitive load." },
                      { icon: <Target size={20} className="text-fluent-navy" />, title: "Articulation Protocols", desc: "Structured training to ensure every thought is synthesised into clear, confident communication." }
                    ].map((item, i) => (
                      <div key={i} className="flex gap-6 group">
                         <div className="w-14 h-14 shrink-0 rounded-[24px] bg-white flex items-center justify-center shadow-[0_10px_20px_-5px_rgba(0,0,0,0.05)] border border-black/5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                            {item.icon}
                         </div>
                         <div className="pt-1">
                            <h3 className="font-serif font-bold text-xl text-fluent-navy mb-2">{item.title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed max-w-sm opacity-80">{item.desc}</p>
                         </div>
                      </div>
                    ))}
                  </div>
               </motion.div>
               <div className="relative">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2 }}
                    className="bg-fluent-navy rounded-[64px] p-4 overflow-hidden shadow-[0_60px_100px_-30px_rgba(13,27,42,0.4)] relative"
                  >
                    <div className="absolute inset-0 bg-fluent-navy/20 z-10" />
                    <img 
                      src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop" 
                      alt="Collaborative Learning" 
                      className="rounded-[48px] w-full h-[700px] object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, x: -20, y: 20 }}
                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="absolute -bottom-16 -left-16 bg-white p-12 rounded-[48px] shadow-2xl border border-black/5 max-w-sm backdrop-blur-xl bg-white/90"
                  >
                     <p className="italic font-serif text-2xl text-fluent-navy mb-6 leading-relaxed">“Our scholars don't just learn; they find their voice and own the room.”</p>
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-fluent-gold/10 flex items-center justify-center text-fluent-gold">
                           <Award size={20} />
                        </div>
                        <div>
                           <div className="text-[10px] font-black uppercase tracking-[0.2em] text-fluent-navy">Dr. Alistair Sterling</div>
                           <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Academy Provost</div>
                        </div>
                     </div>
                  </motion.div>
               </div>
            </div>
          </div>
        </section>

        <section id="benefits" className="py-24 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/clean-gray-paper.png')] opacity-20 pointer-events-none" />
          
          <div className="max-w-7xl mx-auto border-y border-black/5 py-24 relative z-10">
            <div className="text-center mb-20">
              <div className="text-[10px] font-black text-fluent-gold uppercase tracking-[0.5em] mb-6">Competitive Distinction</div>
              <h2 className="text-5xl font-serif font-bold text-fluent-navy tracking-tight">The British Standard.</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-16">
               {[
                 { title: "Independant Pedagogy", desc: "Instructional protocols derived from the world's most elite private school systems in the UK." },
                 { title: "Oxbridge-Calibre Mentors", desc: "Access faculty who have mastered the world's most competitive academic landscapes." },
                 { title: "Radical Transparency", desc: "Granular mastery audits delivered weekly, ensuring no gap remains unidentified." }
               ].map((usp, i) => (
                 <motion.div 
                   key={i} 
                   className="text-center group"
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ duration: 0.8, delay: i * 0.1 }}
                 >
                    <div className="text-fluent-gold font-serif text-[100px] mb-[-40px] opacity-10 group-hover:opacity-20 transition-opacity duration-700 select-none leading-none">0{i + 1}</div>
                    <h3 className="text-2xl font-serif font-bold text-fluent-navy mb-4 relative z-10">{usp.title}</h3>
                    <p className="text-slate-500 leading-relaxed text-base opacity-80 max-w-xs mx-auto">{usp.desc}</p>
                 </motion.div>
               ))}
            </div>
          </div>
        </section>

        <section id="programs" className="py-24 px-8 bg-white relative overflow-hidden">
           <div className="max-w-7xl mx-auto">
             <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-20">
                <div className="max-w-xl">
                   <div className="text-[10px] font-black text-fluent-gold uppercase tracking-[0.5em] mb-4 font-mono">Academic Offerings</div>
                   <h2 className="text-6xl md:text-7xl font-serif font-bold text-fluent-navy leading-[0.9] tracking-tight">
                      Global <br />
                      <span className="italic font-light text-fluent-navy/40 pr-2">Curriculum</span> <br />
                      Design.
                   </h2>
                </div>
                <p className="text-lg text-slate-400 font-serif italic max-w-sm mb-4">Elite educational pathways designed for cognitive depth and competitive advantage.</p>
             </div>

             <div className="grid lg:grid-cols-3 gap-6">
                {[
                  { 
                    title: "Foundation Module", 
                    level: "Grade 6-8",
                    icon: <Target className="text-fluent-navy" size={28} />,
                    desc: "Architecting the core mathematical and scientific foundations required for advanced British pedagogical success.",
                    features: ["First-Principles Thinking", "Conceptual Mathematics", "Scientific Literacy"]
                  },
                  { 
                    title: "Advanced Secondary", 
                    level: "Grade 9-10",
                    icon: <Zap className="text-fluent-gold" size={28} />,
                    desc: "Pre-IGCSE and secondary rigorous synthesis, focusing on articulation protocols and deep conceptual clarity.",
                    features: ["Articulation Training", "Oxbridge-Style Socratic Seminars", "Adaptive Scaffolding"]
                  },
                  { 
                    title: "Elite Collegiate", 
                    level: "Grade 11-12",
                    icon: <Award className="text-fluent-teal" size={28} />,
                    desc: "Preparation for the world's most competitive universities with 1:1 faculty mentorship and scholarship strategy.",
                    features: ["University Entrance Strategy", "1:1 Faculty Mentorship", "Peer Synthesis Labs"]
                  }
                ].map((program, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="p-10 h-full rounded-[48px] border-black/5 bg-slate-50/20 group hover:bg-white hover:shadow-2xl transition-all duration-700">
                       <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm border border-black/5 group-hover:scale-110 group-hover:rotate-3 transition-all">
                          {program.icon}
                       </div>
                       <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{program.level}</div>
                       <h3 className="text-2xl font-serif font-bold text-fluent-navy mb-4">{program.title}</h3>
                       <p className="text-[13px] text-slate-500 mb-8 leading-relaxed font-medium">{program.desc}</p>
                       
                       <ul className="space-y-3 pt-6 border-t border-black/5">
                          {program.features.map(f => (
                            <li key={f} className="flex items-center gap-3 text-[9px] font-black text-fluent-navy/60 uppercase tracking-widest">
                               <div className="w-1 h-1 rounded-full bg-fluent-teal" />
                               {f}
                            </li>
                          ))}
                       </ul>
                    </Card>
                  </motion.div>
                ))}
             </div>
           </div>
        </section>

        <section id="portals" className="py-24 px-6 bg-fluent-cream/40 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-full h-[300px] bg-gradient-to-b from-white to-transparent pointer-events-none" />
           
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-10">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="text-[10px] font-black text-fluent-navy uppercase tracking-[0.5em] mb-6">Unified Infrastructure</div>
                <h2 className="text-[60px] md:text-[100px] font-serif font-bold tracking-tight text-fluent-navy mb-0 leading-[0.8] mix-blend-multiply opacity-5">PORTALS</h2>
                <h2 className="text-6xl font-serif font-bold tracking-tight text-fluent-navy mt-[-30px]">
                  The <span className="italic font-light">Academic</span> Hub.
                </h2>
              </motion.div>
              <p className="text-slate-400 text-base max-w-sm mb-4">A unified command center for scholars, faculty, and guardians to synchronise on the mastery path.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Student Node', icon: <GraduationCap size={24} />, color: 'bg-fluent-navy', desc: 'Personalised practice, content mastery, and live peer synthesis.' },
                { title: 'Guardian View', icon: <UserCheck size={24} />, color: 'bg-fluent-teal', desc: 'Real-time transparency on marks, attendance, and behavioral audits.' },
                { title: 'Faculty Sync', icon: <BookOpen size={24} />, color: 'bg-fluent-gold', desc: 'Instructional management, mastery marking, and feedback loops.' },
                { title: 'Command Base', icon: <Settings size={24} />, color: 'bg-fluent-navy', desc: 'Global academy administrative control and scholarship oversight.' }
              ].map((portal, idx) => (
                <motion.div
                  key={portal.title}
                  initial={{ opacity: 0, scale: 0.98 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.05 }}
                >
                  <Card hover className="p-10 flex flex-col h-full rounded-[48px] border-none shadow-none hover:shadow-2xl transition-all duration-700 bg-white group overflow-hidden relative" onClick={handleLogin}>
                    <div className="absolute -top-12 -right-12 w-40 h-40 bg-slate-50 rounded-full group-hover:scale-[3] transition-transform duration-1000 -z-10" />
                    
                    <div className={`w-14 h-14 ${portal.color} text-white rounded-[20px] flex items-center justify-center mb-10 shadow-xl group-hover:scale-110 transition-transform duration-500`}>
                      {portal.icon}
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-fluent-navy mb-4 leading-tight">{portal.title}</h3>
                    <p className="text-[13px] text-slate-400 mb-10 flex-1 leading-relaxed">{portal.desc}</p>
                    
                    <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.3em] text-fluent-navy group cursor-pointer mt-auto border-t border-black/5 pt-6">
                      <span>Enter Interface</span>
                      <div className="w-6 h-px bg-fluent-navy group-hover:w-10 transition-all" />
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="investment" className="py-24 px-8 bg-white relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mb-4 font-mono">Academic Investment</div>
              <h2 className="text-6xl md:text-8xl font-serif font-bold text-fluent-navy tracking-tighter leading-[0.8] mb-10">
                <span className="italic font-light opacity-30">The</span> <br /> 
                <span className="text-fluent-navy">Standard.</span>
              </h2>
              <p className="text-base text-slate-400 max-w-sm mx-auto font-serif italic">Sustainable excellence requires institutional commitment.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-10 items-stretch">
               {[
                 { tier: "Foundation Module", price: "₹2,999", color: "navy", features: ["1x Core Subject Synthesis", "Primary AI Practice Node", "Daily Mastery Check-ins", "Monthly Progress Audit"], badge: "Entry Protocol" },
                 { tier: "The Professional", price: "₹4,499", color: "teal", features: ["Full STEM/Hum Synthesis", "Adaptive AI Learning Core", "3x Weekly Live Labs", "Priority Faculty Access", "Comprehensive Weekly Audit"], highlighted: true, badge: "Most Requested" },
                 { tier: "The Scholar", price: "₹7,999+", color: "gold", features: ["1:1 Oxbridge Mentorship", "Custom Curriculum Path", "Daily Live Synthesis Lab", "Direct Registrar Access", "Elite Portfolio Support"], badge: "Institutional Trust" }
               ].map((plan, i) => (
                 <motion.div
                   key={i}
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ duration: 0.8, delay: i * 0.1 }}
                   className="h-full"
                 >
                   <Card className={`p-10 flex flex-col items-center text-center transition-all duration-700 rounded-[64px] h-full ${plan.highlighted ? 'border-fluent-teal/20 border-2 bg-slate-50/30 shadow-2xl scale-105 z-20 ring-1 ring-fluent-teal/5' : 'border-black/5 hover:border-fluent-navy/10 shadow-none'}`}>
                      <div className="mb-8 px-4 py-1 bg-black/5 rounded-full text-[8px] font-black uppercase tracking-[0.3em] text-slate-500 font-mono">{plan.badge}</div>
                      <h3 className={`text-xl font-serif font-bold text-fluent-navy mb-8`}>{plan.tier}</h3>
                      <div className="text-5xl font-serif font-bold text-fluent-navy mb-10 tracking-tight">{plan.price}<span className="text-xs font-sans font-medium text-slate-400 tracking-normal ml-1">/mo</span></div>
                      
                      <div className="w-10 h-px bg-black/10 mb-10" />
                      
                      <ul className="space-y-4 mb-12 flex-1 w-full text-left">
                         {plan.features.map((f, j) => (
                           <li key={j} className="flex items-start gap-3 text-[13px] text-slate-500 font-medium">
                              <div className={`mt-1.5 h-1 w-1 rounded-full shrink-0 ${plan.color === 'teal' ? 'bg-fluent-teal' : plan.color === 'gold' ? 'bg-fluent-gold' : 'bg-fluent-navy'}`} />
                              <span>{f}</span>
                           </li>
                         ))}
                      </ul>
                      
                      <Btn variant={plan.highlighted ? "primary" : "outline"} className={`w-full py-5 rounded-full font-black uppercase tracking-[0.3em] text-[9px] transition-all duration-500 ${plan.highlighted ? 'shadow-[0_20px_50px_-10px_rgba(13,27,42,0.4)] bg-fluent-navy text-white hover:bg-fluent-teal' : 'border-fluent-navy/20'}`} onClick={handleLogin}>
                         INTAKE PROTOCOL
                      </Btn>
                   </Card>
                 </motion.div>
               ))}
            </div>
          </div>
        </section>
      </main>

      <section className="bg-fluent-navy text-white text-center py-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-10 pointer-events-none" />
        <div className="absolute -top-[50%] -left-[20%] w-[80%] h-[150%] bg-gradient-to-br from-fluent-gold/10 to-transparent blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-7xl font-serif font-bold mb-10 leading-tight tracking-tight">
              Architecting <br /> <span className="text-fluent-gold italic font-light">Success,</span> <br /> One Scholar at a Time.
            </h2>
            <p className="text-white/50 text-lg mb-12 max-w-2xl mx-auto font-serif italic">“The future belongs to those who bridge the gap between effort and excellence.”</p>
            <Btn variant="gold" size="lg" className="px-16 py-6 shadow-[0_30px_60px_-15px_rgba(180,140,84,0.4)] rounded-full text-[11px] font-black uppercase tracking-[0.3em] hover:tracking-[0.4em] transition-all duration-700" onClick={() => setShowLeadModal(true)}>
              Schedule Academy Visit
            </Btn>
          </motion.div>
        </div>
      </section>

      <AnimatePresence>
        {showLeadModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
             <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }} 
               onClick={() => setShowLeadModal(false)}
               className="absolute inset-0 bg-fluent-navy/60 backdrop-blur-md" 
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden p-10 md:p-12"
             >
                <div className="flex justify-between items-start mb-8">
                   <div>
                      <div className="text-[10px] font-black text-fluent-teal uppercase tracking-[0.4em] mb-2">Institutional Partnership</div>
                      <h3 className="text-3xl font-serif font-bold text-fluent-navy tracking-tight">Book Synthesis Demo</h3>
                   </div>
                   <button onClick={() => setShowLeadModal(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><X size={20}/></button>
                </div>

                <form onSubmit={handleLeadSubmit} className="space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">School Name</label>
                         <input required value={leadData.schoolName} onChange={e => setLeadData(d => ({...d, schoolName: e.target.value}))} className="w-full p-4 bg-slate-50 border border-black/5 rounded-xl text-sm" placeholder="Global Academy..." />
                      </div>
                      <div className="space-y-1">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Contact Person</label>
                         <input required value={leadData.contactPerson} onChange={e => setLeadData(d => ({...d, contactPerson: e.target.value}))} className="w-full p-4 bg-slate-50 border border-black/5 rounded-xl text-sm" placeholder="Full Name..." />
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Designation</label>
                         <select value={leadData.designation} onChange={e => setLeadData(d => ({...d, designation: e.target.value}))} className="w-full p-4 bg-slate-50 border border-black/5 rounded-xl text-sm">
                            <option>Principal / Admin</option>
                            <option>Department Head</option>
                            <option>Trustee</option>
                            <option>Other</option>
                         </select>
                      </div>
                      <div className="space-y-1">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Phone Number</label>
                         <input required value={leadData.phone} onChange={e => setLeadData(d => ({...d, phone: e.target.value}))} className="w-full p-4 bg-slate-50 border border-black/5 rounded-xl text-sm" placeholder="+91..." />
                      </div>
                   </div>

                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Institutional Email</label>
                      <input required type="email" value={leadData.email} onChange={e => setLeadData(d => ({...d, email: e.target.value}))} className="w-full p-4 bg-slate-50 border border-black/5 rounded-xl text-sm" placeholder="school@academy.edu" />
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Student Count</label>
                         <input required value={leadData.studentCount} onChange={e => setLeadData(d => ({...d, studentCount: e.target.value}))} className="w-full p-4 bg-slate-50 border border-black/5 rounded-xl text-sm" placeholder="e.g. 500" />
                      </div>
                      <div className="space-y-1">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Target Classes</label>
                         <input required value={leadData.classes} onChange={e => setLeadData(d => ({...d, classes: e.target.value}))} className="w-full p-4 bg-slate-50 border border-black/5 rounded-xl text-sm" placeholder="e.g. 6-12" />
                      </div>
                   </div>

                   <Btn variant="primary" className="w-full py-5 text-sm font-black uppercase tracking-widest rounded-2xl" disabled={isSubmittingLead}>
                      {isSubmittingLead ? "TRANSMITTING..." : "SUBMIT DEMO REQUEST ✦"}
                   </Btn>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="py-20 px-8 border-t border-black/5 bg-white relative overflow-hidden">
        {/* Decorative corner element */}
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-slate-50 -skew-x-12 translate-x-32 translate-y-32 z-0" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-16 mb-20">
             <div className="col-span-2">
                <Logo className="mb-10" />
                <p className="text-slate-400 text-lg max-w-sm leading-relaxed font-serif italic mb-12 opacity-80">
                   "Synthesising British instructional excellence with adaptive technology for global academic mastery."
                </p>
                <div className="flex gap-4">
                   {['fb', 'tw', 'ig', 'li'].map(social => (
                     <div key={social} className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-fluent-navy hover:text-white transition-all cursor-pointer border border-black/5">
                        <Zap size={18} />
                     </div>
                   ))}
                </div>
             </div>
             
             <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-fluent-navy/30 mb-10">Institution</h4>
                <ul className="space-y-5">
                   {[
                     { label: 'Strategy', href: '#' },
                     { label: 'Diagnosis', href: '#diagnosis' },
                     { label: 'Methodology', href: '#methodology' },
                     { label: 'Mastery', href: '#programs' }
                   ].map(item => (
                     <li key={item.label}>
                       <a href={item.href} className="text-sm font-bold text-slate-500 hover:text-fluent-navy transition-colors tracking-wide">{item.label}</a>
                     </li>
                   ))}
                </ul>
             </div>
  
             <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-fluent-navy/30 mb-10">Infrastructure</h4>
                <ul className="space-y-5">
                   {['Student Node', 'Faculty Hub', 'Guardian View', 'Command Base'].map(item => (
                     <li key={item}>
                       <a href="#portals" className="text-sm font-bold text-slate-500 hover:text-fluent-navy transition-colors tracking-wide">{item}</a>
                     </li>
                   ))}
                </ul>
             </div>
  
             <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-fluent-navy/30 mb-10">Contact</h4>
                <ul className="space-y-5">
                   <li className="text-sm font-bold text-slate-500 tracking-wide">London, United Kingdom</li>
                   <li className="text-sm font-bold text-slate-500 tracking-wide">07553886303</li>
                   <li className="text-sm font-bold text-fluent-teal tracking-wide">infofluent.academy@gmail.com</li>
                </ul>
             </div>
          </div>
  
          <div className="pt-12 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-8">
             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
                © 2026 Accountable Hindustan Institutional Trust. All Rights Reserved.
             </div>
             <div className="flex gap-10">
                {['Privacy Protocol', 'Service Standard', 'Cookies'].map(item => (
                  <a key={item} href="#" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-fluent-navy transition-colors">{item}</a>
                ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
