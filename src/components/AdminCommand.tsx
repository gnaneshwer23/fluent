import React, { useState, useEffect } from 'react';
import { 
  Home, Globe, BarChart3, Award, BookOpen, Settings, Plus, ShieldCheck, Zap, Users, ClipboardList, PieChart, LogOut, Building2
} from 'lucide-react';
import { motion } from 'motion/react';
import { collection, onSnapshot, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
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

export const AdminCommand = ({ onBack, schoolId: initialSchoolId }: { onBack: () => void, schoolId?: string }) => {
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("overview");
  const [schools, setSchools] = useState<any[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(initialSchoolId || "all");

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

    return () => {
      unsubWaitlist();
      unsubSchools();
    };
  }, []);

  const navItems = [
    { id: "overview", label: "Strategic Overview", icon: Home },
    { id: "schools", label: "Institutional Nodes", icon: Building2, badge: "SaaS" },
    { id: "leads", label: "Lead Pipeline", icon: Globe },
    { id: "students", label: "Scholar Registry", icon: Users },
    { id: "teachers", label: "Faculty Command", icon: Award },
    { id: "alerts", label: "Interventions", icon: ShieldCheck, badge: "Live" },
    { id: "analytics", label: "Mastery Analytics", icon: BarChart3, badge: "AI" },
    { id: "payments", label: "Financial Ledger", icon: PieChart },
    { id: "settings", label: "Platform Config", icon: Settings },
  ];

  // Restrict for School Admins
  const filteredNavItems = initialSchoolId 
    ? navItems.filter(item => !['schools', 'leads', 'settings'].includes(item.id))
    : navItems;

  return (
    <DashboardShell role="admin" title={initialSchoolId ? "School Administrator" : "Academy Provost"} navItems={filteredNavItems} activeNav={activeNav} setActiveNav={setActiveNav} onBack={onBack}>
      <div className="p-10 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
          <div>
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

          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex flex-col items-end">
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

            <div className="flex gap-3">
              <Btn variant="outline" size="sm" icon={ShieldCheck}>Security Audit</Btn>
              {!initialSchoolId && <Btn variant="primary" size="sm" icon={Plus}>Onboard Cohort</Btn>}
              <Btn variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" icon={LogOut} onClick={onBack}>Sign Out</Btn>
            </div>
          </div>
        </header>

        {activeNav === "overview" ? (
          <AdminOverview schoolId={selectedSchoolId} />
        ) : activeNav === "schools" ? (
          <AdminSchools />
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
        ) : activeNav === "settings" ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
              <h2 className="text-3xl font-serif font-bold italic">System Configuration</h2>
              <p className="text-slate-500 mt-2">Manage global environment variables and platform constraints.</p>
            </div>
            <Card className="p-8 border-black/5 divide-y divide-slate-50">
               {[
                 { label: "Public Registrations", status: "Active" },
                 { label: "Faculty Onboarding", status: "Restricted" },
                 { label: "Beta Node Access", status: "Inactive" },
                 { label: "Global Chat Protocol", status: "Active" }
               ].map(setting => (
                 <div key={setting.label} className="py-6 flex justify-between items-center first:pt-0 last:pb-0">
                    <div>
                      <div className="text-sm font-bold text-fluent-navy">{setting.label}</div>
                      <div className="text-[10px] text-slate-400 font-medium tracking-tight">Status: {setting.status}</div>
                    </div>
                    <div className="w-12 h-6 bg-slate-200 rounded-full relative p-1 cursor-pointer">
                       <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all ${setting.status === 'Active' ? 'ml-6 bg-fluent-teal' : ''}`} />
                    </div>
                 </div>
               ))}
            </Card>
          </div>
        ) : null}
      </div>
    </DashboardShell>
  );
};
