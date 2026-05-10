import React from 'react';
import { Card } from '../UI';

export const ProblemDiagnosis = () => {
    return (
        <section id="diagnosis" className="py-24 px-8 bg-white relative overflow-hidden">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent to-black/5" />
          
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-20 items-center mb-16">
              <div>
                <div className="text-[10px] font-black text-red-500 uppercase tracking-[0.5em] mb-4 font-mono">Status Audit: CRITICAL</div>
                <h2 className="text-6xl md:text-7xl font-serif font-bold text-fluent-midnight leading-[0.9] mb-6 tracking-tight">
                  Identifying the <br />
                  <span className="italic font-light text-red-500/80">Quiet Barriers.</span>
                </h2>
                <p className="text-lg text-stone-700 leading-relaxed max-w-lg mb-8 font-serif">
                  Academic stagnation is rarely a lack of effort. It is almost always a structural failure in confidence and methodology.
                </p>
                <div className="p-8 bg-fluent-midnight text-white rounded-[32px]">
                   <h4 className="text-xl font-bold font-serif mb-4 italic">Core Insight</h4>
                   <p className="text-white/90 leading-relaxed italic">"Students do not fail due to lack of intelligence — they struggle due to lack of structured learning, confidence training, and effective teaching systems."</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Rote Obsession", desc: "Overemphasis on memorisation over understanding.", code: "ROT-001" },
                  { label: "Conceptual Gap", desc: "Lack of clarity in core Science/Maths/English.", code: "GAP-100" },
                  { label: "Confidence Deficit", desc: "Poor participation and vocal skills.", code: "CNF-000" },
                  { label: "Visibility Gap", desc: "No accountability or parent-teacher visibility.", code: "OPA-404" }
                ].map((problem, i) => (
                  <div key={i} className="p-6 border border-black/5 rounded-[32px] bg-stone-50/50 shadow-sm relative overflow-hidden group hover:bg-red-500 hover:border-red-500 transition-all duration-700">
                    <div className="text-[9px] font-bold text-stone-500 group-hover:text-white/40 uppercase tracking-widest mb-8 font-mono">{problem.code}</div>
                    <h3 className="font-serif text-xl font-bold text-fluent-midnight group-hover:text-white mb-2">{problem.label}</h3>
                    <p className="text-[11px] text-stone-600 group-hover:text-white/80 leading-relaxed font-sans">{problem.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
    );
};
