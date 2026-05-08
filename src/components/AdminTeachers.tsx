import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebaseInit";
import { handleFirestoreError, OperationType } from "../lib/errorHandling";
import { Card, Btn, Badge, Avatar, Modal } from "./UI";
import { Search, Award, Star, ShieldCheck, Trash2, UserX, AlertTriangle, ShieldAlert } from "lucide-react";

export default function AdminTeachers({ schoolId }: { schoolId?: string }) {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    let q = query(collection(db, "users"), where("role", "==", "teacher"));
    if (schoolId && schoolId !== 'all') {
      q = query(collection(db, "users"), where("role", "==", "teacher"), where("schoolId", "==", schoolId));
    }
    
    const unsub = onSnapshot(q, (snap) => {
      setTeachers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "users/faculty"));
    return () => unsub();
  }, [schoolId]);

  const deleteFaculty = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'users', id));
      setShowDeleteModal(false);
      setSelectedTeacher(null);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `users/${id}`);
    }
  };

  if (loading) return <div className="flex justify-center p-20 animate-pulse text-slate-400">Auditing Faculty Registry...</div>;

  return (
    <div className="space-y-8 pb-20">
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
             <div key={t.id} className="p-8 flex flex-col xl:flex-row justify-between items-center hover:bg-slate-50 transition-colors gap-8">
                <div className="flex items-center gap-6 flex-1">
                   <div className="relative">
                      <Avatar name={t.name} size={64} />
                      <div className="absolute -bottom-1 -right-1 bg-fluent-gold text-white p-1 rounded-full border-2 border-white">
                         <Star size={10} className="fill-white" />
                      </div>
                   </div>
                   <div>
                      <h3 className="text-xl font-serif font-bold text-fluent-navy">{t.name}</h3>
                      <div className="flex gap-2 mt-2">
                        {t.subjects?.map((sub: string) => (
                          <span key={sub} className="text-[9px] font-black uppercase bg-white border border-black/5 px-2 py-0.5 rounded tracking-widest text-slate-500">{sub}</span>
                        ))}
                      </div>
                      <div className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-tighter italic">
                        {t.school || "Global Node"} :: Active Since {new Date().getFullYear()}
                      </div>
                   </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-12">
                   <div className="flex gap-8">
                      <div className="text-center">
                        <div className="text-xl font-serif font-bold text-fluent-navy">4.8</div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Peer Rating</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-serif font-bold text-fluent-teal">92%</div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Delivery Sync</div>
                      </div>
                   </div>
                   
                   <div className="flex gap-3">
                      <Btn variant="outline" size="sm" className="px-4">Audit</Btn>
                      <Btn variant="danger" size="sm" icon={UserX} onClick={() => { setSelectedTeacher(t); setShowDeleteModal(true); }}>Revoke</Btn>
                   </div>
                </div>
             </div>
           ))}
           {teachers.length === 0 && (
             <div className="p-20 text-center text-slate-400 font-serif italic text-lg">No synchronized faculty nodes found in this sector.</div>
           )}
        </div>
      </Card>

      <Modal 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)}
        title="Revoke Faculty Access"
      >
        <div className="space-y-6">
          <div className="p-6 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-4">
            <AlertTriangle className="text-red-500 shrink-0" size={24} />
            <div>
              <p className="text-sm font-bold text-red-900">Immediate access revocation for {selectedTeacher?.name}?</p>
              <p className="text-xs text-red-700/60 mt-1">This will disconnect the faculty node from all assigned classes and delete their historical instructional record.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Btn variant="outline" className="flex-1" onClick={() => setShowDeleteModal(false)}>Cancel</Btn>
            <Btn variant="danger" className="flex-1" onClick={() => deleteFaculty(selectedTeacher.id)}>Confirm Revocation</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
