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
  Users,
  GraduationCap,
  ShieldCheck,
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
  Edit2,
  Trash2,
  CheckCircle2
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

const Logo = ({ className = "", variant = "dark", onClick }: { className?: string, variant?: "dark" | "light", onClick?: () => void }) => (
  <div onClick={onClick} className={`flex items-center gap-2.5 cursor-pointer group ${className}`}>
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

const OnboardingFlow = ({ onComplete }: { onComplete: (view: string) => void }) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ role: "", name: "", school: "", grade: "", subjects: [] as string[], goal: "" });
  const [isLoading, setIsLoading] = useState(false);

  const steps = [
    { title: "Academic Role", subtitle: "We tailor the experience to your specific perspective." },
    { title: "Verification", subtitle: "Establishing your institutional footprint within Fluent." },
    { title: "Mastery Focus", subtitle: "Defining current levels and target educational outcomes." },
    { title: "Strategic Goal", subtitle: "What does success look like for your 2026-27 cycle?" },
    { title: "Synthesis Complete", subtitle: "Your personalised elite journey begins now." },
  ];

  const roles = [
    { id: "student", label: "Elite Student", icon: GraduationCap, desc: "Mastery tracking and live sessions in core subjects." },
    { id: "parent", label: "Academic Parent", icon: Users, desc: "Monitor multi-student progress and book British consultations." },
    { id: "teacher", label: "Expert Faculty", icon: BookOpen, desc: "Class cohorts, curriculum delivery and faculty tools." },
    { id: "admin", label: "Platform Admin", icon: ShieldCheck, desc: "Institutional health, staff management and system audits." },
  ];

  const grades = ["Grade 9", "Grade 10", "Grade 11", "Grade 12"];
  const subjectsList = ["Mathematics", "Physics", "Chemistry", "Biology", "English"];
  const goals = [
    "Ivy League / Oxbridge Preparation",
    "Board Exam Elite Performance (95%+)",
    "STEM Competitive Mastery",
    "Conceptual Foundation Reinforcement",
    "Advanced Faculty Collaboration",
  ];

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
      if (data.role === "parent") onComplete("parent-dashboard");
      else if (data.role === "teacher") onComplete("teacher-dashboard");
      else if (data.role === "admin") onComplete("admin-dashboard");
      else onComplete("student-dashboard");
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
                    Your FLUENT profile has been synthesized. We've matched you with our elite cohort resources for <span className="font-bold text-fluent-navy">{data.subjects.join(", ")}</span>.
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

