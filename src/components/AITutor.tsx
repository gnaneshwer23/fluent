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
      // 0. Performance History Step: Fetch recent strengths/weaknesses first to inform RAG
      let performanceContext = "Initial baseline assessment phase. No historical data yet.";
      try {
        const reportsRef = collection(db, "weeklyReports");
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

      // 1. RAG Retrieval Step: Find relevant curriculum chunks
      // Pre-step: Extract keywords from input AND student profile to improve retrieval relevance
      const personalContext = `
        Learning Goals: ${(profile?.learningGoals || []).join(", ")}
        Overall Goal: ${profile?.goal || ""}
        Historical Weaknesses: ${performanceContext}
      `;

      const keywordPrompt = `Based on the following student inquiry and their personal academic context, extract 3-5 high-priority academic keywords or topics to retrieve from a curriculum database.
      
      Student Inquiry: "${input}"
      Personal Context: ${personalContext}
      
      Return ONLY the keywords separated by commas. No other text. Priority should be given to topics mentioned in the inquiry that overlap with their goals/weaknesses.`;
      
      let relevantChunks: any[] = [];
      try {
        const keywordRes = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: keywordPrompt,
        });
        const keywords = (keywordRes.text || "").split(",").map(k => k.trim().toLowerCase()).filter(k => k.length > 0);
        
        // Also derive static keywords from profile for direct boosting
        const profileKeywords = [
          ...(profile?.learningGoals || []),
          ...(profile?.subjects || [])
        ].map(k => k.toLowerCase());

        const chunksRef = collection(db, "curriculum_chunks");
        const q = query(
          chunksRef, 
          where("subject", "==", profile?.subject || "General"),
          where("grade", "==", profile?.grade || "Grade 10"),
          limit(30) // Fetch a larger batch for better personal filtering
        );
        
        const chunkSnap = await getDocs(q);
        const allChunks = chunkSnap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
        
        // Rank chunks by keyword matches with bias towards personal context
        relevantChunks = allChunks.map(chunk => {
          let score = 0;
          const searchData = `${chunk.topic} ${chunk.chapter} ${chunk.content}`.toLowerCase();
          
          // Match against dynamically extracted keywords
          keywords.forEach(kw => {
            if (searchData.includes(kw)) score += 3; // Query-specific keywords get high weight
          });

          // Match against static profile goals/subjects
          profileKeywords.forEach(pk => {
            if (searchData.includes(pk)) score += 1; // Profile keywords get baseline boost
          });

          // Boost if it directly addresses a known weakness in performance context
          if (performanceContext.toLowerCase().includes(chunk.topic.toLowerCase())) {
            score += 5; // Direct weakness match is highest priority
          }

          return { chunk, score };
        })
        .filter(item => item.score > 0 || allChunks.length < 5) 
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(item => item.chunk);

      } catch (err) {
        console.warn("RAG keyword extraction or retrieval failed, falling back to basic query", err);
        // Fallback to basic query if extraction fails
        const chunksRef = collection(db, "curriculum_chunks");
        const q = query(
          chunksRef, 
          where("subject", "==", profile?.subject || "General"),
          where("grade", "==", profile?.grade || "Grade 10"),
          limit(3)
        );
        const chunkSnap = await getDocs(q);
        relevantChunks = chunkSnap.docs.map(doc => doc.data());
      }
      
      const curriculumContext = relevantChunks.length > 0 
        ? relevantChunks.map(c => `[Topic: ${c.topic} | Chapter: ${c.chapter}]: ${c.content}`).join("\n\n")
        : "No specific curriculum chunks found for this exact query.";

      // 3. Generation Step: Call Gemini directly in frontend with tailored prompt
      const prompt = `
        System: You are an elite AI Personal Mastery Tutor for FLUENT   INSTITUTE. 
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
    <div className="p-8 space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[8px] font-display font-medium px-2 py-0.5 rounded bg-fluent-gold/10 text-fluent-gold uppercase tracking-[0.2em] border border-fluent-gold/20">AI Powered</span>
            <span className="text-[10px] text-stone-400 font-display uppercase tracking-[0.2em]">• Mastery Protocol Active</span>
          </div>
          <h1 className="text-4xl font-serif font-black tracking-tighter text-fluent-ink">Personal <span className="text-fluent-gold font-normal italic underline decoration-fluent-gold/20 underline-offset-8">Mastery Tutor</span></h1>
          <p className="text-stone-500 mt-2 font-serif text-sm italic">24/7 conceptual scaffolding tailored to your specific neural gaps.</p>
        </div>
        <div className="flex gap-4">
           <div className="px-6 py-4 bg-fluent-midnight text-fluent-cream flex items-center gap-4 rounded-lg border border-white/5 shadow-xl">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-fluent-gold">
                 <Zap size={20} fill="currentColor" />
              </div>
              <div>
                 <div className="text-[8px] font-display font-medium text-white/30 uppercase tracking-[0.2em]">Active Streak</div>
                 <div className="text-xl font-mono font-bold tracking-tighter text-fluent-cream">12 Days</div>
              </div>
           </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Intelligence Feed */}
        <div className="lg:col-span-4 space-y-6">
           {/* Progress Radar */}
           <div className="bg-white border border-black/5 p-8 rounded-lg overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-[9px] font-display font-medium uppercase tracking-[0.2em] text-stone-400 flex items-center gap-2">
                    <BrainCircuit size={14} className="text-fluent-gold" />
                    Neural Mapping
                 </h3>
                 <span className="text-[8px] font-display font-medium px-1.5 py-0.5 rounded bg-stone-100 text-stone-400 uppercase tracking-tighter">Real-time</span>
              </div>
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#f1f5f9" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fontWeight: 500, fontFamily: 'DM Sans', fill: '#8896aa' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name="Scholar"
                      dataKey="A"
                      stroke="#b8973a"
                      fill="#b8973a"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[10px] text-center text-stone-400 mt-6 font-serif italic border-t border-black/5 pt-4">"Current focus suggests a high accuracy index but low retention resonance."</p>
           </div>

           {/* Weak Topics */}
           <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                 <h3 className="text-[9px] font-display font-medium uppercase tracking-[0.2em] text-stone-400">Critical Gaps</h3>
              </div>
              <div className="space-y-3">
                 {weakTopics.map((t, i) => (
                   <div key={i} className={`p-5 bg-white border ${t.alert === 'Critical' ? 'border-red-100 bg-red-50/10' : 'border-black/5 shadow-sm'} rounded-lg transition-all`}>
                      <div className="flex justify-between items-start mb-2">
                         <div>
                            <div className="text-[8px] font-display font-medium text-stone-400 uppercase mb-0.5 tracking-widest">{t.subject}</div>
                            <div className="font-serif text-lg font-bold text-fluent-ink">{t.name}</div>
                         </div>
                         <span className={`text-[8px] font-display font-medium px-2 py-0.5 rounded uppercase tracking-widest ${
                           t.alert === 'Critical' ? 'bg-red-500 text-white' : 
                           t.alert === 'Urgent' ? 'bg-fluent-gold text-white' : 'bg-fluent-midnight text-white'
                         }`}>
                           {t.alert}
                         </span>
                      </div>
                      <div className="flex items-center gap-3 mt-6">
                         <div className="flex-1 h-1 bg-stone-100 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: t.gap }} className={`h-full ${t.alert === 'Critical' ? 'bg-red-400' : 'bg-fluent-gold'}`} />
                         </div>
                         <span className="text-[9px] font-mono font-bold text-stone-400">{t.gap} Gap</span>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Right Column: AI Chat Interaction */}
        <div className="lg:col-span-8 flex flex-col h-[700px] bg-white rounded-xl shadow-xl border border-black/5 overflow-hidden">
           {/* Chat Header */}
           <div className="px-8 py-5 bg-fluent-midnight text-fluent-cream flex justify-between items-center border-b border-white/5">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded bg-fluent-gold/10 flex items-center justify-center text-fluent-gold border border-fluent-gold/20">
                    <Sparkles size={20} />
                 </div>
                 <div>
                    <h3 className="font-serif font-bold text-xl leading-tight italic">AI Scaffolder <span className="text-fluent-gold font-sans text-[10px] not-italic ml-2 uppercase tracking-widest">v3.1</span></h3>
                    <div className="text-[8px] font-display font-medium text-white/30 uppercase tracking-[0.2em] mt-0.5">Optimised for {profile?.grade || 'Grade 10'} Synthesis</div>
                 </div>
              </div>
           </div>

           {/* Message Area */}
           <div className="flex-1 overflow-auto p-10 space-y-8 custom-scrollbar bg-fluent-ivory/30" ref={scrollRef}>
              <div className="p-10 text-center space-y-4 max-w-sm mx-auto opacity-30 mt-10">
                 <Sparkles size={40} className="mx-auto text-fluent-gold" />
                 <p className="text-sm font-serif italic">"Initialising conceptual dialogue node... Ask anything about your curriculum or mastery targets."</p>
              </div>

              {messages.map((m, i) => (
                <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   key={i} 
                   className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold leading-none ${m.role === 'user' ? 'bg-fluent-midnight text-fluent-cream' : 'bg-fluent-gold text-fluent-midnight'}`}>
                     {m.role === 'user' ? (profile?.name?.charAt(0) || 'S') : '✦'}
                   </div>
                   <div className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} max-w-[85%]`}>
                      <div className={`px-6 py-4 rounded-xl text-sm leading-relaxed shadow-sm ${
                         m.role === 'user' ? 'bg-fluent-midnight text-fluent-cream rounded-tr-none' : 'bg-white border border-black/5 text-fluent-ink rounded-tl-none font-serif'
                      }`}>
                         {m.text}
                      </div>
                      <div className="mt-2 px-2 text-[8px] font-display font-medium text-stone-300 uppercase tracking-[0.2em]">
                         {m.role === 'user' ? 'Identity Verified' : 'Standard Transmission'}
                      </div>
                   </div>
                </motion.div>
              ))}

              {isTyping && (
                <div className="flex gap-4">
                   <div className="w-8 h-8 rounded-full bg-fluent-gold text-fluent-midnight flex items-center justify-center text-xs font-bold leading-none">✦</div>
                   <div className="bg-white border border-black/5 px-6 py-4 rounded-xl rounded-tl-none">
                      <div className="flex gap-1.5">
                         <div className="w-1.5 h-1.5 rounded-full bg-fluent-gold/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                         <div className="w-1.5 h-1.5 rounded-full bg-fluent-gold/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                         <div className="w-1.5 h-1.5 rounded-full bg-fluent-gold/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                   </div>
                </div>
              )}
           </div>

           {/* Input Area */}
           <div className="p-8 border-t border-black/5 bg-white">
              <form onSubmit={handleSendMessage} className="relative flex items-center">
                 <input 
                   placeholder="Query curriculum or request scaffolding..."
                   className="w-full bg-stone-50 border border-black/5 rounded-lg pl-6 pr-16 py-5 text-sm shadow-inner focus:bg-white focus:ring-4 focus:ring-fluent-gold/5 outline-none transition-all font-serif italic"
                   value={input}
                   onChange={(e) => setInput(e.target.value)}
                 />
                 <button 
                   type="submit"
                   disabled={!input.trim() || isTyping}
                   className="absolute right-3 p-3 rounded bg-fluent-midnight text-fluent-gold shadow-lg hover:bg-fluent-gold hover:text-fluent-midnight transition-all disabled:opacity-50"
                 >
                    <Send size={18} />
                 </button>
              </form>
              <div className="flex justify-center gap-6 mt-6">
                 {["Solve Polynomials", "Newton's Third Law", "Tense Mastery"].map(chip => (
                   <button 
                     key={chip}
                     onClick={() => setInput(`Explain ${chip}`)}
                     className="text-[9px] font-display font-medium text-stone-400 hover:text-fluent-gold transition-colors flex items-center gap-1.5 group uppercase tracking-widest"
                   >
                     <span className="opacity-40 group-hover:opacity-100 transition-opacity">+</span>
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
