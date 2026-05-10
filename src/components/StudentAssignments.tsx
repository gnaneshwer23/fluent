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
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-serif font-bold text-fluent-navy">My Assignments</h2>
        <Badge color="teal" className="px-4 py-1">{filteredAndSortedAssignments.length} Total</Badge>
      </div>

      <div className="flex flex-wrap gap-4 items-center bg-slate-50 p-6 rounded-[32px] border border-black/5">
        <div className="flex-1 min-w-[150px]">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2 px-1">Status</label>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-white border border-black/5 rounded-2xl px-5 py-3 text-xs font-bold text-fluent-navy outline-none focus:ring-2 focus:ring-fluent-teal/20 transition-all shadow-sm"
          >
            <option value="all">Every State</option>
            <option value="active">Active Challenges</option>
            <option value="completed">Completed Protocols</option>
          </select>
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2 px-1">Cohort</label>
          <select 
            value={filterBatch} 
            onChange={(e) => setFilterBatch(e.target.value)}
            className="w-full bg-white border border-black/5 rounded-2xl px-5 py-3 text-xs font-bold text-fluent-navy outline-none focus:ring-2 focus:ring-fluent-teal/20 transition-all shadow-sm"
          >
            <option value="all">All Groups</option>
            {uniqueBatches.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2 px-1">Priority</label>
          <select 
            value={sortOrder} 
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full bg-white border border-black/5 rounded-2xl px-5 py-3 text-xs font-bold text-fluent-navy outline-none focus:ring-2 focus:ring-fluent-teal/20 transition-all shadow-sm"
          >
            <option value="due-soon">Urgent First</option>
            <option value="due-far">Distant First</option>
            <option value="title">Lexographical</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6">
        {filteredAndSortedAssignments.length > 0 ? (
          filteredAndSortedAssignments.map((a, i) => (
            <Card key={a.id || i} className="p-10 group hover:border-fluent-teal/30 transition-all duration-500 bg-white shadow-sm border-black/5 rounded-[40px] relative overflow-hidden cursor-pointer" onClick={() => setSelectedAssignment(a)}>
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

      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedAssignment(null)}>
          <Card className="w-full max-w-2xl p-10 bg-white rounded-[40px] shadow-2xl relative" onClick={() => {}}>
            <div onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedAssignment(null)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 transition-colors">
              <X size={20} className="text-slate-400" />
            </button>
            <div className="space-y-6">
              <h2 className="text-3xl font-serif font-bold text-fluent-navy tracking-tight">{selectedAssignment.title}</h2>
              <p className="text-slate-600 leading-relaxed">{selectedAssignment.description || "No description provided for this assignment."}</p>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-slate-50 rounded-2xl">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Due Date</div>
                    <div className="font-bold text-fluent-navy">{selectedAssignment.dueDate}</div>
                 </div>
                 <div className="p-4 bg-slate-50 rounded-2xl">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</div>
                    <div className="font-bold text-fluent-teal capitalize">{selectedAssignment.status || 'Active'}</div>
                 </div>
              </div>

              {selectedAssignment.resources && selectedAssignment.resources.length > 0 && (
                <div className="space-y-3">
                   <h4 className="font-bold text-fluent-navy">Linked Resources</h4>
                   {selectedAssignment.resources.map((r: any, i:number) => (
                      <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-white border border-black/5 hover:border-fluent-teal/30 rounded-xl transition-all">
                        <LinkIcon size={16} className="text-fluent-teal" />
                        <span className="text-sm font-medium text-fluent-navy">{r.name}</span>
                      </a>
                   ))}
                </div>
              )}

              {selectedAssignment.link && (
                <a href={selectedAssignment.link} target="_blank" rel="noopener noreferrer">
                  <Btn variant="primary" size="lg" icon={ExternalLink} className="w-full rounded-2xl">Initialize Node</Btn>
                </a>
              )}
            </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
