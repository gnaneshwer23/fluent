import React, { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp, query, where, collectionGroup, onSnapshot } from "firebase/firestore";
import { db, auth } from "../lib/firebaseInit";
import { handleFirestoreError, OperationType } from "../lib/errorHandling";
import { Card, Btn, Avatar } from "./UI";
import { User, Target, TrendingUp, MessageSquare, ShieldCheck, Zap, ChevronDown } from "lucide-react";
import { checkAndCreateAlerts, checkTeacherIssues, calculateTeacherGrowth } from "../lib/alertEngine";
import { triggerWhatsApp } from "../lib/communicationService";

export default function TeacherReports() {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [data, setData] = useState({
    studentId: "",
    parentEmail: "",
    week: "Week 1 - May 2026",
    marks: "",
    confidenceScore: "7",
    participationScore: "8",
    strengths: "",
    weaknesses: "",
    confidenceNote: "",
    communicationNote: "",
    teacherComment: "",
    actionPlan: "",
    attendance: "Present"
  });

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collectionGroup(db, 'students'), where('teacherId', '==', auth.currentUser.uid));
    const unsub = onSnapshot(q, (snap) => {
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'students');
    });
    return () => unsub();
  }, []);

  const handleStudentSelect = (studentId: string) => {
    const selected = students.find(s => s.id === studentId);
    setData({
      ...data,
      studentId,
      parentEmail: selected?.parentEmail || ""
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.studentId || !data.parentEmail || !data.marks) return;

    setLoading(true);
    try {
      const selectedStudent = students.find(s => s.id === data.studentId);
      const reportData = {
        ...data,
        studentName: selectedStudent?.name || "Student",
        teacherId: auth.currentUser?.uid,
        schoolId: selectedStudent?.schoolId || null,
        marks: Number(data.marks),
        confidenceScore: Number(data.confidenceScore),
        participationScore: Number(data.participationScore),
        date: new Date().toISOString().split('T')[0],
        createdAt: serverTimestamp()
      };
      
      await addDoc(collection(db, "weeklyReports"), reportData);
      
      // Also add to generic progress collection for student dashboard
      await addDoc(collection(db, "progress"), {
        studentId: data.studentId,
        teacherId: auth.currentUser?.uid,
        schoolId: selectedStudent?.schoolId || null,
        topic: `Weekly Review: ${data.week}`,
        marks: Number(data.marks),
        feedback: data.teacherComment,
        confidence: Number(data.confidenceScore),
        createdAt: serverTimestamp()
      });

      // TRIGGER ALERT SYSTEM
      await checkAndCreateAlerts(reportData);
      await checkTeacherIssues(auth.currentUser?.uid || "system");
      await calculateTeacherGrowth(auth.currentUser?.uid || "system");

      // TRIGGER WHATSAPP NOTIFICATION TO PARENT
      await triggerWhatsApp(data.parentEmail, "weekly_report_ready", {
        studentId: data.studentId,
        marks: data.marks,
        week: data.week
      });

      setData({
        studentId: "",
        parentEmail: "",
        week: "Week 1 - May 2026",
        marks: "",
        confidenceScore: "7",
        participationScore: "8",
        strengths: "",
        weaknesses: "",
        confidenceNote: "",
        communicationNote: "",
        teacherComment: "",
        actionPlan: "",
        attendance: "Present"
      });
      alert("Report Published to Parents & Notification Sent ✅");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "weeklyReports");
    } finally {
      setLoading(false);
    }
  };

  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkData, setBulkData] = useState("");

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkData.trim()) return;

    setLoading(true);
    try {
      // Expected format: Student Name, Marks, Grade/Week
      // Example: John Doe, 85, Week 1
      const lines = bulkData.split("\n").filter(l => l.trim() !== "");
      let successCount = 0;

      for (const line of lines) {
        const [name, marks, week] = line.split(",").map(s => s.trim());
        if (!name || !marks) continue;

        const student = students.find(s => s.name.toLowerCase().includes(name.toLowerCase()));
        if (!student) continue;

        const reportData = {
          studentId: student.id,
          studentName: student.name,
          parentEmail: student.parentEmail || "",
          week: week || data.week,
          marks: Number(marks),
          confidenceScore: 7, // Default
          participationScore: 8, // Default
          strengths: "Bulk uploaded",
          weaknesses: "Bulk uploaded",
          confidenceNote: "Standard assessment",
          communicationNote: "Standard participation",
          teacherComment: "Academic performance verified via bulk processing.",
          actionPlan: "Continue standard curriculum nodes.",
          attendance: "Present",
          date: new Date().toISOString().split("T")[0],
          createdAt: serverTimestamp()
        };

        await addDoc(collection(db, "weeklyReports"), reportData);
        await addDoc(collection(db, "progress"), {
          studentId: student.id,
          topic: `Weekly Review: ${reportData.week}`,
          marks: Number(marks),
          feedback: reportData.teacherComment,
          confidence: 7,
          createdAt: serverTimestamp()
        });

        await checkAndCreateAlerts(reportData);
        successCount++;
      }

      alert(`Success: ${successCount} reports synthesised and published.`);
      setBulkData("");
      setShowBulkUpload(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "weeklyReports (bulk)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <div className="text-[10px] font-black text-fluent-gold uppercase tracking-[0.6em] mb-4 font-mono">Accountability Protocol</div>
          <h2 className="text-5xl font-serif font-bold text-fluent-navy">Synthesise Feedback</h2>
          <p className="text-slate-400 mt-2 italic font-serif text-sm">Your insights are the primary bridge between the academy and the home.</p>
        </div>
        <div className="flex gap-2">
          <Btn 
            variant={showBulkUpload ? "outline" : "gold"} 
            size="sm" 
            className="text-[9px] px-6"
            onClick={() => setShowBulkUpload(!showBulkUpload)}
          >
            {showBulkUpload ? "CANCEL" : "BULK UPLOAD"}
          </Btn>
        </div>
      </div>

      {showBulkUpload ? (
        <Card className="p-12 border-fluent-gold/20 bg-fluent-gold/[0.02] shadow-2xl rounded-[40px] border-dashed border-2">
           <div className="text-center mb-8">
              <h3 className="text-2xl font-serif font-bold text-fluent-navy">Batch Synthesis Portal</h3>
              <p className="text-xs text-slate-500 mt-1">Format: <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">Student Name, Marks, Week</span> (one per line)</p>
           </div>
           
           <form onSubmit={handleBulkSubmit} className="space-y-6">
              <textarea 
                className="w-full h-64 p-8 bg-white border border-black/5 rounded-[32px] font-mono text-xs focus:ring-2 focus:ring-fluent-gold/20 outline-none resize-none shadow-inner"
                placeholder="John Doe, 85, Week 1\nSarah Smith, 92, Week 1..."
                value={bulkData}
                onChange={(e) => setBulkData(e.target.value)}
              />
              <div className="flex justify-center">
                 <Btn 
                   type="submit" 
                   variant="gold" 
                   className="px-20 py-6 text-[10px] font-black tracking-widest"
                   disabled={loading || !bulkData.trim()}
                 >
                   {loading ? "PROCESSING..." : "EXECUTE BATCH UPLOAD"}
                 </Btn>
              </div>
           </form>
        </Card>
      ) : (
        <Card className="p-12 border-black/5 bg-white shadow-2xl relative overflow-hidden rounded-[40px]">
        <div className="absolute top-0 right-0 p-12 opacity-5 -rotate-12 pointer-events-none">
          <ShieldCheck size={200} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Select Student</label>
              <div className="relative">
                <select
                  required
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-fluent-teal/20 transition-all font-bold text-fluent-navy appearance-none"
                  value={data.studentId}
                  onChange={(e) => handleStudentSelect(e.target.value)}
                >
                  <option value="">Choose scholar...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.className})</option>
                  ))}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Parent Email / Contact</label>
              <input
                required
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-fluent-teal/20 transition-all font-bold text-fluent-navy"
                placeholder="parent@email.com"
                value={data.parentEmail}
                onChange={(e) => setData({...data, parentEmail: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Evaluation Period</label>
              <select
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none transition-all font-bold text-fluent-navy"
                value={data.week}
                onChange={(e) => setData({...data, week: e.target.value})}
              >
                <option>Week 1 - May 2026</option>
                <option>Week 2 - May 2026</option>
                <option>Week 3 - May 2026</option>
                <option>Week 4 - May 2026</option>
              </select>
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Mastery Score (%)</label>
               <input
                 required
                 type="number"
                 className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-fluent-teal/20 transition-all font-bold text-fluent-navy"
                 placeholder="85"
                 value={data.marks}
                 onChange={(e) => setData({...data, marks: e.target.value})}
               />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Attendance</label>
               <select
                 className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-fluent-teal/20 transition-all font-bold text-fluent-navy"
                 value={data.attendance}
                 onChange={(e) => setData({...data, attendance: e.target.value})}
               >
                 <option>Present</option>
                 <option>Absent</option>
                 <option>Excused</option>
               </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 p-8 bg-slate-50/50 rounded-[40px] border border-slate-100">
             <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-4 px-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-fluent-navy">Confidence Metric</label>
                    <span className="text-2xl font-serif font-bold text-fluent-teal">{data.confidenceScore}<span className="text-xs text-slate-300">/10</span></span>
                  </div>
                  <input 
                    type="range" min="1" max="10" 
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-fluent-teal"
                    value={data.confidenceScore}
                    onChange={(e) => setData({...data, confidenceScore: e.target.value})}
                  />
                </div>
                <textarea
                  className="w-full p-5 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-fluent-teal/20 transition-all text-sm h-28 resize-none font-medium"
                  placeholder="Nuanced confidence feedback..."
                  value={data.confidenceNote}
                  onChange={(e) => setData({...data, confidenceNote: e.target.value})}
                />
             </div>

             <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-4 px-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-fluent-navy">Articulation Score</label>
                    <span className="text-2xl font-serif font-bold text-fluent-gold">{data.participationScore}<span className="text-xs text-slate-300">/10</span></span>
                  </div>
                  <input 
                    type="range" min="1" max="10" 
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-fluent-gold"
                    value={data.participationScore}
                    onChange={(e) => setData({...data, participationScore: e.target.value})}
                  />
                </div>
                <textarea
                  className="w-full p-5 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-fluent-gold/20 transition-all text-sm h-28 resize-none font-medium"
                  placeholder="Oral participation & enunciation notes..."
                  value={data.communicationNote}
                  onChange={(e) => setData({...data, communicationNote: e.target.value})}
                />
             </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 px-1">
                <Target size={14} className="text-green-500" /> Executive Strengths
              </label>
              <textarea
                className="w-full p-6 bg-green-50/50 border border-green-100 rounded-[32px] outline-none focus:ring-2 focus:ring-green-500/20 transition-all font-bold text-fluent-navy h-32 resize-none"
                placeholder="What did they master this week?"
                value={data.strengths}
                onChange={(e) => setData({...data, strengths: e.target.value})}
              />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 px-1">
                <TrendingUp size={14} className="text-red-500" /> Scaffolding Gaps
              </label>
              <textarea
                className="w-full p-6 bg-red-50/50 border border-red-100 rounded-[32px] outline-none focus:ring-2 focus:ring-red-500/20 transition-all font-bold text-fluent-navy h-32 resize-none"
                placeholder="Where should they focus now?"
                value={data.weaknesses}
                onChange={(e) => setData({...data, weaknesses: e.target.value})}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 px-1">
                <MessageSquare size={14} className="text-fluent-navy" /> Academy Provost's Log
              </label>
              <textarea
                className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[32px] outline-none focus:ring-2 focus:ring-fluent-navy/20 transition-all font-bold text-fluent-navy h-32 resize-none italic"
                placeholder="Detailed synthesis for the guardians..."
                value={data.teacherComment}
                onChange={(e) => setData({...data, teacherComment: e.target.value})}
              />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 px-1 text-fluent-gold">
                <Zap size={14} /> Corrective Action Plan
              </label>
              <textarea
                className="w-full p-6 bg-fluent-gold/10 border border-fluent-gold/20 rounded-[32px] outline-none focus:ring-2 focus:ring-fluent-gold/30 transition-all font-bold text-fluent-navy h-32 resize-none"
                placeholder="Required protocol for next phase..."
                value={data.actionPlan}
                onChange={(e) => setData({...data, actionPlan: e.target.value})}
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-end items-center gap-6 pt-6 border-t border-black/5">
             <Btn 
                type="submit" 
                variant="primary" 
                className="px-20 py-7 rounded-full font-black uppercase tracking-[0.3em] bg-fluent-navy text-white text-[10px] shadow-2xl shadow-fluent-navy/30 hover:scale-105 transition-all w-full md:w-auto"
                disabled={loading}
              >
                {loading ? "TRANSMITTING..." : "PUBLISH SYNTHESIS REPORT"}
              </Btn>
          </div>
        </form>
      </Card>
      )}
    </div>
  );
}
