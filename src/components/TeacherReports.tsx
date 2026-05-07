import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../lib/firebaseInit";
import { handleFirestoreError, OperationType } from "../lib/errorHandling";
import { Card, Btn } from "./UI";
import { User, Target, TrendingUp, MessageSquare, ShieldCheck, Zap } from "lucide-react";
import { checkAndCreateAlerts, checkTeacherIssues, calculateTeacherGrowth } from "../lib/alertEngine";
import { triggerWhatsApp } from "../lib/communicationService";

export default function TeacherReports() {
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.studentId || !data.parentEmail || !data.marks) return;

    setLoading(true);
    try {
      const reportData = {
        ...data,
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

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="text-center">
        <div className="text-[10px] font-black text-fluent-gold uppercase tracking-[0.6em] mb-4">Accountability Protocol</div>
        <h2 className="text-4xl font-serif font-bold text-fluent-navy">Synthesise Weekly Feedback</h2>
        <p className="text-slate-400 mt-2 italic">Your insights are the primary bridge between the academy and the home.</p>
      </div>

      <Card className="p-12 border-black/5 bg-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 -rotate-12 pointer-events-none">
          <ShieldCheck size={200} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Student UID</label>
              <input
                required
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-fluent-teal/20 transition-all font-medium"
                placeholder="e.g. st_12345"
                value={data.studentId}
                onChange={(e) => setData({...data, studentId: e.target.value})}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Parent Email</label>
              <input
                required
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-fluent-teal/20 transition-all font-medium"
                placeholder="parent@email.com"
                value={data.parentEmail}
                onChange={(e) => setData({...data, parentEmail: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Academic Score (%)</label>
              <input
                required
                type="number"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-fluent-teal/20 transition-all font-medium"
                placeholder="85"
                value={data.marks}
                onChange={(e) => setData({...data, marks: e.target.value})}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 p-8 bg-slate-50/50 rounded-[32px] border border-slate-100">
             <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-fluent-navy">Confidence Metric</label>
                    <span className="text-xl font-serif font-bold text-fluent-teal">{data.confidenceScore}/10</span>
                  </div>
                  <input 
                    type="range" min="1" max="10" 
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-fluent-teal"
                    value={data.confidenceScore}
                    onChange={(e) => setData({...data, confidenceScore: e.target.value})}
                  />
                </div>
                <textarea
                  className="w-full p-4 bg-white border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-fluent-teal/20 transition-all text-sm h-24 resize-none"
                  placeholder="Confidence feedback (e.g. Hesitant while answering)"
                  value={data.confidenceNote}
                  onChange={(e) => setData({...data, confidenceNote: e.target.value})}
                />
             </div>

             <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-fluent-navy">Participation Score</label>
                    <span className="text-xl font-serif font-bold text-fluent-gold">{data.participationScore}/10</span>
                  </div>
                  <input 
                    type="range" min="1" max="10" 
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-fluent-gold"
                    value={data.participationScore}
                    onChange={(e) => setData({...data, participationScore: e.target.value})}
                  />
                </div>
                <textarea
                  className="w-full p-4 bg-white border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-fluent-gold/20 transition-all text-sm h-24 resize-none"
                  placeholder="Communication & Enunciation notes..."
                  value={data.communicationNote}
                  onChange={(e) => setData({...data, communicationNote: e.target.value})}
                />
             </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
                <Target size={14} className="text-green-500" /> Key Strengths
              </label>
              <textarea
                className="w-full p-6 bg-green-50/30 border border-green-100 rounded-2xl outline-none focus:ring-2 focus:ring-green-500/20 transition-all font-medium h-32 resize-none"
                placeholder="What did they master this week?"
                value={data.strengths}
                onChange={(e) => setData({...data, strengths: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
                <TrendingUp size={14} className="text-red-500" /> Areas for Growth
              </label>
              <textarea
                className="w-full p-6 bg-red-50/30 border border-red-100 rounded-2xl outline-none focus:ring-2 focus:ring-red-500/20 transition-all font-medium h-32 resize-none"
                placeholder="Where should they focus now?"
                value={data.weaknesses}
                onChange={(e) => setData({...data, weaknesses: e.target.value})}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
                <MessageSquare size={14} className="text-fluent-navy" /> Teacher's Log
              </label>
              <textarea
                className="w-full p-6 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-fluent-navy/20 transition-all font-medium h-32 resize-none italic"
                placeholder="Detailed feedback for the parents..."
                value={data.teacherComment}
                onChange={(e) => setData({...data, teacherComment: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 flex items-center gap-2 text-fluent-gold">
                <Zap size={14} /> Official Action Plan
              </label>
              <textarea
                className="w-full p-6 bg-fluent-gold/5 border border-fluent-gold/10 rounded-2xl outline-none focus:ring-2 focus:ring-fluent-gold/20 transition-all font-medium h-32 resize-none"
                placeholder="Specific tasks for student improvement..."
                value={data.actionPlan}
                onChange={(e) => setData({...data, actionPlan: e.target.value})}
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="flex items-center gap-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Attendance Status:</label>
                <select 
                  className="bg-transparent font-bold text-fluent-navy uppercase tracking-widest text-xs cursor-pointer focus:outline-none"
                  value={data.attendance}
                  onChange={(e) => setData({...data, attendance: e.target.value})}
                >
                  <option>Present</option>
                  <option>Absent</option>
                  <option>Excused</option>
                </select>
             </div>
             <Btn 
                type="submit" 
                variant="primary" 
                className="px-16 py-6 rounded-2xl font-black uppercase tracking-[0.2em] bg-fluent-navy text-white text-xs shadow-2xl shadow-fluent-navy/20"
                disabled={loading}
              >
                {loading ? "Transmitting..." : "Publish Weekly Review"}
              </Btn>
          </div>
        </form>
      </Card>
    </div>
  );
}
