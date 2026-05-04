/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  Play, 
  CheckCircle2, 
  Users, 
  BarChart3, 
  Globe2, 
  Sparkles, 
  MessageSquare, 
  BookOpen, 
  Microscope, 
  Calculator,
  ChevronRight,
  Menu,
  X,
  Target,
  BrainCircuit,
  Zap,
  Compass,
  ChevronDown
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  AreaChart, 
  Area, 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis,
  Legend
} from 'recharts';

// --- Components ---

const Logo = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-2 cursor-pointer group ${className}`}>
    <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center transition-transform group-hover:rotate-12">
      <Compass size={18} className="text-accent" />
    </div>
    <span className="font-bold text-xl tracking-tighter text-black uppercase">FLUENT.</span>
  </div>
);

const ProgressVisualizationSection = () => {
  const [subject, setSubject] = useState<'Maths' | 'Science' | 'English'>('Maths');

  const data = {
    Maths: [
      { week: 'W1', fluency: 40, understanding: 30, problemSolving: 20 },
      { week: 'W2', fluency: 45, understanding: 35, problemSolving: 25 },
      { week: 'W3', fluency: 55, understanding: 45, problemSolving: 35 },
      { week: 'W4', fluency: 65, understanding: 55, problemSolving: 45 },
      { week: 'W5', fluency: 75, understanding: 65, problemSolving: 55 },
      { week: 'W6', fluency: 85, understanding: 75, problemSolving: 70 },
    ],
    Science: [
      { week: 'W1', fluency: 35, understanding: 25, problemSolving: 20 },
      { week: 'W2', fluency: 40, understanding: 30, problemSolving: 25 },
      { week: 'W3', fluency: 50, understanding: 40, problemSolving: 30 },
      { week: 'W4', fluency: 60, understanding: 50, problemSolving: 40 },
      { week: 'W5', fluency: 70, understanding: 65, problemSolving: 55 },
      { week: 'W6', fluency: 80, understanding: 75, problemSolving: 72 },
    ],
    English: [
      { week: 'W1', fluency: 50, understanding: 40, problemSolving: 30 },
      { week: 'W2', fluency: 55, understanding: 45, problemSolving: 35 },
      { week: 'W3', fluency: 65, understanding: 55, problemSolving: 45 },
      { week: 'W4', fluency: 75, understanding: 65, problemSolving: 55 },
      { week: 'W5', fluency: 85, understanding: 75, problemSolving: 65 },
      { week: 'W6', fluency: 92, understanding: 85, problemSolving: 78 },
    ]
  };

  return (
    <section id="progress" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-8 sm:px-12">
        <div className="text-center mb-16">
          <div className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] mb-4">Longitudinal Growth</div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter italic text-black">
            Measurable <span className="text-black/30">Advancement.</span>
          </h2>
          <p className="mt-6 text-black/50 max-w-2xl mx-auto font-medium">
            Visualising the trajectory of student progress across our core focus subjects.
          </p>
        </div>

        <div className="bg-stone-bg p-8 md:p-12 rounded-[48px] border border-black/5 shadow-sm">
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {(['Maths', 'Science', 'English'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSubject(s)}
                className={`px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                  subject === s ? 'bg-black text-white shadow-xl' : 'bg-white text-black/40 hover:text-black'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="h-[400px] w-full bg-white p-8 rounded-[32px] border border-black/5 shadow-inner" style={{ minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%" minHeight={300}>
              <LineChart data={data[subject]} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="week" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#666' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#666' }}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#000', 
                    border: 'none', 
                    borderRadius: '16px', 
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: '700',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                  }}
                  itemStyle={{ color: '#fff' }}
                  cursor={{ stroke: '#3b82f6', strokeWidth: 2 }}
                />
                <Legend 
                  verticalAlign="top" 
                  align="right" 
                  iconType="circle"
                  wrapperStyle={{ 
                    paddingBottom: '40px',
                    fontSize: '10px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="fluency" 
                  name="Academic Fluency"
                  stroke="#3b82f6" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 8, fill: '#3b82f6' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="understanding" 
                  name="Conceptual Understanding"
                  stroke="#000" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#000', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 8, fill: '#000' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="problemSolving" 
                  name="Problem Solving"
                  stroke="#fbbf24" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#fbbf24', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 8, fill: '#fbbf24' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {[
              { label: 'Fluency', color: 'bg-accent' },
              { label: 'Understanding', color: 'bg-black' },
              { label: 'Problem Solving', color: 'bg-yellow-400' }
            ].map((metric, i) => (
              <div key={i} className="flex items-center gap-4 bg-white/50 p-4 rounded-2xl border border-black/5">
                <div className={`w-3 h-3 rounded-full ${metric.color}`} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-black/60">{metric.label} Growth</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const navLinks = [
    { id: 'method', label: 'Method' },
    { id: 'faculty', label: 'Faculty' },
    { id: 'progress', label: 'Growth' },
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

const MetricCard = ({ label, value, colorClass, icon: Icon, rotation }: { label: string, value: number, colorClass: string, icon: any, rotation?: string }) => (
  <div className={`bg-white p-8 rounded-3xl border border-black/5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] flex flex-col gap-6 transform ${rotation ?? ''}`}>
    <div className="flex items-center justify-between">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 border border-gray-100`}>
        <Icon className={`w-5 h-5 text-black`} />
      </div>
      <div className="flex flex-col items-end">
        <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest bg-green-50 px-2 py-0.5 rounded">+12.4%</span>
      </div>
    </div>
    <div>
      <div className="text-4xl font-mono font-bold text-black tracking-tighter">{value}%</div>
      <div className="text-[10px] font-bold text-black/40 uppercase tracking-[0.2em] mt-1">{label}</div>
    </div>
  </div>
);

const Hero = () => {
  return (
    <section id="home" className="relative pt-44 pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-8 sm:px-12">
        <div className="grid lg:grid-cols-[1.1fr_1fr] grid-cols-1 gap-24 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <h1 className="text-[80px] md:text-[100px] leading-[0.88] font-bold tracking-tighter text-black mb-12">
              Master the <br/><span className="text-black/30">Logic of Learning.</span>
            </h1>
            
            <p className="text-xl text-black/70 leading-relaxed mb-16 max-w-lg">
              Unlock global academic standards. FLUENT builds deep conceptual mastery in Science, Maths, and English through live sessions with veteran British school-trained educators.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-10">
              <a href="#enroll" className="bg-black text-white px-10 py-5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-black/10 no-underline inline-block">
                Join the Pilot Program
              </a>
              <a href="#growth" className="px-10 py-5 rounded-full border border-black/10 bg-transparent text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-stone-bg transition-all no-underline text-black">
                See the Evidence
              </a>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 mb-1 italic">Fluency that improves learning</span>
                <span className="text-xs font-medium max-w-[240px]">Live lessons with experienced British faculty.</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="relative flex items-center justify-center h-[500px] bg-black rounded-[48px] overflow-hidden"
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
                <MetricCard icon={Calculator} label="Maths Mastery" value={82} colorClass="bg-white" />
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
                <MetricCard icon={Target} label="English Fluency" value={94} colorClass="bg-white" />
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
  const [role, setRole] = useState<'student' | 'teacher' | 'head'>('student');
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const getRoleBenefits = () => {
    switch(role) {
      case 'student': return 'Get a easy-to-read progress report and a 1-on-1 session with a British teacher.';
      case 'teacher': return 'Get our Science & Maths teaching tools and join our research group.';
      case 'head': return 'Talk to us about how to help every student in your school succeed.';
      default: return '';
    }
  };
  
  return (
    <section id="enroll" className="py-24 bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_#fff_0.5px,_transparent_0.5px)] bg-[size:30px:30px]" />
      <div className="max-w-3xl mx-auto px-8 sm:px-12 text-center relative z-10">
        <div className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] mb-8">Priority Intake 2026</div>
        <h2 className="text-5xl md:text-6xl font-bold tracking-tighter mb-12 italic leading-[0.9]">
          Secure Your Child's <br/><span className="text-white/30 text-not-italic">Competitive Edge.</span>
        </h2>
        <p className="text-xl text-white/50 leading-relaxed mb-16 max-w-xl mx-auto">
          We are accepting a limited number of students for our 2026 pilot cohort. Join the list to secure a private performance consultation.
        </p>
        
        {!isSubmitted ? (
          <div className="bg-white/5 p-2 rounded-full border border-white/10 flex flex-col md:flex-row gap-2 max-w-xl mx-auto">
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Parent email address..." 
              className="bg-transparent px-8 py-5 text-sm font-medium focus:outline-none flex-grow text-white placeholder:text-white/20"
            />
            <button 
              onClick={() => { if(email) setIsSubmitted(true) }}
              className="bg-accent text-black px-12 py-5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-accent/10 whitespace-nowrap"
            >
              Request Access
            </button>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-12 bg-white/5 border border-white/10 rounded-[48px]"
          >
            <Sparkles className="text-accent mx-auto mb-6" size={48} />
            <h3 className="text-3xl font-bold italic mb-4">Request Received.</h3>
            <p className="text-white/50 text-sm max-w-xs mx-auto">We'll be in touch with {email} regarding our 2026 intake and consultation schedule.</p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

const FacultySection = () => {
  return (
    <section id="faculty" className="py-32 bg-black text-white overflow-hidden relative">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_#fff_1px,_transparent_1px)] bg-[size:40px_40px]" />
      </div>
      
      <div className="max-w-7xl mx-auto px-8 sm:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] mb-6">World-Class Educators</div>
            <h2 className="text-5xl md:text-6xl font-bold tracking-tighter mb-8 italic">
              Veteran <br/><span className="text-white/30 text-not-italic">British Pedagogy.</span>
            </h2>
            <p className="text-xl text-white/50 leading-relaxed mb-12 max-w-lg">
              We deploy highly experienced educators trained in the UK’s most rigorous school systems. They bring global academic standards, critical thinking, and disciplined inquiry directly to your child.
            </p>
            
            <div className="space-y-6">
              {[
                { title: 'Step-by-Step Support', desc: 'Guided lessons that build confidence layer by layer.' },
                { title: 'Critical Thinking', desc: 'A focus on understanding the "why" and explaining it clearly.' },
                { title: 'Working with Schools', desc: 'Real-time support that works alongside your child\'s school curriculum.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 items-start">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1 italic">{item.title}</h4>
                    <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
          
          <div className="relative">
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                   <div className="h-64 bg-white/5 rounded-[32px] border border-white/10 flex flex-col items-center justify-center text-center p-8">
                      <div className="text-4xl font-bold mb-2 italic">100%</div>
                      <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-loose">UK Qualified<br/>Teachers</div>
                   </div>
                   <div className="h-48 bg-accent rounded-[32px] flex items-center justify-center overflow-hidden relative group">
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                      <div className="text-black font-bold italic tracking-tighter text-2xl relative z-10">Live Mentorship</div>
                   </div>
                </div>
                <div className="space-y-4 pt-12">
                   <div className="h-48 bg-white/10 rounded-[32px] border border-white/10 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold italic">Top 1%</div>
                        <div className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-1">Selection Rate</div>
                      </div>
                   </div>
                   <div className="h-64 bg-white/5 rounded-[32px] border border-white/10 flex flex-col items-center justify-center text-center p-8">
                      <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-4">Focus On</div>
                      <div className="space-y-2">
                        <div className="px-4 py-1.5 rounded-full border border-white/10 text-[9px] font-bold uppercase tracking-widest">Science</div>
                        <div className="px-4 py-1.5 rounded-full border border-white/10 text-[9px] font-bold uppercase tracking-widest">Maths</div>
                        <div className="px-4 py-1.5 rounded-full border border-white/10 text-[9px] font-bold uppercase tracking-widest">English</div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const GuidedLearningSection = () => {
  const steps = [
    { n: '01', t: 'Structured Teaching', d: 'Concepts are introduced with clarity, ensuring students don\'t just memorise—they understand.' },
    { n: '02', t: 'Live Interaction', d: 'Experienced British teachers guide students through reasoning and problem-solving.' },
    { n: '03', t: 'Clear Explanations', d: 'Students learn to think, explain, and apply knowledge across Science, Maths, and English.' }
  ];

  return (
    <section id="method" className="py-32 bg-stone-bg border-y border-black/5">
      <div className="max-w-7xl mx-auto px-8 sm:px-12 text-center mb-24">
        <div className="text-[10px] font-bold text-black/40 uppercase tracking-[0.4em] mb-4">A Modern Learning Platform</div>
        <h2 className="text-5xl md:text-6xl font-bold tracking-tighter text-black italic max-w-4xl mx-auto">
          Built for students who want to <span className="text-black/30 text-not-italic">do more than keep up.</span>
        </h2>
        <p className="mt-8 text-black/50 font-medium max-w-2xl mx-auto italic">
          FLUENT brings together the depth of classroom teaching and the confidence of real live interaction.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-8 sm:px-12 relative">
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-black opacity-5 lg:block hidden" />
        
        <div className="space-y-24">
          {steps.map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`flex items-center gap-16 ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
            >
              <div className="flex-1 lg:text-right text-left">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-[24px] bg-white border border-black/5 shadow-xl text-xl font-mono font-bold mb-6 ${i % 2 === 1 ? 'lg:mr-auto' : 'lg:ml-auto'}`}>
                  {step.n}
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-black mb-4">{step.t}</h3>
                <p className="text-gray-500 leading-relaxed font-medium">{step.d}</p>
              </div>
              <div className="hidden lg:flex w-12 h-12 rounded-full border-4 border-stone-bg bg-black items-center justify-center z-10 relative">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </div>
              <div className="flex-1 hidden lg:block" />
            </motion.div>
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
      <GuidedLearningSection />
      <FacultySection />
      <ProgressVisualizationSection />
      <EarlyAccessSection />
      <Footer />
    </main>
  );
};

export default App;
