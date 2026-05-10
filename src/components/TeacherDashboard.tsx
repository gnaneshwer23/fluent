/**
 * TeacherDashboard.tsx — Fluent Institute
 * src/components/TeacherDashboard.tsx
 * Deps: recharts (already in package.json)
 * Replace "// TODO: firebase" comments with your service calls
 */
import { useState } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Student {
  id: string; name: string; grade: string;
  attended: number; total: number;
  lastScore?: number; lastConfidence?: number; lastParticipation?: number;
  trend?: "up"|"down"|"stable"; alert?: boolean; alertReason?: string;
}
interface ClassItem {
  id: string; name: string; subject: string;
  avgScore: number; attendance: number; studentCount: number;
}
interface WeeklyReportDraft {
  studentId: string; studentName: string;
  marks: number; confidenceScore: number; participationScore: number;
  strengths: string; weaknesses: string; teacherComment: string; actionPlan: string;
  attendanceStatus: "Present"|"Absent";
}
interface AlertItem {
  id: string; studentId: string; studentName: string;
  type: "marks"|"confidence"|"attendance"|"participation";
  message: string; date: string; status: "active"|"resolved";
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  blue:"#2563EB", purple:"#7C3AED", green:"#059669",
  amber:"#D97706", red:"#DC2626", gray:"#4B5563",
  blueBg:"#EFF6FF", purpleBg:"#F5F3FF", greenBg:"#F0FDF4",
  amberBg:"#FFFBEB", redBg:"#FEF2F2",
};

// ─── Seed data — replace with Firestore ──────────────────────────────────────
const TEACHER = { 
  name:"Ms. Ananya Mehta", 
  subject:"Mathematics", 
  school:"St. Mary's Academy",
  bio: "Expert in Mathematical Synthesis and British Scaffolding techniques. Focused on building architectural confidence through numerical mastery."
};
const CLASSES: ClassItem[] = [
  { id:"c1", name:"Class 10-A", subject:"Mathematics", avgScore:78, attendance:92, studentCount:32 },
  { id:"c2", name:"Class 9-B",  subject:"Mathematics", avgScore:71, attendance:88, studentCount:28 },
  { id:"c3", name:"Class 11-C", subject:"Mathematics", avgScore:83, attendance:95, studentCount:24 },
];
const STUDENTS: Student[] = [
  { id:"s1", name:"Aryan Kapoor",  attended:18, total:20, grade:"10", lastScore:88, lastConfidence:82, lastParticipation:75, trend:"up" },
  { id:"s2", name:"Sneha Rao",     attended:14, total:20, grade:"10", lastScore:54, lastConfidence:45, lastParticipation:50, trend:"down", alert:true, alertReason:"Score dropped 18%" },
  { id:"s3", name:"Dev Patel",     attended:17, total:20, grade:"10", lastScore:74, lastConfidence:68, lastParticipation:72, trend:"stable" },
  { id:"s4", name:"Riya Singh",    attended:20, total:20, grade:"10", lastScore:91, lastConfidence:88, lastParticipation:90, trend:"up" },
  { id:"s5", name:"Karan Mehta",   attended:12, total:20, grade:"10", lastScore:61, lastConfidence:55, lastParticipation:48, trend:"down", alert:true, alertReason:"Attendance below 70%" },
  { id:"s6", name:"Priya Sharma",  attended:19, total:20, grade:"10", lastScore:79, lastConfidence:76, lastParticipation:80, trend:"stable" },
];
const TRENDS = [
  { week:"Wk 1", avg:72, top:91, bottom:48 },
  { week:"Wk 2", avg:74, top:92, bottom:50 },
  { week:"Wk 3", avg:71, top:89, bottom:45 },
  { week:"Wk 4", avg:76, top:93, bottom:52 },
  { week:"Wk 5", avg:78, top:91, bottom:54 },
];
const ALERTS_SEED: AlertItem[] = [
  { id:"a1", studentId:"s2", studentName:"Sneha Rao",   type:"marks",      message:"Score dropped 72%→54%", date:"2026-05-07", status:"active" },
  { id:"a2", studentId:"s5", studentName:"Karan Mehta", type:"attendance", message:"Attendance at 60%",      date:"2026-05-07", status:"active" },
  { id:"a3", studentId:"s2", studentName:"Sneha Rao",   type:"confidence", message:"Confidence at 45%",     date:"2026-05-06", status:"active" },
];

