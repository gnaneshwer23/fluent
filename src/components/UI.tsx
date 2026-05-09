import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, CheckCircle2, ArrowRight } from 'lucide-react';

export const Badge = ({ children, color = "navy", className = "", icon: Icon }: { children: React.ReactNode, color?: 'navy' | 'gold' | 'teal' | 'green' | 'red' | 'gray', className?: string, icon?: any }) => {
  const colors = {
    navy: "bg-fluent-navy/5 text-fluent-navy border-fluent-navy/10",
    gold: "bg-fluent-gold/10 text-fluent-gold border-fluent-gold/20",
    teal: "bg-fluent-teal/5 text-fluent-teal border-fluent-teal/10",
    green: "bg-green-50 text-green-700 border-green-100",
    red: "bg-red-50 text-red-700 border-red-100",
    gray: "bg-slate-50 text-slate-700 border-slate-200",
  };
  return (
    <span className={`text-[9px] font-black tracking-[0.2em] px-2.5 py-1 rounded-full uppercase whitespace-nowrap flex items-center gap-1.5 border ${colors[color]} ${className} font-mono`}>
      {Icon && <Icon size={10} strokeWidth={3} />}
      {children}
    </span>
  );
};

export const Card = ({ children, className = "", hover = false, onClick, id }: { children: React.ReactNode, className?: string, hover?: boolean, key?: any, onClick?: () => void, id?: string }) => (
  <div 
    id={id}
    onClick={onClick}
    className={`bg-white rounded-[32px] border border-black/5 p-8 transition-all duration-700 ${hover ? 'hover:shadow-2xl hover:border-black/10' : ''} ${className} ${onClick ? 'cursor-pointer' : ''}`}
  >
    {children}
  </div>
);

export const Avatar = ({ name, size = 36, color = "#1B4F5E" }: { name: string, size?: number, color?: string }) => {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
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

export const ProgressBar = ({ value, max = 100, color = "#2A9D8F", label, showPct = true }: { value: number, max?: number, color?: string, label?: string, showPct?: boolean }) => (
  <div className="w-full">
    {(label || showPct) && (
      <div className="flex justify-between mb-2">
        {label && <span className="text-xs font-semibold text-gray-700">{label}</span>}
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

export const Logo = ({ className = "", variant = "dark", onClick, animate = false }: { className?: string, variant?: "dark" | "light", onClick?: () => void, animate?: boolean }) => (
  <div onClick={onClick} className={`flex items-center gap-3 cursor-pointer group ${className} ${animate ? 'animate-pulse' : ''}`}>
    <div className={`w-10 h-10 flex items-center justify-center transition-all duration-700 group-hover:scale-110 ${variant === 'dark' ? 'text-fluent-navy' : 'text-fluent-gold'}`}>
      <BookOpen size={24} strokeWidth={1.5} />
    </div>
    <div className="border-l border-black/10 pl-4 py-1">
      <span className={`font-serif font-black text-xl md:text-2xl tracking-tighter transition-colors ${variant === 'dark' ? 'text-fluent-navy' : 'text-white'}`}>
        FLUENT&nbsp;&nbsp;&nbsp;ACADEMY.
      </span>
    </div>
  </div>
);

export const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-fluent-navy/60 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[40px] p-10 max-w-xl w-full shadow-2xl relative border border-white/20"
      >
        <button onClick={onClose} className="absolute top-8 right-8 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
           <ArrowRight className="rotate-45" size={20} />
        </button>
        <h3 className="text-3xl font-serif font-black tracking-tight text-fluent-navy mb-8">{title}</h3>
        {children}
      </motion.div>
    </div>
  );
};

export const MetricTile = ({ label, value, delta, icon: Icon, color = "#0D1B2A" }: { label: string, value: string, delta?: string, icon: any, color?: string }) => {
  const bgColor = color.startsWith('#') ? `${color}15` : color;
  return (
    <Card className="flex flex-col items-start p-8 group hover:bg-fluent-navy hover:text-white transition-all duration-500 overflow-hidden relative border-black/5 shadow-none hover:shadow-2xl">
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
         <Icon size={80} />
      </div>
      <div 
        className="p-3 rounded-2xl mb-6 shadow-sm transition-all duration-500 bg-white/10 group-hover:bg-white/20"
        style={{ backgroundColor: bgColor, color }}
      >
        <Icon size={22} className="group-hover:text-white transition-colors" />
      </div>
      <div className="text-[10px] font-black text-slate-600 group-hover:text-white/70 uppercase tracking-[0.3em] mb-2">{label}</div>
      <div className="flex items-baseline gap-3 relative z-10">
        <div className="text-4xl font-serif font-bold tracking-tight">{value}</div>
        {delta && (
          <div className={`text-[10px] font-black px-2 py-0.5 rounded-full ${delta.startsWith('+') ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>
            {delta}
          </div>
        )}
      </div>
    </Card>
  );
};
export const Btn = ({ children, variant = "primary", onClick, className = "", size = "md", icon: IconComp, disabled, type = "button" }: { children?: React.ReactNode, variant?: 'primary' | 'gold' | 'outline' | 'ghost' | 'danger' | 'success', onClick?: () => void, className?: string, size?: 'sm' | 'md' | 'lg', icon?: any, disabled?: boolean, type?: "button" | "submit" | "reset", key?: any }) => {
  const variants = {
    primary: "bg-fluent-navy text-white hover:bg-fluent-teal shadow-xl shadow-fluent-navy/10 border-transparent",
    gold: "bg-fluent-gold text-white hover:bg-fluent-gold/90 shadow-xl shadow-fluent-gold/20 border-transparent",
    outline: "bg-transparent text-fluent-navy border-2 border-fluent-navy/10 hover:border-fluent-navy/30",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100 border-transparent",
    danger: "bg-red-50 text-red-700 border border-red-100 hover:bg-red-100",
    success: "bg-green-50 text-green-700 border border-green-100 hover:bg-green-100",
  };
  
  const sizes = {
    sm: "px-5 py-2.5 text-[10px] uppercase tracking-[0.2em] font-black rounded-full",
    md: "px-8 py-4 text-[11px] uppercase tracking-[0.25em] font-black rounded-full",
    lg: "px-10 py-5 text-[12px] uppercase tracking-[0.3em] font-black rounded-full",
  };

  return (
    <button 
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-3 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed border-2 ${variants[variant]} ${sizes[size]} ${className} font-sans`}
    >
      {IconComp && <IconComp size={size === 'sm' ? 14 : 16} strokeWidth={2.5} />}
      {children}
    </button>
  );
};
