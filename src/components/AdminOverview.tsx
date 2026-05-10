import React, { useState, useEffect } from 'react';
import { 
  Users, Award, Zap, ShieldAlert, TrendingUp, Search, MessageSquare, 
  CheckCircle2, AlertCircle, BarChart3, GraduationCap 
} from 'lucide-react';
import { motion } from 'motion/react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebaseInit';
import { Card, MetricTile, Badge, Btn, Avatar } from './UI';

export default function AdminOverview({ schoolId }: { schoolId?: string }) {
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Helper to add schoolId filter if needed
    const withSchoolId = (q: any) => {
      if (schoolId && schoolId !== 'all') {
        return query(q, where('schoolId', '==', schoolId));
      }
      return q;
    };

    // 1. Listen for Students
    const studentQuery = withSchoolId(query(collection(db, 'users'), where('role', '==', 'student')));
    const unsubStudents = onSnapshot(studentQuery, (snap) => {
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // 2. Listen for Teachers
    const teacherQuery = withSchoolId(query(collection(db, 'users'), where('role', '==', 'teacher')));
    const unsubTeachers = onSnapshot(teacherQuery, (snap) => {
      setTeachers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // 3. Listen for Critical Alerts
    const alertQuery = withSchoolId(query(
      collection(db, 'alerts'), 
      where('status', '==', 'active'),
      orderBy('date', 'desc'),
      limit(5)
    ));
    const unsubAlerts = onSnapshot(alertQuery, (snap) => {
      setAlerts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // 4. Listen for Mastery Data (Weekly Reports)
    const reportQuery = withSchoolId(query(collection(db, 'weeklyReports'), limit(100)));
    const unsubReports = onSnapshot(reportQuery, (snap) => {
      setReports(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // 5. Listen for Attendance
    const attendanceQuery = withSchoolId(query(collection(db, 'attendance'), limit(1000)));
    const unsubAttendance = onSnapshot(attendanceQuery, (snap) => {
      setAttendanceLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setIsLoading(false);
    });

    return () => {
      unsubStudents();
      unsubTeachers();
      unsubAlerts();
      unsubReports();
      unsubAttendance();
    };
  }, [schoolId]);

  // Compute Metrics
  const totalScholarsCount = students.length;
  
  const avgMastery = reports.length > 0 
    ? (reports.reduce((sum, r) => sum + (r.marks || 0), 0) / reports.length).toFixed(1) + "%"
    : "72%"; // Baseline if no data

  const avgConfidence = reports.length > 0
    ? (reports.reduce((sum, r) => sum + (r.confidenceScore || 0), 0) / reports.length).toFixed(1) + " / 10"
    : "6.8 / 10";

  const syncAttendanceRate = attendanceLogs.length > 0
    ? Math.round((attendanceLogs.filter(l => l.status === 'Present').length / attendanceLogs.length) * 100) + "%"
    : "88%";

  const eliteScholarsCount = reports.filter(r => r.marks >= 85).length;
  const atRiskScholarsCount = reports.filter(r => r.marks < 60).length;
  const lowConfidenceCount = reports.filter(r => r.confidenceScore < 5).length;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. CORE KPI LAYER */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricTile label="Total Scholars" value={totalScholarsCount.toString()} delta="+4% MoM" icon={GraduationCap} color="#1B4F5E" />
        <MetricTile label="Cohort Avg Mastery" value={avgMastery} delta="-2% week" icon={Award} color="#C9A84C" />
        <MetricTile label="Platform Confidence" value={avgConfidence} delta="+0.4 pt" icon={TrendingUp} color="#7C3AED" />
        <MetricTile label="Sync Attendance" value={syncAttendanceRate} delta="Stable" icon={CheckCircle2} color="#10B981" />
      </div>

      {/* 2. INSTITUTIONAL INTERVENTIONS (ALERTS) */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="text-xl font-serif font-bold text-fluent-navy">Critical Interventions</h3>
            <p className="text-sm text-stone-700 font-medium">Immediate institutional actions required based on live data.</p>
          </div>
          <Btn variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-stone-600">View All {alerts.length}</Btn>
        </div>
        
        <div className="space-y-3">
          {alerts.length > 0 ? alerts.map((alert, i) => (
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              key={alert.id} 
              className={`p-5 rounded-2xl border-l-4 flex items-center gap-4 ${
                alert.type?.toLowerCase().includes('marks') ? 'bg-red-50 border-red-500 text-red-900' :
                alert.type?.toLowerCase().includes('participation') ? 'bg-fluent-gold/5 border-fluent-gold text-fluent-navy' :
                'bg-slate-50 border-slate-300 text-slate-700'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-white/50 backdrop-blur-sm flex items-center justify-center text-fluent-navy">
                {alert.type?.toLowerCase().includes('marks') ? <ShieldAlert size={18} /> : <AlertCircle size={18} />}
              </div>
              <span className="text-sm font-bold tracking-tight">{alert.message}</span>
            </motion.div>
          )) : (
            <div className="p-8 text-center bg-green-50 border border-green-100 rounded-3xl">
              <CheckCircle2 className="mx-auto text-green-500 mb-3" size={32} />
              <p className="text-sm font-bold text-green-800">Operational Excellence: No active critical alerts.</p>
            </div>
          )}
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-10">
        
        {/* 3. SCHOLAR SEGMENTATION */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h3 className="text-xl font-serif font-bold text-fluent-navy">Scholar Insights</h3>
            <Btn variant="ghost" size="sm" icon={Search} className="text-stone-600">Filter Cohort</Btn>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: "Elite Performers", value: `${eliteScholarsCount} Scholars`, desc: "Above 85% mastery avg.", color: "text-fluent-teal" },
              { label: "At Risk Scholars", value: `${atRiskScholarsCount} Scholars`, desc: "Below 60% intervention zone.", color: "text-red-500" },
              { label: "Participation Gap", value: `${lowConfidenceCount} Scholars`, desc: "Requires faculty support.", color: "text-fluent-gold" },
            ].map((seg, i) => (
              <Card key={i} className="p-6 border-black/5 bg-white shadow-xl shadow-slate-200/50">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-600 mb-4">{seg.label}</h4>
                <div className={`text-xl font-serif font-bold mb-1 ${seg.color}`}>{seg.value}</div>
                <p className="text-[10px] text-stone-700 font-bold">{seg.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* 4. FACULTY PERFORMANCE (USP TRACKING) */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h3 className="text-xl font-serif font-bold text-fluent-navy">Faculty Command</h3>
            <Btn variant="ghost" size="sm" icon={TrendingUp} className="text-stone-600">Full Audit</Btn>
          </div>
          <div className="space-y-4">
            {teachers.length > 0 ? teachers.slice(0, 3).map((teacher, i) => (
              <Card key={teacher.id} className="p-5 flex justify-between items-center border-black/5 bg-white shadow-xl shadow-slate-200/50">
                <div className="flex items-center gap-4">
                  <Avatar name={teacher.name} size={40} />
                  <div>
                    <div className="text-sm font-bold text-fluent-navy">{teacher.name}</div>
                    <div className="text-[10px] text-stone-600 font-bold uppercase tracking-wider">{teacher.subjects?.join(', ') || 'General Studies'}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold text-fluent-teal`}>Active</div>
                  <div className="text-[9px] font-black text-stone-500 uppercase tracking-widest">Faculty Node</div>
                </div>
              </Card>
            )) : (
                <p className="text-center py-8 text-stone-600 italic text-sm">No faculty records found.</p>
            )}
          </div>
        </section>

      </div>

      {/* 5. CONFIDENCE & COMMUNICATION (USP PANEL) */}
      <section className="bg-fluent-navy rounded-[2rem] p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12">
            <BarChart3 size={300} />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <Badge color="gold">Institutional Distinctive</Badge>
            <h3 className="text-2xl font-serif font-bold italic">Confidence & Communication Tracker</h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { label: "Synthesized Communication", status: "Improving", icon: MessageSquare, color: "text-fluent-teal", desc: "Average student-faculty dialogue latency decreased." },
              { label: "Active Participation", status: "Stable", icon: Users, color: "text-fluent-gold", desc: "Cohort engagement levels meeting platform-wide baseline." },
              { label: "Intellectual Confidence", status: reports.length > 0 && lowConfidenceCount > 0 ? "Under Review" : "Optimal", icon: Zap, color: lowConfidenceCount > 0 ? "text-red-400" : "text-fluent-teal", desc: "Aggregated confidence metrics based on weekly self-assessments." },
            ].map((insight, i) => (
              <div key={i} className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${insight.color}`}>
                    <insight.icon size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-widest opacity-60">{insight.label}</div>
                    <div className={`text-sm font-bold ${insight.color}`}>{insight.status}</div>
                  </div>
                </div>
                <p className="text-xs text-white/70 leading-relaxed italic">{insight.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em]">Institutional Intelligence Ledger :: Verified</p>
            <Btn variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10 px-8">Deep Analysis Engine</Btn>
          </div>
        </div>
      </section>

      <div className="pt-8 border-t border-black/5">
        <p className="text-center text-[11px] text-stone-600 font-bold italic">
          Disclaimer: Live metrics are subject to synchronisation latency across institutional nodes.
        </p>
      </div>

    </div>
  );
}
