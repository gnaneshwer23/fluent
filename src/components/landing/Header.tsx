import React from 'react';
import { Logo, Btn } from '../UI';

export const Header = ({ scrolled, onLogin, isLoggingIn }: { scrolled: boolean, onLogin: () => void, isLoggingIn: boolean }) => {
  return (
    <nav className={`fixed top-0 w-full z-[100] transition-all duration-700 ${scrolled ? 'bg-white/80 backdrop-blur-2xl border-b border-black/5 py-3' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-8 md:px-12 flex justify-between items-center text-fluent-navy">
        <Logo onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
        
        <div className="hidden lg:flex gap-10 items-center">
          {["Vision", "Benefits", "Programs", "Methodology"].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-[9px] font-black uppercase tracking-[0.4em] text-fluent-navy/50 hover:text-fluent-navy transition-all duration-500 hover:tracking-[0.5em]">{item}</a>
          ))}
          <div className="h-4 w-px bg-black/10 mx-2" />
          <Btn variant="primary" size="sm" className="shadow-2xl shadow-fluent-navy/10 px-8 rounded-full bg-fluent-navy hover:bg-fluent-teal text-[9px] font-black uppercase tracking-[0.2em]" onClick={onLogin} disabled={isLoggingIn}>
            {isLoggingIn ? "Authenticating..." : "ESTABLISH ACCESS"}
          </Btn>
        </div>
      </div>
    </nav>
  );
};
