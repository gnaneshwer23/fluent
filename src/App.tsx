/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight,
  Sparkles, 
  Calculator,
  Menu,
  X,
  Target,
  Compass,
  ChevronDown,
  Globe2,
  Users,
  ShieldCheck,
  BrainCircuit,
  Zap
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// --- Firebase Initialization ---
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// --- Error Handling ---
enum OperationType {
  CREATE = 'create',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {}, // No auth implemented as per simple waitlist
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- Components ---

const Logo = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-2 cursor-pointer group ${className}`}>
    <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center transition-transform group-hover:rotate-12">
      <Compass size={18} className="text-accent" />
    </div>
    <span className="font-bold text-xl tracking-tighter text-black uppercase">FLUENT.</span>
  </div>
);


const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const navLinks = [
    { id: 'standard', label: 'Standard' },
    { id: 'comparison', label: 'Value' },
    { id: 'impact', label: 'Results' },
    { id: 'enroll', label: 'Enroll' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      
      const sections = navLinks.map(link => document.getElementById(link.id));
      const scrollPosition = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && scrollPosition >= section.offsetTop) {
          setActiveSection(navLinks[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? 'bg-white/90 backdrop-blur-md py-4 shadow-lg border-b border-black/5' : 'bg-transparent py-8'
    }`}>
      <div className="max-w-7xl mx-auto px-8 sm:px-12 flex items-center justify-between">
        <Logo />

        <div className="hidden lg:flex items-center gap-8">
          <div className="flex gap-4 xl:gap-8 text-[9px] font-bold uppercase tracking-[0.2em] text-black/40">
            {navLinks.filter(link => link.id !== 'enroll').map((link) => (
              <a 
                key={link.id}
                href={`#${link.id}`} 
                className={`transition-all relative py-2 ${
                  activeSection === link.id ? 'text-black' : 'hover:text-black'
                }`}
              >
                {link.label}
                {activeSection === link.id && (
                  <motion.div 
                    layoutId="activeNav"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                  />
                )}
              </a>
            ))}
          </div>
          
          <div className="flex items-center gap-4">
            <a href="#enroll" className={`px-6 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] transition-all inline-block ${
              activeSection === 'enroll' 
                ? 'bg-accent text-white shadow-xl shadow-accent/20' 
                : 'border border-black hover:bg-black hover:text-white'
            }`}>
              Enroll Now
            </a>
          </div>
        </div>

        <button className="lg:hidden text-black p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-b border-black/5 overflow-hidden"
          >
            <div className="flex flex-col items-center py-12 gap-6 text-[10px] font-bold uppercase tracking-[0.3em]">
              {navLinks.map((link) => (
                <a 
                  key={link.id}
                  href={`#${link.id}`} 
                  onClick={() => setMobileMenuOpen(false)}
                  className={activeSection === link.id ? 'text-accent' : 'text-black/60'}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const MetricCard = ({ label, value, colorClass, icon: Icon, rotation, trend }: { label: string, value: number, colorClass: string, icon: any, rotation?: string, trend?: string }) => (
  <div className={`bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl border border-black/5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] flex flex-col gap-4 md:gap-6 transform transition-all hover:-translate-y-2 cursor-default ${rotation ?? ''}`}>
    <div className="flex items-center justify-between">
      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center bg-stone-bg/50 border border-black/5`}>
        <Icon className={`w-4 h-4 md:w-5 md:h-5 text-black`} />
      </div>
      {trend && (
        <div className="flex flex-col items-end">
          <span className="text-[9px] md:text-[10px] font-bold text-accent uppercase tracking-widest bg-accent/5 px-2 py-0.5 rounded italic">{trend}</span>
        </div>
      )}
    </div>
    <div>
      <div className="text-3xl md:text-4xl font-mono font-bold text-black tracking-tighter">{value}%</div>
      <div className="text-[9px] md:text-[10px] font-bold text-black/40 uppercase tracking-[0.2em] mt-1">{label}</div>
    </div>
  </div>
);

const Hero = () => {
  return (
    <section id="home" className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        <div className="grid lg:grid-cols-[1.2fr_1fr] grid-cols-1 gap-16 lg:gap-24 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 text-center lg:text-left"
          >
            <h1 className="text-[56px] sm:text-[72px] md:text-[90px] lg:text-[100px] leading-[0.95] md:leading-[0.88] font-bold tracking-tighter text-black mb-8 md:mb-12">
              Master the <br/><span className="text-black/30">Logic of Learning.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-black/70 leading-relaxed mb-10 md:mb-16 max-w-lg mx-auto lg:mx-0">
              Unlock global academic standards. FLUENT builds deep conceptual mastery in Science, Maths, and English through live sessions with veteran British school-trained educators.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 md:gap-10">
              <a href="#enroll" className="w-full sm:w-auto bg-black text-white px-10 py-5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10 no-underline inline-block">
                Join the Pilot Program
              </a>
            </div>

            <div className="mt-16 md:mt-20 flex flex-wrap items-center justify-center lg:justify-start gap-8 md:gap-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
              <span className="text-[9px] md:text-[10px] font-bold tracking-[0.4em] uppercase whitespace-nowrap">CBSE BENCHMARKED</span>
              <span className="text-[9px] md:text-[10px] font-bold tracking-[0.4em] uppercase whitespace-nowrap">ICSE ALIGNED</span>
              <span className="text-[9px] md:text-[10px] font-bold tracking-[0.4em] uppercase whitespace-nowrap">STEM FOCUSED</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5 }}
            className="relative flex items-center justify-center h-[400px] md:h-[500px] bg-black rounded-[40px] md:rounded-[48px] overflow-hidden shadow-2xl shadow-black/20"
          >
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_#fff_1px,_transparent_1px)] bg-[size:40px_40px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/5 rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full" />

            <div className="relative z-10 space-y-4">
              <motion.div 
                initial={{ x: 20, rotate: -6 }} 
                animate={{ 
                  x: 0,
                  y: [0, -10, 0],
                  rotate: -6
                }} 
                transition={{
                  y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                  default: { duration: 0.8 }
                }}
                className="transform"
              >
                <MetricCard icon={Calculator} label="Maths Mastery" value={82} colorClass="bg-white" trend="+14.2%" />
              </motion.div>
              <motion.div 
                initial={{ x: -20, rotate: 3 }} 
                animate={{ 
                  x: 0,
                  y: [0, 10, 0],
                  rotate: 3
                }} 
                transition={{
                  y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
                  default: { duration: 0.8 }
                }}
                className="transform"
              >
                <MetricCard icon={Target} label="English Fluency" value={94} colorClass="bg-white" trend="+22.1%" />
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-black/20"
        >
          <span className="text-[8px] font-bold uppercase tracking-[0.4em]">Scroll to Discover</span>
          <motion.div 
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown size={16} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-white border-t border-black/5 py-24">
      <div className="max-w-7xl mx-auto px-8 sm:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-16 mb-24">
          <div>
            <Logo className="mb-8" />
            <div className="text-[10px] uppercase font-bold tracking-widest text-black/40">
              Transforming academic fluency <br /> in Indian schools —— 2026
            </div>
          </div>
          <div className="grid grid-cols-2 gap-24">
            <div className="flex flex-col gap-6 text-[10px] font-bold uppercase tracking-[0.3em] text-black/40">
              <a href="#" className="hover:text-black">Product</a>
              <a href="#" className="hover:text-black">Integrations</a>
              <a href="#" className="hover:text-black">Pricing</a>
            </div>
            <div className="flex flex-col gap-6 text-[10px] font-bold uppercase tracking-[0.3em] text-black/40">
              <a href="#" className="hover:text-black">Contact</a>
              <a href="#" className="hover:text-black">Privacy</a>
              <a href="#" className="hover:text-black">Terms</a>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="h-px w-24 bg-black opacity-10"></div>
          <div className="flex gap-4">
            <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-black opacity-10"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-black opacity-10"></div>
          </div>
        </div>
      </div>
    </footer>
  );
};

const EarlyAccessSection = () => {
  const [role, setRole] = useState<'parent' | 'student' | 'teacher' | 'head'>('parent');
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    const path = 'waitlist';
    try {
      await addDoc(collection(db, path), {
        email,
        role,
        requestedAt: serverTimestamp()
      });
      setIsSubmitted(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <section id="enroll" className="py-20 md:py-32 bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_#fff_0.5px,_transparent_0.5px)] bg-[size:30px:30px]" />
      <div className="max-w-4xl mx-auto px-6 sm:px-12 text-center relative z-10">
        <div className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] mb-6 md:mb-8">Priority Intake 2026</div>
        <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8 md:mb-12 italic leading-[0.95] md:leading-[0.9]">
          Secure Your Child's <br/><span className="text-white/30 text-not-italic">Competitive Edge.</span>
        </h2>
        <p className="text-lg md:text-xl text-white/50 leading-relaxed mb-12 md:mb-16 max-w-xl mx-auto">
          We are accepting a limited number of students for our 2026 pilot cohort. Join the list to secure a private performance consultation.
        </p>
        
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-xl mx-auto">
            <div className="flex justify-center gap-4 mb-4">
              {(['parent', 'student', 'teacher', 'head'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`px-6 py-2 rounded-full text-[8px] font-bold uppercase tracking-[0.2em] transition-all border ${
                    role === r ? 'bg-white text-black border-white' : 'bg-transparent text-white/40 border-white/10 hover:border-white/30'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="bg-white/5 p-2 rounded-full border border-white/10 flex flex-col md:flex-row gap-2">
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Parent email address..." 
                className="bg-transparent px-8 py-5 text-sm font-medium focus:outline-none flex-grow text-white placeholder:text-white/20"
              />
              <button 
                type="submit"
                disabled={isLoading}
                className="bg-accent text-black px-12 py-5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-accent/10 whitespace-nowrap disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Request Access'}
              </button>
            </div>
          </form>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-12 bg-white/5 border border-white/10 rounded-[48px]"
          >
            <Sparkles className="text-accent mx-auto mb-6" size={48} />
            <h3 className="text-3xl font-bold italic mb-4">Request Received.</h3>
            <p className="text-white/50 text-sm max-w-xs mx-auto">We'll be in touch with {email} regarding our 2026 intake and consultation schedule for your role as a {role}.</p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

const StandardSection = () => {
  const steps = [
    { 
      n: '01', 
      t: 'British Faculty', 
      d: 'Our lessons are led exclusively by veteran UK-trained educators. They bring a culture of critical inquiry and global linguistic standards that local systems often miss.',
      icon: Globe2
    },
    { 
      n: '02', 
      t: 'Live Scaffolding', 
      d: 'We use a proprietary "scaffolded reasoning" method. Instead of providing answers, we build the cognitive steps required for students to solve and explain complex problems independently.',
      icon: BrainCircuit
    },
    { 
      n: '03', 
      t: 'Academic Benchmarking', 
      d: 'We calibrate every module against international mastery standards, ensuring students exceed local CBSE/ICSE requirements by default. Our framework bridges the gap between rote-learning and conceptual fluency.',
      icon: ShieldCheck
    }
  ];

  return (
    <section id="standard" className="py-20 md:py-40 bg-stone-bg border-y border-black/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-12 lg:gap-24 items-start">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:sticky lg:top-40 mb-12 lg:mb-0"
          >
            <div className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] mb-6">The FLUENT Standard</div>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8 italic leading-[1.1]">
              Global Standards, <br/><span className="text-black/30 text-not-italic">Local Accessibility.</span>
            </h2>
            <p className="text-base md:text-lg text-black/60 leading-relaxed max-w-sm mb-12 font-medium">
              We specialize in bridging the gap between local school performance and global academic fluency through disciplined pedagogy and live mentorship. 
            </p>
            
            <div className="flex flex-col gap-4">
              {[
                { label: 'Maths: Logical Proofs', color: 'bg-green-500', desc: 'Step-by-step verification methods.' },
                { label: 'Science: Deductive Inquiry', color: 'bg-blue-500', desc: 'Application of laws over memorisation.' },
                { label: 'English: Academic Clarity', color: 'bg-accent', desc: 'Precision in technical articulation.' }
              ].map((tag, i) => (
                <div key={i} className="group p-4 rounded-2xl bg-white border border-black/5 flex items-start gap-4 shadow-sm transition-all hover:shadow-md hover:-translate-x-1 cursor-default">
                  <div className={`w-2 h-2 rounded-full ${tag.color} mt-1.5`} />
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-black mb-1">{tag.label}</div>
                    <div className="text-[10px] font-bold text-black/30 uppercase tracking-widest">{tag.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="relative">
            <div className="space-y-6">
              {steps.map((step, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: i * 0.1 }}
                  className="group p-8 md:p-12 rounded-[32px] md:rounded-[48px] border border-black/5 bg-white shadow-sm flex gap-8 md:gap-12 transition-all hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="flex flex-col items-center gap-4">
                    <span className="text-3xl md:text-5xl font-mono font-bold text-black/5 group-hover:text-accent/50 transition-colors">
                      {step.n}
                    </span>
                    <div className="w-px h-full bg-stone-bg group-last:hidden" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl md:text-3xl font-bold tracking-tight italic text-black leading-none">
                        {step.t}
                      </h3>
                      <div className="w-12 h-12 rounded-2xl bg-stone-bg flex items-center justify-center text-black/40 group-hover:text-accent group-hover:scale-110 transition-all">
                        <step.icon size={24} />
                      </div>
                    </div>
                    <p className="text-black/50 leading-relaxed font-bold text-sm md:text-base max-w-md">
                      {step.d}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Arjun K.",
      role: "Class 8 Student",
      text: "I used to be afraid of speaking in class. My British tutor made me feel at ease, and now I can explain complex Physics theories smoothly. My grades improved, but my confidence grew even more.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun"
    },
    {
      name: "Ananya S.",
      role: "Class 9 Student",
      text: "FLUENT doesn't just teach Science; it teaches you how to think. Learning the 'why' behind things has completely changed how I approach my board examinations.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya"
    },
    {
      name: "Rohan M.",
      role: "Class 10 Student",
      text: "The one-on-one sessions are the highlight of my week. I've mastered academic English terms that were once confusing. It's world-class education from my home.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan"
    }
  ];

  return (
    <section id="testimonials" className="py-20 md:py-32 bg-stone-bg">
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-10 md:gap-12 mb-16 md:mb-20 text-center md:text-left">
          <div className="max-w-2xl">
            <div className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] mb-4">Student Voices</div>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-black">
              Mastery in <br/><span className="text-black/30 text-not-italic">Their Own Words.</span>
            </h2>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 md:p-10 rounded-[32px] md:rounded-[48px] border border-black/5 shadow-sm flex flex-col h-full"
            >
              <div className="flex items-center gap-4 mb-6 md:mb-8">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-stone-bg p-1 border border-black/5 overflow-hidden">
                  <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-xs md:text-sm font-bold text-black uppercase tracking-widest">{t.name}</h4>
                  <span className="text-[9px] md:text-[10px] font-bold text-black/40 uppercase tracking-widest leading-none">{t.role}</span>
                </div>
              </div>
              <p className="text-base md:text-lg text-black/70 leading-relaxed font-medium italic flex-grow">
                "{t.text}"
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ImpactStats = () => {
  const stats = [
    { label: "Partner Schools", value: "120+" },
    { label: "Active Students", value: "45K+" },
    { label: "NPS Score", value: "72" },
    { label: "Success Rate", value: "98%" },
  ];

  return (
    <section id="impact" className="py-20 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        <div className="text-center mb-16 md:mb-24">
          <div className="text-[10px] font-bold text-black/40 uppercase tracking-[0.4em] mb-4">Numerical Evidence</div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-black italic leading-tight">
            Global Impact, <br/><span className="text-black/30 text-not-italic">Verified Results.</span>
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16">
          {stats.map((s, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-[9px] md:text-[10px] font-bold text-black/40 uppercase tracking-[0.3em] mb-3 md:mb-4">{s.label}</span>
              <div className="text-4xl md:text-5xl font-mono font-bold text-black tracking-tighter leading-none">{s.value}</div>
              <div className="mt-5 md:mt-6 h-1 w-8 bg-accent"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const WhyChooseSection = () => {
  const points = [
    "UK-trained veteran educators.",
    "Scaffolded lessons that build step-by-step.",
    "Stronger fluency in Science, Maths, and English.",
    "Better confidence in reasoning.",
    "High-quality learning from home.",
    "Aligned with CBSE/ICSE board exams."
  ];

  return (
    <section id="why" className="py-20 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="text-center lg:text-left">
            <div className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] mb-6">The Benefit</div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-black mb-8 md:mb-12">
              Why elite schools <br/><span className="text-black/30 text-not-italic">choose FLUENT.</span>
            </h2>
            <p className="text-base md:text-lg text-black/60 leading-relaxed mb-10 md:mb-12 max-w-xl mx-auto lg:mx-0">
              We know that parents want more than just content. They want visible progress, reliable teaching, and a learning environment that helps children grow with confidence.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 md:gap-x-12 gap-y-6 md:gap-y-8">
            {points.map((point, i) => (
              <div key={i} className="flex gap-4 items-start bg-stone-bg/30 p-4 rounded-2xl border border-black/5 lg:bg-transparent lg:p-0 lg:border-0">
                <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ShieldCheck size={12} className="text-white" />
                </div>
                <p className="text-sm font-bold text-black leading-tight tracking-tight">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const TransformationSection = () => {
  return (
    <section id="transformation" className="py-20 md:py-32 bg-stone-bg border-y border-black/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        <div className="text-center mb-16 md:mb-24">
          <div className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] mb-4">Evidence of Impact</div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-black italic leading-tight">
            Visualising the <br/><span className="text-black/30 text-not-italic">Transformation.</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-px bg-black/5 rounded-[40px] md:rounded-[64px] overflow-hidden border border-black/5 shadow-2xl">
          <div className="bg-white p-10 md:p-20 relative group">
            <div className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-10 md:mb-12 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              Traditional Schooling
            </div>
            <div className="space-y-10 md:space-y-12">
              <div className="relative pl-6 md:pl-8 border-l border-black/10">
                <h4 className="text-lg md:text-xl font-bold text-black/30 mb-3 italic leading-tight">"I know the answer, but I can't speak it."</h4>
                <p className="text-xs md:text-sm text-black/50 leading-relaxed max-w-sm">Students often memorise definitions but struggle to explain the "why" in their own words.</p>
              </div>
              <div className="relative pl-6 md:pl-8 border-l border-black/10">
                <h4 className="text-lg md:text-xl font-bold text-black/30 mb-3 italic leading-tight">Rote-Memory Loop.</h4>
                <p className="text-xs md:text-sm text-black/50 leading-relaxed max-w-sm">Frequent dependence on textbooks without the ability to apply logic to new problems.</p>
              </div>
            </div>
          </div>

          <div className="bg-black text-white p-10 md:p-20 relative">
            <div className="text-[10px] font-bold text-accent uppercase tracking-widest mb-10 md:mb-12 flex items-center gap-2">
              <Sparkles size={12} className="text-accent" />
              The FLUENT Advantage
            </div>
            <div className="space-y-10 md:space-y-12">
              <div className="relative pl-6 md:pl-8 border-l border-accent/40">
                <h4 className="text-lg md:text-xl font-bold text-white mb-3 italic leading-tight">"Logic First, Results Second."</h4>
                <p className="text-white/40 text-xs md:text-sm leading-relaxed max-w-sm">Students develop the linguistic confidence to articulate complex reasoning smoothly.</p>
              </div>
              <div className="relative pl-6 md:pl-8 border-l border-accent/40">
                <h4 className="text-lg md:text-xl font-bold text-white mb-3 italic leading-tight">Global Cognitive Clarity.</h4>
                <p className="text-white/40 text-xs md:text-sm leading-relaxed max-w-sm">By mastering the language of logic, students achieve a significant increase in problem-solving ability.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const ComparisonSection = () => {
  const comparisons = [
    { label: "Instruction", fluent: "British School-Trained Faculty", others: "General Tutors / Students" },
    { label: "Learning Style", fluent: "Live & Scaffolded Reasoning", others: "Passive Rote Memorisation" },
    { label: "Location", fluent: "Global Standard from Home", others: "Local Commute / Travel" },
    { label: "Cost", fluent: "Accessible Performance Pricing", others: "Elite Tuition / Internat. Fees" }
  ];

  return (
    <section id="comparison" className="py-20 md:py-24 bg-white border-y border-black/5">
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        <div className="text-center mb-12 md:mb-16">
          <div className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] mb-4">Market Contrast</div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter italic leading-tight">The <span className="text-black/30">Value Gap.</span></h2>
        </div>

        <div className="max-w-4xl mx-auto border border-black/5 rounded-[32px] md:rounded-[48px] overflow-hidden shadow-2xl">
          <div className="grid grid-cols-2 md:grid-cols-3 bg-black">
            <div className="p-6 md:p-8 hidden md:block text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-white/40">Comparison Metric</div>
            <div className="p-6 md:p-8 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-white/40">Market Standard</div>
            <div className="p-6 md:p-8 bg-white/10 text-accent text-[9px] md:text-[10px] font-bold uppercase tracking-widest">FLUENT Advantage</div>
          </div>
          
          {comparisons.map((c, i) => (
            <div key={i} className="grid grid-cols-2 md:grid-cols-3 border-b border-black/5 last:border-0 hover:bg-stone-bg/50 transition-colors bg-white">
              <div className="p-6 md:p-8 hidden md:flex items-center text-xs md:text-sm font-bold text-black italic leading-tight">{c.label}</div>
              <div className="p-6 md:p-8 text-[10px] md:text-xs text-black/40 font-medium leading-relaxed">{c.others}</div>
              <div className="p-6 md:p-8 bg-black/5 text-[10px] md:text-xs text-black font-bold flex items-center gap-2 md:gap-3">
                <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                  <ShieldCheck size={10} className="text-black" />
                </div>
                <span className="leading-tight">{c.fluent}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const App = () => {
  return (
    <main className="min-h-screen bg-white text-gray-950 font-sans selection:bg-primary/20 selection:text-primary-dark">
      <Navbar />
      <Hero />
      <StandardSection />
      <TransformationSection />
      <ComparisonSection />
      <WhyChooseSection />
      <ImpactStats />
      <TestimonialsSection />
      <EarlyAccessSection />
      <Footer />
    </main>
  );
};

export default App;
