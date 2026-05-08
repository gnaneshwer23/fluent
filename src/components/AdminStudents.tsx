import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebaseInit";
import { handleFirestoreError, OperationType } from "../lib/errorHandling";
import { Card, Btn, Badge, Avatar, Modal } from "./UI";
import { Search, GraduationCap, TrendingUp, ShieldAlert, Trash2, Edit3, UserCheck, AlertCircle } from "lucide-react";

export default function AdminStudents({ schoolId }: { schoolId?: string }) {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    let q = query(collection(db, "users"), where("role", "==", "student"));
    if (schoolId && schoolId !== 'all') {
      q = query(collection(db, "users"), where("role", "==", "student"), where("schoolId", "==", schoolId));
    }
    
    const unsub = onSnapshot(q, (snap) => {
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "users/students"));
    
    return () => unsub();
  }, [schoolId]);

  const deleteUser = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'users', id));
      setShowDeleteModal(false);
      setSelectedStudent(null);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `users/${id}`);
    }
  };

  const toggleOnboarding = async (student: any) => {
    try {
      await updateDoc(doc(db, 'users', student.id), {
        onboarded: !student.onboarded
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${student.id}`);
    }
  };

  if (loading) return <div className="flex justify-center p-20 animate-pulse text-slate-400">Loading Scholar Registry...</div>;

  return (
    <div className="space-y-8 pb-20">
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
          <Card key={s.id} className="p-8 border-black/5 bg-white group hover:border-fluent-teal/20 transition-all">
            <div className="flex justify-between items-start mb-6">
              <Avatar name={s.name} size={48} />
              <div className="flex flex-col items-end gap-2">
                <Badge color={s.onboarded ? "teal" : "gold"}>
                  {s.onboarded ? "Onboarded" : "Pending O/B"}
                </Badge>
              </div>
            </div>
            
            <h3 className="text-xl font-serif font-bold text-fluent-navy mb-1">{s.name}</h3>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
              {s.grade || "Unassigned"} :: {s.school || "Global Academy"}
            </div>

            <div className="flex flex-wrap gap-2 pt-6 border-t border-slate-50 mb-6">
               <Btn variant="outline" size="sm" className="px-3" icon={UserCheck} onClick={() => toggleOnboarding(s)}>Toggle O/B</Btn>
               <Btn variant="danger" size="sm" className="px-3" icon={Trash2} onClick={() => { setSelectedStudent(s); setShowDeleteModal(true); }}>
                  {null}
               </Btn>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-fluent-teal">
                <TrendingUp size={14} /> Performance Audit
              </div>
              <Btn variant="ghost" size="sm" icon={GraduationCap}>View Profile</Btn>
            </div>
          </Card>
        ))}
      </div>

      <Modal 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)}
        title="Institutional Removal"
      >
        <div className="space-y-6">
          <div className="p-6 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-4">
            <AlertCircle className="text-red-500 shrink-0" size={24} />
            <div>
              <p className="text-sm font-bold text-red-900">Are you sure you want to remove {selectedStudent?.name}?</p>
              <p className="text-xs text-red-700/60 mt-1">This action will permanently terminate the student's academic record and institutional access.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Btn variant="outline" className="flex-1" onClick={() => setShowDeleteModal(false)}>Cancel</Btn>
            <Btn variant="danger" className="flex-1 bg-red-600 text-white border-transparent" onClick={() => deleteUser(selectedStudent.id)}>Confirm Removal</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
