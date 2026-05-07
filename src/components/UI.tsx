import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, CheckCircle2, ArrowRight } from 'lucide-react';

export const Badge = ({ children, color = "navy", className = "", icon: Icon }: { children: React.ReactNode, color?: 'navy' | 'gold' | 'teal' | 'green' | 'red' | 'gray', className?: string, icon?: any }) => {
  const colors = {
    navy: "bg-fluent-navy/10 text-fluent-navy",
    gold: "bg-fluent-gold/10 text-[#92620A]",
    teal: "bg-fluent-teal/10 text-fluent-teal",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    gray: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`text-[10px] font-bold tracking-wider px-2 py-1 rounded uppercase whitespace-nowrap flex items-center gap-1.5 ${colors[color]} ${className}`}>
      {Icon && <Icon size={12} />}
      {children}
    </span>
  );
};

export const Card = ({ children, className = "", hover = false, onClick, id }: { children: React.ReactNode, className?: string, hover?: boolean, key?: any, onClick?: () => void, id?: string }) => (
  <div 
    id={id}
    onClick={onClick}
    className={`bg-white rounded-xl border border-black/5 p-6 transition-all duration-300 ${hover ? 'hover:shadow-xl hover:-translate-y-1' : ''} ${className} ${onClick ? 'cursor-pointer' : ''}`}
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

export const Logo = ({ className = "", variant = "dark", onClick, animate = false }: { className?: string, variant?: "dark" | "light", onClick?: () => void, animate?: boolean }) => (
  <div onClick={onClick} className={`flex items-center gap-2.5 cursor-pointer group ${className} ${animate ? 'animate-pulse' : ''}`}>
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:rotate-6 ${variant === 'dark' ? 'bg-fluent-navy' : 'bg-white'}`}>
      <BookOpen size={16} className={variant === 'dark' ? 'text-fluent-gold' : 'text-fluent-navy'} />
    </div>
    <span className={`font-serif font-bold text-xl tracking-tight ${variant === 'dark' ? 'text-fluent-navy' : 'text-white'}`}>Fluent Academy.</span>
  </div>
);

export const MetricTile = ({ label, value, delta, icon: Icon, color = "#0D1B2A" }: { label: string, value: string, delta?: string, icon: any, color?: string }) => {
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
export const Btn = ({ children, variant = "primary", onClick, className = "", size = "md", icon: IconComp, disabled, type = "button" }: { children: React.ReactNode, variant?: 'primary' | 'gold' | 'outline' | 'ghost' | 'danger' | 'success', onClick?: () => void, className?: string, size?: 'sm' | 'md' | 'lg', icon?: any, disabled?: boolean, type?: "button" | "submit" | "reset", key?: any }) => {
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
