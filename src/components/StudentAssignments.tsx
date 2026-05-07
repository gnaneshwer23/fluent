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
            <Card key={a.id || i} className="p-8 group hover:border-fluent-teal/30 transition-all duration-300">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex gap-6 items-center">
                  <div className="w-14 h-14 bg-fluent-teal/5 rounded-2xl flex items-center justify-center text-fluent-teal group-hover:bg-fluent-teal group-hover:text-white transition-all">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-bold text-fluent-navy mb-1">{a.title}</h3>
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                      <span className="flex items-center gap-1.5"><Calendar size={14} /> Due: {a.dueDate}</span>
                      <span className="flex items-center gap-1.5 uppercase tracking-widest">{a.batch || "General Cohort"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                  {a.status === 'completed' ? (
                    <Badge color="teal" icon={CheckCircle2}>Submitted</Badge>
                  ) : (
                    <Badge color="gold" icon={Clock}>Pending</Badge>
                  )}
                  {a.link && (
                    <a href={a.link} target="_blank" rel="noopener noreferrer" className="flex-1 md:flex-none">
                      <Btn variant="primary" size="sm" icon={ExternalLink} className="w-full">Open Resources</Btn>
                    </a>
                  )}
                </div>
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
