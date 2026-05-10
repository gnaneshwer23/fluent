import React, { useEffect, useState } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db, auth } from "../lib/firebaseInit";
import { handleFirestoreError, OperationType } from "../lib/errorHandling";
import { Card, Badge, Btn } from "./UI";
import { BookOpen, Calendar, ExternalLink, CheckCircle2, Clock, X, FileText, Link as LinkIcon } from "lucide-react";

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterBatch, setFilterBatch] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("due-soon");

  useEffect(() => {
    if (!auth.currentUser) return;
    
    const q = query(collection(db, "assignments"));
    
    const unsub = onSnapshot(q, (snapshot) => {
      setAssignments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "assignments");
    });

    return () => unsub();
  }, []);

  const filteredAndSortedAssignments = React.useMemo(() => {
    let result = [...assignments];

    // Status Filter
    if (filterStatus !== "all") {
      result = result.filter(a => (a.status || 'active') === filterStatus);
    }

    // Batch Filter
    if (filterBatch !== "all") {
      result = result.filter(a => a.batch === filterBatch || a.cohortId === filterBatch);
    }

    // Sort
    result.sort((a, b) => {
      if (sortOrder === "due-soon") {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortOrder === "due-far") {
        return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      }
      if (sortOrder === "title") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return result;
  }, [assignments, filterStatus, filterBatch, sortOrder]);

  const uniqueBatches = React.useMemo(() => {
    const batches = assignments.map(a => a.batch || a.cohortId).filter(Boolean);
    return Array.from(new Set(batches));
  }, [assignments]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fluent-teal" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center px-4">
        <h2 className="text-3xl font-serif font-bold text-fluent-midnight">My Assignments</h2>
        <Badge color="gold" className="px-4 py-1">{filteredAndSortedAssignments.length} Total</Badge>
      </div>

      <div className="flex flex-wrap gap-4 items-center bg-stone-50 p-6 rounded-lg border border-black/5 mx-4">
        <div className="flex-1 min-w-[150px]">
          <label className="text-[10px] font-display font-medium uppercase tracking-widest text-stone-400 block mb-2 px-1">Status</label>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-white border border-black/5 rounded px-4 py-2.5 text-xs font-bold text-fluent-midnight outline-none focus:ring-1 focus:ring-fluent-gold/20 transition-all font-display"
          >
            <option value="all">Every State</option>
            <option value="active">Active Challenges</option>
            <option value="completed">Completed Protocols</option>
          </select>
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="text-[10px] font-display font-medium uppercase tracking-widest text-stone-400 block mb-2 px-1">Cohort</label>
          <select 
            value={filterBatch} 
            onChange={(e) => setFilterBatch(e.target.value)}
            className="w-full bg-white border border-black/5 rounded px-4 py-2.5 text-xs font-bold text-fluent-midnight outline-none focus:ring-1 focus:ring-fluent-gold/20 transition-all font-display"
          >
            <option value="all">All Groups</option>
            {uniqueBatches.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="text-[10px] font-display font-medium uppercase tracking-widest text-stone-400 block mb-2 px-1">Priority</label>
          <select 
            value={sortOrder} 
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full bg-white border border-black/5 rounded px-4 py-2.5 text-xs font-bold text-fluent-midnight outline-none focus:ring-1 focus:ring-fluent-gold/20 transition-all font-display"
          >
            <option value="due-soon">Urgent First</option>
            <option value="due-far">Distant First</option>
            <option value="title">Lexographical</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6 px-4">
        {filteredAndSortedAssignments.length > 0 ? (
          filteredAndSortedAssignments.map((a, i) => (
            <Card key={a.id || i} className="p-8 group hover:border-fluent-gold/30 transition-all bg-white relative cursor-pointer" onClick={() => setSelectedAssignment(a)}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
                <div className="flex gap-6 items-center">
                  <div className="w-12 h-12 bg-stone-50 rounded flex items-center justify-center text-stone-400 group-hover:bg-fluent-midnight group-hover:text-fluent-gold transition-colors">
                    <BookOpen size={24} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-serif font-bold text-fluent-ink group-hover:text-fluent-gold transition-colors leading-tight">{a.title}</h3>
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="flex items-center gap-2 text-[9px] font-display font-medium uppercase tracking-[0.1em] text-stone-400">
                        <Calendar size={12} className="text-fluent-gold" /> DUE: {a.dueDate}
                      </span>
                      <span className="flex items-center gap-2 text-[9px] font-display font-medium uppercase tracking-[0.1em] text-stone-400">
                        <Clock size={12} className="text-stone-300" /> {a.batch || "Global Cohort"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-black/5 mt-4 md:mt-0">
                  {a.status === 'completed' ? (
                    <Badge color="navy" icon={CheckCircle2}>Submitted</Badge>
                  ) : (
                    <Badge color="gold" icon={Clock}>Active Task</Badge>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 bg-stone-50 rounded-lg border border-dashed border-stone-200">
            <p className="text-stone-400 font-serif italic text-sm">No active assignments found.</p>
          </div>
        )}
      </div>

      {selectedAssignment && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-fluent-midnight/80 backdrop-blur-sm" onClick={() => setSelectedAssignment(null)}>
          <Card className="w-full max-w-2xl p-10 bg-white rounded-xl shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedAssignment(null)} className="absolute top-6 right-6 p-2 rounded hover:bg-stone-100 transition-colors">
              <X size={20} className="text-stone-400" />
            </button>
            <div className="space-y-6">
              <div className="text-[10px] font-display font-medium uppercase tracking-[0.3em] text-stone-400">Assignment Specification</div>
              <h2 className="text-3xl font-serif font-bold text-fluent-ink tracking-tight">{selectedAssignment.title}</h2>
              <p className="text-stone-600 leading-relaxed font-serif italic">{selectedAssignment.description || "No description provided for this assignment."}</p>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-5 bg-stone-50 rounded border border-black/5">
                    <div className="text-[9px] font-display font-medium text-stone-400 uppercase tracking-widest mb-2">Final Submission</div>
                    <div className="font-bold text-fluent-ink font-serif text-lg">{selectedAssignment.dueDate}</div>
                 </div>
                 <div className="p-5 bg-stone-50 rounded border border-black/5">
                    <div className="text-[9px] font-display font-medium text-stone-400 uppercase tracking-widest mb-2">Current State</div>
                    <div className="font-bold text-fluent-gold font-serif text-lg uppercase tracking-tight">{selectedAssignment.status || 'Active'}</div>
                 </div>
              </div>

              {selectedAssignment.resources && selectedAssignment.resources.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-black/5">
                   <h4 className="text-[10px] font-display font-medium uppercase tracking-widest text-stone-400">Linked Synthesis Assets</h4>
                   <div className="grid sm:grid-cols-2 gap-3">
                   {selectedAssignment.resources.map((r: any, i:number) => (
                      <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-white border border-black/5 hover:border-fluent-gold/30 rounded transition-all group">
                        <LinkIcon size={16} className="text-fluent-gold group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-fluent-midnight">{r.name}</span>
                      </a>
                   ))}
                   </div>
                </div>
              )}

              {selectedAssignment.link && (
                <a href={selectedAssignment.link} target="_blank" rel="noopener noreferrer" className="block pt-6">
                  <Btn variant="primary" size="lg" icon={ExternalLink} className="w-full">Initialize Synthesis Protocol</Btn>
                </a>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
