import React from "react";
import { motion } from "motion/react";
import { Card, Btn, Badge, Avatar } from "./UI";
import { Mic, Video, Users, Sparkles, MessageCircle, Play } from "lucide-react";

export default function ConfidenceTraining() {
  return (
    <div className="space-y-12 px-4">
      <header className="flex flex-col md:flex-row justify-between items-start gap-8 mb-4">
        <div className="space-y-4">
          <div className="text-[10px] text-fluent-gold font-display font-medium uppercase tracking-[0.4em]">Proprietary Pedagogy</div>
          <h1 className="text-5xl font-serif font-black tracking-tight text-fluent-midnight leading-none">Confidence & <br/>Communication</h1>
          <p className="text-xl text-stone-500 font-serif italic max-w-xl">
            British pedagogy prioritises articulation. Use this dedicated space to practice presentation, debate, and answering confidently.
          </p>
        </div>
        <Btn variant="gold" size="lg" icon={Sparkles} className="px-10 py-6 text-[10px] tracking-widest font-black uppercase shadow-2xl shadow-fluent-gold/10">
          Launch Practice Node
        </Btn>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="p-10 border-black/5 bg-white group hover:border-fluent-midnight transition-all">
           <div className="w-16 h-16 bg-stone-50 text-stone-400 rounded flex items-center justify-center mb-8 group-hover:bg-fluent-midnight group-hover:text-fluent-gold transition-colors">
              <Mic size={24} />
           </div>
           <h3 className="text-2xl font-serif font-bold text-fluent-ink mb-4 leading-tight">Deep Answer Protocols</h3>
           <p className="text-sm text-stone-500 leading-relaxed mb-8 font-serif italic">Practice 30-second logic summaries. Master the art of structured reasoning used in elite British oral examinations.</p>
           <Btn variant="outline" size="sm" className="w-full">Start Mic Drill</Btn>
        </Card>

        <Card className="p-10 border-black/5 bg-white group hover:border-fluent-midnight transition-all">
           <div className="w-16 h-16 bg-stone-50 text-stone-400 rounded flex items-center justify-center mb-8 group-hover:bg-fluent-midnight group-hover:text-fluent-gold transition-colors">
              <Video size={24} />
           </div>
           <h3 className="text-2xl font-serif font-bold text-fluent-ink mb-4 leading-tight">Presentation Sandbox</h3>
           <p className="text-sm text-stone-500 leading-relaxed mb-8 font-serif italic">Record weekly 2-minute presentations on complex topics. Faculty provide feedback on posture, tone, and clarity.</p>
           <Btn variant="outline" size="sm" className="w-full">Camera Test</Btn>
        </Card>

        <Card className="p-10 border-fluent-gold/20 bg-stone-50 group hover:bg-white transition-all">
           <div className="w-16 h-16 bg-fluent-gold/10 text-fluent-gold rounded flex items-center justify-center mb-8 group-hover:bg-fluent-midnight transition-colors">
              <Users size={24} />
           </div>
           <Badge color="gold" className="mb-4">Weekly Live</Badge>
           <h3 className="text-2xl font-serif font-bold text-fluent-ink mb-4 leading-tight">Collaborative Debate</h3>
           <p className="text-sm text-stone-500 leading-relaxed mb-8 font-serif italic">Join peers for guided debate sessions led by British public speaking experts. Find your voice in a global cohort.</p>
           <Btn variant="primary" size="sm" className="w-full">Book Next Session</Btn>
        </Card>
      </div>

      <Card className="p-12 lg:p-20 bg-fluent-midnight text-white overflow-hidden relative rounded-xl">
        <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12">
          <MessageCircle size={300} />
        </div>
        <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
           <div className="space-y-8">
              <h2 className="text-5xl font-serif font-bold leading-tight italic">Why Communication <br /> <span className="text-fluent-gold font-normal underline decoration-fluent-gold/30 underline-offset-8">Matters.</span></h2>
              <p className="text-xl text-stone-400 font-serif italic leading-relaxed">
                In top global institutions, academic brilliance is only half the battle. The ability to articulate complex ideas with confidence is what separates good students from future leaders.
              </p>
              <div className="flex flex-wrap gap-4">
                 {["Logic Stacking", "Enunciation", "Global Accent Mastery", "Confidence Building"].map((tag, i) => (
                    <span key={i} className="px-5 py-2.5 bg-white/5 rounded text-[9px] font-bold uppercase tracking-widest border border-white/10 font-display text-stone-400">{tag}</span>
                 ))}
              </div>
           </div>
           <div className="p-10 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm space-y-8">
              <div className="text-[10px] font-display font-medium uppercase tracking-[0.3em] text-fluent-gold">Student Success Story</div>
              <p className="text-2xl italic font-serif leading-relaxed text-stone-200">"Fluent didn't just help me get an A* in Physics; they gave me the confidence to present my research in front of 200 people. I finally found my voice."</p>
              <div className="flex items-center gap-5">
                 <Avatar name="Aditi Rao" size={56} />
                 <div>
                    <div className="text-base font-bold text-white tracking-tight leading-none mb-1">Aditi Rao</div>
                    <div className="text-[10px] font-bold uppercase text-white/30 tracking-widest font-display">Alumni :: Grade 12</div>
                 </div>
              </div>
           </div>
        </div>
      </Card>
    </div>
  );
}
