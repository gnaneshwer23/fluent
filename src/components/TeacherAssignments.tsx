import React, { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, where, deleteDoc, doc, limit } from "firebase/firestore";
import { db, auth } from "../lib/firebaseInit";
import { handleFirestoreError, OperationType } from "../lib/errorHandling";
import { Card, Btn, Badge } from "./UI";
import { PlusCircle, Link as LinkIcon, Calendar, BookOpen, Clock, CheckCircle2, ChevronRight, Trash2, Copy, ExternalLink } from "lucide-react";

export default function TeacherAssignments({ mini = false }: { mini?: boolean }) {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };
  const [form, setForm] = useState({
    title: "",
    link: "",
    dueDate: "",
    batch: ""
  });

  useEffect(() => {
    if (!auth.currentUser) return;
    
    // Query assignments created by this teacher
    const q = query(
      collection(db, "assignments"),
      orderBy("createdAt", "desc"),
      limit(mini ? 3 : 50)
    );
    
    const unsub = onSnapshot(q, (snapshot) => {
      setAssignments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setFetching(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "assignments");
    });

    return () => unsub();
  }, [mini]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.dueDate) return;
    
    setLoading(true);
    try {
      await addDoc(collection(db, "assignments"), {
        ...form,
        teacherId: auth.currentUser?.uid,
        status: "active",
        createdAt: serverTimestamp()
      });
      setForm({ title: "", link: "", dueDate: "", batch: "" });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "assignments");
    } finally {
      setLoading(false);
    }
  };

  if (mini) {
    return (
      <div className="divide-y divide-black/5">
        {fetching ? (
          <div className="p-10 text-center animate-pulse text-[10px] font-bold text-slate-300 uppercase tracking-widest">Synchronising Ledger...</div>
        ) : assignments.length === 0 ? (
          <div className="p-10 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">No active challenges found</div>
        ) : (
          assignments.map((a) => (
            <div key={a.id} className="p-6 flex justify-between items-center hover:bg-gray-50 transition-colors">
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                  <BookOpen size={16} />
                </div>
                <div>
                  <div className="text-sm font-bold text-fluent-navy leading-tight">{a.title}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{a.batch || "General"}</span>
                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                    <span className={`text-[9px] font-bold uppercase ${new Date(a.dueDate) < new Date() ? 'text-red-500' : 'text-slate-400'}`}>
                      {a.dueDate}
                    </span>
                  </div>
                </div>
              </div>
              <Badge color={a.status === 'active' ? 'teal' : 'gray'} className="text-[9px] px-2 py-0.5">
                {a.status?.toUpperCase() || 'ACTIVE'}
              </Badge>
            </div>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <div className="grid lg:grid-cols-5 gap-12">
        {/* Left: Create Form */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-3xl font-serif font-black text-fluent-navy tracking-tight">Issue Assignment</h2>
            <p className="text-slate-500 mt-2 text-sm italic font-serif">Distribute logic challenges to specific scholar cohorts.</p>
          </div>

          <Card className="p-8 border-black/5 bg-white shadow-xl shadow-fluent-navy/5 rounded-[32px]">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Challenge Title</label>
                <div className="relative">
                  <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    required
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-fluent-teal/20 transition-all font-bold text-fluent-navy placeholder:text-slate-300"
                    placeholder="e.g. Quantum Logic Sync I"
                    value={form.title}
                    onChange={(e) => setForm({...form, title: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Due Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input
                      type="date"
                      required
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-fluent-teal/20 transition-all font-bold text-fluent-navy"
                      value={form.dueDate}
                      onChange={(e) => setForm({...form, dueDate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Target Cohort/Batch</label>
                  <input
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-fluent-teal/20 transition-all font-bold text-fluent-navy placeholder:text-slate-300"
                    placeholder="e.g. Batch 2026-Alpha"
                    value={form.batch}
                    onChange={(e) => setForm({...form, batch: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Protocol URL (Optional)</label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-fluent-teal/20 transition-all font-bold text-fluent-navy placeholder:text-slate-300"
                    placeholder="https://resource.ac.uk/..."
                    value={form.link}
                    onChange={(e) => setForm({...form, link: e.target.value})}
                  />
                </div>
              </div>

              <Btn 
                type="submit" 
                variant="primary" 
                className="w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-fluent-navy/20"
                disabled={loading}
              >
                {loading ? "Synchronizing..." : "Publish to Registry"}
              </Btn>
            </form>
          </Card>
        </div>

        {/* Right: Published List */}
        <div className="lg:col-span-3 space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-serif font-black text-fluent-navy tracking-tight">Active Registries</h2>
              <p className="text-slate-500 mt-2 text-sm italic font-serif">Currently distributed tasks across the institution.</p>
            </div>
            <Badge color="gold" className="px-4 py-1">{assignments.length} Tasks</Badge>
          </div>

          <div className="space-y-4">
            {fetching ? (
              <div className="py-20 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fluent-teal mx-auto" />
              </div>
            ) : assignments.length > 0 ? (
              assignments.map((a, i) => (
                <Card key={a.id || i} className="p-6 group hover:border-fluent-gold/20 transition-all duration-300 bg-white border-black/5 rounded-[24px]">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div className="flex gap-5 items-center">
                      <div className="w-12 h-12 bg-fluent-navy/5 rounded-xl flex items-center justify-center text-fluent-navy group-hover:bg-fluent-navy group-hover:text-white transition-all">
                        <BookOpen size={20} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-serif font-black text-fluent-navy group-hover:text-fluent-teal transition-colors leading-tight">{a.title}</h3>
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400">
                            <Users size={12} className="text-slate-300" /> {a.batch || "Global Batch"}
                          </div>
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-100" />
                          <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-red-500/80 bg-red-50 px-2.5 py-1 rounded-lg border border-red-100/50">
                            <Calendar size={12} /> DUE: {a.dueDate}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                       <Badge 
                         color={a.status === 'active' ? 'teal' : 'gold'} 
                         className={`flex items-center gap-2 px-4 py-2 rounded-full font-black uppercase tracking-widest text-[9px] shadow-sm ${
                           a.status === 'active' 
                             ? 'bg-fluent-teal text-white border-transparent' 
                             : 'bg-fluent-gold/10 text-fluent-gold border-fluent-gold/20'
                         }`}
                       >
                         {a.status === 'active' ? <Clock size={10} /> : <CheckCircle2 size={10} />}
                         {a.status?.toUpperCase() || 'ACTIVE'}
                       </Badge>

                       {a.link && (
                         <div className="flex items-center bg-slate-50 rounded-2xl p-1 border border-slate-100">
                            <a href={a.link} target="_blank" rel="noopener noreferrer" title="View Protocol">
                              <Btn variant="ghost" className="p-2 h-auto text-slate-400 hover:text-fluent-teal">
                                <ExternalLink size={14} />
                              </Btn>
                            </a>
                            <div className="w-[1px] h-4 bg-slate-200 mx-1" />
                            <Btn 
                              variant="ghost" 
                              className={`p-2 h-auto transition-colors ${copiedId === a.id ? 'text-green-500' : 'text-slate-400 hover:text-fluent-teal'}`}
                              onClick={() => copyToClipboard(a.link, a.id)}
                              title="Copy Protocol URL"
                            >
                              {copiedId === a.id ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                            </Btn>
                         </div>
                       )}

                       <Btn variant="ghost" className="p-2 h-auto text-slate-300 hover:text-red-400 transition-colors" onClick={async () => {
                         if (window.confirm("Archive this assignment?")) {
                           try {
                             await deleteDoc(doc(db, "assignments", a.id));
                           } catch (e) {
                             handleFirestoreError(e, OperationType.DELETE, "assignments");
                           }
                         }
                       }}>
                         <Trash2 size={16} />
                       </Btn>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-20 bg-slate-50/50 rounded-[40px] border border-dashed border-slate-200">
                <BookOpen size={48} className="mx-auto mb-4 text-slate-200" />
                <p className="text-slate-400 font-serif italic">No published assignments in the ledger.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

