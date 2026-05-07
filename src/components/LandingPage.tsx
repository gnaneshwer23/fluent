import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Sparkles, Target, Zap, ShieldCheck, Award, Users, BookOpen, GraduationCap, UserCheck, LayoutDashboard, Settings } from 'lucide-react';
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
  const [selectedRole, setSelectedRole] = useState<'parent' | 'student' | 'teacher' | 'head'>('parent');

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
    <div className="min-h-screen bg-fluent-cream selection:bg-fluent-gold/30">
      <nav className="fixed top-0 w-full z-50 px-6 py-8 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-black/5 md:bg-transparent md:backdrop-blur-none md:border-none">
        <Logo onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
        
        <div className="hidden lg:flex gap-10 items-center">
          {["Benefits", "Programs", "Methodology", "Pricing"].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-fluent-navy transition-colors">{item}</a>
          ))}
        </div>

        <div className="flex gap-4 items-center">
          <Btn variant="primary" size="sm" className="shadow-2xl shadow-fluent-navy/20 px-8 rounded-lg bg-fluent-navy hover:bg-fluent-navy/90 text-[11px] font-bold" onClick={handleLogin} disabled={isLoggingIn}>
            {isLoggingIn ? "Authenticating..." : "Register Now"}
          </Btn>
        </div>
      </nav>

      <main>
        <section className="relative pt-44 pb-32 px-6 overflow-hidden">
          {/* Decorative background */}
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
            <div className="absolute top-1/4 right-0 w-96 h-96 bg-fluent-teal/20 blur-[100px] rounded-full" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fluent-gold/20 blur-[100px] rounded-full" />
          </div>

          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.8 }}
            >
              <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-fluent-gold/20 bg-fluent-gold/5">
                <div className="w-1.5 h-1.5 rounded-full bg-fluent-gold animate-pulse opacity-80" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-fluent-gold">World-Class Virtual Schooling</span>
              </div>

              <h1 className="text-7xl md:text-8xl font-serif font-bold tracking-tight text-fluent-navy mb-8 leading-[0.95]">
                From Low <br />
                <span className="italic font-normal text-fluent-navy/90">Confidence</span> <br />
                to <span className="text-fluent-navy">High Performance.</span>
              </h1>
              
              <p className="text-xl text-slate-500 max-w-lg mb-10 leading-relaxed font-medium">
                Learn using elite British teaching methods while building confidence, communication, and academic success for the global stage.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Btn variant="primary" size="lg" className="px-12 py-5 shadow-2xl shadow-fluent-navy/20 bg-fluent-navy hover:bg-fluent-navy/95 transition-all text-sm font-bold uppercase tracking-widest rounded-xl" onClick={handleLogin} disabled={isLoggingIn}>
                  {isLoggingIn ? "Authenticating..." : "Join the Academy"}
                </Btn>
              </div>

              <div className="flex items-center gap-4">
                 <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=student-${i}`} alt="user" className="w-full h-full object-cover" />
                      </div>
                    ))}
                 </div>
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span className="text-fluent-navy">1.2k+</span> Scholars currently synthesising
                 </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative lg:pl-12"
            >
              <div className="relative z-10 w-full max-w-md mx-auto lg:ml-auto">
                 <div className="bg-fluent-navy p-10 rounded-[40px] shadow-2xl shadow-fluent-navy/30 relative overflow-hidden ring-1 ring-white/10">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                       <Zap className="text-white" size={120} />
                    </div>

                    <div className="relative z-10 space-y-10">
                       <div className="space-y-2">
                          <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-fluent-gold" />
                             <span className="text-[10px] font-black text-fluent-gold uppercase tracking-[0.3em]">Elite Mastery Tracking</span>
                          </div>
                          <h3 className="text-3xl font-serif text-white font-bold">Scholar Insights</h3>
                       </div>

                       <div className="space-y-8">
                          {[
                            { name: 'Mathematics', progress: 94, color: 'bg-fluent-teal' },
                            { name: 'Science (Bio, Phys, Chem)', progress: 89, color: 'bg-fluent-gold' },
                            { name: 'English Literature', progress: 97, color: 'bg-white' }
                          ].map(subject => (
                            <div key={subject.name} className="space-y-3">
                               <div className="flex justify-between items-end">
                                  <span className="text-white font-serif text-lg">{subject.name}</span>
                                  <span className="text-fluent-gold font-bold text-sm tracking-widest">{subject.progress}%</span>
                               </div>
                               <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${subject.progress}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className={`h-full ${subject.color}`} 
                                  />
                               </div>
                            </div>
                          ))}
                       </div>

                       <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                <Users size={14} className="text-white" />
                             </div>
                             <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Synthesis Cohort A-1</div>
                          </div>
                          <div className="text-[10px] font-bold text-fluent-teal uppercase tracking-widest">Live Updates</div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Background decorative elements */}
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-fluent-gold/10 blur-[100px] rounded-full pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-fluent-teal/10 blur-[100px] rounded-full pointer-events-none" />
            </motion.div>
          </div>
        </section>

        <section id="diagnosis" className="py-24 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em] mb-4">Diagnosis</div>
              <h2 className="text-5xl font-serif font-bold text-fluent-navy">Is Your Child Struggling?</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                "Afraid to answer in class",
                "Low academic confidence",
                "Stagnant marks & grades",
                "Memorises without understanding"
              ].map((problem, i) => (
                <Card key={i} className="p-8 border-black/5 flex flex-col items-center text-center group hover:bg-fluent-navy transition-all duration-500">
                   <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-6 group-hover:bg-white/10 group-hover:text-white">
                      <Target size={20} />
                   </div>
                   <p className="font-serif text-lg font-bold text-fluent-navy group-hover:text-white">{problem}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="methodology" className="py-32 px-6 bg-fluent-cream/30">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
               <div>
                  <div className="text-[10px] font-black text-fluent-teal uppercase tracking-[0.4em] mb-6">The Synthesis Solution</div>
                  <h2 className="text-6xl font-serif font-bold text-fluent-navy mb-8 leading-tight">
                    A New Way of <br />
                    <span className="italic font-normal">Learning.</span>
                  </h2>
                  <div className="space-y-6">
                    {[
                      { icon: <BookOpen className="text-fluent-teal" />, title: "Concept Learning", desc: "Understand deeply instead of memorising. Focus on the core 'why' behind every theorem and rule." },
                      { icon: <Zap className="text-fluent-gold" />, title: "AI-Powered Support", desc: "Personalised practice nodes and 24/7 doubt solving powered by adaptive scaffolding." },
                      { icon: <Target className="text-fluent-navy" />, title: "Confidence Training", desc: "Speak clearly and answer confidently in any global classroom setting." }
                    ].map((item, i) => (
                      <div key={i} className="flex gap-6 group">
                         <div className="w-12 h-12 shrink-0 rounded-2xl bg-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            {item.icon}
                         </div>
                         <div>
                            <h3 className="font-serif font-bold text-xl text-fluent-navy mb-1">{item.title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                         </div>
                      </div>
                    ))}
                  </div>
               </div>
               <div className="relative">
                  <div className="bg-fluent-navy rounded-[40px] p-2 overflow-hidden shadow-2xl">
                    <img 
                      src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" 
                      alt="Collaborative Learning" 
                      className="rounded-[36px] w-full h-[600px] object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-3xl shadow-2xl border border-black/5 max-w-xs">
                     <p className="italic font-serif text-lg text-fluent-navy mb-4">“Our scholars don't just learn; they find their voice.”</p>
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-fluent-gold/20" />
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Academy Provost</div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </section>

        <section id="benefits" className="py-32 px-6">
          <div className="max-w-7xl mx-auto border-y border-black/5 py-24">
            <h2 className="text-center text-4xl font-serif font-bold text-fluent-navy mb-20">What Makes Us Different</h2>
            <div className="grid md:grid-cols-3 gap-16">
               {[
                 { title: "British Teaching Methods", desc: "Interactive and concept-based learning protocols derived from top UK independent schools." },
                 { title: "UK-Based Educators", desc: "Access the same faculty that prepares students for the world's most competitive exams." },
                 { title: "Weekly Accountability", desc: "Deep-dive progress tracking and parent transparency reports delivered every Monday." }
               ].map((usp, i) => (
                 <div key={i} className="text-center">
                    <div className="text-fluent-gold font-serif text-6xl mb-6 opacity-20">0{i+1}</div>
                    <h3 className="text-2xl font-serif font-bold text-fluent-navy mb-4">{usp.title}</h3>
                    <p className="text-slate-500 leading-relaxed">{usp.desc}</p>
                 </div>
               ))}
            </div>
          </div>
        </section>

        <section className="py-32 px-6 bg-fluent-navy text-white overflow-hidden">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-20">
             <div className="md:w-1/2 space-y-10">
                <div className="text-[10px] font-black text-fluent-gold uppercase tracking-[0.4em]">Personalised Growth</div>
                <h2 className="text-6xl font-serif font-bold leading-tight italic">We build <br /> Confidence.</h2>
                <ul className="space-y-6">
                  {["Answer confidently in class", "Speak clearly with perfect articulation", "Present complex ideas with ease", "Think independently for better solutions"].map((point, i) => (
                    <li key={i} className="flex items-center gap-4 text-xl text-white/70 font-serif">
                       <span className="w-2 h-2 rounded-full bg-fluent-gold" />
                       {point}
                    </li>
                  ))}
                </ul>
                <div className="p-8 bg-white/5 border-l-4 border-fluent-teal rounded-r-2xl backdrop-blur-sm">
                   <p className="text-lg italic font-serif">“Your child will not just learn, they will speak confidently on the global stage.”</p>
                </div>
             </div>
             <div className="md:w-1/2 relative">
                <div className="bg-white/10 p-4 rounded-[40px] rotate-3 hover:rotate-0 transition-transform duration-700">
                  <img 
                    src="https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=2070&auto=format&fit=crop" 
                    alt="Confidence in Action" 
                    className="rounded-[32px] w-full h-[500px] object-cover"
                  />
                </div>
             </div>
          </div>
        </section>

        <section id="programs" className="py-32 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-serif font-bold text-fluent-navy">How It Works</h2>
          </div>
          <div className="flex flex-wrap justify-between items-center gap-8 relative">
             <div className="absolute top-1/2 left-0 w-full h-px bg-black/5 -z-10 hidden lg:block" />
             {["Learn", "Practice", "Test", "Report"].map((step, i) => (
               <div key={i} className="flex flex-col items-center group">
                  <div className="w-24 h-24 bg-white border border-black/5 rounded-full flex items-center justify-center text-3xl font-serif font-bold text-fluent-navy shadow-lg group-hover:bg-fluent-navy group-hover:text-white transition-all duration-500 mb-6 relative">
                     {i + 1}
                     <div className="absolute -inset-2 rounded-full border border-fluent-teal opacity-0 group-hover:opacity-40 transition-opacity animate-pulse" />
                  </div>
                  <p className="font-black text-sm uppercase tracking-widest text-slate-400 group-hover:text-fluent-navy transition-colors">{step}</p>
               </div>
             ))}
          </div>
        </section>

        <section id="portals" className="py-32 px-6 bg-fluent-cream/50">
          <div className="max-w-7xl mx-auto">
            <div className="mb-20">
              <h2 className="text-7xl md:text-8xl font-serif font-bold tracking-tight text-fluent-navy mb-6 leading-none">
                Access Your <br />
                <span className="italic font-normal text-fluent-navy/90">Academic Hub.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Student Portal', icon: <GraduationCap size={24} />, color: 'bg-fluent-navy' },
                { title: 'Parent Dashboard', icon: <UserCheck size={24} />, color: 'bg-[#0f172a]' },
                { title: 'Faculty Hub', icon: <BookOpen size={24} />, color: 'bg-fluent-gold' },
                { title: 'Admin Command', icon: <Settings size={24} />, color: 'bg-fluent-navy' }
              ].map((portal) => (
                <Card key={portal.title} hover className="p-10 flex flex-col h-full rounded-[40px] border-none shadow-sm transition-all duration-500" onClick={handleLogin}>
                  <div className={`w-14 h-14 ${portal.color} text-white rounded-2xl flex items-center justify-center mb-10 shadow-lg`}>
                    {portal.icon}
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-fluent-navy mb-12">{portal.title}</h3>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-fluent-navy group cursor-pointer mt-auto">
                    Enter Node <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="py-32 px-6 bg-fluent-cream/30">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-center text-5xl font-serif font-bold text-fluent-navy mb-20 italic">Strategic Enrolment</h2>
            <div className="grid md:grid-cols-3 gap-8">
               {[
                 { tier: "Starter", price: "₹2,999", features: ["Core Subject Access", "Weekly Group Sessions", "Digital Library Credits"] },
                 { tier: "Standard", price: "₹3,999", features: ["All Subjects Included", "3x Live Guided Support", "AI Adaptive Pathway", "Monthly Parent Audit"], highlighted: true },
                 { tier: "Premium", price: "₹6,000+", features: ["Private 1:1 Faculty Time", "Custom Synthesis Reports", "Priority Exam Prep", "Direct Provost Access"] }
               ].map((plan, i) => (
                 <Card key={i} className={`p-12 flex flex-col items-center text-center transition-all duration-500 ${plan.highlighted ? 'border-fluent-teal border-2 ring-8 ring-fluent-teal/5 scale-105 z-10' : 'border-black/5 hover:border-fluent-gold/20'}`}>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-4">{plan.tier}</h3>
                    <div className="text-5xl font-serif font-bold text-fluent-navy mb-8">{plan.price}<span className="text-sm font-sans font-medium text-slate-400">/mo</span></div>
                    <ul className="space-y-4 mb-12 flex-1 w-full text-left">
                       {plan.features.map((f, j) => (
                         <li key={j} className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                            <ShieldCheck size={16} className="text-fluent-teal" /> {f}
                         </li>
                       ))}
                    </ul>
                    <Btn variant={plan.highlighted ? "primary" : "outline"} className="w-full py-4 rounded-xl font-bold uppercase tracking-widest text-[10px]" onClick={handleLogin}>
                       Choose Plan
                    </Btn>
                 </Card>
               ))}
            </div>
          </div>
        </section>
      </main>

      <section className="bg-fluent-navy text-white text-center py-32 px-6">
        <h2 className="text-5xl font-serif font-bold mb-10 italic">
          Give Your Child <br /> <span className="text-fluent-gold">Confidence for Life.</span>
        </h2>
        <Btn variant="gold" size="lg" className="px-16 py-6 shadow-2xl shadow-fluent-gold/20" onClick={handleLogin}>
          Book Free Demo
        </Btn>
      </section>

      <footer className="py-24 px-6 border-t border-black/5 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">
           <div className="col-span-2">
              <Logo className="mb-6" />
              <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
                 Accountable Hindustan: Synthesising British instructional excellence with adaptive technology for global academic mastery.
              </p>
           </div>
           
           <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-fluent-navy mb-6">Programs</h4>
              <ul className="space-y-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                 <li><a href="#methodology" className="hover:text-fluent-teal transition-colors underline-offset-4 hover:underline">Science Synthesis</a></li>
                 <li><a href="#methodology" className="hover:text-fluent-teal transition-colors underline-offset-4 hover:underline">Maths Mastery</a></li>
                 <li><a href="#methodology" className="hover:text-fluent-teal transition-colors underline-offset-4 hover:underline">English Protocol</a></li>
              </ul>
           </div>

           <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-fluent-navy mb-6">Support</h4>
              <ul className="space-y-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                 <li><a href="#" className="hover:text-fluent-teal transition-colors underline-offset-4 hover:underline">Help Centre</a></li>
                 <li><a href="#" className="hover:text-fluent-teal transition-colors underline-offset-4 hover:underline">Parent Access</a></li>
                 <li><a href="#" className="hover:text-fluent-teal transition-colors underline-offset-4 hover:underline">Demo Booking</a></li>
              </ul>
           </div>

           <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-fluent-navy mb-6">Legal</h4>
              <ul className="space-y-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                 <li><a href="#" className="hover:text-fluent-teal transition-colors underline-offset-4 hover:underline">Privacy Rules</a></li>
                 <li><a href="#" className="hover:text-fluent-teal transition-colors underline-offset-4 hover:underline">Academy Terms</a></li>
              </ul>
           </div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 pt-8 border-t border-black/5">
           <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">© 2026 Accountable Hindustan • British Pedagogy</div>
           <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <span>London, UK</span>
              <span>Dubai, UAE</span>
              <span>Singapore, SG</span>
           </div>
        </div>
      </footer>
    </div>
  );
};
