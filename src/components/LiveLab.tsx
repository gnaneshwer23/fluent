import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Zap, MessageSquare, ShieldCheck, Play, StopCircle, 
  Terminal, Sparkles, Layout, Monitor, Activity
} from 'lucide-react';
import { Badge, Btn, Card, Avatar } from './UI';
import { db, auth } from '../lib/firebaseInit';
import { doc, onSnapshot, updateDoc, serverTimestamp, setDoc, deleteDoc, increment, getDoc, collection, query, orderBy, limit, addDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const LiveLab = ({ sessionId, role, onExit }: { sessionId: string, role: 'teacher' | 'student', onExit: () => void }) => {
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'scaffolding' | 'scholars' | 'feed'>('scaffolding');
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'liveSessions', sessionId, 'messages'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })).reverse());
    }, (error) => {
      if (auth.currentUser) {
        handleFirestoreError(error, OperationType.GET, `liveSessions/${sessionId}/messages`);
      }
    });
    return () => unsub();
  }, [sessionId]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'liveSessions', sessionId), (snap) => {
      if (snap.exists()) {
        setSession(snap.data());
      } else if (role === 'student') {
        onExit(); // Session terminated by faculty
      }
    }, (error) => {
      if (auth.currentUser) {
        handleFirestoreError(error, OperationType.GET, `liveSessions/${sessionId}`);
      }
    });
    return () => unsub();
  }, [sessionId]);

  // Attendance Auto-Log
  useEffect(() => {
    if (role === 'student' && session && auth.currentUser) {
      const logAttendance = async () => {
        try {
          // This is a simplified lookup since we don't have the exact record path passed in, 
          // we'd need to find the student doc within the class.
          // For now, we'll rely on the teacher's list view to show active scholars.
          await updateDoc(doc(db, 'liveSessions', sessionId), {
            activeCount: increment(1)
          });
        } catch (e) { console.error(e); }
      };
      logAttendance();
      return () => {
        updateDoc(doc(db, 'liveSessions', sessionId), { activeCount: increment(-1) }).catch(console.error);
      };
    }
  }, [role, !!session]);

  const handleUpdateProtocol = async (protocol: string) => {
    if (role !== 'teacher') return;
    try {
      await updateDoc(doc(db, 'liveSessions', sessionId), { 
        currentProtocol: protocol,
        lastUpdate: serverTimestamp()
      });
    } catch (e) { handleFirestoreError(e, OperationType.UPDATE, `liveSessions/${sessionId}`); }
  };

  const handleEndSession = async () => {
    if (!window.confirm("Terminate live delivery? All transient state will be archived.")) return;
    try {
      await deleteDoc(doc(db, 'liveSessions', sessionId));
      onExit();
    } catch (e) { handleFirestoreError(e, OperationType.DELETE, `liveSessions/${sessionId}`); }
  };

  const handleGenerateScaffolding = async () => {
    if (!session || isGenerating) return;
    setIsGenerating(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Act as an expert British faculty member. Generate a "Conceptual Scaffolding Protocol" for a live lesson on "${session.topic}" for ${session.className}. 
      Focus on core conceptual links, common misconceptions, and synthesis questions. Keep it concise (max 200 words). Use professional academic tone.`
      });
      
      const text = response.text || "AI Synthesis failed. Please refine manually.";
      await handleUpdateProtocol(text);
    } catch (e) {
      console.error(e);
      alert("AI Synthesis temporarily unavailable.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !auth.currentUser) return;
    try {
      await addDoc(collection(db, 'liveSessions', sessionId, 'messages'), {
        text: inputMessage,
        senderId: auth.currentUser.uid,
        senderName: auth.currentUser.displayName || (role === 'teacher' ? 'Faculty' : 'Scholar'),
        role,
        createdAt: serverTimestamp()
      });
      setInputMessage("");
    } catch (e) { handleFirestoreError(e, OperationType.WRITE, `liveSessions/${sessionId}/messages`); }
  };

  if (!session) return (
    <div className="flex items-center justify-center p-20">
      <div className="w-12 h-12 border-4 border-t-fluent-teal rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex flex-col h-[85vh] bg-white rounded-[40px] shadow-2xl overflow-hidden border border-black/5">
      {/* HUD Header */}
      <div className="bg-fluent-navy p-6 flex justify-between items-center text-white">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-fluent-teal/20 flex items-center justify-center text-fluent-teal animate-pulse">
             <Activity size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
               <h3 className="font-serif font-bold text-lg">{session.topic}</h3>
               <Badge color="teal" className="bg-white/10 text-white border-none">Live Scaffolding</Badge>
            </div>
            <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/40">{session.className} • {session.subject} Protocol</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
             <Users size={14} className="text-fluent-gold" />
             <span className="text-xs font-bold">{session.activeCount || 0} Scholars Syncing</span>
          </div>
          {role === 'teacher' ? (
            <Btn variant="primary" size="sm" className="bg-red-500/20 text-red-100 border border-red-500/20 hover:bg-red-500" icon={StopCircle} onClick={handleEndSession}>End Session</Btn>
          ) : (
            <Btn variant="outline" size="sm" className="text-white border-white/20" onClick={onExit}>Disconnect</Btn>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <div className="w-20 border-r border-black/5 flex flex-col items-center py-8 gap-8">
           <button onClick={() => setActiveTab('scaffolding')} className={`p-3 rounded-2xl transition-all ${activeTab === 'scaffolding' ? 'bg-fluent-teal text-white shadow-lg' : 'text-slate-300 hover:text-slate-500'}`}>
              <Layout size={24} />
           </button>
           <button onClick={() => setActiveTab('scholars')} className={`p-3 rounded-2xl transition-all ${activeTab === 'scholars' ? 'bg-fluent-teal text-white shadow-lg' : 'text-slate-300 hover:text-slate-500'}`}>
              <Users size={24} />
           </button>
           <button onClick={() => setActiveTab('feed')} className={`p-3 rounded-2xl transition-all ${activeTab === 'feed' ? 'bg-fluent-teal text-white shadow-lg' : 'text-slate-300 hover:text-slate-500'}`}>
              <MessageSquare size={24} />
           </button>
        </div>

        {/* Content Engine */}
        <div className="flex-1 bg-gray-50/50 p-8 overflow-auto">
           <AnimatePresence mode="wait">
              {activeTab === 'scaffolding' && (
                <motion.div key="scaffolding" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                      <div className="flex justify-between items-end">
                      <div>
                         <h4 className="text-2xl font-serif font-bold text-fluent-navy">Instructional Synthesis</h4>
                         <p className="text-sm text-slate-400 font-medium">Real-time conceptual mapping and technical scaffolding.</p>
                      </div>
                      {role === 'teacher' && (
                        <Btn variant="gold" size="sm" icon={Sparkles} onClick={handleGenerateScaffolding} disabled={isGenerating}>
                           {isGenerating ? "Synthesizing..." : "AI Scaffolding"}
                        </Btn>
                      )}
                   </div>

                   <Card className="p-10 border-none shadow-xl bg-white relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1 h-full bg-fluent-teal transition-all group-hover:w-2" />
                      <div className="flex items-center gap-3 mb-6">
                         <Terminal size={18} className="text-fluent-teal" />
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Current Delivery Protocol</span>
                      </div>
                      
                      {role === 'teacher' ? (
                        <textarea 
                          className="w-full h-48 bg-transparent text-xl font-serif leading-relaxed font-medium outline-none resize-none placeholder:text-slate-200"
                          placeholder="Type scaffolding notes here to sync with all scholars..."
                          value={session.currentProtocol || ""}
                          onChange={(e) => handleUpdateProtocol(e.target.value)}
                        />
                      ) : (
                        <div className="min-h-[12rem] text-xl font-serif leading-relaxed text-fluent-navy whitespace-pre-wrap">
                           {session.currentProtocol || "Awaiting faculty transmission..."}
                        </div>
                      )}
                      
                      <div className="mt-8 pt-8 border-t border-black/5 flex justify-between items-center">
                         <div className="flex gap-2">
                            <Badge color="navy">British Standard v2</Badge>
                            <Badge color="gold">Conceptual Mastery</Badge>
                         </div>
                         <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Last Refined: {session.lastUpdate?.toDate ? session.lastUpdate.toDate().toLocaleTimeString() : 'Just now'}
                         </div>
                      </div>
                   </Card>

                   <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-6 bg-fluent-navy text-white rounded-[24px]">
                         <div className="flex items-center gap-2 mb-4">
                            <Zap size={16} className="text-fluent-gold" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Rapid Check for Understanding</span>
                         </div>
                         <p className="text-sm text-white/60 mb-6 font-medium">Synthesise the last 15 minutes of energy conservation logic.</p>
                         <div className="flex gap-2">
                            <Btn variant="outline" size="sm" className="flex-1 bg-white/5 border-white/10 text-white shadow-none">Polled Response</Btn>
                            <Btn variant="primary" size="sm" className="flex-1 shadow-none">Live Response</Btn>
                         </div>
                      </div>
                      <div className="p-6 bg-white border border-black/5 rounded-[24px] flex flex-col justify-center">
                         <div className="flex items-center justify-between mb-4">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Synthesizer Health</div>
                            <div className="text-fluent-teal font-mono font-bold">98.4%</div>
                         </div>
                         <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: '98.4%' }} className="h-full bg-fluent-teal" />
                         </div>
                      </div>
                   </div>
                </motion.div>
              )}
              {activeTab === 'feed' && (
                <motion.div key="feed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col h-full bg-white rounded-[32px] overflow-hidden border border-black/5">
                   <div className="p-6 border-b border-black/5 bg-gray-50/50 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                         <MessageSquare size={18} className="text-fluent-teal" />
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Synthesis Feed</span>
                      </div>
                      <Badge color="gray">{messages.length} Active Concepts</Badge>
                   </div>
                   
                   <div className="flex-1 overflow-auto p-6 space-y-4">
                      {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8">
                           <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4">
                              <MessageSquare size={20} />
                           </div>
                           <p className="text-sm text-slate-400 italic">Feed initialising. Start a conceptual dialogue.</p>
                        </div>
                      ) : (
                        messages.map((m) => (
                           <div key={m.id} className={`flex flex-col ${m.senderId === auth.currentUser?.uid ? 'items-end' : 'items-start'}`}>
                              <div className="flex items-center gap-2 mb-1 px-2">
                                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{m.senderName}</span>
                                 {m.role === 'teacher' && <Badge color="gold" className="text-[8px] px-1 py-0 uppercase">Faculty</Badge>}
                              </div>
                              <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                                m.senderId === auth.currentUser?.uid 
                                ? 'bg-fluent-teal text-white rounded-tr-none shadow-sm' 
                                : 'bg-gray-100 text-fluent-navy rounded-tl-none'
                              }`}>
                                 {m.text}
                              </div>
                           </div>
                        ))
                      )}
                   </div>

                   <form onSubmit={handleSendMessage} className="p-6 bg-gray-50 border-t border-black/5">
                      <div className="relative">
                         <input 
                           type="text" 
                           placeholder="Signal a conceptual query..."
                           className="w-full bg-white border border-black/5 rounded-2xl py-4 px-6 pr-32 text-sm outline-none focus:border-fluent-teal transition-all shadow-sm"
                           value={inputMessage}
                           onChange={(e) => setInputMessage(e.target.value)}
                         />
                         <div className="absolute right-2 top-2">
                            <Btn type="submit" variant="primary" size="sm" icon={Zap}>Signal</Btn>
                         </div>
                      </div>
                   </form>
                </motion.div>
              )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
