import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo, Avatar, Badge } from './UI';
import { LogOut, Sparkles, X } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebaseInit';
import { NotificationBell } from './NotificationBell';

export const DashboardShell = ({ role, title, children, navItems, activeNav, setActiveNav, onBack }: { role: string, title: string, children: React.ReactNode, navItems: any[], activeNav: string, setActiveNav: (v: string) => void, onBack: () => void }) => {
  const [directive, setDirective] = useState<string>("");
  const [showDirective, setShowDirective] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'platform', 'config'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.directive && data.directive !== directive) {
          setDirective(data.directive);
          setShowDirective(true);
        } else if (!data.directive) {
          setDirective("");
          setShowDirective(false);
        }
      }
    });
    return () => unsub();
  }, []);

  return (
    <div className="flex min-h-screen bg-fluent-cream selection:bg-fluent-teal/20">
      {/* Sidebar - Precision Rail */}
      <aside className="w-64 bg-fluent-navy flex flex-col fixed top-0 left-0 h-screen z-50 border-r border-white/5">
        <div className="p-6 md:p-8 border-b border-white/5">
          <Logo variant="light" className="mb-6 scale-90 origin-left" />
          <div className="flex items-center justify-between gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3 overflow-hidden">
              <Avatar name={title} size={32} color="var(--color-fluent-gold)" />
              <div className="overflow-hidden">
                <div className="text-[9px] text-fluent-gold font-bold uppercase tracking-[0.2em] mb-0.5">Verified</div>
                <div className="text-xs font-bold text-white truncate leading-none">{title}</div>
              </div>
            </div>
            <button 
              onClick={onBack}
              title="Sign Out"
              className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/5 group"
            >
              <LogOut size={12} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
        
        <div className="px-6 py-2 text-[9px] font-bold text-white/20 uppercase tracking-[0.3em] mb-1">Command Center</div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-xs group relative ${
                activeNav === item.id 
                  ? 'text-white font-bold' 
                  : 'text-white/40 hover:text-white/80'
              }`}
            >
              {activeNav === item.id && (
                <motion.div layoutId="nav-glow" className="absolute inset-0 bg-white/5 rounded-xl border border-white/10" />
              )}
              <item.icon size={16} className={`relative z-10 ${activeNav === item.id ? 'text-fluent-gold' : 'text-white/20 group-hover:text-white/40'}`} />
              <span className="relative z-10 tracking-tight">{item.label}</span>
              {item.badge && (
                <span className="relative z-10 ml-auto bg-fluent-gold text-fluent-navy text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
        
        <div className="p-6 space-y-3">
          <div className="border border-white/5 bg-white/2 rounded-2xl p-3">
             <NotificationBell />
          </div>
          <button 
            onClick={onBack}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-white/30 hover:text-red-400 hover:bg-red-400/5 transition-all text-[10px] font-bold uppercase tracking-widest group border border-transparent hover:border-red-400/20"
          >
            <LogOut size={14} className="text-red-400/40 group-hover:text-red-400" />
            Sign Out Session
          </button>
        </div>
      </aside>
      
      {/* Content - Synthetic Workspace */}
      <main className="flex-1 ml-64 min-h-screen relative">
        <AnimatePresence>
          {showDirective && directive && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-fluent-gold text-fluent-navy relative z-[60] overflow-hidden"
            >
              <div className="max-w-7xl mx-auto px-12 py-3 flex items-center justify-between gap-8">
                <div className="flex items-center gap-3">
                   <div className="p-1 bg-white/20 rounded-lg">
                      <Sparkles size={14} className="animate-pulse" />
                   </div>
                   <div className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">Provincial Directive</div>
                   <div className="w-px h-4 bg-fluent-navy/10 mx-2" />
                   <p className="text-xs font-bold tracking-tight italic">"{directive}"</p>
                </div>
                <button 
                  onClick={() => setShowDirective(false)}
                  className="p-1 hover:bg-white/20 rounded-md transition-colors"
                >
                   <X size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
};
