import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Sparkles, Target, Zap, ShieldCheck, Award, Users, BookOpen, GraduationCap, UserCheck, LayoutDashboard, Settings } from 'lucide-react';
import { Logo, Btn, Badge, Card } from './UI';
import { db, auth } from '../lib/firebaseInit';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';

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
          {["Benefits", "Voices", "Portals"].map(item => (
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
                <div className="w-1.5 h-1.5 rounded-full bg-fluent-gold animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-fluent-gold">World-Class Virtual Schooling</span>
              </div>

              <h1 className="text-7xl md:text-8xl font-serif font-bold tracking-tight text-fluent-navy mb-8 leading-[0.95]">
                Learn <br />
                <span className="italic font-normal text-fluent-navy/90">Science, Maths,</span> <br />
                <span className="italic font-normal text-fluent-navy/90">and English</span> <br />
                with <span className="text-fluent-navy">Precision.</span>
              </h1>
              
              <p className="text-xl text-slate-500 max-w-lg mb-10 leading-relaxed font-medium">
                Synthesising elite British pedagogy with adaptive tracking to ensure global academic mastery.
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

        <section id="portals" className="py-32 px-6 bg-fluent-cream/50">
          <div className="max-w-7xl mx-auto">
            <div className="mb-20">
              <h2 className="text-7xl md:text-8xl font-serif font-bold tracking-tight text-fluent-navy mb-6 leading-none">
                Access Your <br />
                <span className="italic font-normal text-fluent-navy/90">Academic Hub.</span>
              </h2>
              <p className="text-2xl text-slate-400 max-w-xl font-medium">
                Specialised dashboards for the entire educational ecosystem.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  id: 'student',
                  title: 'Student Portal',
                  desc: 'Live British-tutor sessions and mastery tracking across Mathematics, Science, and English.',
                  icon: <GraduationCap className="text-white" size={24} />,
                  bgColor: 'bg-fluent-navy'
                },
                {
                  id: 'parent',
                  title: 'Parent Dashboard',
                  desc: 'Multi-child monitoring, feedback loops, and private academic consultation scheduling.',
                  icon: <UserCheck className="text-white" size={24} />,
                  bgColor: 'bg-[#0f172a]'
                },
                {
                  id: 'teacher',
                  title: 'Faculty Hub',
                  desc: 'Advanced cohort management and curriculum delivery tools for expert educators.',
                  icon: <BookOpen className="text-white" size={24} />,
                  bgColor: 'bg-fluent-gold'
                },
                {
                  id: 'admin',
                  title: 'Admin Command',
                  desc: 'High-level institutional insights, staff performance, and system configuration.',
                  icon: <ShieldCheck className="text-white" size={24} />,
                  bgColor: 'bg-fluent-navy'
                }
              ].map((portal) => (
                <Card 
                  key={portal.title} 
                  hover 
                  className="p-10 flex flex-col h-full rounded-[40px] border-none shadow-sm hover:shadow-2xl hover:shadow-black/5 transition-all duration-500"
                  onClick={handleLogin}
                >
                  <div className={`w-14 h-14 ${portal.bgColor} rounded-2xl flex items-center justify-center mb-10 shadow-lg`}>
                    {portal.icon}
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-fluent-navy mb-4">{portal.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-12 flex-1">{portal.desc}</p>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-fluent-navy group cursor-pointer">
                    Enter Node <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="benefits" className="py-24 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-[10px] font-black text-fluent-teal uppercase tracking-[0.4em] mb-4">Precision Pedagogy</div>
            <h2 className="text-4xl font-serif font-bold text-fluent-navy italic">Engineered for Excellence</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center sm:text-left">
            <Card id="faculty" className="p-10 border-black/5 group hover:border-fluent-gold/20 transition-all duration-500">
              <div className="w-14 h-14 bg-fluent-gold/10 text-fluent-gold rounded-2xl flex items-center justify-center mb-8 group-hover:bg-fluent-gold group-hover:text-white transition-all">
                <Target size={28} />
              </div>
              <h3 className="text-xl font-serif font-bold mb-4">Expert British Faculty</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Instruction delivered by veterans of top British schools and examination boards with decades of synthesis.</p>
            </Card>

            <Card id="curriculum" className="p-10 border-black/5 group hover:border-fluent-teal/20 transition-all duration-500">
              <div className="w-14 h-14 bg-fluent-teal/10 text-fluent-teal rounded-2xl flex items-center justify-center mb-8 group-hover:bg-fluent-teal group-hover:text-white transition-all">
                <Zap size={28} />
              </div>
              <h3 className="text-xl font-serif font-bold mb-4">Adaptive Curriculum</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Real-time scaffolding that identifies conceptual gaps and updates your learning path instantly.</p>
            </Card>

            <Card className="p-10 border-black/5 group hover:shadow-xl transition-all duration-500">
              <div className="w-14 h-14 bg-fluent-navy/5 text-fluent-navy rounded-2xl flex items-center justify-center mb-8 group-hover:bg-fluent-navy group-hover:text-white transition-all">
                <Users size={28} />
              </div>
              <h3 className="text-xl font-serif font-bold mb-4">Mastery Protocol</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Unified oversight for students, parents, and faculty to ensure no student is left behind.</p>
            </Card>
          </div>
        </section>

        <section id="voices" className="py-32 px-6 bg-black text-white relative overflow-hidden">
           <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
           </div>

           <div className="max-w-4xl mx-auto relative z-10 text-center">
              <div className="text-[10px] font-black text-fluent-teal uppercase tracking-[0.6em] mb-12">Priority Intake 2026</div>
              
              <h2 className="text-6xl md:text-8xl font-serif font-bold mb-12 leading-[0.9]">
                Ready to help your <br />
                <span className="italic font-normal text-white/40 italic block mt-2 underline decoration-white/10">child learn better?</span>
              </h2>

              <p className="text-xl text-white/50 mb-16 leading-relaxed max-w-2xl mx-auto">
                Join FLUENT today and give students access to live, guided lessons in Science, Maths, and English with experienced British school-trained teachers.
              </p>

              <div className="flex flex-wrap justify-center gap-4 mb-16">
                {(['parent', 'student', 'teacher', 'head'] as const).map((role) => (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
                      selectedRole === role 
                        ? 'bg-white text-black border-white shadow-[0_0_40px_rgba(255,255,255,0.2)]' 
                        : 'text-white/40 border-white/10 hover:border-white/30'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>

              <div className="max-w-xl mx-auto">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-fluent-teal to-fluent-gold rounded-[32px] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                  <form 
                    onSubmit={handleWaitlist}
                    className="relative flex flex-col md:flex-row p-2 bg-[#0a0a0a] border border-white/10 rounded-[32px] overflow-hidden"
                  >
                    <input 
                      type="email"
                      required
                      placeholder={`${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} email address...`}
                      className="flex-1 bg-transparent px-8 py-5 outline-none text-white font-medium"
                      value={waitlistEmail}
                      onChange={(e) => setWaitlistEmail(e.target.value)}
                    />
                    <Btn 
                      type="submit"
                      variant="primary" 
                      className="bg-fluent-teal hover:bg-fluent-teal/90 text-white border-none px-10 py-5 rounded-[24px] uppercase text-[10px] font-black tracking-widest shadow-xl"
                    >
                      Request Access
                    </Btn>
                  </form>
                </div>
                {waitlistSuccess && (
                  <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-fluent-teal font-bold text-sm">
                    Access request received. Check your inbox shortly.
                  </motion.p>
                )}
              </div>
           </div>
        </section>

        <section id="partnerships" className="py-32 px-6 max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-serif font-bold mb-4">Institutional Partners</h2>
          <p className="text-slate-500 mb-12">Looking to deploy Synthesis in your school? Request a formal consultation.</p>
          
          <form onSubmit={handleWaitlist} className="flex flex-col md:flex-row gap-3">
             <input 
               type="email" 
               required
               value={waitlistEmail}
               onChange={(e) => setWaitlistEmail(e.target.value)}
               placeholder="Institutional Email..." 
               className="flex-1 px-6 py-5 bg-white border border-black/10 rounded-3xl outline-none focus:ring-2 focus:ring-fluent-gold/20 transition-all font-medium"
             />
             <Btn type="submit" variant="primary" size="lg" className="px-10">Request Audit</Btn>
          </form>

          {waitlistSuccess && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 text-fluent-teal font-bold flex items-center justify-center gap-2">
               <ShieldCheck size={18} /> Application received. Our provost team will respond shortly.
            </motion.div>
          )}
        </section>
      </main>

      <footer className="py-24 px-6 border-t border-black/5 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">
           <div className="col-span-2">
              <Logo className="mb-6" />
              <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
                 Synthesising British instructional excellence with adaptive technology for global academic mastery.
              </p>
           </div>
           
           <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-fluent-navy mb-6">Academy</h4>
              <ul className="space-y-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                 <li><a href="#benefits" className="hover:text-fluent-teal transition-colors underline-offset-4 hover:underline">Curriculum</a></li>
                 <li><a href="#portals" className="hover:text-fluent-teal transition-colors underline-offset-4 hover:underline">Faculty</a></li>
                 <li><a href="#voices" className="hover:text-fluent-teal transition-colors underline-offset-4 hover:underline">Scholars</a></li>
                 <li><a href="#benefits" className="hover:text-fluent-teal transition-colors underline-offset-4 hover:underline">Synthesis Lab</a></li>
              </ul>
           </div>

           <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-fluent-navy mb-6">Support</h4>
              <ul className="space-y-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                 <li><a href="#" className="hover:text-fluent-teal transition-colors underline-offset-4 hover:underline">Help Centre</a></li>
                 <li><a href="#faculty" className="hover:text-fluent-teal transition-colors underline-offset-4 hover:underline">Faculty Portal</a></li>
                 <li><a href="#" className="hover:text-fluent-teal transition-colors underline-offset-4 hover:underline">Parent Access</a></li>
                 <li><a href="#partnerships" className="hover:text-fluent-teal transition-colors underline-offset-4 hover:underline">Partner Audit</a></li>
              </ul>
           </div>

           <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-fluent-navy mb-6">Legal</h4>
              <ul className="space-y-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                 <li><a href="#" className="hover:text-fluent-teal transition-colors underline-offset-4 hover:underline">Privacy Rules</a></li>
                 <li><a href="#" className="hover:text-fluent-teal transition-colors underline-offset-4 hover:underline">Academy Terms</a></li>
                 <li><a href="#" className="hover:text-fluent-teal transition-colors underline-offset-4 hover:underline">Audit Protocol</a></li>
              </ul>
           </div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 pt-8 border-t border-black/5">
           <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">© 2026 Academic Mastery • British Pedagogy</div>
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
