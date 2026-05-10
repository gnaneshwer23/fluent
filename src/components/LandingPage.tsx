import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  Sparkles,
  Zap,
  ShieldCheck,
  MessageCircle,
  CheckCircle2,
  X,
  Database,
  Users,
  Award,
  BookOpen,
} from "lucide-react";
import { Logo, Btn, Badge } from "./UI";
import { db, auth } from "../lib/firebaseInit";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { handleFirestoreError, OperationType } from "../lib/errorHandling";
import { notifyNewLead } from "../lib/communicationService";

const googleProvider = new GoogleAuthProvider();

export const LandingPage = () => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);

  const [leadData, setLeadData] = useState({
    schoolName: "",
    contactPerson: "",
    designation: "Parent",
    phone: "",
    email: "",
    studentCount: "",
    classes: "Grade 10",
    subject: "Full Academic Sequence",
  });
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    if (showLeadModal) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.style.overflow = "unset";
    };
  }, [showLeadModal]);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (
        error.code !== "auth/cancelled-popup-request" &&
        error.code !== "auth/popup-closed-by-user"
      ) {
        console.error("Login failed", error);
        if (error.code === "auth/unauthorized-domain") {
          setLoginError("This domain is not authorized in the Firebase Console. Please add your Vercel URL to 'Authorized domains' in Firebase Authentication settings.");
        } else {
          setLoginError(`Login failed: ${error.message}`);
        }
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingLead(true);
    try {
      await addDoc(collection(db, "schoolLeads"), {
        ...leadData,
        status: "pending",
        requestedAt: serverTimestamp(),
      });
      setShowLeadModal(false);
      setWaitlistSuccess(true);
      notifyNewLead(leadData.email);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "schoolLeads");
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <div className="min-h-screen bg-fluent-ivory text-fluent-ink font-sans selection:bg-fluent-gold/20 overflow-x-hidden">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-6 md:px-12 h-[72px] transition-all duration-500 ${scrolled ? "bg-fluent-ivory/90 backdrop-blur-xl border-b border-fluent-gold/15" : "bg-transparent"}`}
      >
        <a
          href="#"
          className="flex items-center gap-3 font-display text-[15px] tracking-[0.15em] text-fluent-ink"
        >
          <div className="w-8 h-8 bg-fluent-midnight flex items-center justify-center text-sm text-fluent-gold">
            📖
          </div>
          FLUENT INSTITUTE.
        </a>
        <div className="hidden md:flex gap-10">
          {["thesystem", "aigrounding", "outcomeaudit"].map((id) => (
            <a
              key={id}
              href={`#${id}`}
              className="text-[11px] tracking-[0.18em] uppercase text-stone-800 font-bold hover:text-fluent-ink transition-colors"
            >
              {id.replace("audit", " Audit").replace("grounding", " Grounding").replace("the", "The ")}
            </a>
          ))}
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleLogin}
            className="hidden sm:inline-block text-[10px] tracking-[0.2em] uppercase font-bold text-fluent-ink hover:text-fluent-gold transition-colors"
          >
            Login
          </button>
          <button
            onClick={() => setShowLeadModal(true)}
            className="bg-fluent-midnight text-fluent-cream px-7 py-3 font-display text-[10px] tracking-[0.2em] uppercase hover:bg-fluent-gold hover:text-fluent-midnight transition-all"
          >
            Signup / Enrollment
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {loginError && (
          <motion.div
            id="login-error-alert"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[101] bg-red-600 text-white px-6 py-3 rounded shadow-xl text-xs font-bold tracking-widest uppercase flex items-center gap-3 max-w-md text-center"
          >
            <div className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shrink-0">!</div>
            <span>{loginError}</span>
            <button onClick={() => setLoginError(null)} className="ml-2 hover:text-white/60 transition-colors">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="min-h-screen grid lg:grid-cols-2 pt-[72px] relative overflow-hidden">
        <div className="p-10 md:p-16 lg:p-24 flex flex-col justify-center relative z-10 bg-fluent-ivory">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={textVariants}
          >
            <div className="flex items-center gap-4 font-display text-[10px] tracking-[0.3em] uppercase text-fluent-gold mb-8">
              <div className="w-10 h-px bg-fluent-gold" />
              British-Trained Elite Faculty
            </div>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-semibold leading-[1.0] mb-10 text-fluent-ink">
              Learn Directly<br />from British
              <em className="block not-italic text-fluent-gold italic">Masters.</em>
            </h1>
            <p className="text-stone-800 text-lg leading-relaxed max-w-md mb-14 font-medium">
              We don't just teach scholars — we train the next generation of academic leaders. UK-trained teachers, adaptive AI, and relentless accountability.
            </p>
            <div className="flex flex-wrap items-center gap-8">
              <button
                onClick={() => setShowLeadModal(true)}
                className="group relative bg-fluent-midnight text-fluent-cream px-10 py-5 font-display text-[10px] tracking-[0.22em] uppercase overflow-hidden"
              >
                <div className="absolute inset-0 bg-fluent-gold origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                <span className="relative z-10 group-hover:text-fluent-midnight">Begin Admission Protocol</span>
              </button>
              <a href="#thesystem" className="text-xs tracking-[0.1em] text-stone-700 font-bold hover:text-fluent-ink border-b border-transparent hover:border-fluent-ink transition-all pb-0.5">
                Explore the System →
              </a>
            </div>
          </motion.div>
        </div>

        <div className="bg-fluent-midnight relative flex items-center justify-center p-10 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,rgba(184,151,58,0.12)_0%,transparent_60%),radial-gradient(ellipse_at_80%_80%,rgba(184,151,58,0.06)_0%,transparent_50%)]" />
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "linear-gradient(rgba(184,151,58,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(184,151,58,0.06) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-[380px] p-12 border border-fluent-gold/25 bg-white/5 backdrop-blur-md animate-float"
          >
            <div className="font-display text-[9px] tracking-[0.3em] uppercase text-fluent-gold mb-6">
              Scholar Inquiry · Live AI Grounding
            </div>
            <div className="font-serif text-lg italic text-fluent-cream leading-relaxed mb-8 border-l-2 border-fluent-gold pl-5">
              "Explain the orbital hybridisation of Methane using the VSEPR framework."
            </div>
            <div className="text-[9px] tracking-[0.2em] uppercase text-stone-400 mb-3">
              Retrieved Knowledge Node #1092
            </div>
            <div className="text-sm text-white/80 leading-relaxed font-light">
              Direct retrieval from <strong className="text-fluent-gold-light font-medium">Grade 11 Chemical Bonding core</strong>. 
              The 2s and three 2p orbitals mix to form four identical hybrid orbitals… 
              Imagine a <strong className="text-fluent-gold-light font-medium">perfect tetrahedron</strong> — 109.5° bond angles, zero approximation.
            </div>
          </motion.div>

          <div className="absolute bottom-12 left-12 right-12 grid grid-cols-3 gap-8">
            {[
              { val: "47%", label: "Grade Delta" },
              { val: "92%", label: "Retention Rate" },
              { val: "24/7", label: "Guardian Pulse" },
            ].map((stat, i) => (
              <div key={i} className="border-t border-fluent-gold/30 pt-4">
                <div className="font-serif text-3xl font-semibold text-fluent-cream">
                  {stat.val.split("%")[0]}<span className="text-fluent-gold">{stat.val.includes("%") ? "%" : ""}</span>
                  {stat.val.includes("/") && <span className="text-fluent-gold text-2xl">/{stat.val.split("/")[1]}</span>}
                </div>
                <div className="text-[9px] tracking-[0.2em] uppercase text-white/50 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ticker */}
      <div className="bg-fluent-midnight py-6 border-y border-fluent-gold/20 overflow-hidden">
        <motion.div
           className="flex whitespace-nowrap"
           animate={{ x: ["0%", "-50%"] }}
           transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        >
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center">
              {[
                "British-Trained Faculty",
                "Class 9–12 Specialist",
                "AI RAG Curriculum Grounding",
                "Maths · Physics · Chemistry · Biology · English",
                "London Administrative Hub",
                "Bengaluru Research Campus",
              ].map((text, j) => (
                <div key={j} className="flex items-center gap-10 px-10 font-display text-[10px] tracking-[0.2em] text-white/70 uppercase">
                  {text} <span className="text-fluent-gold text-base">◆</span>
                </div>
              ))}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Problem Section */}
      <section className="bg-fluent-ink text-fluent-cream py-24 px-6 md:px-16 lg:px-24 grid lg:grid-cols-2 gap-24">
        <motion.div
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true }}
           variants={textVariants}
        >
          <div className="font-display text-[9px] tracking-[0.3em] uppercase text-fluent-gold/60 flex items-center gap-4 mb-14">
            Audit: Instructional Decay
            <div className="flex-1 h-px bg-gradient-to-r from-fluent-gold/20 to-transparent" />
          </div>
          <h2 className="font-serif text-4xl md:text-6xl font-medium leading-[1.1] mb-8">
            The Blind<br />
            <em className="text-red-600 not-italic italic">Spots.</em>
          </h2>
          <p className="font-serif text-xl italic text-white/80 leading-relaxed mt-8">
            "Conventional tuition prioritises throughput over mastery. In large batches, concept gaps are invisible until the strategic failure occurs."
          </p>
        </motion.div>

        <div className="flex flex-col">
          {[
            { n: "01", risk: "High", title: "Faculty Dilution", desc: "Elite mentors replaced by mass-market recorded archives in conventional systems." },
            { n: "02", risk: "Critical", title: "Concept Gaps", desc: "Rote memorisation prioritised over fundamental physics & maths internalisation." },
            { n: "03", risk: "Severe", title: "English Silo", desc: "Technical mastery undermined by a lack of real-world discourse confidence." },
            { n: "04", risk: "Severe", title: "Zero Visibility", desc: "Guardians have zero insight into daily engagement or performance deltas." },
          ].map((report, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="group grid grid-cols-[80px_1fr] gap-6 py-9 border-b border-white/10 hover:bg-fluent-gold/5 transition-all px-0 hover:px-6 hover:-mx-6"
            >
              <div className="font-serif text-5xl font-extralight text-white/10 leading-none group-hover:text-fluent-gold/30 transition-colors">{report.n}</div>
              <div>
                <div className={`font-display text-[8px] tracking-[0.2em] uppercase mb-2 ${report.risk === 'High' ? 'text-red-500' : report.risk === 'Critical' ? 'text-orange-500' : 'text-red-700'}`}>
                  ■ {report.risk} Risk
                </div>
                <h3 className="font-serif text-2xl font-semibold mb-2">{report.title}</h3>
                <p className="text-stone-700 font-bold text-sm leading-relaxed">{report.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* System Section */}
      <section id="thesystem" className="bg-fluent-ivory py-24 px-6 md:px-16 lg:px-24">
        <div className="grid lg:grid-cols-2 gap-20 items-end mb-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={textVariants}
          >
            <div className="font-display text-[9px] tracking-[0.3em] uppercase text-stone-500 flex items-center gap-4 mb-14">
              Instructional Core
              <div className="flex-1 h-px bg-gradient-to-r from-fluent-gold/20 to-transparent" />
            </div>
            <h2 className="font-serif text-4xl md:text-6xl font-semibold leading-[1.05]">
              Mastery Through<br />
              <em className="text-fluent-gold not-italic italic block mt-2">British Precision.</em>
            </h2>
          </motion.div>
          <p className="font-serif text-xl italic text-stone-800 font-bold leading-relaxed lg:pb-2">
            "Indian students learning directly from British-trained teachers — combined with AI support and continuous teacher development."
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 border border-stone-200">
          {[
            { n: "01", label: "Instruction", title: "Elite Indian Faculty Nodes", desc: "Small cohort classes limited to 20 seats. Taught by faculty with proven track records in high-rigour competitive excellence.", tags: ["Live Interaction", "Syllabus Precision"] },
            { n: "02", label: "Grounding", title: "AI Augmented RAG Grounding", desc: "A curriculum-aware tutor available 24/7. It doesn't just answer; it retrieves from verified syllabus nodes to ensure factual mastery.", tags: ["Context Retrieval", "Infinite Depth"] },
            { n: "03", label: "Training", title: "British Teacher Academy Core", desc: "Our British faculty doesn't just teach; they train. We upgrade teacher communication, logic scaffolding, and student engagement frameworks.", tags: ["Pedagogical Audits", "Engagement Training"] },
            { n: "04", label: "Audit", title: "The Guardian Pulse Interface", desc: "Complete transparency into the scholar's journey. Weekly delta reports and real-time performance auditing for parents.", tags: ["Weekly Delta Reports", "Outcome Tracking"] },
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="relative p-12 border-r border-stone-200 last:border-r-0 group overflow-hidden hover:bg-fluent-midnight transition-colors duration-500"
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-fluent-gold scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
              <div className="font-serif text-6xl font-light text-stone-100 mb-8 group-hover:text-fluent-gold/15 transition-colors">{card.n}</div>
              <div className="font-display text-[8px] tracking-[0.25em] uppercase text-fluent-gold mb-4">Manual {card.n} · {card.label}</div>
              <h3 className="font-serif text-2xl font-semibold mb-4 leading-tight group-hover:text-fluent-cream transition-colors">{card.title}</h3>
              <p className="text-stone-800 font-medium text-sm leading-relaxed group-hover:text-stone-400 transition-colors">{card.desc}</p>
              <div className="flex flex-wrap gap-2 mt-6">
                {card.tags.map(tag => (
                  <span key={tag} className="text-[9px] tracking-[0.12em] uppercase px-3 py-1 border border-stone-300 group-hover:border-fluent-gold/30 group-hover:text-fluent-gold transition-all">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section id="howitworks" className="bg-fluent-ivory py-24 px-6 md:px-16 lg:px-24">
        <div className="text-center mb-24">
           <div className="font-display text-[9px] tracking-[0.3em] uppercase text-stone-500 inline-flex items-center gap-4 mb-4">
            <div className="w-8 h-px bg-stone-400" />
            Operational Loop
            <div className="w-8 h-px bg-stone-400" />
          </div>
          <h2 className="font-serif text-4xl md:text-6xl font-semibold">How It <em className="text-fluent-gold not-italic italic">Works.</em></h2>
        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-12 relative">
          <div className="hidden lg:block absolute top-[32px] left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-fluent-gold/40 to-transparent" />
          {[
            { n: "1", code: "L.01", title: "Live Learning", desc: "High-precision cohort classes with British-trained Indian faculty." },
            { n: "2", code: "L.02", title: "RAG Practice", desc: "24/7 conceptual grounding via Institutional AI Tutor." },
            { n: "3", code: "L.03", title: "Lab Synthesis", desc: "Weekly mandatory discursive workshops in academic English." },
            { n: "4", code: "L.04", title: "The Pulse", desc: "Rigorous weekly assessments mapping concept retention." },
            { n: "5", code: "L.05", title: "Protocol Report", desc: "Full performance audit delivered securely to guardians." },
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="text-center group"
            >
              <div className="w-16 h-16 rounded-full bg-fluent-midnight border border-fluent-gold/30 flex items-center justify-center font-serif text-xl font-semibold text-fluent-gold mx-auto mb-8 relative z-10 transition-transform group-hover:scale-110">
                {step.n}
              </div>
              <div className="font-display text-[8px] tracking-[0.2em] text-fluent-gold uppercase mb-3">{step.code}</div>
              <h3 className="font-serif text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-stone-800 font-bold text-xs leading-relaxed max-w-[180px] mx-auto">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI Grounding Section */}
      <section id="aigrounding" className="bg-fluent-midnight py-24 px-6 md:px-16 lg:px-24 grid lg:grid-cols-2 gap-24 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="bg-white/5 border border-fluent-gold/20 p-10 relative">
            <div className="font-display text-[9px] tracking-[0.25em] text-fluent-gold mb-6 uppercase">AI-Grounding · Neural Architecture</div>
            <div className="font-serif text-lg italic text-fluent-cream leading-relaxed mb-4 p-5 bg-white/5 border-l-2 border-fluent-gold">
              "Explain the orbital hybridisation of Methane using the VSEPR framework."
            </div>
            <div className="bg-fluent-gold/10 border border-fluent-gold/15 p-7 mt-4">
              <div className="font-display text-[8px] tracking-[0.2em] text-fluent-gold-light mb-3 uppercase">Retrieved Knowledge Node #1092</div>
              <p className="text-sm text-white/70 leading-relaxed">
                Direct retrieval from <em className="not-italic text-fluent-gold-light">Grade 11 Chemical Bonding core</em>. The 2s and three 2p orbitals mix to form four identical hybrid orbitals… Imagine a <em className="not-italic text-fluent-gold-light">perfect tetrahedron</em> — bond angle 109.5°, zero ambiguity, zero hallucination.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true }}
           variants={textVariants}
        >
          <div className="font-display text-[9px] tracking-[0.3em] uppercase text-fluent-gold/60 mb-10">Neural Architecture</div>
          <h2 className="font-serif text-4xl md:text-6xl font-semibold text-fluent-cream leading-[1.1] mb-10">
            AI That <em className="text-fluent-gold not-italic italic">Retrieves.</em>
          </h2>
          <div className="space-y-10">
            {[
              { n: "01", title: "Factual Precision", desc: "Direct retrieval from curriculum nodes ensures zero hallucination in high-stakes science core. Unlike generic LLMs, our Hierarchical RAG System is anchored in the verified Indian curriculum." },
              { n: "02", title: "Pacing Scaffolding", desc: "Explanation complexity auto-adjusts based on the student's historical mastery index. It meets the scholar where they are." },
              { n: "03", title: "Cross-Domain Synthesis", desc: "Connects cross-chapter concepts across Maths and Physics in real-time discourse. No subject exists in isolation." },
            ].map((feature, i) => (
              <div key={i} className="grid grid-cols-[40px_1fr] gap-5">
                <div className="font-serif text-xl font-semibold text-fluent-gold pt-1">{feature.n}</div>
                <div>
                  <h3 className="font-serif text-2xl font-semibold text-fluent-cream mb-2">{feature.title}</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Outcome Audit Section */}
      <section id="outcomeaudit" className="bg-fluent-cream py-24 px-6 md:px-16 lg:px-24">
        <div className="font-display text-[9px] tracking-[0.3em] uppercase text-stone-600 mb-12">Empirical Proof</div>
        
        <div className="grid md:grid-cols-3 border border-stone-200 mb-24">
          {[
            { val: "47%", label: "Grade Delta", desc: "Avg. improvement over 12 weeks of high-precision instruction." },
            { val: "92%", label: "Retention Rate", desc: "Verified via cross-domain cumulative recall protocols." },
            { val: "24/7", label: "Guardian Pulse", desc: "Real-time auditing access for parent stakeholders." },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="p-12 md:p-16 border-r border-stone-200 last:border-r-0"
            >
              <div className="font-serif text-6xl md:text-8xl font-semibold leading-none mb-4">
                {stat.val.split("%")[0]}<span className="text-fluent-gold">{stat.val.includes("%") ? "%" : ""}</span>
                {stat.val.includes("/") && <span className="text-fluent-gold text-4xl">/{stat.val.split("/")[1]}</span>}
              </div>
              <div className="font-display text-[9px] tracking-[0.25em] uppercase text-fluent-gold mb-3">{stat.label}</div>
              <p className="text-stone-800 font-bold text-sm leading-relaxed">{stat.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-fluent-midnight p-16 grid lg:grid-cols-[1fr_300px] gap-20 items-center overflow-hidden relative"
        >
          <div className="font-serif text-3xl md:text-4xl italic text-fluent-cream leading-relaxed relative z-10">
            "Traditional tuition relies on hope. We rely on <em className="not-italic text-fluent-gold">data</em>. Every week, we deliver a full narrative audit of the scholar's cognitive trajectory."
          </div>
          <div className="border-l border-fluent-gold/30 pl-8 relative z-10">
            <div className="font-display text-[13px] tracking-[0.15em] text-fluent-cream mb-2">Fluent Institute.</div>
            <div className="text-[11px] tracking-[0.1em] text-white/50 uppercase">Institutional Board · Verified Status</div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-fluent-gold/5 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
        </motion.div>
      </section>

      {/* Cohort Integration Section */}
      <section className="bg-fluent-cream py-24 px-6 md:px-16 lg:px-24 grid lg:grid-cols-2 gap-24">
        <motion.div
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true }}
           variants={textVariants}
        >
          <div className="font-display text-[9px] tracking-[0.3em] uppercase text-stone-600 mb-10">Cohort Integration</div>
          <h2 className="font-serif text-4xl md:text-6xl font-semibold leading-[1.05] mb-8">
            Built for<br /><em className="text-fluent-gold not-italic italic">The Driven.</em>
          </h2>
          <blockquote className="font-serif text-2xl italic text-fluent-ink border-l-[3px] border-fluent-gold pl-8 mt-10">
            "We are not a tuition center. We are an academic trust dedicated to high-rigour scholarship."
          </blockquote>
        </motion.div>

        <div className="grid grid-cols-2 border-stone-200">
           {[
            { label: "Archive 01", title: "Scholars", desc: "Class 9–12 seekers moving beyond rote memory." },
            { label: "Archive 02", title: "Guardians", desc: "Demanding absolute clarity and ROI data." },
            { label: "Archive 03", title: "Masters", desc: "Elite faculty scaling their impact through our system." },
            { label: "Archive 04", title: "Institutional", desc: "Schools aiming for zero-gap outcome dominance." },
          ].map((segment, i) => (
            <motion.div
               key={i}
               className="p-10 border border-stone-200 -mt-px -ml-px group hover:bg-fluent-midnight transition-colors duration-500"
            >
              <div className="font-display text-[8px] tracking-[0.25em] text-fluent-gold uppercase mb-4 transition-colors group-hover:text-fluent-gold">{segment.label}</div>
              <h3 className="font-serif text-2xl font-semibold mb-3 group-hover:text-fluent-cream transition-colors">{segment.title}</h3>
              <p className="text-stone-600 text-sm leading-relaxed group-hover:text-stone-400 transition-colors">{segment.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Enrollment Scenarios Section */}
      <section id="investment" className="bg-fluent-ivory py-24 px-6 md:px-16 lg:px-24">
        <div className="text-center mb-20">
          <div className="font-display text-[9px] tracking-[0.3em] uppercase text-stone-600 inline-flex items-center gap-4 mb-4">
            <div className="w-8 h-px bg-stone-400" />
            Academic Enrollment 2026
            <div className="w-8 h-px bg-stone-400" />
          </div>
          <h2 className="font-serif text-4xl md:text-6xl font-semibold mb-6">Admission <em className="text-fluent-gold not-italic italic">Scenarios.</em></h2>
          <p className="font-serif text-lg italic text-stone-600 max-w-2xl mx-auto">Transparent investment in high-yield academic futures. No hidden costs. Pure performance focus.</p>
        </div>

        <div className="grid lg:grid-cols-3 border border-stone-200">
          {[
            { plan: "Guardian Protocol", price: "₹8,500", desc: "Ideal for self-driven scholars requiring AI grounding and teacher oversight.", features: ["AI Scaffolder Access 24/7", "Weekly Subject Pulse", "Parent Delta Dashboard", "RAG Curriculum Vault"] },
            { plan: "Mastery Cohort", price: "₹14,500", highlight: true, desc: "The standard institutional sequence. Direct faculty instruction mixed with AI.", features: ["Small Batch Live Classes (Max 20)", "Priority British Faculty Training", "Personalised Neural Mapping", "Bi-weekly Synthesis Labs", "Everything in Guardian Protocol"] },
            { plan: "Institutional Elite", price: "Contact Board", desc: "Tailored for schools or elite groups requiring zero-gap outcome dominance.", features: ["Teacher Training Academy", "On-site Pedagogy Audit", "Custom RAG Knowledge Nodes", "School-wide Performance Pulse", "Full LMS White-labelling"] },
          ].map((scenario, i) => (
            <div
              key={i}
              className={`p-14 border-r last:border-r-0 border-stone-200 relative flex flex-col ${scenario.highlight ? 'bg-fluent-midnight text-fluent-cream -my-px border-y border-transparent shadow-[0_40px_80px_rgba(0,0,0,0.3)] z-10' : ''}`}
            >
              {scenario.highlight && (
                <div className="absolute top-[-1px] left-1/2 -translate-x-1/2 bg-fluent-gold text-fluent-midnight font-display text-[8px] tracking-[0.2em] uppercase px-5 py-2">
                  Institutional Choice
                </div>
              )}
              <div className="font-display text-[9px] tracking-[0.25em] text-fluent-gold uppercase mb-6">{scenario.plan}</div>
              <div className={`font-serif font-semibold leading-none mb-2 ${scenario.price === 'Contact Board' ? 'text-4xl' : 'text-6xl'}`}>
                {scenario.price}
              </div>
              <div className="text-xs text-stone-600 uppercase tracking-widest mb-8">{scenario.price === 'Contact Board' ? 'Custom Sequence' : 'per month'}</div>
              <div className="h-px bg-current opacity-15 mb-8" />
              <p className={`text-sm italic mb-8 flex-grow ${scenario.highlight ? 'text-white/70' : 'text-stone-800'}`}>{scenario.desc}</p>
              <div className="space-y-4 mb-10">
                {scenario.features.map(f => (
                   <div key={f} className="flex gap-3 text-[13px] items-start">
                     <span className="text-fluent-gold text-xs">◆</span>
                     <span className={scenario.highlight ? 'text-stone-300' : 'text-stone-800'}>{f}</span>
                   </div>
                ))}
              </div>
              <button
                 onClick={() => setShowLeadModal(true)}
                 className={`w-full py-4 border font-display text-[9px] tracking-[0.2em] uppercase transition-all ${scenario.highlight ? 'bg-fluent-gold border-fluent-gold text-fluent-midnight hover:bg-fluent-gold-light' : 'bg-transparent border-fluent-ink text-fluent-ink hover:bg-fluent-ink hover:text-fluent-cream'}`}
              >
                {scenario.price === 'Contact Board' ? 'Initiate Inquiry' : 'Enroll Scholar'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Enrollment CTA Section */}
      <section id="enrollment" className="bg-fluent-midnight py-24 px-6 md:px-16 lg:px-24 grid lg:grid-cols-2 gap-24 items-center">
        <motion.div
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true }}
           variants={textVariants}
        >
          <div className="font-display text-[9px] tracking-[0.3em] uppercase text-fluent-gold/60 mb-8">Final Enrollment Sequence</div>
          <h2 className="font-serif text-4xl md:text-6xl font-semibold text-fluent-cream leading-[1.1] mb-8">
            Secure the<br /><em className="text-fluent-gold not-italic italic">Scholar's Future.</em>
          </h2>
          <p className="text-white/80 text-base leading-relaxed mb-12">Applications for the 2026 Academic Cohort are now being processed. We maintain strict enrollment caps to preserve our 12:1 instructional density.</p>
          <div className="mb-12">
            <div className="font-display text-[9px] tracking-[0.25em] text-fluent-gold uppercase mb-3">Cohort Capacity Status</div>
            <div className="h-1 bg-white/10 mb-2 relative overflow-hidden">
               <motion.div initial={{ width: 0 }} whileInView={{ width: "82%" }} transition={{ duration: 1.5 }} className="h-full bg-fluent-gold relative">
                  <div className="absolute right-0 top-[-20px] font-display text-[9px] tracking-[0.15em] text-fluent-gold">82% FILLED</div>
               </motion.div>
            </div>
            <div className="text-[11px] text-white/60 italic">Live: Admissions Pulse · Seats closing rapidly</div>
          </div>
          <div className="flex flex-wrap gap-4">
             <button
               onClick={() => setShowLeadModal(true)}
               className="bg-fluent-gold text-fluent-midnight px-10 py-5 font-display text-[10px] tracking-[0.22em] uppercase hover:bg-fluent-gold-light transition-all"
             >
                Begin Admission Protocol
             </button>
             <button className="bg-transparent text-fluent-cream border border-white/20 px-10 py-5 font-display text-[10px] tracking-[0.22em] uppercase hover:border-fluent-gold hover:text-fluent-gold transition-all">
                Download Prospectus
             </button>
          </div>
        </motion.div>

        <div className="flex flex-col">
          {[
            { n: "01", title: "Institutional Grade", desc: "British masters overseeing every instructional node. Not tutors following a syllabus — actual educators." },
            { n: "02", title: "Cognitive Security", desc: "Zero-gap learning via AI-grounded retrieval. Every conceptual node fully synthesised before the scholar advances." },
            { n: "03", title: "Global Readiness", desc: "Synthesis-first focus for elite competitive mastery. Built for NEET, JEE, and beyond." },
          ].map((benefit, i) => (
             <motion.div
               key={i}
               initial={{ opacity: 0, x: 20 }}
               whileInView={{ opacity: 1, x: 0 }}
               transition={{ delay: i * 0.1 }}
               viewport={{ once: true }}
               className="grid grid-cols-[48px_1fr] gap-6 py-8 border-b border-white/5 last:border-b-0"
             >
               <div className="font-serif text-3xl font-light text-fluent-gold/30">{benefit.n}</div>
               <div>
                  <h3 className="font-serif text-xl font-semibold text-fluent-cream mb-2">{benefit.title}</h3>
                  <p className="text-white/80 text-sm leading-relaxed">{benefit.desc}</p>
               </div>
             </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-fluent-ink text-stone-300 py-24 px-6 md:px-12 lg:px-24">
        <div className="grid lg:grid-cols-4 gap-16 pb-20 border-b border-white/5 mb-12">
          <div>
            <div className="font-display text-base tracking-[0.15em] text-fluent-cream mb-2">FLUENT INSTITUTE.</div>
            <p className="font-serif text-sm italic mb-6">"We do not teach subjects; we architect scholars."</p>
            <div className="text-xs leading-loose">
              <a href="mailto:info@fluent.academy" className="text-fluent-gold hover:underline">info@fluent.academy</a><br />
              +44 7553 886303 (WhatsApp)<br />
              London · Bengaluru
            </div>
          </div>
          <div>
            <div className="font-display text-[9px] tracking-[0.25em] text-fluent-gold uppercase mb-6">Archive</div>
            <div className="flex flex-col gap-3 text-sm">
              <a href="#" className="hover:text-fluent-cream transition-colors">Academy Node</a>
              <a href="#" className="hover:text-fluent-cream transition-colors">Faculty Pulse</a>
              <a href="#" className="hover:text-fluent-cream transition-colors">Synthesis Lab</a>
              <a href="#" className="hover:text-fluent-cream transition-colors">Audit Vault</a>
            </div>
          </div>
          <div>
             <div className="font-display text-[9px] tracking-[0.25em] text-fluent-gold uppercase mb-6">Technical</div>
             <div className="flex flex-col gap-3 text-sm">
              <a href="#" className="hover:text-fluent-cream transition-colors">RAG System</a>
              <a href="#" className="hover:text-fluent-cream transition-colors">Pedagogy Core</a>
              <a href="#" className="hover:text-fluent-cream transition-colors">Neural Audit</a>
              <a href="#" className="hover:text-fluent-cream transition-colors">Precision Reporting</a>
            </div>
          </div>
          <div>
            <div className="font-display text-[9px] tracking-[0.25em] text-fluent-gold uppercase mb-6">Institutional</div>
            <div className="flex flex-col gap-3 text-sm">
              <a href="#" className="hover:text-fluent-cream transition-colors">Privacy Protocol</a>
              <a href="#" className="hover:text-fluent-cream transition-colors">Service Standards</a>
              <a href="#" className="hover:text-fluent-cream transition-colors">Digital Integrity</a>
              <button onClick={handleLogin} className="text-left hover:text-fluent-cream transition-colors">Signup / Login</button>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="text-[11px] tracking-[0.05em] text-white/20 uppercase">
             © 2026 <span className="text-fluent-gold">Fluent Institute.</span> Institutional Trust · UK/India
           </div>
           <div className="flex items-center gap-3 font-display text-[11px] tracking-[0.1em] uppercase text-stone-300">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.3)]" />
             Live: Admissions Pulse
           </div>
        </div>
      </footer>

      {/* Lead Modal */}
      <AnimatePresence>
        {showLeadModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLeadModal(false)}
              className="fixed inset-0 bg-fluent-midnight/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-fluent-ivory w-full max-w-2xl rounded-sm shadow-2xl p-8 md:p-12 my-auto border border-fluent-gold/20"
            >
              <button
                onClick={() => setShowLeadModal(false)}
                className="absolute top-6 right-6 p-2 hover:bg-stone-200 transition-colors text-fluent-midnight"
              >
                <X size={20} />
              </button>
              
              <div className="mb-10">
                <div className="font-display text-[10px] tracking-[0.4em] uppercase text-fluent-gold mb-2">Admissions Open</div>
                <h3 className="font-serif text-3xl font-semibold text-fluent-ink">Begin Admission Sequence</h3>
              </div>

              <form onSubmit={handleLeadSubmit} className="space-y-6 max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-600">Academy/School Name</label>
                    <input
                      required
                      className="w-full bg-white border border-stone-200 p-3 text-sm focus:border-fluent-gold focus:outline-none"
                      placeholder="Current School..."
                      value={leadData.schoolName}
                      onChange={e => setLeadData(d => ({ ...d, schoolName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-600">Guardian Name</label>
                    <input
                      required
                      className="w-full bg-white border border-stone-200 p-3 text-sm focus:border-fluent-gold focus:outline-none"
                      placeholder="Full Name..."
                      value={leadData.contactPerson}
                      onChange={e => setLeadData(d => ({ ...d, contactPerson: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                   <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-600">Role</label>
                    <select
                      className="w-full bg-white border border-stone-200 p-3 text-sm focus:border-fluent-gold focus:outline-none"
                      value={leadData.designation}
                      onChange={e => setLeadData(d => ({ ...d, designation: e.target.value }))}
                    >
                      <option>Parent</option>
                      <option>Principal / Admin</option>
                      <option>Faculty Head</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-600">Phone (WhatsApp)</label>
                    <input
                      required
                      className="w-full bg-white border border-stone-200 p-3 text-sm focus:border-fluent-gold focus:outline-none"
                      placeholder="+91..."
                      value={leadData.phone}
                      onChange={e => setLeadData(d => ({ ...d, phone: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-600">Priority Email</label>
                  <input
                    required
                    type="email"
                    className="w-full bg-white border border-stone-200 p-3 text-sm focus:border-fluent-gold focus:outline-none"
                    placeholder="email@example.com"
                    value={leadData.email}
                    onChange={e => setLeadData(d => ({ ...d, email: e.target.value }))}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400">Student Count</label>
                    <input
                      required
                      className="w-full bg-white border border-stone-200 p-3 text-sm focus:border-fluent-gold focus:outline-none"
                      placeholder="e.g. 1"
                      value={leadData.studentCount}
                      onChange={e => setLeadData(d => ({ ...d, studentCount: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400">Target Grade</label>
                    <select
                      className="w-full bg-white border border-stone-200 p-3 text-sm focus:border-fluent-gold focus:outline-none"
                      value={leadData.classes}
                      onChange={e => setLeadData(d => ({ ...d, classes: e.target.value }))}
                    >
                      <option>Grade 9</option>
                      <option>Grade 10</option>
                      <option>Grade 11</option>
                      <option>Grade 12</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400">Primary Subject Interest</label>
                  <select
                    className="w-full bg-white border border-stone-200 p-3 text-sm focus:border-fluent-gold focus:outline-none"
                    value={leadData.subject}
                    onChange={e => setLeadData(d => ({ ...d, subject: e.target.value }))}
                  >
                    <option>Physics</option>
                    <option>Mathematics</option>
                    <option>Chemistry</option>
                    <option>Biology</option>
                    <option>English</option>
                    <option>Full Academic Sequence</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingLead}
                  className="w-full bg-fluent-midnight text-fluent-cream py-5 font-display text-[10px] tracking-[0.2em] uppercase hover:bg-fluent-gold hover:text-fluent-midnight transition-all disabled:opacity-50"
                >
                  {isSubmittingLead ? "Transmitting..." : "Initiate Admission Request ✦"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Notification */}
      <AnimatePresence>
        {waitlistSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-10 right-10 z-[1000] bg-fluent-midnight text-white p-8 border-l-4 border-fluent-gold shadow-2xl max-w-sm"
          >
            <div className="font-display text-[10px] tracking-[0.3em] text-fluent-gold mb-2 uppercase">Protocol Initiated</div>
            <h4 className="font-serif text-xl font-semibold mb-2">Request Logged.</h4>
            <p className="text-stone-400 text-xs mb-6">Our institutional board will prioritize your case for audit. We will reach out within 24 standard operational hours.</p>
            <button
               onClick={() => setWaitlistSuccess(false)}
               className="text-[9px] font-black uppercase tracking-widest text-fluent-gold hover:text-white transition-colors"
            >
              Dismiss ARCHIVE
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
