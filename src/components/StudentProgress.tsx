import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db, auth } from "../lib/firebaseInit";
import { handleFirestoreError, OperationType } from "../lib/errorHandling";
import { Card, ProgressBar, MetricTile } from "./UI";
import { BarChart3, TrendingUp, Award, MessageSquare } from "lucide-react";
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
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-serif font-bold text-fluent-navy tracking-tight">Performance Analytics</h2>
      </div>

      <div className="grid sm:grid-cols-3 gap-6">
        <MetricTile label="Average Score" value={`${averageScore}%`} delta="+4.2%" icon={BarChart3} color="#1B4F5E" />
        <MetricTile label="Topics Mastered" value={`${data.length}`} icon={Award} color="#C9A84C" />
        <MetricTile label="Current Velocity" value="Stable" icon={TrendingUp} color="#10B981" />
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-8 p-8">
          <h3 className="text-xl font-serif font-bold text-fluent-navy mb-8">Synthesis Mastery Curve</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1B4F5E" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#1B4F5E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="score" stroke="#1B4F5E" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-4 p-8 bg-fluent-navy text-white">
          <h3 className="text-xl font-serif font-bold mb-6">Instructor Logs</h3>
          <div className="space-y-6">
            {data.slice(0, 3).map((item, i) => (
              <div key={i} className="pb-6 border-b border-white/10 last:border-0 last:pb-0">
                <div className="text-[10px] font-black uppercase tracking-widest text-fluent-gold mb-2">{item.topic}</div>
                <p className="text-sm text-white/70 italic leading-relaxed mb-4">"{item.feedback}"</p>
                <div className="flex items-center gap-2 text-[10px] font-bold text-white/40">
                  <MessageSquare size={12} /> Dean's Office Feedback
                </div>
              </div>
            ))}
            {data.length === 0 && <p className="text-white/40 text-sm italic">No feedback logs yet.</p>}
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {data.map((item, i) => (
          <Card key={i} className="p-8 group hover:shadow-xl transition-all bg-white relative overflow-hidden">
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div>
                <h3 className="text-lg font-serif font-bold text-fluent-navy mb-1">{item.topic}</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString()}</p>
              </div>
              <div className="text-3xl font-serif font-bold text-fluent-teal">{item.marks}%</div>
            </div>
            
            <div className="space-y-6 relative z-10">
              <ProgressBar value={item.marks} color="#1B4F5E" label="Topic Fluency" />
              
              {item.confidence && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                   <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Confidence</div>
                      <div className="flex items-center gap-2">
                         <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-fluent-teal" style={{ width: `${item.confidence * 10}%` }} />
                         </div>
                         <span className="text-xs font-bold text-fluent-navy">{item.confidence}/10</span>
                      </div>
                   </div>
                   <div className="p-3 bg-slate-50 rounded-xl">
                      <div className="text-[10px] font-black uppercase tracking-widest text-fluent-gold mb-1">Review</div>
                      <p className="text-[10px] text-slate-500 italic leading-tight line-clamp-2">"{item.feedback}"</p>
                   </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
