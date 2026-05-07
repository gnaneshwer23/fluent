import React, { useState, useEffect } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import { Card, Btn, Badge } from "./UI";
import { 
  TrendingUp, Users, Target, Zap, Star, ShieldAlert, 
  BarChart3, Award, ArrowUpRight, ArrowDownRight, Activity
} from "lucide-react";
import { fetchTeacherAnalytics, AnalyticsData, getTeacherInsights } from "../lib/analytics";

export default function TeacherAnalytics({ teacherId }: { teacherId: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchTeacherAnalytics(teacherId);
        setData(result);
      } catch (err) {
        console.error("Aggregation failed", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [teacherId]);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fluent-teal" />
    </div>
  );

  if (!data) return <div>Failed to load performance metrics.</div>;

  const getAlertStatus = () => {
    if (data.avgConfidence < 6) return { label: "Confidence Intervention Needed", color: "red" };
    if (data.avgMarks < 60) return { label: "Academic Recovery Required", color: "red" };
    return { label: "Quality Standards Maintained", color: "teal" };
  };

  const alertStatus = getAlertStatus();

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="text-[10px] font-black text-fluent-gold uppercase tracking-[0.6em] mb-4">Quality Assurance Protocol</div>
          <h2 className="text-4xl font-serif font-bold text-fluent-navy">Faculty Performance Synthesis</h2>
          <p className="text-slate-400 mt-2 italic">Comprehensive audit of instructional impact and scholar evolution.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge color={alertStatus.color as any} icon={alertStatus.color === 'red' ? ShieldAlert : Award}>
            {alertStatus.label}
          </Badge>
        </div>
      </div>

      {/* TOP METRICS GRID */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="p-8 border-black/5 bg-white shadow-xl group hover:-translate-y-1 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-teal-50 text-fluent-teal rounded-2xl"><TrendingUp size={20} /></div>
            <div className="flex items-center text-green-500 text-[10px] font-bold"><ArrowUpRight size={14} /> 4.2%</div>
          </div>
          <div className="text-3xl font-serif font-bold text-fluent-navy">{data.avgMarks}%</div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Average Scholar Fluency</div>
        </Card>

        <Card className="p-8 border-black/5 bg-white shadow-xl group hover:-translate-y-1 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl"><Zap size={20} /></div>
            <div className="flex items-center text-green-500 text-[10px] font-bold"><ArrowUpRight size={14} /> 2 nodes</div>
          </div>
          <div className="text-3xl font-serif font-bold text-fluent-navy">{data.avgConfidence}/10</div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Confidence Quotient</div>
        </Card>

        <Card className="p-8 border-black/5 bg-white shadow-xl group hover:-translate-y-1 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-50 text-purple-500 rounded-2xl"><Activity size={20} /></div>
            <div className="flex items-center text-red-400 text-[10px] font-bold"><ArrowDownRight size={14} /> 0.5%</div>
          </div>
          <div className="text-3xl font-serif font-bold text-fluent-navy">{data.attendanceRate}%</div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Roll Call Consistency</div>
        </Card>

        <Card className="p-8 border-black/5 bg-fluent-navy text-white shadow-2xl relative overflow-hidden">
          <Zap className="absolute -right-4 -bottom-4 text-white/5 w-32 h-32" />
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-fluent-gold mb-6">Faculty Global Score</div>
          <div className="text-6xl font-serif font-bold mb-2">{data.teacherScore}</div>
          <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Weighted Quality Index</div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* GROWTH CHART */}
        <Card className="lg:col-span-2 p-10 bg-white border-black/5 shadow-xl">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-serif font-bold text-fluent-navy">Academic Efficiency Baseline</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                <div className="w-3 h-3 rounded-full bg-fluent-teal" /> Scholar Fluency
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                <div className="w-3 h-3 rounded-full bg-slate-200" /> Previous Cohort
              </div>
            </div>
          </div>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.history}>
                <defs>
                  <linearGradient id="colorMarks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1B4F5E" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1B4F5E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="marks" 
                  stroke="#1B4F5E" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorMarks)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* FEEDBACK & RATINGS */}
        <div className="space-y-8">
          <Card className="p-8 bg-white border-black/5 shadow-xl text-center">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Parental Satisfaction</div>
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={24} className={i < Math.floor(data.rating) ? "text-fluent-gold fill-fluent-gold" : "text-slate-200"} />
              ))}
            </div>
            <div className="text-4xl font-serif font-bold text-fluent-navy mb-1">{data.rating}</div>
            <p className="text-[11px] font-bold text-fluent-teal uppercase tracking-widest italic">"Exceptional Delivery"</p>
          </Card>

          <Card className="p-8 bg-white border-black/5 shadow-xl underline-offset-4 decoration-2">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Cohort Distribution</h4>
            <div className="space-y-6">
              {[
                { label: "High Achievers (>80%)", value: 65, color: "bg-fluent-teal" },
                { label: "Core Competency (60-80%)", value: 25, color: "bg-fluent-gold" },
                { label: "Intervention Required (<60%)", value: 10, color: "bg-slate-200" }
              ].map(group => (
                <div key={group.label}>
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase mb-2">
                    <span className="text-slate-400">{group.label}</span>
                    <span className="text-fluent-navy">{group.value}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                    <div className={`${group.color} h-full rounded-full transition-all duration-1000`} style={{ width: `${group.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* DETAILED DRILLDOWN */}
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="p-10 bg-white border-black/5 shadow-xl">
           <div className="flex items-center gap-4 mb-10">
              <div className="p-4 bg-orange-50 text-orange-500 rounded-[24px]"><Target size={24} /></div>
              <div>
                 <h4 className="font-serif font-bold text-xl text-fluent-navy">Engagement Depth</h4>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Participation Synthesis</p>
              </div>
           </div>
           
           <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.history}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Bar dataKey="confidence" fill="#EAB308" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
           </div>
        </Card>

        <Card className="p-10 bg-slate-50 border-black/5 border-dashed relative overflow-hidden flex flex-col justify-center">
           <div className="relative z-10">
              <h4 className="text-3xl font-serif font-bold text-fluent-navy mb-4">Proprietary Growth Formula</h4>
              <p className="text-sm text-slate-500 leading-relaxed max-w-sm mb-4 italic">
                The Faculty Quality Index is derived from student academic progression matched against non-tangible confidence development and parent sentiment.
              </p>
              <div className="p-4 bg-white rounded-xl border border-black/5 mb-8">
                 <div className="text-[10px] font-black uppercase text-fluent-teal mb-2">Automated Synthesis Insight</div>
                 <p className="text-xs font-bold text-fluent-navy">{getTeacherInsights(data.history)}</p>
              </div>
              <div className="flex flex-wrap gap-4">
                 <Badge color="gold">Weighted Participation</Badge>
                 <Badge color="teal">Attendance Pivot</Badge>
                 <Badge color="red">Intervention Triggers</Badge>
              </div>
           </div>
           <Award className="absolute -right-4 -bottom-4 text-fluent-navy opacity-5 w-48 h-48" />
        </Card>
      </div>
    </div>
  );
}
