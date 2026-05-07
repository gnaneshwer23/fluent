import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebaseInit";
import { handleFirestoreError, OperationType } from "../lib/errorHandling";
import { Card, Btn } from "./UI";
import { PlusCircle, Link as LinkIcon, Calendar, BookOpen } from "lucide-react";

export default function TeacherAssignments() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    link: "",
    dueDate: "",
    batch: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.dueDate) return;
    
    setLoading(true);
    try {
      await addDoc(collection(db, "assignments"), {
        ...form,
        status: "pending",
        createdAt: serverTimestamp()
      });
      setForm({ title: "", link: "", dueDate: "", batch: "" });
      alert("Assignment Created ✅");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "assignments");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-serif font-bold text-fluent-navy">Distribute Assignment</h2>
        <p className="text-slate-500 mt-2">New tasks will be instantly visible in the Student Mastery Node.</p>
      </div>

      <Card className="p-10 border-black/5 bg-white shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assignment Title</label>
            <div className="relative">
              <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                required
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-fluent-teal/20 transition-all font-medium"
                placeholder="e.g. Algebra Synthesis Task II"
                value={form.title}
                onChange={(e) => setForm({...form, title: e.target.value})}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Due Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  type="date"
                  required
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-fluent-teal/20 transition-all font-medium"
                  value={form.dueDate}
                  onChange={(e) => setForm({...form, dueDate: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Batch</label>
              <input
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-fluent-teal/20 transition-all font-medium"
                placeholder="e.g. Grade 9 Maths-Alpha"
                value={form.batch}
                onChange={(e) => setForm({...form, batch: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Resource Link (Optional)</label>
            <div className="relative">
              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-fluent-teal/20 transition-all font-medium"
                placeholder="https://google.form/..."
                value={form.link}
                onChange={(e) => setForm({...form, link: e.target.value})}
              />
            </div>
          </div>

          <Btn 
            type="submit" 
            variant="primary" 
            className="w-full py-5 rounded-2xl text-xs font-black uppercase tracking-widest bg-fluent-navy hover:bg-fluent-navy/90"
            disabled={loading}
          >
            {loading ? "Publishing..." : "Publish to Scholar Node"}
          </Btn>
        </form>
      </Card>
    </div>
  );
}
