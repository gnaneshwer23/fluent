import React, { useState, useEffect } from 'react';
import { 
  Home, Globe, BarChart3, Award, BookOpen, Settings, Plus, ShieldCheck, Zap, Users, ClipboardList, PieChart, LogOut, Building2, Search, X, Library, MessageSquare, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, onSnapshot, doc, deleteDoc, query, orderBy, updateDoc, getDocs, where, limit, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebaseInit';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';
import { Badge, Card, MetricTile, Btn, Avatar } from './UI';
import { DashboardShell } from './DashboardShell';

import AdminLeads from './AdminLeads';
import AdminStudents from './AdminStudents';
import AdminTeachers from './AdminTeachers';
import AdminAnalytics from './AdminAnalytics';
import AdminAlerts from './AdminAlerts';
import AdminOverview from './AdminOverview';
import AdminPayments from './AdminPayments';
import AdminSchools from './AdminSchools';
import AdminCohorts from './AdminCohorts';
import { Forum } from './Forum';
import { MasteryLedger } from './MasteryLedger';

export const AdminDashboard = ({ onBack, schoolId: initialSchoolId }: { onBack: () => void, schoolId?: string }) => {
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("overview");
  const [schools, setSchools] = useState<any[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(initialSchoolId || "all");
  const [systemSettings, setSystemSettings] = useState<any>({});
  
  // Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    users: any[];
    schools: any[];
    assignments: any[];
  }>({ users: [], schools: [], assignments: [] });

  useEffect(() => {
    if (initialSchoolId) {
      setSelectedSchoolId(initialSchoolId);
    }
  }, [initialSchoolId]);

  useEffect(() => {
    const unsubWaitlist = onSnapshot(collection(db, 'waitlist'), (snap) => {
      setWaitlist(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'waitlist'));

    const unsubSchools = onSnapshot(collection(db, 'schools'), (snap) => {
      setSchools(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'schools'));

    const unsubSettings = onSnapshot(doc(db, 'platform', 'config'), (snap) => {
      if (snap.exists()) setSystemSettings(snap.data());
    });

    return () => {
      unsubWaitlist();
      unsubSchools();
      unsubSettings();
    };
  }, []);

  // Global Search Logic
  useEffect(() => {
    const performSearch = async () => {
      if (searchTerm.trim().length < 2) {
        setSearchResults({ users: [], schools: [], assignments: [] });
        return;
      }

      setIsSearching(true);
      try {
        const term = searchTerm.toLowerCase();

        // 1. Search Users
        let userBaseQ = collection(db, "users");
        let userQ;
        
        if (selectedSchoolId !== 'all') {
          userQ = query(userBaseQ, where("schoolId", "==", selectedSchoolId), limit(50));
        } else {
          userQ = query(userBaseQ, limit(50));
        }

        const userSnap = await getDocs(userQ);
        const matchedUsers = userSnap.docs
          .map(d => ({ id: d.id, ...(d.data() as object) }))
          .filter((u: any) => 
            u.name?.toLowerCase().includes(term) || 
            u.email?.toLowerCase().includes(term)
          );

        // 2. Search Schools (from local state as they are already synced)
        const matchedSchools = selectedSchoolId === 'all' 
          ? schools.filter(s => 
              s.name?.toLowerCase().includes(term) || 
              s.id?.toLowerCase().includes(term)
            )
          : []; // School admins don't need to search other schools

        // 3. Search Assignments
        let assignBaseQ = collection(db, "assignments");
        let assignQ;

        if (selectedSchoolId !== 'all') {
          assignQ = query(assignBaseQ, where("schoolId", "==", selectedSchoolId), limit(50));
        } else {
          assignQ = query(assignBaseQ, limit(50));
        }

        const assignSnap = await getDocs(assignQ);
        const matchedAssignments = assignSnap.docs
          .map(d => ({ id: d.id, ...(d.data() as object) }))
          .filter((a: any) => 
            a.title?.toLowerCase().includes(term) || 
            a.subject?.toLowerCase().includes(term)
          );

        setSearchResults({
          users: matchedUsers,
          schools: matchedSchools,
          assignments: matchedAssignments
        });
      } catch (e) {
        console.error("Search error:", e);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(performSearch, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, schools]);

  const navItems = [
    { id: "overview", label: "Strategic Overview", icon: Home },
    { id: "schools", label: "Institutional Nodes", icon: Building2, badge: "SaaS" },
    { id: "cohorts", label: "Cohort Registry", icon: Users },
    { id: "leads", label: "Lead Pipeline", icon: Globe },
    { id: "students", label: "Scholar Registry", icon: Users },
    { id: "teachers", label: "Faculty Command", icon: Award },
    { id: "alerts", label: "Interventions", icon: ShieldCheck, badge: "Live" },
    { id: "analytics", label: "Mastery Analytics", icon: BarChart3, badge: "AI" },
    { id: "payments", label: "Financial Ledger", icon: PieChart },
    { id: "ledger", label: "Knowledge Ledger", icon: Library },
    { id: "forum", label: "Global Forum", icon: MessageSquare, badge: "Comm" },
    { id: "settings", label: "Platform Config", icon: Settings },
  ];

  // Restrict for School Admins
  const filteredNavItems = initialSchoolId 
    ? navItems.filter(item => !['schools', 'leads', 'settings'].includes(item.id))
    : navItems;

  const toggleFeature = async (key: string) => {
    try {
      await updateDoc(doc(db, 'platform', 'config'), {
        [key]: !systemSettings[key]
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'platform/config');
    }
  };

  const updateDirective = async (text: string) => {
    try {
      await updateDoc(doc(db, 'platform', 'config'), {
        directive: text,
        directiveUpdatedAt: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'platform/config');
    }
  };

  const hasSearchResults = searchResults.users.length > 0 || searchResults.schools.length > 0 || searchResults.assignments.length > 0;

  return (
    <DashboardShell role="admin" title={initialSchoolId ? "School Administrator" : "Academy Provost"} navItems={filteredNavItems} activeNav={activeNav} setActiveNav={setActiveNav} onBack={onBack}>
      <div className="p-10 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="flex flex-col xl:flex-row justify-between items-start gap-8 mb-12">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Badge color={initialSchoolId ? "teal" : "gold"}>{initialSchoolId ? "Institutional Admin" : "Strategic Administrator"}</Badge>
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {initialSchoolId ? "Authorized Access Only" : "All Institutional Nodes Active"}
              </span>
            </div>
            <h1 className="text-4xl font-serif font-bold tracking-tight text-fluent-navy">
              {navItems.find(n => n.id === activeNav)?.label}
            </h1>
            <h2 className="text-lg font-serif font-bold italic text-fluent-gold mt-2">
              Viewing: {selectedSchoolId === 'all' 
                ? 'All Schools (Global Network)' 
                : (schools.find(s => s.id === selectedSchoolId)?.name || 'Loading Institution...')}
            </h2>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 w-full xl:w-auto">
            {/* Global Search Bar */}
            <div className="relative w-full md:w-96 group">
               <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <Search size={16} className={`transition-colors ${searchTerm ? 'text-fluent-teal' : 'text-slate-400'}`} />
               </div>
               <input 
                 type="text" 
                 placeholder="Search registry, schools, assignments..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-black/5 rounded-2xl text-sm font-bold text-fluent-navy outline-none focus:bg-white focus:ring-4 focus:ring-fluent-teal/5 focus:border-fluent-teal/20 transition-all placeholder:text-slate-400 placeholder:font-medium"
               />
               {searchTerm && (
                 <button 
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-fluent-navy transition-colors"
                 >
                    <X size={16} />
                 </button>
               )}

               {/* Search Results Dropdown */}
               <AnimatePresence>
                 {searchTerm.trim().length >= 2 && (
                   <motion.div 
                     initial={{ opacity: 0, y: 10, scale: 0.95 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     exit={{ opacity: 0, y: 10, scale: 0.95 }}
                     className="absolute top-full left-0 right-0 mt-4 bg-white rounded-3xl shadow-2xl border border-black/5 z-[150] overflow-hidden max-h-[500px] overflow-y-auto"
                   >
                     {isSearching ? (
                       <div className="p-8 text-center animate-pulse">
                          <div className="w-8 h-8 border-4 border-fluent-teal/20 border-t-fluent-teal rounded-full animate-spin mx-auto mb-4" />
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Sector Scanning...</p>
                       </div>
                     ) : !hasSearchResults ? (
                       <div className="p-12 text-center">
                          <p className="text-slate-400 font-serif italic">No matching protocol found for "{searchTerm}"</p>
                       </div>
                     ) : (
                       <div className="divide-y divide-slate-50">
                         {searchResults.schools.length > 0 && (
                           <div className="p-4">
                              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-3 mb-2">Institutional Nodes</div>
                              {searchResults.schools.map(s => (
                                <button 
                                  key={s.id} 
                                  onClick={() => { setActiveNav("schools"); setSearchTerm(""); }}
                                  className="w-full text-left p-3 rounded-xl hover:bg-fluent-navy/5 flex items-center gap-3 transition-colors group"
                                >
                                   <div className="w-8 h-8 bg-fluent-gold/10 rounded-lg flex items-center justify-center text-fluent-gold font-bold text-xs uppercase">
                                      <Building2 size={16} />
                                   </div>
                                   <div>
                                      <div className="text-sm font-bold text-fluent-navy">{s.name}</div>
                                      <div className="text-[10px] text-slate-400 font-medium">School ID: {s.id}</div>
                                   </div>
                                </button>
                              ))}
                           </div>
                         )}

                         {searchResults.users.length > 0 && (
                           <div className="p-4">
                              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-3 mb-2">User Registry</div>
                              {searchResults.users.map(u => (
                                <button 
                                  key={u.id} 
                                  onClick={() => { 
                                    setActiveNav(u.role === 'student' ? 'students' : 'teachers'); 
                                    setSearchTerm(""); 
                                  }}
                                  className="w-full text-left p-3 rounded-xl hover:bg-fluent-navy/5 flex items-center gap-3 transition-colors group"
                                >
                                   <Avatar name={u.name} size={32} />
                                   <div>
                                      <div className="text-sm font-bold text-fluent-navy">{u.name}</div>
                                      <div className="text-[10px] text-slate-400 font-medium flex items-center gap-2">
                                        <Badge color={u.role === 'student' ? 'teal' : 'gold'} className="scale-75 origin-left">{u.role}</Badge>
                                        {u.email}
                                      </div>
                                   </div>
                                </button>
                              ))}
                           </div>
                         )}

                         {searchResults.assignments.length > 0 && (
                           <div className="p-4">
                              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-3 mb-2">Global Assignments</div>
                              {searchResults.assignments.map(a => (
                                <button 
                                  key={a.id} 
                                  onClick={() => { setActiveNav("analytics"); setSearchTerm(""); }}
                                  className="w-full text-left p-3 rounded-xl hover:bg-fluent-navy/5 flex items-center gap-3 transition-colors group"
                                >
                                   <div className="w-8 h-8 bg-fluent-teal/10 rounded-lg flex items-center justify-center text-fluent-teal font-bold text-xs uppercase">
                                      <ClipboardList size={16} />
                                   </div>
                                   <div>
                                      <div className="text-sm font-bold text-fluent-navy">{a.title}</div>
                                      <div className="text-[10px] text-slate-400 font-medium">{a.subject} :: {a.status || 'Active'}</div>
                                   </div>
                                </button>
                              ))}
                           </div>
                         )}
                       </div>
                     )}
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>

            <div className="flex flex-col items-end shrink-0">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Institutional Node</span>
              {initialSchoolId ? (
                <div className="bg-fluent-navy/5 border border-black/5 rounded-xl px-4 py-2 text-xs font-bold text-fluent-navy shadow-sm">
                  {schools.find(s => s.id === initialSchoolId)?.name || 'Loading Institutional Data...'}
                </div>
              ) : (
                <select 
                  value={selectedSchoolId}
                  onChange={(e) => setSelectedSchoolId(e.target.value)}
                  className="bg-white border border-black/5 rounded-xl px-4 py-2 text-xs font-bold text-fluent-navy shadow-sm focus:outline-none focus:ring-2 focus:ring-fluent-gold/20"
                >
                  <option value="all">Global (All Schools)</option>
                  {schools.map(s => (
                    <option key={s.id} value={s.id}>{s.name || s.id}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex gap-3 shrink-0">
              <Btn variant="outline" size="sm" icon={ShieldCheck}>Security Audit</Btn>
              {!initialSchoolId && <Btn variant="primary" size="sm" icon={Plus} onClick={() => setActiveNav("cohorts")}>Onboard Cohort</Btn>}
              <Btn variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" icon={LogOut} onClick={onBack}>Sign Out</Btn>
            </div>
          </div>
        </header>

        {activeNav === "overview" ? (
          <AdminOverview schoolId={selectedSchoolId} />
        ) : activeNav === "schools" ? (
          <AdminSchools />
        ) : activeNav === "cohorts" ? (
          <AdminCohorts schoolId={selectedSchoolId} />
        ) : activeNav === "leads" ? (
          <AdminLeads />
        ) : activeNav === "students" ? (
          <AdminStudents schoolId={selectedSchoolId} />
        ) : activeNav === "teachers" ? (
          <AdminTeachers schoolId={selectedSchoolId} />
        ) : activeNav === "alerts" ? (
          <AdminAlerts schoolId={selectedSchoolId} />
        ) : activeNav === "analytics" ? (
          <AdminAnalytics schoolId={selectedSchoolId} />
        ) : activeNav === "payments" ? (
          <AdminPayments schoolId={selectedSchoolId} />
        ) : activeNav === "ledger" ? (
          <MasteryLedger userProfile={{ role: initialSchoolId ? 'school_admin' : 'admin' }} />
        ) : activeNav === "forum" ? (
          <Forum userProfile={{ role: initialSchoolId ? 'school_admin' : 'admin', schoolId: selectedSchoolId }} />
        ) : activeNav === "settings" ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
              <h2 className="text-3xl font-serif font-bold italic">System Configuration</h2>
              <p className="text-slate-500 mt-2">Manage global environment variables and platform constraints.</p>
            </div>
            <Card className="p-8 border-black/5 divide-y divide-slate-50">
               {[
                 { key: "publicRegistration", label: "Public Registrations", desc: "Allow anyone to sign up from the landing page" },
                 { key: "facultyOnboarding", label: "Faculty Onboarding", desc: "Enable self-service faculty application portal" },
                 { key: "liveLabActive", label: "Beta Node Access (Live Lab)", desc: "Enable experimental 1:1 interaction nodes" },
                 { key: "globalChat", label: "Global Communication Protocol", desc: "Enable cross-institutional student discussion boards" }
               ].map(setting => {
                 const isActive = systemSettings[setting.key];
                 return (
                   <div key={setting.key} className="py-6 flex justify-between items-center first:pt-0 last:pb-0">
                      <div>
                        <div className="text-sm font-bold text-fluent-navy">{setting.label}</div>
                        <div className="text-[10px] text-slate-400 font-medium tracking-tight mb-1">{setting.desc}</div>
                        <Badge color={isActive ? "teal" : "gold"} className="scale-75 origin-left">
                          {isActive ? "Operational" : "Offline"}
                        </Badge>
                      </div>
                      <div 
                        onClick={() => toggleFeature(setting.key)}
                        className={`w-12 h-6 rounded-full relative p-1 cursor-pointer transition-colors ${isActive ? 'bg-fluent-teal' : 'bg-slate-200'}`}
                      >
                         <motion.div 
                           animate={{ x: isActive ? 24 : 0 }}
                           className="w-4 h-4 bg-white rounded-full shadow-sm"
                         />
                      </div>
                   </div>
                 );
               })}
            </Card>

            <Card className="p-10 border-fluent-gold/20 bg-fluent-gold/5 mt-8 shadow-2xl shadow-fluent-gold/5">
                <div className="flex justify-between items-start mb-6">
                   <div>
                      <h3 className="text-xl font-serif font-black text-fluent-navy tracking-tight">Provincial Directive</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Global platform-wide broadcast</p>
                   </div>
                   <Badge color="gold" icon={Sparkles}>Aura Sync</Badge>
                </div>
                <div className="flex gap-4">
                  <input 
                    type="text" 
                    placeholder="Enter directive (e.g. FOCUS: LOGIC SYNTHESIS WEEK)..."
                    defaultValue={systemSettings.directive || ""}
                    onBlur={(e) => updateDirective(e.target.value)}
                    className="flex-1 px-6 py-4 bg-white border border-fluent-gold/10 rounded-2xl text-sm font-bold text-fluent-navy outline-none focus:ring-4 focus:ring-fluent-gold/5 transition-all shadow-sm"
                  />
                  <Btn variant="gold" size="md">Broadcast</Btn>
                </div>
                <p className="text-[9px] text-slate-400 mt-3 italic">Updating this will push a real-time prioritized focus to all active user dashboards.</p>
             </Card>

            <Card className="p-8 bg-fluent-navy text-white mt-8">
               <h3 className="text-xl font-serif font-bold mb-4">Platform Security Level</h3>
               <div className="flex gap-4">
                  {['Standard', 'Elevated', 'Lockdown'].map(level => (
                    <button 
                      key={level}
                      className={`flex-1 py-4 rounded-xl border-2 transition-all font-bold text-xs tracking-widest uppercase ${
                        (systemSettings.securityLevel || 'Standard') === level
                          ? "border-fluent-gold bg-fluent-gold/10 text-fluent-gold shadow-lg shadow-fluent-gold/5"
                          : "border-white/10 text-white/40 hover:bg-white/5"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
               </div>
            </Card>
          </div>
        ) : null}
      </div>
    </DashboardShell>
  );
};
