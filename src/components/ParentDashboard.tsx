import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { Home, FileText, Bell, Calendar, LogOut } from "lucide-react";
import { DashboardShell } from "./DashboardShell";
import { Avatar, Btn } from "./UI";

const C = { blue:"#3B82F6", purple:"#8B5CF6", green:"#22C55E", amber:"#F59E0B", red:"#EF4444", gray:"#6B7280", blueBg:"#EFF6FF", purpleBg:"#F5F3FF", greenBg:"#F0FDF4", amberBg:"#FFFBEB", redBg:"#FEF2F2" };

interface ChildReport {
  week: string; marks: number; confidence: number; participation: number;
  strengths: string; weaknesses: string; teacherComment: string; actionPlan: string;
  attendance: string; date: string;
}
interface ChildRecord {
  id: string; name: string; grade: string; school: string; subject: string;
  currentScore: number; currentConfidence: number; currentParticipation: number;
  attendance: number; trend: "up"|"down"|"stable"; teacher: string;
  reports: ChildReport[];
}
interface AlertItem {
  id: string; type: "marks"|"confidence"|"attendance"; message: string; date: string; read: boolean;
}
interface Booking {
  id: string; teacherName: string; subject: string; date: string; time: string; status: "confirmed"|"pending"|"completed";
}

const PARENT = { name: "Mrs. Priya Kapoor" };
const CHILDREN: ChildRecord[] = [                
  {
    id:"c1", name:"Aryan Kapoor", grade:"10", school:"St. Mary's Academy", subject:"Mathematics",
    currentScore:88, currentConfidence:82, currentParticipation:75,
    attendance:90, trend:"up", teacher:"Ms. Ananya Mehta",
    reports:[
      { week:"Week 5", marks:88, confidence:82, participation:75, strengths:"Excellent quadratic equation solving", weaknesses:"Word problems need work", teacherComment:"Aryan has shown tremendous improvement this week.", actionPlan:"Practice 5 word problems daily", attendance:"Present", date:"2026-05-07" },
      { week:"Week 4", marks:82, confidence:78, participation:70, strengths:"Strong algebra fundamentals", weaknesses:"Geometry concepts", teacherComment:"Good consistent effort.", actionPlan:"Revise chapter 4 geometry", attendance:"Present", date:"2026-04-30" },
      { week:"Week 3", marks:79, confidence:74, participation:68, strengths:"Attendance consistent", weaknesses:"Speed in solving", teacherComment:"Steady progress.", actionPlan:"Timed practice sessions", attendance:"Present", date:"2026-04-23" },
      { week:"Week 2", marks:75, confidence:70, participation:65, strengths:"Conceptual clarity", weaknesses:"Calculation errors", teacherComment:"Needs more practice.", actionPlan:"Error analysis daily", attendance:"Present", date:"2026-04-16" },
      { week:"Week 1", marks:71, confidence:65, participation:60, strengths:"Class participation", weaknesses:"Test anxiety", teacherComment:"Good start to term.", actionPlan:"Mock tests weekly", attendance:"Present", date:"2026-04-09" },
    ],
  },
];

const ALERTS: AlertItem[] = [
  { id:"al1", type:"marks",      message:"Aryan scored 88% this week — up from 82% last week! 🎉", date:"2026-05-07", read:false },
  { id:"al2", type:"confidence", message:"Confidence score improved to 82% from 78%",              date:"2026-05-07", read:false },
  { id:"al3", type:"attendance", message:"Aryan has maintained 90% attendance this term",          date:"2026-05-05", read:true },
];

const BOOKINGS: Booking[] = [
  { id:"b1", teacherName:"Ms. Ananya Mehta", subject:"Mathematics", date:"2026-05-12", time:"4:00 PM", status:"confirmed" },
  { id:"b2", teacherName:"Ms. Ananya Mehta", subject:"Mathematics", date:"2026-04-28", time:"4:30 PM", status:"completed" },
];

function ScorePill({ value, color }:{ value:number; color:string }) {
  return <span style={{ fontSize:18, fontWeight:800, color }}>{value}%</span>;
}
function GaugeCard({ label, value, color, bg, icon }:{ label:string; value:number; color:string; bg:string; icon:string }) {
  return (
    <div style={{ background:"#fff", borderRadius:12, padding:"20px", border:"1px solid #E5E7EB", textAlign:"center" }}>
      <div style={{ width:56, height:56, borderRadius:"50%", background:bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, margin:"0 auto 12px" }}>{icon}</div>
      <div style={{ fontSize:28, fontWeight:800, color, marginBottom:4 }}>{value}%</div>
      <div style={{ fontSize:12, color:C.gray }}>{label}</div>
    </div>
  );
}

