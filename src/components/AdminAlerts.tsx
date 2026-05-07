import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, where, doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebaseInit";
import { handleFirestoreError, OperationType } from "../lib/errorHandling";
import { Card, Btn, Badge, Avatar } from "./UI";
import { ShieldAlert, CheckCircle2, Calendar, MessageSquare } from "lucide-react";

export default function AdminAlerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "alerts"), orderBy("date", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setAlerts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "alerts"));
    return () => unsub();
  }, []);

  const resolveAlert = async (id: string) => {
    try {
      await updateDoc(doc(db, "alerts", id), { status: "resolved" });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `alerts/${id}`);
    }
  };

  if (loading) return <div className="flex justify-center p-20 animate-pulse text-slate-400">Syncing Alert System...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-serif font-bold text-fluent-navy text-red-600">Intervention Required</h2>
          <p className="text-slate-400 mt-2 text-[10px] font-black uppercase tracking-widest">Real-time synthesis of student risks & breaches</p>
        </div>
        <Badge color="red" icon={ShieldAlert}>{alerts.filter(a => a.status === 'active').length} Active Interventions</Badge>
      </div>

      <div className="grid gap-4">
        {alerts.length === 0 ? (
          <div className="py-24 text-center bg-slate-50 rounded-[48px] border border-dashed border-slate-200">
            <CheckCircle2 size={48} className="mx-auto text-fluent-teal opacity-20 mb-4" />
            <p className="text-slate-400 italic">No system warnings detected. Operational baseline stable.</p>
          </div>
        ) : alerts.map((alert) => (
          <Card key={alert.id} className={`p-8 border-black/5 flex flex-col md:flex-row justify-between items-center gap-6 transition-all ${alert.status === 'resolved' ? 'bg-slate-50/50 opacity-60' : 'bg-white shadow-xl'}`}>
            <div className="flex items-center gap-6">
               <div className={`p-4 rounded-2xl ${alert.status === 'resolved' ? 'bg-slate-200 text-slate-400' : 'bg-red-50 text-red-500'}`}>
                  <ShieldAlert size={24} />
               </div>
               <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black uppercase tracking-widest text-red-600">{alert.type}</span>
                    <span className="text-[10px] text-slate-400 font-bold font-mono">
                      {alert.date?.toDate ? alert.date.toDate().toLocaleString() : 'Just now'}
                    </span>
                  </div>
                  <h3 className="text-lg font-serif font-bold text-fluent-navy">{alert.message}</h3>
                  <div className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-tight">
                    {alert.studentId ? `Student Node: ${alert.studentId}` : `Faculty Node: ${alert.teacherId}`}
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-3">
               {alert.status === 'active' ? (
                 <>
                   <Btn variant="outline" size="sm" className="text-[10px] font-black tracking-widest border-red-100 text-red-600 hover:bg-red-50">ESCALATE</Btn>
                   <Btn variant="primary" size="sm" className="text-[10px] font-black tracking-widest" onClick={() => resolveAlert(alert.id)}>RESOLVE</Btn>
                 </>
               ) : (
                 <div className="flex items-center gap-2 text-fluent-teal text-[10px] font-black uppercase">
                   <CheckCircle2 size={16} /> Resolution Logged
                 </div>
               )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
