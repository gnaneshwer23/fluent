import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebaseInit";
import { handleFirestoreError, OperationType } from "../lib/errorHandling";
import { Card, Btn, Badge, Avatar } from "./UI";
import { Search, Award, Star, ShieldCheck } from "lucide-react";

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "teacher"));
    const unsub = onSnapshot(q, (snap) => {
      setTeachers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "users/faculty"));
    return () => unsub();
  }, []);

  if (loading) return <div className="flex justify-center p-20 animate-pulse text-slate-400">Auditing Faculty Registry...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-serif font-bold text-fluent-navy">Faculty Command</h2>
          <p className="text-slate-400 mt-2 text-[10px] font-black uppercase tracking-widest">Oversight of instructional excellence & delivery</p>
        </div>
        <Btn variant="primary" size="sm" icon={ShieldCheck}>Faculty Verification</Btn>
      </div>

      <Card className="overflow-hidden bg-white border-black/5">
        <div className="divide-y divide-black/5">
           {teachers.map((t) => (
             <div key={t.id} className="p-8 flex flex-col md:flex-row justify-between items-center hover:bg-slate-50 transition-colors gap-6">
                <div className="flex items-center gap-6">
                   <div className="relative">
                      <Avatar name={t.name} size={64} />
                      <div className="absolute -bottom-1 -right-1 bg-fluent-gold text-white p-1 rounded-full border-2 border-white">
                         <Star size={10} className="fill-white" />
                      </div>
                   </div>
                   <div>
                      <h3 className="text-xl font-serif font-bold text-fluent-navy">{t.name}</h3>
                      <div className="flex gap-2 mt-1">
                        {t.subjects?.map((sub: string) => (
                          <span key={sub} className="text-[9px] font-black uppercase bg-slate-100 px-2 py-0.5 rounded tracking-widest text-slate-500">{sub}</span>
                        ))}
                      </div>
                   </div>
                </div>

                <div className="flex items-center gap-12">
                   <div className="text-center">
                      <div className="text-xl font-serif font-bold text-fluent-navy">4.8</div>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Peer Rating</div>
                   </div>
                   <div className="text-center">
                      <div className="text-xl font-serif font-bold text-fluent-teal">92%</div>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Delivery Sync</div>
                   </div>
                   <div className="flex gap-3">
                      <Btn variant="outline" size="sm" className="text-[10px] font-black tracking-widest">PERFORMANCE DASHBOARD</Btn>
                      <Btn variant="ghost" size="sm" icon={Award}>Commend</Btn>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </Card>
    </div>
  );
}
