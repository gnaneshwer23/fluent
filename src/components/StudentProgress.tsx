import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db, auth } from "../lib/firebaseInit";
import { handleFirestoreError, OperationType } from "../lib/errorHandling";
import { Card, ProgressBar, MetricTile, Badge } from "./UI";
import { BarChart3, TrendingUp, Award, MessageSquare, BookOpen, Clock } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function StudentProgress() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "progress"),
      where("studentId", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "progress");
    });

    return () => unsub();
  }, []);

  const averageScore = data.length > 0 
    ? Math.round(data.reduce((acc, curr) => acc + (curr.marks || 0), 0) / data.length)
    : 0;

  const chartData = [...data].reverse().map((item, i) => ({
    name: item.topic.split(' ')[0],
    score: item.marks
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fluent-teal" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end mb-4">
        <div>
           <div className="text-[10px] font-black uppercase tracking-[0.3em] text-fluent-teal mb-2">Metrics Oversight</div>
           <h2 className="text-4xl font-serif font-bold text-fluent-navy tracking-tight">Performance Analytics</h2>
        </div>
        <div className="text-right">
           <div className="text-4xl font-serif font-bold text-fluent-gold">{averageScore}%</div>
           <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Holistic Mastery</div>
        </div>
      </div>

      <div className="grid sm:grid-cols-4 gap-6">
        <MetricTile label="Total Topics" value={`${data.length}`} icon={BookOpen} color="#1B4F5E" />
        <MetricTile label="Avg Mastery" value={`${averageScore}%`} icon={BarChart3} color="#C9A84C" />
        <MetricTile label="Improvement" value="+12%" icon={TrendingUp} color="#10B981" />
        <MetricTile label="Active Reviews" value="4" icon={Clock} color="#7C3AED" />
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-8 p-8 border-none shadow-sm ring-1 ring-black/5">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-serif font-bold text-fluent-navy">Synthesis Mastery Curve</h3>
            <div className="flex gap-2">
               <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500"><div className="w-2 h-2 rounded-full bg-fluent-teal" /> Mastery</div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1B4F5E" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1B4F5E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="score" stroke="#1B4F5E" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-4 p-8 bg-fluent-navy text-white border-none">
          <h3 className="text-lg font-serif font-bold mb-6 text-white/90">Instructor Logs</h3>
          <div className="space-y-6">
            {data.slice(0, 3).map((item, i) => (
              <div key={i} className="pb-6 border-b border-white/10 last:border-0 last:pb-0">
                <div className="text-[9px] font-black uppercase tracking-widest text-fluent-gold mb-2">{item.topic}</div>
                <p className="text-sm text-white/70 italic leading-relaxed mb-4">"{item.feedback}"</p>
                <div className="flex items-center gap-2 text-[10px] font-bold text-white/50">
                  <MessageSquare size={12} /> Dean's Office Feedback
                </div>
              </div>
            ))}
            {data.length === 0 && <p className="text-white/40 text-sm italic">No feedback logs yet.</p>}
          </div>
        </Card>
      </div>

      <div>
         <h3 className="text-lg font-serif font-bold text-fluent-navy mb-6">Topic Breakdown</h3>
         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
           {data.map((item, i) => (
             <Card key={i} className="p-6 group hover:shadow-lg transition-all border-none ring-1 ring-black/5">
               <div className="flex justify-between items-start mb-4">
                 <div>
                   <h4 className="text-sm font-serif font-bold text-fluent-navy mb-0.5">{item.topic}</h4>
                   <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString()}</p>
                 </div>
                 <Badge color="gold" className="text-[10px] font-bold">{item.marks}%</Badge>
               </div>
               
               <ProgressBar value={item.marks} color={item.marks > 80 ? "#10B981" : "#1B4F5E"} showPct={false} />
             </Card>
           ))}
         </div>
       </div>
    </div>
  );
}