// ─── Shared atoms ─────────────────────────────────────────────────────────────
function Avatar({ name, size=36 }: { name:string; size?:number }) {
  const ini = name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase();
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background: "linear-gradient(135deg,#3B82F6,#8B5CF6)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:600, fontSize:size*0.33, flexShrink:0 }}>
      {ini}
    </div>
  );
}
function StatCard({ label, value, sub, color, bg, icon }:{ label:string; value:string|number; sub?:string; color:string; bg:string; icon:string }) {
  return (
    <div style={{ background:"#fff", borderRadius:12, padding:"18px 20px", border:"1px solid #E5E7EB", display:"flex", alignItems:"flex-start", gap:14 }}>
      <div style={{ width:44, height:44, borderRadius:10, background:bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{icon}</div>
      <div>
        <div style={{ fontSize:13, color:C.gray, marginBottom:2 }}>{label}</div>
        <div style={{ fontSize:24, fontWeight:700, color, lineHeight:1.1 }}>{value}</div>
        {sub && <div style={{ fontSize:12, color:"#4B5563", marginTop:2 }}>{sub}</div>}
      </div>
    </div>
  );
}
function ScoreBar({ value, color }:{ value:number; color:string }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, flex:1 }}>
      <div style={{ flex:1, background:"#F3F4F6", borderRadius:100, height:6 }}>
        <div style={{ width:`${value}%`, height:"100%", borderRadius:100, background:color }} />
      </div>
      <span style={{ fontSize:12, fontWeight:600, color:"#374151", width:30, textAlign:"right" }}>{value}%</span>
    </div>
  );
}
function TrendBadge({ trend }:{ trend:"up"|"down"|"stable" }) {
  const m = { up:{l:"↑ Rising",c:C.green,b:C.greenBg}, down:{l:"↓ Falling",c:C.red,b:C.redBg}, stable:{l:"→ Stable",c:C.gray,b:"#F3F4F6"} };
  const t = m[trend];
  return <span style={{ fontSize:11, fontWeight:600, color:t.c, background:t.b, padding:"2px 8px", borderRadius:100, whiteSpace:"nowrap" }}>{t.l}</span>;
}

