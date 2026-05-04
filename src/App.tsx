/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight,
  Sparkles, 
  Menu,
  X,
  Target,
  ChevronDown,
  ChevronUp,
  Edit2,
  FileText,
  Users,
  GraduationCap,
  ShieldCheck,
  Shield,
  Zap,
  Home,
  BookOpen,
  LayoutDashboard,
  BarChart3,
  Award,
  Bell,
  Settings,
  LogOut,
  Calendar,
  Play,
  Lock,
  Mail,
  Plus,
  Search,
  Globe,
  TrendingUp,
  Filter,
  Trash2,
  CheckCircle2,
  Check,
  Database,
  Phone
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  setDoc,
  getDoc,
  getDocs,
  collectionGroup,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  updateDoc,
  getDocFromServer
} from 'firebase/firestore';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User
} from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

// --- Firebase Initialization ---
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// --- Error Handling ---
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
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

// --- Shared UI Components ---

const Badge = ({ children, color = "navy" }: { children: React.ReactNode, color?: 'navy' | 'gold' | 'teal' | 'green' | 'red' | 'gray' }) => {
  const colors = {
    navy: "bg-fluent-navy/10 text-fluent-navy",
    gold: "bg-fluent-gold/10 text-[#92620A]",
    teal: "bg-fluent-teal/10 text-fluent-teal",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    gray: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`text-[10px] font-bold tracking-wider px-2 py-1 rounded uppercase whitespace-nowrap ${colors[color]}`}>
      {children}
    </span>
  );
};