const FacultyHub = ({ onBack }: { onBack: () => void }) => {
  const [activeNav, setActiveNav] = useState("overview");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);
  const [selectedClassForStudents, setSelectedClassForStudents] = useState<any>(null);

  const [classes, setClasses] = useState([
    { id: 1, name: "G10 Physics - Mechanics", grade: "Grade 10", subject: "Physics", students: 24, avgScore: 82, attendance: 98, studentList: ["Arjun Sharma", "Priya K.", "Rohan M."] },
    { id: 2, name: "G9 Mathematics - Proofs", grade: "Grade 9", subject: "Mathematics", students: 18, avgScore: 76, attendance: 94, studentList: ["Ananya S.", "Ishaan V."] },
    { id: 3, name: "G11 English - Rhetoric", grade: "Grade 11", subject: "English", students: 12, avgScore: 89, attendance: 100, studentList: ["Sanya R."] },
  ]);

  const navItems = [
    { id: "overview", label: "Faculty Console", icon: Home },
    { id: "cohorts", label: "Student Cohorts", icon: Users, badge: classes.length.toString() },
    { id: "live", label: "Live Delivery", icon: Play, badge: "Live" },
    { id: "curriculum", label: "British Methods", icon: BookOpen },
    { id: "analytics", label: "Mastery Grid", icon: BarChart3 },
    { id: "settings", label: "Preferences", icon: Settings },
  ];

  const sessions = [
    { time: "09:00 - 10:30", class: "Cohort 10A", subject: "Physics", topic: "Energy Conservation", status: "completed" },
    { time: "11:00 - 12:30", class: "Cohort 9B", subject: "Maths", topic: "Geometric Logic", status: "live" },
    { time: "14:00 - 15:30", class: "Cohort 11C", subject: "English", topic: "Shakespearean Flow", status: "upcoming" },
  ];

  const handleCreateClass = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newClass = {
      id: Date.now(),
      name: formData.get('name') as string,
      grade: formData.get('grade') as string,
      subject: formData.get('subject') as string,
      students: 0,
      avgScore: 0,
      attendance: 0,
      studentList: [],
    };
    setClasses([...classes, newClass]);
    setShowCreateModal(false);
  };

  const handleUpdateClass = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setClasses(classes.map(c => c.id === editingClass.id ? {
      ...c,
      name: formData.get('name') as string,
      grade: formData.get('grade') as string,
      subject: formData.get('subject') as string,
    } : c));
    setEditingClass(null);
  };

  return (
    <DashboardShell role="teacher" title="Dr. Sarah Mills" navItems={navItems} activeNav={activeNav} setActiveNav={setActiveNav} onBack={onBack}>
      <div className="p-10 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge color="teal">Expert Faculty</Badge>
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Live British Scaffolding Active</span>
            </div>
            <h1 className="text-3xl font-serif font-bold tracking-tight">
              {activeNav === 'overview' ? 'Faculty Hub' : `Manage ${activeNav}`}
            </h1>
            <p className="text-slate-500 mt-1">
              {activeNav === 'overview' ? 'Orchestrate your cohorts and monitor mastery across Science, Maths and English.' : `Deploy and refine your ${activeNav} strategies.`}
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
              onClick={() => setSelectedClassForStudents(null)}
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
                <button onClick={() => setSelectedClassForStudents(null)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-auto pr-2">
                <div className="flex items-center gap-4 p-4 bg-fluent-teal/5 rounded-xl mb-6">
                  <Search size={18} className="text-fluent-teal" />
                  <input placeholder="Search students to assign..." className="flex-1 bg-transparent text-sm focus:outline-none" />
                </div>

                <div className="space-y-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Class Roster ({selectedClassForStudents.studentList?.length})</div>
                  {selectedClassForStudents.studentList?.map((s: string, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Avatar name={s} size={32} />
                        <span className="font-bold text-sm text-fluent-navy">{s}</span>
                      </div>
                      <Btn variant="ghost" size="sm" className="text-red-400 hover:bg-red-50" onClick={() => {
                        const updated = classes.map(c => c.id === selectedClassForStudents.id ? {
                           ...c, 
                           studentList: c.studentList.filter(x => x !== s),
                           students: c.students - 1
                        } : c);
                        setClasses(updated);
                        setSelectedClassForStudents(updated.find(x => x.id === selectedClassForStudents.id));
                      }}>Remove</Btn>
                    </div>
                  ))}
                  
                  <div className="pt-8 border-t border-black/5">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Add or Reassign Students</div>
                    {["Ishaan V.", "Meera P.", "Kabir J.", "Sanya R."].filter(x => !selectedClassForStudents.studentList?.includes(x)).map((s, i) => (
                      <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors rounded-xl group">
                         <div className="flex items-center gap-3">
                            <Avatar name={s} size={32} color="#94A3B8" />
                            <span className="font-medium text-sm text-slate-600">{s}</span>
                          </div>
                          <Btn variant="outline" size="sm" className="opacity-0 group-hover:opacity-100" onClick={() => {
                            const updated = classes.map(c => c.id === selectedClassForStudents.id ? {
                               ...c, 
                               studentList: [...(c.studentList || []), s],
                               students: c.students + 1
                            } : c);
                            setClasses(updated);
                            setSelectedClassForStudents(updated.find(x => x.id === selectedClassForStudents.id));
                          }}>Assign to Class</Btn>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-black/5">
                <Btn variant="primary" className="w-full" onClick={() => setSelectedClassForStudents(null)}>Confirm Changes</Btn>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
};

const StudentDashboard = ({ onBack }: { onBack: () => void }) => {
  const [activeNav, setActiveNav] = useState("overview");
  const [showNotification, setShowNotification] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const navItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "subjects", label: "My Subjects", icon: BookOpen },
    { id: "sessions", label: "Sessions", icon: Calendar, badge: "2 New" },
    { id: "progress", label: "Progress", icon: BarChart3 },
    { id: "achievements", label: "Achievements", icon: Award },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const upcomingSessions = [
    { subject: "Mathematics", topic: "Quadratic Equations", time: "Today, 4:00 PM", teacher: "Dr. Sarah Mills", color: "#1B4F5E" },
    { subject: "English", topic: "Academic Writing Techniques", time: "Tomorrow, 10:00 AM", teacher: "Mr. James Harrow", color: "#C9A84C" },
    { subject: "Physics", topic: "Laws of Motion", time: "Wed, 3:00 PM", teacher: "Dr. Priya Mehta", color: "#0D1B2A" },
  ];

  const subjectProgress = [
    { 
      name: "Mathematics", 
      score: 82, 
      sessions: 24, 
      trend: "+8%", 
      color: "#1B4F5E",
      history: [{ week: "W1", score: 65 }, { week: "W2", score: 72 }, { week: "W3", score: 78 }, { week: "W4", score: 82 }]
    },
    { 
      name: "Physics", 
      score: 74, 
      sessions: 18, 
      trend: "+12%", 
      color: "#0D1B2A",
      history: [{ week: "W1", score: 58 }, { week: "W2", score: 64 }, { week: "W3", score: 70 }, { week: "W4", score: 74 }]
    },
    { 
      name: "Chemistry", 
      score: 68, 
      sessions: 15, 
      trend: "+15%", 
      color: "#7C3AED",
      history: [{ week: "W1", score: 45 }, { week: "W2", score: 55 }, { week: "W3", score: 62 }, { week: "W4", score: 68 }]
    },
    { 
      name: "Biology", 
      score: 89, 
      sessions: 20, 
      trend: "+5%", 
      color: "#10B981",
      history: [{ week: "W1", score: 75 }, { week: "W2", score: 82 }, { week: "W3", score: 85 }, { week: "W4", score: 89 }]
    },
    { 
      name: "English (Academic)", 
      score: 94, 
      sessions: 22, 
      trend: "+3%", 
      color: "#C9A84C",
      history: [{ week: "W1", score: 88 }, { week: "W2", score: 90 }, { week: "W3", score: 92 }, { week: "W4", score: 94 }]
    },
  ];

  const handleJoin = () => {
    setIsJoining(true);
    setTimeout(() => {
      setIsJoining(false);
      alert("Opening live session for Mathematics: Quadratic Equations... (Demo Only)");
    }, 1000);
  };

  return (
    <DashboardShell role="student" title="Arjun Sharma" navItems={navItems} activeNav={activeNav} setActiveNav={setActiveNav} onBack={onBack}>
      <div className="p-10 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
          <div>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.15em] mb-2">Monday, 5 May 2026</div>
            <h1 className="text-4xl font-serif font-bold tracking-tight">
              Good morning, <span className="text-fluent-teal italic font-normal">Arjun</span> ✦
            </h1>
            <p className="text-slate-500 mt-2">You have 2 sessions today. Keep up the momentum!</p>
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
              <MetricTile label="Overall Mastery" value="82%" delta="+6%" icon={BarChart3} color="#1B4F5E" />
              <MetricTile label="Sessions Attend" value="79" delta="+4" icon={Calendar} color="#0D1B2A" />
              <MetricTile label="Learning Streak" value="12" delta="+3" icon={Zap} color="#7C3AED" />
              <MetricTile label="Assignments" value="34" delta="+7" icon={CheckCircle2} color="#C9A84C" />
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

const ParentDashboard = ({ onBack }: { onBack: () => void }) => {
  const [activeNav, setActiveNav] = useState("overview");
  const [activeChild, setActiveChild] = useState(0);

  const navItems = [
    { id: "overview", label: "Family Overview", icon: Home },
    { id: "progress", label: "Progress Reports", icon: BarChart3 },
    { id: "sessions", label: "Sessions", icon: Calendar },
    { id: "messages", label: "Messages", icon: Mail, badge: "3" },
    { id: "billing", label: "Billing", icon: Lock },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const children = [
    { name: "Arjun Sharma", grade: "Grade 10", school: "DPS Bangalore" },
    { name: "Priya Sharma", grade: "Grade 11", school: "DPS Bangalore" },
  ];

  const child = children[activeChild];

  const subjectData = [
    { subject: "Mathematics", score: 82, lastWeek: 76, teacher: "Dr. Sarah Mills" },
    { subject: "Physics", score: 74, lastWeek: 62, teacher: "Mr. Alex Wright" },
    { subject: "Chemistry", score: 68, lastWeek: 65, teacher: "Dr. Elena Rossi" },
    { subject: "Biology", score: 89, lastWeek: 87, teacher: "Dr. S. Venkatesh" },
    { subject: "Academic English", score: 94, lastWeek: 89, teacher: "Ms. Jane Cooper" },
  ];

  return (
    <DashboardShell role="parent" title="Rahul Sharma" navItems={navItems} activeNav={activeNav} setActiveNav={setActiveNav} onBack={onBack}>
      <div className="p-10 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
          <div>
            <h1 className="text-3xl font-serif font-bold tracking-tight">Parent Desk</h1>
            <p className="text-slate-500 mt-1">Real-time oversight of child academic fluency and British faculty feedback.</p>
          </div>
          <Btn variant="gold" icon={Calendar} size="sm">Book Faculty Consultation</Btn>
        </header>

        {/* Child Selector */}
        <div className="flex gap-4 mb-10 overflow-x-auto pb-2 -mx-2 px-2">
          {children.map((c, i) => (
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
                <div className={`text-[10px] font-bold uppercase tracking-wider ${activeChild === i ? "text-white/40" : "text-gray-400"}`}>{c.grade}</div>
              </div>
            </div>
          ))}
        </div>

        {activeNav === "overview" ? (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <MetricTile label="Family Mastery" value="83%" delta="+9%" icon={TrendingUp} color="var(--color-fluent-teal)" />
              <MetricTile label="Live Sessions" value="18" delta="+3" icon={Calendar} color="var(--color-fluent-navy)" />
              <MetricTile label="Assignment Quality" value="95%" delta="+5%" icon={CheckCircle2} color="var(--color-fluent-gold)" />
              <MetricTile label="Attendance Rate" value="100%" icon={ShieldCheck} color="var(--color-fluent-gold)" />
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-start">
              <Card className="lg:col-span-2 p-8">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-serif font-bold">{child.name}'s Subject Mastery</h3>
                  <Badge color="navy">{child.grade} Curriculum</Badge>
                </div>
                <div className="space-y-6">
                  {subjectData.map(s => (
                    <div key={s.subject} className="p-5 bg-gray-50 rounded-xl hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-black/5">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <div className="font-bold text-sm text-fluent-navy">{s.subject}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tutor: {s.teacher} (UK Accredited)</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-xl leading-none">{s.score}%</div>
                          <div className={`text-[10px] font-bold mt-1 ${s.score > s.lastWeek ? 'text-green-600' : 'text-red-500'}`}>
                            {s.score > s.lastWeek ? "↑" : "↓"} {Math.abs(s.score - s.lastWeek)}% from assessment {child.name.split(' ')[0] === 'Priya' ? '12' : '15'}
                          </div>
                        </div>
                      </div>
                      <ProgressBar value={s.score} color={s.subject.includes('English') ? 'var(--color-fluent-gold)' : 'var(--color-fluent-teal)'} showPct={false} />
                    </div>
                  ))}
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

        <Card className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-serif font-bold">Partner Institutions</h3>
            <div className="flex gap-4">
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

  const navigate = (v: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setView(v);
  };

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {view === "landing" && <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><LandingPage onEnter={navigate} /></motion.div>}
        {view === "onboarding" && <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><OnboardingFlow onComplete={navigate} /></motion.div>}
        {view === "student-dashboard" && <motion.div key="std-dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><StudentDashboard onBack={() => navigate("landing")} /></motion.div>}
        {view === "teacher-dashboard" && <motion.div key="teach-dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><FacultyHub onBack={() => navigate("landing")} /></motion.div>}
        {view === "parent-dashboard" && <motion.div key="par-dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><ParentDashboard onBack={() => navigate("landing")} /></motion.div>}
        {view === "admin-dashboard" && <motion.div key="admin-dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><AdminCommand onBack={() => navigate("landing")} /></motion.div>}
      </AnimatePresence>
    </div>
  );
}
