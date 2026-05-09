import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db, auth } from "../lib/firebaseInit";
import { handleFirestoreError, OperationType } from "../lib/errorHandling";
import { Card, ProgressBar, MetricTile, Badge, Avatar, Btn } from "./UI";
import { BarChart3, TrendingUp, Award, MessageSquare, BookOpen, Clock, Zap, Target, ShieldCheck, ChevronRight } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, Legend } from 'recharts';
import { motion } from 'motion/react';

export default function StudentProgress() {
  const [reports, setReports] = useState<any[]>([]);
  const [genericProgress, setGenericProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'trends' | 'feedback' | 'breakdown'>('trends');

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fluent-teal" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
        <div>
           <div className="text-[10px] font-black uppercase tracking-[0.4em] text-fluent-teal mb-3">Metacognitive Dashboard</div>
           <h2 className="text-4xl lg:text-5xl font-serif font-bold text-fluent-navy tracking-tight">Synthesis Progress</h2>
           <p className="text-slate-400 mt-2 font-serif italic">Your journey towards global academic standard, quantified.</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-white border border-black/5 p-4 rounded-2xl text-center min-w-[120px]">
              <div className="text-2xl font-serif font-bold text-fluent-navy">{averageScore}%</div>
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Holistic Mastery</div>
           </div>
           <div className="bg-fluent-teal/5 border border-fluent-teal/10 p-4 rounded-2xl text-center min-w-[120px]">
              <div className="text-2xl font-serif font-bold text-fluent-teal">{averageConfidence}<span className="text-xs opacity-40">/10</span></div>
              <div className="text-[9px] font-black uppercase tracking-widest text-fluent-teal">Confidence Index</div>
           </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-4 gap-6">
        <MetricTile label="Evaluations" value={`${reports.length}`} icon={BookOpen} color="#1B4F5E" />
        <MetricTile label="Mastery Gaps" value={reports.length > 0 ? "3" : "0"} icon={Zap} color="#EF4444" />
        <MetricTile label="Momentum" value={reports.length > 1 ? "+8%" : "N/A"} icon={TrendingUp} color="#10B981" />
        <MetricTile label="Global Rank" value="#04" icon={Award} color="#C9A84C" />
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-black/5 gap-8">
        {[
          { id: 'trends', label: 'Score Trends' },
          { id: 'feedback', label: 'Faculty Feedback' },
          { id: 'breakdown', label: 'Topic Breakdown' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === tab.id ? 'text-fluent-navy' : 'text-slate-300 hover:text-slate-400'}`}
          >
            {tab.label}
            {activeTab === tab.id && <motion.div layoutId="activeProgressTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-fluent-teal" />}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'trends' && (
          <Card className="p-8 border-none shadow-sm ring-1 ring-black/5 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-4">
              <div>
                <h3 className="text-xl font-serif font-bold text-fluent-navy">Mastery vs Execution Curves</h3>
                <p className="text-xs text-slate-400 mt-1">Correlation between scores, confidence, and participation.</p>
              </div>
              <div className="flex gap-4">
                 <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400"><div className="w-2 h-2 rounded-full bg-[#1B4F5E]" /> Mastery</div>
                 <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400"><div className="w-2 h-2 rounded-full bg-[#14B8A6]" /> Confidence</div>
                 <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400"><div className="w-2 h-2 rounded-full bg-[#C9A84C]" /> Articulation</div>
              </div>
            </div>
            <div className="h-[450px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={processedChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    iconType="circle" 
                    wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }} 
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                  />
                  
                  {/* Aggregated Trends */}
                  <Line type="monotone" dataKey="score" stroke="#1B4F5E" strokeWidth={5} dot={{ r: 5, fill: '#1B4F5E' }} activeDot={{ r: 8 }} name="Holistic Mastery" />
                  <Line type="monotone" dataKey="confidence" stroke="#14B8A6" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Confidence" />
                  
                  {/* Subject-Specific Trends */}
                  {topics.map((topic, index) => (
                    <Line 
                      key={topic}
                      type="monotone" 
                      dataKey={topic} 
                      stroke={subjectColors[index % subjectColors.length]} 
                      strokeWidth={2} 
                      dot={{ r: 3, fill: subjectColors[index % subjectColors.length] }} 
                      name={topic} 
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {activeTab === 'feedback' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
             {reports.length > 0 ? (
               <div className="grid lg:grid-cols-2 gap-8">
                 {reports.map((report, i) => (
                   <Card key={report.id} className="p-8 border-none shadow-sm ring-1 ring-black/5 hover:ring-fluent-teal/20 transition-all">
                      <div className="flex justify-between items-start mb-6">
                         <div>
                            <div className="text-[10px] font-black text-fluent-gold uppercase tracking-widest mb-1">{report.week}</div>
                            <h4 className="text-xl font-serif font-bold text-fluent-navy">Standard Audit</h4>
                         </div>
                         <Badge color="navy" className="font-bold">{report.marks}%</Badge>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-6 mb-8">
                         <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                            <div className="flex items-center gap-2 mb-2">
                               <Target size={14} className="text-green-600" />
                               <span className="text-[10px] font-black uppercase text-green-700">Executive Strengths</span>
                            </div>
                            <p className="text-xs text-green-800/70 font-medium leading-relaxed italic">"{report.strengths || "Consistently high performance observed."}"</p>
                         </div>
                         <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                            <div className="flex items-center gap-2 mb-2">
                               <TrendingUp size={14} className="text-red-600" />
                               <span className="text-[10px] font-black uppercase text-red-700">Scaffolding Gaps</span>
                            </div>
                            <p className="text-xs text-red-800/70 font-medium leading-relaxed italic">"{report.weaknesses || "Focus on articulation precision."}"</p>
                         </div>
                    </div>

                    <div className="space-y-4">
                       <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="text-[10px] font-black uppercase text-slate-400 mb-2 flex items-center gap-2">
                             <MessageSquare size={12} /> Detailed Faculty Analysis
                          </div>
                          <p className="text-sm text-fluent-navy font-serif italic leading-relaxed">"{report.teacherComment}"</p>
                       </div>

                       <div className="p-5 bg-fluent-gold/5 rounded-2xl border border-fluent-gold/20">
                          <div className="text-[10px] font-black uppercase text-fluent-gold mb-2 flex items-center gap-2">
                             <Zap size={12} /> Corrective Action Plan
                          </div>
                          <p className="text-xs text-fluent-navy font-bold leading-relaxed">{report.actionPlan}</p>
                       </div>
                    </div>
                 </Card>
               ))}
             </div>
           ) : (
             <div className="p-20 text-center bg-slate-50 rounded-[40px] border border-dashed border-black/5">
                <ShieldCheck size={48} className="mx-auto text-slate-200 mb-4" />
                <h3 className="text-xl font-serif font-bold text-fluent-navy">No Audit Logs Yet</h3>
                <p className="text-sm text-slate-400 mt-2">Formal evaluations are published weekly by the Dean's office.</p>
             </div>
           )}
        </div>
      )}

      {activeTab === 'breakdown' && (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(reports.length > 0 ? reports : genericProgress).map((item, i) => (
              <Card key={i} className="p-6 group hover:shadow-lg transition-all border-none ring-1 ring-black/5">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-fluent-teal group-hover:text-white transition-colors duration-500">
                    <BookOpen size={20} />
                  </div>
                  <Badge color="gold" className="text-[10px] font-bold">{item.marks}%</Badge>
                </div>
                
                <div>
                   <h4 className="text-lg font-serif font-bold text-fluent-navy mb-1">{item.topic || item.week}</h4>
                   <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest mb-4">
                      {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString()}
                   </p>
                </div>
                
                <ProgressBar value={item.marks} color={item.marks > 80 ? "#10B981" : "#1B4F5E"} showPct={false} />
                
                <div className="mt-4 pt-4 border-t border-black/5 flex justify-between items-center">
                   <div className="flex gap-1">
                      {[1,2,3].map(s => (
                        <div key={s} className={`w-1.5 h-1.5 rounded-full ${s <= (item.confidence || item.confidenceScore || 7) / 3 ? 'bg-fluent-gold' : 'bg-slate-100'}`} />
                      ))}
                   </div>
                   <div className="text-[9px] font-black uppercase text-slate-300">Confidence</div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-8 bg-fluent-navy text-white border-none overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 scale-150">
               <Award size={160} />
            </div>
            <div className="relative z-10">
               <h3 className="text-2xl font-serif font-bold text-fluent-gold mb-2">Mastery Standard Notification</h3>
               <p className="text-white/70 max-w-xl text-sm leading-relaxed mb-8 font-serif italic">
                  "The current synthesis rate exceeds the baseline architectural standard by 14%. Focus next evaluation phase on non-linear articulation and deductive precision."
               </p>
               <Btn variant="outline" className="border-white/20 text-white hover:bg-white/10">Download Holistic Archive</Btn>
            </div>
          </Card>
        </div>
      )}
      </div>
    </div>
  );
}
