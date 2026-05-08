/**
 * ParentDashboard.tsx — Fluent Academy
 * src/pages/dashboards/ParentDashboard.tsx
 */
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";

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

function Avatar({ name, size=36 }:{ name:string; size?:number }) {
  const ini = name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase();
  return <div style={{ width:size, height:size, borderRadius:"50%", background:"linear-gradient(135deg,#3B82F6,#8B5CF6)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:600, fontSize:size*0.33, flexShrink:0 }}>{ini}</div>;
}
function ScorePill({ value, color }:{ value:number; color:string }) {
  return <span style={{ fontSize:18, fontWeight:800, color }}>{value}%</span>;
}
function GaugeCard({ label, value, color, bg, icon }:{ label:string; value:number; color:string; bg:string; icon:string }) {
  return (
    <div style={{ background:"#fff", borderRadius:12, padding:"20px", border:"1px solid #E5E7EB", textAlign:"center" }}>
      <div style={{ width:56, height:56, borderRadius:"50%", background:bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, margin:"0 auto 12px" }}>{icon}</div>
      <div style={{ fontSize:28, fontWeight:800, color, marginBottom:4 }}>{value}%</div>
      <div style={{ fontSize:12, color:C.gray }}>{label}</div>
      <div style={{ marginTop:10, background:"#F3F4F6", borderRadius:100, height:6 }}>
        <div style={{ width:`${value}%`, height:"100%", borderRadius:100, background:color }} />
      </div>
    </div>
  );
}

type Tab = "overview"|"reports"|"alerts"|"bookings";

export function ParentDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [child, setChild] = useState(CHILDREN[0]);
  const [selectedReport, setSelectedReport] = useState<ChildReport|null>(null);
  const [unread, setUnread] = useState(ALERTS.filter(a=>!a.read).length);
  const [showBooking, setShowBooking] = useState(false);

  const chartData = child.reports.slice().reverse().map(r=>({ week:r.week, marks:r.marks, confidence:r.confidence, participation:r.participation }));
  const radarData = [
    { subject:"Score",         A:child.currentScore },
    { subject:"Confidence",    A:child.currentConfidence },
    { subject:"Participation", A:child.currentParticipation },
    { subject:"Attendance",    A:child.attendance },
  ];

  const TABS = [
    { k:"overview" as Tab,  label:"Overview" },
    { k:"reports" as Tab,   label:"Weekly Reports" },
    { k:"alerts" as Tab,    label:"Alerts", badge:unread },
    { k:"bookings" as Tab,  label:"Consultations" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#F8FAFC", fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>

      {/* Top bar */}
      <div style={{ background:"#fff", borderBottom:"1px solid #E5E7EB", padding:"0 32px" }}>
        <div style={{ maxWidth:1280, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", height:64 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:32, height:32, borderRadius:8, background:"linear-gradient(135deg,#3B82F6,#8B5CF6)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:15 }}>F</div>
            <span style={{ fontWeight:700, fontSize:16, color:"#111827" }}>Fluent Academy</span>
            <span style={{ background:C.purpleBg, color:C.purple, fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:100 }}>Parent</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            {unread>0 && (
              <div style={{ position:"relative" }}>
                <button onClick={()=>{setTab("alerts");setUnread(0)}} style={{ background:"none", border:"none", cursor:"pointer", fontSize:20 }}>🔔</button>
                <span style={{ position:"absolute", top:-2, right:-2, width:16, height:16, background:C.red, borderRadius:"50%", fontSize:9, fontWeight:700, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}>{unread}</span>
              </div>
            )}
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <Avatar name={PARENT.name} size={34} />
              <span style={{ fontSize:13, fontWeight:600, color:"#111827" }}>{PARENT.name}</span>
            </div>
          </div>
        </div>
        <div style={{ maxWidth:1280, margin:"0 auto", display:"flex", gap:4 }}>
          {TABS.map(t=>(
            <button key={t.k} onClick={()=>setTab(t.k)} style={{ padding:"10px 16px", border:"none", background:"none", cursor:"pointer", fontSize:13, fontWeight:tab===t.k?700:500, color:tab===t.k?C.blue:C.gray, borderBottom:tab===t.k?`2px solid ${C.blue}`:"2px solid transparent", display:"flex", alignItems:"center", gap:6 }}>
              {t.label}
              {t.badge!=null && t.badge>0 && <span style={{ background:C.red, color:"#fff", fontSize:10, fontWeight:700, padding:"1px 6px", borderRadius:100 }}>{t.badge}</span>}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:1280, margin:"0 auto", padding:"28px 32px" }}>

        {/* Child selector if multiple children */}
        {CHILDREN.length>1 && (
          <div style={{ display:"flex", gap:10, marginBottom:24 }}>
            {CHILDREN.map(c=>(
              <button key={c.id} onClick={()=>setChild(c)} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 16px", borderRadius:10, border:"1.5px solid", borderColor:child.id===c.id?C.blue:"#E5E7EB", background:child.id===c.id?C.blueBg:"#fff", cursor:"pointer" }}>
                <Avatar name={c.name} size={32} />
                <div style={{ textAlign:"left" }}>
                  <div style={{ fontWeight:600, fontSize:14, color:"#111827" }}>{c.name}</div>
                  <div style={{ fontSize:11, color:C.gray }}>Grade {c.grade} · {c.subject}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* OVERVIEW */}
        {tab==="overview" && (
          <>
            <div style={{ marginBottom:24 }}>
              <h1 style={{ fontSize:22, fontWeight:700, color:"#111827", margin:"0 0 4px" }}>Welcome, {PARENT.name.split(" ")[1]} 👋</h1>
              <p style={{ color:C.gray, fontSize:14 }}>Here's how {child.name} is doing this week in {child.subject}.</p>
            </div>

            {/* Child card */}
            <div style={{ background:"linear-gradient(135deg,#EEF2FF,#F5F3FF)", borderRadius:16, padding:24, border:"1px solid #C7D2FE", marginBottom:24, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                <Avatar name={child.name} size={56} />
                <div>
                  <h2 style={{ fontSize:20, fontWeight:700, color:"#111827", margin:"0 0 4px" }}>{child.name}</h2>
                  <p style={{ fontSize:13, color:C.gray, margin:0 }}>Grade {child.grade} · {child.school}</p>
                  <p style={{ fontSize:13, color:C.gray, margin:"2px 0 0" }}>{child.subject} · {child.teacher}</p>
                </div>
              </div>
              <div style={{ display:"flex", gap:24 }}>
                <div style={{ textAlign:"center" }}>
                  <ScorePill value={child.currentScore} color={child.currentScore>=80?C.green:child.currentScore>=60?C.amber:C.red} />
                  <div style={{ fontSize:11, color:C.gray, marginTop:2 }}>This week's score</div>
                </div>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:18, fontWeight:800, color:child.trend==="up"?C.green:child.trend==="down"?C.red:C.gray }}>
                    {child.trend==="up"?"↑ Improving":child.trend==="down"?"↓ Declining":"→ Steady"}
                  </div>
                  <div style={{ fontSize:11, color:C.gray, marginTop:2 }}>5-week trend</div>
                </div>
              </div>
            </div>

            {/* Gauge cards */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:28 }}>
              <GaugeCard label="Score"         value={child.currentScore}         color={C.blue}   bg={C.blueBg}   icon="📊" />
              <GaugeCard label="Confidence"    value={child.currentConfidence}    color={C.purple} bg={C.purpleBg} icon="💪" />
              <GaugeCard label="Participation" value={child.currentParticipation} color={C.green}  bg={C.greenBg}  icon="🙋" />
              <GaugeCard label="Attendance"    value={child.attendance}           color={C.amber}  bg={C.amberBg}  icon="📅" />
            </div>

            {/* Charts */}
            <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:20, marginBottom:24 }}>
              <div style={{ background:"#fff", borderRadius:14, padding:20, border:"1px solid #E5E7EB" }}>
                <h3 style={{ fontSize:15, fontWeight:700, color:"#111827", marginBottom:16 }}>5-Week Growth Trend</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="week" tick={{fontSize:11}} />
                    <YAxis tick={{fontSize:11}} domain={[50,100]} />
                    <Tooltip contentStyle={{borderRadius:8,fontSize:12}} />
                    <Line type="monotone" dataKey="marks"         stroke={C.blue}   strokeWidth={2.5} dot={{r:4}} name="Score" />
                    <Line type="monotone" dataKey="confidence"    stroke={C.purple} strokeWidth={2}   dot={{r:3}} name="Confidence" />
                    <Line type="monotone" dataKey="participation" stroke={C.green}  strokeWidth={2}   dot={{r:3}} name="Participation" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div style={{ background:"#fff", borderRadius:14, padding:20, border:"1px solid #E5E7EB" }}>
                <h3 style={{ fontSize:15, fontWeight:700, color:"#111827", marginBottom:16 }}>Performance Radar</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#F3F4F6" />
                    <PolarAngleAxis dataKey="subject" tick={{fontSize:11}} />
                    <PolarRadiusAxis angle={30} domain={[0,100]} tick={{fontSize:9}} />
                    <Radar name={child.name} dataKey="A" stroke={C.blue} fill={C.blue} fillOpacity={0.2} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Latest report preview */}
            {child.reports.length>0 && (
              <div style={{ background:"#fff", borderRadius:14, padding:20, border:"1px solid #E5E7EB" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                  <h3 style={{ fontSize:15, fontWeight:700, color:"#111827" }}>Latest Teacher Report — {child.reports[0].week}</h3>
                  <button onClick={()=>setTab("reports")} style={{ fontSize:13, color:C.blue, background:"none", border:"none", cursor:"pointer", fontWeight:600 }}>View All →</button>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                  {[
                    { label:"💚 Strengths",    text:child.reports[0].strengths,      bg:C.greenBg },
                    { label:"🔶 Needs Work",   text:child.reports[0].weaknesses,     bg:C.amberBg },
                    { label:"💬 Teacher Says", text:child.reports[0].teacherComment, bg:C.blueBg },
                    { label:"📋 Action Plan",  text:child.reports[0].actionPlan,     bg:C.purpleBg },
                  ].map(item=>(
                    <div key={item.label} style={{ background:item.bg, borderRadius:10, padding:"14px 16px" }}>
                      <div style={{ fontSize:12, fontWeight:700, color:"#374151", marginBottom:6 }}>{item.label}</div>
                      <p style={{ fontSize:13, color:"#374151", margin:0, lineHeight:1.5 }}>{item.text||"—"}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* REPORTS */}
        {tab==="reports" && (
          <>
            <div style={{ marginBottom:20 }}>
              <h2 style={{ fontSize:20, fontWeight:700, color:"#111827", marginBottom:4 }}>Weekly Reports — {child.name}</h2>
              <p style={{ color:C.gray, fontSize:14 }}>All reports submitted by {child.teacher}</p>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:selectedReport?"1fr 1fr":"1fr", gap:20 }}>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {child.reports.map(r=>(
                  <div key={r.week} onClick={()=>setSelectedReport(r)} style={{ background:"#fff", borderRadius:12, padding:"16px 20px", border:selectedReport?.week===r.week?`2px solid ${C.blue}`:"1px solid #E5E7EB", cursor:"pointer", transition:"border-color 0.15s" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                      <span style={{ fontWeight:700, fontSize:14, color:"#111827" }}>{r.week}</span>
                      <span style={{ fontSize:12, color:C.gray }}>{r.date}</span>
                    </div>
                    <div style={{ display:"flex", gap:16 }}>
                      {[{l:"Score",v:r.marks,c:C.blue},{l:"Confidence",v:r.confidence,c:C.purple},{l:"Participation",v:r.participation,c:C.green}].map(m=>(
                        <div key={m.l}>
                          <div style={{ fontSize:10, color:C.gray }}>{m.l}</div>
                          <div style={{ fontSize:16, fontWeight:700, color:m.c }}>{m.v}%</div>
                        </div>
                      ))}
                      <div>
                        <div style={{ fontSize:10, color:C.gray }}>Attendance</div>
                        <span style={{ fontSize:12, fontWeight:600, color:r.attendance==="Present"?C.green:C.red }}>{r.attendance}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedReport && (
                <div style={{ background:"#fff", borderRadius:14, padding:24, border:"1px solid #E5E7EB", position:"sticky", top:20 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                    <h3 style={{ fontSize:16, fontWeight:700, color:"#111827" }}>{selectedReport.week} — Full Report</h3>
                    <button onClick={()=>setSelectedReport(null)} style={{ background:"#F3F4F6", border:"none", borderRadius:"50%", width:28, height:28, cursor:"pointer", fontSize:16, color:C.gray }}>×</button>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:20 }}>
                    <div style={{ background:C.blueBg, borderRadius:8, padding:"10px 12px", textAlign:"center" }}><div style={{ fontSize:10, color:C.gray }}>Score</div><div style={{ fontSize:22, fontWeight:800, color:C.blue }}>{selectedReport.marks}%</div></div>
                    <div style={{ background:C.purpleBg, borderRadius:8, padding:"10px 12px", textAlign:"center" }}><div style={{ fontSize:10, color:C.gray }}>Confidence</div><div style={{ fontSize:22, fontWeight:800, color:C.purple }}>{selectedReport.confidence}%</div></div>
                    <div style={{ background:C.greenBg, borderRadius:8, padding:"10px 12px", textAlign:"center" }}><div style={{ fontSize:10, color:C.gray }}>Participation</div><div style={{ fontSize:22, fontWeight:800, color:C.green }}>{selectedReport.participation}%</div></div>
                  </div>
                  {[{l:"💚 Strengths",t:selectedReport.strengths},{l:"🔶 Areas Needing Work",t:selectedReport.weaknesses},{l:"💬 Teacher Comment",t:selectedReport.teacherComment},{l:"📋 Action Plan",t:selectedReport.actionPlan}].map(item=>(
                    <div key={item.l} style={{ marginBottom:14 }}>
                      <div style={{ fontSize:12, fontWeight:700, color:"#374151", marginBottom:5 }}>{item.l}</div>
                      <p style={{ fontSize:13, color:"#374151", background:"#F9FAFB", borderRadius:8, padding:"10px 12px", margin:0, lineHeight:1.5 }}>{item.t||"—"}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ALERTS */}
        {tab==="alerts" && (
          <>
            <div style={{ marginBottom:20 }}>
              <h2 style={{ fontSize:20, fontWeight:700, color:"#111827", marginBottom:4 }}>Notifications & Alerts</h2>
              <p style={{ color:C.gray, fontSize:14 }}>Real-time updates on {child.name}'s performance.</p>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {ALERTS.map(a=>{
                const tmap:Record<string,{icon:string;color:string;bg:string}> = { marks:{icon:"📊",color:C.blue,bg:C.blueBg}, confidence:{icon:"💪",color:C.purple,bg:C.purpleBg}, attendance:{icon:"📅",color:C.green,bg:C.greenBg} };
                const t = tmap[a.type];
                return (
                  <div key={a.id} style={{ background:"#fff", borderRadius:12, padding:"16px 20px", border:"1px solid #E5E7EB", display:"flex", alignItems:"center", gap:14, opacity:a.read?0.7:1 }}>
                    <div style={{ width:40, height:40, borderRadius:10, background:t.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{t.icon}</div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:14, color:"#111827", margin:0, fontWeight:a.read?400:600 }}>{a.message}</p>
                      <p style={{ fontSize:11, color:C.gray, margin:"3px 0 0" }}>{a.date}</p>
                    </div>
                    {!a.read && <span style={{ width:8, height:8, borderRadius:"50%", background:C.blue, flexShrink:0 }} />}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* BOOKINGS */}
        {tab==="bookings" && (
          <>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <div>
                <h2 style={{ fontSize:20, fontWeight:700, color:"#111827", marginBottom:4 }}>Teacher Consultations</h2>
                <p style={{ color:C.gray, fontSize:14 }}>Book a one-on-one with {child.teacher}.</p>
              </div>
              <button onClick={()=>setShowBooking(true)} style={{ padding:"10px 20px", background:"linear-gradient(135deg,#3B82F6,#8B5CF6)", color:"#fff", border:"none", borderRadius:10, fontWeight:600, fontSize:14, cursor:"pointer" }}>+ Book Consultation</button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {BOOKINGS.map(b=>(
                <div key={b.id} style={{ background:"#fff", borderRadius:12, padding:"16px 20px", border:"1px solid #E5E7EB", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:40, height:40, borderRadius:10, background:C.blueBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>📅</div>
                    <div>
                      <div style={{ fontWeight:600, fontSize:14, color:"#111827" }}>{b.teacherName} · {b.subject}</div>
                      <div style={{ fontSize:12, color:C.gray }}>{b.date} at {b.time}</div>
                    </div>
                  </div>
                  <span style={{ fontSize:12, fontWeight:600, padding:"4px 10px", borderRadius:100, background:b.status==="confirmed"?C.greenBg:b.status==="completed"?"#F3F4F6":C.amberBg, color:b.status==="confirmed"?C.green:b.status==="completed"?C.gray:C.amber }}>
                    {b.status.charAt(0).toUpperCase()+b.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>

            {showBooking && (
              <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={()=>setShowBooking(false)}>
                <div style={{ background:"#fff", borderRadius:20, padding:32, width:"100%", maxWidth:440 }} onClick={e=>e.stopPropagation()}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                    <h3 style={{ fontSize:18, fontWeight:700, color:"#111827" }}>Book Consultation</h3>
                    <button onClick={()=>setShowBooking(false)} style={{ background:"#F3F4F6", border:"none", borderRadius:"50%", width:30, height:30, cursor:"pointer", fontSize:16 }}>×</button>
                  </div>
                  {[{l:"Teacher",ph:child.teacher},{l:"Date",ph:"Select date"},{l:"Preferred Time",ph:"e.g. 4:00 PM"}].map(f=>(
                    <div key={f.l} style={{ marginBottom:14 }}>
                      <label style={{ fontSize:13, fontWeight:600, color:"#374151", display:"block", marginBottom:5 }}>{f.l}</label>
                      <input defaultValue={f.l==="Teacher"?f.ph:""} placeholder={f.ph} style={{ width:"100%", padding:"10px 14px", borderRadius:8, border:"1.5px solid #E5E7EB", fontSize:14, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }} />
                    </div>
                  ))}
                  <div style={{ marginBottom:20 }}>
                    <label style={{ fontSize:13, fontWeight:600, color:"#374151", display:"block", marginBottom:5 }}>Topic / Concern</label>
                    <textarea rows={3} placeholder="e.g. Discuss word problem strategies..." style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:"1.5px solid #E5E7EB", fontSize:13, resize:"vertical", fontFamily:"inherit", outline:"none", boxSizing:"border-box" }} />
                  </div>
                  <button onClick={()=>setShowBooking(false)} style={{ width:"100%", padding:14, background:"linear-gradient(135deg,#3B82F6,#8B5CF6)", color:"#fff", border:"none", borderRadius:10, fontWeight:700, fontSize:15, cursor:"pointer" }}>Confirm Booking ✓</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
