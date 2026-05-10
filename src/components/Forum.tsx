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
        <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mb-6">
          <ShieldCheck size={32} className="text-stone-500" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-fluent-midnight">Protocol Suspended</h2>
        <p className="text-stone-600 mt-2 max-w-md mx-auto font-serif italic text-sm">The Global Communication Protocol has been temporarily deactivated by the Provincial Authority for maintenance.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-280px)] px-4">
      {/* Sidebar - Topics */}
      <div className="w-full lg:w-80 shrink-0 space-y-6">
        <div className="text-[10px] font-display font-medium uppercase text-stone-600 tracking-[0.2em] px-4">Knowledge Nodes</div>
        <div className="space-y-1">
          {topics.map(topic => (
            <button
              key={topic.id}
              onClick={() => setActiveTopic(topic.id)}
              className={`w-full text-left p-4 rounded transition-all flex items-center gap-4 group ${
                activeTopic === topic.id 
                  ? "bg-fluent-midnight text-fluent-gold" 
                  : "hover:bg-stone-50 border border-transparent hover:border-black/5"
              }`}
            >
              <div className={`w-10 h-10 rounded flex items-center justify-center transition-colors ${
                activeTopic === topic.id ? "bg-white/10" : "bg-stone-50 text-stone-600 group-hover:bg-white group-hover:text-fluent-midnight"
              }`}>
                <topic.icon size={18} />
              </div>
              <div>
                <div className="text-sm font-bold tracking-tight">{topic.label}</div>
                <div className={`text-[10px] font-display font-medium leading-tight mt-1 ${activeTopic === topic.id ? "text-white/60" : "text-stone-500"}`}>
                  {topic.desc}
                </div>
              </div>
            </button>
          ))}
        </div>

        <Card className="p-6 bg-fluent-gold/5 border-fluent-gold/10 mt-8">
           <div className="flex items-center gap-2 text-fluent-gold font-bold text-[10px] uppercase tracking-widest mb-3">
              <ShieldCheck size={14} /> Security Protocol
           </div>
           <p className="text-[10px] text-stone-700 leading-relaxed italic font-serif">All transmissions are monitored by the Provincial AI for academic integrity and behavioral alignment.</p>
        </Card>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden min-h-0">
        {/* Header */}
        <div className="p-6 border-b border-black/5 flex justify-between items-center bg-stone-50/30">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-fluent-gold animate-pulse shadow-[0_0_8px_rgba(184,151,58,0.5)]" />
            <div>
              <h3 className="text-sm font-bold text-fluent-midnight tracking-tight uppercase font-display">{topics.find(t => t.id === activeTopic)?.label}</h3>
              <p className="text-[10px] text-stone-600 font-medium uppercase tracking-widest">Real-time Node :: {messages.length} Threads</p>
            </div>
          </div>
          <div className="flex gap-1">
            <Btn variant="ghost" size="sm" icon={Search} className="scale-90" />
            <Btn variant="ghost" size="sm" icon={Filter} className="scale-90" />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20">
               <div className="w-10 h-10 border-2 border-fluent-midnight/10 border-t-fluent-midnight rounded-full animate-spin mb-4" />
               <p className="text-[9px] font-black uppercase tracking-widest">Hydrating Channels...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-12">
               <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mb-6 text-stone-400">
                  <MessageSquare size={32} />
               </div>
               <p className="font-serif italic text-stone-600 text-sm">The channel is silent. <br/>Initiate academic discourse.</p>
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
                    {!isMe && <Avatar name={msg.userName} size={36} />}
                    <div className={`max-w-[75%] ${isMe ? 'items-end' : ''} flex flex-col`}>
                      <div className={`flex items-center gap-2 mb-1.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                        <span className="text-[11px] font-bold text-fluent-midnight uppercase tracking-wide">{msg.userName}</span>
                        {isAdmin && <Badge color="gold" className="text-[8px] px-1.5 py-0 uppercase">Staff</Badge>}
                        <span className="text-[9px] text-stone-600 font-display">
                          {msg.createdAt?.toDate ? new Date(msg.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                        </span>
                      </div>
                      <div className={`p-4 text-[13px] leading-relaxed font-serif ${
                        isMe 
                          ? "bg-fluent-midnight text-white rounded-lg rounded-tr-none" 
                          : "bg-stone-50 text-stone-700 rounded-lg rounded-tl-none border border-black/5"
                      }`}>
                        {msg.text}
                      </div>
                      <div className={`flex items-center gap-4 mt-2 px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                        <button className="text-[9px] font-bold text-stone-500 flex items-center gap-1 hover:text-fluent-gold transition-colors uppercase tracking-widest">
                          <ThumbsUp size={10} /> {msg.likes || 0}
                        </button>
                        <button className="text-[9px] font-bold text-stone-500 hover:text-fluent-midnight transition-colors uppercase tracking-widest">Reply</button>
                        {!isMe && <button className="text-[9px] font-bold text-stone-500 hover:text-red-500 transition-colors uppercase tracking-widest">Report</button>}
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
        <div className="p-6 bg-stone-50/30 border-t border-black/5">
          <form onSubmit={handleSendMessage} className="relative">
            <input 
              type="text" 
              placeholder="Synthesize a contribution..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="w-full pl-6 pr-24 py-4 bg-white border border-black/5 rounded-lg text-sm font-medium text-fluent-midnight outline-none focus:ring-1 focus:ring-fluent-gold/20 transition-all placeholder:text-stone-500 font-serif italic"
            />
            <div className="absolute inset-y-0 right-2 flex items-center gap-2">
              <button 
                type="button"
                className="p-2 text-stone-400 hover:text-fluent-gold transition-colors"
                title="AI Assist"
              >
                <Sparkles size={18} />
              </button>
              <button 
                type="submit"
                disabled={!newMessage.trim() || isSending}
                className={`p-2 w-9 h-9 rounded flex items-center justify-center transition-all ${
                  newMessage.trim() ? "bg-fluent-gold text-white shadow-lg shadow-fluent-gold/20" : "bg-stone-100 text-stone-200"
                }`}
              >
                <Send size={16} />
              </button>
            </div>
          </form>
          <div className="flex justify-between items-center mt-3 px-1">
             <div className="text-[8px] font-bold text-stone-600 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={10} /> Secure Node :: Encrypted
             </div>
             <div className="text-[8px] text-stone-600 font-medium uppercase tracking-widest">Shift + Enter for Line</div>
          </div>
        </div>
      </div>
    </div>
  );
};
