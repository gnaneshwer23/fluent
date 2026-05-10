import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, Sparkles, Target, Zap, ShieldCheck, Award, Users, 
  BookOpen, GraduationCap, UserCheck, LayoutDashboard, Settings, X,
  CheckCircle2, AlertTriangle, Database, School, TrendingUp, HelpCircle, Bell,
  MessageCircle, CreditCard, Star
} from 'lucide-react';
import { Logo, Btn, Badge, Card } from './UI';
import { db, auth } from '../lib/firebaseInit';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';
import { notifyNewLead } from '../lib/communicationService';

const googleProvider = new GoogleAuthProvider();

export const LandingPage = () => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    
    if (showLeadModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.body.style.overflow = 'unset';
    };
  }, [showLeadModal]);

  const [leadData, setLeadData] = useState({
    schoolName: "",
    contactPerson: "",
    designation: "Principal / Admin",
    phone: "",
    email: "",
    studentCount: "",
    classes: "9-12"
  });
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
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

  return (
    <div className="min-h-screen bg-fluent-cream selection:bg-fluent-gold/30 font-sans relative overflow-x-hidden">
      {/* Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03] select-none" style={{ backgroundImage: 'radial-gradient(#0D1B2A 0.5px, transparent 0.5px)', backgroundSize: '32px 32px' }} />

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-700 ${scrolled ? 'bg-white/95 backdrop-blur-2xl border-b border-black/5 py-3 md:py-4' : 'bg-transparent py-4 md:py-8'}`}>
        <div className="max-w-7xl mx-auto px-8 md:px-12 flex justify-between items-center text-fluent-navy">
          <Logo onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
          
          <div className="hidden lg:flex gap-8 xl:gap-14 items-center">
            {["The System", "AI Grounding", "Outcome Audit"].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(/\s/g, '')}`} className="text-[10px] font-black uppercase tracking-[0.4em] text-fluent-navy/70 hover:text-fluent-navy transition-all duration-500 hover:tracking-[0.5em]">{item}</a>
            ))}
            <div className="h-4 w-px bg-black/10 mx-2" />
            <Btn variant="primary" size="sm" className="px-10 py-3 text-[10px] tracking-[0.3em] uppercase font-black" onClick={handleLogin} disabled={isLoggingIn}>
              {isLoggingIn ? "Authenticating..." : "SIGNUP / LOGIN"}
            </Btn>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-12 md:pt-32 md:pb-16 px-8 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div initial="hidden" animate="visible" variants={containerVariants} className="flex flex-col items-center">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-3 bg-slate-50 border border-black/5 px-6 py-2 text-[10px] uppercase tracking-[0.6em] text-fluent-navy mb-14 font-black shadow-sm">
               British-Trained Elite Faculty
            </motion.div>
            
            <motion.div variants={itemVariants} className="relative mb-14 max-w-5xl">
               <h1 className="text-4xl md:text-7xl lg:text-[110px] font-serif font-black tracking-tighter leading-[1.1] text-fluent-navy mb-12">
                  Learn Directly from <br />
                  British Masters.
               </h1>
               <p className="text-[10px] md:text-xl lg:text-2xl text-fluent-gold leading-tight font-serif mb-12 max-w-4xl mx-auto uppercase tracking-[0.2em] md:tracking-widest font-black px-4">
                  UK-Trained Teachers • Adaptive AI • Exceptional Indian Students
               </p>
               <p className="text-sm md:text-lg text-slate-600 leading-relaxed font-serif tracking-wide max-w-2xl mx-auto">
                  We don’t just teach scholars — we train the next generation of academic leaders.
               </p>
            </motion.div>

            <motion.div variants={itemVariants} className="pt-8 flex flex-col items-center gap-6 group">
               <div className="flex flex-col sm:flex-row gap-6">
                  <Btn variant="primary" size="lg" className="px-16 py-7 !text-[11px] tracking-[0.4em] uppercase font-black" onClick={() => setShowLeadModal(true)}>Establish Contact</Btn>
                  <a 
                    href="https://wa.me/447553886303" 
                    target="_blank" 
                    rel="no-referrer"
                    className="px-12 py-7 flex items-center gap-4 bg-green-500 hover:bg-green-600 text-white !text-[11px] tracking-[0.4em] uppercase font-black transition-all shadow-xl shadow-green-500/20"
                  >
                    <MessageCircle size={20} />
                    WhatsApp Support
                  </a>
               </div>
               <div className="mt-10 flex flex-col items-center gap-6">
                  <div className="h-20 w-px bg-gradient-to-b from-fluent-gold to-transparent opacity-30" />
                  <a href="#teachers" className="text-[10px] font-black uppercase tracking-[0.5em] text-fluent-navy/60 hover:text-fluent-navy transition-all duration-500 hover:tracking-[0.6em]">
                     Meet Our British Teachers
                  </a>
               </div>
            </motion.div>
          </motion.div>
        </div>
      </section>


      {/* Ticker Section */}
      <div className="py-8 bg-fluent-gold/10 overflow-hidden border-y border-fluent-gold/10">
         <motion.div className="flex whitespace-nowrap" animate={{ x: ["0%", "-50%"] }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}>
             {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-20 px-10 items-center text-fluent-navy">
                  {[
                    "British-Trained Faculty", "Class 9-12 Specialist", "AI RAG Curriculum Grounding", 
                    "Maths • Physics • Chemistry • Biology • English", "UK-Standard Growth Audits", 
                    "Syllabus Precision Mastery", "Global Academic Trust"
                  ].map((text, j) => (
                    <span key={j} className="font-black tracking-[0.3em] uppercase text-[10px] flex gap-20 items-center">
                       {text} <span className="text-fluent-gold/50 shadow-sm">✦</span>
                    </span>
                  ))}
                </div>
             ))}
         </motion.div>
      </div>

      {/* British Teachers Section */}
      <section id="teachers" className="py-12 md:py-16 px-8 bg-white border-b border-black/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <Badge color="navy" className="mb-8">Instructional Excellence</Badge>
            <h2 className="text-4xl font-serif font-black tracking-tighter leading-[1.1] mb-12">
               Learn Directly from <br />
               <span className="text-fluent-gold">British-Trained Masters.</span>
            </h2>
            <p className="mt-8 text-xl md:text-2xl text-slate-700 max-w-3xl mx-auto font-serif leading-relaxed">
               "Not just tutors following a syllabus — actual British-trained educators teaching your child, combining global standards with local rigour."
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-0 border border-black/5 rounded-[40px] overflow-hidden shadow-2xl">
            {[
              { id: "01", title: "British Pedagogy", desc: "Concept-first teaching, critical thinking, and inquiry-based learning adapted for high-rigour Indian students." },
              { id: "02", title: "Real UK Experience", desc: "Teachers who have taught in top UK schools bring global standards directly to Indian classrooms." },
              { id: "03", title: "Teacher Academy", desc: "Our British faculty also train Indian teachers to deliver exceptionally structured and high-quality lessons." }
            ].map((p, i) => (
              <div key={i} className={`p-8 md:p-12 bg-white hover:bg-slate-50 transition-all duration-700 group relative ${i !== 2 ? 'md:border-r border-b md:border-b-0 border-black/5' : ''}`}>
                <div className="text-[11px] font-black text-fluent-gold uppercase tracking-[0.5em] mb-12 font-mono">{p.id}</div>
                <h3 className="text-2xl md:text-3xl font-serif font-black text-fluent-navy mb-8 leading-snug group-hover:translate-x-2 transition-transform duration-500">{p.title}</h3>
                <p className="text-slate-600 font-serif leading-relaxed text-sm">{p.desc}</p>
                <div className="mt-12 h-px w-12 bg-fluent-gold group-hover:w-full transition-all duration-1000" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Audience */}
      <section className="py-12 md:py-16 px-8 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 md:gap-16 items-center">
             <div>
                <Badge color="navy" className="mb-10">Cohort Integration</Badge>
                <h2 className="text-4xl font-serif font-black text-fluent-navy tracking-tighter leading-[1.1] mb-16">
                   Built for <br />
                   <span className="font-light text-fluent-gold">The Driven.</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-12">
                   {[
                     { t: "Scholars", desc: "Class 9-12 seekers moving beyond rote memory." },
                     { t: "Guardians", desc: "Demanding absolute clarity and ROI data." },
                     { t: "Masters", desc: "Elite faculty scaling their impact." },
                     { t: "Institutional", desc: "Schools aiming for zero-gap dominance." }
                   ].map((item, i) => (
                      <div key={i} className="pb-8 border-b border-black/5 hover:border-fluent-gold transition-colors duration-500">
                         <div className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] mb-4 font-mono">Archive 0{i+1}</div>
                         <h4 className="text-2xl font-black font-serif text-fluent-navy mb-3">{item.t}</h4>
                         <p className="text-xs text-slate-600 font-serif leading-relaxed">{item.desc}</p>
                      </div>
                   ))}
                </div>
             </div>
             <div className="relative mt-12 lg:mt-0">
                <div className="p-10 md:p-20 bg-slate-50 border border-black/5 relative z-10 overflow-hidden shadow-[20px_20px_0px_0px_#C9A84C] md:shadow-[30px_30px_0px_0px_#C9A84C]">
                   <h3 className="text-2xl md:text-4xl font-serif text-fluent-navy leading-snug mb-16 relative">
                      <span className="text-5xl md:text-7xl absolute -top-10 md:-top-12 -left-4 md:-left-6 opacity-10 font-serif">"</span>
                      We are not a tuition center. We are an academic trust dedicated to high-rigour scholarship.
                   </h3>
                   <div className="flex gap-6 items-center">
                      <div className="w-12 h-12 md:w-14 md:h-14 bg-fluent-navy shadow-xl" />
                      <div>
                         <div className="text-[10px] font-black uppercase tracking-[0.3em] text-fluent-navy mb-1">Institutional Board</div>
                         <div className="text-[10px] font-serif text-fluent-gold uppercase tracking-widest">FLUENT&nbsp;&nbsp;&nbsp;INSTITUTE. Governance</div>
                      </div>
                   </div>
                </div>
             </div>
             <div className="absolute -top-16 -right-16 w-64 h-64 bg-fluent-gold/5 blur-[100px] rounded-full" />
           </div>
        </div>
      </section>


      {/* Problem Diagnosis Section */}
      <section id="diagnosis" className="py-16 md:py-24 px-8 bg-fluent-cream relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 md:gap-16 items-start">
            <div className="lg:col-span-5 lg:sticky top-40 mb-12 lg:mb-0">
              <Badge color="red" className="mb-6 md:mb-10">Audit: Instructional Decay</Badge>
              <h2 className="text-3xl md:text-4xl font-serif font-black text-fluent-navy leading-[1.1] tracking-tighter mb-8 md:mb-12 text-balance">
                The Blind <br /><span className="font-light text-red-700">Spots.</span>
              </h2>
              <p className="text-lg md:text-2xl text-slate-700 leading-relaxed font-serif mb-10 md:mb-16">
                 "Conventional tuition prioritises throughput over mastery. In large batches, concept gaps are invisible until the strategic failure occurs."
              </p>
              <div className="p-6 md:p-12 bg-fluent-navy text-white shadow-2xl relative overflow-hidden rounded-r-xl md:rounded-none">
                 <div className="absolute top-0 right-0 w-1 md:w-2 h-full bg-red-600" />
                 <div className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-fluent-gold mb-4 md:mb-6">The Structural Crisis</div>
                 <p className="text-white/80 text-xs md:text-base leading-relaxed">Weak foundations combined with high investment leads to a critical loss of scholar confidence and ROI.</p>
              </div>
            </div>
            
            <div className="lg:col-span-7 grid grid-cols-1 gap-6">
               {[
                 { label: "Faculty Dilution", desc: "Elite mentors replaced by mass-market recorded archives in conventional systems.", code: "REPORT-01", trend: "High" },
                 { label: "Concept Gaps", desc: "Rote memorisation prioritized over fundamental physics & maths internalisation.", code: "REPORT-02", trend: "Critical" },
                 { label: "English Silo", desc: "Technical mastery undermined by a lack of real-world discourse confidence.", code: "REPORT-03", trend: "Severe" },
                 { label: "Zero Visibility", desc: "Guardians have zero insight into daily engagement or performance deltas.", code: "REPORT-04", trend: "Severe" }
               ].map((p, i) => (
                <div key={i} className="py-10 border-b border-black/5 flex justify-between items-center gap-12 group">
                   <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                         <div className="text-[10px] font-black text-fluent-gold uppercase tracking-[0.3em] font-mono">{p.code}</div>
                         <div className="h-px w-8 bg-black/10" />
                         <div className="text-[9px] font-black uppercase tracking-widest text-red-500">{p.trend} Risk</div>
                      </div>
                      <h3 className="font-serif text-2xl font-black text-fluent-navy mb-2 leading-snug">{p.label}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed font-serif">{p.desc}</p>
                   </div>
                   <div className="text-4xl font-serif text-black/5 font-black group-hover:text-fluent-gold/20 transition-colors">0{i+1}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The System Section */}
      <section id="thesystem" className="py-16 md:py-24 px-8 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12 md:mb-16">
             <Badge color="navy" className="mb-10">Instructional Core</Badge>
             <h2 className="text-4xl font-serif font-black tracking-tighter leading-[1.1] mb-10">
                Mastery Through <br />
                <span className="text-fluent-gold">British Precision.</span>
             </h2>
             <p className="text-xl md:text-2xl text-slate-700 max-w-3xl mx-auto font-serif leading-relaxed">
                "Indian students learning directly from British-trained teachers — combined with AI support and continuous teacher development."
             </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-0 border border-black/5 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)]">
             <div className="p-8 md:p-12 bg-fluent-navy text-white relative overflow-hidden group md:border-r border-b md:border-b-0 border-white/5">
                <Badge color="gold" className="mb-12">Manual 01 • Instruction</Badge>
                <h3 className="text-3xl md:text-4xl font-serif font-black mb-10 leading-snug group-hover:translate-y-[-4px] transition-transform duration-700">Elite Indian <br />Faculty Nodes</h3>
                <p className="text-white/40 text-base font-serif leading-relaxed mb-16">
                   Small cohort classes limited to 20 seats. Taught by faculty with proven track records in high-rigour competitive excellence.
                </p>
                <div className="flex flex-col gap-6 text-[10px] font-black uppercase tracking-[0.4em] text-fluent-gold">
                   <div className="flex items-center gap-4">
                      <div className="w-1.5 h-1.5 bg-fluent-gold" />
                      <span>Live Interaction</span>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="w-1.5 h-1.5 bg-fluent-gold" />
                      <span>Syllabus Precision</span>
                   </div>
                </div>
             </div>

             <div className="p-8 md:p-12 bg-white text-fluent-navy relative overflow-hidden group md:border-r border-b md:border-b-0 border-black/5">
                <Badge color="navy" className="mb-12">Manual 02 • Grounding</Badge>
                <h3 className="text-3xl md:text-4xl font-serif font-black mb-10 leading-snug group-hover:translate-y-[-4px] transition-transform duration-700">AI Augmented <br />RAG Grounding</h3>
                <p className="text-slate-400 text-base font-serif leading-relaxed mb-16">
                   A curriculum-aware tutor available 24/7. It doesn't just answer; it retrieves from verified syllabus nodes to ensure factual mastery.
                </p>
                <div className="flex flex-col gap-6 text-[10px] font-black uppercase tracking-[0.4em] text-fluent-navy/40">
                   <div className="flex items-center gap-4">
                      <div className="w-1.5 h-1.5 bg-fluent-navy/20" />
                      <span>Context Retrieval</span>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="w-1.5 h-1.5 bg-fluent-navy/20" />
                      <span>Infinite Depth</span>
                   </div>
                </div>
             </div>

             <div className="p-8 md:p-12 bg-fluent-cream text-fluent-navy relative overflow-hidden group">
                <Badge color="gold" className="mb-12">Manual 03 • Training</Badge>
                <h3 className="text-3xl md:text-4xl font-serif font-black mb-10 leading-snug group-hover:translate-y-[-4px] transition-transform duration-700">British Teacher <br />Academy Core</h3>
                <p className="text-slate-500 text-base font-serif leading-relaxed mb-16">
                   Our British faculty doesn't just teach; they train. We upgrade teacher communication, logic scaffolding, and student engagement frameworks.
                </p>
                <div className="flex flex-col gap-6 text-[10px] font-black uppercase tracking-[0.4em] text-fluent-navy">
                   <div className="flex items-center gap-4">
                      <div className="w-1.5 h-1.5 bg-fluent-gold" />
                      <span>Pedagogical Audits</span>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="w-1.5 h-1.5 bg-fluent-gold" />
                      <span>Engagement Training</span>
                   </div>
                </div>
             </div>

             <div className="p-8 md:p-12 bg-white text-fluent-navy relative overflow-hidden group border-t md:border-t-0 md:border-l border-black/5">
                <Badge color="navy" className="mb-12">Manual 04 • Audit</Badge>
                <h3 className="text-3xl md:text-4xl font-serif font-black mb-10 leading-snug group-hover:translate-y-[-4px] transition-transform duration-700">The Guardian <br />Pulse Interface</h3>
                <p className="text-slate-500 text-base font-serif leading-relaxed mb-16">
                   Complete transparency into the scholar's journey. Weekly delta reports and real-time performance auditing for parents.
                </p>
                <div className="flex flex-col gap-6 text-[10px] font-black uppercase tracking-[0.4em] text-fluent-navy">
                   <div className="flex items-center gap-4">
                      <div className="w-1.5 h-1.5 bg-fluent-navy" />
                      <span>Weekly Delta Reports</span>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="w-1.5 h-1.5 bg-fluent-navy" />
                      <span>Outcome-Based Tracking</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* AI Tutor RAG Section */}
      <section id="aigrounding" className="py-16 md:py-20 px-8 bg-fluent-cream relative overflow-hidden transition-colors duration-1000">
        <div className="max-w-7xl mx-auto border-y border-black/5 py-12 md:py-16">
          <div className="grid lg:grid-cols-2 gap-12 md:gap-16 items-center">
            <div className="relative">
               <div className="bg-fluent-navy p-8 md:p-12 rounded-none shadow-[20px_20px_0px_0px_#1B4F5E] md:shadow-[40px_40px_0px_0px_#1B4F5E] relative overflow-hidden group">
                  <div className="relative z-10">
                     <div className="flex gap-4 mb-16">
                        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-fluent-gold whitespace-nowrap">AI-Grounding</div>
                     </div>
                     <div className="space-y-8">
                        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="p-6 md:p-8 bg-white/5 border border-white/5">
                           <div className="text-[9px] font-black uppercase text-fluent-gold mb-4 tracking-[0.3em] font-mono">Scholar Inquiry</div>
                           <p className="text-white/80 text-base md:text-lg font-serif">"Explain the orbital hybridisation of Methane using the VSEPR framework."</p>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3 }} className="p-8 md:p-10 bg-fluent-gold/5 border border-fluent-gold/10 ml-6 md:ml-8 shadow-2xl relative">
                           <div className="absolute -left-1 top-0 bottom-0 w-1 bg-fluent-gold" />
                           <div className="text-[9px] font-black uppercase text-fluent-gold mb-4 tracking-[0.3em] font-mono">Retrieved Knowledge Node #1092</div>
                           <p className="text-white text-base md:text-lg font-serif leading-relaxed">
                                "Direct retrieval from Grade 11 Chemical Bonding core. The 2s and three 2p orbitals mix to form four identical hybrid orbitals... Imagine a perfect tetrahedron."
                           </p>
                        </motion.div>
                     </div>
                  </div>
               </div>
               <div className="absolute -bottom-8 md:-bottom-12 left-6 md:left-10 px-6 md:px-8 py-3 md:py-5 bg-white shadow-xl border border-black/5 flex items-center gap-4">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-fluent-navy">System Live: 24/7 Grounding Autonomous</span>
               </div>
            </div>

            <div>
               <Badge color="gold" className="mb-10">Neural Architecture</Badge>
               <h2 className="text-4xl font-serif font-black text-fluent-navy tracking-tighter mb-12 leading-[1.1]">
                  AI That <span className="text-fluent-gold bg-clip-text">Retrieves.</span>
               </h2>
               <p className="text-xl md:text-2xl text-slate-700 mb-16 font-serif leading-relaxed border-l-4 border-fluent-gold/10 pl-10">
                  "Unlike generic LLMs, our Hierarchical RAG System is anchored in the verified Indian curriculum. It doesn't guess; it documents reality."
               </p>
               <div className="grid gap-12 md:gap-16">
                  {[
                    { n: "01", t: "Factual Precision", desc: "Direct retrieval from curriculum nodes ensures zero hallucination in high-stakes science core." },
                    { n: "02", t: "Pacing Scaffolding", desc: "Explanation complexity auto-adjusts based on the student's historical mastery index." },
                    { n: "03", t: "Syllabus Synthesis", desc: "Connects cross-chapter concepts across Maths and Physics in real-time discourse." }
                  ].map((f, i) => (
                    <div key={i} className="flex gap-8 md:gap-10 group">
                       <div className="text-2xl md:text-3xl font-serif font-black text-fluent-gold opacity-20 group-hover:opacity-100 transition-opacity duration-700">{f.n}</div>
                       <div>
                          <h4 className="text-xl md:text-2xl font-black text-fluent-navy mb-4 font-serif">{f.t}</h4>
                          <p className="text-sm md:text-base text-slate-400 font-serif leading-relaxed">{f.desc}</p>
                       </div>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>
      </section>


      {/* How it Works Section */}
      <section id="howitworks" className="py-12 md:py-16 px-8 bg-fluent-cream border-y border-black/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 md:mb-12">
             <Badge color="navy" className="mb-4">Operational Loop</Badge>
             <h2 className="text-4xl font-serif font-black text-fluent-navy tracking-tighter mb-10">How it Works.</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 md:gap-12">
             {[
               { n: "01", t: "Live Learning", desc: "High-precision cohort classes with British-trained Indian faculty." },
               { n: "02", t: "RAG Practice", desc: "24/7 conceptual grounding via Institutional AI Tutor." },
               { n: "03", t: "Lab Synthesis", desc: "Weekly mandatory discursive workshops in academic English." },
               { n: "04", t: "The Pulse", desc: "Rigorous weekly assessments mapping concept retention." },
               { n: "05", t: "Protocol Report", desc: "Full performance audit delivered securely to guardians." }
             ].map((step, i) => (
                <div key={i} className="relative group">
                   <div className="text-2xl md:text-3xl font-serif text-fluent-gold opacity-30 mb-6 font-black font-mono tracking-tighter">I.{step.n}</div>
                   <h4 className="text-base md:text-lg font-black text-fluent-navy mb-3 leading-snug font-serif">{step.t}</h4>
                   <p className="text-[10px] md:text-[11px] text-slate-600 leading-relaxed font-serif">{step.desc}</p>
                   <div className="mt-8 h-px w-8 bg-fluent-gold/30 group-hover:w-full transition-all duration-700" />
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section id="outcomeaudit" className="py-16 md:py-24 px-8 bg-fluent-navy text-white relative overflow-hidden">
        {/* Abstract background elements */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
           <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>
        <div className="absolute -right-20 top-0 w-96 h-96 bg-fluent-gold/5 blur-[120px] rounded-full" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 md:gap-16 items-start mb-16 md:mb-20">
             <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-4 mb-10">
                   <div className="h-px w-12 bg-fluent-gold" />
                   <Badge color="gold">Empirical Proof</Badge>
                </div>
                <h2 className="text-4xl font-serif font-black tracking-tighter leading-[1.1] mb-12">
                  Outcome<br /> 
                  <span className="font-light text-fluent-gold/80">Audit.</span>
                </h2>
                <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                   <div className="space-y-6">
                      <h4 className="text-fluent-gold text-[10px] font-black uppercase tracking-[0.4em] font-mono">Statistical Audit</h4>
                      <p className="text-white/60 text-lg font-serif leading-relaxed">
                         The "Fluent Protocol" is not a syllabus; it is an empirical framework designed to eliminate the ambiguity of learning. We measure the invisible metrics of academic growth.
                      </p>
                   </div>
                   <div className="space-y-6">
                      <h4 className="text-fluent-gold text-[10px] font-black uppercase tracking-[0.4em] font-mono">Precision Metrics</h4>
                      <p className="text-white/40 text-sm font-serif leading-relaxed">
                         By synthesising British pedagogical rigour with real-time RAG diagnostics, we ensure that every conceptual node is fully synthesised before the scholar advances.
                      </p>
                   </div>
                </div>
             </div>
             
             <div className="lg:col-span-5 lg:pl-12 lg:border-l border-white/5 py-8">
                <div className="p-8 md:p-10 border border-white/10 bg-white/[0.03] backdrop-blur-xl relative group">
                   <div className="absolute top-0 right-0 p-4 opacity-20">
                      <div className="w-8 h-8 border-t border-r border-white/40" />
                   </div>
                   <p className="text-white/80 text-lg md:text-xl font-serif leading-relaxed mb-12">
                      "Traditional tuition relies on hope. We rely on data. Every week, we deliver a full narrative audit of the scholar's cognitive trajectory."
                   </p>
                   <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-full bg-fluent-gold/20 flex items-center justify-center border border-fluent-gold/30">
                         <div className="w-2 h-2 rounded-full bg-fluent-gold animate-pulse" />
                      </div>
                      <div>
                         <div className="text-[10px] font-black uppercase tracking-widest text-fluent-gold">Verified Status</div>
                         <div className="text-sm font-serif text-white/70 font-bold">Institutional Grade Audit</div>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-white/10 md:divide-x divide-y md:divide-y-0 divide-white/10 bg-white/[0.02]">
             {[
               { val: "47%", label: "Grade Delta", detail: "Avg. improvement over 12 weeks of high-precision instruction." },
               { val: "92%", label: "Retention Rate", detail: "Verified via cross-domain cumulative recall protocols." },
               { val: "24/7", label: "Guardian Pulse", detail: "Real-time auditing access for parent stakeholders." }
             ].map((stat, i) => (
                <motion.div 
                   key={i} 
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   transition={{ delay: i * 0.2 }}
                   className="p-8 md:p-16 group hover:bg-white/[0.02] transition-colors duration-500"
                >
                   <div className="text-6xl md:text-8xl font-serif font-black text-white group-hover:text-fluent-gold transition-colors duration-700 leading-none mb-8">{stat.val}</div>
                   <div className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.5em] text-fluent-gold mb-6 font-mono">{stat.label}</div>
                   <p className="text-white/60 text-[11px] md:text-xs font-serif leading-relaxed max-w-[200px]">{stat.detail}</p>
                </motion.div>
             ))}
          </div>
        </div>
      </section>


      {/* Investment Plans Section */}
      <section id="investment" className="py-24 md:py-32 px-8 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <Badge color="gold" className="mb-8">Academic Enrollment 2026</Badge>
            <h2 className="text-5xl font-serif font-black tracking-tighter leading-none mb-10 text-fluent-navy">Admission Scenarios.</h2>
            <p className="text-xl text-slate-500 font-serif italic max-w-2xl mx-auto">Transparent investment in high-yield academic futures. No hidden costs. Pure performance focus.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                plan: "Guardian Protocol", 
                price: "₹8,500", 
                period: "per month",
                desc: "Ideal for self-driven scholars requiring AI grounding and teacher oversight.",
                features: ["AI Scaffolder Access 24/7", "Weekly Subject Pulse", "Parent Delta Dashboard", "RAG Curriculum Vault"]
              },
              { 
                plan: "Mastery Cohort", 
                price: "₹14,500", 
                period: "per month",
                highlight: true,
                desc: "The standard institutional sequence. Direct faculty instruction mixed with AI.",
                features: ["Small Batch Live Classes (Max 20)", "Priority British Faculty Training", "Personalized Neural Mapping", "Bi-weekly Synthesis Labs", "Everything in Guardian Protocol"]
              },
              { 
                plan: "Institutional Elite", 
                price: "Contact Board", 
                period: "custom sequence",
                desc: "Tailored for schools or elite groups requiring zero-gap outcome dominance.",
                features: ["Teacher Training Academy", "On-site Pedagogy Audit", "Custom RAG Knowledge Nodes", "School-wide Performance Pulse", "Full LMS White-labelling"]
              }
            ].map((p, i) => (
              <div key={i} className={`p-10 rounded-[40px] flex flex-col relative transition-all duration-700 ${p.highlight ? 'bg-fluent-navy text-white shadow-3xl shadow-fluent-navy/30 scale-105 z-20 hover:scale-110' : 'bg-white border border-black/5 hover:border-fluent-gold/30 hover:scale-105 shadow-xl'}`}>
                {p.highlight && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-fluent-gold text-fluent-navy text-[9px] font-black uppercase px-6 py-2 rounded-full tracking-[0.3em]">Institutional Choice</div>}
                
                <div className="mb-10">
                   <h4 className={`text-[10px] font-black uppercase tracking-[0.4em] mb-4 ${p.highlight ? 'text-fluent-gold' : 'text-slate-400'}`}>{p.plan}</h4>
                   <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-serif font-black tracking-tighter">{p.price}</span>
                      <span className={`text-[10px] font-bold uppercase ${p.highlight ? 'text-white/40' : 'text-slate-400'}`}>{p.period}</span>
                   </div>
                </div>

                <p className={`text-sm mb-10 font-serif italic leading-relaxed ${p.highlight ? 'text-white/60' : 'text-slate-500'}`}>{p.desc}</p>

                <div className="space-y-6 mb-12 flex-grow">
                   {p.features.map((f, j) => (
                     <div key={j} className="flex gap-4 items-start group">
                        <CheckCircle2 size={16} className={p.highlight ? 'text-fluent-gold' : 'text-fluent-teal'} />
                        <span className={`text-[11px] font-bold tracking-tight ${p.highlight ? 'text-white/80' : 'text-fluent-navy/80'}`}>{f}</span>
                     </div>
                   ))}
                </div>

                <Btn 
                   variant={p.highlight ? "primary" : "outline"} 
                   className={`w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest ${p.highlight ? 'bg-fluent-gold text-fluent-navy hover:bg-white' : ''}`}
                   onClick={() => setShowLeadModal(true)}
                >
                   {p.price === 'Contact Board' ? 'Initiate Inquiry' : 'Enroll Scholar'}
                </Btn>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 md:py-24 px-8 bg-fluent-navy text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#FFF 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-fluent-gold/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 md:gap-16 items-center">
             <div>
                <div className="inline-flex items-center gap-4 mb-10">
                   <div className="h-px w-8 bg-fluent-gold" />
                   <Badge color="gold">Final Enrollment Sequence</Badge>
                </div>
                <h2 className="text-4xl font-serif font-black tracking-tighter leading-[1.1] mb-12">
                   Secure the <br />
                   <span className="font-light text-fluent-gold">Scholar's Future.</span>
                </h2>
                <p className="text-lg md:text-xl text-white/50 mb-16 font-serif leading-relaxed max-w-xl">
                   Applications for the 2026 Academic Cohort are now being processed. We maintain strict enrollment caps to preserve our 12:1 instructional density.
                </p>
                <div className="flex flex-col sm:flex-row gap-8">
                   <Btn variant="primary" size="lg" className="px-16 py-6 bg-fluent-gold hover:bg-white text-fluent-navy text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl transition-all duration-700" onClick={() => setShowLeadModal(true)}>
                      Begin Admission Protocol
                   </Btn>
                   <div className="flex items-center gap-4 group cursor-pointer">
                      <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-fluent-gold transition-colors">
                         <div className="w-1.5 h-1.5 rounded-full bg-fluent-gold" />
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-white/40">Download Prospectus</div>
                   </div>
                </div>
             </div>

             <div className="relative mt-16 md:mt-0">
                <div className="p-8 md:p-12 border border-white/5 bg-white/[0.02] backdrop-blur-2xl relative">
                   <div className="absolute -top-4 -left-4 w-12 h-12 border-t border-l border-fluent-gold" />
                   <div className="space-y-12">
                      {[
                        { t: "Institutional Grade", d: "British masters overseeing every instructional node.", n: "01" },
                        { t: "Cognitive Security", d: "Zero-gap learning via AI-grounded retrieval.", n: "02" },
                        { t: "Global Readiness", d: "Synthesis-first focus for elite competitive mastery.", n: "03" }
                      ].map((item, i) => (
                        <div key={i} className="flex gap-8 group">
                    <div className="text-fluent-gold/30 text-2xl font-serif font-black font-mono group-hover:text-fluent-gold transition-colors duration-700">{item.n}</div>
                    <div>
                       <h4 className="text-lg font-serif font-black mb-2 text-white/95">{item.t}</h4>
                       <p className="text-[11px] text-white/60 font-serif leading-relaxed">{item.d}</p>
                    </div>
                        </div>
                      ))}
                   </div>
                </div>
                {/* Status Indicator */}
                <div className="mt-12 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
                   <div>Cohort Capacity: <span className="text-fluent-gold">82% Exhausted</span></div>
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      Live: Admissions Pulse
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 md:py-16 px-8 bg-fluent-cream border-t border-black/5 relative overflow-hidden">
         <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24">
               <div className="md:col-span-4">
                  <div className="mb-12">
                     <div className="font-serif font-black text-4xl tracking-tighter text-fluent-navy leading-none mb-6">
                        FLUENT&nbsp;&nbsp;&nbsp;INSTITUTE.
                     </div>
                     <div className="text-[10px] font-black uppercase tracking-[0.5em] text-fluent-gold">Institutional Trust</div>
                  </div>
                  <p className="text-base text-slate-700 leading-relaxed font-serif mb-12 max-w-sm">
                     "We do not teach subjects; we architect scholars. Our mission is the empirical synthesis of Indian potential and British pedagogical excellence."
                  </p>
                  <div className="flex gap-6">
                     {['Twitter', 'Linkedin', 'Instagram', 'Youtube'].map(social => (
                        <a key={social} href="#" className="w-10 h-10 rounded-full border border-black/5 flex items-center justify-center hover:border-fluent-gold hover:text-fluent-gold transition-all duration-500">
                           <div className="w-1.5 h-1.5 rounded-full bg-current" />
                        </a>
                     ))}
                  </div>
               </div>

                <div className="md:col-span-2">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 mb-10 font-mono">Archive</h4>
                   <ul className="space-y-6">
                     {['Academy Node', 'Faculty Pulse', 'Synthesis Lab', 'Audit Vault'].map(item => (
                       <li key={item}>
                         <a href="#" className="text-sm font-bold text-fluent-navy/80 hover:text-fluent-navy transition-all duration-500 font-serif">{item}</a>
                       </li>
                     ))}
                   </ul>
                </div>

                <div className="md:col-span-2">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 mb-10 font-mono">Technical</h4>
                   <ul className="space-y-6">
                     {['RAG System', 'Pedagogy Core', 'Neural Audit', 'Precision Reporting'].map(item => (
                       <li key={item}>
                         <a href="#" className="text-sm font-bold text-fluent-navy/80 hover:text-fluent-navy transition-all duration-500 font-serif">{item}</a>
                       </li>
                     ))}
                   </ul>
                </div>

               <div className="md:col-span-4">
                  <div className="p-8 border border-black/5 bg-white relative overflow-hidden group">
                     <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-fluent-gold mb-8 font-mono">Institutional Contact</h4>
                     <div className="space-y-8">
                        <div>
                           <div className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-2">Primary Protocol</div>
                           <a href="mailto:infofluent.academy@gmail.com" className="text-sm font-black text-fluent-navy hover:text-fluent-gold transition-colors font-serif">infofluent.academy@gmail.com</a>
                        </div>
                        <div>
                           <div className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-2">Direct Synthesis Support</div>
                           <a href="https://wa.me/447553886303" target="_blank" rel="no-referrer" className="text-sm font-black text-fluent-navy hover:text-fluent-gold transition-colors font-serif">+44 7553 886303 (WhatsApp)</a>
                        </div>
                        <div>
                           <div className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-2">Global Operations</div>
                           <div className="text-xs font-serif text-fluent-navy/80 leading-relaxed">
                               London Administrative Hub<br />
                               Bengaluru Research Campus
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="mt-16 md:mt-24 pt-12 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-12">
               <div className="flex items-center gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-fluent-gold" />
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">© 2026 FLUENT&nbsp;&nbsp;&nbsp;INSTITUTE. Institutional Trust • UK/India</div>
               </div>
               <div className="flex gap-12 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                  <a href="#" className="hover:text-fluent-navy transition-colors">Privacy Protocol</a>
                  <a href="#" className="hover:text-fluent-navy transition-colors">Service Standards</a>
                  <a href="#" className="hover:text-fluent-navy transition-colors">Digital Integrity</a>
               </div>
            </div>
         </div>
      </footer>

      {/* Lead Generation Modal */}
      <AnimatePresence>
        {showLeadModal && (
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLeadModal(false)} className="fixed inset-0 bg-fluent-navy/70 backdrop-blur-md" />
             <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-xl rounded-[32px] md:rounded-[40px] shadow-2xl overflow-hidden p-6 md:p-12 my-auto">
                <button onClick={() => setShowLeadModal(false)} className="absolute top-4 right-4 md:top-8 md:right-8 p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-400 z-10"><X size={20}/></button>
                <div className="mb-6 md:mb-8">
                   <Badge color="gold" className="mb-2">Admissions Open</Badge>
                   <h3 className="text-2xl md:text-3xl font-serif font-bold text-fluent-navy tracking-tight pr-10">Secure Scholar Slot</h3>
                </div>

                <form onSubmit={handleLeadSubmit} className="space-y-4 md:space-y-6 max-h-[60vh] overflow-y-auto px-1">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Academy/School Name</label>
                         <input required value={leadData.schoolName} onChange={e => setLeadData(d => ({...d, schoolName: e.target.value}))} className="w-full p-4 bg-slate-50 border border-black/5 rounded-xl text-sm" placeholder="Global Academy..." />
                      </div>
                      <div className="space-y-1">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Guardian/Lead Name</label>
                         <input required value={leadData.contactPerson} onChange={e => setLeadData(d => ({...d, contactPerson: e.target.value}))} className="w-full p-4 bg-slate-50 border border-black/5 rounded-xl text-sm" placeholder="Full Name..." />
                      </div>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Role</label>
                         <select value={leadData.designation} onChange={e => setLeadData(d => ({...d, designation: e.target.value}))} className="w-full p-4 bg-slate-50 border border-black/5 rounded-xl text-sm">
                            <option>Parent</option>
                            <option>Principal / Admin</option>
                            <option>Faculty Head</option>
                            <option>Other</option>
                         </select>
                      </div>
                      <div className="space-y-1">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Phone Number</label>
                         <input required value={leadData.phone} onChange={e => setLeadData(d => ({...d, phone: e.target.value}))} className="w-full p-4 bg-slate-50 border border-black/5 rounded-xl text-sm" placeholder="+91..." />
                      </div>
                   </div>

                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Priority Email</label>
                      <input required type="email" value={leadData.email} onChange={e => setLeadData(d => ({...d, email: e.target.value}))} className="w-full p-4 bg-slate-50 border border-black/5 rounded-xl text-sm" placeholder="scholar@academy.edu" />
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Student Count</label>
                         <input required value={leadData.studentCount} onChange={e => setLeadData(d => ({...d, studentCount: e.target.value}))} className="w-full p-4 bg-slate-50 border border-black/5 rounded-xl text-sm" placeholder="e.g. 1" />
                      </div>
                      <div className="space-y-1">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Cohort Batch</label>
                         <select value={leadData.classes} onChange={e => setLeadData(d => ({...d, classes: e.target.value}))} className="w-full p-4 bg-slate-50 border border-black/5 rounded-xl text-sm">
                            <option>Grade 9</option>
                            <option>Grade 10</option>
                            <option>Grade 11</option>
                            <option>Grade 12</option>
                         </select>
                      </div>
                   </div>

                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Primary Subject Interest</label>
                      <select value={(leadData as any).subject} onChange={e => setLeadData(d => ({...d, subject: e.target.value}))} className="w-full p-4 bg-slate-50 border border-black/5 rounded-xl text-sm">
                         <option>Physics</option>
                         <option>Mathematics</option>
                         <option>Chemistry</option>
                         <option>Biology</option>
                         <option>English</option>
                         <option>Full Academic Sequence</option>
                      </select>
                   </div>

                   <Btn type="submit" variant="primary" className="w-full py-5 text-sm font-black uppercase tracking-widest rounded-2xl" disabled={isSubmittingLead}>
                      {isSubmittingLead ? "TRANSMITTING..." : "SUBMIT DEMO REQUEST ✦"}
                   </Btn>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Success Notification */}
      <AnimatePresence>
        {waitlistSuccess && (
          <motion.div 
            initial={{ opacity: 0, x: 20, y: 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-4 inset-x-4 md:bottom-10 md:right-10 md:left-auto z-[200]"
          >
             <div className="bg-fluent-navy text-white p-6 md:p-10 shadow-2xl border-l-4 border-fluent-gold max-w-lg mx-auto md:mx-0 overflow-hidden">
                <div className="flex flex-col sm:flex-row items-baseline sm:items-center gap-4 md:gap-10">
                   <div className="text-[9px] md:text-[10px] font-black tracking-[0.5em] text-fluent-gold font-mono shrink-0">SUCCESS</div>
                   <div className="flex-1">
                      <h4 className="text-lg md:text-2xl font-serif font-black mb-1">Request Logged.</h4>
                      <p className="text-white/70 text-xs md:text-sm font-serif">Institutional board will reach out for audit.</p>
                   </div>
                   <button 
                     onClick={() => setWaitlistSuccess(false)} 
                     className="opacity-40 hover:opacity-100 transition-opacity uppercase text-[9px] font-black tracking-widest border-b border-white/20 whitespace-nowrap mt-2 sm:mt-0 self-end sm:self-auto"
                   >
                     Close
                   </button>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
