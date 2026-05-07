import React, { useState, useEffect } from 'react';
import { 
  Building2, Plus, Users, Award, CheckCircle2, 
  Settings, Search, MoreVertical, Globe, ShieldCheck, 
  ArrowRight, Upload, Mail, BarChart3, Clock, Zap
} from 'lucide-react';
import { collection, onSnapshot, query, addDoc, doc, updateDoc, serverTimestamp, getDocs, where } from 'firebase/firestore';
import { db } from '../lib/firebaseInit';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';
import { Card, Btn, Badge, Avatar, MetricTile } from './UI';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminSchools() {
  const [schools, setSchools] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    adminEmail: "",
    location: "London, UK",
    studentCount: 0,
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'schools'), (snap) => {
      setSchools(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setIsLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'schools'));
    return () => unsub();
  }, []);

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.adminEmail) return;

    try {
      await addDoc(collection(db, 'schools'), {
        ...form,
        status: 'onboarding',
        setupProgress: {
          studentsUploaded: false,
          teachersAssigned: false,
          classesStarted: false
        },
        createdAt: serverTimestamp()
      });
      setIsAdding(false);
      setForm({ name: "", adminEmail: "", location: "London, UK", studentCount: 0 });
    } catch (err) {
      console.error("Failed to create institution", err);
    }
  };

  const provisionAdmin = async (school: any) => {
    try {
      // Find if user already exists
      const q = query(collection(db, 'users'), where('email', '==', school.adminEmail));
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        const userDoc = snap.docs[0];
        await updateDoc(doc(db, 'users', userDoc.id), {
          role: 'school_admin',
          schoolId: school.id
        });
      } else {
        // Invite system would go here, for now we'll just track that it's pending
        alert(`Admin user with email ${school.adminEmail} must register first. After registration, their account will be automatically linked if the email matches.`);
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/provision`);
    }
  };

  if (isLoading) return <div className="flex justify-center p-20 animate-pulse text-slate-400 font-black tracking-widest uppercase text-xs">Synchronizing Institutional Nodes...</div>;

  return (
    <div className="space-y-10 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-serif font-bold text-fluent-navy">Institutional Node Control</h2>
          <p className="text-slate-400 mt-2 text-[10px] font-black uppercase tracking-widest leading-relaxed">
            Managing global partner schools and systemic onboarding protocols.
          </p>
        </div>
        <Btn variant="primary" icon={Plus} onClick={() => setIsAdding(true)}>Onboard Partner</Btn>
      </header>

      {/* KPI LAYER */}
      <div className="grid sm:grid-cols-3 gap-6">
        <MetricTile label="Total Institutions" value={schools.length.toString()} icon={Building2} color="#1B4F5E" />
        <MetricTile label="Avg Cohort Size" value="242" icon={Users} color="#C9A84C" />
        <MetricTile label="Active Nodes" value={schools.filter(s => s.status === 'active').length.toString()} icon={Globe} color="#10B981" />
      </div>

      {/* ADD SCHOOL MODAL OVERLAY */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-20">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-fluent-navy/60 backdrop-blur-md" 
              onClick={() => setIsAdding(false)} 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <form onSubmit={handleCreateSchool} className="p-12 space-y-8">
                <div>
                  <h3 className="text-2xl font-serif font-bold text-fluent-navy">Initiate Institutional Registry</h3>
                  <p className="text-xs text-slate-400 mt-2 font-medium">Define metadata for the new platform node.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Official Name</label>
                    <input 
                      required
                      placeholder="e.g. Royal Academy of Institutional Excellence"
                      className="w-full bg-slate-50 border border-black/5 rounded-2xl px-6 py-4 text-sm font-bold text-fluent-navy focus:outline-none focus:ring-2 focus:ring-fluent-gold/20"
                      value={form.name}
                      onChange={(e) => setForm({...form, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Admin Email Authority</label>
                    <input 
                      required
                      type="email"
                      placeholder="principal@academy.edu"
                      className="w-full bg-slate-50 border border-black/5 rounded-2xl px-6 py-4 text-sm font-bold text-fluent-navy focus:outline-none focus:ring-2 focus:ring-fluent-gold/20"
                      value={form.adminEmail}
                      onChange={(e) => setForm({...form, adminEmail: e.target.value})}
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Region / Location</label>
                        <input 
                          placeholder="e.g. Dubai, UAE"
                          className="w-full bg-slate-50 border border-black/5 rounded-2xl px-6 py-4 text-sm font-bold text-fluent-navy focus:outline-none focus:ring-2 focus:ring-fluent-gold/20"
                          value={form.location}
                          onChange={(e) => setForm({...form, location: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Est. Scholar Count</label>
                        <input 
                          type="number"
                          placeholder="350"
                          className="w-full bg-slate-50 border border-black/5 rounded-2xl px-6 py-4 text-sm font-bold text-fluent-navy focus:outline-none focus:ring-2 focus:ring-fluent-gold/20"
                          value={form.studentCount || ""}
                          onChange={(e) => setForm({...form, studentCount: parseInt(e.target.value) || 0})}
                        />
                      </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Btn type="button" variant="ghost" className="flex-1 font-black text-[10px] uppercase tracking-widest" onClick={() => setIsAdding(false)}>Abort Protocol</Btn>
                  <Btn type="submit" variant="primary" className="flex-1 shadow-xl shadow-fluent-teal/20">Establish Node</Btn>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SCHOOL REGISTRY GRID */}
      <div className="grid lg:grid-cols-2 gap-8">
        {schools.map((school, i) => (
          <SchoolCard key={school.id} school={school} index={i} provisionAdmin={provisionAdmin} />
        ))}
        {schools.length === 0 && (
          <div className="lg:col-span-2 py-40 text-center bg-slate-50 rounded-[3rem] border border-black/5 border-dashed">
            <Building2 size={48} className="mx-auto text-slate-300 mb-6" />
            <h3 className="text-xl font-serif font-bold text-slate-400 italic">No Institutional Nodes Registered</h3>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-4">Platform baseline set to standby.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SchoolCard({ school, index, provisionAdmin }: { school: any, index: number, provisionAdmin: (s: any) => void, key?: any }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const progress = [
    { label: "Admin Auth", status: true, icon: ShieldCheck },
    { label: "Teacher Deployment", status: school.setupProgress?.teachersAssigned, icon: Award },
    { label: "Scholar Seed", status: school.setupProgress?.studentsUploaded, icon: Users },
    { label: "Protocol Active", status: school.setupProgress?.classesStarted, icon: Zap }
  ];

  const completionPercentage = (progress.filter(p => p.status).length / progress.length) * 100;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className={`overflow-hidden transition-all duration-500 border-black/5 flex flex-col ${isExpanded ? 'h-auto ring-2 ring-fluent-gold/10' : 'h-[320px] shadow-xl shadow-slate-200/50'}`}>
        <div className="p-8 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div className="flex gap-2">
              <Badge color={school.status === 'active' ? 'teal' : 'gold'}>{school.status.toUpperCase()}</Badge>
              <button 
                onClick={(e) => { e.stopPropagation(); provisionAdmin(school); }}
                className="text-[10px] font-black uppercase tracking-widest text-fluent-gold hover:text-fluent-navy transition-colors flex items-center gap-1"
              >
                <ShieldCheck size={12} /> Provision Admin
              </button>
            </div>
            <Btn variant="ghost" size="sm" icon={MoreVertical} className="text-slate-300">Action</Btn>
          </div>
          
          <div className="space-y-2 mb-8">
            <h3 className="text-2xl font-serif font-bold text-fluent-navy leading-tight">{school.name}</h3>
            <div className="flex items-center gap-2 text-slate-400">
              <Globe size={12} />
              <span className="text-[10px] font-bold uppercase tracking-widest">{school.location}</span>
            </div>
          </div>

          <div className="mt-auto space-y-4">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <span>Onboarding Protocol</span>
              <span className="text-fluent-gold">{Math.round(completionPercentage)}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
               <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                className="h-full bg-linear-to-r from-fluent-teal to-fluent-gold"
               />
            </div>
          </div>
        </div>

        <div className="bg-slate-50/50 border-t border-black/5 p-8">
           <div className="grid grid-cols-4 gap-4">
              {progress.map((p, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${p.status ? 'bg-fluent-teal text-white shadow-lg shadow-fluent-teal/20' : 'bg-slate-200 text-slate-400'}`}>
                      <p.icon size={14} />
                   </div>
                   <span className="text-[8px] font-black uppercase tracking-widest text-[0.6rem] text-slate-400 text-center line-clamp-1">{p.label}</span>
                </div>
              ))}
           </div>
           <div className="mt-8 flex gap-4">
              <Btn variant="outline" size="sm" className="w-full text-[10px] font-black uppercase h-10 tracking-widest">Metadata</Btn>
              <Btn variant="primary" size="sm" className="w-full text-[10px] font-black uppercase h-10 tracking-widest" onClick={() => setIsExpanded(!isExpanded)}>
                {isExpanded ? 'Collapse' : 'Deploy'}
                <ArrowRight size={14} className="ml-2" />
              </Btn>
           </div>
        </div>

        {isExpanded && (
          <div className="p-8 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="border-t border-black/5 pt-8 grid grid-cols-2 gap-6">
              <Card className="p-6 bg-white border-black/5 shadow-sm">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Faculty Deployment</h4>
                <div className="flex items-center justify-between mb-4">
                   <div className="text-xl font-serif font-bold text-fluent-navy">08 Labs</div>
                   <Btn variant="ghost" size="sm" className="h-8 w-8 !p-0" icon={Plus}>Add</Btn>
                </div>
                <Btn variant="outline" size="sm" className="w-full h-8 text-[9px] font-black uppercase">Assign Hub</Btn>
              </Card>
              <Card className="p-6 bg-white border-black/5 shadow-sm">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Scholar Ingestion</h4>
                <div className="flex items-center justify-between mb-4">
                   <div className="text-xl font-serif font-bold text-fluent-navy">242 Seeds</div>
                   <Btn variant="ghost" size="sm" className="h-8 w-8 !p-0" icon={Upload}>Up</Btn>
                </div>
                <Btn variant="outline" size="sm" className="w-full h-8 text-[9px] font-black uppercase">Bulk Upload</Btn>
              </Card>
            </div>

            <div className="p-8 bg-fluent-navy rounded-3xl text-white">
               <div className="flex items-center gap-3 mb-6">
                 <Clock size={16} className="text-fluent-gold" />
                 <h4 className="text-xs font-bold font-serif italic tracking-wide">Pending Institutional Protocols</h4>
               </div>
               <div className="space-y-4">
                  {[
                    "Generate Institutional API Keys",
                    "Configure Regional WhatsApp Proxy",
                    "Deploy Mastery Baseline V2.4"
                  ].map((task, i) => (
                    <div key={i} className="flex gap-4 items-start">
                       <div className="w-1 h-1 rounded-full bg-fluent-gold mt-2 shrink-0" />
                       <span className="text-[10px] font-medium text-white/60">{task}</span>
                    </div>
                  ))}
               </div>
               <Btn variant="gold" size="sm" className="w-full mt-10 h-12 uppercase tracking-[0.2em] font-black text-[10px]">Execute Full Activation</Btn>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
