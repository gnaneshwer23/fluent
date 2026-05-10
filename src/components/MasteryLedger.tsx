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
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 px-4">
      {/* Header & Search */}
      <header className="flex flex-col md:flex-row justify-between items-end gap-8">
        <div className="space-y-3">
          <Badge color="gold" icon={Library}>Mastery Ledger v3.0</Badge>
          <h1 className="text-5xl font-serif font-black tracking-tighter text-fluent-midnight leading-none">Knowledge Repository</h1>
          <p className="text-xl text-[#1e293b] font-serif italic font-medium">Synthesized academic nodes and primary research briefs.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#4a5568]" size={18} />
          <input 
            type="text" 
            placeholder="Search repository..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white border border-black/5 rounded-lg text-xs font-bold text-fluent-midnight outline-none focus:ring-1 focus:ring-fluent-gold/20 transition-all shadow-sm font-display uppercase tracking-widest"
          />
        </div>
      </header>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-6 py-2.5 rounded text-[9px] font-bold uppercase tracking-[0.2em] whitespace-nowrap transition-all border ${
              selectedCategory === cat.id 
                ? "bg-fluent-midnight text-fluent-gold border-fluent-midnight" 
                : "bg-white text-[#4a5568] border-black/5 hover:border-black/10 font-bold"
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
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              key={resource.id}
            >
              <Card className="flex flex-col h-full group hover:border-fluent-gold/30 transition-all relative overflow-hidden bg-white p-8">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-12 h-12 bg-stone-50 rounded flex items-center justify-center text-stone-400 group-hover:bg-fluent-midnight group-hover:text-fluent-gold transition-colors">
                    {resource.isAiGenerated ? <Sparkles size={20} /> : <FileText size={20} />}
                  </div>
                  <Badge color={resource.tier === 'elite' ? 'gold' : 'navy'} className="text-[8px] px-2 py-0.5">
                    {resource.tier.toUpperCase()}
                  </Badge>
                </div>

                <div className="flex-1 space-y-4">
                  <h3 className="text-xl font-serif font-bold text-fluent-midnight group-hover:text-fluent-gold transition-colors leading-tight">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-[#4a5568] leading-relaxed font-serif italic line-clamp-3 font-medium">
                    {resource.description}
                  </p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    {resource.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[9px] font-display font-medium text-[#374151] uppercase tracking-widest font-bold">#{tag}</span>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-black/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={resource.authorName} size={24} />
                    <span className="text-[10px] font-display font-medium text-fluent-midnight uppercase tracking-widest">{resource.authorName}</span>
                  </div>
                  <div className="flex gap-2">
                    <Btn variant="primary" size="sm" icon={ExternalLink} className="h-9 px-4 text-[9px] uppercase font-bold">Access</Btn>
                  </div>
                </div>
                
                {resource.isAiGenerated && (
                  <div className="absolute top-0 right-0 p-1 opacity-5 pointer-events-none">
                     <Sparkles size={80} className="text-fluent-gold -rotate-12 translate-x-10 -translate-y-10" />
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredResources.length === 0 && !loading && (
        <div className="py-20 text-center bg-stone-50 rounded-lg border border-dashed border-stone-200">
           <Library size={48} className="mx-auto mb-6 text-stone-200" />
           <h3 className="text-2xl font-serif font-bold text-fluent-midnight">No Matching Nodes</h3>
           <p className="text-[#4a5568] font-serif italic font-bold">Expand your search parameters or request a new synthesis.</p>
        </div>
      )}

      {/* Featured AI Synthesis */}
      <section className="bg-fluent-midnight rounded-xl p-12 lg:p-20 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none scale-150">
           <Globe size={400} />
        </div>
        <div className="max-w-3xl relative z-10 space-y-8">
           <Badge color="gold" className="bg-fluent-gold/10 text-fluent-gold border-fluent-gold/20">Intelligence Spotlight</Badge>
           <h2 className="text-5xl font-serif font-bold tracking-tighter leading-[1.1]">Request a Custom Synthesis Brief</h2>
           <p className="text-xl text-[#cbd5e1] font-serif italic leading-relaxed">
             Leverage the InfoFluent Provincial AI to generate a targeted research paper or study guide based on your current academic gaps and mastery profile.
           </p>
           <div className="flex gap-4 pt-4">
             <Btn variant="gold" icon={Sparkles} size="lg">Initialize AI Synthesis</Btn>
             <Btn variant="outline" className="text-white border-white/10 hover:bg-white/5" icon={ArrowRight}>View Past Requests</Btn>
           </div>
        </div>
      </section>
    </div>
  );
};
