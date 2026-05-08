import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, MessageSquare, Hash, User, ShieldCheck, Clock, Search, 
  MoreVertical, ThumbsUp, Reply, Flag, Sparkles, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, query, orderBy, limit, onSnapshot, addDoc, 
  serverTimestamp, where, doc, getDoc 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebaseInit';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';
import { Badge, Btn, Avatar, Card } from './UI';

interface Message {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userRole: string;
  topic: string;
  createdAt: any;
  likes?: number;
  schoolId?: string;
}

export const Forum = ({ userProfile }: { userProfile: any }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeTopic, setActiveTopic] = useState("general");
  const [isSending, setIsSending] = useState(false);
  const [systemEnabled, setSystemEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const topics = [
    { id: "general", label: "General Hub", icon: MessageSquare, desc: "Global academic discourse" },
    { id: "stem", label: "STEM Lab", icon: Sparkles, desc: "Advanced logic & synthesis" },
    { id: "humanities", label: "Humanities Core", icon: Hash, desc: "Philosophy & global perspectives" },
    { id: "university", label: "University Prep", icon: Clock, desc: "Pathways to elite institutions" },
  ];

  useEffect(() => {
    // Check global communication protocol status
    const checkStatus = async () => {
      const snap = await getDoc(doc(db, 'platform', 'config'));
      if (snap.exists()) {
        const data = snap.data();
        setSystemEnabled(data.globalChat !== false);
      }
    };
    checkStatus();

    const q = query(
      collection(db, "forum_messages"),
      where("topic", "==", activeTopic),
      orderBy("createdAt", "asc"),
      limit(50)
    );

    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as Message)));
      setLoading(false);
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "forum_messages"));

    return () => unsub();
  }, [activeTopic]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending || !systemEnabled) return;

    setIsSending(true);
    try {
      await addDoc(collection(db, "forum_messages"), {
        text: newMessage.trim(),
        userId: auth.currentUser?.uid,
        userName: userProfile?.name || auth.currentUser?.displayName || "Anonymous Scholar",
        userRole: userProfile?.role || "student",
        topic: activeTopic,
        schoolId: userProfile?.schoolId || "global",
        createdAt: serverTimestamp(),
        likes: 0
      });
      setNewMessage("");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "forum_messages");
    } finally {
      setIsSending(false);
    }
  };

  if (!systemEnabled) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
          <ShieldCheck size={32} className="text-slate-300" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-fluent-navy">Protocol Suspended</h2>
        <p className="text-slate-400 mt-2 max-w-md mx-auto">The Global Communication Protocol has been temporarily deactivated by the Provincial Authority for maintenance or policy refinement.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-280px)]">
      {/* Sidebar - Topics */}
      <div className="w-full lg:w-80 shrink-0 space-y-6">
        <div className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] px-4">Knowledge Nodes</div>
        <div className="space-y-2">
          {topics.map(topic => (
            <button
              key={topic.id}
              onClick={() => setActiveTopic(topic.id)}
              className={`w-full text-left p-4 rounded-2xl transition-all flex items-center gap-4 group ${
                activeTopic === topic.id 
                  ? "bg-fluent-navy text-white shadow-xl shadow-fluent-navy/10" 
                  : "hover:bg-slate-50 border border-transparent hover:border-black/5"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                activeTopic === topic.id ? "bg-white/10" : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-fluent-teal"
              }`}>
                <topic.icon size={20} />
              </div>
              <div>
                <div className="text-sm font-bold tracking-tight">{topic.label}</div>
                <div className={`text-[10px] font-medium leading-tight mt-1 ${activeTopic === topic.id ? "text-white/60" : "text-slate-400"}`}>
                  {topic.desc}
                </div>
              </div>
            </button>
          ))}
        </div>

        <Card className="p-6 bg-fluent-teal/5 border-fluent-teal/10 mt-8">
           <div className="flex items-center gap-2 text-fluent-teal font-black text-[10px] uppercase tracking-widest mb-3">
              <ShieldCheck size={14} /> Security Protocol
           </div>
           <p className="text-[10px] text-slate-500 leading-relaxed italic">All transmissions are monitored by the Provincial AI for academic integrity and behavioral alignment.</p>
        </Card>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden min-h-0">
        {/* Header */}
        <div className="p-6 border-b border-black/5 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <div>
              <h3 className="text-sm font-bold text-fluent-navy tracking-tight">{topics.find(t => t.id === activeTopic)?.label}</h3>
              <p className="text-[10px] text-slate-400 font-medium">Real-time Transmission Node :: {messages.length} active threads</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Btn variant="ghost" size="sm" icon={Search} className="scale-75 origin-right" />
            <Btn variant="ghost" size="sm" icon={Filter} className="scale-75 origin-right" />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20">
               <div className="w-12 h-12 border-4 border-fluent-navy/10 border-t-fluent-navy rounded-full animate-spin mb-4" />
               <p className="text-[10px] font-black uppercase tracking-widest">Hydrating Channels...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-12">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200">
                  <MessageSquare size={32} />
               </div>
               <p className="font-serif italic text-slate-400">The channel is silent. <br/>Initiate the academic discourse.</p>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => {
                const isMe = msg.userId === auth.currentUser?.uid;
                const isAdmin = msg.userRole === 'admin' || msg.userRole === 'teacher';

                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={msg.id} 
                    className={`flex gap-4 ${isMe ? 'flex-row-reverse' : ''}`}
                  >
                    {!isMe && <Avatar name={msg.userName} size={40} />}
                    <div className={`max-w-[80%] ${isMe ? 'items-end' : ''} flex flex-col`}>
                      <div className={`flex items-center gap-2 mb-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                        <span className="text-[11px] font-black text-fluent-navy">{msg.userName}</span>
                        {isAdmin && <Badge color="gold" className="text-[9px] px-1 py-0 uppercase">Staff</Badge>}
                        <span className="text-[9px] text-slate-400">
                          {msg.createdAt?.toDate ? new Date(msg.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                        </span>
                      </div>
                      <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                        isMe 
                          ? "bg-fluent-navy text-white rounded-tr-none" 
                          : "bg-slate-50 text-slate-700 rounded-tl-none border border-black/5"
                      }`}>
                        {msg.text}
                      </div>
                      <div className={`flex items-center gap-4 mt-2 px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                        <button className="text-[10px] font-bold text-slate-400 flex items-center gap-1 hover:text-fluent-teal transition-colors">
                          <ThumbsUp size={12} /> {msg.likes || 0}
                        </button>
                        <button className="text-[10px] font-bold text-slate-400 hover:text-fluent-teal transition-colors">Reply</button>
                        {!isMe && <button className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors">Report</button>}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={scrollRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-gray-50/50 border-t border-black/5">
          <form onSubmit={handleSendMessage} className="relative">
            <input 
              type="text" 
              placeholder="Synthesize a contribution..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="w-full pl-6 pr-24 py-4 bg-white border border-black/5 rounded-2xl text-sm font-medium text-fluent-navy outline-none focus:ring-4 focus:ring-fluent-teal/5 focus:border-fluent-teal/20 transition-all placeholder:text-slate-400"
            />
            <div className="absolute inset-y-0 right-2 flex items-center gap-2">
              <button 
                type="button"
                className="p-2 text-slate-300 hover:text-fluent-teal transition-colors"
                title="AI Assist"
              >
                <Sparkles size={18} />
              </button>
              <button 
                type="submit"
                disabled={!newMessage.trim() || isSending}
                className={`p-2 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  newMessage.trim() ? "bg-fluent-teal text-white shadow-lg shadow-fluent-teal/20" : "bg-slate-100 text-slate-300"
                }`}
              >
                <Send size={18} />
              </button>
            </div>
          </form>
          <div className="flex justify-between items-center mt-3 px-1">
             <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={10} /> Encrypted Transmission Node
             </div>
             <div className="text-[9px] text-slate-400 font-medium">Shift + Enter for multi-line</div>
          </div>
        </div>
      </div>
    </div>
  );
};
