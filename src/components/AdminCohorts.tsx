import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Search, Edit2, Trash2, Filter, 
  BarChart3, GraduationCap, Calendar, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, query, where, onSnapshot, doc, 
  addDoc, deleteDoc, updateDoc, serverTimestamp, orderBy 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebaseInit';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';
import { Card, Badge, Btn, Avatar, MetricTile } from './UI';

export default function AdminCohorts({ schoolId }: { schoolId?: string }) {
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCohort, setEditingCohort] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState("All");
  const [subjectFilter, setSubjectFilter] = useState("All");

  useEffect(() => {
    let q = query(collection(db, 'cohorts'), orderBy('createdAt', 'desc'));
    
    if (schoolId && schoolId !== 'all') {
      q = query(collection(db, 'cohorts'), where('schoolId', '==', schoolId), orderBy('createdAt', 'desc'));
    }

    const unsub = onSnapshot(q, (snap) => {
      setCohorts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'cohorts'));

    return () => unsub();
  }, [schoolId]);

  const handleCreateCohort = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newCohort = {
      name: formData.get('name') as string,
      grade: formData.get('grade') as string,
      subject: formData.get('subject') as string,
      schoolId: schoolId !== 'all' ? schoolId : (formData.get('schoolId') as string || ""),
      tutorId: formData.get('tutorId') as string || "", // Admin might assign a tutor
      students: 0,
      avgScore: 0,
      attendance: 0,
      createdAt: serverTimestamp()
    };

    try {
      await addDoc(collection(db, 'cohorts'), newCohort);
      setShowCreateModal(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'cohorts');
    }
  };

  const handleUpdateCohort = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCohort) return;
    const formData = new FormData(e.currentTarget);
    try {
      await updateDoc(doc(db, 'cohorts', editingCohort.id), {
        name: formData.get('name') as string,
        grade: formData.get('grade') as string,
        subject: formData.get('subject') as string,
      });
      setEditingCohort(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `cohorts/${editingCohort.id}`);
    }
  };

  const deleteCohort = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this cohort? This action cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, 'cohorts', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `cohorts/${id}`);
    }
  };

  const filteredCohorts = cohorts.filter(c => {
    const matchesSearch = c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = gradeFilter === "All" || c.grade === gradeFilter;
    const matchesSubject = subjectFilter === "All" || c.subject === subjectFilter;
    return matchesSearch && matchesGrade && matchesSubject;
  });

  if (loading) return <div className="p-20 text-center animate-pulse text-slate-400 font-serif italic text-lg">Scanning institutional cohorts...</div>;

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-serif font-bold text-fluent-navy">Cohort Registry</h2>
          <p className="text-slate-400 mt-2 text-[10px] font-black uppercase tracking-widest">Global management of academic synthesis nodes</p>
        </div>
        <Btn variant="primary" size="sm" icon={Plus} onClick={() => setShowCreateModal(true)}>New Cohort</Btn>
      </div>

      {/* Metrics Section */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricTile label="Active Cohorts" value={cohorts.length.toString()} icon={Users} color="#1B4F5E" />
        <MetricTile label="Total Scholars" value={cohorts.reduce((sum, c) => sum + (c.students || 0), 0).toString()} icon={GraduationCap} color="#C9A84C" />
        <MetricTile label="Avg Engagement" value="88%" icon={BarChart3} color="#10B981" />
        <MetricTile label="Node Health" value="Optimal" icon={Clock} color="#7C3AED" />
      </div>

      {/* Filters & Search */}
      <Card className="p-6 bg-white border-black/5 shadow-xl flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-fluent-teal transition-colors" />
          <input 
            placeholder="Search cohorts by name or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-2xl text-xs font-bold outline-none focus:bg-white transition-all shadow-inner"
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={gradeFilter} 
            onChange={(e) => setGradeFilter(e.target.value)}
            className="p-3 bg-white border rounded-xl text-xs font-bold text-fluent-navy outline-none"
          >
            <option value="All">All Grades</option>
            {["Grade 9", "Grade 10", "Grade 11", "Grade 12"].map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <select 
            value={subjectFilter} 
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="p-3 bg-white border rounded-xl text-xs font-bold text-fluent-navy outline-none"
          >
            <option value="All">All Subjects</option>
            {["Mathematics", "Physics", "Chemistry", "Biology", "English"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </Card>

      {/* Grid View */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredCohorts.map((cohort) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={cohort.id}
            >
              <Card className="p-8 h-full flex flex-col group hover:shadow-2xl transition-all border-black/5">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-fluent-navy/5 flex items-center justify-center text-fluent-navy group-hover:bg-fluent-navy group-hover:text-white transition-all">
                    <Users size={24} />
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditingCohort(cohort)} className="p-2 text-slate-400 hover:text-fluent-teal"><Edit2 size={16} /></button>
                    <button onClick={() => deleteCohort(cohort.id)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                  </div>
                </div>
                <h3 className="text-xl font-serif font-bold text-fluent-navy mb-2">{cohort.name}</h3>
                <div className="flex gap-2 mb-8">
                  <Badge color="navy">{cohort.grade}</Badge>
                  <Badge color="gold">{cohort.subject}</Badge>
                </div>
                <div className="mt-auto space-y-4 pt-6 border-t border-black/5">
                   <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>Enrollment</span>
                      <span className="text-fluent-navy">{cohort.students || 0} / 30</span>
                   </div>
                   <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-fluent-teal" style={{ width: `${((cohort.students || 0) / 30) * 100}%` }} />
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400">Node Performance</span>
                      <span className="text-sm font-serif font-bold text-fluent-teal">{cohort.avgScore || 0}%</span>
                   </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredCohorts.length === 0 && (
          <div className="col-span-full py-20 text-center">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users size={40} className="text-slate-200" />
             </div>
             <p className="text-slate-400 font-serif italic text-lg">No cohorts identified for the current filters.</p>
             <Btn variant="outline" size="sm" className="mt-6" onClick={() => { setSearchTerm(""); setGradeFilter("All"); setSubjectFilter("All"); }}>Reset Filters</Btn>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(showCreateModal || editingCohort) && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-fluent-navy/60 backdrop-blur-md" 
              onClick={() => { setShowCreateModal(false); setEditingCohort(null); }} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] p-12 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <Users size={200} />
              </div>
              
              <div className="relative z-10">
                <h2 className="text-3xl font-serif font-bold text-fluent-navy mb-2">
                  {editingCohort ? "Edit Synthesis Node" : "Initialize New Cohort"}
                </h2>
                <p className="text-slate-500 text-sm mb-10">Define the parameters for this academic grouping.</p>
                
                <form onSubmit={editingCohort ? handleUpdateCohort : handleCreateCohort} className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block px-1">Cohort Designation</label>
                    <input 
                      name="name" 
                      required
                      defaultValue={editingCohort?.name}
                      placeholder="e.g. Physics A1 - 2026"
                      className="w-full p-4 bg-slate-50 border border-black/5 rounded-2xl font-bold text-fluent-navy outline-none focus:bg-white focus:ring-4 focus:ring-fluent-teal/5 transition-all" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block px-1">Grade Level</label>
                      <select 
                        name="grade" 
                        required
                        defaultValue={editingCohort?.grade}
                        className="w-full p-4 bg-slate-50 border border-black/5 rounded-2xl font-bold text-fluent-navy outline-none focus:bg-white transition-all appearance-none cursor-pointer"
                      >
                        {["Grade 9", "Grade 10", "Grade 11", "Grade 12"].map(g => <option key={g}>{g}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block px-1">Subject Domain</label>
                      <select 
                        name="subject" 
                        required
                        defaultValue={editingCohort?.subject}
                        className="w-full p-4 bg-slate-50 border border-black/5 rounded-2xl font-bold text-fluent-navy outline-none focus:bg-white transition-all appearance-none cursor-pointer"
                      >
                        {["Mathematics", "Physics", "Chemistry", "Biology", "English"].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  {!editingCohort && schoolId === 'all' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block px-1">Assign to School ID</label>
                      <input 
                        name="schoolId" 
                        placeholder="School UID (e.g. ST-MARYS-01)"
                        className="w-full p-4 bg-slate-50 border border-black/5 rounded-2xl font-bold text-fluent-navy outline-none focus:bg-white transition-all" 
                      />
                    </div>
                  )}

                  {!editingCohort && (
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block px-1">Faculty Lead (Tutor UID)</label>
                        <input 
                          name="tutorId" 
                          placeholder="Faculty Member UID"
                          className="w-full p-4 bg-slate-50 border border-black/5 rounded-2xl font-bold text-fluent-navy outline-none focus:bg-white transition-all" 
                        />
                      </div>
                  )}

                  <div className="pt-4 flex gap-4">
                    <Btn 
                      type="button" 
                      variant="outline" 
                      className="flex-1 py-4" 
                      onClick={() => { setShowCreateModal(false); setEditingCohort(null); }}
                    >
                      Cancel
                    </Btn>
                    <Btn type="submit" variant="primary" className="flex-1 py-4 shadow-xl shadow-fluent-teal/20">
                      {editingCohort ? "Commit Changes" : "Initialize Node"}
                    </Btn>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
