import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, where } from "firebase/firestore";
import { db } from "../lib/firebaseInit";
import { handleFirestoreError, OperationType } from "../lib/errorHandling";
import { Card, Btn, Badge } from "./UI";
import { CreditCard, DollarSign, Calendar, Search, ArrowUpRight } from "lucide-react";

export default function AdminPayments({ schoolId }: { schoolId?: string }) {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = query(collection(db, "payments"), orderBy("timestamp", "desc"));
    if (schoolId && schoolId !== 'all') {
      q = query(collection(db, "payments"), where("schoolId", "==", schoolId), orderBy("timestamp", "desc"));
    }
    
    const unsub = onSnapshot(q, (snap) => {
      setPayments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "payments"));
    return () => unsub();
  }, [schoolId]);

  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  if (loading) return <div className="flex justify-center p-20 animate-pulse text-slate-400">Syncing Financial Ledger...</div>;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-serif font-bold text-fluent-navy text-fluent-gold">Financial Command</h2>
          <p className="text-slate-400 mt-2 text-[10px] font-black uppercase tracking-widest">Real-time revenue & transaction oversight</p>
        </div>
        <div className="text-right">
           <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cumulative Revenue</div>
           <div className="text-4xl font-serif font-bold text-fluent-navy">₹{totalRevenue.toLocaleString()}</div>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-6">
         <Card className="p-8 border-black/5 bg-white shadow-xl">
            <div className="flex items-center gap-4 mb-6">
               <div className="p-3 rounded-xl bg-green-50 text-green-600">
                  <ArrowUpRight size={20} />
               </div>
               <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Avg Ticket</h4>
            </div>
            <div className="text-2xl font-serif font-bold italic text-fluent-navy">₹{payments.length > 0 ? Math.round(totalRevenue / payments.length).toLocaleString() : '0'}</div>
         </Card>
         <Card className="p-8 border-black/5 bg-white shadow-xl">
            <div className="flex items-center gap-4 mb-6">
               <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                  <CreditCard size={20} />
               </div>
               <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Transactions</h4>
            </div>
            <div className="text-2xl font-serif font-bold italic text-fluent-navy">{payments.length} Settlements</div>
         </Card>
         <Card className="p-8 bg-fluent-navy text-white shadow-xl">
            <div className="flex items-center gap-4 mb-6">
               <div className="p-3 rounded-xl bg-white/10 text-fluent-gold">
                  <DollarSign size={20} />
               </div>
               <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40">Next Payout</h4>
            </div>
            <div className="text-2xl font-serif font-bold italic text-fluent-gold">₹{(totalRevenue * 0.95).toLocaleString()}</div>
         </Card>
      </div>

      <Card className="overflow-hidden border-black/5 bg-white">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-black/5">
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Timestamp</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Merchant Reference</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
              <th className="p-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {payments.length === 0 ? (
               <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-400 italic text-sm">No transaction records detected globally.</td>
               </tr>
            ) : payments.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/30 transition-colors">
                <td className="p-6">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar size={14} />
                    <span className="text-xs font-bold font-mono">
                       {p.timestamp?.toDate ? p.timestamp.toDate().toLocaleString() : 'Processing'}
                    </span>
                  </div>
                </td>
                <td className="p-6">
                  <div>
                    <div className="text-sm font-bold text-fluent-navy">{p.orderId || 'Direct Settlement'}</div>
                    <div className="text-[10px] text-slate-400 font-medium">User Node: {p.studentEmail || 'System Merchant'}</div>
                  </div>
                </td>
                <td className="p-6">
                   <Badge color="teal" icon={ArrowUpRight}>Settled</Badge>
                </td>
                <td className="p-6 text-right">
                   <div className="text-lg font-serif font-bold text-fluent-navy">₹{p.amount?.toLocaleString()}</div>
                   <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest">INR :: {p.currency || 'INR'}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
