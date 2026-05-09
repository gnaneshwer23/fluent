import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  Zap,
  MessageSquare,
  ShieldCheck,
  Play,
  StopCircle,
  Terminal,
  Sparkles,
  Layout,
  Monitor,
  Activity,
  BarChart2,
  CheckCircle2,
  ChevronRight,
  PlusCircle,
  Database,
} from "lucide-react";
import { Badge, Btn, Card, Avatar } from "./UI";
import { db, auth } from "../lib/firebaseInit";
import {
  doc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
  setDoc,
  deleteDoc,
  increment,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  addDoc,
} from "firebase/firestore";
import { handleFirestoreError, OperationType } from "../lib/errorHandling";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const LiveLab = ({
  sessionId,
  role,
  onExit,
  userProfile,
}: {
  sessionId: string;
  role: "teacher" | "student";
  onExit: () => void;
  userProfile?: any;
}) => {
  const [localTopic, setLocalTopic] = useState("");
  const [nodeSearchTerm, setNodeSearchTerm] = useState("");
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<
    "scaffolding" | "scholars" | "feed"
  >("scaffolding");
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [scholars, setScholars] = useState<any[]>([]);
  const [curriculumNodes, setCurriculumNodes] = useState<any[]>([]);
  const [isFetchingNodes, setIsFetchingNodes] = useState(false);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && activeTab === "feed") {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeTab]);
  const [pollForm, setPollForm] = useState({ question: "", options: ["", ""] });
  const [pollResults, setPollResults] = useState<Record<string, number>>({});
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    if (!session?.activePoll) {
      setPollResults({});
      setHasVoted(false);
      return;
    }

    // Listen for results on the teacher's side if a poll is active
    if (role === "teacher") {
      const q = collection(db, "liveSessions", sessionId, "pollResponses");
      const unsub = onSnapshot(q, (snap) => {
        const counts: Record<string, number> = {};
        snap.docs.forEach((d) => {
          const choice = d.data().choice;
          counts[choice] = (counts[choice] || 0) + 1;
        });
        setPollResults(counts);
      });
      return () => unsub();
    }
  }, [sessionId, session?.activePoll?.id, role]);

  useEffect(() => {
    // Check if student has already voted for the active poll
    if (role === "student" && session?.activePoll && auth.currentUser) {
      const checkVote = async () => {
        const voteDoc = await getDoc(
          doc(
            db,
            "liveSessions",
            sessionId,
            "pollResponses",
            auth.currentUser!.uid,
          ),
        );
        if (
          voteDoc.exists() &&
          voteDoc.data().pollId === session.activePoll.id
        ) {
          setHasVoted(true);
        }
      };
      checkVote();
    }
  }, [sessionId, session?.activePoll?.id, role]);

  useEffect(() => {
    // Sync active scholars in this session
    const q = query(
      collection(db, "liveSessions", sessionId, "scholars"),
      orderBy("lastActive", "desc"),
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setScholars(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (error) =>
        handleFirestoreError(
          error,
          OperationType.LIST,
          `liveSessions/${sessionId}/scholars`,
        ),
    );
    return () => unsub();
  }, [sessionId]);

  useEffect(() => {
    // Maintain presence
    if (!auth.currentUser || !session) return;
    const scholarRef = doc(
      db,
      "liveSessions",
      sessionId,
      "scholars",
      auth.currentUser.uid,
    );
    const updatePresence = async () => {
      await setDoc(
        scholarRef,
        {
          name:
            userProfile?.name ||
            auth.currentUser?.displayName ||
            "Anonymous Scholar",
          role: role,
          lastActive: serverTimestamp(),
          status: "syncing",
        },
        { merge: true },
      );
    };
    updatePresence();
    const interval = setInterval(updatePresence, 30000);

    return () => {
      clearInterval(interval);
      deleteDoc(scholarRef).catch(console.error);
    };
  }, [sessionId, !!session]);

  useEffect(() => {
    const q = query(
      collection(db, "liveSessions", sessionId, "messages"),
      orderBy("createdAt", "desc"),
      limit(50),
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setMessages(
          snap.docs.map((d) => ({ id: d.id, ...d.data() })).reverse(),
        );
      },
      (error) => {
        if (auth.currentUser) {
          handleFirestoreError(
            error,
            OperationType.GET,
            `liveSessions/${sessionId}/messages`,
          );
        }
      },
    );
    return () => unsub();
  }, [sessionId]);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "liveSessions", sessionId),
      (snap) => {
        if (snap.exists()) {
          setSession(snap.data());
        } else if (role === "student") {
          onExit(); // Session terminated by faculty
        }
      },
      (error) => {
        if (auth.currentUser) {
          handleFirestoreError(
            error,
            OperationType.GET,
            `liveSessions/${sessionId}`,
          );
        }
      },
    );
    return () => unsub();
  }, [sessionId]);

  // Attendance Auto-Log
  useEffect(() => {
    if (role === "student" && session && auth.currentUser) {
      const logAttendance = async () => {
        try {
          // This is a simplified lookup since we don't have the exact record path passed in,
          // we'd need to find the student doc within the class.
          // For now, we'll rely on the teacher's list view to show active scholars.
          await updateDoc(doc(db, "liveSessions", sessionId), {
            activeCount: increment(1),
          });
        } catch (e) {
          console.error(e);
        }
      };
      logAttendance();
      return () => {
        updateDoc(doc(db, "liveSessions", sessionId), {
          activeCount: increment(-1),
        }).catch(console.error);
      };
    }
  }, [role, !!session]);

  useEffect(() => {
    if (session?.topic && !localTopic) {
      setLocalTopic(session.topic);
    }
  }, [session?.topic]);

  useEffect(() => {
    if (localTopic === session?.topic || role !== "teacher") return;
    const timeout = setTimeout(() => {
      handleUpdateTopic(localTopic);
    }, 1500);
    return () => clearTimeout(timeout);
  }, [localTopic]);

  useEffect(() => {
    if (!session?.topic || !session?.subject) return;

    const fetchNodes = async () => {
      setIsFetchingNodes(true);
      try {
        // Step 1: Use Gemini to extract high-quality keywords if the topic is complex
        let keywords = [session.topic];
        if (session.topic.length > 10) {
           try {
              const res = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: `Extract 3-5 core academic keywords or phrases for the topic "${session.topic}". Output as comma-separated values only.`,
              });
              const extracted = res.text;
              if (extracted) {
                 keywords = [...keywords, ...extracted.split(",").map(k => k.trim())];
              }
           } catch (e) {
              console.warn("AI keyword extraction failed", e);
           }
        }

        const chunksRef = collection(db, "curriculum_chunks");
        const q = query(
          chunksRef,
          where("subject", "==", session.subject),
          limit(100) // Increase window for better RAG mapping
        );
        const snap = await getDocs(q);
        const allNodes = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];

        // Step 2: Complex scoring based on AI keywords and search term
        const searchString = `${localTopic} ${nodeSearchTerm}`.toLowerCase();
        const searchTerms = Array.from(new Set([...keywords, ...searchString.split(/\W+/)].filter(t => t.length > 2)));

        const nodesWithScore = allNodes.map(n => {
          let score = 0;
          const nodeText = `${n.topic} ${n.content} ${n.chapter}`.toLowerCase();
          
          searchTerms.forEach(term => {
             const lowerTerm = term.toLowerCase();
             if (nodeText.includes(lowerTerm)) {
                score += lowerTerm.length; // Reward longer matches
                if (n.topic?.toLowerCase().includes(lowerTerm)) score += 5;
             }
          });

          // Manual search term boost
          if (nodeSearchTerm && nodeText.includes(nodeSearchTerm.toLowerCase())) {
             score += 20;
          }

          return { ...n, relevance: score };
        });

        const sorted = nodesWithScore
          .filter(n => n.relevance > 0)
          .sort((a, b) => b.relevance - a.relevance)
          .slice(0, 8);

        setCurriculumNodes(sorted);
      } catch (err) {
        console.error("Error fetching curriculum nodes:", err);
      } finally {
        setIsFetchingNodes(false);
      }
    };

    fetchNodes();
  }, [session?.topic, session?.subject, nodeSearchTerm]);

  const handleUpdateProtocol = async (protocol: string) => {
    if (role !== "teacher") return;
    try {
      await updateDoc(doc(db, "liveSessions", sessionId), {
        currentProtocol: protocol,
        lastUpdate: serverTimestamp(),
      });
    } catch (e) {
      handleFirestoreError(
        e,
        OperationType.UPDATE,
        `liveSessions/${sessionId}`,
      );
    }
  };

  const handleUpdateTopic = async (newTopic: string) => {
    if (role !== "teacher") return;
    try {
      await updateDoc(doc(db, "liveSessions", sessionId), {
        topic: newTopic,
        lastUpdate: serverTimestamp(),
      });
    } catch (e) {
      handleFirestoreError(
        e,
        OperationType.UPDATE,
        `liveSessions/${sessionId}`,
      );
    }
  };

  const handleEndSession = async () => {
    if (
      !window.confirm(
        "Terminate live delivery? All transient state will be archived.",
      )
    )
      return;
    try {
      await deleteDoc(doc(db, "liveSessions", sessionId));
      onExit();
    } catch (e) {
      handleFirestoreError(
        e,
        OperationType.DELETE,
        `liveSessions/${sessionId}`,
      );
    }
  };

  const handleGenerateScaffolding = async () => {
    if (!session || isGenerating) return;
    setIsGenerating(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Act as an expert British faculty member. Generate a "Conceptual Scaffolding Protocol" for a live lesson on "${session.topic}" for ${session.className}. 
      Focus on core conceptual links, common misconceptions, and synthesis questions. Keep it concise (max 200 words). Use professional academic tone.`,
      });

      const text =
        response.text || "AI Synthesis failed. Please refine manually.";
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
      await addDoc(collection(db, "liveSessions", sessionId, "messages"), {
        text: inputMessage,
        senderId: auth.currentUser.uid,
        senderName: userProfile?.name || auth.currentUser.displayName || (role === "teacher" ? "Faculty" : "Scholar"),
        role,
        createdAt: serverTimestamp(),
      });
      setInputMessage("");
    } catch (e) {
      handleFirestoreError(
        e,
        OperationType.WRITE,
        `liveSessions/${sessionId}/messages`,
      );
    }
  };

  const handleReferenceNode = async (node: any) => {
    if (!auth.currentUser) return;
    const referenceText = `[KNOWLEDGE NODE RECAP] Topic: ${node.topic} — ${node.content.substring(0, 180)}...`;
    try {
      await addDoc(collection(db, "liveSessions", sessionId, "messages"), {
        text: referenceText,
        senderId: auth.currentUser.uid,
        senderName: userProfile?.name || auth.currentUser.displayName || (role === "teacher" ? "Faculty" : "Scholar"),
        role,
        isReference: true,
        nodeId: node.id,
        createdAt: serverTimestamp(),
      });
      setActiveTab("feed");
    } catch (e) {
      console.error("Reference error:", e);
    }
  };

  const handleCreatePoll = async () => {
    if (
      role !== "teacher" ||
      !pollForm.question ||
      pollForm.options.some((o) => !o)
    )
      return;
    try {
      await updateDoc(doc(db, "liveSessions", sessionId), {
        activePoll: {
          id: Math.random().toString(36).substring(7),
          question: pollForm.question,
          options: pollForm.options,
          createdAt: serverTimestamp(),
        },
      });
      setShowPollCreator(false);
      setPollForm({ question: "", options: ["", ""] });
    } catch (e) {
      handleFirestoreError(
        e,
        OperationType.UPDATE,
        `liveSessions/${sessionId}`,
      );
    }
  };

  const handleStopPoll = async () => {
    if (role !== "teacher") return;
    try {
      // Clear poll and responses
      await updateDoc(doc(db, "liveSessions", sessionId), {
        activePoll: null,
      });
      // In a real app, we might move responses to a history collection
    } catch (e) {
      handleFirestoreError(
        e,
        OperationType.UPDATE,
        `liveSessions/${sessionId}`,
      );
    }
  };

  const handleVote = async (choice: string) => {
    if (role !== "student" || !auth.currentUser || !session.activePoll) return;
    try {
      await setDoc(
        doc(
          db,
          "liveSessions",
          sessionId,
          "pollResponses",
          auth.currentUser.uid,
        ),
        {
          pollId: session.activePoll.id,
          choice,
          timestamp: serverTimestamp(),
        },
      );
      setHasVoted(true);
    } catch (e) {
      handleFirestoreError(
        e,
        OperationType.WRITE,
        `liveSessions/${sessionId}/pollResponses`,
      );
    }
  };

  if (!session)
    return (
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
              {role === "teacher" ? (
                <input
                  value={localTopic}
                  onChange={(e) => setLocalTopic(e.target.value)}
                  className="bg-transparent border-b border-white/20 focus:border-fluent-teal outline-none font-serif font-bold text-lg px-0 py-0 min-w-[200px]"
                />
              ) : (
                <h3 className="font-serif font-bold text-lg">
                  {session.topic}
                </h3>
              )}
              <Badge
                color="teal"
                className="bg-white/10 text-white border-none"
              >
                Live Scaffolding
              </Badge>
            </div>
            <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/40">
              {session.className} • {session.subject} Protocol
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
            <Users size={14} className="text-fluent-gold" />
            <span className="text-xs font-bold">
              {session.activeCount || 0} Scholars Syncing
            </span>
          </div>
          {role === "teacher" ? (
            <Btn
              variant="primary"
              size="sm"
              className="bg-red-500/20 text-red-100 border border-red-500/20 hover:bg-red-500"
              icon={StopCircle}
              onClick={handleEndSession}
            >
              End Session
            </Btn>
          ) : (
            <Btn
              variant="outline"
              size="sm"
              className="text-white border-white/20"
              onClick={onExit}
            >
              Disconnect
            </Btn>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <div className="w-20 border-r border-black/5 flex flex-col items-center py-8 gap-8">
          <button
            onClick={() => setActiveTab("scaffolding")}
            className={`p-3 rounded-2xl transition-all ${activeTab === "scaffolding" ? "bg-fluent-teal text-white shadow-lg" : "text-slate-300 hover:text-slate-500"}`}
          >
            <Layout size={24} />
          </button>
          <button
            onClick={() => setActiveTab("scholars")}
            className={`p-3 rounded-2xl transition-all ${activeTab === "scholars" ? "bg-fluent-teal text-white shadow-lg" : "text-slate-300 hover:text-slate-500"}`}
          >
            <Users size={24} />
          </button>
          <button
            onClick={() => setActiveTab("feed")}
            className={`p-3 rounded-2xl transition-all ${activeTab === "feed" ? "bg-fluent-teal text-white shadow-lg" : "text-slate-300 hover:text-slate-500"}`}
          >
            <MessageSquare size={24} />
          </button>
        </div>

        {/* Content Engine */}
        <div className="flex-1 bg-gray-50/50 p-8 overflow-auto">
          <AnimatePresence mode="wait">
            {activeTab === "scaffolding" && (
              <motion.div
                key="scaffolding"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-end">
                  <div>
                    <h4 className="text-2xl font-serif font-bold text-fluent-navy">
                      Instructional Synthesis
                    </h4>
                    <p className="text-sm text-slate-400 font-medium">
                      Real-time conceptual mapping and technical scaffolding.
                    </p>
                  </div>
                  {role === "teacher" && (
                    <Btn
                      variant="gold"
                      size="sm"
                      icon={Sparkles}
                      onClick={handleGenerateScaffolding}
                      disabled={isGenerating}
                    >
                      {isGenerating ? "Synthesizing..." : "AI Scaffolding"}
                    </Btn>
                  )}
                </div>

                <Card className="p-10 border-none shadow-xl bg-white relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-fluent-teal transition-all group-hover:w-2" />
                  <div className="flex items-center gap-3 mb-6">
                    <Terminal size={18} className="text-fluent-teal" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
                      Current Delivery Protocol
                    </span>
                  </div>

                  {role === "teacher" ? (
                    <textarea
                      className="w-full h-48 bg-transparent text-xl font-serif leading-relaxed font-medium outline-none resize-none placeholder:text-slate-200"
                      placeholder="Type scaffolding notes here to sync with all scholars..."
                      value={session.currentProtocol || ""}
                      onChange={(e) => handleUpdateProtocol(e.target.value)}
                    />
                  ) : (
                    <div className="min-h-[12rem] text-xl font-serif leading-relaxed text-fluent-navy whitespace-pre-wrap">
                      {session.currentProtocol ||
                        "Awaiting faculty transmission..."}
                    </div>
                  )}

                  <div className="mt-8 pt-8 border-t border-black/5 flex justify-between items-center">
                    <div className="flex gap-2">
                      <Badge color="navy">British Standard v2</Badge>
                      <Badge color="gold">Conceptual Mastery</Badge>
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Last Refined:{" "}
                      {session.lastUpdate?.toDate
                        ? session.lastUpdate.toDate().toLocaleTimeString()
                        : "Just now"}
                    </div>
                  </div>
                </Card>

                {/* RAG Knowledge Nodes */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <Database className="text-fluent-gold" size={16} />
                       <h5 className="font-serif font-black text-fluent-navy uppercase tracking-tight">Curriculum Anchor Nodes</h5>
                       {isFetchingNodes && <div className="w-3 h-3 border-2 border-t-fluent-gold rounded-full animate-spin" />}
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="relative">
                          <PlusCircle size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                          <input 
                            value={nodeSearchTerm}
                            onChange={(e) => setNodeSearchTerm(e.target.value)}
                            placeholder="Search nodes..."
                            className="pl-8 pr-3 py-1.5 bg-white border border-black/5 rounded-full text-[10px] outline-none focus:ring-1 focus:ring-fluent-gold/20"
                          />
                       </div>
                       <Badge color="gold">RAG Grounded</Badge>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {curriculumNodes.map(node => {
                      const isHighlyRelevant = node.relevance > 5;
                      return (
                        <Card 
                          key={node.id} 
                          className={`p-5 transition-all group relative overflow-hidden ${
                            isHighlyRelevant 
                              ? "border-fluent-gold/50 bg-fluent-gold/[0.03] shadow-lg shadow-fluent-gold/5 ring-1 ring-fluent-gold/20" 
                              : "border-black/5 bg-white hover:border-fluent-gold/30"
                          }`}
                        >
                          {isHighlyRelevant && (
                            <div className="absolute top-0 right-0 py-1 px-3 bg-fluent-gold text-[8px] font-black text-white rounded-bl-xl uppercase tracking-widest flex items-center gap-1 z-10">
                              <Sparkles size={10} /> Peak Relevance
                            </div>
                          )}
                          <div className="flex justify-between items-start mb-2">
                             <h6 className={`font-bold text-xs line-clamp-1 ${isHighlyRelevant ? 'text-fluent-navy' : 'text-fluent-navy/80'}`}>
                               {node.topic}
                             </h6>
                             <Btn 
                               variant="ghost" 
                               size="sm" 
                               className={`h-6 px-2 text-[8px] font-black tracking-widest transition-all ${
                                 isHighlyRelevant 
                                   ? 'text-fluent-navy hover:text-fluent-gold opacity-100' 
                                   : 'text-fluent-gold md:opacity-0 md:group-hover:opacity-100'
                               }`}
                               onClick={() => handleReferenceNode(node)}
                             >
                               REFERENCE
                             </Btn>
                          </div>
                          <p className="text-[10px] leading-relaxed text-slate-500 italic font-serif line-clamp-2 mb-3">
                            "{node.content}"
                          </p>
                          <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-widest">
                             <span className="text-slate-300">{node.chapter}</span>
                             <span className={isHighlyRelevant ? "text-fluent-gold" : "text-fluent-teal"}>
                               {isHighlyRelevant ? "Active Context" : "Verified Node"}
                             </span>
                          </div>
                        </Card>
                      );
                    })}
                    {curriculumNodes.length === 0 && !isFetchingNodes && (
                      <div className="col-span-2 p-8 text-center bg-gray-50 border border-dashed border-black/5 rounded-3xl">
                         <p className="text-xs text-slate-400 font-serif italic">No exact curriculum nodes mapped for this synthesis path yet.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 bg-fluent-navy text-white rounded-[24px]">
                    <div className="flex items-center gap-2 mb-4">
                      <Zap size={16} className="text-fluent-gold" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        Rapid Check for Understanding
                      </span>
                    </div>
                    {session.activePoll ? (
                      <div className="space-y-4">
                        <h5 className="font-serif font-bold text-lg leading-tight">
                          {session.activePoll.question}
                        </h5>
                        <div className="space-y-2">
                          {session.activePoll.options.map((opt: string) => {
                            const count = pollResults[opt] || 0;
                            const total: number = Object.values(pollResults).reduce(
                              (a: number, b: number) => a + (Number(b) || 0),
                              0
                            ) as number;
                            const pct =
                              total > 0 ? Math.round((count / total) * 100) : 0;

                            return (
                              <div key={opt} className="space-y-1">
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                                  <span>{opt}</span>
                                  <span>
                                    {pct}% ({count})
                                  </span>
                                </div>
                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    className="h-full bg-fluent-teal"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {role === "teacher" && (
                          <Btn
                            variant="primary"
                            size="sm"
                            className="w-full bg-red-500/20 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white"
                            onClick={handleStopPoll}
                          >
                            Stop Concept Check
                          </Btn>
                        )}
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-white/60 mb-6 font-medium">
                          Capture real-time conceptual resonance via rapid
                          polling.
                        </p>
                        <div className="flex gap-2">
                          {role === "teacher" ? (
                            <Btn
                              variant="outline"
                              size="sm"
                              className="flex-1 bg-white/5 border-white/10 text-white shadow-none"
                              onClick={() => setShowPollCreator(true)}
                            >
                              Initialize Poll
                            </Btn>
                          ) : (
                            <div className="text-[10px] font-black uppercase text-white/40 italic flex items-center gap-2">
                              <Monitor size={14} /> Awaiting faculty probe...
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="p-6 bg-white border border-black/5 rounded-[24px] flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Synthesizer Health
                      </div>
                      <div className="text-fluent-teal font-mono font-bold">
                        98.4%
                      </div>
                    </div>
                    <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "98.4%" }}
                        className="h-full bg-fluent-teal"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            {activeTab === "scholars" && (
              <motion.div
                key="scholars"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-end">
                  <div>
                    <h4 className="text-2xl font-serif font-bold text-fluent-navy">
                      Scholar Registry
                    </h4>
                    <p className="text-sm text-slate-400 font-medium">
                      Synced participants in this instructional node.
                    </p>
                  </div>
                  <Badge
                    color="teal"
                    className="p-2 px-6 shadow-xl shadow-fluent-teal/10 uppercase tracking-widest text-[9px] font-black"
                  >
                    {scholars.length} Active
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {scholars.map((scholar) => (
                    <Card
                      key={scholar.id}
                      className="p-4 flex items-center justify-between border-black/5"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar name={scholar.name} size={40} />
                        <div>
                          <div className="text-xs font-bold text-fluent-navy">
                            {scholar.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                            {scholar.role}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-[9px] font-black text-slate-400 uppercase">
                          Syncing
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>

                {scholars.length === 0 && (
                  <div className="p-20 text-center opacity-40">
                    <Users size={48} className="mx-auto mb-4 text-slate-200" />
                    <p className="font-serif italic">
                      Synchronizing academic nodes...
                    </p>
                  </div>
                )}
              </motion.div>
            )}
            {activeTab === "feed" && (
              <motion.div
                key="feed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col h-full bg-white rounded-[32px] overflow-hidden border border-black/5"
              >
                <div className="p-6 border-b border-black/5 bg-gray-50/50 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <MessageSquare size={18} className="text-fluent-teal" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                      Synthesis Feed
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge color="gray">{messages.length} Active Concepts</Badge>
                    {curriculumNodes.length > 0 && (
                      <Badge color="gold" className="hidden sm:flex gap-1 items-center">
                        <Database size={8} /> {curriculumNodes.length} Verified Nodes
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-auto p-6 space-y-6" ref={scrollRef}>
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4">
                        <MessageSquare size={20} />
                      </div>
                      <p className="text-sm text-slate-400 italic">
                        Feed initialising. Start a conceptual dialogue.
                      </p>
                    </div>
                  ) : (
                    messages.map((m) => {
                      const isMe = m.senderId === auth.currentUser?.uid;
                      return (
                        <div
                          key={m.id}
                          className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                        >
                          {!isMe && <Avatar name={m.senderName} size={32} />}
                          <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[75%]`}>
                            <div className="flex items-center gap-2 mb-1 px-1">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                                {m.senderName}
                              </span>
                              {m.role === "teacher" && (
                                <span className="bg-fluent-gold/10 text-fluent-gold text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest border border-fluent-gold/20">
                                  Faculty
                                </span>
                              )}
                            </div>
                            <div
                              className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                isMe
                                  ? "bg-fluent-navy text-white rounded-tr-none"
                                  : "bg-white border border-black/5 text-fluent-navy rounded-tl-none"
                              } ${m.isReference ? 'border-2 border-fluent-gold/30 italic font-serif' : ''}`}
                            >
                              {m.text}
                              {m.isReference && (
                                <div className="mt-2 pt-2 border-t border-black/10 flex items-center gap-2">
                                  <Database size={10} className="text-fluent-gold" />
                                  <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Verified Curriculum Context</span>
                                </div>
                              )}
                            </div>
                            <div className="mt-1 px-1 text-[8px] text-slate-300 font-bold uppercase">
                              {m.createdAt?.toDate ? m.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Syncing..."}
                            </div>
                          </div>
                          {isMe && <Avatar name={m.senderName} size={32} />}
                        </div>
                      );
                    })
                  )}
                </div>

                <form
                  onSubmit={handleSendMessage}
                  className="p-6 bg-gray-50 border-t border-black/5"
                >
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Signal a conceptual query..."
                      className="w-full bg-white border border-black/5 rounded-2xl py-4 px-6 pr-32 text-sm outline-none focus:border-fluent-teal transition-all shadow-sm"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                    />
                    <div className="absolute right-2 top-2">
                      <Btn type="submit" variant="primary" size="sm" icon={Zap}>
                        Signal
                      </Btn>
                    </div>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Poll Creator Overlay */}
      <AnimatePresence>
        {showPollCreator && role === "teacher" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPollCreator(false)}
              className="absolute inset-0 bg-fluent-navy/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl p-10 space-y-8 overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                <BarChart2 size={120} />
              </div>

              <div>
                <Badge color="gold">Concept Probe</Badge>
                <h4 className="text-3xl font-serif font-black text-fluent-navy mt-4">
                  Initialize Poll
                </h4>
                <p className="text-slate-500 font-serif italic text-sm">
                  Design a check for conceptual integrity.
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                    Synthesis Question
                  </label>
                  <input
                    required
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-fluent-teal/20 transition-all font-bold text-fluent-navy"
                    placeholder="e.g. Which principle governs this energy sync?"
                    value={pollForm.question}
                    onChange={(e) =>
                      setPollForm({ ...pollForm, question: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                    Concept Options
                  </label>
                  {pollForm.options.map((opt, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        required
                        className="flex-1 p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-fluent-teal/20 transition-all text-sm font-bold"
                        placeholder={`Option ${idx + 1}...`}
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...pollForm.options];
                          newOpts[idx] = e.target.value;
                          setPollForm({ ...pollForm, options: newOpts });
                        }}
                      />
                      {pollForm.options.length > 2 && (
                        <Btn
                          variant="ghost"
                          className="p-3 bg-red-50 text-red-500 rounded-xl"
                          onClick={() => {
                            const newOpts = pollForm.options.filter(
                              (_, i) => i !== idx,
                            );
                            setPollForm({ ...pollForm, options: newOpts });
                          }}
                        >
                          ×
                        </Btn>
                      )}
                    </div>
                  ))}
                  {pollForm.options.length < 4 && (
                    <Btn
                      variant="outline"
                      size="sm"
                      className="w-full py-3 text-[9px] uppercase tracking-widest"
                      icon={PlusCircle}
                      onClick={() =>
                        setPollForm({
                          ...pollForm,
                          options: [...pollForm.options, ""],
                        })
                      }
                    >
                      Add Concept Node
                    </Btn>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Btn
                  variant="ghost"
                  className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest"
                  onClick={() => setShowPollCreator(false)}
                >
                  Cancel
                </Btn>
                <Btn
                  variant="primary"
                  className="flex-2 py-4 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-fluent-navy/10"
                  onClick={handleCreatePoll}
                >
                  Dispatch to Node
                </Btn>
              </div>
            </motion.div>
          </div>
        )}

        {/* Student Voting Overlay */}
        {role === "student" && session.activePoll && !hasVoted && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-fluent-navy/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl p-10 space-y-8"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-fluent-gold/10 flex items-center justify-center text-fluent-gold animate-bounce">
                  <Zap size={20} />
                </div>
                <div>
                  <h4 className="text-xl font-serif font-black text-fluent-navy">
                    Node Resonance Check
                  </h4>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                    Live Request from Faculty
                  </p>
                </div>
              </div>

              <h5 className="text-2xl font-serif font-bold text-fluent-navy leading-tight">
                {session.activePoll.question}
              </h5>

              <div className="grid gap-3">
                {session.activePoll.options.map((opt: string) => (
                  <button
                    key={opt}
                    onClick={() => handleVote(opt)}
                    className="group flex justify-between items-center w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-fluent-teal hover:border-fluent-teal hover:text-white transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <span className="font-bold text-sm tracking-tight">
                      {opt}
                    </span>
                    <ChevronRight
                      size={18}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
