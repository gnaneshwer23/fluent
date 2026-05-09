import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Send, Zap, Target, BookOpen, ChevronRight, 
  ChevronLeft, AlertCircle, TrendingUp, BarChart, 
  BrainCircuit, Layout, Terminal, Mic
} from 'lucide-react';
import { Card, Btn, Badge, Avatar, ProgressBar } from './UI';
import { db, auth } from '../lib/firebaseInit';
import { collection, query, where, orderBy, limit, addDoc, serverTimestamp, onSnapshot, getDocs } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export function AITutor({ profile }: { profile: any }) {
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [weakTopics, setWeakTopics] = useState<any[]>([]);
  const [radarData, setRadarData] = useState<any[]>([]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    // Mock radar data for visualization
    setRadarData([
      { subject: 'Logic', A: 85, fullMark: 100 },
      { subject: 'Fluency', A: 70, fullMark: 100 },
      { subject: 'Accuracy', A: 90, fullMark: 100 },
      { subject: 'Retention', A: 65, fullMark: 100 },
      { subject: 'Application', A: 75, fullMark: 100 },
    ]);

    // Mock weak topics
    setWeakTopics([
      { name: 'Quadratic Focus', subject: 'Maths', gap: '32%', alert: 'Urgent' },
      { name: 'Bernoulli Logic', subject: 'Physics', gap: '15%', alert: 'Stable' },
      { name: 'Tense Synthesis', subject: 'English', gap: '44%', alert: 'Critical' },
    ]);
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = { role: 'user' as const, text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // 1. RAG Retrieval Step: Find relevant curriculum chunks
      const chunksRef = collection(db, "curriculum_chunks");
      const q = query(
        chunksRef, 
        where("subject", "==", profile?.subject || "General"),
        where("grade", "==", profile?.grade || "Grade 10"),
        limit(3)
      );
      
      const chunkSnap = await getDocs(q);
      const curriculumContext = chunkSnap.docs.map(doc => doc.data().content).join("\n\n");

      // 2. Performance History Step: Fetch recent strengths/weaknesses
      let performanceContext = "Initial baseline assessment phase. No historical data yet.";
      try {
        const reportsRef = collection(db, "weeklyReports");
        // CRITICAL: Query by studentId to match security rules and ensure correct filtering
        const reportsQ = query(
          reportsRef,
          where("studentId", "==", auth.currentUser?.uid),
          orderBy("createdAt", "desc"),
          limit(2)
        );
        const reportSnap = await getDocs(reportsQ);
        if (!reportSnap.empty) {
          performanceContext = reportSnap.docs.map(doc => {
            const d = doc.data();
            return `Report (${d.week}): Score ${d.marks}%. Strengths: ${d.strengths}. Weaknesses: ${d.weaknesses}.`;
          }).join("\n");
        }
      } catch (perr) {
        console.warn("Failed to fetch performance context", perr);
      }

      // 3. Generation Step: Call Gemini directly in frontend with tailored prompt
      const prompt = `
        System: You are an elite AI Personal Mastery Tutor for FLUENT   ACADEMY. 
        Your tone is patient, encouraging, and pedagogically sound, following British scaffolding standards.
        Target Student: ${profile?.name || 'Scholar'}, Grade: ${profile?.grade || '10'}.
        Subject: ${profile?.subject || 'General'}.
        
        Curriculum Context: Aligned with ICSE/CBSE standards for Physics, Maths, Chemistry, Biology, and English.
        Instructional Framework: Synthesise Indian rigorous requirements with British conceptual clarity.
        
        Student Dynamic Profile (Historical Performance & Gaps):
        ${performanceContext}
        
        Context from Curriculum Knowledge Base (RAG):
        ${curriculumContext || 'No specific curriculum chunk provided. Use general pedagogical best practices.'}
        
        User Inquiry: "${input}"
        
        Instruction: Synthesize a response that leverages the provided curriculum context if relevant. 
        CRITICAL: Tailor your explanation to the student's "Dynamic Profile". If they have weaknesses in related concepts, 
        bridge those gaps first using the "Scaffolding" technique: break it down into smaller, manageable conceptual nodes.
        If they are high-performing, introduce more sophisticated academic vocabulary and outcome-based challenges.
        
        Syllabus Alignment: Ensure all scientific and technical terms match ICSE/CBSE Grade 9-12 standards.
        
        Closing: Always end with a short, challenging "Synthesis Question" to verify their mastery of this specific interaction.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setMessages(prev => [...prev, { role: 'model', text: response.text || "Synthesis complete." }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: "Apologies, my synthesis protocols are momentarily offline. Please retry shortly." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge color="gold">AI Powered</Badge>
            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em]">• Mastery Protocol Active</span>
          </div>
          <h1 className="text-4xl font-serif font-black tracking-tighter text-fluent-navy">Personal <span className="text-fluent-teal font-normal underline decoration-fluent-teal/20 underline-offset-8">Mastery Tutor</span></h1>
          <p className="text-slate-700 mt-2 font-serif text-sm">24/7 conceptual scaffolding tailored to your specific neural gaps.</p>
        </div>
        <div className="flex gap-4">
           <Card className="px-6 py-4 bg-fluent-navy text-white flex items-center gap-4 border-none shadow-xl shadow-fluent-navy/10">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-fluent-gold">
                 <Zap size={20} fill="currentColor" />
              </div>
              <div>
                 <div className="text-[9px] font-black uppercase text-white/40 tracking-widest">Active Streak</div>
                 <div className="text-xl font-mono font-bold tracking-tighter">12 Days</div>
              </div>
           </Card>
        </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Intelligence Feed */}
        <div className="lg:col-span-4 space-y-6">
           {/* Progress Radar */}
           <Card className="p-6 overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <BrainCircuit size={14} className="text-fluent-teal" />
                    Neural Mapping
                 </h3>
                 <Badge color="gray" className="text-[8px]">Real-time</Badge>
              </div>
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name="Scholar"
                      dataKey="A"
                      stroke="var(--color-fluent-teal)"
                      fill="var(--color-fluent-teal)"
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[10px] text-center text-slate-400 mt-4 font-bold uppercase tracking-tight">"Current focus suggests a high accuracy index but low retention resonance."</p>
           </Card>

           {/* Weak Topics Carousel */}
           <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Critical Gaps</h3>
                 <div className="flex gap-1">
                    <button className="p-1 rounded-full bg-white border border-black/5 text-slate-400 hover:text-fluent-teal transition-colors"><ChevronLeft size={14} /></button>
                    <button className="p-1 rounded-full bg-white border border-black/5 text-slate-400 hover:text-fluent-teal transition-colors"><ChevronRight size={14} /></button>
                 </div>
              </div>
              <div className="space-y-3">
                 {weakTopics.map((t, i) => (
                   <Card key={i} className={`p-4 border-none shadow-sm ring-1 transition-all hover:ring-2 ${t.alert === 'Critical' ? 'ring-red-400/20 bg-red-50/30' : 'ring-black/5 bg-white'}`}>
                      <div className="flex justify-between items-start mb-2">
                         <div>
                            <div className="text-[9px] font-black text-slate-400 uppercase mb-0.5 tracking-tighter">{t.subject}</div>
                            <div className="text-sm font-bold text-fluent-navy">{t.name}</div>
                         </div>
                         <Badge color={t.alert === 'Critical' ? 'red' : t.alert === 'Urgent' ? 'gold' : 'navy'} className="text-[8px]">{t.alert}</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-4">
                         <div className="flex-1 h-1 bg-black/5 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: t.gap }} className={`h-full ${t.alert === 'Critical' ? 'bg-red-400' : 'bg-fluent-teal'}`} />
                         </div>
                         <span className="text-[9px] font-mono font-bold text-slate-400">{t.gap} Gap</span>
                      </div>
                   </Card>
                 ))}
              </div>
           </div>
        </div>

        {/* Right Column: AI Chat Interaction */}
        <div className="lg:col-span-8 flex flex-col h-[700px] bg-white rounded-[40px] shadow-2xl border border-black/5 overflow-hidden">
           {/* Chat Header */}
           <div className="p-6 bg-fluent-navy text-white flex justify-between items-center">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-fluent-gold animate-pulse">
                    <Layout size={20} />
                 </div>
                 <div>
                    <h3 className="font-serif font-bold text-lg leading-tight">AI Scaffolder <span className="text-white/40 font-sans text-xs">v3.1</span></h3>
                    <div className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em] mt-0.5">Optimised for {profile?.grade || 'Grade 10'} Synthesis</div>
                 </div>
              </div>
              <div className="flex gap-2">
                 <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-white/60"><Terminal size={18} /></button>
                 <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-white/60"><Mic size={18} /></button>
              </div>
           </div>

           {/* Message Area */}
           <div className="flex-1 overflow-auto p-8 space-y-6" ref={scrollRef}>
              <div className="p-10 text-center space-y-4 max-w-sm mx-auto opacity-30 mt-10">
                 <Sparkles size={40} className="mx-auto text-fluent-gold" />
                 <p className="text-sm font-serif font-medium">"Initialising conceptual dialogue node... Ask anything about your curriculum or mastery targets."</p>
              </div>

              {messages.map((m, i) => (
                <motion.div 
                   initial={{ opacity: 0, y: 10, scale: 0.98 }}
                   animate={{ opacity: 1, y: 0, scale: 1 }}
                   key={i} 
                   className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                   <Avatar name={m.role === 'user' ? (profile?.name || 'You') : 'Tutor'} size={36} color={m.role === 'model' ? '#C9A84C' : '#1B4F5E'} />
                   <div className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} max-w-[85%]`}>
                      <div className={`px-6 py-4 rounded-3xl text-sm leading-relaxed shadow-sm ${
                         m.role === 'user' ? 'bg-fluent-navy text-white rounded-tr-none' : 'bg-gray-50 border border-black/5 text-fluent-navy rounded-tl-none'
                      }`}>
                         {m.text}
                      </div>
                      <div className="mt-2 px-2 text-[8px] font-black uppercase text-slate-300 tracking-widest">
                         {m.role === 'user' ? 'Identity Verified' : 'Standard Transmission'}
                      </div>
                   </div>
                </motion.div>
              ))}

              {isTyping && (
                <div className="flex gap-4">
                   <Avatar name="Tutor" size={36} color="#C9A84C" />
                   <div className="bg-gray-50 border border-black/5 px-6 py-4 rounded-3xl rounded-tl-none">
                      <div className="flex gap-1.5">
                         <div className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                         <div className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                         <div className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                   </div>
                </div>
              )}
           </div>

           {/* Input Area */}
           <div className="p-8 border-t border-black/5 bg-gray-50/50">
              <form onSubmit={handleSendMessage} className="relative flex items-center">
                 <input 
                   placeholder="Query curriculum or request scaffolding..."
                   className="w-full bg-white border border-black/5 rounded-[24px] pl-6 pr-16 py-5 text-sm shadow-sm focus:ring-4 focus:ring-fluent-teal/5 outline-none transition-all"
                   value={input}
                   onChange={(e) => setInput(e.target.value)}
                 />
                 <button 
                   type="submit"
                   disabled={!input.trim() || isTyping}
                   className="absolute right-3 p-3 rounded-2xl bg-fluent-teal text-white shadow-lg shadow-fluent-teal/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100"
                 >
                    <Send size={18} />
                 </button>
              </form>
              <div className="flex justify-center gap-6 mt-6">
                 {["Solve Polynomials", "Newton's Third Law", "Tense Mastery"].map(chip => (
                   <button 
                     key={chip}
                     onClick={() => setInput(`Explain ${chip} like I'm an elite British student`)}
                     className="text-[10px] font-bold text-slate-400 hover:text-fluent-teal transition-colors flex items-center gap-1.5 group"
                   >
                     <PlusCircle size={12} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                     {chip}
                   </button>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function PlusCircle({ size, className }: { size: number, className: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}
