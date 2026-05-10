import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo, Avatar, Badge, Btn } from './UI';
import { LogOut, Sparkles, X, MessageCircle, Bell } from 'lucide-react';
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
    <div className="flex min-h-screen bg-fluent-ivory selection:bg-fluent-gold/20">
      {/* Sidebar - Precision Rail */}
      <aside className="w-72 bg-fluent-midnight flex flex-col fixed top-0 left-0 h-screen z-50 border-r border-white/5 overflow-y-auto custom-scrollbar shadow-2xl shadow-black/50">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-3 mb-8 font-display text-[10px] tracking-[0.3em] text-fluent-gold uppercase">
            <div className="w-8 h-8 bg-fluent-gold/10 border border-fluent-gold/20 flex items-center justify-center text-xs text-fluent-gold rounded shadow-[0_0_15px_rgba(184,151,58,0.15)]">📖</div>
            Scholars Studio
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-white/5 rounded border border-fluent-gold/10 transition-all hover:bg-white/10 group">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fluent-gold to-[#8b6914] flex items-center justify-center font-display text-sm font-semibold text-fluent-midnight shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                {title.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-fluent-cream truncate leading-tight uppercase font-display tracking-wide">{title}</div>
                <div className="text-[8px] font-display text-fluent-gold/50 uppercase tracking-[0.2em] mt-1 flex items-center gap-1.5">
                   <div className="w-1 h-1 rounded-full bg-fluent-gold animate-pulse" />
                   Verified Scholar
                </div>
              </div>
            </div>
            <button 
              onClick={onBack}
              title="Sign Out"
              className="w-8 h-8 flex items-center justify-center rounded bg-white/5 text-stone-500 hover:bg-red-500/20 hover:text-red-400 transition-all shrink-0 border border-white/5"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
        
        <div className="px-8 py-6 text-[9px] font-display text-white/20 uppercase tracking-[0.4em] font-medium">Locus of Control</div>
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 transition-all text-[11px] relative rounded ${
                activeNav === item.id 
                  ? 'bg-fluent-gold/10 text-fluent-gold font-bold shadow-[inset_0_0_20px_rgba(184,151,58,0.05)] border border-fluent-gold/20' 
                  : 'text-white/40 hover:bg-white/5 border border-transparent'
              }`}
            >
              <item.icon size={18} className={`${activeNav === item.id ? 'text-fluent-gold drop-shadow-[0_0_8px_rgba(184,151,58,0.4)]' : 'text-stone-600'}`} />
              <span className="tracking-[0.1em] uppercase font-display">{item.label}</span>
              {item.badge && (
                <span className={`ml-auto text-[8px] font-display font-bold px-2 py-0.5 rounded uppercase tracking-tighter shadow-sm ${
                  item.badge === 'Live' ? 'bg-red-600 text-white animate-pulse' : 
                  item.badge === 'Mastery' ? 'bg-fluent-gold text-fluent-midnight' :
                  item.badge === 'New' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
                }`}>
                  {item.badge}
                </span>
              )}
              {activeNav === item.id && (
                <motion.div layoutId="activeNav" className="absolute left-0 top-2 bottom-2 w-[3px] bg-fluent-gold rounded-r shadow-[0_0_10px_rgba(184,151,58,0.5)]" />
              )}
            </button>
          ))}
        </nav>
        
        <div className="p-8 mt-auto border-t border-white/5 space-y-6 bg-black/20">
          <button className="flex items-center gap-3 text-[10px] text-stone-500 hover:text-fluent-gold transition-all w-full group font-display uppercase tracking-widest">
            <div className="w-6 h-6 rounded flex items-center justify-center bg-white/5 border border-white/5 group-hover:border-fluent-gold/30 transition-all">◯</div>
            <span>Academic Help</span>
          </button>
          <div className="flex items-center gap-3 font-display text-[8px] tracking-[0.25em] text-white/20 uppercase group">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
            Global Sync Active
          </div>
        </div>
      </aside>
      
      {/* Content Area */}
      <main className="flex-1 ml-72 min-h-screen flex flex-col">
        {showDirective && (
           <motion.div 
             initial={{ height: 0, opacity: 0 }}
             animate={{ height: 'auto', opacity: 1 }}
             className="bg-fluent-gold text-fluent-midnight py-3 px-10 text-[9px] font-black uppercase tracking-[0.4em] flex items-center justify-between z-[110] shadow-lg"
           >
             <div className="flex items-center gap-3">
               <Sparkles size={12} className="animate-pulse" />
               <span>Provincial Directive :: {directive}</span>
             </div>
             <button onClick={() => setShowDirective(false)} className="p-1 hover:bg-black/5 rounded transition-colors">
               <X size={12} />
             </button>
           </motion.div>
        )}
        
        {/* Topbar */}
        <header className="h-20 sticky top-0 bg-fluent-ivory/80 backdrop-blur-2xl border-b border-black/5 z-[100] flex items-center justify-between px-10 gap-8">
           <div className="flex-1 min-w-0">
             <div className="font-display text-[10px] tracking-[0.3em] text-stone-400 uppercase mb-1">
               Locus <span className="text-fluent-gold opacity-50 mx-2">›</span> <span className="text-fluent-midnight font-bold">{navItems.find(i => i.id === activeNav)?.label?.toUpperCase() || activeNav.toUpperCase()}</span>
             </div>
             <div className="font-serif text-3xl font-black text-fluent-midnight flex items-center gap-3 leading-none">
               Protocol: <em className="not-italic text-fluent-gold italic font-normal">{navItems.find(i => i.id === activeNav)?.label || activeNav}</em>
               <Sparkles size={20} className="text-fluent-gold animate-pulse" />
             </div>
           </div>

           <div className="hidden xl:flex items-center gap-4 bg-white border border-black/5 p-3 rounded shadow-sm">
              <div className="w-10 h-10 bg-fluent-gold/10 rounded flex items-center justify-center text-fluent-gold">
                 <Sparkles size={20} />
              </div>
              <div className="min-w-0">
                <div className="font-display text-[8px] tracking-[0.3em] text-stone-400 uppercase mb-1">Weekly Objective</div>
                <div className="text-xs font-bold text-fluent-midnight leading-tight truncate font-serif italic">Master: Trigonometric Identities</div>
              </div>
           </div>

           <div className="flex items-center gap-3 shrink-0">
             <NotificationBell />
             <Btn variant="gold" size="sm" icon={MessageCircle} className="uppercase text-[9px] tracking-widest font-black px-6 shadow-xl shadow-fluent-gold/10">
               Live Support
             </Btn>
           </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div 
            key={activeNav}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 p-10"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};
