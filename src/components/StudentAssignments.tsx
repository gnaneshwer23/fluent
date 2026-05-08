import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "../lib/firebaseInit";
import { handleFirestoreError, OperationType } from "../lib/errorHandling";
import { Card, Badge, Btn } from "./UI";
import { BookOpen, Calendar, ExternalLink, CheckCircle2, Clock } from "lucide-react";

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    
    // In a real app, we might filter by student's batch or UID
    // For simplicity, we query all assignments and filter locally or use a general batch
    const q = query(collection(db, "assignments"));
    
    const unsub = onSnapshot(q, (snapshot) => {
      setAssignments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "assignments");
    });

    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fluent-teal" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-serif font-bold text-fluent-navy">My Assignments</h2>
        <Badge color="teal" className="px-4 py-1">{assignments.length} Total</Badge>
      </div>

      <div className="grid gap-6">
        {assignments.length > 0 ? (
          assignments.map((a, i) => (
            <Card key={a.id || i} className="p-10 group hover:border-fluent-teal/30 transition-all duration-500 bg-white shadow-sm border-black/5 rounded-[40px] relative overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
                <div className="flex gap-8 items-center">
                  <div className="w-16 h-16 bg-fluent-teal/5 rounded-[24px] flex items-center justify-center text-fluent-teal group-hover:bg-fluent-teal group-hover:text-white transition-all duration-500 shadow-inner">
                    <BookOpen size={28} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-serif font-black text-fluent-navy group-hover:text-fluent-teal transition-colors duration-300 leading-tight">{a.title}</h3>
                    <div className="flex flex-wrap items-center gap-6">
                      <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        <Calendar size={14} className="text-fluent-teal" /> DUE: {a.dueDate}
                      </span>
                      <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        <Clock size={14} className="text-fluent-gold" /> {a.batch || "Global Cohort"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-black/5 mt-4 md:mt-0">
                  {a.status === 'completed' ? (
                    <Badge color="teal" icon={CheckCircle2} className="px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">Submitted</Badge>
                  ) : (
                    <Badge color="gold" icon={Clock} className="px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">Active Task</Badge>
                  )}
                  {a.link && (
                    <a href={a.link} target="_blank" rel="noopener noreferrer" className="flex-1 md:flex-none">
                      <Btn variant="primary" size="md" icon={ExternalLink} className="w-full md:px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest py-4">Initialize Node</Btn>
                    </a>
                  )}
                </div>
              </div>
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                 <BookOpen size={120} className="-rotate-12 translate-x-12 -translate-y-12" />
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <p className="text-slate-400 font-medium italic">No active assignments found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
