import { useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";
import { Card, MetricTile, Badge, Btn, Avatar } from "./UI";
import { Bell, School, Users, Zap, TrendingUp, AlertTriangle, Target } from "lucide-react";
const C = { blue:"#3B82F6", purple:"#8B5CF6", green:"#22C55E", amber:"#F59E0B", red:"#EF4444", gray:"#6B7280", blueBg:"#EFF6FF", purpleBg:"#F5F3FF", greenBg:"#F0FDF4", amberBg:"#FFFBEB", redBg:"#FEF2F2" };
interface School { id:string; name:string; status:"active"|"onboarding"|"paused"; studentCount:number; teacherCount:number; avgScore:number; alertCount:number; location:string; adminEmail:string; }
interface GlobalAlert { id:string; schoolName:string; studentName:string; type:string; message:string; date:string; status:"active"|"resolved"; severity:"high"|"medium"|"low"; }
interface SchoolLead { id:string; schoolName:string; contactPerson:string; email:string; phone:string; studentCount:string; status:"pending"|"contacted"|"onboarded"; requestedAt:string; }
interface TeacherPerf { name:string; school:string; avgMarks:number; avgConfidence:number; attendanceRate:number; rating:number; studentCount:number; }
const SCHOOLS=[{id:"sc1",name:"St. Mary's Academy",status:"active",studentCount:380,teacherCount:22,avgScore:79,alertCount:3,location:"Mumbai",adminEmail:"admin@stmarys.edu.in"},{id:"sc2",name:"Delhi Public School",status:"active",studentCount:520,teacherCount:31,avgScore:74,alertCount:7,location:"Delhi",adminEmail:"admin@dps.edu.in"},{id:"sc3",name:"Greenwood High",status:"onboarding",studentCount:180,teacherCount:12,avgScore:0,alertCount:0,location:"Bangalore",adminEmail:"admin@greenwood.edu.in"},{id:"sc4",name:"Heritage International",status:"active",studentCount:290,teacherCount:18,avgScore:82,alertCount:1,location:"Chennai",adminEmail:"admin@heritage.edu.in"},{id:"sc5",name:"Bright Futures Academy",status:"paused",studentCount:120,teacherCount:8,avgScore:68,alertCount:4,location:"Pune",adminEmail:"admin@brightfutures.edu.in"}];
const ALERTS=[{id:"ga1",schoolName:"Delhi Public School",studentName:"Rahul Sharma",type:"marks",message:"Score dropped from 71% to 43%",date:"2026-05-07",status:"active",severity:"high"},{id:"ga2",schoolName:"Delhi Public School",studentName:"Meera Patel",type:"attendance",message:"Attendance at 55% — 5th consecutive miss",date:"2026-05-07",status:"active",severity:"high"},{id:"ga3",schoolName:"St. Mary's Academy",studentName:"Sneha Rao",type:"confidence",message:"Confidence at 45% — 3rd consecutive drop",date:"2026-05-06",status:"active",severity:"medium"},{id:"ga4",schoolName:"Bright Futures Academy",studentName:"Amit Kumar",type:"marks",message:"Score at 52% — borderline performance",date:"2026-05-05",status:"active",severity:"medium"},{id:"ga5",schoolName:"Heritage International",studentName:"Priya Nair",type:"attendance",message:"Attendance recovered to 82%",date:"2026-05-04",status:"resolved",severity:"low"}];
const SCHOOL_LEADS=[{id:"sl1",schoolName:"Sunrise Convent",contactPerson:"Dr. Ramesh Singh",email:"r.singh@sunrise.edu.in",phone:"+91 98765 43210",studentCount:"300-400",status:"contacted",requestedAt:"2026-05-06"},{id:"sl2",schoolName:"Excel Academy",contactPerson:"Mrs. Kavitha Rao",email:"k.rao@excel.edu.in",phone:"+91 87654 32109",studentCount:"150-200",status:"pending",requestedAt:"2026-05-07"},{id:"sl3",schoolName:"Future Leaders",contactPerson:"Mr. Suresh Pillai",email:"s.pillai@fl.edu.in",phone:"+91 76543 21098",studentCount:"500+",status:"pending",requestedAt:"2026-05-07"}];
const PLATFORM_TRENDS=[{month:"Jan",students:1800,schools:12,avgScore:72},{month:"Feb",students:2050,schools:14,avgScore:73},{month:"Mar",students:2200,schools:16,avgScore:75},{month:"Apr",students:2350,schools:18,avgScore:76},{month:"May",students:2490,schools:20,avgScore:77}];
const TOP_TEACHERS=[{name:"Ms. Ananya Mehta",school:"St. Mary's",avgMarks:84,avgConfidence:80,attendanceRate:95,rating:4.8,studentCount:86},{name:"Mr. Rajesh Kumar",school:"Delhi Public School",avgMarks:81,avgConfidence:77,attendanceRate:93,rating:4.6,studentCount:92},{name:"Dr. Priya Nair",school:"Heritage Intl.",avgMarks:87,avgConfidence:83,attendanceRate:97,rating:4.9,studentCount:72}];
const STATUS_PIE=[{name:"Active",value:3,fill:C.green},{name:"Onboarding",value:1,fill:C.amber},{name:"Paused",value:1,fill:C.red}];
function StatCard({label,value,sub,delta,color,bg,icon}:{label:string,value:string|number,sub?:string,delta?:string,color:string,bg:string,icon:string}){return (<div style={{background:"#fff",borderRadius:12,padding:"18px 20px",border:"1px solid #E5E7EB"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}><div style={{width:44,height:44,borderRadius:10,background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{icon}</div>{delta&&<span style={{fontSize:11,fontWeight:600,color:C.green,background:C.greenBg,padding:"2px 8px",borderRadius:100}}>{delta}</span>}</div><div style={{fontSize:26,fontWeight:800,color,marginBottom:2}}>{value}</div><div style={{fontSize:13,color:C.gray}}>{label}</div>{sub&&<div style={{fontSize:11,color:"#9CA3AF",marginTop:2}}>{sub}</div>}</div>);}
type Tab="overview"|"schools"|"alerts"|"leads"|"teachers"|"analytics";
export function AdminDashboard(){const [tab,setTab]=useState<Tab>("overview");const [alertMap,setAlertMap]=useState<Record<string,"active"|"resolved">>({});const [leadMap,setLeadMap]=useState<Record<string,string>>({});const [directiveText,setDirectiveText]=useState("Welcome back!");const alerts=ALERTS.map(a=>({...a,status:alertMap[a.id]??a.status}));const activeAlerts=alerts.filter(a=>a.status==="active").length;const totalStudents=SCHOOLS.filter(s=>s.status==="active").reduce((acc,s)=>acc+s.studentCount,0);
    
    const TABS = [
        { k:"overview" as Tab,   label:"Overview" },
        { k:"schools" as Tab,    label:"Schools", badge:SCHOOLS.filter(s=>s.status==="onboarding").length },
        { k:"alerts" as Tab,     label:"Alerts", badge:activeAlerts },
        { k:"leads" as Tab,      label:"Leads", badge:SCHOOL_LEADS.filter(l=>l.status==="pending").length },
        { k:"teachers" as Tab,   label:"Teacher Analytics" },
        { k:"analytics" as Tab,  label:"Platform Analytics" },
    ];
    
    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-fluent-midnight">Admin Dashboard</h1>
                    <p className="text-sm text-stone-700">Platform overview & management</p>
                </div>
                <div className="flex gap-2">
                    {TABS.map(t=>(
                        <Btn key={t.k} variant={tab===t.k ? "primary" : "ghost"} size="sm" onClick={()=>setTab(t.k)}>
                            {t.label} 
                            {t.badge ? <Badge color="gold" className="ml-2">{t.badge}</Badge> : null}
                        </Btn>
                    ))}
                </div>
            </header>
            
            <main>
                {tab === "overview" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <MetricTile label="Total Students" value={totalStudents.toLocaleString()} icon={Users} color="#3B82F6" />
                        <MetricTile label="Active Schools" value={SCHOOLS.filter(s=>s.status==="active").length.toString()} icon={School} color="#22C55E" />
                        <MetricTile label="Pending Leads" value={SCHOOL_LEADS.filter(l=>l.status==="pending").length.toString()} icon={Zap} color="#F59E0B" />
                        <MetricTile label="Active Alerts" value={activeAlerts.toString()} icon={AlertTriangle} color="#EF4444" delta={activeAlerts > 0 ? "Attention Needed" : undefined} />
                    </div>
                )}
                {tab === "analytics" && (
                    <Card>
                        <h2 className="text-xl font-bold mb-6">Platform Growth</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={PLATFORM_TRENDS}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="students" stroke={C.blue} strokeWidth={3} />
                            <Line type="monotone" dataKey="avgScore" stroke={C.purple} strokeWidth={3} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                )}
                {tab === "schools" && (
                    <Card>
                        <h2 className="text-xl font-bold mb-6">Schools</h2>
                        <table className="w-full text-sm">
                            <thead className="text-left text-stone-800 uppercase text-[10px] tracking-widest font-black">
                                <tr><th className="pb-4">Name</th><th className="pb-4">Status</th><th className="pb-4">Students</th><th className="pb-4">Teachers</th><th className="pb-4">Avg Score</th></tr>
                            </thead>
                            <tbody>
                                {SCHOOLS.map(s => (
                                    <tr key={s.id} className="border-t border-gray-100">
                                        <td className="py-4 font-bold">{s.name}</td>
                                        <td className="py-4"><Badge color={s.status==="active"?"green":s.status==="onboarding"?"gold":"red"}>{s.status}</Badge></td>
                                        <td className="py-4">{s.studentCount}</td>
                                        <td className="py-4">{s.teacherCount}</td>
                                        <td className="py-4">{s.avgScore}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>
                )}
                {tab === "teachers" && (
                    <Card>
                        <h2 className="text-xl font-bold mb-6">Top Performing Teachers</h2>
                        <table className="w-full text-sm">
                            <thead className="text-left text-stone-800 uppercase text-[10px] tracking-widest font-black">
                                <tr><th className="pb-4">Name</th><th className="pb-4">School</th><th className="pb-4">Avg Marks</th><th className="pb-4">Attendance</th><th className="pb-4">Rating</th></tr>
                            </thead>
                            <tbody>
                                {TOP_TEACHERS.map(t => (
                                    <tr key={t.name} className="border-t border-gray-100">
                                        <td className="py-4 font-bold flex items-center gap-3"><Avatar name={t.name} size={30}/> {t.name}</td>
                                        <td className="py-4">{t.school}</td>
                                        <td className="py-4">{t.avgMarks}</td>
                                        <td className="py-4">{t.attendanceRate}%</td>
                                        <td className="py-4 font-bold text-fluent-gold">{t.rating}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>
                )}
                {tab === "alerts" && (
                    <Card>
                        <h2 className="text-xl font-bold mb-6">Global Alerts</h2>
                        <div className="space-y-4">
                            {alerts.map(a => (
                                <div key={a.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl">
                                    <div className="flex gap-4 items-center">
                                        <AlertTriangle className={a.severity==="high" ? "text-red-500" : "text-amber-500"} />
                                        <div>
                                            <div className="font-bold">{a.schoolName} — {a.studentName}</div>
                                            <div className="text-xs text-stone-800 font-medium">{a.message}</div>
                                        </div>
                                    </div>
                                    <Btn variant={a.status==="active"?"danger":"success"} size="sm" onClick={()=>setAlertMap(prev=>({...prev,[a.id]:a.status==="active"?"resolved":"active"}))}>
                                        {a.status}
                                    </Btn>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}
                {tab === "leads" && (
                    <Card>
                        <h2 className="text-xl font-bold mb-6">School Leads</h2>
                        <table className="w-full text-sm">
                            <thead className="text-left text-stone-600 uppercase text-[10px] tracking-widest">
                                <tr><th>School</th><th>Contact</th><th>Status</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                {SCHOOL_LEADS.map(l => (
                                    <tr key={l.id} className="border-t border-gray-100">
                                        <td className="py-4 font-bold">{l.schoolName}</td>
                                        <td className="py-4">{l.contactPerson}<br/><span className="text-[10px] text-gray-400">{l.email}</span></td>
                                        <td className="py-4"><Badge color={l.status==="onboarded"?"green":l.status==="pending"?"red":"gold"}>{l.status}</Badge></td>
                                        <td className="py-4">
                                            <Btn size="sm" variant="outline" onClick={()=>setLeadMap(prev=>({...prev,[l.id]:"contacted"}))}>Contact</Btn>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>
                )}
            </main>
        </div>
    );
}