const Card = ({ children, className = "", hover = false, onClick }: { children: React.ReactNode, className?: string, hover?: boolean, key?: any, onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-xl border border-black/5 p-6 transition-all duration-300 ${hover ? 'hover:shadow-xl hover:-translate-y-1' : ''} ${className} ${onClick ? 'cursor-pointer' : ''}`}
  >
    {children}
  </div>
);

const Avatar = ({ name, size = 36, color = "#1B4F5E" }: { name: string, size?: number, color?: string }) => {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  // Using rgba for opacity since hex appending to variables doesn't work
  const bgColor = color.startsWith('#') ? `${color}20` : color;
  const borderColor = color.startsWith('#') ? `${color}40` : color;
  return (
    <div 
      style={{ width: size, height: size, backgroundColor: bgColor, color, borderColor: borderColor }}
      className="rounded-full flex items-center justify-center font-bold border-2 shrink-0"
    >
      <span style={{ fontSize: size * 0.35 }}>{initials}</span>
    </div>
  );
};

const MetricTile = ({ label, value, delta, icon: Icon, color = "#0D1B2A" }: { label: string, value: string, delta?: string, icon: any, color?: string }) => {
  const bgColor = color.startsWith('#') ? `${color}15` : color;
  return (
    <Card className="p-5 md:p-6">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">{label}</div>
          <div className="text-2xl md:text-3xl font-mono font-bold" style={{ color }}>{value}</div>
          {delta && (
            <div className={`text-xs mt-1 font-medium ${delta.startsWith("+") ? 'text-green-600' : 'text-red-600'}`}>
              {delta} vs last month
            </div>
          )}
        </div>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: bgColor }}>
          <Icon size={18} style={{ color }} />
        </div>
      </div>
    </Card>
  );
};

const ProgressBar = ({ value, max = 100, color = "var(--color-fluent-teal)", label, showPct = true }: { value: number, max?: number, color?: string, label?: string, showPct?: boolean }) => (
  <div className="w-full">
    {(label || showPct) && (
      <div className="flex justify-between mb-2">
        {label && <span className="text-xs font-medium text-gray-500">{label}</span>}
        {showPct && <span className="text-xs font-bold text-fluent-navy">{Math.round((value / max) * 100)}%</span>}
      </div>
    )}
    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        whileInView={{ width: `${(value / max) * 100}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  </div>
);

const Logo = ({ className = "", variant = "dark", onClick, animate = false }: { className?: string, variant?: "dark" | "light", onClick?: () => void, animate?: boolean }) => (
  <div onClick={onClick} className={`flex items-center gap-2.5 cursor-pointer group ${className} ${animate ? 'animate-pulse' : ''}`}>
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:rotate-6 ${variant === 'dark' ? 'bg-fluent-navy' : 'bg-white'}`}>
      <BookOpen size={16} className={variant === 'dark' ? 'text-fluent-gold' : 'text-fluent-navy'} />
    </div>
    <span className={`font-serif font-bold text-xl tracking-tight ${variant === 'dark' ? 'text-fluent-navy' : 'text-white'}`}>FLUENT.</span>
  </div>
);


const Btn = ({ children, variant = "primary", onClick, className = "", size = "md", icon: IconComp, disabled, type = "button" }: { children: React.ReactNode, variant?: 'primary' | 'gold' | 'outline' | 'ghost' | 'danger' | 'success', onClick?: () => void, className?: string, size?: 'sm' | 'md' | 'lg', icon?: any, disabled?: boolean, type?: "button" | "submit" | "reset" }) => {
  const variants = {
    primary: "bg-fluent-navy text-white hover:bg-fluent-navy/90 shadow-lg shadow-fluent-navy/10",
    gold: "bg-fluent-gold text-fluent-navy hover:bg-fluent-gold/90 shadow-lg shadow-fluent-gold/20",
    outline: "bg-transparent text-fluent-navy border-2 border-black/10 hover:border-black/20",
    ghost: "bg-transparent text-slate-500 hover:bg-black/5",
    danger: "bg-red-50 text-red-700 border border-red-100 hover:bg-red-100",
    success: "bg-green-50 text-green-700 border border-green-100 hover:bg-green-100",
  };
  
  const sizes = {
    sm: "px-3.5 py-1.5 text-[12px]",
    md: "px-5 py-2.5 text-[14px]",
    lg: "px-7 py-3.5 text-[15px]",
  };

  return (
    <button 
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {IconComp && <IconComp size={size === 'sm' ? 14 : 16} />}
      {children}
    </button>
  );
};

const DashboardShell = ({ role, title, children, navItems, activeNav, setActiveNav, onBack }: { role: string, title: string, children: React.ReactNode, navItems: any[], activeNav: string, setActiveNav: (v: string) => void, onBack: () => void }) => {
  return (
    <div className="flex min-h-screen bg-fluent-cream">
      {/* Sidebar */}
      <aside className="w-64 bg-fluent-navy flex flex-col fixed top-0 left-0 h-screen z-50">
        <div className="p-6 border-b border-white/5">
          <Logo variant="light" className="mb-6 scale-90 origin-left" />
          <div className="flex items-center gap-3">
            <Avatar name={title} size={36} color="var(--color-fluent-gold)" />
            <div className="overflow-hidden">
              <div className="text-sm font-bold text-white truncate">{title}</div>
              <div className="text-[10px] text-white/40 uppercase tracking-wider capitalize">{role} Account</div>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm group ${
                activeNav === item.id 
                  ? 'bg-white/10 text-white font-semibold' 
                  : 'text-white/45 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              <item.icon size={16} className={activeNav === item.id ? 'text-fluent-gold' : 'text-white/30 group-hover:text-white/60'} />
              {item.label}
              {item.badge && (
                <span className="ml-auto bg-fluent-gold/20 text-fluent-gold-light text-[10px] font-bold px-1.5 py-0.5 rounded">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-white/5">
          <button 
            onClick={onBack}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all text-sm"
          >
            <LogOut size={16} />
            Back to Home
          </button>
        </div>
      </aside>
      
      {/* Content */}
      <main className="flex-1 ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
};

const LandingPage = ({ onEnter }: { onEnter: (view: string) => void }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const portals = [
    { id: "student", label: "Student Portal", icon: GraduationCap, color: "teal", desc: "Live British-tutor sessions and mastery tracking across Mathematics, Science, and English." },
    { id: "parent", label: "Parent Dashboard", icon: Users, color: "navy", desc: "Multi-child monitoring, feedback loops, and private academic consultation scheduling." },
    { id: "teacher", label: "Faculty Hub", icon: BookOpen, color: "gold", desc: "Advanced cohort management and curriculum delivery tools for expert educators." },
    { id: "admin", label: "Admin Command", icon: ShieldCheck, color: "gray", desc: "High-level institutional insights, staff performance, and system configuration." },
  ];

  const features = [
    { icon: Award, title: "British-Trained Faculty", desc: "Learn from teachers who know how to guide understanding with clarity and structure." },
    { icon: Zap, title: "Scaffolded Learning", desc: "Lessons are designed step by step so students can build confidence as they progress." },
    { icon: BookOpen, title: "Core Subject Focus", desc: "Focused support in Science (Bio, Phys, Chem), Maths, and English that matters most." },
    { icon: Globe, title: "Home-Based Excellence", desc: "High-quality learning without travel, relocation, or enrolment in a British school." },
  ];

  const subjects = [
    { name: "Mathematics", color: "var(--color-fluent-teal)", pct: 94, icon: BarChart3 },
    { name: "Science (Bio, Phys, Chem)", color: "var(--color-fluent-navy)", pct: 89, icon: Award },
    { name: "English", color: "var(--color-fluent-gold)", pct: 97, icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-fluent-cream">
      {/* NAV */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 h-[72px] px-8 md:px-12 flex items-center justify-between ${
        scrolled ? "bg-fluent-cream/90 backdrop-blur-xl border-b border-black/5 shadow-sm" : "bg-transparent"
      }`}>
        <Logo onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
        
        <div className="hidden lg:flex items-center gap-10">
          {[
            { label: 'Benefits', id: 'benefits' },
            { label: 'Voices', id: 'testimonials' },
            { label: 'Portals', id: 'portals' },
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })}
              className="text-[10px] uppercase font-bold tracking-[0.3em] text-fluent-navy/60 hover:text-fluent-navy transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Btn variant="primary" size="sm" onClick={() => onEnter("onboarding")}>Register Now</Btn>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-8 md:px-12 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-24 items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-fluent-teal/5 rounded-full blur-[140px] -mr-64 -mt-64" />
        <motion.div
          initial={{ opacity: 0, x: -25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10"
        >
          <div className="inline-flex items-center gap-2.5 bg-fluent-gold/10 border border-fluent-gold/30 rounded-full px-4 py-1.5 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-fluent-gold animate-pulse" />
            <span className="text-[11px] font-bold text-[#92620A] uppercase tracking-widest">World-Class Virtual Schooling</span>
          </div>
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-serif font-bold leading-tight mb-8 tracking-tight">
            Learn Science, <br />
            <span className="text-fluent-teal italic">Maths, and English</span> <br />
            with Confidence.
          </h1>
          <div className="space-y-6 mb-10 max-w-xl">
            <p className="text-xl md:text-2xl text-black/60 leading-relaxed font-medium">
              FLUENT helps students build fluency, academic understanding, and classroom confidence through live lessons.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Btn variant="primary" size="lg" className="rounded-2xl" onClick={() => document.getElementById('enroll')?.scrollIntoView({ behavior: 'smooth' })}>Start Free</Btn>
            <Btn variant="outline" size="lg" className="rounded-2xl" onClick={() => document.getElementById('enroll')?.scrollIntoView({ behavior: 'smooth' })}>Join a Pilot</Btn>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative z-10"
        >
          <div className="bg-fluent-navy border border-white/10 rounded-[48px] p-8 md:p-14 text-white relative overflow-hidden aspect-square flex flex-col justify-center shadow-2xl">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-fluent-teal/15 rounded-full blur-[100px] -mr-48 -mt-48" />
            
            <div className="relative z-10 space-y-10">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-fluent-gold" />
                <div className="text-[11px] text-fluent-gold font-bold uppercase tracking-[0.4em]">Elite Mastery Tracking</div>
              </div>
              {subjects.map((s, i) => (
                <div key={i} className="space-y-4">
                  <div className="flex justify-between items-center text-base">
                    <span className="font-serif font-bold opacity-80 text-xl">{s.name}</span>
                    <span className="font-mono font-bold text-fluent-gold">{s.pct}%</span>
                  </div>
                  <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${s.pct}%` }}
                      transition={{ duration: 1.5, delay: 0.5 + (i * 0.2) }}
                      className="h-full rounded-full bg-gradient-to-r from-fluent-teal/40 to-fluent-teal"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <div id="benefits" className="h-px bg-black/[0.03]" />
      <ProblemSolutionSection />
      <div className="h-px bg-white/5" />
      <BenefitsSection />

      {/* PORTALS SECTION */}
      <div className="h-px bg-black/[0.03]" />
      <section id="portals" className="py-32 px-8 bg-fluent-cream relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl mb-24">
            <Badge color="gold">The Architecture</Badge>
            <h2 className="text-6xl md:text-8xl font-serif font-bold mt-10 tracking-tight leading-[0.85] mb-8">
              Access Your <br />
              <span className="text-fluent-teal italic">Academic Hub.</span>
            </h2>
            <p className="text-2xl text-black/30 font-medium">Specialized dashboards for the entire educational ecosystem.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {portals.map((p) => (
              <div 
                key={p.id} 
                className="bg-white border border-black/5 rounded-[48px] p-10 flex flex-col items-start transition-all duration-700 hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2 group cursor-pointer" 
                onClick={() => onEnter(`${p.id}-dashboard`)}
              >
                <div className={`w-14 h-14 rounded-[22px] mb-8 flex items-center justify-center transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 ${
                  p.id === 'student' ? 'bg-fluent-teal text-white' :
                  p.id === 'parent' ? 'bg-fluent-navy text-white' :
                  p.id === 'teacher' ? 'bg-fluent-gold text-white' :
                  'bg-slate-800 text-white'
                }`}>
                  <p.icon size={24} />
                </div>
                <h3 className="text-2xl font-serif font-bold mb-3">{p.label}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-10 flex-grow">{p.desc}</p>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-fluent-navy group-hover:translate-x-2 transition-transform">
                  Enter Node <ArrowRight size={12} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div id="testimonials" className="h-px bg-black/[0.03]" />
      <TestimonialsSection />

      <div id="enroll" className="h-px bg-black/[0.03]" />
      <EarlyAccessSection />

      {/* FOOTER */}
      <footer className="py-20 px-8 bg-black text-white/40 border-t border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 relative z-10">
          <div className="flex flex-col items-center md:items-start gap-4">
             <Logo variant="light" className="opacity-50" />
             <p className="text-[10px] font-bold uppercase tracking-[0.4em]">Elite British Scaffolding • 2026</p>
          </div>
          
          <div className="flex gap-12">
            {[
              { label: "Privacy", href: "#" },
              { label: "Terms", href: "#" },
              { label: "Institutional", href: "#" }
            ].map(l => (
              <a key={l.label} href={l.href} className="text-[10px] font-bold uppercase tracking-[0.2em] hover:text-fluent-gold transition-colors">{l.label}</a>
            ))}
          </div>
          
          <div className="text-[10px] font-bold uppercase tracking-[0.2em]">
            © 2026 FLUENT ACADEMY. ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>

      {/* FEATURES */}
      <section className="py-24 px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {features.map((f, i) => (
            <div key={i} className="flex flex-col items-start">
              <div className="w-10 h-10 rounded-xl bg-fluent-navy/5 flex items-center justify-center mb-6 text-fluent-navy/30">
                <f.icon size={20} />
              </div>
              <h3 className="text-sm font-serif font-bold mb-3 uppercase tracking-wider">{f.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

const Footer = () => {
  return (
    <footer className="bg-fluent-navy text-white py-24 px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">
          <div className="col-span-2">
            <Logo variant="light" className="mb-8" />
            <p className="text-white/40 text-sm max-w-xs leading-relaxed">
              FLUENT is an elite academic accelerator providing world-class British tutoring to students targeting global excellence.
            </p>
          </div>
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-fluent-gold mb-6">Institution</h4>
            <div className="flex flex-col gap-4 text-xs font-medium text-white/50">
              <a href="#" className="hover:text-white transition-colors">Faculty Hub</a>
              <a href="#" className="hover:text-white transition-colors">Methods</a>
              <a href="#" className="hover:text-white transition-colors">Curriculum</a>
              <a href="#" className="hover:text-white transition-colors">Partners</a>
            </div>
          </div>
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-fluent-gold mb-6">Support</h4>
            <div className="flex flex-col gap-4 text-xs font-medium text-white/50">
              <a href="#" className="hover:text-white transition-colors">Help Center</a>
              <a href="#" className="hover:text-white transition-colors">Contact Us</a>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-fluent-gold mb-6">Portals</h4>
            <div className="flex flex-col gap-4 text-xs font-medium text-white/50">
              <a href="#" className="hover:text-white transition-colors">Student Hub</a>
              <a href="#" className="hover:text-white transition-colors">Parent Desk</a>
              <a href="#" className="hover:text-white transition-colors">Faculty Portal</a>
            </div>
          </div>
        </div>
        
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-[10px] text-white/20 font-bold uppercase tracking-[0.4em]">
            © 2026 Fluent Academy • Excellence in Education
          </div>
          <div className="flex gap-6">
            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center transition-colors hover:border-white/40 cursor-pointer">
              <Globe size={14} className="text-white/40" />
            </div>
            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center transition-colors hover:border-white/40 cursor-pointer">
              <Mail size={14} className="text-white/40" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

const ProblemSolutionSection = () => {
  return (
    <section className="py-24 px-8 bg-fluent-navy text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-fluent-teal/10 rounded-full blur-[100px] -mr-48 -mt-48" />
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           className="relative"
        >
          <div className="p-10 bg-white/5 border border-white/10 rounded-[48px] backdrop-blur-sm">
            <div className="text-fluent-gold font-bold text-[10px] uppercase tracking-[0.4em] mb-6">The Challenge</div>
            <h3 className="text-4xl font-serif font-bold mb-8 leading-tight">The "Gap" in Modern <br/><span className="text-white/40 italic">Learning.</span></h3>
            <p className="text-lg text-white/60 leading-relaxed">
              Many students can follow lessons, but still struggle to speak clearly, think logically, and perform with confidence in class and exams. Parents often want stronger support in core subjects, but they also want teaching that feels structured, personal, and trustworthy.
            </p>
          </div>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-fluent-gold/20 rounded-full blur-3xl" />
        </motion.div>
        
        <div className="space-y-8">
           <Badge color="gold">The Solution</Badge>
           <h2 className="text-5xl md:text-6xl font-serif font-bold leading-[1.1] mb-8">
             A Better Way to <br/> <span className="text-fluent-teal italic">Understand.</span>
           </h2>
           <p className="text-xl text-white/70 leading-relaxed max-w-lg">
             FLUENT gives students a better way to learn. Our scaffolded approach breaks complex topics into simple steps, helping students gain fluency in English, confidence in communication, and stronger understanding in Science and Maths.
           </p>
        </div>
      </div>
    </section>
  );
};

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "ARJUN K.",
      role: "CLASS 11 STUDENT",
      avatar: "👨‍🏫",
      quote: "I used to be afraid of speaking in class. My British tutor made me feel at ease, and now I can explain complex Physics theories smoothly. My grades improved, but my confidence grew even more."
    },
    {
      name: "ANANYA S.",
      role: "CLASS 10 STUDENT",
      avatar: "👩‍🎓",
      quote: "FLUENT doesn't just teach Science; it teaches you how to think. Learning the 'why' behind things has completely changed how I approach my board examinations."
    },
    {
      name: "ROHAN M.",
      role: "CLASS 12 STUDENT",
      avatar: "🧑‍💻",
      quote: "The one-on-one sessions are the highlight of my week. I've mastered academic English terms that were once confusing. It's world-class education from my home."
    }
  ];

  return (
    <section className="py-32 px-8 bg-fluent-cream overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-end gap-12 mb-20">
          <div className="max-w-3xl">
            <Badge color="navy">Student Voices</Badge>
            <h2 className="text-6xl md:text-8xl font-serif font-bold tracking-tight mt-6 leading-[0.9] mb-10">
              Mastery in <br/>
              <span className="text-black/10 italic">Their Own Words.</span>
            </h2>
            <p className="text-2xl text-black/40 leading-relaxed font-medium">
              FLUENT is built for families and schools who want more than just extra lessons. They want visible progress and stronger confidence.
            </p>
          </div>
          <div className="hidden lg:block pb-4">
             <div className="flex gap-2">
               {[1,2,3,4,5].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-fluent-gold" />)}
             </div>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white border border-black/5 rounded-[48px] p-12 shadow-sm hover:shadow-2xl transition-all duration-700 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-fluent-teal/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
              <div className="flex items-center gap-5 mb-10 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-fluent-cream flex items-center justify-center text-3xl group-hover:rotate-6 transition-transform">
                  {t.avatar}
                </div>
                <div>
                  <div className="font-bold text-sm tracking-widest uppercase text-fluent-navy">{t.name}</div>
                  <div className="text-[10px] font-bold text-black/20 uppercase tracking-[0.2em] mt-1">{t.role}</div>
                </div>
              </div>
              <p className="text-xl md:text-2xl text-black/60 leading-relaxed font-serif italic relative z-10">
                "{t.quote}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const BenefitsSection = () => {
  const benefits = [
    { title: "Elite Faculty", desc: "UK-trained veteran educators with global standards." },
    { title: "Methodical Growth", desc: "Scaffolded lessons that build fluency step-by-step." },
    { title: "Core Mastery", desc: "Science, Maths, and English alignment with board exams." },
    { title: "Refined Delivery", desc: "Visible progress and high-stakes reasoning from home." }
  ];

  return (
    <section className="py-40 px-8 bg-white text-fluent-navy relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-fluent-navy/[0.02] rounded-full blur-[100px] -mr-32 -mt-32" />
      <div className="max-w-7xl mx-auto grid lg:grid-cols-5 gap-20 items-center">
        <div className="lg:col-span-2">
          <Badge color="navy">The Advantage</Badge>
          <h2 className="text-6xl md:text-8xl font-serif font-bold tracking-tight mt-10 leading-[0.85] mb-12">
            The Elite <br/>
            <span className="text-black/10 italic">Benchmark.</span>
          </h2>
          <p className="text-2xl text-black/40 leading-relaxed font-medium mb-12">
            We provide a learning environment that helps children grow with unprecedented visible progress and reliability.
          </p>
          <div className="inline-block p-1 bg-fluent-navy/[0.03] border border-black/5 rounded-2xl">
            <div className="px-6 py-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-fluent-gold/10 flex items-center justify-center text-fluent-gold font-bold">
                2026
              </div>
              <div>
                <div className="text-sm font-bold uppercase tracking-widest text-fluent-navy">Global Track</div>
                <div className="text-xs text-black/20 font-bold uppercase tracking-widest">Standards Aligned</div>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-3 grid md:grid-cols-2 gap-6">
          {benefits.map((b, i) => (
            <div key={i} className="p-10 bg-fluent-cream border border-black/5 rounded-[48px] hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.05)] transition-all duration-700 group">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-8 border border-black/5 group-hover:scale-110 transition-transform">
                <ShieldCheck size={24} className="text-fluent-teal" />
              </div>
              <h3 className="text-2xl font-serif font-bold mb-4">{b.title}</h3>
              <p className="text-sm text-black/40 leading-relaxed font-medium">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
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
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,#fff_0.5px,transparent_0.5px)] bg-[size:30px_30px]" />
      <div className="max-w-4xl mx-auto px-6 sm:px-12 text-center relative z-10">
        <div className="text-[10px] font-bold text-fluent-accent uppercase tracking-[0.4em] mb-6 md:mb-8">Priority Intake 2026</div>
        <h2 className="text-4xl md:text-7xl font-bold tracking-tighter mb-8 md:mb-12 leading-[0.95] md:leading-[0.85]">
          Ready to help your <br/><span className="text-white/30 italic">child learn better?</span>
        </h2>
        <p className="text-lg md:text-2xl text-white/50 leading-relaxed mb-12 md:mb-20 max-w-2xl mx-auto">
          Join FLUENT today and give students access to live, guided lessons in Science, Maths, and English with experienced British school-trained teachers.
        </p>
        
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-10 max-w-2xl mx-auto">
            <div className="flex flex-wrap justify-center gap-3 mb-4">
              {(['parent', 'student', 'teacher', 'head'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all border-2 ${
                    role === r ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'bg-transparent text-white/40 border-white/10 hover:border-white/30'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="bg-white/5 p-3 rounded-[40px] border border-white/10 flex flex-col md:flex-row gap-2 shadow-2xl">
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Parent email address..." 
                className="bg-transparent px-8 py-6 text-lg font-medium focus:outline-none flex-grow text-white placeholder:text-white/20"
              />
              <button 
                type="submit"
                disabled={isLoading}
                className="bg-fluent-teal text-white px-12 py-6 rounded-[32px] text-[12px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-xl shadow-fluent-teal/20 whitespace-nowrap disabled:opacity-50"
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
            <Sparkles className="text-fluent-teal mx-auto mb-6" size={48} />
            <h3 className="text-3xl font-bold italic mb-4">Request Received.</h3>
            <p className="text-white/50 text-sm max-w-xs mx-auto">We'll be in touch with {email} regarding our 2026 intake and consultation schedule for your role as a {role}.</p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

const OnboardingFlow = ({ onComplete }: { onComplete: (view: string, profile: any) => void }) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ role: "", name: "", school: "", grade: "", subjects: [] as string[], goal: "" });
  const [isLoading, setIsLoading] = useState(false);

  const getSteps = () => {
    const baseSteps = [
      { title: "Academic Role", subtitle: "We tailor the experience to your specific perspective." },
      { title: "Verification", subtitle: "Establishing your institutional footprint within Fluent." },
    ];
    
    if (data.role === "teacher") {
      return [
        ...baseSteps,
        { title: "Department Focus", subtitle: "Alignment with British school subject standards." },
        { title: "Teaching Goal", subtitle: "What is your primary instructional focus for this cycle?" },
        { title: "Synthesis Complete", subtitle: "Your personalised faculty hub is ready." },
      ];
    }

    if (data.role === "parent") {
      return [
        ...baseSteps,
        { title: "Child's Level", subtitle: "Monitoring mastery for students in your care." },
        { title: "Consultation Goal", subtitle: "What are your primary milestones for your child's growth?" },
        { title: "Synthesis Complete", subtitle: "Your parent oversight desk is ready." },
      ];
    }

    return [
      ...baseSteps,
      { title: "Mastery Focus", subtitle: "Defining current levels and target educational outcomes." },
      { title: "Strategic Goal", subtitle: "What does success look like for your 2026-27 cycle?" },
      { title: "Synthesis Complete", subtitle: "Your personalised elite journey begins now." },
    ];
  };

  const steps = getSteps();

  const roles = [
    { id: "student", label: "Elite Student", icon: GraduationCap, desc: "Mastery tracking and live sessions in core subjects." },
    { id: "parent", label: "Academic Parent", icon: Users, desc: "Monitor child progress and book British consultations." },
    { id: "teacher", label: "Expert Faculty", icon: BookOpen, desc: "Class cohorts, curriculum delivery and faculty tools." },
  ];

  const grades = ["Grade 9", "Grade 10", "Grade 11", "Grade 12"];
  const subjectsList = ["Mathematics", "Physics", "Chemistry", "Biology", "English"];
  
  const getGoalList = () => {
    if (data.role === "teacher") return ["Advanced Curriculum Delivery", "Student Confidence Building", "Board Exam Preparation", "Innovation in Pedagogy"];
    if (data.role === "parent") return ["Holistic Academic Support", "Ivy League Preparation", "Confidence & Fluency", "Monitoring Stability"];
    return [
      "Ivy League / Oxbridge Preparation",
      "Board Exam Elite Performance (95%+)",
      "STEM Competitive Mastery",
      "Conceptual Foundation Reinforcement",
    ];
  };

  const goals = getGoalList();

  const update = (key: string, val: any) => setData(d => ({ ...d, [key]: val }));
  const toggleSubject = (s: string) => update("subjects", data.subjects.includes(s) ? data.subjects.filter(x => x !== s) : [...data.subjects, s]);

  const canProceed = () => {
    if (step === 0) return !!data.role;
    if (step === 1) return data.name && (data.role !== "student" || data.grade);
    if (step === 2) return data.subjects.length > 0;
    if (step === 3) return !!data.goal;
    return true;
  };

  const handleComplete = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (data.role === "parent") onComplete("parent-dashboard", data);
      else if (data.role === "teacher") onComplete("teacher-dashboard", data);
      else if (data.role === "admin") onComplete("admin-dashboard", data);
      else onComplete("student-dashboard", data);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-fluent-cream flex">
      {/* Side panel */}
      <div className="w-80 md:w-96 bg-fluent-navy p-12 flex flex-col shrink-0 hidden md:flex relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -mr-32 -mt-32" />
        <Logo variant="light" className="mb-20 relative z-10" />
        <div className="flex-1 space-y-12 relative z-10">
          {steps.map((s, i) => (
            <div key={i} className={`flex gap-6 items-start transition-all duration-700 ${i <= step ? "opacity-100" : "opacity-20"}`}>
              <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-700 border ${
                i < step ? "bg-fluent-gold text-fluent-navy border-fluent-gold" : 
                i === step ? "bg-white/10 text-white border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)]" : 
                "bg-transparent text-white border-white/5"
              }`}>
                {i < step ? <CheckCircle2 size={16} /> : i + 1}
              </div>
              <div className="pt-1.5">
                <div className={`text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-500 mb-1 ${i === step ? "text-fluent-gold" : "text-white/40"}`}>{s.title}</div>
                {i === step && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-xs text-white/40 leading-relaxed font-medium max-w-[200px]">
                    {s.subtitle}
                  </motion.div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="text-[10px] text-white/20 font-bold uppercase tracking-widest relative z-10">Established Institutional Gateway • 2026</div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-12 overflow-auto">
        <div className="max-w-xl w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
            >
              {step < 4 && (
                <div className="mb-10">
                  <h2 className="text-3xl md:text-4xl font-serif font-bold mb-3 tracking-tight">{steps[step].title}</h2>
                  <p className="text-slate-500">{steps[step].subtitle}</p>
                </div>
              )}

              {/* Step 0: Role */}
              {step === 0 && (
                <div className="space-y-4">
                  {roles.map(r => (
                    <div 
                      key={r.id}
                      onClick={() => update("role", r.id)}
                      className={`group p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-6 ${
                        data.role === r.id ? "border-fluent-teal bg-fluent-teal/5" : "border-black/5 bg-white hover:border-black/20"
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${
                        data.role === r.id ? "bg-fluent-teal text-white" : "bg-gray-50 text-gray-400 group-hover:bg-gray-100"
                      }`}>
                        <r.icon size={24} />
                      </div>
                      <div>
                        <div className="font-bold text-lg mb-1">{r.label}</div>
                        <div className="text-sm text-slate-500">{r.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Step 1: Profile */}
              {step === 1 && (
                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-fluent-navy">Full Name</label>
                    <input 
                      autoFocus
                      value={data.name}
                      onChange={e => update("name", e.target.value)}
                      placeholder="e.g. Arjun Sharma"
                      className="w-full p-4 rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-2 focus:ring-fluent-navy/5 focus:border-fluent-navy"
                    />
                  </div>
                  {data.role === 'student' && (
                    <div className="space-y-4">
                      <label className="text-xs font-bold uppercase tracking-widest text-fluent-navy">Select Your Grade</label>
                      <div className="flex flex-wrap gap-2.5">
                        {grades.map(g => (
                          <button
                            key={g}
                            onClick={() => update("grade", g)}
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all border-2 ${
                              data.grade === g 
                                ? "bg-fluent-navy text-white border-fluent-navy" 
                                : "bg-white text-slate-500 border-black/5 hover:border-black/20"
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="p-4 bg-fluent-gold/10 rounded-xl border border-fluent-gold/20 flex gap-3 italic text-sm text-[#92620A]">
                    <Sparkles size={18} className="shrink-0" />
                    We'll use this to group you with the right cohort.
                  </div>
                </div>
              )}

              {/* Step 2: Subjects */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-3">
                    {subjectsList.map(s => (
                      <div 
                        key={s} 
                        onClick={() => toggleSubject(s)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between group ${
                          data.subjects.includes(s) ? "border-fluent-teal bg-fluent-teal/5" : "border-black/5 bg-white hover:border-black/20"
                        }`}
                      >
                        <span className="font-bold text-sm">{s}</span>
                        {data.subjects.includes(s) && <CheckCircle2 size={18} className="text-fluent-teal" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Goal */}
              {step === 3 && (
                <div className="space-y-3">
                  {goals.map(g => (
                    <div 
                      key={g} 
                      onClick={() => update("goal", g)}
                      className={`p-5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between group ${
                        data.goal === g ? "border-fluent-gold bg-fluent-gold/5" : "border-black/5 bg-white hover:border-black/20"
                      }`}
                    >
                      <span className="font-bold text-sm">{g}</span>
                      {data.goal === g && <div className="w-2 h-2 rounded-full bg-fluent-gold" />}
                    </div>
                  ))}
                </div>
              )}

              {/* Step 4: Success */}
              {step === 4 && (
                <div className="text-center py-8">
                  <div className="w-24 h-24 rounded-full bg-fluent-teal/10 flex items-center justify-center mx-auto mb-10 border-4 border-fluent-teal/20">
                    <Sparkles size={48} className="text-fluent-teal" />
                  </div>
                  <h2 className="text-4xl font-serif font-bold mb-4 tracking-tight leading-tight">Welcome, {data.name.split(' ')[0]}!</h2>
                  <p className="text-slate-500 leading-relaxed max-w-sm mx-auto mb-12">
                    {data.role === 'teacher' ? (
                      <>Your faculty credentials have been verified. Accessing tools for <span className="font-bold text-fluent-navy">{data.subjects.join(", ")}</span> delivery.</>
                    ) : data.role === 'parent' ? (
                      <>Your parent oversight desk is active. Monitoring pathways for <span className="font-bold text-fluent-navy">{data.grade}</span> students.</>
                    ) : (
                      <>Your FLUENT profile has been synthesized. We've matched you with our elite cohort resources for <span className="font-bold text-fluent-navy">{data.subjects.join(", ")}</span>.</>
                    )}
                  </p>
                  <Btn 
                    variant="primary" 
                    size="lg" 
                    className="w-full max-w-xs" 
                    disabled={isLoading}
                    onClick={handleComplete}
                  >
                    {isLoading ? "Synthesizing Hub..." : "Access My Dashboard →"}
                  </Btn>
                </div>
              )}

              {step < 4 && (
                <div className="flex justify-between items-center mt-16 pt-8 border-t border-black/5">
                  <Btn variant="ghost" onClick={() => setStep(s => Math.max(0, s - 1))} className={step === 0 ? "invisible" : ""}>
                    ← Back
                  </Btn>
                  <Btn 
                    variant="primary" 
                    onClick={() => setStep(s => s + 1)} 
                    disabled={!canProceed()}
                  >
                    {step === 3 ? "Complete Setup" : "Continue →"}
                  </Btn>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const FacultyHub = ({ profile, onBack }: { profile?: any, onBack: () => void }) => {
  const [activeNav, setActiveNav] = useState("overview");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);
  const [selectedClassForStudents, setSelectedClassForStudents] = useState<any>(null);
  const [selectedPoolStudents, setSelectedPoolStudents] = useState<string[]>([]);
  const [viewingHistory, setViewingHistory] = useState<any>(null);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [viewingStudentDetail, setViewingStudentDetail] = useState<any>(null);
  const [rosterSortOrder, setRosterSortOrder] = useState<'desc' | 'asc' | null>(null);
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [unassignedStudents, setUnassignedStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const teacherName = profile?.name || auth.currentUser?.displayName || "Dr. Sarah Mills";
  const department = profile?.subjects?.[0] || "Physics";

  useEffect(() => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;

    // Listen to classes
    const classesQuery = query(collection(db, 'classes'), where('ownerId', '==', uid));
    const unsubClasses = onSnapshot(classesQuery, (snap) => {
      const classData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClasses(classData);
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'classes'));

    // Listen to student pool
    const poolQuery = query(collection(db, 'studentPool'), where('ownerId', '==', uid));
    const unsubPool = onSnapshot(poolQuery, (snap) => {
      const poolData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUnassignedStudents(poolData);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'studentPool'));

    return () => {
      unsubClasses();
      unsubPool();
    };
  }, []);

  // Sync current selection if students subcollection changes?
  // Actually, students should be fetched when a class is selected.
  const [classStudents, setClassStudents] = useState<any[]>([]);
  useEffect(() => {
    if (!selectedClassForStudents?.id) {
      setClassStudents([]);
      return;
    }
    const studentsRef = collection(db, 'classes', selectedClassForStudents.id, 'students');
    const unsub = onSnapshot(studentsRef, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClassStudents(data);
    }, (error) => handleFirestoreError(error, OperationType.LIST, `classes/${selectedClassForStudents.id}/students`));
    return () => unsub();
  }, [selectedClassForStudents?.id]);

  const navItems = [
    { id: "overview", label: "Faculty Console", icon: Home },
    { id: "cohorts", label: "Student Cohorts", icon: Users, badge: classes.length.toString() },
    { id: "registry", label: "Registry", icon: Database },
    { id: "live", label: "Live Delivery", icon: Play, badge: "Live" },
    { id: "curriculum", label: "British Methods", icon: BookOpen },
    { id: "settings", label: "Preferences", icon: Settings },
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
      ownerId: auth.currentUser.uid,
      createdAt: serverTimestamp()
    };
    try {
      await addDoc(collection(db, 'classes'), newClass);
      setShowCreateModal(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'classes');
    }
  };

  const handleUpdateClass = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingClass) return;
    const formData = new FormData(e.currentTarget);
    try {
      await updateDoc(doc(db, 'classes', editingClass.id), {
        name: formData.get('name') as string,
        grade: formData.get('grade') as string,
        subject: formData.get('subject') as string,
      });
      setEditingClass(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `classes/${editingClass.id}`);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (!window.confirm("Are you sure you want to delete this class? All student records for this class will be lost.")) return;
    try {
      await deleteDoc(doc(db, 'classes', classId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `classes/${classId}`);
    }
  };

  return (
    <DashboardShell role="teacher" title={teacherName} navItems={navItems} activeNav={activeNav} setActiveNav={setActiveNav} onBack={onBack}>
      <div className="p-10 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge color="teal">Expert Faculty</Badge>
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider">• {department} Department Access</span>
            </div>
            <h1 className="text-4xl font-serif font-bold tracking-tight">
              Welcome, <span className="text-fluent-teal italic font-normal">{teacherName.split(' ')[0]}</span> ✦
            </h1>
            <p className="text-slate-500 mt-1">
              Focusing on <span className="font-bold text-fluent-navy">{profile?.goal || "British Scaffolding"}</span> • {classes.length} cohorts active.
            </p>
          </div>
          <div className="flex gap-3">
             <Btn variant="outline" size="sm" icon={Plus} onClick={() => setShowCreateModal(true)}>New Cohort</Btn>
             {activeNav === 'overview' && <Btn variant="gold" size="sm" icon={Play}>Enter G9 Physics Lab</Btn>}
          </div>
        </header>

        {activeNav === 'overview' ? (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <MetricTile label="Active Cohorts" value={classes.length.toString()} icon={Users} color="#1B4F5E" />
              <MetricTile label="Avg Fluency" value="84%" delta="+4%" icon={TrendingUp} color="#0D1B2A" />
              <MetricTile label="Instruction Hours" value="128" delta="+12" icon={Calendar} color="#C9A84C" />
              <MetricTile label="Conceptual Linkage" value="96%" icon={Zap} color="#7C3AED" />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 p-8">
                <h3 className="text-xl font-serif font-bold mb-8">Cohort Orchestration & Live Feed</h3>
                <div className="space-y-4">
                  {sessions.map((s, i) => (
                    <div key={i} className="flex items-center gap-6 p-5 rounded-2xl border border-black/5 hover:border-black/10 transition-all bg-gray-50/50">
                      <div className="w-32 shrink-0">
                        <div className="text-xs font-bold text-slate-400">{s.time}</div>
                        <div className="text-sm font-bold text-fluent-navy mt-0.5">{s.class}</div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-fluent-navy">{s.topic}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.subject} Mastery Protocol</div>
                      </div>
                      <div className="flex items-center gap-4">
                        {s.status === 'live' ? (
                          <Badge color="teal">Live Scaffolding</Badge>
                        ) : s.status === 'completed' ? (
                          <Badge color="gray">Archived</Badge>
                        ) : (
                          <Badge color="navy">Pending</Badge>
                        ) }
                        <Btn variant="ghost" size="sm" className="p-2 aspect-square">
                          {s.status === 'upcoming' ? <Calendar size={14} /> : <ArrowRight size={14} />}
                        </Btn>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-8">
                <h3 className="text-xl font-serif font-bold mb-8">Core Mastery Trends</h3>
                <div className="space-y-8">
                  {classes.map((c, i) => (
                    <div key={i} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="font-bold text-sm text-fluent-navy">{c.name}</div>
                        <div className="text-xs font-mono font-bold">{c.avgScore}%</div>
                      </div>
                      <ProgressBar value={c.avgScore} color={c.subject === 'English' ? '#C9A84C' : '#1B4F5E'} showPct={false} />
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-1">
                        <span>{c.students} Students</span>
                        <span>{c.attendance}% Attendance</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Btn variant="outline" size="sm" className="w-full mt-10">Export Cohort Mastery Grid</Btn>
              </Card>
            </div>
          </>
        ) : activeNav === 'cohorts' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map(c => (
              <Card key={c.id} className="p-6 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-fluent-navy/5 flex items-center justify-center text-fluent-navy">
                    <Users size={20} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingClass(c)} className="p-2 text-slate-400 hover:text-fluent-navy transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => setClasses(classes.filter(x => x.id !== c.id))} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
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
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-white transition-colors">
                <Plus size={24} />
              </div>
              <span className="text-sm font-bold uppercase tracking-widest">Create New Class</span>
            </button>
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
                  <input 
                    placeholder="Global student search..." 
                    className="pl-12 pr-4 py-3 bg-white border border-black/5 rounded-xl text-sm focus:ring-1 focus:ring-fluent-teal outline-none w-64"
                  />
                </div>
                <Btn 
                  variant="primary" 
                  icon={Plus}
                  onClick={() => {
                    const name = prompt("Enter student's full name:");
                    if (!name || !auth.currentUser) return;
                    addDoc(collection(db, 'studentPool'), { name, ownerId: auth.currentUser.uid })
                      .catch(e => handleFirestoreError(e, OperationType.WRITE, 'studentPool'));
                  }}
                >
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
                        }}>
                          <Edit2 size={16} />
                        </Btn>
                        <Btn variant="ghost" size="sm" className="text-red-400 hover:bg-red-50" onClick={() => {
                          if (confirm("Delete this student from registry?")) deleteDoc(doc(db, 'studentPool', s.id));
                        }}>
                          <Trash2 size={16} />
                        </Btn>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-8 bg-fluent-navy text-white">
                <h3 className="text-lg font-serif font-bold mb-4">Placement Guidance</h3>
                <p className="text-sm text-white/60 mb-8 font-medium leading-relaxed">
                  Students in the pool are visible to all your classes. You can assign them to any cohort from the class management sidebar.
                </p>
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-[10px] font-bold text-fluent-gold uppercase tracking-[0.2em] mb-1">PRO TIP</div>
                    <div className="text-xs font-medium">Use the "Bulk Add" feature inside a Class view to import hundreds of students at once.</div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-[10px] font-bold text-fluent-gold uppercase tracking-[0.2em] mb-1">ARCHIVE</div>
                    <div className="text-xs font-medium">Deleting a student from the pool is permanent. Assigned students stay in their class until removed.</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        ) : (
          <div className="py-20 text-center">
             <div className="w-20 h-20 rounded-2xl bg-fluent-navy/5 flex items-center justify-center mx-auto mb-6 text-fluent-navy/20">
              {navItems.find(n => n.id === activeNav)?.icon && React.createElement(navItems.find(n => n.id === activeNav)!.icon, { size: 40 })}
            </div>
            <h3 className="text-2xl font-serif font-bold mb-2 uppercase tracking-tight">{activeNav} View</h3>
            <p className="text-slate-400 max-w-sm mx-auto">This module is currently focused on Class Management. Check back soon for updated {activeNav} features.</p>
            <Btn variant="outline" size="sm" className="mt-8" onClick={() => setActiveNav("overview")}>Back to Overview</Btn>
          </div>
        )}

        {/* Create / Edit Modal */}
        {(showCreateModal || editingClass) && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="absolute inset-0 bg-fluent-navy/40 backdrop-blur-sm"
              onClick={() => { setShowCreateModal(false); setEditingClass(null); }}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8"
            >
              <h2 className="text-2xl font-serif font-bold mb-6">{editingClass ? "Edit Class Details" : "Create New Class"}</h2>
              <form onSubmit={editingClass ? handleUpdateClass : handleCreateClass} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Class Name</label>
                  <input name="name" defaultValue={editingClass?.name} autoFocus required placeholder="e.g. Grade 10 - Physics" className="w-full p-3 bg-gray-50 border border-black/5 rounded-xl text-sm focus:ring-2 focus:ring-fluent-teal/10 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Grade Level</label>
                    <select name="grade" defaultValue={editingClass?.grade} required className="w-full p-3 bg-gray-50 border border-black/5 rounded-xl text-sm focus:ring-2 focus:ring-fluent-teal/10 outline-none">
                      <option>Grade 6</option>
                      <option>Grade 7</option>
                      <option>Grade 8</option>
                      <option>Grade 9</option>
                      <option>Grade 10</option>
                      <option>Grade 11</option>
                      <option>Grade 12</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Subject</label>
                    <select name="subject" defaultValue={editingClass?.subject} required className="w-full p-3 bg-gray-50 border border-black/5 rounded-xl text-sm focus:ring-2 focus:ring-fluent-teal/10 outline-none">
                      <option>Mathematics</option>
                      <option>Physics</option>
                      <option>Chemistry</option>
                      <option>Biology</option>
                      <option>English</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Btn type="button" variant="ghost" className="flex-1" onClick={() => { setShowCreateModal(false); setEditingClass(null); }}>Cancel</Btn>
                  <Btn type="submit" variant="primary" className="flex-1">{editingClass ? "Update Class" : "Create Class"}</Btn>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Student Management Modal */}
        {selectedClassForStudents && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="absolute inset-0 bg-fluent-navy/40 backdrop-blur-sm"
              onClick={() => {
                setSelectedClassForStudents(null);
                setSelectedPoolStudents([]);
              }}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 max-h-[80vh] flex flex-col"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-serif font-bold tracking-tight">Manage Enrollment</h2>
                  <p className="text-slate-500 text-sm mt-1">{selectedClassForStudents.name}</p>
                </div>
                <button 
                  onClick={() => {
                    setSelectedClassForStudents(null);
                    setSelectedPoolStudents([]);
                  }} 
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-auto pr-2">
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      {showBulkAdd ? "Bulk Student Import" : "Quick Add Student"}
                    </div>
                    <button 
                      onClick={() => setShowBulkAdd(!showBulkAdd)}
                      className="text-[10px] font-bold uppercase tracking-widest text-fluent-teal hover:text-fluent-navy transition-colors flex items-center gap-1.5"
                    >
                      {showBulkAdd ? <Users size={12} /> : <FileText size={12} />}
                      {showBulkAdd ? "Simple Mode" : "Bulk Mode"}
                    </button>
                  </div>

                  {!showBulkAdd ? (
                    <form 
                      className="flex gap-2"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const form = e.currentTarget;
                        const input = form.elements.namedItem('studentName') as HTMLInputElement;
                        const name = input.value;
                        if (!name.trim()) return;
                        
                        try {
                          const studentsRef = collection(db, 'classes', selectedClassForStudents.id, 'students');
                          await addDoc(studentsRef, {
                            name,
                            studentId: `ST-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                            enrolledAt: new Date().toISOString(),
                            attended: 0,
                            total: 0,
                            history: [],
                            grade: selectedClassForStudents.grade,
                            subject: selectedClassForStudents.subject,
                            className: selectedClassForStudents.name
                          });
                          await updateDoc(doc(db, 'classes', selectedClassForStudents.id), {
                            students: (selectedClassForStudents.students || 0) + 1
                          });
                          input.value = '';
                        } catch (error) {
                          handleFirestoreError(error, OperationType.WRITE, `classes/${selectedClassForStudents.id}/students`);
                        }
                      }}
                    >
                      <input name="studentName" placeholder="Type student name..." className="flex-1 p-3 bg-gray-50 border border-black/5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-fluent-teal" />
                      <Btn type="submit" variant="primary" size="sm">Enroll</Btn>
                    </form>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center px-1">
                        <p className="text-[10px] text-slate-400">Enter names (new lines/commas) or upload a CSV roster.</p>
                        <Btn 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 px-2 text-[9px] border-black/5"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = '.csv,.txt';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const text = event.target?.result as string;
                                // Simple CSV parser: split by line, trim, filter, or handle comma if first line is names
                                const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
                                setBulkText(lines.join('\n'));
                              };
                              reader.readAsText(file);
                            };
                            input.click();
                          }}
                        >
                          Upload .CSV
                        </Btn>
                      </div>
                      <textarea 
                        value={bulkText}
                        onChange={(e) => setBulkText(e.target.value)}
                        placeholder="Arjun S.&#10;Priya K.&#10;Rohan M. ..."
                        className="w-full h-32 p-4 bg-gray-50 border border-black/5 rounded-xl text-sm font-medium focus:ring-1 focus:ring-fluent-teal outline-none resize-none"
                      />
                      <div className="flex gap-2">
                        <Btn 
                          variant="primary" 
                          size="sm" 
                          className="flex-1"
                          onClick={async () => {
                            const names = bulkText
                              .split(/[\n,]/)
                              .map(n => n.trim())
                              .filter(n => n.length > 0);
                            
                            if (names.length === 0) return;

                            try {
                              const totalNames = names.length;
                              // Use batch for better performance (Firestore limits 500 per batch)
                              const studentsRef = collection(db, 'classes', selectedClassForStudents.id, 'students');
                              
                              // We'll process in chunks of 10 for responsiveness in this demo
                              for (const name of names) {
                                await addDoc(studentsRef, {
                                  name,
                                  studentId: `ST-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                                  enrolledAt: new Date().toISOString(),
                                  attended: 0,
                                  total: 0,
                                  history: [],
                                  grade: selectedClassForStudents.grade,
                                  subject: selectedClassForStudents.subject,
                                  className: selectedClassForStudents.name
                                });
                              }
                              
                              await updateDoc(doc(db, 'classes', selectedClassForStudents.id), {
                                students: (selectedClassForStudents.students || 0) + totalNames
                              });
                              setBulkText("");
                              setShowBulkAdd(false);
                            } catch (error) {
                              handleFirestoreError(error, OperationType.WRITE, `classes/${selectedClassForStudents.id}/students`);
                            }
                          }}
                        >
                          Import {bulkText.split(/[\n,]/).filter(n => n.trim().length > 0).length} Students
                        </Btn>
                        <Btn variant="outline" size="sm" onClick={() => { setShowBulkAdd(false); setBulkText(""); }}>Cancel</Btn>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {classStudents.length > 0 && (
                    <div className="bg-fluent-navy text-white rounded-3xl p-6 shadow-lg relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-fluent-teal/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-fluent-teal/20 transition-colors"></div>
                      <div className="relative z-10 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-widest text-fluent-teal/80 mb-1">Class Attendance Vitality</div>
                          <div className="text-4xl font-serif font-bold tracking-tight">
                            {(() => {
                              const attended = classStudents.reduce((sum: number, s: any) => sum + (s.attended + (s.status === 'present' ? 1 : 0)), 0);
                              const total = classStudents.reduce((sum: number, s: any) => sum + (s.total + (s.status ? 1 : 0)), 0);
                              return total > 0 ? Math.round((attended / total) * 100) : 0;
                            })()}%
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="flex gap-1 mb-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <div 
                                key={i} 
                                className={`w-1 h-3 rounded-full ${i < 4 ? 'bg-fluent-teal' : 'bg-white/20'}`}
                              />
                            ))}
                          </div>
                          <div className="text-[9px] font-bold uppercase tracking-widest text-white/40">Aggregated Metric</div>
                        </div>
                      </div>
                      <div className="mt-4 w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ 
                            width: `${(() => {
                              const attended = classStudents.reduce((sum: number, s: any) => sum + (s.attended + (s.status === 'present' ? 1 : 0)), 0);
                              const total = classStudents.reduce((sum: number, s: any) => sum + (s.total + (s.status ? 1 : 0)), 0);
                              return total > 0 ? Math.round((attended / total) * 100) : 0;
                            })()}%` 
                          }}
                          className="h-full bg-fluent-teal"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-4">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Class Roster</div>
                      <div className="flex items-center bg-gray-100 p-1 rounded-lg gap-1">
                        <button 
                          onClick={() => setRosterSortOrder(rosterSortOrder === 'desc' ? null : 'desc')}
                          className={`p-1 rounded-md transition-all ${rosterSortOrder === 'desc' ? 'bg-fluent-navy text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                          title="Sort Highest First"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button 
                          onClick={() => setRosterSortOrder(rosterSortOrder === 'asc' ? null : 'asc')}
                          className={`p-1 rounded-md transition-all ${rosterSortOrder === 'asc' ? 'bg-fluent-navy text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                          title="Sort Lowest First"
                        >
                          <ChevronDown size={14} />
                        </button>
                      </div>
                    </div>
                    <Badge color="navy">{selectedClassForStudents.students || 0} Enrolled</Badge>
                  </div>
                  {classStudents.length === 0 ? (
                    <div className="p-12 text-center bg-gray-50 rounded-[32px] border border-dashed border-slate-200">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <Users className="text-slate-300" size={24} />
                      </div>
                      <p className="text-xs text-slate-400 font-medium max-w-[200px] mx-auto">
                        No students enrolled yet. Use the tools above to build your cohort.
                      </p>
                    </div>
                  ) : classStudents.slice().sort((a: any, b: any) => {
                    if (!rosterSortOrder) return 0;
                    const getRate = (s: any) => {
                      const total = s.total + (s.status ? 1 : 0);
                      if (total === 0) return 0;
                      return (s.attended + (s.status === 'present' ? 1 : 0)) / total;
                    };
                    const rateA = getRate(a);
                    const rateB = getRate(b);
                    return rosterSortOrder === 'desc' ? rateB - rateA : rateA - rateB;
                  }).map((s: any, i: number) => (
                    <div key={s.id || i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div 
                        className="flex items-center gap-3 cursor-pointer group/item"
                        onClick={() => setViewingStudentDetail(s)}
                      >
                        <Avatar name={s.name} size={32} />
                        <div>
                          <div className="font-bold text-sm text-fluent-navy group-hover/item:text-fluent-teal transition-colors underline-offset-2 group-hover/item:underline">{s.name}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            Rate: { (s.total + (s.status ? 1 : 0)) > 0 ? Math.round(((s.attended + (s.status === 'present' ? 1 : 0)) / (s.total + (s.status ? 1 : 0))) * 100) : 0}% ({s.attended + (s.status === 'present' ? 1 : 0)}/{s.total + (s.status ? 1 : 0)})
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
                          <button 
                            onClick={() => {
                              setClassStudents(prev => prev.map(st => st.id === s.id ? { ...st, status: st.status === 'present' ? null : 'present' } : st));
                            }}
                            title="Mark Present"
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${s.status === 'present' ? 'bg-fluent-teal text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                          >
                            P
                          </button>
                          <button 
                            onClick={() => {
                              setClassStudents(prev => prev.map(st => st.id === s.id ? { ...st, status: st.status === 'absent' ? null : 'absent' } : st));
                            }}
                            title="Mark Absent"
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${s.status === 'absent' ? 'bg-red-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                          >
                            A
                          </button>
                        </div>
                        <Btn variant="ghost" size="sm" className="text-slate-400 hover:text-fluent-navy p-2" onClick={() => setEditingStudent(s)}>
                          <Edit2 size={16} />
                        </Btn>
                        <Btn variant="ghost" size="sm" className="text-slate-400 hover:text-fluent-navy p-2" onClick={() => setViewingHistory(s)}>
                          <BarChart3 size={16} />
                        </Btn>
                        <Btn variant="ghost" size="sm" className="text-red-400 hover:bg-red-50 p-2" onClick={async () => {
                          if (window.confirm(`Are you sure you want to remove ${s.name} from this class? They will be returned to the student pool.`)) {
                            try {
                              const uid = auth.currentUser?.uid;
                              if (!uid) return;
                              // Add student back to pool
                              await addDoc(collection(db, 'studentPool'), { name: s.name, ownerId: uid });
                              // Remove from class
                              await deleteDoc(doc(db, 'classes', selectedClassForStudents.id, 'students', s.id));
                              // Update class count
                              await updateDoc(doc(db, 'classes', selectedClassForStudents.id), {
                                students: Math.max(0, (selectedClassForStudents.students || 1) - 1)
                              });
                            } catch (error) {
                              handleFirestoreError(error, OperationType.DELETE, `classes/${selectedClassForStudents.id}/students/${s.id}`);
                            }
                          }
                        }}>
                          <Trash2 size={16} />
                        </Btn>
                      </div>
                    </div>
                  ))}
                  
                  <div className="mt-8 pt-6 border-t border-black/5">
                    <Btn 
                      variant="primary" 
                      className="w-full py-4 rounded-xl flex items-center justify-center gap-2"
                      onClick={async () => {
                        try {
                          const studentsRef = collection(db, 'classes', selectedClassForStudents.id, 'students');
                          let totalA = 0;
                          let totalP = 0;

                          for (const st of classStudents) {
                            const newTotal = st.total + (st.status ? 1 : 0);
                            const newAttended = st.attended + (st.status === 'present' ? 1 : 0);
                            const newHistory = st.status ? [
                              ...(st.history || []),
                              { date: new Date().toISOString().split('T')[0], status: st.status }
                            ] : (st.history || []);
                            
                            await updateDoc(doc(studentsRef, st.id), {
                              total: newTotal,
                              attended: newAttended,
                              history: newHistory,
                              // No need to store 'status' permanently, it's a current session ephemeral state
                            });

                            totalA += newAttended;
                            totalP += newTotal;
                          }

                          // Update Class aggregated attendance
                          const classAttendance = totalP > 0 ? Math.round((totalA / totalP) * 100) : 0;
                          await updateDoc(doc(db, 'classes', selectedClassForStudents.id), {
                            attendance: classAttendance
                          });

                          // Reset local statuses after commit
                          setClassStudents(prev => prev.map(s => ({ ...s, status: null })));
                          alert("Session logged successfully!");
                        } catch (error) {
                          handleFirestoreError(error, OperationType.WRITE, `classes/${selectedClassForStudents.id}/students`);
                        }
                      }}
                    >
                      <CheckCircle2 size={18} />
                      Log Session & Commit Records
                    </Btn>
                    <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest mt-4">Finalises today's register and saves the historical data.</p>
                  </div>

                  <div className="pt-8 border-t border-black/5 mt-8">
                    <div className="flex justify-between items-center mb-4 px-1">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Assign from Student Pool</div>
                      {selectedPoolStudents.length > 0 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                          <Btn 
                            variant="primary" 
                            size="sm" 
                            className="bg-fluent-teal hover:bg-fluent-teal/90 h-8 px-4 text-[10px]"
                            onClick={async () => {
                              try {
                                const studentsRef = collection(db, 'classes', selectedClassForStudents.id, 'students');
                                for (const id of selectedPoolStudents) {
                                  const s = unassignedStudents.find(student => student.id === id);
                                  if (!s) continue;
                                  
                                  await addDoc(studentsRef, {
                                    name: s.name,
                                    studentId: `ST-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                                    enrolledAt: new Date().toISOString(),
                                    attended: 0,
                                    total: 0,
                                    history: [],
                                    grade: selectedClassForStudents.grade,
                                    subject: selectedClassForStudents.subject,
                                    className: selectedClassForStudents.name
                                  });
                                  await deleteDoc(doc(db, 'studentPool', s.id));
                                }
                                
                                await updateDoc(doc(db, 'classes', selectedClassForStudents.id), {
                                  students: (selectedClassForStudents.students || 0) + selectedPoolStudents.length
                                });
                                
                                setSelectedPoolStudents([]);
                              } catch (error) {
                                handleFirestoreError(error, OperationType.WRITE, `classes/${selectedClassForStudents.id}/students`);
                              }
                            }}
                          >
                            Assign {selectedPoolStudents.length} Selected
                          </Btn>
                        </motion.div>
                      )}
                    </div>
                    <div className="space-y-1 mb-6">
                      {unassignedStudents.length > 0 ? unassignedStudents.map((s, i) => {
                        const isSelected = selectedPoolStudents.includes(s.id);
                        return (
                          <div 
                            key={s.id || i} 
                            onClick={() => {
                              setSelectedPoolStudents(prev => 
                                prev.includes(s.id) ? prev.filter(id => id !== s.id) : [...prev, s.id]
                              );
                            }}
                            className={`flex items-center justify-between p-4 cursor-pointer transition-all rounded-xl group border ${isSelected ? 'bg-fluent-teal/5 border-fluent-teal/20 shadow-sm' : 'hover:bg-gray-50 border-transparent hover:border-black/5'}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 rounded border transition-colors flex items-center justify-center ${isSelected ? 'bg-fluent-teal border-fluent-teal' : 'border-slate-300'}`}>
                                {isSelected && <Check size={10} className="text-white" />}
                              </div>
                              <Avatar name={s.name} size={32} />
                              <span className={`font-medium text-sm transition-colors ${isSelected ? 'text-fluent-teal' : 'text-slate-600'}`}>{s.name}</span>
                            </div>
                            {!isSelected && (
                              <div className="text-[9px] font-bold text-slate-300 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Select</div>
                            )}
                          </div>
                        );
                      }) : (
                        <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-slate-200">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Pool exhausted</p>
                          <p className="text-xs text-slate-400 mt-1">All registered students are currently assigned.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-black/5">
                <Btn variant="primary" className="w-full" onClick={() => {
                  setSelectedClassForStudents(null);
                  setSelectedPoolStudents([]);
                }}>Confirm Changes</Btn>
              </div>
            </motion.div>
          </div>
        )}

        {viewingStudentDetail && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[40px] w-full max-w-xl p-10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-24 bg-fluent-navy"></div>
              
              <button 
                onClick={() => setViewingStudentDetail(null)}
                className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors z-10"
              >
                <X size={24} />
              </button>

              <div className="relative mt-4">
                <div className="flex items-end gap-6 mb-8">
                  <div className="w-24 h-24 rounded-[32px] bg-white p-2 shadow-lg relative">
                    <Avatar name={viewingStudentDetail.name} size={80} />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-fluent-teal flex items-center justify-center text-white border-4 border-white">
                      <ShieldCheck size={16} />
                    </div>
                  </div>
                  <div className="pb-2">
                    <h3 className="text-3xl font-serif font-bold text-fluent-navy">{viewingStudentDetail.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <Badge color="navy">{viewingStudentDetail.grade || "Unassigned Grade"}</Badge>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        ID: {viewingStudentDetail.studentId || "PENDING"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                       <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Enrolled: {viewingStudentDetail.enrolledAt ? new Date(viewingStudentDetail.enrolledAt).toLocaleDateString() : 'N/A'}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <Card className="p-5 border-none bg-gray-50">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-fluent-teal border border-black/5 shadow-sm">
                        <Award size={20} />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mastery Level</div>
                        <div className="text-lg font-bold text-fluent-navy">
                          { (viewingStudentDetail.total) > 0 ? Math.round((viewingStudentDetail.attended / viewingStudentDetail.total) * 100) : 0}%
                        </div>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-fluent-teal transition-all duration-1000" 
                        style={{ width: `${(viewingStudentDetail.total) > 0 ? Math.round((viewingStudentDetail.attended / viewingStudentDetail.total) * 100) : 0}%` }}
                      />
                    </div>
                  </Card>
                  <Card className="p-5 flex items-center gap-4 border-none bg-gray-50">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-fluent-gold border border-black/5 shadow-sm">
                      <TrendingUp size={20} />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Attendance Rate</div>
                      <div className="text-lg font-bold text-fluent-navy">{viewingStudentDetail.attended}/{viewingStudentDetail.total}</div>
                    </div>
                  </Card>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 px-1 flex justify-between items-center">
                      <span>Contact Intelligence</span>
                      <span className="text-[8px] opacity-60">Editable</span>
                    </h4>
                    <div className="grid gap-3">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl group border border-transparent hover:border-black/5">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 shrink-0">
                            <Mail size={16} />
                          </div>
                          <div className="flex-1">
                            <input 
                              id="edit-student-email"
                              defaultValue={viewingStudentDetail.email || `${viewingStudentDetail.name.toLowerCase().replace(' ', '.')}@st.edu`}
                              className="w-full bg-transparent text-xs font-bold text-slate-600 focus:outline-none focus:ring-1 focus:ring-fluent-teal/20 rounded px-1"
                              placeholder="Enter student email"
                            />
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider text-left">Primary Email</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl group border border-transparent hover:border-black/5">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 shrink-0">
                            <Phone size={16} />
                          </div>
                          <div className="flex-1">
                            <input 
                              id="edit-student-phone"
                              defaultValue={viewingStudentDetail.phone || "+91 (555) 000-1234"}
                              className="w-full bg-transparent text-xs font-bold text-slate-600 focus:outline-none focus:ring-1 focus:ring-fluent-teal/20 rounded px-1"
                              placeholder="Enter parent contact"
                            />
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider text-left">Emergency Contact</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 px-1">Performance Insight</h4>
                    <div className="p-5 bg-fluent-cream/50 rounded-2xl border border-black/5 space-y-4">
                      <div className="text-xs font-medium text-slate-600 leading-relaxed">
                        <span className="text-fluent-navy font-bold">Faculty Assessment:</span> "Student demonstrates consistent engagement in {selectedClassForStudents?.name || 'enrolled subjects'}. Academic trajectory shows a { (viewingStudentDetail.attended > (viewingStudentDetail.total / 2)) ? 'positive' : 'stable' } upward trend with strong emphasis on class participation."
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-1 p-3 bg-white rounded-xl border border-black/5">
                          <div className="text-[8px] font-bold text-slate-400 uppercase mb-1">Consistency</div>
                          <div className="text-xs font-bold text-fluent-teal">High Reliability</div>
                        </div>
                        <div className="flex-1 p-3 bg-white rounded-xl border border-black/5">
                          <div className="text-[8px] font-bold text-slate-400 uppercase mb-1">Risk Profile</div>
                          <div className="text-xs font-bold text-green-500">Low Attrition</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 px-1 flex justify-between items-center text-red-500">
                      <span>Private Faculty Feedback</span>
                      <Shield size={10} className="ml-1" />
                    </h4>
                    <div className="relative">
                      <textarea
                        id="edit-student-feedback"
                        defaultValue={viewingStudentDetail.privateFeedback || ""}
                        className="w-full bg-red-50/30 border border-red-100 rounded-2xl p-5 text-xs text-slate-700 min-h-[120px] focus:outline-none focus:ring-1 focus:ring-red-200 transition-all placeholder:text-slate-300"
                        placeholder="Internal notes only visible to faculty members..."
                      />
                      <div className="absolute top-4 right-4 pointer-events-none">
                        <Lock size={12} className="text-red-200" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-6 border-t border-black/5 flex gap-3">
                  <Btn variant="primary" className="flex-1" onClick={async () => {
                    const email = (document.getElementById('edit-student-email') as HTMLInputElement).value;
                    const phone = (document.getElementById('edit-student-phone') as HTMLInputElement).value;
                    const privateFeedback = (document.getElementById('edit-student-feedback') as HTMLTextAreaElement).value;
                    try {
                      const studentRef = doc(db, 'classes', selectedClassForStudents.id, 'students', viewingStudentDetail.id);
                      await updateDoc(studentRef, { email, phone, privateFeedback });
                      // Update the selected student in classStudents if possible, but easier to just close
                      setViewingStudentDetail(null);
                    } catch (error) {
                      handleFirestoreError(error, OperationType.UPDATE, `classes/${selectedClassForStudents.id}/students/${viewingStudentDetail.id}`);
                    }
                  }}>Sync Profile Data</Btn>
                  <Btn variant="outline" className="flex-1" onClick={() => {
                    setViewingStudentDetail(null);
                    setViewingHistory(viewingStudentDetail);
                  }}>Attendance Logs</Btn>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {viewingHistory && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[40px] w-full max-w-md p-10 shadow-2xl relative"
            >
              <button 
                onClick={() => setViewingHistory(null)}
                className="absolute top-8 right-8 text-slate-400 hover:text-black transition-colors"
              >
                <X size={24} />
              </button>

              <div className="flex items-center gap-4 mb-10">
                <Avatar name={viewingHistory.name} size={48} />
                <div>
                  <h3 className="text-2xl font-serif font-bold">{viewingHistory.name}</h3>
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Attendance Record</div>
                </div>
              </div>

              <div className="space-y-4 max-h-[300px] overflow-auto pr-2 pb-4">
                {viewingHistory.history && viewingHistory.history.length > 0 ? (
                  viewingHistory.history.slice().reverse().map((entry: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-black/5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-white border border-black/5">
                          <Calendar size={16} className="text-fluent-teal" />
                        </div>
                        <div className="text-sm font-bold text-slate-600">{new Date(entry.date).toLocaleDateString()}</div>
                      </div>
                      <Badge color={entry.status === 'present' ? 'navy' : 'gold'}>
                        {entry.status.toUpperCase()}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <p className="text-sm font-medium">No historical data available yet.</p>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-8 border-t border-black/5 flex justify-between items-center">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Aggregate Rate</div>
                  <div className="text-2xl font-mono font-bold text-fluent-teal">
                    {viewingHistory.total > 0 ? Math.round((viewingHistory.attended / viewingHistory.total) * 100) : 0}%
                  </div>
                </div>
                <Btn variant="primary" onClick={() => setViewingHistory(null)}>Done</Btn>
              </div>
            </motion.div>
          </div>
        )}

        {editingStudent && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[40px] w-full max-w-sm p-10 shadow-2xl relative"
            >
              <button 
                onClick={() => setEditingStudent(null)}
                className="absolute top-8 right-8 text-slate-400 hover:text-black transition-colors"
              >
                <X size={24} />
              </button>

              <div className="mb-8">
                <h3 className="text-2xl font-serif font-bold">Edit Student</h3>
                <p className="text-sm text-slate-400 mt-1">Update profile information for {editingStudent.name}.</p>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-black/5">
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">System ID</div>
                    <div className="text-xs font-mono font-bold text-fluent-navy">{editingStudent.studentId || "PENDING"}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Enrolled On</div>
                    <div className="text-xs font-bold text-slate-600">{editingStudent.enrolledAt ? new Date(editingStudent.enrolledAt).toLocaleDateString() : 'N/A'}</div>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Full Name</label>
                  <input 
                    type="text" 
                    defaultValue={editingStudent.name}
                    id="edit-student-name"
                    className="w-full px-4 py-3 bg-gray-50 border border-black/5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fluent-teal/20 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Assigned Grade</label>
                  <select 
                    id="edit-student-grade"
                    defaultValue={editingStudent.grade || selectedClassForStudents?.grade || "Grade 10"}
                    className="w-full px-4 py-3 bg-gray-50 border border-black/5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fluent-teal/20 transition-all font-medium"
                  >
                    <option>Grade 9</option>
                    <option>Grade 10</option>
                    <option>Grade 11</option>
                    <option>Grade 12</option>
                  </select>
                </div>
              </div>

              <div className="mt-10 flex gap-3">
                <Btn variant="outline" className="flex-1" onClick={() => setEditingStudent(null)}>Cancel</Btn>
                <Btn variant="primary" className="flex-1" onClick={async () => {
                  const newName = (document.getElementById('edit-student-name') as HTMLInputElement).value;
                  const newGrade = (document.getElementById('edit-student-grade') as HTMLSelectElement).value;
                  
                  if (!newName.trim()) return;

                  try {
                    const studentRef = doc(db, 'classes', selectedClassForStudents.id, 'students', editingStudent.id);
                    await updateDoc(studentRef, { name: newName, grade: newGrade });
                    setEditingStudent(null);
                  } catch (error) {
                    handleFirestoreError(error, OperationType.UPDATE, `classes/${selectedClassForStudents.id}/students/${editingStudent.id}`);
                  }
                }}>Save Changes</Btn>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
};

const StudentDashboard = ({ profile, onBack }: { profile?: any, onBack: () => void }) => {
  const [activeNav, setActiveNav] = useState("overview");
  const [showNotification, setShowNotification] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [myRecords, setMyRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const studentName = profile?.name || auth.currentUser?.displayName || "Arjun Sharma";
  const studentGrade = profile?.grade || "Grade 10";

  useEffect(() => {
    if (!studentName) return;
    const q = query(collectionGroup(db, 'students'), where('name', '==', studentName));
    const unsub = onSnapshot(q, (snap) => {
      const records = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMyRecords(records);
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'collectionGroup/students'));
    return () => unsub();
  }, [studentName]);

  const navItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "subjects", label: "My Subjects", icon: BookOpen },
    { id: "sessions", label: "Sessions", icon: Calendar, badge: "2 New" },
    { id: "progress", label: "Progress", icon: BarChart3 },
    { id: "achievements", label: "Achievements", icon: Award },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  // Map myRecords to subjectProgress format
  const subjectProgress = myRecords.map(r => {
    const score = r.total > 0 ? Math.round((r.attended / r.total) * 100) : 0;
    // Calculate trend from history
    const lastScores = (r.history || []).slice(-4);
    const trend = lastScores.length > 1 ? (score - (lastScores[0].status === 'present' ? 50 : 0)) : 0; // Simple mock trend

    const colors: any = {
      "Mathematics": "#1B4F5E",
      "Physics": "#0D1B2A",
      "Chemistry": "#7C3AED",
      "Biology": "#10B981",
      "English": "#C9A84C"
    };

    return {
      name: r.subject || "General",
      className: r.className || "Class",
      score,
      sessions: r.total,
      trend: trend >= 0 ? `+${trend}%` : `${trend}%`,
      color: colors[r.subject] || "#1B4F5E",
      history: (r.history || []).map((h: any, idx: number) => ({ week: `S${idx + 1}`, score: h.status === 'present' ? 100 : 0 }))
    };
  });

  const overallMastery = subjectProgress.length > 0 
    ? Math.round(subjectProgress.reduce((acc, curr) => acc + curr.score, 0) / subjectProgress.length) 
    : 0;
  
  const totalSessions = myRecords.reduce((acc, curr) => acc + (curr.total || 0), 0);

  const upcomingSessions = [
    { subject: "Mathematics", topic: "Quadratic Equations", time: "Today, 4:00 PM", teacher: "Dr. Sarah Mills", color: "#1B4F5E" },
    { subject: "English", topic: "Academic Writing Techniques", time: "Tomorrow, 10:00 AM", teacher: "Mr. James Harrow", color: "#C9A84C" },
    { subject: "Physics", topic: "Laws of Motion", time: "Wed, 3:00 PM", teacher: "Dr. Priya Mehta", color: "#0D1B2A" },
  ];

  const handleJoin = () => {
    setIsJoining(true);
    setTimeout(() => {
      setIsJoining(false);
      alert("Opening live session for Mathematics: Quadratic Equations... (Demo Only)");
    }, 1000);
  };

  return (
    <DashboardShell role="student" title={studentName} navItems={navItems} activeNav={activeNav} setActiveNav={setActiveNav} onBack={onBack}>
      <div className="p-10 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
          <div>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.15em] mb-2">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} • {studentGrade}</div>
            <h1 className="text-4xl font-serif font-bold tracking-tight">
              Good morning, <span className="text-fluent-teal italic font-normal">{studentName.split(' ')[0]}</span> ✦
            </h1>
            <p className="text-slate-500 mt-2">Targeting {profile?.goal || "Academic Excellence"} • Momentum looks strong.</p>
          </div>
          <div className="flex gap-3 relative">
            <Btn 
              variant="outline" 
              size="sm" 
              icon={Bell} 
              onClick={() => setShowNotification(!showNotification)}
              className={showNotification ? "bg-fluent-gold/10 border-fluent-gold" : ""}
            >
              Notifications
            </Btn>
            {showNotification && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full right-0 mt-2 w-72 bg-white border border-black/5 rounded-xl shadow-2xl z-50 p-4"
              >
                <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Recent Alerts</div>
                <div className="space-y-4">
                  <div className="p-3 bg-fluent-teal/5 rounded-lg">
                    <div className="text-xs font-bold text-fluent-teal">New Feedback Available</div>
                    <div className="text-[10px] text-slate-500 mt-1">Dr. Sarah left a note on your Algebra submission.</div>
                  </div>
                  <div className="p-3 bg-fluent-gold/5 rounded-lg">
                    <div className="text-xs font-bold text-fluent-gold">Session Starting Soon</div>
                    <div className="text-[10px] text-slate-500 mt-1">Mathematics starts in 45 minutes.</div>
                  </div>
                </div>
              </motion.div>
            )}
            <Btn 
              variant="primary" 
              size="sm" 
              icon={isJoining ? Sparkles : Play} 
              onClick={handleJoin}
              disabled={isJoining}
            >
              {isJoining ? "Connecting..." : "Join Session"}
            </Btn>
          </div>
        </header>

        {activeNav === "progress" ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid lg:grid-cols-2 gap-8">
              {subjectProgress.map((s) => (
                <Card key={s.name} className="p-8">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h3 className="text-xl font-serif font-bold text-fluent-navy">{s.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge color="teal">{s.sessions} Sessions Completed</Badge>
                        <span className="text-xs font-bold text-green-600">{s.trend} improvement</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-mono font-bold text-fluent-navy">{s.score}%</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Current Mastery</div>
                    </div>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={s.history}>
                        <defs>
                          <linearGradient id={`gradient-${s.name}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={s.color} stopOpacity={0.2}/>
                            <stop offset="95%" stopColor={s.color} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis 
                          dataKey="week" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }}
                          dy={10}
                        />
                        <YAxis 
                          hide 
                          domain={[0, 100]}
                        />
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white p-3 rounded-lg shadow-xl border border-black/5">
                                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{payload[0].payload.week}</div>
                                  <div className="text-lg font-mono font-bold text-fluent-navy transition-all">{payload[0].value}%</div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="score" 
                          stroke={s.color} 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill={`url(#gradient-${s.name})`}
                          animationDuration={1500}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="mt-8 flex justify-between items-center pt-6 border-t border-black/5">
                    <div className="flex -space-x-2">
                       {[1,2,3].map(i => (
                         <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200" />
                       ))}
                       <div className="w-6 h-6 rounded-full border-2 border-white bg-fluent-navy text-[10px] flex items-center justify-center text-white font-bold">+12</div>
                    </div>
                    <Btn variant="ghost" size="sm" icon={ArrowRight} className="text-xs font-bold uppercase tracking-widest">Detailed Sub-Topic Analysis</Btn>
                  </div>
                </Card>
              ))}
            </div>
            
            <Card className="p-10 bg-fluent-navy text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-fluent-gold/10 rounded-full blur-[100px]" />
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                <div>
                  <h3 className="text-2xl font-serif font-bold mb-2">Predicted Outcome: Final Boards</h3>
                  <p className="text-white/40 text-sm max-w-md">Based on your current learning trajectory and mastery speed, you are on track for an <span className="text-fluent-gold font-bold italic">A1 (92-96%)</span> grade profile.</p>
                </div>
                <div className="flex gap-4 shrink-0">
                  <Btn variant="gold" size="md">Download Term Report</Btn>
                  <Btn variant="outline" size="md" className="text-white border-white/20">Consult Faculty</Btn>
                </div>
              </div>
            </Card>
          </div>
        ) : activeNav === "overview" ? (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <MetricTile label="Overall Mastery" value={`${overallMastery}%`} delta={overallMastery > 70 ? "+2%" : "-1%"} icon={BarChart3} color="#1B4F5E" />
              <MetricTile label="Sessions Attend" value={`${totalSessions}`} delta="+0" icon={Calendar} color="#0D1B2A" />
              <MetricTile label="Learning Streak" value="0" delta="+0" icon={Zap} color="#7C3AED" />
              <MetricTile label="Assignments" value="0" delta="+0" icon={CheckCircle2} color="#C9A84C" />
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-start">
              <Card className="lg:col-span-2 p-8">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-serif font-bold">Subject Mastery</h3>
                  <Btn variant="ghost" size="sm" className="p-0 h-auto font-bold text-fluent-teal" onClick={() => setActiveNav("progress")}>Full Analytics →</Btn>
                </div>
                <div className="space-y-8">
                  {subjectProgress.map(s => (
                    <div key={s.name} className="flex items-center gap-8 group cursor-pointer" onClick={() => setActiveNav("progress")}>
                      <div className="w-32 shrink-0">
                        <div className="font-bold text-sm text-fluent-navy group-hover:text-fluent-teal transition-colors">{s.name}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{s.sessions} sessions</div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <ProgressBar value={s.score} color={s.color} showPct={false} />
                        <div className="h-6 w-full opacity-30 group-hover:opacity-100 transition-opacity">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={s.history}>
                                <Line type="monotone" dataKey="score" stroke={s.color} strokeWidth={2} dot={false} />
                              </LineChart>
                            </ResponsiveContainer>
                        </div>
                      </div>
                      <div className="w-16 text-right shrink-0">
                        <div className="font-mono font-bold text-lg leading-none">{s.score}%</div>
                        <div className="text-[10px] text-green-600 font-bold">{s.trend}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-serif font-bold">Upcoming</h3>
                  <Btn variant="ghost" size="sm" className="p-0 h-auto" onClick={() => setActiveNav("sessions")}>View All</Btn>
                </div>
                <div className="space-y-4">
                  {upcomingSessions.map((s, i) => (
                    <div key={i} className="group p-4 bg-gray-50 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300 border border-transparent hover:border-black/5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: s.color }} />
                        <div>
                          <div className="font-bold text-sm text-fluent-navy">{s.subject}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{s.topic}</div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-black/5">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                          <Calendar size={12} />
                          {s.time}
                        </div>
                        <div className="text-[10px] font-bold text-fluent-teal">{s.teacher}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </>
        ) : (
          <div className="py-20 text-center">
            <div className="w-20 h-20 rounded-2xl bg-fluent-navy/5 flex items-center justify-center mx-auto mb-6 text-fluent-navy/20">
              {navItems.find(n => n.id === activeNav)?.icon && React.createElement(navItems.find(n => n.id === activeNav)!.icon, { size: 40 })}
            </div>
            <h3 className="text-2xl font-serif font-bold mb-2 uppercase tracking-tight">{activeNav} View</h3>
            <p className="text-slate-400 max-w-sm mx-auto">This module is currently in active development. Check back soon for updated {activeNav} tracking.</p>
            <Btn variant="outline" size="sm" className="mt-8" onClick={() => setActiveNav("overview")}>Back to Overview</Btn>
          </div>
        )}
      </div>
    </DashboardShell>
  );
};

const ParentDashboard = ({ profile, onBack }: { profile?: any, onBack: () => void }) => {
  const [activeNav, setActiveNav] = useState("overview");
  const [activeChild, setActiveChild] = useState(0);
  const [monitoredStudents, setMonitoredStudents] = useState<any[]>([]);
  const [showAddChild, setShowAddChild] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [allStudentRecords, setAllStudentRecords] = useState<any[]>([]);

  const parentName = profile?.name || auth.currentUser?.displayName || "Rahul Sharma";

  useEffect(() => {
    if (!auth.currentUser) return;
    const unsub = onSnapshot(collection(db, 'users', auth.currentUser.uid, 'monitoredStudents'), (snap) => {
      setMonitoredStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  // Fetch all records for the selected child
  const [childRecords, setChildRecords] = useState<any[]>([]);
  useEffect(() => {
    if (monitoredStudents.length === 0 || activeChild >= monitoredStudents.length) {
      setChildRecords([]);
      return;
    }
    const childName = monitoredStudents[activeChild].name;
    const q = query(collectionGroup(db, 'students'), where('name', '==', childName));
    const unsub = onSnapshot(q, (snap) => {
      setChildRecords(snap.docs.map(doc => doc.data()));
    });
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
          <Btn variant="gold" icon={Calendar} size="sm">Book Faculty Consultation</Btn>
        </header>

        {/* Child Selector */}
        <div className="flex gap-4 mb-10 overflow-x-auto pb-2 -mx-2 px-2">
          {monitoredStudents.map((c, i) => (
            <div 
              key={i} 
              onClick={() => setActiveChild(i)}
              className={`flex items-center gap-4 px-6 py-4 rounded-xl cursor-pointer transition-all border-2 shrink-0 ${
                activeChild === i ? "bg-fluent-navy border-fluent-navy text-white shadow-xl shadow-fluent-navy/10" : "bg-white border-black/5 text-fluent-navy hover:border-black/20"
              }`}
            >
              <Avatar name={c.name} size={40} color={activeChild === i ? "var(--color-fluent-gold)" : "var(--color-fluent-teal)"} />
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
            <div className="font-bold text-sm">Link Another Student</div>
          </div>
        </div>

        {showAddChild && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-fluent-navy/20 backdrop-blur-sm">
             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl">
                <h3 className="text-2xl font-serif font-bold mb-4">Link Student Profile</h3>
                <p className="text-sm text-slate-500 mb-8">Enter your child's full name as registered in their student portal to begin monitoring.</p>
                <input 
                  type="text" 
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="Student Full Name..." 
                  className="w-full p-4 bg-gray-50 border border-black/10 rounded-2xl mb-6 focus:outline-none focus:ring-2 focus:ring-fluent-teal/20"
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
              <MetricTile label="Family Mastery" value={`${Math.round(subjectData.reduce((acc, curr) => acc + curr.score, 0) / (subjectData.length || 1))}%`} delta="+0%" icon={TrendingUp} color="var(--color-fluent-teal)" />
              <MetricTile label="Live Sessions" value={`${childRecords.length}`} delta="+0" icon={Calendar} color="var(--color-fluent-navy)" />
              <MetricTile label="Assignment Quality" value="Pending" delta="+0%" icon={CheckCircle2} color="var(--color-fluent-gold)" />
              <MetricTile label="Attendance Rate" value="98%" icon={ShieldCheck} color="var(--color-fluent-gold)" />
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-start">
              <Card className="lg:col-span-2 p-8">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-serif font-bold">{monitoredStudents[activeChild].name}'s Subject Mastery</h3>
                  <Badge color="navy">Active Curriculum</Badge>
                </div>
                <div className="space-y-6">
                  {subjectData.length > 0 ? subjectData.map(s => (
                    <div key={s.subject} className="p-5 bg-gray-50 rounded-xl hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-black/5">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <div className="font-bold text-sm text-fluent-navy">{s.subject}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tutor: {s.teacher} (UK Accredited)</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-xl leading-none">{s.score}%</div>
                          <div className={`text-[10px] font-bold mt-1 ${s.score > s.lastWeek ? 'text-green-600' : 'text-red-500'}`}>
                            {s.score > s.lastWeek ? "↑" : "↓"} {Math.abs(s.score - s.lastWeek)}% from assessment {monitoredStudents[activeChild].name.split(' ')[0] === 'Priya' ? '12' : '15'}
                          </div>
                        </div>
                      </div>
                      <ProgressBar value={s.score} color={s.subject.includes('English') ? 'var(--color-fluent-gold)' : 'var(--color-fluent-teal)'} showPct={false} />
                    </div>
                  )) : (
                    <div className="p-12 text-center bg-gray-50 rounded-[32px] border border-dashed border-slate-200">
                      <p className="text-slate-400 text-sm">No academic records found for this student yet.</p>
                    </div>
                  )}
                </div>
              </Card>

              <div className="space-y-6">
                <Card className="p-8">
                  <h3 className="text-xl font-serif font-bold mb-6">Faculty Feedback</h3>
                  <div className="space-y-6">
                    <div className="p-5 bg-fluent-navy text-white rounded-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12" />
                      <div className="flex justify-between items-start mb-3 relative z-10">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-fluent-gold">Latest Verified Note</span>
                        <Badge color="gold">Physics</Badge>
                      </div>
                      <p className="text-xs text-white/70 leading-relaxed italic relative z-10">
                        "Your child is demonstrating advanced conceptual linking in Mechanics. Recommend moving to Phase 2 scaffolding."
                      </p>
                      <div className="text-[10px] text-white/30 mt-4 font-bold uppercase tracking-wider">Mr. Alex Wright • UK Veteran Faculty</div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Upcoming Events</div>
                      {[
                        { title: "Personal Mastery Review", time: "Thu, 6:00 PM" },
                        { title: "British Council Exam Prep", time: "Sat, 11:00 AM" }
                      ].map((e, i) => (
                        <div key={i} className="flex items-center justify-between p-3 border border-black/5 rounded-lg text-xs">
                          <span className="font-bold text-fluent-navy">{e.title}</span>
                          <span className="text-slate-400 font-mono">{e.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
                
                <Card className="bg-fluent-gold/5 border-fluent-gold/20 p-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-fluent-gold/20 flex items-center justify-center shrink-0">
                      <Award size={18} className="text-[#92620A]" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#92620A] mb-1">Board Excellence Track</div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Arjun's 2026 Board projection is currently <span className="font-bold text-fluent-navy">94.8%</span>.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </>
        ) : (
          <div className="py-20 text-center">
             <div className="w-20 h-20 rounded-2xl bg-fluent-navy/5 flex items-center justify-center mx-auto mb-6 text-fluent-navy/20">
              {navItems.find(n => n.id === activeNav)?.icon && React.createElement(navItems.find(n => n.id === activeNav)!.icon, { size: 40 })}
            </div>
            <h3 className="text-2xl font-serif font-bold mb-2 uppercase tracking-tight">{activeNav} Control</h3>
            <p className="text-slate-400 max-w-sm mx-auto">This portal module is being calibrated for Parent oversight. Access will be granted following registration.</p>
            <Btn variant="outline" size="sm" className="mt-8" onClick={() => setActiveNav("overview")}>Back to Family Overview</Btn>
          </div>
        )}
      </div>
    </DashboardShell>
  );
};

const AdminCommand = ({ onBack }: { onBack: () => void }) => {
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'waitlist'), (snap) => {
      setWaitlist(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'waitlist'));
    return () => unsub();
  }, []);

  const handleResolve = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'waitlist', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `waitlist/${id}`);
    }
  };
  const [activeNav, setActiveNav] = useState("overview");

  const navItems = [
    { id: "overview", label: "Strategic Command", icon: Home },
    { id: "institutions", label: "Partner Schools", icon: Globe },
    { id: "faculty", label: "Faculty Audits", icon: Award },
    { id: "curriculum", label: "Curriculum Health", icon: BookOpen },
    { id: "analytics", label: "System Analytics", icon: BarChart3 },
    { id: "settings", label: "System Config", icon: Settings },
  ];

  const schools = [
    { name: "Academic City School", students: 320, teachers: 8, avg: 84, status: "active", plan: "Premium" },
    { name: "British International", students: 280, teachers: 6, avg: 79, status: "active", plan: "Elite" },
    { name: "Global Excellence Acad.", students: 195, teachers: 5, avg: 88, status: "active", plan: "Elite" },
  ];

  return (
    <DashboardShell role="admin" title="Institutional Oversight" navItems={navItems} activeNav={activeNav} setActiveNav={setActiveNav} onBack={onBack}>
      <div className="p-10 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge color="gold">Global Administrator</Badge>
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">All Systems Operational</span>
            </div>
            <h1 className="text-3xl font-serif font-bold tracking-tight">Institutional Command</h1>
            <p className="text-slate-500 mt-1">High-stakes oversight of curriculum integrity and faculty performance.</p>
          </div>
          <div className="flex gap-3">
            <Btn variant="outline" size="sm" icon={ShieldCheck}>Security Audit</Btn>
            <Btn variant="primary" size="sm" icon={Plus}>Onboard Partner</Btn>
          </div>
        </header>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <MetricTile label="Institutional Students" value="45.2K" delta="+1.2K" icon={Users} color="var(--color-fluent-teal)" />
          <MetricTile label="Faculty Compliance" value="99.4%" delta="+0.2%" icon={ShieldCheck} color="var(--color-fluent-navy)" />
          <MetricTile label="Curriculum Health" value="94%" icon={BookOpen} color="var(--color-fluent-gold)" />
          <MetricTile label="System Efficiency" value="99.9%" icon={Zap} color="#7C3AED" />
        </div>

        <Card className="p-8 mb-10">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-serif font-bold">Waitlist Applications</h3>
            <Badge color="gold">{waitlist.length} Pending</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-black/5">
                  <th className="text-left py-4 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</th>
                  <th className="text-left py-4 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Requested On</th>
                  <th className="text-center py-4 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {waitlist.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-slate-400 italic">No pending waitlist applications.</td>
                  </tr>
                ) : waitlist.map((entry, i) => (
                  <tr key={entry.id || i} className="border-b border-black/5 hover:bg-gray-50 transition-colors">
                    <td className="py-5 px-4 font-bold text-sm text-fluent-navy">{entry.email}</td>
                    <td className="py-5 px-4 text-sm text-slate-500 font-medium font-mono">
                      {entry.requestedAt?.toDate ? entry.requestedAt.toDate().toLocaleDateString() : 'Recent'}
                    </td>
                    <td className="py-5 px-4 text-center">
                      <Btn variant="outline" size="sm" onClick={() => handleResolve(entry.id)}>Resolve</Btn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-serif font-bold">Partner Institutions</h3>
                <div className="flex gap-4">
                  <Btn 
                    variant="outline" 
                    size="sm" 
                    icon={Database} 
                    onClick={async () => {
                      if (!confirm("Seed database with sample classes and students?")) return;
                      try {
                        const uid = auth.currentUser?.uid;
                        if (!uid) return;
                        
                        // Seed Classes
                        const sampleClasses = [
                          { name: "G10 Physics - Advanced", grade: "Grade 10", subject: "Physics", students: 5, avgScore: 88, attendance: 95, ownerId: uid, createdAt: serverTimestamp() },
                          { name: "G9 Maths - Logic", grade: "Grade 9", subject: "Mathematics", students: 3, avgScore: 72, attendance: 90, ownerId: uid, createdAt: serverTimestamp() }
                        ];

                        for (const c of sampleClasses) {
                          const classRef = await addDoc(collection(db, 'classes'), c);
                          // Add some students
                          const students = [
                            { name: "Akshay P.", attended: 10, total: 10, history: [], grade: c.grade },
                            { name: "Zoya K.", attended: 9, total: 10, history: [], grade: c.grade }
                          ];
                          for (const s of students) {
                            await addDoc(collection(db, 'classes', classRef.id, 'students'), s);
                          }
                        }

                        // Seed Student Pool
                        const pool = ["Vikram S.", "Leila O.", "Marcus T."];
                        for (const name of pool) {
                          await addDoc(collection(db, 'studentPool'), { name, ownerId: uid });
                        }

                        alert("Database seeded successfully!");
                      } catch (e) {
                        console.error(e);
                        alert("Seeding failed: " + e);
                      }
                    }}
                  >
                    Seed Sample Data
                  </Btn>
                  <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input placeholder="Search schools..." className="pl-10 pr-4 py-2 bg-gray-50 border border-black/5 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-fluent-navy/5" />
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-black/5">
                  <th className="text-left py-4 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">School</th>
                  <th className="text-left py-4 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Students</th>
                  <th className="text-left py-4 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Avg Mastery</th>
                  <th className="text-left py-4 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tier</th>
                  <th className="text-left py-4 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {schools.map((s, i) => (
                  <tr key={i} className="border-b border-black/5 hover:bg-gray-50 transition-colors">
                    <td className="py-5 px-4 font-bold text-sm text-fluent-navy">{s.name}</td>
                    <td className="py-5 px-4 text-sm text-slate-500 font-medium">{s.students}</td>
                    <td className="py-5 px-4">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-sm text-fluent-teal">{s.avg}%</span>
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-fluent-teal rounded-full" style={{ width: `${s.avg}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-4"><Badge color={s.plan === 'Elite' ? 'gold' : 'navy'}>{s.plan}</Badge></td>
                    <td className="py-5 px-4">
                      <div className="flex justify-center gap-2">
                        <Btn variant="ghost" size="sm" className="p-2"><Edit2 size={14} /></Btn>
                        <Btn variant="ghost" size="sm" className="p-2 text-red-400"><Trash2 size={14} /></Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
};

export default function App() {
  const [view, setView] = useState("landing");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
      if (u) {
        // Load profile
        const profileRef = doc(db, 'users', u.uid);
        onSnapshot(profileRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            setUserProfile(data);
            // Automatic navigation if onboarded
            if (data.onboarded) {
              if (data.role === 'teacher') setView("teacher-dashboard");
              else if (data.role === 'student') setView("student-dashboard");
              else if (data.role === 'parent') setView("parent-dashboard");
              else if (data.role === 'admin') setView("admin-dashboard");
            } else {
              setView("onboarding");
            }
          } else {
            setView("onboarding");
          }
        });
      } else {
        setUserProfile(null);
        setView("landing");
      }
    });
    return () => unsubscribe();
  }, []);

  const navigate = (v: string, profile?: any) => {
    if (profile) {
      setUserProfile(profile);
      // Persist profile to Firestore if user exists
      if (user) {
        const profileRef = doc(db, 'users', user.uid);
        setDoc(profileRef, { ...profile, onboarded: true }, { merge: true })
          .then(() => {
            // After saving, the onSnapshot in useEffect will handle navigation
          })
          .catch(e => handleFirestoreError(e, OperationType.WRITE, 'users'));
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setView(v);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setView("landing");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  if (!authReady) {
    return (
      <div className="h-screen flex items-center justify-center bg-fluent-cream">
        <Logo animate={true} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {view === "landing" && (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LandingPage onEnter={(v) => v === 'onboarding' ? handleLogin() : navigate(v)} />
          </motion.div>
        )}
        {view === "onboarding" && <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><OnboardingFlow onComplete={navigate} /></motion.div>}
        {view === "student-dashboard" && <motion.div key="std-dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><StudentDashboard profile={userProfile} onBack={handleLogout} /></motion.div>}
        {view === "teacher-dashboard" && <motion.div key="teach-dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><FacultyHub profile={userProfile} onBack={handleLogout} /></motion.div>}
        {view === "parent-dashboard" && <motion.div key="par-dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><ParentDashboard profile={userProfile} onBack={handleLogout} /></motion.div>}
        {view === "admin-dashboard" && <motion.div key="admin-dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><AdminCommand onBack={handleLogout} /></motion.div>}
      </AnimatePresence>
    </div>
  );
}
