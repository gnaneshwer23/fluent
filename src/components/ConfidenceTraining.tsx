import React from "react";
import { motion } from "motion/react";
import { Card, Btn, Badge } from "./UI";
import { Mic, Video, Users, Sparkles, MessageCircle, Play } from "lucide-react";

export default function ConfidenceTraining() {
  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
        <div>
          <div className="text-[10px] text-fluent-gold font-bold uppercase tracking-[0.4em] mb-4">USP Feature</div>
          <h1 className="text-4xl font-serif font-bold tracking-tight">Confidence & Communication</h1>
          <p className="text-slate-500 mt-2 max-w-xl italic">
            British pedagogy prioritises articulation. Use this dedicated space to practice presentation, debate, and answering confidently.
          </p>
        </div>
        <Btn variant="gold" size="lg" icon={Sparkles} className="px-10 py-6 text-xs tracking-widest font-black uppercase shadow-2xl shadow-fluent-gold/20">
          Launch Practice Node
        </Btn>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="p-8 border-fluent-teal/20 bg-gradient-to-br from-white to-fluent-teal/5">
           <div className="w-14 h-14 bg-fluent-teal/10 text-fluent-teal rounded-2xl flex items-center justify-center mb-6">
              <Mic size={24} />
           </div>
           <h3 className="text-xl font-serif font-bold text-fluent-navy mb-4">Deep Answer Protocols</h3>
           <p className="text-sm text-slate-500 leading-relaxed mb-8">Practice 30-second logic summaries. Master the art of structured reasoning used in elite British oral examinations.</p>
           <Btn variant="outline" size="sm" className="w-full">Start Mic Drill</Btn>
        </Card>

        <Card className="p-8 border-fluent-navy/10 bg-slate-50">
           <div className="w-14 h-14 bg-fluent-navy/10 text-fluent-navy rounded-2xl flex items-center justify-center mb-6">
              <Video size={24} />
           </div>
           <h3 className="text-xl font-serif font-bold text-fluent-navy mb-4">Presentation Sandbox</h3>
           <p className="text-sm text-slate-500 leading-relaxed mb-8">Record weekly 2-minute presentations on complex topics. Faculty provide feedback on posture, tone, and clarity.</p>
           <Btn variant="outline" size="sm" className="w-full">Camera Test</Btn>
        </Card>

        <Card className="p-8 border-fluent-gold/20 bg-fluent-gold/5 shadow-xl shadow-fluent-gold/5 scale-105">
           <div className="w-14 h-14 bg-fluent-gold/20 text-fluent-gold rounded-2xl flex items-center justify-center mb-6">
              <Users size={24} />
           </div>
           <Badge color="gold" className="mb-4">Weekly Live</Badge>
           <h3 className="text-xl font-serif font-bold text-fluent-navy mb-4">Collaborative Debate</h3>
           <p className="text-sm text-slate-500 leading-relaxed mb-8">Join peers for guided debate sessions led by British public speaking experts. Find your voice in a global cohort.</p>
           <Btn variant="primary" size="sm" className="w-full bg-fluent-navy text-white">Book Next Session</Btn>
        </Card>
      </div>

      <Card className="p-10 bg-fluent-navy text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12">
          <MessageCircle size={200} />
        </div>
        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
           <div>
              <h2 className="text-4xl font-serif font-bold mb-6 leading-tight italic">Why Communication <br /> <span className="text-fluent-teal font-normal underline decoration-fluent-teal/30 underline-offset-8">Matters.</span></h2>
              <p className="text-white/60 leading-relaxed mb-8">
                In top global institutions, academic brilliance is only half the battle. The ability to articulate complex ideas with confidence is what separates good students from future leaders.
              </p>
              <div className="flex flex-wrap gap-4">
                 {["Logic Stacking", "Enunciation", "Global Accent Mastery", "Confidence Building"].map((tag, i) => (
                    <span key={i} className="px-4 py-2 bg-white/5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">{tag}</span>
                 ))}
              </div>
           </div>
           <div className="p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm">
              <div className="text-[10px] font-black uppercase tracking-widest text-fluent-gold mb-6">Student Success Story</div>
              <p className="text-lg italic font-serif mb-6 leading-relaxed">"Fluent didn't just help me get an A* in Physics; they gave me the confidence to present my research in front of 200 people. I finally found my voice."</p>
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-fluent-gold animate-pulse" />
                 <div>
                    <div className="text-sm font-bold">Aditi Rao</div>
                    <div className="text-[10px] font-bold uppercase text-white/40 tracking-widest">Alumni :: Grade 12</div>
                 </div>
              </div>
           </div>
        </div>
      </Card>
    </div>
  );
}
