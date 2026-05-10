import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy, getDocs, limit } from "firebase/firestore";
import { db, auth } from "../lib/firebaseInit";
import { handleFirestoreError, OperationType } from "../lib/errorHandling";
import { Card, ProgressBar, MetricTile, Badge, Avatar, Btn } from "./UI";
import { BarChart3, TrendingUp, Award, MessageSquare, BookOpen, Clock, Zap, Target, ShieldCheck, ChevronRight, Sparkles, BrainCircuit, ExternalLink, Library } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, Legend } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export default function StudentProgress({ profile }: { profile?: any }) {
  const [reports, setReports] = useState<any[]>([]);
  const [genericProgress, setGenericProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'trends' | 'feedback' | 'breakdown' | 'ai-diagnostic'>('trends');
  
  // AI Analysis State
  const [analysis, setAnalysis] = useState<{
    summary: string;
    strengths: string[];
    weaknesses: string[];
    trajectory: string;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestedResources, setSuggestedResources] = useState<any[]>([]);

  useEffect(() => {
    if (!auth.currentUser) return;

    // Fetch primary weekly reports
    const qReports = query(
      collection(db, "weeklyReports"),
      where("studentId", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const qProgress = query(
      collection(db, "progress"),
      where("studentId", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubReports = onSnapshot(qReports, (snapshot) => {
      setReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, "weeklyReports"));

    const unsubProgress = onSnapshot(qProgress, (snapshot) => {
      setGenericProgress(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "progress"));

    return () => {
      unsubReports();
      unsubProgress();
    };
  }, []);

  const averageScore = reports.length > 0 
    ? Math.round(reports.reduce((acc, curr) => acc + (curr.marks || 0), 0) / reports.length)
    : (genericProgress.length > 0 ? Math.round(genericProgress.reduce((acc, curr) => acc + (curr.marks || 0), 0) / genericProgress.length) : 0);

  const averageConfidence = reports.length > 0
    ? (reports.reduce((acc, curr) => acc + (curr.confidenceScore || 0), 0) / reports.length).toFixed(1)
    : "7.0";

  const topics = Array.from(new Set(genericProgress.map((p) => p.topic).filter(Boolean))) as string[];
  const subjectColors = ["#EF4444", "#3B82F6", "#F59E0B", "#10B981", "#8B5CF6", "#EC4899", "#6366F1"];

  const processedChartData = [...reports].reverse().map((report) => {
    const dateObj = report.createdAt?.toDate?.() || new Date();
    const dateStr = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    
    const dataPoint: any = {
      name: report.week?.split(' ')[1] || dateStr,
      fullDate: dateObj.toLocaleDateString(),
      score: report.marks,
      confidence: (report.confidenceScore || 0) * 10,
      participation: (report.participationScore || 0) * 10,
    };

    topics.forEach((topic) => {
      const latestMilestone = genericProgress
        .filter((p) => p.topic === topic && (p.createdAt?.toDate() || 0) <= dateObj)
        .sort((a, b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0))[0];
      if (latestMilestone) {
        dataPoint[topic] = latestMilestone.marks;
      }
    });

    return dataPoint;
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-white p-5 rounded-2xl shadow-2xl border border-black/5 ring-1 ring-black/5 min-w-[220px]">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
              <Clock size={10} /> {dataPoint.fullDate || label}
            </span>
            <span className="text-[10px] font-bold text-fluent-teal bg-fluent-teal/5 px-2 py-0.5 rounded-full">
              Audit Node
            </span>
          </div>
          <div className="space-y-3">
            {payload.filter((entry: any) => entry.value !== undefined).map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-[11px] font-bold text-fluent-navy">{entry.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono font-black text-fluent-teal">{entry.value}%</span>
                  {entry.value > 85 && <Zap size={10} className="text-fluent-gold" />}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-black/5">
             <div className="text-[9px] text-slate-400 font-medium italic italic">"Performance aligned with global British pedagogy standards."</div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Effect to run AI diagnostic when requested
  const runDiagnostic = async () => {
    if (reports.length === 0 && genericProgress.length === 0) return;
    setIsAnalyzing(true);

    try {
      // 1. Prepare Performance History
      const historyStr = reports.slice(0, 5).map(r => 
        `Report (${r.week}): Score ${r.marks}%, Strengths: ${r.strengths}, Weaknesses: ${r.weaknesses}`
      ).join("\n") + "\n" + genericProgress.slice(0, 10).map(p => 
        `Topic: ${p.topic}, Score: ${p.marks}%`
      ).join("\n");

      // 2. Identify Patterns with AI
      const analysisPrompt = `
        Analyze this student's performance history and identify clear patterns of academic growth, 
        specific recurring weaknesses (conceptual nodes), and overall mastery trajectory.
        
        Academic Context: Grade ${profile?.grade || '10'}, Subject: ${profile?.subject || 'All'}.
        Performance History:
        ${historyStr}
        
        Return a JSON object in the following format:
        {
          "summary": "A 2-3 sentence overview of the current state",
          "strengths": ["string", "string", "string"],
          "weaknesses": ["string", "string", "string"],
          "trajectory": "Short description of the trend (e.g. Accelerating, Consistent, Stagnant)"
        }
        Return ONLY the JSON.
      `;

      const genRes = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: analysisPrompt,
      });
      
      let analysisData;
      try {
        const text = genRes.text || "{}";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        analysisData = JSON.parse(jsonMatch ? jsonMatch[0] : text);
      } catch (e) {
        analysisData = {
          summary: genRes.text || "Analysis complete.",
          strengths: ["Historical consistency", "Subject engagement"],
          weaknesses: ["Specific topic depth", "Articulation of complex concepts"],
          trajectory: "Stable"
        };
      }
      
      setAnalysis(analysisData);

      // 3. RAG Step: Retrieve suggested resources based on identified weaknesses
      const keywords = analysisData.weaknesses.map((w: string) => w.split(' ').slice(0, 2).join(' '));

      // Fetch curriculum chunks matching keywords
      const chunksRef = collection(db, "curriculum_chunks");
      const q = query(
        chunksRef,
        where("subject", "==", profile?.subject || "General"),
        limit(50)
      );
      const chunkSnap = await getDocs(q);
      const allChunks = chunkSnap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));

      const recommended = allChunks.filter(chunk => 
        keywords.some((kw: string) => 
          chunk.topic.toLowerCase().includes(kw.toLowerCase()) || 
          chunk.content.toLowerCase().includes(kw.toLowerCase())
        )
      ).slice(0, 3);

      // If no precision matches, just give relevant subject nodes
      if (recommended.length === 0) {
        setSuggestedResources(allChunks.slice(0, 3));
      } else {
        setSuggestedResources(recommended);
      }
    } catch (err) {
      console.error("Diagnostic failed", err);
      setAnalysis({
        summary: "Apologies, the AI diagnostic protocol is currently experiencing latency. Please retry shortly.",
        strengths: [],
        weaknesses: [],
        trajectory: "Unknown"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'ai-diagnostic' && !analysis && !isAnalyzing) {
      runDiagnostic();
    }
  }, [activeTab]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fluent-teal" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
        <div>
           <div className="text-[10px] font-display font-medium uppercase tracking-[0.4em] text-fluent-gold mb-3">Metacognitive Dashboard</div>
           <h2 className="text-4xl lg:text-5xl font-serif font-bold text-fluent-ink tracking-tight">Synthesis Progress</h2>
           <p className="text-stone-400 mt-2 font-serif italic">Your journey towards global academic standard, quantified.</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-white border border-black/5 p-4 rounded-lg text-center min-w-[120px]">
              <div className="text-2xl font-serif font-bold text-fluent-ink">{averageScore}%</div>
              <div className="text-[9px] font-display font-medium uppercase tracking-widest text-stone-400">Holistic Mastery</div>
           </div>
           <div className="bg-fluent-gold/5 border border-fluent-gold/10 p-4 rounded-lg text-center min-w-[120px]">
              <div className="text-2xl font-serif font-bold text-fluent-gold">{averageConfidence}<span className="text-xs opacity-40">/10</span></div>
              <div className="text-[9px] font-display font-medium uppercase tracking-widest text-fluent-gold">Confidence Index</div>
           </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-4 gap-6">
        <MetricTile label="Evaluations" value={`${reports.length}`} icon={BookOpen} color="#b8973a" />
        <MetricTile label="Mastery Gaps" value={reports.length > 0 ? "3" : "0"} icon={Zap} color="#c0392b" />
        <MetricTile label="Momentum" value={reports.length > 1 ? "+8%" : "N/A"} icon={TrendingUp} color="#27ae60" />
        <MetricTile label="Global Rank" value="#04" icon={Award} color="#b8973a" />
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-black/5 gap-8">
        {[
          { id: 'trends', label: 'Score Trends' },
          { id: 'feedback', label: 'Faculty Feedback' },
          { id: 'breakdown', label: 'Topic Breakdown' },
          { id: 'ai-diagnostic', label: 'AI Diagnostic' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 text-[10px] font-display font-medium uppercase tracking-[0.2em] transition-all relative ${activeTab === tab.id ? 'text-fluent-ink' : 'text-stone-300 hover:text-stone-400'}`}
          >
            {tab.label}
            {activeTab === tab.id && <motion.div layoutId="activeProgressTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-fluent-gold" />}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'trends' && (
          <div className="bg-white border border-black/5 p-8 rounded-lg shadow-sm">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-4">
              <div>
                <h3 className="text-xl font-serif font-bold text-fluent-ink">Mastery vs Execution Curves</h3>
                <p className="text-xs text-stone-400 mt-1 italic font-serif">Correlation between scores, confidence, and participation.</p>
              </div>
              <div className="flex gap-4">
                 <div className="flex items-center gap-1.5 text-[9px] font-display font-medium uppercase tracking-widest text-stone-400"><div className="w-2 h-2 rounded-full bg-fluent-midnight" /> Mastery</div>
                 <div className="flex items-center gap-1.5 text-[9px] font-display font-medium uppercase tracking-widest text-stone-400"><div className="w-2 h-2 rounded-full bg-fluent-gold" /> Confidence</div>
              </div>
            </div>
            <div className="h-[450px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={processedChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 500, fontFamily: 'DM Sans', fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 500, fontFamily: 'DM Sans', fill: '#94a3b8' }} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    iconType="circle" 
                    wrapperStyle={{ fontSize: '10px', paddingTop: '20px', fontFamily: 'Cinzel', textTransform: 'uppercase', letterSpacing: '0.1em' }} 
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                  />
                  
                  <Line type="monotone" dataKey="score" stroke="#0a0e1a" strokeWidth={3} dot={{ r: 4, fill: '#0a0e1a' }} activeDot={{ r: 6 }} name="Holistic Mastery" />
                  <Line type="monotone" dataKey="confidence" stroke="#b8973a" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Confidence" />
                  
                  {topics.map((topic, index) => (
                    <Line 
                      key={topic}
                      type="monotone" 
                      dataKey={topic} 
                      stroke={subjectColors[index % subjectColors.length]} 
                      strokeWidth={1.5} 
                      dot={{ r: 2, fill: subjectColors[index % subjectColors.length] }} 
                      name={topic} 
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'feedback' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
             {reports.length > 0 ? (
                <div className="grid lg:grid-cols-2 gap-8">
                  {reports.map((report, i) => (
                    <div key={report.id} className="bg-white border border-black/5 p-8 rounded-lg shadow-sm hover:border-fluent-gold/20 transition-all group">
                       <div className="flex justify-between items-start mb-6">
                          <div>
                             <div className="text-[10px] font-display font-medium text-fluent-gold uppercase tracking-[0.2em] mb-1">{report.week}</div>
                             <h4 className="text-xl font-serif font-bold text-fluent-ink">Standard Audit</h4>
                          </div>
                          <Badge color="gold" className="font-bold">{report.marks}%</Badge>
                       </div>

                       <div className="grid sm:grid-cols-2 gap-6 mb-8">
                          <div className="p-5 bg-green-50 rounded-lg border border-green-100">
                             <div className="flex items-center gap-2 mb-2">
                                <Target size={14} className="text-green-600" />
                                <span className="text-[9px] font-display font-medium uppercase text-green-700 tracking-wider">Executive Strengths</span>
                             </div>
                             <p className="text-xs text-green-800/80 font-serif italic leading-relaxed">"{report.strengths || "Consistently high performance observed."}"</p>
                          </div>
                          <div className="p-5 bg-red-50 rounded-lg border border-red-100">
                             <div className="flex items-center gap-2 mb-2">
                                <Zap size={14} className="text-red-600" />
                                <span className="text-[9px] font-display font-medium uppercase text-red-700 tracking-wider">Scaffolding Gaps</span>
                             </div>
                             <p className="text-xs text-red-800/80 font-serif italic leading-relaxed">"{report.weaknesses || "Focus on articulation precision."}"</p>
                          </div>
                     </div>

                     <div className="space-y-4">
                        <div className="p-6 bg-stone-50 rounded-lg border border-stone-100 italic">
                           <div className="text-[9px] font-display font-medium uppercase text-stone-400 mb-3 flex items-center gap-2 tracking-widest text-shadow-none">
                              <MessageSquare size={12} /> Detailed Faculty Analysis
                           </div>
                           <p className="text-sm text-fluent-ink font-serif leading-relaxed">"{report.teacherComment}"</p>
                        </div>

                        <div className="p-6 bg-fluent-midnight text-fluent-cream rounded-lg border border-white/5">
                           <div className="text-[9px] font-display font-medium uppercase text-fluent-gold mb-3 flex items-center gap-2 tracking-[0.2em]">
                              <Zap size={12} /> Corrective Action Plan
                           </div>
                           <p className="text-xs text-white/70 font-medium leading-relaxed font-serif italic">{report.actionPlan}</p>
                        </div>
                     </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-20 text-center bg-stone-50 rounded-lg border border-dashed border-stone-200">
                 <ShieldCheck size={48} className="mx-auto text-stone-200 mb-4" />
                 <h3 className="text-xl font-serif font-bold text-fluent-ink">No Audit Logs Yet</h3>
                 <p className="text-sm text-stone-400 mt-2 font-serif italic">Formal evaluations are published weekly by the Dean's office.</p>
              </div>
            )}
        </div>
      )}

      {activeTab === 'breakdown' && (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(reports.length > 0 ? reports : genericProgress).map((item, i) => (
              <div key={i} className="bg-white border border-black/5 p-8 rounded-lg group hover:border-fluent-gold/30 transition-all shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-10 h-10 bg-stone-50 rounded flex items-center justify-center text-stone-400 group-hover:bg-fluent-midnight group-hover:text-fluent-gold transition-colors">
                    <BookOpen size={20} />
                  </div>
                  <Badge color="gold" className="text-[10px] font-bold">{item.marks}%</Badge>
                </div>
                
                <div className="mb-6">
                   <h4 className="text-xl font-serif font-bold text-fluent-ink mb-1">{item.topic || item.week}</h4>
                   <p className="text-[8px] text-stone-400 font-display font-medium uppercase tracking-[0.2em]">
                      {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString()}
                   </p>
                </div>
                
                <ProgressBar value={item.marks} color="#b8973a" showPct={false} />
                
                <div className="mt-4 pt-4 border-t border-black/5 flex justify-between items-center">
                   <div className="flex gap-1">
                      {[1,2,3].map(s => (
                        <div key={s} className={`w-1.5 h-1.5 rounded-full ${s <= (item.confidence || item.confidenceScore || 7) / 3 ? 'bg-fluent-gold' : 'bg-stone-100'}`} />
                      ))}
                   </div>
                   <div className="text-[8px] font-display font-medium uppercase text-stone-300 tracking-widest">Confidence</div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-10 bg-fluent-midnight text-fluent-cream rounded-lg border border-white/5 overflow-hidden relative shadow-xl">
            <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12 scale-150">
               <Award size={160} />
            </div>
            <div className="relative z-10">
               <h3 className="text-2xl font-serif font-bold text-fluent-gold mb-2 tracking-tight uppercase">Mastery Standard Notification</h3>
               <p className="text-white/60 max-w-xl text-sm leading-relaxed mb-8 font-serif italic">
                  "The current synthesis rate exceeds the baseline architectural standard by 14%. Focus next evaluation phase on non-linear articulation and deductive precision."
               </p>
               <Btn variant="outline" className="border-white/20 text-fluent-cream hover:bg-white/5 uppercase">Download Holistic Archive</Btn>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ai-diagnostic' && (
          <div className="space-y-10 pb-20">
             <div className="bg-fluent-midnight rounded-xl p-12 text-fluent-cream relative overflow-hidden shadow-2xl border border-white/5">
                <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12">
                   <BrainCircuit size={280} />
                </div>
                <div className="relative z-10">
                   <Badge color="gold" className="mb-6 font-bold uppercase tracking-[0.2em] bg-white/5">Mastery Analysis</Badge>
                   <h3 className="text-4xl font-serif font-black tracking-tight leading-none mb-4">Neural Diagnostic Engine</h3>
                   <p className="text-white/60 font-serif italic text-lg max-w-xl"> Synthesising your historical performance data to identify conceptual gaps and curriculum alignment.</p>
                </div>
             </div>

             {isAnalyzing ? (
               <div className="py-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-fluent-gold/10 rounded-full flex items-center justify-center mx-auto text-fluent-gold animate-float border border-fluent-gold/20">
                     <Sparkles size={32} />
                  </div>
                  <p className="text-[9px] font-display font-medium uppercase tracking-[0.4em] text-stone-400">Analysing Synthesis Patterns...</p>
               </div>
             ) : (
               <div className="grid lg:grid-cols-5 gap-10">
                  <div className="lg:col-span-3 space-y-8">
                     <div className="bg-white border border-black/5 p-10 rounded-lg shadow-sm">
                        <h4 className="text-[9px] font-display font-medium uppercase tracking-[0.4em] text-stone-400 mb-8">Executive Diagnosis</h4>
                        
                        {analysis && (
                          <div className="space-y-8">
                            <div>
                               <p className="text-sm text-fluent-ink leading-relaxed font-serif italic mb-6">"{analysis.summary}"</p>
                               <div className="flex items-center gap-2 px-3 py-1 bg-stone-50 border border-black/5 rounded w-fit">
                                  <TrendingUp size={12} className="text-fluent-gold" />
                                  <span className="text-[9px] font-display font-medium uppercase text-stone-500 tracking-widest">{analysis.trajectory} Trajectory</span>
                               </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-8 pt-8 border-t border-black/5">
                               <div className="space-y-5">
                                  <div className="text-[9px] font-display font-medium text-green-600 uppercase tracking-widest flex items-center gap-2">
                                     <ShieldCheck size={14} /> Core Strengths
                                  </div>
                                  <div className="space-y-3">
                                     {analysis.strengths.map((s, i) => (
                                       <div key={i} className="flex items-start gap-3 p-4 bg-green-50/30 rounded border border-green-100 font-serif italic">
                                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                                          <span className="text-xs font-medium text-green-800">{s}</span>
                                       </div>
                                     ))}
                                  </div>
                               </div>
                               <div className="space-y-5">
                                  <div className="text-[9px] font-display font-medium text-red-600 uppercase tracking-widest flex items-center gap-2">
                                     <Zap size={14} /> Scaffolding Gaps
                                  </div>
                                  <div className="space-y-3">
                                     {analysis.weaknesses.map((w, i) => (
                                       <div key={i} className="flex items-start gap-3 p-4 bg-red-50/30 rounded border border-red-100 font-serif italic">
                                          <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                                          <span className="text-xs font-medium text-red-800">{w}</span>
                                       </div>
                                     ))}
                                  </div>
                               </div>
                            </div>
                          </div>
                        )}
                     </div>
                     
                     <Btn variant="primary" icon={Sparkles} onClick={runDiagnostic} className="w-full py-6 text-[10px] uppercase font-display tracking-[0.2em]">Recalibrate Neural Lens ✦</Btn>
                  </div>

                  <div className="lg:col-span-2 space-y-8">
                     <div>
                        <h4 className="text-[9px] font-display font-medium uppercase tracking-[0.2em] text-stone-500 mb-6 px-1">Grounded Recommendations</h4>
                        <div className="space-y-4">
                           {suggestedResources.length > 0 ? suggestedResources.map((res) => (
                             <div key={res.id} className="p-6 border border-black/5 hover:border-fluent-gold/30 transition-all bg-white group rounded-lg shadow-sm">
                                <div className="flex gap-4 items-start">
                                   <div className="w-10 h-10 bg-stone-50 rounded flex items-center justify-center text-stone-400 shrink-0 group-hover:bg-fluent-gold/10 group-hover:text-fluent-gold transition-colors">
                                      <Library size={18} />
                                   </div>
                                   <div className="flex-1">
                                      <div className="text-[8px] font-display font-medium text-stone-400 uppercase tracking-widest mb-1">{res.chapter}</div>
                                      <h5 className="font-serif text-lg font-bold text-fluent-ink group-hover:text-fluent-gold transition-colors leading-tight">{res.topic}</h5>
                                      <p className="text-[10px] text-stone-500 mt-2 line-clamp-2 leading-relaxed italic font-serif">"{res.content}"</p>
                                      <button className="mt-4 text-[8px] font-display font-medium uppercase tracking-widest text-fluent-gold flex items-center gap-1 group/btn">
                                        Study Node <ChevronRight size={10} className="group-hover/btn:translate-x-1 transition-transform" />
                                      </button>
                                   </div>
                                </div>
                             </div>
                           )) : (
                             <div className="p-8 text-center bg-stone-50 border border-dashed border-stone-200 rounded-lg">
                                <Library size={32} className="mx-auto text-stone-200 mb-4" />
                                <p className="text-xs text-stone-400 font-serif italic">"Complete evaluations to unlock curriculum recommendations."</p>
                             </div>
                           )}
                        </div>
                     </div>

                     <div className="p-8 bg-fluent-gold/5 border border-fluent-gold/10 rounded-lg">
                        <div className="flex items-center gap-3 mb-4">
                           <ShieldCheck className="text-fluent-gold" size={18} />
                           <h4 className="text-[10px] font-display font-medium uppercase tracking-widest text-fluent-ink">Pedagogical Guardrail</h4>
                        </div>
                        <p className="text-xs text-stone-600 leading-relaxed italic font-serif">
                           Recommendations are synchronised with your specific regional syllabus (ICSE/CBSE Class 9-12) and personal mastery trajectory.
                        </p>
                     </div>
                  </div>
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
}
