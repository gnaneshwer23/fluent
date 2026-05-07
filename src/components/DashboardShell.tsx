import React from 'react';
import { motion } from 'motion/react';
import { Logo, Avatar } from './UI';
import { LogOut } from 'lucide-react';
import { NotificationBell } from './NotificationBell';

export const DashboardShell = ({ role, title, children, navItems, activeNav, setActiveNav, onBack }: { role: string, title: string, children: React.ReactNode, navItems: any[], activeNav: string, setActiveNav: (v: string) => void, onBack: () => void }) => {
  return (
    <div className="flex min-h-screen bg-fluent-cream selection:bg-fluent-teal/20">
      {/* Sidebar - Precision Rail */}
      <aside className="w-72 bg-fluent-navy flex flex-col fixed top-0 left-0 h-screen z-50 border-r border-white/5">
        <div className="p-10 border-b border-white/5">
          <Logo variant="light" className="mb-8 scale-90 origin-left" />
          <div className="flex items-center justify-between gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3 overflow-hidden">
              <Avatar name={title} size={36} color="var(--color-fluent-gold)" />
              <div className="overflow-hidden">
                <div className="text-[11px] text-fluent-gold font-bold uppercase tracking-[0.2em] mb-0.5">Verified</div>
                <div className="text-sm font-bold text-white truncate leading-none">{title}</div>
              </div>
            </div>
            <button 
              onClick={onBack}
              title="Sign Out"
              className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/5 group"
            >
              <LogOut size={14} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
        
        <div className="px-4 py-2 text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] mb-2 px-10">Command Center</div>
        <nav className="flex-1 px-6 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all text-sm group relative ${
                activeNav === item.id 
                  ? 'text-white font-bold' 
                  : 'text-white/40 hover:text-white/80'
              }`}
            >
              {activeNav === item.id && (
                <motion.div layoutId="nav-glow" className="absolute inset-0 bg-white/5 rounded-xl border border-white/10" />
              )}
              <item.icon size={18} className={`relative z-10 ${activeNav === item.id ? 'text-fluent-gold' : 'text-white/20 group-hover:text-white/40'}`} />
              <span className="relative z-10 tracking-tight">{item.label}</span>
              {item.badge && (
                <span className="relative z-10 ml-auto bg-fluent-gold text-fluent-navy text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
        
        <div className="p-8 space-y-4">
          <div className="border border-white/5 bg-white/2 rounded-2xl p-4">
             <NotificationBell />
          </div>
          <button 
            onClick={onBack}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-xl text-white/30 hover:text-red-400 hover:bg-red-400/5 transition-all text-[11px] font-bold uppercase tracking-widest group border border-transparent hover:border-red-400/20"
          >
            <LogOut size={16} className="text-red-400/40 group-hover:text-red-400" />
            Sign Out Session
          </button>
        </div>
      </aside>
      
      {/* Content - Synthetic Workspace */}
      <main className="flex-1 ml-72 min-h-screen relative">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
};