type Tab = "overview"|"reports"|"alerts"|"bookings";

export function ParentDashboard({ profile, onBack }:{ profile: any, onBack: () => void }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [child, setChild] = useState(CHILDREN[0]);
  const [unread] = useState(ALERTS.filter(a=>!a.read).length);

  const navItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "reports", label: "Weekly Reports", icon: FileText },
    { id: "alerts", label: "Alerts", icon: Bell, badge: unread > 0 ? unread : null },
    { id: "bookings", label: "Consultations", icon: Calendar },
  ];

  return (
    <DashboardShell role="parent" title={profile?.name || PARENT.name} navItems={navItems} activeNav={tab} setActiveNav={(v) => setTab(v as Tab)} onBack={onBack}>
      <div style={{ maxWidth:1280, margin:"0 auto", padding:"28px 32px" }}>
        
        {/* OVERVIEW */}
        {tab==="overview" && (
            <>
              <div style={{ marginBottom:32 }}>
                <h1 style={{ fontSize:28, fontWeight:700, color:"#111827", margin:"0 0 8px" }}>Welcome back, {profile?.name?.split(" ")[1] || PARENT.name.split(" ")[1]} 👋</h1>
                <p style={{ color:C.gray, fontSize:15 }}>Here is a summary of {child.name}'s performance and upcoming activities.</p>
              </div>

              {/* Child card */}
              <div style={{ background:"linear-gradient(135deg,#EEF2FF,#F5F3FF)", borderRadius:20, padding:32, border:"1px solid #C7D2FE", marginBottom:32, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:24 }}>
                <div style={{ display:"flex", alignItems:"center", gap:24 }}>
                  <Avatar name={child.name} size={64} />
                  <div>
                    <h2 style={{ fontSize:24, fontWeight:700, color:"#111827", margin:"0 0 6px" }}>{child.name}</h2>
                    <p style={{ fontSize:15, color:C.blue, margin:0, fontWeight:500 }}>{child.subject} · Grade {child.grade}</p>
                    <p style={{ fontSize:14, color:C.gray, margin:"4px 0 0" }}>{child.school}</p>
                  </div>
                </div>
                <div style={{ display:"flex", gap:32, borderLeft:"1px solid #E0E7FF", paddingLeft:32 }}>
                  <div style={{ textAlign:"center" }}>
                    <ScorePill value={child.currentScore} color={child.currentScore>=80?C.green:child.currentScore>=60?C.amber:C.red} />
                    <div style={{ fontSize:12, color:C.gray, marginTop:6 }}>Current Score</div>
                  </div>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:20, fontWeight:800, color:child.trend==="up"?C.green:child.trend==="down"?C.red:C.gray }}>
                      {child.trend==="up"?"↑ Improving":child.trend==="down"?"↓ Declining":"→ Steady"}
                    </div>
                    <div style={{ fontSize:12, color:C.gray, marginTop:6 }}>5-Week Trend</div>
                  </div>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:20, fontWeight:800, color:C.blue }}>{child.attendance}%</div>
                    <div style={{ fontSize:12, color:C.gray, marginTop:6 }}>Attendance</div>
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:24 }}>
                <GaugeCard label="Confidence Score" value={child.currentConfidence} color={C.purple} bg={C.purpleBg} icon="🧠" />
                <GaugeCard label="Participation" value={child.currentParticipation} color={C.blue} bg={C.blueBg} icon="🤝" />
                <GaugeCard label="Attendance" value={child.attendance} color={C.green} bg={C.greenBg} icon="📅" />
              </div>

              {/* Recent Reports Preview */}
              <div style={{ marginTop:32 }}>
                <h3 style={{ fontSize:18, fontWeight:700, marginBottom:16 }}>Recent Weekly Reports</h3>
                {child.reports.slice(0, 2).map((r, i) => (
                    <div key={i} style={{ background:"#fff", padding:20, borderRadius:16, border:"1px solid #E5E7EB", marginBottom:12 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                            <span style={{ fontWeight:600 }}>{r.week} - {r.date}</span>
                            <ScorePill value={r.marks} color={r.marks>=80?C.green:C.red} />
                        </div>
                        <p style={{ fontSize:14, color:C.gray }}>{r.teacherComment}</p>
                    </div>
                ))}
              </div>
            </>
        )}
      </div>
    </DashboardShell>
  );
}
