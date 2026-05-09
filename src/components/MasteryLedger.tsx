import React, { useState, useEffect } from 'react';
import { 
  Library, BookOpen, Search, Download, ExternalLink, 
  Sparkles, FileText, Globe, Star, Filter, ArrowRight,
  ShieldCheck, Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, query, orderBy, limit, onSnapshot, 
  where, doc, getDoc, getDocs
} from 'firebase/firestore';
import { db, auth } from '../lib/firebaseInit';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';
import { Badge, Btn, Card, Avatar } from './UI';

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'guide' | 'paper' | 'video' | 'interactive';
  tags: string[];
  url: string;
  authorName: string;
  isAiGenerated: boolean;
  tier: 'foundation' | 'advanced' | 'elite';
  createdAt: any;
  downloads: number;
}

export const MasteryLedger = ({ userProfile }: { userProfile: any }) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: "all", label: "All Nodes" },
    { id: "scaffolding", label: "Academic Scaffolding" },
    { id: "synthesis", label: "Logic Synthesis" },
    { id: "preparation", label: "Elite Entry Prep" },
    { id: "research", label: "Primary Research" },
  ];

  useEffect(() => {
    let q = query(
      collection(db, "mastery_resources"),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    if (selectedCategory !== "all") {
      q = query(
        collection(db, "mastery_resources"),
        where("category", "==", selectedCategory),
        orderBy("createdAt", "desc"),
        limit(50)
      );
    }

    const unsub = onSnapshot(q, (snap) => {
      setResources(snap.docs.map(d => ({ id: d.id, ...d.data() } as Resource)));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "mastery_resources"));

    return () => unsub();
  }, [selectedCategory]);

  const filteredResources = resources.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Header & Search */}
      <header className="flex flex-col md:flex-row justify-between items-end gap-8">
        <div className="space-y-4">
          <Badge color="gold" icon={Library}>Mastery Ledger v3.0</Badge>
          <h1 className="text-5xl font-serif font-black tracking-tighter text-fluent-navy leading-none">Knowledge Repository</h1>
          <p className="text-xl text-slate-600 font-serif italic">Synthesized academic nodes and primary research briefs.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <input 
            type="text" 
            placeholder="Search by topic, keyword, or node ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-6 py-5 bg-white border border-black/5 rounded-[32px] text-sm font-bold text-fluent-navy outline-none focus:ring-4 focus:ring-fluent-gold/5 focus:border-fluent-gold/20 transition-all shadow-sm"
          />
        </div>
      </header>

      {/* Categories */}
      <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
              selectedCategory === cat.id 
                ? "bg-fluent-navy text-white border-fluent-navy shadow-xl shadow-fluent-navy/20" 
                : "bg-white text-slate-600 border-black/5 hover:border-black/10"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredResources.map((resource, idx) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={resource.id}
            >
              <Card className="flex flex-col h-full group hover:border-fluent-gold/30 transition-all relative overflow-hidden bg-white shadow-sm border-black/5 p-8 rounded-[40px]">
                <div className="flex justify-between items-start mb-8">
                  <div className={`p-4 rounded-2xl ${
                    resource.type === 'guide' ? 'bg-fluent-teal/5 text-fluent-teal' :
                    resource.type === 'paper' ? 'bg-fluent-gold/5 text-fluent-gold' :
                    'bg-fluent-navy/5 text-fluent-navy'
                  }`}>
                    {resource.isAiGenerated ? <Sparkles size={20} /> : <FileText size={20} />}
                  </div>
                  <Badge color={resource.tier === 'elite' ? 'gold' : 'teal'} className="text-[8px] px-2 py-0.5">
                    {resource.tier.toUpperCase()}
                  </Badge>
                </div>

                <div className="flex-1 space-y-4">
                  <h3 className="text-xl font-serif font-black text-fluent-navy group-hover:text-fluent-gold transition-colors leading-tight">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-serif italic line-clamp-3">
                    {resource.description}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {resource.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">#{tag}</span>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-black/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={resource.authorName} size={24} />
                    <span className="text-[10px] font-black text-fluent-navy uppercase tracking-widest">{resource.authorName}</span>
                  </div>
                  <div className="flex gap-2">
                    <Btn variant="ghost" size="sm" icon={Share2} className="p-2 h-auto text-slate-500 hover:text-fluent-teal" />
                    <Btn variant="primary" size="sm" icon={Download} className="rounded-xl px-4 py-2 text-[10px] uppercase font-black">Access</Btn>
                  </div>
                </div>
                
                {resource.isAiGenerated && (
                  <div className="absolute top-0 right-0 p-1 opacity-20 pointer-events-none">
                     <Sparkles size={100} className="text-fluent-gold -rotate-12 translate-x-12 -translate-y-12" />
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredResources.length === 0 && !loading && (
        <div className="py-20 text-center">
           <Library size={64} className="mx-auto mb-6 text-slate-100" />
           <h3 className="text-2xl font-serif font-bold text-fluent-navy">No Matching Nodes</h3>
           <p className="text-slate-400 italic">Expand your search parameters or request a new synthesis.</p>
        </div>
      )}

      {/* Featured AI Synthesis */}
      <section className="bg-fluent-navy rounded-[48px] p-12 lg:p-20 text-white relative overflow-hidden shadow-2xl shadow-fluent-navy/30">
        <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none scale-150">
           <Globe size={400} />
        </div>
        <div className="max-w-3xl relative z-10 space-y-8">
           <Badge color="gold" className="bg-fluent-gold/20 text-fluent-gold border-fluent-gold/30">Intelligence Spotlight</Badge>
           <h2 className="text-5xl font-serif font-black tracking-tighter leading-[1.1]">Request a Custom Synthesis Brief</h2>
           <p className="text-xl text-white/80 font-serif italic leading-relaxed">
             Leverage the InfoFluent Provincial AI to generate a targeted research paper or study guide based on your current academic gaps and mastery profile.
           </p>
           <div className="flex gap-4 pt-4">
             <Btn variant="gold" icon={Sparkles} size="lg">Initialize AI Synthesis</Btn>
             <Btn variant="outline" className="text-white border-white/20 hover:bg-white/5" icon={ArrowRight}>View Past Requests</Btn>
           </div>
        </div>
      </section>
    </div>
  );
};