// ─── Report modal ─────────────────────────────────────────────────────────────
function ReportModal({ student, onClose, onSubmit }:{ student:Student|null; onClose:()=>void; onSubmit:(d:WeeklyReportDraft)=>void }) {
  const [d, setD] = useState({ marks:student?.lastScore??70, confidenceScore:student?.lastConfidence??70, participationScore:student?.lastParticipation??70, attendanceStatus:"Present" as "Present"|"Absent", strengths:"", weaknesses:"", teacherComment:"", actionPlan:"" });
  if (!student) return null;
  const set = (k:string, v:unknown) => setD(p=>({...p,[k]:v}));
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={onClose}>
      <div style={{ background:"#fff", borderRadius:20, padding:32, width:"100%", maxWidth:520, maxHeight:"90vh", overflowY:"auto" }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <Avatar name={student.name} size={40} />
            <div>
              <div style={{ fontWeight:700, color:"#111827" }}>{student.name}</div>
              <div style={{ fontSize:12, color:C.gray }}>Weekly Report — {new Date().toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:"#F3F4F6", border:"none", borderRadius:"50%", width:32, height:32, cursor:"pointer", fontSize:18 }}>×</button>
        </div>

        {/* Score sliders */}
        {([["marks","Score",C.blue],["confidenceScore","Confidence",C.purple],["participationScore","Participation",C.green]] as [string,string,string][]).map(([k,l,col])=>(
          <div key={k} style={{ marginBottom:18 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <label style={{ fontSize:13, fontWeight:600, color:"#374151" }}>{l}</label>
              <span style={{ fontSize:14, fontWeight:700, color:col }}>{(d as Record<string,unknown>)[k]}%</span>
            </div>
            <input type="range" min={0} max={100} value={(d as Record<string,unknown>)[k] as number} onChange={e=>set(k,Number(e.target.value))} style={{ width:"100%", accentColor:col }} />
          </div>
        ))}

        {/* Attendance */}
        <div style={{ marginBottom:18 }}>
          <label style={{ fontSize:13, fontWeight:600, color:"#374151", display:"block", marginBottom:6 }}>Attendance</label>
          <div style={{ display:"flex", gap:8 }}>
            {(["Present","Absent"] as const).map(s=>(
              <button key={s} onClick={()=>set("attendanceStatus",s)} style={{ flex:1, padding:"8px", borderRadius:8, border:"1.5px solid", borderColor:d.attendanceStatus===s?(s==="Present"?C.green:C.red):"#E5E7EB", background:d.attendanceStatus===s?(s==="Present"?C.greenBg:C.redBg):"#fff", color:d.attendanceStatus===s?(s==="Present"?C.green:C.red):C.gray, fontWeight:600, fontSize:13, cursor:"pointer" }}>{s}</button>
            ))}
          </div>
        </div>

        {/* Text fields */}
        {([["strengths","Strengths","e.g. Strong grasp of quadratic equations..."],["weaknesses","Areas needing work","e.g. Struggles with word problems..."],["teacherComment","Teacher comment","Overall assessment this week..."],["actionPlan","Action plan","e.g. Practice 10 problems daily..."]] as [string,string,string][]).map(([k,l,ph])=>(
          <div key={k} style={{ marginBottom:14 }}>
            <label style={{ fontSize:13, fontWeight:600, color:"#374151", display:"block", marginBottom:5 }}>{l}</label>
            <textarea value={(d as Record<string,unknown>)[k] as string} onChange={e=>set(k,e.target.value)} placeholder={ph} rows={2} style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:"1.5px solid #E5E7EB", fontSize:13, resize:"vertical", fontFamily:"inherit", outline:"none", boxSizing:"border-box" }} />
          </div>
        ))}

        <button onClick={()=>onSubmit({...d, studentId:student.id, studentName:student.name})} style={{ width:"100%", padding:14, background:"linear-gradient(135deg,#3B82F6,#8B5CF6)", color:"#fff", border:"none", borderRadius:10, fontWeight:700, fontSize:15, cursor:"pointer" }}>
          Submit Report ✓
        </button>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
type Tab = "overview"|"students"|"reports"|"alerts"|"assignments"|"live";

export function TeacherDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [cls, setCls] = useState(CLASSES[0]);
  const [reportFor, setReportFor] = useState<Student|null>(null);
  const [submitted, setSubmitted] = useState<string[]>([]);
  const [alertMap, setAlertMap] = useState<Record<string,"active"|"resolved">>({});
  const [liveOn, setLiveOn] = useState(false);
  const [liveTopic, setLiveTopic] = useState("");

  const alerts = ALERTS_SEED.map(a=>({...a, status:alertMap[a.id]??a.status}));
  const activeCount = alerts.filter(a=>a.status==="active").length;

  const submitReport = (d:WeeklyReportDraft) => {
    // TODO: firebase → addDoc(collection(db,"weeklyReports"), {...d, teacherId:currentUser.uid, week:currentWeek(), date:serverTimestamp()})
    setSubmitted(p=>[...p, d.studentId]);
    setReportFor(null);
  };
  const resolveAlert = (id:string) => {
    // TODO: firebase → updateDoc(doc(db,"alerts",id), { status:"resolved" })
    setAlertMap(p=>({...p,[id]:"resolved"}));
  };

  const TABS = [
    { k:"overview" as Tab, label:"Overview" },
    { k:"students" as Tab, label:"Students", badge:STUDENTS.filter(s=>s.alert).length },
    { k:"reports" as Tab, label:"Submit Reports", badge:STUDENTS.length-submitted.length },
    { k:"alerts" as Tab, label:"Alerts", badge:activeCount },
    { k:"assignments" as Tab, label:"Assignments" },
    { k:"live" as Tab, label:"Live Session" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#F8FAFC", fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>

      {/* Top bar */}
      <div style={{ background:"#fff", borderBottom:"1px solid #E5E7EB", padding:"0 32px" }}>
        <div style={{ maxWidth:1280, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", height:64 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontFamily: "serif", fontWeight: 900, fontSize: 18, color: "#0D1B2A", letterSpacing: "-0.05em" }}>FLUENT&nbsp;&nbsp;&nbsp;INSTITUTE.</span>
            <span style={{ background:"#F1F5F9", color:"#1B4F5E", fontSize:10, fontWeight:900, padding:"3px 10px", borderRadius:100, textTransform: "uppercase" }}>Faculty Node</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            {activeCount>0 && (
              <div style={{ position:"relative" }}>
                <button onClick={()=>setTab("alerts")} style={{ background:"none", border:"none", cursor:"pointer", fontSize:20 }}>🔔</button>
                <span style={{ position:"absolute", top:-2, right:-2, width:16, height:16, background:C.red, borderRadius:"50%", fontSize:9, fontWeight:700, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}>{activeCount}</span>
              </div>
            )}
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <Avatar name={TEACHER.name} size={34} />
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:"#111827" }}>{TEACHER.name}</div>
                <div style={{ fontSize:11, color:C.gray }}>{TEACHER.subject} · {TEACHER.school}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab nav */}
        <div style={{ maxWidth:1280, margin:"0 auto", display:"flex", gap:4 }}>
          {TABS.map(t=>(
            <button key={t.k} onClick={()=>setTab(t.k)} style={{ padding:"10px 16px", border:"none", background:"none", cursor:"pointer", fontSize:13, fontWeight:tab===t.k?700:500, color:tab===t.k?C.blue:C.gray, borderBottom:tab===t.k?`2px solid ${C.blue}`:"2px solid transparent", display:"flex", alignItems:"center", gap:6 }}>
              {t.label}
              {t.badge!=null && t.badge>0 && <span style={{ background:t.k==="alerts"?C.red:C.blue, color:"#fff", fontSize:10, fontWeight:700, padding:"1px 6px", borderRadius:100 }}>{t.badge}</span>}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:1280, margin:"0 auto", padding:"28px 32px" }}>

        {/* OVERVIEW */}
        {tab==="overview" && (
          <>
            <div style={{ marginBottom:24 }}>
              <h1 className="text-2xl font-serif font-black tracking-tight text-fluent-midnight mb-1">Good morning, {TEACHER.name.split(" ")[1]} ✦</h1>
              <p className="text-stone-700 font-bold text-sm">{activeCount} active alert{activeCount!==1?"s":""} · {STUDENTS.length-submitted.length} reports pending this week</p>
            </div>

            {/* Class selector */}
            <div style={{ display:"flex", gap:10, marginBottom:24 }}>
              {CLASSES.map(c=>(
                <button key={c.id} onClick={()=>setCls(c)} style={{ padding:"8px 16px", borderRadius:8, border:"1.5px solid", borderColor:cls.id===c.id?C.blue:"#E5E7EB", background:cls.id===c.id?C.blueBg:"#fff", color:cls.id===c.id?C.blue:"#374151", fontWeight:600, fontSize:13, cursor:"pointer" }}>{c.name}</button>
              ))}
            </div>

            {/* Stats */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:28 }}>
              <StatCard label="Class Average"  value={`${cls.avgScore}%`}       sub="This week"               color={C.blue}  bg={C.blueBg}  icon="📊" />
              <StatCard label="Attendance"     value={`${cls.attendance}%`}     sub={`${cls.studentCount} students`} color={C.green} bg={C.greenBg} icon="✅" />
              <StatCard label="Active Alerts"  value={activeCount}              sub="Need attention"          color={activeCount>0?C.red:C.green} bg={activeCount>0?C.redBg:C.greenBg} icon="🔔" />
              <StatCard label="Reports Due"    value={STUDENTS.length-submitted.length} sub={`of ${STUDENTS.length}`} color={C.amber} bg={C.amberBg} icon="📋" />
            </div>

            {/* Charts */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:24 }}>
              <div style={{ background:"#fff", borderRadius:14, padding:20, border:"1px solid #E5E7EB" }}>
                <h3 style={{ fontSize:15, fontWeight:700, color:"#111827", marginBottom:16 }}>Score Trend — {cls.name}</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={TRENDS}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="week" tick={{fontSize:11}} />
                    <YAxis tick={{fontSize:11}} domain={[40,100]} />
                    <Tooltip contentStyle={{borderRadius:8,fontSize:12}} />
                    <Line type="monotone" dataKey="avg"    stroke={C.blue}  strokeWidth={2}   dot={{r:3}} name="Class Avg" />
                    <Line type="monotone" dataKey="top"    stroke={C.green} strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="Top" />
                    <Line type="monotone" dataKey="bottom" stroke={C.red}   strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="Bottom" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div style={{ background:"#fff", borderRadius:14, padding:20, border:"1px solid #E5E7EB" }}>
                <h3 style={{ fontSize:15, fontWeight:700, color:"#111827", marginBottom:16 }}>Student Scores This Week</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={STUDENTS.map(s=>({name:s.name.split(" ")[0],score:s.lastScore??0,alert:s.alert}))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="name" tick={{fontSize:11}} />
                    <YAxis tick={{fontSize:11}} domain={[0,100]} />
                    <Tooltip contentStyle={{borderRadius:8,fontSize:12}} />
                    <Bar dataKey="score" radius={[4,4,0,0]}>
                      {STUDENTS.map((s,i)=><Cell key={i} fill={s.alert?C.red:s.lastScore!>=80?C.green:C.blue} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Alert banner */}
            {activeCount>0 && (
              <div style={{ background:C.redBg, border:"1px solid #FECACA", borderRadius:12, padding:"14px 20px" }}>
                <div style={{ fontWeight:700, color:"#991B1B", fontSize:14, marginBottom:10 }}>⚠️ {activeCount} student{activeCount>1?"s":""} need attention</div>
                {alerts.filter(a=>a.status==="active").map(a=>(
                  <div key={a.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:"#fff", borderRadius:8, padding:"10px 14px", marginTop:8 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <Avatar name={a.studentName} size={28} />
                      <span style={{ fontSize:13, fontWeight:600, color:"#374151" }}>{a.studentName}</span>
                      <span style={{ fontSize:12, color:C.red }}>{a.message}</span>
                    </div>
                    <div style={{ display:"flex", gap:8 }}>
                      <button onClick={()=>setReportFor(STUDENTS.find(s=>s.id===a.studentId)||null)} style={{ padding:"5px 12px", background:C.blueBg, color:C.blue, border:"none", borderRadius:6, fontSize:12, fontWeight:600, cursor:"pointer" }}>Report</button>
                      <button onClick={()=>resolveAlert(a.id)} style={{ padding:"5px 12px", background:C.greenBg, color:C.green, border:"none", borderRadius:6, fontSize:12, fontWeight:600, cursor:"pointer" }}>Resolve</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* STUDENTS */}
        {tab==="students" && (
          <>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <h2 style={{ fontSize:20, fontWeight:700, color:"#111827" }}>Students — {cls.name}</h2>
              <div style={{ display:"flex", gap:8 }}>
                {CLASSES.map(c=><button key={c.id} onClick={()=>setCls(c)} style={{ padding:"6px 14px", borderRadius:8, border:"1.5px solid", borderColor:cls.id===c.id?C.blue:"#E5E7EB", background:cls.id===c.id?C.blueBg:"#fff", color:cls.id===c.id?C.blue:"#374151", fontWeight:600, fontSize:12, cursor:"pointer" }}>{c.name}</button>)}
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {STUDENTS.map(s=>(
                <div key={s.id} style={{ background:"#fff", borderRadius:12, padding:"16px 20px", border:s.alert?"1px solid #FECACA":"1px solid #E5E7EB", borderLeft:s.alert?`4px solid ${C.red}`:"4px solid transparent", display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 0.8fr auto", gap:16, alignItems:"center" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <Avatar name={s.name} size={36} />
                    <div>
                      <div style={{ fontWeight:600, color:"#111827", fontSize:14 }}>{s.name}</div>
                      <div style={{ fontSize:11, color:C.gray }}>Attended {s.attended}/{s.total}</div>
                    </div>
                    {s.alert && <span style={{ fontSize:10, fontWeight:700, color:C.red, background:C.redBg, padding:"2px 6px", borderRadius:4 }}>ALERT</span>}
                  </div>
                  <div><div style={{ fontSize:11, color:C.gray, marginBottom:4 }}>Score</div><ScoreBar value={s.lastScore??0} color={s.lastScore!<60?C.red:s.lastScore!<75?C.amber:C.green} /></div>
                  <div><div style={{ fontSize:11, color:C.gray, marginBottom:4 }}>Confidence</div><ScoreBar value={s.lastConfidence??0} color={C.purple} /></div>
                  <div><div style={{ fontSize:11, color:C.gray, marginBottom:4 }}>Participation</div><ScoreBar value={s.lastParticipation??0} color={C.blue} /></div>
                  <TrendBadge trend={s.trend??"stable"} />
                  <button onClick={()=>setReportFor(s)} style={{ padding:"8px 16px", background:submitted.includes(s.id)?C.greenBg:"linear-gradient(135deg,#3B82F6,#8B5CF6)", color:submitted.includes(s.id)?C.green:"#fff", border:submitted.includes(s.id)?`1px solid ${C.green}`:"none", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap" }}>
                    {submitted.includes(s.id)?"✓ Done":"+ Report"}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* REPORTS */}
        {tab==="reports" && (
          <>
            <div style={{ marginBottom:20 }}>
              <h2 style={{ fontSize:20, fontWeight:700, color:"#111827", marginBottom:4 }}>Weekly Report Submission</h2>
              <p style={{ color:C.gray, fontSize:14 }}>Submit marks, confidence, and feedback. Reports auto-generate parent PDFs.</p>
            </div>
            <div style={{ background:"#fff", borderRadius:14, border:"1px solid #E5E7EB", overflow:"hidden" }}>
              <div style={{ padding:"14px 20px", background:"#F9FAFB", borderBottom:"1px solid #E5E7EB", display:"grid", gridTemplateColumns:"2fr 1fr 1fr 0.8fr auto", gap:16 }}>
                {["Student","Last Score","Attendance","Status",""].map((h,i)=><span key={i} style={{ fontSize:12, fontWeight:600, color:C.gray, textTransform:"uppercase", letterSpacing:0.5 }}>{h}</span>)}
              </div>
              {STUDENTS.map(s=>(
                <div key={s.id} style={{ padding:"14px 20px", borderBottom:"1px solid #F3F4F6", display:"grid", gridTemplateColumns:"2fr 1fr 1fr 0.8fr auto", gap:16, alignItems:"center" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}><Avatar name={s.name} size={32} /><span style={{ fontWeight:600, fontSize:14, color:"#111827" }}>{s.name}</span></div>
                  <span style={{ fontSize:14, fontWeight:600, color:s.lastScore!<60?C.red:"#374151" }}>{s.lastScore}%</span>
                  <span style={{ fontSize:14, color:"#374151" }}>{Math.round((s.attended/s.total)*100)}%</span>
                  <span style={{ fontSize:11, fontWeight:600, padding:"3px 8px", borderRadius:100, background:submitted.includes(s.id)?C.greenBg:"#FFF7ED", color:submitted.includes(s.id)?C.green:C.amber }}>{submitted.includes(s.id)?"✓ Done":"Pending"}</span>
                  <button onClick={()=>setReportFor(s)} style={{ padding:"7px 16px", background:submitted.includes(s.id)?"#F3F4F6":"linear-gradient(135deg,#3B82F6,#8B5CF6)", color:submitted.includes(s.id)?C.gray:"#fff", border:"none", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer" }}>{submitted.includes(s.id)?"Edit":"Submit"}</button>
                </div>
              ))}
            </div>
            {submitted.length===STUDENTS.length && (
              <div style={{ background:C.greenBg, border:"1px solid #BBF7D0", borderRadius:12, padding:"16px 20px", marginTop:20, display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ fontSize:24 }}>🎉</span>
                <div><div style={{ fontWeight:700, color:"#166534" }}>All reports submitted!</div><div style={{ fontSize:13, color:"#15803D" }}>Parent PDFs generating and emailing automatically.</div></div>
              </div>
            )}
          </>
        )}

        {/* ALERTS */}
        {tab==="alerts" && (
          <>
            <div style={{ marginBottom:20 }}>
              <h2 style={{ fontSize:20, fontWeight:700, color:"#111827", marginBottom:4 }}>Student Alerts</h2>
              <p style={{ color:C.gray, fontSize:14 }}>Auto-generated when scores, confidence, or attendance drop below threshold.</p>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {alerts.map(a=>{
                const tmap:Record<string,{icon:string;color:string;bg:string}> = { marks:{icon:"📉",color:C.red,bg:C.redBg}, confidence:{icon:"💭",color:C.amber,bg:C.amberBg}, attendance:{icon:"🗓️",color:C.purple,bg:C.purpleBg}, participation:{icon:"🙋",color:C.blue,bg:C.blueBg} };
                const t = tmap[a.type];
                return (
                  <div key={a.id} style={{ background:"#fff", borderRadius:12, padding:"16px 20px", border:"1px solid #E5E7EB", opacity:a.status==="resolved"?0.6:1, display:"flex", justifyContent:"space-between", alignItems:"center", gap:16 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <div style={{ width:40, height:40, borderRadius:10, background:t.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{t.icon}</div>
                      <div>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                          <span style={{ fontWeight:700, fontSize:14, color:"#111827" }}>{a.studentName}</span>
                          <span style={{ fontSize:11, fontWeight:600, color:t.color, background:t.bg, padding:"1px 7px", borderRadius:100 }}>{a.type}</span>
                        </div>
                        <p style={{ fontSize:13, color:"#374151", margin:0 }}>{a.message}</p>
                        <p style={{ fontSize:11, color:C.gray, margin:"3px 0 0" }}>{a.date}</p>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:8, flexShrink:0 }}>
                      {a.status==="active" ? (
                        <>
                          <button onClick={()=>setReportFor(STUDENTS.find(s=>s.id===a.studentId)||null)} style={{ padding:"7px 14px", background:C.blueBg, color:C.blue, border:"none", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer" }}>Submit Report</button>
                          <button onClick={()=>resolveAlert(a.id)} style={{ padding:"7px 14px", background:C.greenBg, color:C.green, border:"none", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer" }}>Resolve</button>
                        </>
                      ) : <span style={{ fontSize:12, fontWeight:600, color:C.green }}>✓ Resolved</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* LIVE SESSION */}
        {tab==="live" && (
          <>
            <h2 style={{ fontSize:20, fontWeight:700, color:"#111827", marginBottom:4 }}>Live Session</h2>
            <p style={{ color:C.gray, fontSize:14, marginBottom:24 }}>Broadcast concept feeds to students in real time.</p>
            <div style={{ background:"#fff", borderRadius:16, padding:28, border:"1px solid #E5E7EB", maxWidth:560 }}>
              {!liveOn ? (
                <>
                  <div style={{ marginBottom:16 }}>
                    <label style={{ fontSize:13, fontWeight:600, color:"#374151", display:"block", marginBottom:6 }}>Session Topic</label>
                    <input value={liveTopic} onChange={e=>setLiveTopic(e.target.value)} placeholder="e.g. Quadratic Equations Practice" style={{ width:"100%", padding:"10px 14px", borderRadius:8, border:"1.5px solid #E5E7EB", fontSize:14, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }} />
                  </div>
                  <div style={{ marginBottom:20 }}>
                    <label style={{ fontSize:13, fontWeight:600, color:"#374151", display:"block", marginBottom:6 }}>Class</label>
                    <select style={{ width:"100%", padding:"10px 14px", borderRadius:8, border:"1.5px solid #E5E7EB", fontSize:14 }}>
                      {CLASSES.map(c=><option key={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <button onClick={()=>setLiveOn(true)} disabled={!liveTopic.trim()} style={{ padding:"12px 28px", background:liveTopic.trim()?"linear-gradient(135deg,#22C55E,#16A34A)":"#E5E7EB", color:liveTopic.trim()?"#fff":C.gray, border:"none", borderRadius:10, fontWeight:700, fontSize:14, cursor:liveTopic.trim()?"pointer":"not-allowed" }}>
                    🔴 Start Live Session
                  </button>
                </>
              ) : (
                <>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
                    <span style={{ width:10, height:10, borderRadius:"50%", background:C.red, display:"inline-block" }} />
                    <span style={{ fontWeight:700, color:C.red }}>LIVE — {liveTopic}</span>
                  </div>
                  <div style={{ background:"#F9FAFB", borderRadius:10, padding:16, marginBottom:20 }}>
                    <div style={{ fontSize:13, color:C.gray, marginBottom:6 }}>Connected: <strong>24 students</strong></div>
                    <div style={{ fontSize:13, color:C.gray }}>Duration: <strong>14 min</strong></div>
                  </div>
                  <button onClick={()=>setLiveOn(false)} style={{ padding:"10px 24px", background:C.redBg, color:C.red, border:`1px solid #FECACA`, borderRadius:10, fontWeight:700, fontSize:14, cursor:"pointer" }}>⬛ End Session</button>
                </>
              )}
            </div>
          </>
        )}

        {/* ASSIGNMENTS tab — simple, extend as needed */}
        {tab==="assignments" && (
          <>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <h2 style={{ fontSize:20, fontWeight:700, color:"#111827" }}>Assignments</h2>
              <button style={{ padding:"10px 20px", background:"linear-gradient(135deg,#3B82F6,#8B5CF6)", color:"#fff", border:"none", borderRadius:10, fontWeight:600, fontSize:14, cursor:"pointer" }}>+ New Assignment</button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {[
                { id:"as1", title:"Quadratic Equations — Problem Set", batch:"Class 10-A", dueDate:"2026-05-10", status:"pending" as const },
                { id:"as2", title:"Trigonometry Quiz",                  batch:"Class 9-B",  dueDate:"2026-05-12", status:"pending" as const },
                { id:"as3", title:"Calculus Introduction",              batch:"Class 11-C", dueDate:"2026-05-08", status:"completed" as const },
              ].map(a=>(
                <div key={a.id} style={{ background:"#fff", borderRadius:12, padding:"16px 20px", border:"1px solid #E5E7EB", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:40, height:40, borderRadius:10, background:C.blueBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>📄</div>
                    <div>
                      <div style={{ fontWeight:600, fontSize:14, color:"#111827" }}>{a.title}</div>
                      <div style={{ fontSize:12, color:C.gray }}>{a.batch} · Due: {a.dueDate}</div>
                    </div>
                  </div>
                  <span style={{ fontSize:12, fontWeight:600, padding:"4px 10px", borderRadius:100, background:a.status==="completed"?C.greenBg:"#FFF7ED", color:a.status==="completed"?C.green:C.amber }}>
                    {a.status==="completed"?"✓ Completed":"Pending"}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

      </div>

      <ReportModal student={reportFor} onClose={()=>setReportFor(null)} onSubmit={submitReport} />
    </div>
  );
}
