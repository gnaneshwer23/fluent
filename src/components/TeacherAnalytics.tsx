import React, { useState, useEffect } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, LineChart, Line } from 'recharts';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebaseInit';
import { Card, Btn, Badge, Avatar, ProgressBar, MetricTile } from "./UI";
import { 
  TrendingUp, Users, Target, Zap, Star, ShieldAlert, 
  BarChart3, Award, ArrowUpRight, ArrowDownRight, Activity,
  ChevronRight, ArrowLeft, Search
} from "lucide-react";
import { fetchTeacherAnalytics, AnalyticsData, getTeacherInsights } from "../lib/analytics";

export default function TeacherAnalytics({ teacherId }: { teacherId: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [selectedCohort, setSelectedCohort] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentHistory, setStudentHistory] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchTeacherAnalytics(teacherId);
        setData(result);
        
        // Load cohorts
        const q = query(collection(db, 'cohorts'), where('tutorId', '==', teacherId));
        const snap = await getDocs(q);
        setCohorts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Aggregation failed", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [teacherId]);

  useEffect(() => {
    const loadCohortStudents = async () => {
      if (!selectedCohort) return;
      setLoading(true);
      try {
        const q = collection(db, 'cohorts', selectedCohort.id, 'students');
        const snap = await getDocs(q);
        setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Failed to load students", err);
      } finally {
        setLoading(false);
      }
    };
    loadCohortStudents();
  }, [selectedCohort]);

  useEffect(() => {
    const loadStudentData = async () => {
      if (!selectedStudent) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, 'progress'),
          where('studentId', '==', selectedStudent.id),
          orderBy('createdAt', 'asc'),
          limit(10)
        );
        const snap = await getDocs(q);
        setStudentHistory(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Failed to load student history", err);
      } finally {
        setLoading(false);
      }
    };
    loadStudentData();
  }, [selectedStudent]);

  if (loading && !data) return (
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
          <div className="flex items-center gap-3">
            {(selectedCohort || selectedStudent) && (
              <button 
                onClick={() => {
                  if (selectedStudent) setSelectedStudent(null);
                  else setSelectedCohort(null);
                }}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <ArrowLeft size={20} className="text-fluent-navy" />
              </button>
            )}
            <h2 className="text-4xl font-serif font-bold text-fluent-navy">
              {selectedStudent ? selectedStudent.name : selectedCohort ? selectedCohort.name : "Faculty Performance Synthesis"}
            </h2>
          </div>
          <p className="text-slate-400 mt-2 italic">
            {selectedStudent ? "Individual scholar evolution and mastery trends." : selectedCohort ? "Cohort-wide metrics and student drill-down." : "Comprehensive audit of instructional impact and scholar evolution."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge color={alertStatus.color as any} icon={alertStatus.color === 'red' ? ShieldAlert : Award}>
            {alertStatus.label}
          </Badge>
        </div>
      </div>

      {!selectedCohort && !selectedStudent && (
        <>
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

            <Card className="p-8 bg-fluent-navy text-white shadow-2xl relative overflow-hidden">
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

            {/* NEW: UNIFIED PERFORMANCE TRAJECTORY */}
            <Card className="lg:col-span-3 p-10 bg-white border-black/5 shadow-xl">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-xl font-serif font-bold text-fluent-navy">Unified Performance Trajectory</h3>
                  <p className="text-xs text-slate-400 mt-1 italic font-medium">Historical audit of scholar evolution across three primary quality nodes.</p>
                </div>
                <div className="flex gap-6">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-fluent-teal">
                    <div className="w-2 h-2 rounded-full bg-fluent-teal" /> Avg Marks (%)
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-fluent-gold">
                    <div className="w-2 h-2 rounded-full bg-fluent-gold" /> Confidence Quotient
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-500">
                    <div className="w-2 h-2 rounded-full bg-blue-500" /> Participation Rate
                  </div>
                </div>
              </div>
              
              <div className="h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.history}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                      dy={10}
                    />
                    <YAxis 
                      yId="percent"
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                      domain={[0, 100]}
                    />
                    <YAxis 
                      yId="score"
                      orientation="right"
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                      domain={[0, 10]}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Line 
                      yId="percent"
                      type="monotone" 
                      dataKey="marks" 
                      stroke="#1B4F5E" 
                      strokeWidth={4}
                      dot={{ r: 6, fill: '#1B4F5E', strokeWidth: 0 }}
                      activeDot={{ r: 8, strokeWidth: 0 }}
                      name="Average Marks"
                    />
                    <Line 
                      yId="score"
                      type="monotone" 
                      dataKey="confidence" 
                      stroke="#C9A84C" 
                      strokeWidth={4}
                      dot={{ r: 6, fill: '#C9A84C', strokeWidth: 0 }}
                      activeDot={{ r: 8, strokeWidth: 0 }}
                      name="Confidence Score"
                    />
                    <Line 
                      yId="percent"
                      type="monotone" 
                      dataKey="participation" 
                      stroke="#3B82F6" 
                      strokeWidth={4}
                      dot={{ r: 6, fill: '#3B82F6', strokeWidth: 0 }}
                      activeDot={{ r: 8, strokeWidth: 0 }}
                      name="Participation Rate"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* COHORTS LIST */}
            <Card className="p-8 bg-white border-black/5 shadow-xl">
              <h3 className="text-xl font-serif font-bold text-fluent-navy mb-6">Cohort Distribution</h3>
              <div className="space-y-4">
                {cohorts.map(cohort => (
                  <div 
                    key={cohort.id} 
                    onClick={() => setSelectedCohort(cohort)}
                    className="p-4 border border-black/5 rounded-2xl hover:border-fluent-teal transition-all cursor-pointer group flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-sm text-fluent-navy group-hover:text-fluent-teal">{cohort.name}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{cohort.subject} • {cohort.grade}</div>
                    </div>
                    <div className="text-right">
                       <div className="text-sm font-mono font-bold text-fluent-navy">{cohort.avgScore}%</div>
                       <ChevronRight size={14} className="text-slate-300 ml-auto mt-1" />
                    </div>
                  </div>
                ))}
                {cohorts.length === 0 && (
                  <p className="text-center text-slate-400 italic text-sm py-10">No cohorts detected in system.</p>
                )}
              </div>
            </Card>

            {/* COMPARATIVE ANALYSIS */}
            <Card className="lg:col-span-3 p-10 bg-white border-black/5 shadow-xl">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-xl font-serif font-bold text-fluent-navy">Comparative Mastery & Confidence</h3>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                    <div className="w-3 h-3 rounded-full bg-fluent-teal" /> Average Score (%)
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                    <div className="w-3 h-3 rounded-full bg-fluent-gold" /> Confidence Quotient (0-10)
                  </div>
                </div>
              </div>
              
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.history}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                      dy={10}
                    />
                    <YAxis 
                      yId="left"
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                    />
                    <YAxis 
                      yId="right"
                      orientation="right"
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                      domain={[0, 10]}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar yId="left" dataKey="marks" fill="#1B4F5E" radius={[4, 4, 0, 0]} barSize={40} name="Avg Score (%)" />
                    <Bar yId="right" dataKey="confidence" fill="#C9A84C" radius={[4, 4, 0, 0]} barSize={40} name="Confidence (0-10)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </>
      )}

      {selectedCohort && !selectedStudent && (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
           <div className="grid md:grid-cols-3 gap-6">
              <MetricTile label="Cohort Students" value={students.length.toString()} icon={Users} color="#1B4F5E" />
              <MetricTile label="Cohort Mastery" value={`${selectedCohort.avgScore}%`} icon={BarChart3} color="#C9A84C" />
              <MetricTile label="Attendance" value={`${selectedCohort.attendance}%`} icon={Activity} color="#10B981" />
           </div>

           <Card className="p-8">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-xl font-serif font-bold text-fluent-navy">Scholar Registry Drill-down</h3>
                 <div className="relative">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      placeholder="Search within cohort..." 
                      className="pl-12 pr-4 py-3 bg-gray-50 border rounded-xl text-xs font-bold outline-none w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {students
                  .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(s => (
                    <div 
                      key={s.id} 
                      onClick={() => setSelectedStudent(s)}
                      className="p-5 border border-black/5 rounded-2xl hover:border-fluent-teal transition-all flex items-center justify-between group cursor-pointer"
                    >
                       <div className="flex items-center gap-4">
                          <Avatar name={s.name} size={44} />
                          <div>
                             <div className="font-bold text-sm tracking-tight group-hover:text-fluent-teal transition-colors">{s.name}</div>
                             <div className="text-[10px] text-slate-400 font-bold uppercase">{s.studentId || "VERIFIED"}</div>
                          </div>
                       </div>
                       <ChevronRight size={16} className="text-slate-300 group-hover:text-fluent-teal group-hover:translate-x-1 transition-all" />
                    </div>
                 ))}
                 {students.length === 0 && (
                   <div className="col-span-full py-20 text-center text-slate-400 italic">No students identified in this node.</div>
                 )}
              </div>
           </Card>
        </div>
      )}

      {selectedStudent && (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
           <div className="grid lg:grid-cols-12 gap-8">
              <Card className="lg:col-span-8 p-10">
                 <div className="flex justify-between items-center mb-10">
                    <h3 className="text-xl font-serif font-bold text-fluent-navy">Scholar Mastery Curve</h3>
                    <div className="flex gap-4">
                       <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                         <div className="w-3 h-3 rounded-full bg-fluent-teal" /> Mastery Score
                       </div>
                    </div>
                 </div>

                 <div className="h-80 w-full">
                    {studentHistory.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={studentHistory}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="createdAt" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                            tickFormatter={(val) => val?.toDate ? val.toDate().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : ''}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                            domain={[0, 100]}
                          />
                          <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                            labelFormatter={(val) => val?.toDate ? val.toDate().toLocaleDateString() : ''}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="marks" 
                            stroke="#1B4F5E" 
                            strokeWidth={4}
                            dot={{ r: 6, fill: '#1B4F5E', strokeWidth: 0 }}
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400 italic text-sm">
                         Insufficient data for trajectory mapping. Log more assessments.
                      </div>
                    )}
                 </div>
              </Card>

              <div className="lg:col-span-4 space-y-6">
                 <Card className="p-8 bg-fluent-navy text-white shadow-xl">
                    <div className="text-[10px] font-black uppercase tracking-widest text-fluent-gold mb-6">Individual KPI</div>
                    <div className="space-y-6">
                       <div>
                          <div className="flex justify-between text-xs font-bold uppercase mb-2">
                             <span className="text-white/60">Execution Accuracy</span>
                             <span>{selectedStudent.total > 0 ? Math.round((selectedStudent.attended / selectedStudent.total) * 100) : 0}%</span>
                          </div>
                          <ProgressBar value={selectedStudent.total > 0 ? (selectedStudent.attended / selectedStudent.total) * 100 : 0} color="#C9A84C" showPct={false} />
                       </div>
                    </div>
                 </Card>

                 <Card className="p-8">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Recent Faculty Notes</h3>
                    <div className="space-y-4">
                       {studentHistory.slice(-3).reverse().map((h, i) => (
                         <div key={i} className="p-3 bg-slate-50 rounded-xl border border-black/5">
                            <div className="text-[9px] font-bold text-fluent-teal uppercase mb-1">{h.topic}</div>
                            <p className="text-xs text-slate-600 line-clamp-2">"{h.feedback}"</p>
                         </div>
                       ))}
                       {studentHistory.length === 0 && (
                         <p className="text-center text-xs text-slate-300 italic py-4">No session notes found.</p>
                       )}
                    </div>
                 </Card>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
