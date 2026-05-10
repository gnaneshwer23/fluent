import React, { useState, useEffect, useRef } from "react";
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, where, deleteDoc, doc, limit, writeBatch } from "firebase/firestore";
import { db, auth } from "../lib/firebaseInit";
import { handleFirestoreError, OperationType } from "../lib/errorHandling";
import { Card, Btn, Badge } from "./UI";
import { Users, PlusCircle, Link as LinkIcon, Calendar, BookOpen, Clock, CheckCircle2, ChevronRight, Trash2, Copy, ExternalLink, FileUp, FileText, Upload, AlertCircle, Check } from "lucide-react";
import Papa from "papaparse";

export default function TeacherAssignments({ mini = false, cohortId }: { mini?: boolean, cohortId?: string }) {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isBulk, setIsBulk] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterBatch, setFilterBatch] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("newest");
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkPreview, setBulkPreview] = useState<any[]>([]);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    
    // Query assignments created by this teacher, optionally filtered by cohort
    let q = query(
      collection(db, "assignments"),
      where("teacherId", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc"),
      limit(mini ? 3 : 50)
    );

    if (cohortId) {
      q = query(
        collection(db, "assignments"),
        where("teacherId", "==", auth.currentUser.uid),
        where("cohortId", "==", cohortId),
        orderBy("createdAt", "desc"),
        limit(mini ? 3 : 50)
      );
    }
    
    const unsub = onSnapshot(q, (snapshot) => {
      setAssignments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setFetching(false);
    }, (error) => {
      if (auth.currentUser) {
        handleFirestoreError(error, OperationType.LIST, "assignments");
      }
    });

    return () => unsub();
  }, [mini, cohortId]);

  const filteredAndSortedAssignments = React.useMemo(() => {
    let result = [...assignments];

    // Status Filter
    if (filterStatus !== "all") {
      result = result.filter(a => a.status === filterStatus);
    }

    // Batch Filter
    if (filterBatch !== "all") {
      result = result.filter(a => a.batch === filterBatch || a.cohortId === filterBatch);
    }

    // Sort
    result.sort((a, b) => {
      if (sortOrder === "newest") {
        return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
      }
      if (sortOrder === "oldest") {
        return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
      }
      if (sortOrder === "due-soon") {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortOrder === "due-far") {
        return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      }
      return 0;
    });

    return result;
  }, [assignments, filterStatus, filterBatch, sortOrder]);

  const uniqueBatches = React.useMemo(() => {
    const batches = assignments.map(a => a.batch || a.cohortId).filter(Boolean);
    return Array.from(new Set(batches));
  }, [assignments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.dueDate) return;
    
    setLoading(true);
    try {
      await addDoc(collection(db, "assignments"), {
        ...form,
        cohortId: cohortId || "",
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setBulkFile(file);
    setBulkError(null);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setBulkError("Parsing error: " + results.errors[0].message);
          return;
        }
        
        const data = results.data as any[];
        // Validate headers
        const required = ['title', 'dueDate'];
        const headers = results.meta.fields || [];
        const missing = required.filter(h => !headers.includes(h));
        
        if (missing.length > 0) {
          setBulkError(`Missing required columns: ${missing.join(", ")}`);
          return;
        }
        
        setBulkPreview(data);
      }
    });
  };

  const handleBulkSubmit = async () => {
    if (bulkPreview.length === 0 || !auth.currentUser) return;
    
    setLoading(true);
    try {
      const batch = writeBatch(db);
      const assignmentsRef = collection(db, "assignments");
      
      bulkPreview.forEach(item => {
        const docRef = doc(assignmentsRef);
        batch.set(docRef, {
          title: item.title || "Untitled Assignment",
          dueDate: item.dueDate || new Date().toISOString().split('T')[0],
          batch: item.batch || "",
          cohortId: cohortId || "",
          link: item.link || "",
          teacherId: auth.currentUser?.uid,
          status: "active",
          createdAt: serverTimestamp()
        });
      });
      
      await batch.commit();
      setBulkFile(null);
      setBulkPreview([]);
      setIsBulk(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "assignments (bulk)");
    } finally {
      setLoading(false);
    }
  };

  if (mini) {
    return (
      <div className="divide-y divide-black/5">
        {fetching ? (
          <div className="p-10 text-center animate-pulse text-[10px] font-black text-stone-600 uppercase tracking-widest">Synchronising Ledger...</div>
        ) : assignments.length === 0 ? (
          <div className="p-10 text-center text-[10px] font-black text-stone-600 uppercase tracking-widest italic">No active challenges found</div>
        ) : (
          assignments.map((a) => (
            <div key={a.id} className="p-6 flex justify-between items-center hover:bg-gray-50 transition-colors">
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-stone-600">
                  <BookOpen size={16} />
                </div>
                <div>
                  <div className="text-sm font-bold text-fluent-navy leading-tight">{a.title}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-black text-stone-700 uppercase tracking-tighter">{a.batch || "General"}</span>
                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                    <span className={`text-[9px] font-black uppercase ${new Date(a.dueDate) < new Date() ? 'text-red-600' : 'text-stone-700'}`}>
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
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-serif font-black text-fluent-navy tracking-tight">Issue Assignment</h2>
              <p className="text-stone-800 mt-2 text-sm italic font-serif font-bold">Distribute logic challenges to specific scholar cohorts.</p>
            </div>
            <Btn 
              variant="outline" 
              size="sm" 
              icon={isBulk ? PlusCircle : FileUp} 
              onClick={() => setIsBulk(!isBulk)}
              className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 h-auto rounded-full border-black/5 bg-white shadow-sm"
            >
              {isBulk ? "Single Mode" : "Bulk Upload"}
            </Btn>
          </div>

          <Card className="p-8 border-black/5 bg-white shadow-xl shadow-fluent-navy/5 rounded-[32px] overflow-hidden relative">
            {isBulk ? (
              <div className="space-y-6">
                 <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-stone-800 mb-4 px-1">Institutional Bulk Protocol</div>
                    <div 
                      className={`border-2 border-dashed rounded-[24px] p-8 text-center transition-all cursor-pointer ${
                        bulkFile ? 'border-fluent-teal bg-fluent-teal/5' : 'border-slate-100 hover:border-fluent-gold/30 hover:bg-slate-50/50'
                      }`}
                      onClick={() => fileInputRef.current?.click()}
                    >
                       <input 
                         type="file" 
                         ref={fileInputRef} 
                         onChange={handleFileChange} 
                         accept=".csv,.txt" 
                         className="hidden" 
                       />
                       {bulkFile ? (
                         <div className="space-y-3">
                            <div className="w-12 h-12 bg-fluent-teal/10 rounded-full flex items-center justify-center text-fluent-teal mx-auto">
                               <FileText size={24} />
                            </div>
                            <div className="text-sm font-bold text-fluent-navy">{bulkFile.name}</div>
                            <div className="text-[10px] text-stone-800 uppercase font-black">{bulkPreview.length} Entires Detected</div>
                         </div>
                       ) : (
                         <div className="space-y-3">
                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-stone-600 mx-auto group-hover:text-fluent-gold transition-colors">
                               <Upload size={24} />
                            </div>
                            <div className="text-sm font-bold text-stone-700">Click to Synchronise CSV/TXT</div>
                            <div className="text-[9px] text-stone-600 uppercase tracking-widest leading-relaxed font-bold">
                               Required Headers:<br /> 
                               <span className="text-stone-800 font-black">title, dueDate, batch (opt), link (opt)</span>
                            </div>
                         </div>
                       )}
                    </div>
                 </div>

                 {bulkError && (
                   <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 text-red-600">
                      <AlertCircle size={18} className="shrink-0" />
                      <div className="text-[11px] font-bold leading-relaxed">{bulkError}</div>
                   </div>
                 )}

                 {bulkPreview.length > 0 && !bulkError && (
                   <div className="space-y-4">
                      <div className="max-h-[200px] overflow-y-auto custom-scrollbar border border-black/5 rounded-2xl bg-slate-50/50 p-2">
                        {bulkPreview.map((item, i) => (
                          <div key={i} className="p-3 border-b border-black/5 last:border-0 flex justify-between items-center text-[10px] font-black">
                             <div className="text-fluent-navy truncate max-w-[120px] font-bold">{item.title}</div>
                             <div className="text-stone-700 font-bold">{item.dueDate}</div>
                          </div>
                        ))}
                      </div>
                      <Btn 
                        onClick={handleBulkSubmit}
                        variant="primary" 
                        disabled={loading}
                        className="w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-fluent-navy/20"
                      >
                        {loading ? "Committing Bulk Sequence..." : `Issue ${bulkPreview.length} Challenges`}
                      </Btn>
                   </div>
                 )}
                 
                 <div className="pt-4 border-t border-black/5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-fluent-gold/10 flex items-center justify-center text-fluent-gold shrink-0">
                       <Check size={14} />
                    </div>
                    <div className="text-[9px] text-stone-800 leading-relaxed font-serif italic font-bold">
                       "Bulk issuance respects specific cohort logic and regional date protocols."
                    </div>
                 </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-800 px-1">Challenge Title</label>
                  <div className="relative">
                    <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600" size={18} />
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
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600" size={18} />
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
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-800 px-1">Target Cohort/Batch</label>
                    <input
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-fluent-teal/20 transition-all font-bold text-fluent-navy placeholder:text-slate-300"
                      placeholder="e.g. Batch 2026-Alpha"
                      value={form.batch}
                      onChange={(e) => setForm({...form, batch: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-800 px-1">Protocol URL (Optional)</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600" size={18} />
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
            )}
          </Card>
        </div>

        {/* Right: Published List */}
        <div className="lg:col-span-3 space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-serif font-black text-fluent-navy tracking-tight">Active Registries</h2>
              <p className="text-stone-700 mt-2 text-sm italic font-serif font-bold">Currently distributed tasks across the institution.</p>
            </div>
            <Badge color="gold" className="px-4 py-1">{assignments.length} Tasks</Badge>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-3 items-center bg-slate-50/50 p-4 rounded-2xl border border-black/5">
              <div className="flex-1 min-w-[150px]">
                <label className="text-[9px] font-black uppercase tracking-widest text-stone-700 block mb-1.5 ml-1">Filter Status</label>
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full bg-white border border-black/5 rounded-xl px-4 py-2 text-[11px] font-bold text-fluent-navy outline-none focus:ring-2 focus:ring-fluent-teal/20 transition-all"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="flex-1 min-w-[150px]">
                <label className="text-[9px] font-black uppercase tracking-widest text-stone-700 block mb-1.5 ml-1">Filter Batch</label>
                <select 
                  value={filterBatch} 
                  onChange={(e) => setFilterBatch(e.target.value)}
                  className="w-full bg-white border border-black/5 rounded-xl px-4 py-2 text-[11px] font-bold text-fluent-navy outline-none focus:ring-2 focus:ring-fluent-teal/20 transition-all"
                >
                  <option value="all">All Batches</option>
                  {uniqueBatches.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-[150px]">
                <label className="text-[9px] font-black uppercase tracking-widest text-stone-700 block mb-1.5 ml-1">Sort By</label>
                <select 
                  value={sortOrder} 
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full bg-white border border-black/5 rounded-xl px-4 py-2 text-[11px] font-bold text-fluent-navy outline-none focus:ring-2 focus:ring-fluent-teal/20 transition-all"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="due-soon">Due Soon</option>
                  <option value="due-far">Due Far</option>
                </select>
              </div>
            </div>

            {fetching ? (
              <div className="py-20 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fluent-teal mx-auto" />
              </div>
            ) : filteredAndSortedAssignments.length > 0 ? (
              filteredAndSortedAssignments.map((a, i) => (
                <Card key={a.id || i} className="p-6 group hover:border-fluent-gold/20 transition-all duration-300 bg-white border-black/5 rounded-[24px]">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div className="flex gap-5 items-center">
                      <div className="w-12 h-12 bg-fluent-navy/5 rounded-xl flex items-center justify-center text-fluent-navy group-hover:bg-fluent-navy group-hover:text-white transition-all">
                        <BookOpen size={20} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-serif font-black text-fluent-navy group-hover:text-fluent-teal transition-colors leading-tight">{a.title}</h3>
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-stone-700">
                            <Users size={12} className="text-stone-600" /> {a.batch || "Global Batch"}
                          </div>
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-100" />
                          <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-red-700 bg-red-50 px-2.5 py-1 rounded-lg border border-red-100">
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
                              <Btn variant="ghost" className="p-2 h-auto text-stone-700 hover:text-fluent-teal font-bold">
                               <ExternalLink size={14} />
                             </Btn>
                           </a>
                           <div className="w-[1px] h-4 bg-slate-200 mx-1" />
                           <Btn 
                             variant="ghost" 
                             className={`p-2 h-auto transition-colors ${copiedId === a.id ? 'text-green-600' : 'text-stone-700 hover:text-fluent-teal font-bold'}`}
                             onClick={() => copyToClipboard(a.link, a.id)}
                           >
                             {copiedId === a.id ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                           </Btn>
                        </div>
                      )}

                      <Btn variant="ghost" className="p-2 h-auto text-stone-500 hover:text-red-600 transition-colors" onClick={async () => {
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
                <BookOpen size={48} className="mx-auto mb-4 text-stone-300" />
                <p className="text-stone-700 font-serif italic font-bold">No published assignments in the ledger.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

