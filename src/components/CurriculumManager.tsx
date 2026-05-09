import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebaseInit';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { Card, Btn, Badge } from './UI';
import { BookOpen, Plus, Trash2, Database, Layers, Search } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';

export function CurriculumManager() {
  const [chunks, setChunks] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'curriculum_chunks'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setChunks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'curriculum_chunks'));
    return () => unsub();
  }, []);

  const handleAddChunk = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    
    try {
      await addDoc(collection(db, 'curriculum_chunks'), {
        subject: formData.get('subject'),
        grade: formData.get('grade'),
        chapter: formData.get('chapter'),
        topic: formData.get('topic'),
        content: formData.get('content'),
        createdAt: serverTimestamp(),
        metadata: {
           source: 'Faculty Ingestion',
           type: 'Curriculum Node'
        }
      });
      setShowAdd(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'curriculum_chunks');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Purge this knowledge node?")) return;
    try {
      await deleteDoc(doc(db, 'curriculum_chunks', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'curriculum_chunks');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex justify-between items-end">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <Badge color="gold">RAG Engine</Badge>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">• Knowledge Base Management</span>
           </div>
           <h2 className="text-3xl font-serif font-bold text-fluent-navy">Curriculum <span className="italic font-normal text-fluent-teal text-4xl">Nodes</span></h2>
           <p className="text-slate-500 mt-2 text-sm max-w-md">Ingest academic content to ground AI Tutor responses in verified pedagogical materials.</p>
        </div>
        <Btn variant="gold" className="px-8 py-4 gap-2" onClick={() => setShowAdd(true)}>
           <Plus size={18} /> INGEST NODE
        </Btn>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {chunks.map(chunk => (
           <Card key={chunk.id} className="p-6 border-black/5 hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-4">
                 <div>
                    <Badge color="navy" className="mb-2">{chunk.subject}</Badge>
                    <h4 className="font-bold text-fluent-navy">{chunk.topic}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{chunk.grade} • {chunk.chapter}</p>
                 </div>
                 <button onClick={() => handleDelete(chunk.id)} className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={16} />
                 </button>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-[11px] leading-relaxed text-slate-600 line-clamp-4 font-serif italic">
                 "{chunk.content}"
              </div>
              <div className="mt-4 flex justify-between items-center">
                 <div className="flex items-center gap-1.5">
                    <Database size={10} className="text-fluent-teal" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Node Verified</span>
                 </div>
                 <span className="text-[9px] font-mono text-slate-300">{new Date(chunk.createdAt?.seconds * 1000).toLocaleDateString()}</span>
              </div>
           </Card>
         ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-fluent-navy/40 backdrop-blur-md animate-in fade-in duration-300">
           <Card className="w-full max-w-2xl p-10 bg-white shadow-2xl relative overflow-hidden rounded-[40px]">
              <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12 scale-150">
                 <Layers size={120} />
              </div>
              <h3 className="text-3xl font-serif font-bold text-fluent-navy mb-8">Node Ingestion Portal</h3>
              <form onSubmit={handleAddChunk} className="space-y-6">
                 <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subject Area</label>
                       <input name="subject" required className="w-full p-4 bg-gray-50 border border-black/5 rounded-2xl text-sm" placeholder="e.g. Mathematics" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Grade</label>
                       <input name="grade" required className="w-full p-4 bg-gray-50 border border-black/5 rounded-2xl text-sm" placeholder="e.g. Grade 10" />
                    </div>
                 </div>
                 <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chapter</label>
                       <input name="chapter" required className="w-full p-4 bg-gray-50 border border-black/5 rounded-2xl text-sm" placeholder="e.g. Algebra" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Topic</label>
                       <input name="topic" required className="w-full p-4 bg-gray-50 border border-black/5 rounded-2xl text-sm" placeholder="e.g. Quadratic Equations" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verbatim Content (Grounding Source)</label>
                    <textarea name="content" required rows={6} className="w-full p-6 bg-gray-50 border border-black/5 rounded-3xl text-sm font-serif italic" placeholder="Paste curriculum text here..." />
                 </div>
                 
                 <div className="flex gap-4 pt-4">
                    <Btn type="button" variant="outline" className="flex-1" onClick={() => setShowAdd(false)}>CANCEL</Btn>
                    <Btn type="submit" variant="gold" className="flex-1" disabled={loading}>{loading ? 'SYNTHESIZING...' : 'EXECUTE INGESTION'}</Btn>
                 </div>
              </form>
           </Card>
        </div>
      )}
    </div>
  );
}
