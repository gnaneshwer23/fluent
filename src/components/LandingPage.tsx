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
            {["Benefits", "Methodology"].map(item => (
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
        <section className="relative pt-24 pb-16 md:pt-44 md:pb-32 px-6 md:px-8 overflow-hidden min-h-[80vh] md:min-h-[90vh] flex items-center bg-fluent-cream">
          {/* Architectural Background elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
             <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50/50 skew-x-[-12deg] translate-x-1/4" />
             <div className="absolute top-[20%] left-[-10%] w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-fluent-gold/10 blur-[80px] md:blur-[120px] rounded-full animate-pulse" />
          </div>

          <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 md:gap-20 items-center relative z-10">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="max-w-2xl"
            >
              <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl lg:text-[100px] font-serif font-bold tracking-tight mb-8 md:mb-12 leading-[0.9]">
                Master the <br />
                <span className="italic font-light text-fluent-navy/50">Global</span><br />
                <span className="text-fluent-teal">Standard.</span>
              </motion.h1>
              
              <motion.p variants={itemVariants} className="text-lg md:text-xl lg:text-2xl text-slate-600 max-w-lg mb-10 md:mb-16 leading-relaxed font-light font-serif italic">
                A synthesis of British pedagogical precision and adaptive technology, architected for the elite scholar cohort.
              </motion.p>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 mb-16">
                <Btn variant="primary" size="lg" className="px-10 py-5 bg-fluent-navy hover:bg-fluent-navy/90 rounded-full text-[10px] font-black uppercase tracking-[0.2em]" onClick={handleLogin} disabled={isLoggingIn}>
                  {isLoggingIn ? "Authenticating..." : "Establish Access"}
                </Btn>
              </motion.div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative"
            >
                  <img 
                    src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop" 
                    alt="Scholar Excellence" 
                    className="rounded-[64px] w-full h-[500px] lg:h-[600px] object-cover shadow-2xl"
                    referrerPolicy="no-referrer"
                  />
            </motion.div>
          </div>
        </section>

        <div className="py-12 bg-fluent-gold/10 overflow-hidden">
           <motion.div 
             className="flex whitespace-nowrap"
             animate={{ x: ["0%", "-50%"] }}
             transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
           >
             {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-20 px-10 items-center">
                  {["AI Doubt Solver", "Weekly Parent Reports", "Live UK Educators", "Concept Mastery", "Confidence Coaching", "Get Training and Teach your Students by British Trained Teachers"].map((text, j) => (
                    <span key={j} className="text-fluent-navy font-black tracking-widest uppercase text-xs flex gap-20 items-center">
                       {text} <span className="text-fluent-gold">✦</span>
                    </span>
                  ))}
                </div>
             ))}
           </motion.div>
        </div>

        <section id="diagnosis" className="py-16 md:py-24 px-6 md:px-8 bg-white relative overflow-hidden">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent to-black/5" />
          
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 md:gap-20 items-center mb-16">
              <div>
                <div className="text-[10px] font-black text-red-500 uppercase tracking-[0.5em] mb-4 font-mono">Status Audit: CRITICAL</div>
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-fluent-navy leading-[0.9] mb-6 tracking-tight">
                  Identifying the <br />
                  <span className="italic font-light text-red-500/80">Quiet Barriers.</span>
                </h2>
                <p className="text-base md:text-lg text-slate-500 leading-relaxed max-w-lg mb-8 font-serif opacity-80">
                  Academic stagnation is rarely a lack of effort. It is almost always a structural failure in confidence and methodology.
                </p>
                <div className="p-6 md:p-8 bg-fluent-navy text-white rounded-[24px] md:rounded-[32px]">
                   <h4 className="text-lg md:text-xl font-bold font-serif mb-4 italic">Core Insight</h4>
                   <p className="text-white/80 leading-relaxed text-sm md:text-base">"Students do not fail due to lack of intelligence—they struggle due to lack of structured learning, confidence training, and effective teaching systems."</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Rote Obsession", desc: "Overemphasis on memorisation over understanding.", code: "ROT-001" },
                  { label: "Conceptual Gap", desc: "Lack of clarity in core Science/Maths/English.", code: "GAP-100" },
                  { label: "Confidence Deficit", desc: "Poor participation and vocal skills.", code: "CNF-000" },
                  { label: "Visibility Gap", desc: "No accountability or parent-teacher visibility.", code: "OPA-404" }
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

        <section id="differentiation" className="py-24 px-8 bg-slate-50">
           <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-center mb-24 gap-6">
                <h2 className="text-5xl font-serif font-bold text-fluent-navy tracking-tight">The Academy Advantage</h2>
                <div className="h-px bg-fluent-navy/20 flex-grow mx-10" />
                <div className="text-[10px] font-black text-fluent-teal uppercase tracking-[0.3em]">Systemic Distinction</div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-12">
                 <div className="space-y-8">
                    <h3 className="text-2xl font-serif font-bold text-slate-900 border-b border-slate-200 pb-4">Traditional Models</h3>
                    <ul className="space-y-4">
                       {['Content-limited, reactive pedagogy', 'Fragmented feedback loops', 'No systemic teacher training', 'No performance visibility', 'Individual-based approach'].map(item => (
                          <li key={item} className="flex gap-4 p-4 rounded-xl bg-slate-100 text-slate-500 font-medium text-sm"><span>❌</span> {item}</li>
                       ))}
                    </ul>
                 </div>
                 <div className="space-y-8 p-10 rounded-[32px] bg-fluent-navy text-white">
                    <h3 className="text-2xl font-serif font-bold text-white border-b border-white/20 pb-4">Fluent Academy</h3>
                    <ul className="space-y-4">
                       {['Learning + Training Integrated', 'Data-driven, proactive synthesis', 'Continuous faculty evolution', 'Full systemic transparency', 'Scalable ecosystem approach'].map(item => (
                          <li key={item} className="flex gap-4 p-4 rounded-xl bg-white/10 text-white font-bold text-sm"><span>✅</span> {item}</li>
                       ))}
                    </ul>
                 </div>
              </div>
           </div>
        </section>



        <section id="how-it-works" className="py-24 px-8 bg-fluent-cream">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-6xl font-serif font-bold text-fluent-navy mb-20 tracking-tight">How it works</h2>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { n: "1", title: "Learn", desc: "Concept-first lessons with UK educators." },
                { n: "2", title: "Practice", desc: "AI tutor adapts daily to your child's level." },
                { n: "3", title: "Test", desc: "Weekly assessments — written and oral." },
                { n: "4", title: "Report", desc: "Parents receive a Sunday progress brief." }
              ].map((step, i) => (
                <Card key={i} className="p-10 rounded-[32px] border-none shadow-sm hover:shadow-xl transition-shadow">
                  <div className="w-16 h-16 rounded-full bg-fluent-navy text-white flex items-center justify-center text-2xl font-bold mb-8">{step.n}</div>
                  <h3 className="text-2xl font-serif font-bold text-fluent-navy mb-4">{step.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{step.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="outcome" className="py-24 px-8 bg-white">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2070&auto=format&fit=crop" className="rounded-[40px]" alt="Confidence" referrerPolicy="no-referrer" />
            <div>
              <h2 className="text-6xl font-serif font-bold text-fluent-navy mb-10 tracking-tight">We build <span className="italic">confidence</span> — not just marks.</h2>
              <ul className="space-y-4 mb-10">
                {['Answer confidently', 'Speak clearly', 'Present ideas', 'Think independently'].map(f => (
                  <li key={f} className="flex items-center gap-3 text-lg text-fluent-navy font-medium"><div className="w-2 h-2 rounded-full bg-fluent-teal" /> {f}</li>
                ))}
              </ul>
              <p className="italic font-serif text-xl border-l-4 border-fluent-gold pl-6 py-2">“Your child won't just learn — they'll speak, present and lead with confidence.”</p>
            </div>
          </div>
        </section>




        <section id="pricing" className="py-24 px-8 bg-white relative">
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

        <section id="testimonials" className="py-24 px-8 bg-fluent-navy text-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-6xl font-serif font-bold mb-20 tracking-tight">What parents <span className="italic font-light text-fluent-gold">say.</span></h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { quote: "My child gained real confidence in just four weeks. He now volunteers in class.", name: "Priya M.", role: "Parent · Mumbai" },
                { quote: "Marks improved, but more importantly her thinking is sharper. Worth every rupee.", name: "Rahul K.", role: "Parent · Bengaluru" },
                { quote: "Best decision we made for our daughter's education. The Sunday reports are gold.", name: "Anita S.", role: "Parent · Delhi" }
              ].map((t, i) => (
                <Card key={i} className="p-10 rounded-[32px] bg-white/5 border-white/10">
                  <div className="text-fluent-gold mb-6">★★★★★</div>
                  <p className="text-lg font-serif italic mb-8 leading-relaxed">“{t.quote}”</p>
                  <div className="font-bold">{t.name}</div>
                  <div className="text-slate-400 text-sm">{t.role}</div>
                </Card>
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

      <footer className="py-20 px-8 border-t border-black/5 bg-fluent-navy text-white relative overflow-hidden">
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
