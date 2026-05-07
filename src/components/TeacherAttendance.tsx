import React, { useState, useEffect } from "react";
import { collection, query, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebaseInit";
import { handleFirestoreError, OperationType } from "../lib/errorHandling";
import { Card, Btn, Avatar, Badge } from "./UI";
import { Users, CalendarDays, CheckCircle, XCircle } from "lucide-react";

import { checkAttendanceAlerts } from "../lib/alertEngine";

export default function TeacherAttendance() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "students"));
    const unsub = onSnapshot(q, (snap) => {
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "students"));
    return () => unsub();
  }, []);

  const markAttendance = async (studentId: string, status: string) => {
    try {
      await addDoc(collection(db, "attendance"), {
        studentId,
        status,
        date: new Date().toISOString().split('T')[0],
        createdAt: serverTimestamp()
      });
      
      // Trigger attendance alert check
      if (status === "Absent") {
        await checkAttendanceAlerts(studentId);
      }
      
      alert(`Marked ${status} for scholar.`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "attendance");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fluent-teal" />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-serif font-bold text-fluent-navy">Roll Call Node</h2>
          <p className="text-slate-400 mt-1 uppercase text-[10px] font-black tracking-widest">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>
        <Badge color="teal" icon={Users}>{students.length} Scholars</Badge>
      </div>

      <div className="grid gap-4">
        {students.map((s) => (
          <Card key={s.id} className="p-6 flex items-center justify-between group hover:border-fluent-teal/20 transition-all">
             <div className="flex items-center gap-6">
                <Avatar name={s.name} size={48} />
                <div>
                   <h3 className="font-serif font-bold text-lg text-fluent-navy">{s.name}</h3>
                   <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.batch || "Standard Batch"}</div>
                </div>
             </div>
             <div className="flex items-center gap-3">
                <button 
                  onClick={() => markAttendance(s.id, "Present")}
                  className="p-3 rounded-xl bg-green-50 text-green-600 hover:bg-green-500 hover:text-white transition-all"
                  title="Mark Present"
                >
                  <CheckCircle size={20} />
                </button>
                <button 
                  onClick={() => markAttendance(s.id, "Absent")}
                  className="p-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                  title="Mark Absent"
                >
                  <XCircle size={20} />
                </button>
             </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
