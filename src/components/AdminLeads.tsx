import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebaseInit";
import { handleFirestoreError, OperationType } from "../lib/errorHandling";
import { Card, Btn, Badge, Modal } from "./UI";
import { Mail, Phone, Calendar, Search, Filter, Trash2, CheckCircle, AlertCircle } from "lucide-react";

export default function AdminLeads() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [showArchiveModal, setShowArchiveModal] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "schoolLeads"), orderBy("requestedAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setLeads(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "schoolLeads"));
    return () => unsub();
  }, []);

  const updateLeadStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'schoolLeads', id), { status });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `leads/${id}`);
    }
  };

  const deleteLead = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'schoolLeads', id));
      setShowArchiveModal(false);
      setSelectedLead(null);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `leads/${id}`);
    }
  };

  if (loading) return <div className="flex justify-center p-20 animate-pulse text-slate-400">Syncing Lead Registry...</div>;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-serif font-bold text-fluent-navy">Lead Acquisition Pipeline</h2>
          <p className="text-slate-400 mt-2 text-[10px] font-black uppercase tracking-widest">Inbound institutional & scholar growth tracking</p>
        </div>
        <div className="flex gap-2">
           <Btn variant="outline" size="sm" icon={Filter}>Filter</Btn>
           <Btn variant="primary" size="sm" icon={Search}>Search</Btn>
        </div>
      </div>

      <Card className="overflow-hidden border-black/5 bg-white">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-black/5">
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Timestamp</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Lead Identity</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Designation</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
              <th className="p-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Operation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-slate-50/30 transition-colors">
                <td className="p-6">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar size={14} />
                    <span className="text-xs font-bold font-mono">
                       {lead.requestedAt?.toDate ? lead.requestedAt.toDate().toLocaleDateString() : 'Pending'}
                    </span>
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-fluent-teal/10 flex items-center justify-center text-fluent-teal font-black text-xs">
                       {lead.schoolName?.[0] || lead.email?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-fluent-navy">{lead.schoolName}</div>
                      <div className="text-[10px] text-slate-400 font-medium">Contact: {lead.contactPerson}</div>
                      <div className="text-[9px] text-fluent-teal font-bold">{lead.email}</div>
                    </div>
                  </div>
                </td>
                <td className="p-6 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  {lead.designation}
                  <div className="text-[10px] text-slate-400 mt-1 capitalize font-medium">{lead.studentCount} Students ({lead.classes})</div>
                </td>
                <td className="p-6">
                  <Badge color={lead.status === 'processed' ? 'teal' : 'gold'}>
                    {lead.status === 'processed' ? 'Onboarded' : 'New Inquiry'}
                  </Badge>
                </td>
                <td className="p-6 text-right">
                  <div className="flex justify-end gap-2">
                    <Btn 
                      variant="ghost" 
                      size="sm" 
                      icon={CheckCircle}
                      onClick={() => updateLeadStatus(lead.id, 'processed')}
                      className={lead.status === 'processed' ? 'text-fluent-teal opacity-50' : 'text-slate-400 hover:text-fluent-teal'}
                    >
                      {null}
                    </Btn>
                    <Btn 
                      variant="ghost" 
                      size="sm" 
                      icon={Trash2}
                      onClick={() => { setSelectedLead(lead); setShowArchiveModal(true); }}
                      className="text-slate-300 hover:text-red-500"
                    >
                      {null}
                    </Btn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {leads.length === 0 && (
          <div className="p-20 text-center text-slate-400 font-serif italic text-lg">Lead pipeline currently silent.</div>
        )}
      </Card>

      <Modal 
        isOpen={showArchiveModal} 
        onClose={() => setShowArchiveModal(false)}
        title="Protocol: Archive Lead"
      >
        <div className="space-y-6">
          <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-4">
            <AlertCircle className="text-slate-400 shrink-0" size={24} />
            <div>
              <p className="text-sm font-bold text-slate-900">Purge registry entry for {selectedLead?.schoolName}?</p>
              <p className="text-xs text-slate-500 mt-1">This will permanently remove the lead from the acquisition pipeline. Ensure all institutional data is synchronised before proceeding.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Btn variant="outline" className="flex-1" onClick={() => setShowArchiveModal(false)}>Cancel</Btn>
            <Btn variant="danger" className="flex-1" onClick={() => deleteLead(selectedLead.id)}>Confirm Purge</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
