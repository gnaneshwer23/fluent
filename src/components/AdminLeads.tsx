import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../lib/firebaseInit";
import { handleFirestoreError, OperationType } from "../lib/errorHandling";
import { Card, Btn, Badge } from "./UI";
import { Mail, Phone, Calendar, Search, Filter } from "lucide-react";

export default function AdminLeads() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "waitlist"), orderBy("requestedAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setLeads(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "waitlist"));
    return () => unsub();
  }, []);

  if (loading) return <div className="flex justify-center p-20 animate-pulse text-slate-400">Syncing Lead Registry...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-serif font-bold text-fluent-navy">Lead Acquisition Pipeline</h2>
          <p className="text-slate-400 mt-2 text-[10px] font-black uppercase tracking-widest">Inbound institutional & scholar growth tracking</p>
        </div>
        <div className="flex gap-2">
           <Btn variant="outline" size="sm" icon={Filter}>Filter</Btn>
           <Btn variant="primary" size="sm" icon={Search}>Search</Btn>
        </div>
      </div>

      <Card className="overflow-hidden border-black/5 bg-white">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-black/5">
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Timestamp</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Lead Identity</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Designation</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
              <th className="p-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Operation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-slate-50/30 transition-colors">
                <td className="p-6">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar size={14} />
                    <span className="text-xs font-bold font-mono">
                       {lead.requestedAt?.toDate ? lead.requestedAt.toDate().toLocaleDateString() : 'Pending'}
                    </span>
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-fluent-teal/10 flex items-center justify-center text-fluent-teal font-black text-xs">
                       {lead.email?.[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-fluent-navy">{lead.email}</div>
                      <div className="text-[10px] text-slate-400 font-medium">Source: Direct Inbound</div>
                    </div>
                  </div>
                </td>
                <td className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest">{lead.role || "Prospect"}</td>
                <td className="p-6"><Badge color="gold">Verified Audit</Badge></td>
                <td className="p-6 text-right">
                  <Btn variant="ghost" size="sm" className="text-[10px] font-black tracking-widest">INITIATE CALL</Btn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
