import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, CheckCircle2, ArrowRight } from 'lucide-react';

export const Badge = ({ children, color = "navy", className = "", icon: Icon }: { children: React.ReactNode, color?: 'navy' | 'gold' | 'teal' | 'green' | 'red' | 'gray', className?: string, icon?: any }) => {
  const colors = {
    navy: "bg-fluent-midnight text-fluent-cream border-white/5",
    gold: "bg-fluent-gold/10 text-fluent-gold border-fluent-gold/20",
    teal: "bg-fluent-gold/5 text-fluent-gold border-fluent-gold/10",
    green: "bg-green-50 text-green-700 border-green-100",
    red: "bg-red-50 text-red-700 border-red-100",
    gray: "bg-stone-100/50 text-stone-500 border-stone-200",
  };
  return (
    <span className={`text-[8px] font-display font-medium tracking-[0.2em] px-2 py-0.5 rounded uppercase whitespace-nowrap flex items-center gap-1.5 border ${colors[color]} ${className}`}>
      {Icon && <Icon size={10} strokeWidth={2} />}
      {children}
    </span>
  );
};

export const Card = ({ children, className = "", hover = false, onClick, id }: { children: React.ReactNode, className?: string, hover?: boolean, key?: any, onClick?: (e: React.MouseEvent) => void, id?: string }) => (
  <div 
    id={id}
    onClick={onClick}
    className={`bg-white rounded-lg border border-black/5 p-6 md:p-8 transition-all duration-300 ${hover ? 'hover:shadow-xl hover:border-fluent-gold/20' : ''} ${className} ${onClick ? 'cursor-pointer' : ''}`}
  >
    {children}
  </div>
);

export const Avatar = ({ name, size = 36, color = "#b8973a" }: { name: string, size?: number, color?: string }) => {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const bgColor = color.startsWith('#') ? `${color}15` : color;
  const borderColor = color.startsWith('#') ? `${color}30` : color;
  return (
    <div 
      style={{ width: size, height: size, backgroundColor: bgColor, color, borderColor: borderColor }}
      className="rounded-full flex items-center justify-center font-display text-[0.4em] font-bold border shrink-0"
    >
      <span style={{ fontSize: size * 0.35 }}>{initials}</span>
    </div>
  );
};

export const ProgressBar = ({ value, max = 100, color = "#b8973a", label, showPct = true }: { value: number, max?: number, color?: string, label?: string, showPct?: boolean }) => (
  <div className="w-full">
    {(label || showPct) && (
      <div className="flex justify-between mb-2">
        {label && <span className="text-[10px] font-display uppercase tracking-widest text-stone-500">{label}</span>}
        {showPct && <span className="text-[10px] font-mono font-bold text-fluent-ink">{Math.round((value / max) * 100)}%</span>}
      </div>
    )}
    <div className="h-1 w-full bg-stone-200/50 rounded-full overflow-hidden">
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

export const Logo = ({ className = "", variant = "dark", onClick, animate = false }: { className?: string, variant?: "dark" | "light", onClick?: () => void, animate?: boolean }) => (
  <div onClick={onClick} className={`flex items-center gap-3 cursor-pointer group ${className} ${animate ? 'animate-pulse' : ''}`}>
    <div className={`w-8 h-8 flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${variant === 'dark' ? 'text-fluent-midnight' : 'text-fluent-gold'}`}>
      <BookOpen size={20} />
    </div>
    <div className="border-l border-black/5 pl-3 py-0.5">
      <span className={`font-display font-medium text-xs tracking-[0.2em] transition-colors ${variant === 'dark' ? 'text-fluent-midnight' : 'text-fluent-cream'}`}>
        FLUENT INSTITUTE.
      </span>
    </div>
  </div>
);

export const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-fluent-midnight/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-xl p-8 md:p-10 max-w-xl w-full shadow-2xl relative border border-black/5"
      >
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-stone-100 rounded transition-colors text-stone-400">
           <ArrowRight className="rotate-45" size={18} />
        </button>
        <div className="text-[10px] font-display uppercase tracking-[0.3em] text-stone-500 mb-2">Request Synthesis</div>
        <h3 className="text-2xl font-serif font-bold text-fluent-ink mb-8">{title}</h3>
        {children}
      </motion.div>
    </div>
  );
};

export const MetricTile = ({ label, value, delta, icon: Icon, color = "#b8973a" }: { label: string, value: string, delta?: string, icon: any, color?: string }) => {
  return (
    <div className="bg-white border border-black/5 p-6 rounded-lg group hover:border-fluent-gold/30 transition-all">
      <div className="w-9 h-9 rounded bg-stone-100/50 flex items-center justify-center text-lg mb-4 text-fluent-gold border border-black/5">
        <Icon size={18} />
      </div>
      <div className="font-display text-[7px] tracking-[0.2em] uppercase text-stone-500 mb-1">{label}</div>
      <div className="font-serif text-3xl font-semibold text-fluent-ink leading-none">{value}</div>
      {delta && (
        <div className="text-[11px] font-medium text-green-600 mt-2">▲ {delta}</div>
      )}
    </div>
  );
};

export const Btn = ({ children, variant = "primary", onClick, className = "", size = "md", icon: IconComp, disabled, type = "button" }: { children?: React.ReactNode, variant?: 'primary' | 'gold' | 'outline' | 'ghost' | 'danger' | 'success', onClick?: () => void, className?: string, size?: 'sm' | 'md' | 'lg', icon?: any, disabled?: boolean, type?: "button" | "submit" | "reset", key?: any }) => {
  const variants = {
    primary: "bg-fluent-midnight text-fluent-cream hover:bg-fluent-gold hover:text-fluent-midnight shadow-lg border-transparent",
    gold: "bg-fluent-gold text-fluent-midnight hover:bg-fluent-midnight hover:text-fluent-cream shadow-xl shadow-fluent-gold/10 border-transparent",
    outline: "bg-transparent text-fluent-ink border border-black/10 hover:border-fluent-ink hover:text-fluent-ink",
    ghost: "bg-transparent text-stone-600 hover:text-fluent-midnight border-transparent",
    danger: "bg-red-50 text-red-700 border border-red-100 hover:bg-red-100",
    success: "bg-green-50 text-green-700 border border-green-100 hover:bg-green-100",
  };
  
  const sizes = {
    sm: "px-4 py-2 text-[9px] uppercase font-display tracking-[0.15em] rounded",
    md: "px-6 py-3 text-[10px] uppercase font-display tracking-[0.2em] rounded",
    lg: "px-10 py-4 text-[11px] uppercase font-display tracking-[0.25em] rounded",
  };

  return (
    <motion.button 
      type={type}
      disabled={disabled}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`inline-flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border ${variants[variant]} ${sizes[size]} ${className} font-sans active:shadow-inner`}
    >
      {IconComp && <IconComp size={size === 'sm' ? 14 : 16} strokeWidth={2} />}
      {children}
    </motion.button>
  );
};
