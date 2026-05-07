import React, { useState, useEffect } from 'react';
import { 
  Home, Globe, BarChart3, Award, BookOpen, Settings, Plus, ShieldCheck, Zap, Users
} from 'lucide-react';
import { motion } from 'motion/react';
import { collection, onSnapshot, doc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebaseInit';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';
import { Badge, Card, MetricTile, Btn } from './UI';
import { DashboardShell } from './DashboardShell';

export const AdminCommand = ({ onBack }: { onBack: () => void }) => {
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("overview");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'waitlist'), (snap) => {
      setWaitlist(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'waitlist'));
    return () => unsub();
  }, []);

  const handleResolve = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'waitlist', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `waitlist/${id}`);
    }
  };

  const navItems = [
    { id: "overview", label: "Strategic Command", icon: Home },
    { id: "institutions", label: "Partner Schools", icon: Globe },
    { id: "faculty-performance", label: "Faculty Performance", icon: BarChart3 },
    { id: "faculty", label: "Faculty Audits", icon: Award },
    { id: "curriculum", label: "Curriculum Health", icon: BookOpen },
    { id: "analytics", label: "System Analytics", icon: BarChart3 },
    { id: "settings", label: "System Config", icon: Settings },
  ];

  return (
    <DashboardShell role="admin" title="Institutional Oversight" navItems={navItems} activeNav={activeNav} setActiveNav={setActiveNav} onBack={onBack}>
      <div className="p-10 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge color="gold">Global Administrator</Badge>
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">All Systems Operational</span>
            </div>
            <h1 className="text-3xl font-serif font-bold tracking-tight">{navItems.find(n => n.id === activeNav)?.label || 'Institutional Command'}</h1>
          </div>
          <div className="flex gap-3">
            <Btn variant="outline" size="sm" icon={ShieldCheck}>Security Audit</Btn>
            <Btn variant="primary" size="sm" icon={Plus}>Onboard Partner</Btn>
          </div>
        </header>

        {activeNav === "overview" && (
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* System Pulse Metrics */}
            <div className="lg:col-span-12 grid sm:grid-cols-4 gap-4 mb-4">
              <MetricTile label="Global Reach" value="12.4K" delta="+0.8%" icon={Globe} color="#1B4F5E" />
              <MetricTile label="Deployment Hubs" value="482" icon={Home} color="#0D1B2A" />
              <MetricTile label="Avg Mastery" value="89.2%" icon={Award} color="#C9A84C" />
              <MetricTile label="System Latency" value="14ms" icon={Zap} color="#7C3AED" />
            </div>

            {/* Application Pipeline - Precision Registry */}
            <div className="lg:col-span-8">
              <Card className="overflow-hidden border-black/5 shadow-none ring-1 ring-black/5">
                <div className="p-8 border-b border-black/5 bg-gray-50/50 flex justify-between items-center relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-5">
                      <ShieldCheck size={80} />
                   </div>
                   <div>
                      <h3 className="text-xl font-serif font-bold tracking-tight italic">Partner Application Registry</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Pending Institutional Audits</p>
                   </div>
                   <Badge color="gold" className="p-2 px-6 shadow-xl shadow-fluent-gold/10 uppercase tracking-widest text-[9px] font-black">{waitlist.length} Applications</Badge>
                </div>
                <div className="divide-y divide-black/5">
                  {waitlist.length === 0 ? (
                    <div className="p-20 text-center text-slate-400 italic">No pending institutional audits.</div>
                  ) : waitlist.map((entry, i) => (
                    <div key={entry.id || i} className="flex hover:bg-slate-50 transition-all group items-center">
                      <div className="w-20 p-8 border-r border-black/5 flex flex-col items-center justify-center bg-gray-50/30 group-hover:bg-white transition-colors">
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Entry</span>
                        <span className="text-xl font-mono font-bold text-fluent-navy">{i + 1}</span>
                      </div>
                      <div className="flex-1 p-8 flex justify-between items-center">
                        <div>
                          <div className="text-lg font-bold text-fluent-navy tracking-tight">{entry.email}</div>
                          <div className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-tighter">
                            Requested Date: {entry.requestedAt?.toDate ? entry.requestedAt.toDate().toLocaleDateString() : 'N/A :: SYNC_LOG'}
                          </div>
                        </div>
                        <div className="flex gap-3">
                           <Btn variant="outline" size="sm" className="text-[9px] font-black tracking-widest px-4 border-black/10 hover:border-fluent-teal transition-all" onClick={() => handleResolve(entry.id)}>REJECT ENTRY</Btn>
                           <Btn variant="primary" size="sm" className="text-[9px] font-black tracking-widest px-6" onClick={() => handleResolve(entry.id)}>GRANT ACCESS</Btn>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Strategic Oversight Rail */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="p-10 bg-fluent-navy text-white relative overflow-hidden">
                 <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-[80px]" />
                 <h3 className="text-lg font-serif font-bold italic mb-6">Regional Distribution</h3>
                 <div className="space-y-6">
                    {[
                      { l: "United Kingdom", v: 64 },
                      { l: "Middle East", v: 22 },
                      { l: "South East Asia", v: 14 }
                    ].map((r, i) => (
                      <div key={i} className="group">
                         <div className="flex justify-between items-end mb-2">
                            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest group-hover:text-fluent-gold transition-colors">{r.l}</div>
                            <div className="text-lg font-mono font-medium tracking-tighter">{r.v}%</div>
                         </div>
                         <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${r.v}%` }}
                              className="h-full bg-fluent-gold"
                            />
                         </div>
                      </div>
                    ))}
                 </div>
                 <Btn variant="gold" size="sm" className="w-full mt-12 py-4 text-[9px] font-black tracking-[0.2em]">DOWNLOAD GLOBAL REPORT</Btn>
              </Card>
              
              <Card className="p-8 border-black/5 bg-gray-50/50">
                 <h3 className="text-xs font-black text-fluent-navy uppercase tracking-widest mb-6">Security Terminal</h3>
                 <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-white border border-black/5 rounded-xl">
                       <ShieldCheck size={14} className="text-fluent-teal" />
                       <span className="text-[10px] font-bold text-slate-600">ENCRYPTION: AES-256 ACTIVE</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white border border-black/5 rounded-xl">
                       <ShieldCheck size={14} className="text-fluent-teal" />
                       <span className="text-[10px] font-bold text-slate-600">VERIFICATION: RIGOROUS</span>
                    </div>
                 </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
};
