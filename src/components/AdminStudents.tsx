import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebaseInit";
import { handleFirestoreError, OperationType } from "../lib/errorHandling";
import { Card, Btn, Badge, Avatar } from "./UI";
import { Search, GraduationCap, TrendingUp, ShieldAlert } from "lucide-react";

export default function AdminStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "student"));
    const unsub = onSnapshot(q, (snap) => {
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "users/students"));
    return () => unsub();
  }, []);

  if (loading) return <div className="flex justify-center p-20 animate-pulse text-slate-400">Loading Scholar Registry...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-serif font-bold text-fluent-navy">Scholar Registry</h2>
          <p className="text-slate-400 mt-2 text-[10px] font-black uppercase tracking-widest">Complete oversight of active learning nodes</p>
        </div>
        <div className="flex gap-2">
           <Btn variant="primary" size="sm" icon={Search}>Registry Search</Btn>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map((s) => (
          <Card key={s.id} className="p-8 border-black/5 bg-white group hover:border-fluent-teal/20 transition-all cursor-pointer">
            <div className="flex justify-between items-start mb-6">
              <Avatar name={s.name} size={48} />
              <Badge color={s.onboarded ? "teal" : "gold"}>
                {s.onboarded ? "Onboarded" : "Pending O/B"}
              </Badge>
            </div>
            
            <h3 className="text-xl font-serif font-bold text-fluent-navy mb-1">{s.name}</h3>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
              {s.grade || "Unassigned"} :: {s.school || "Global Academy"}
            </div>

            <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-fluent-teal">
                <TrendingUp size={14} /> Performance Audit
              </div>
              <Btn variant="ghost" size="sm" icon={GraduationCap}>View Profile</Btn>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
