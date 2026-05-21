import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "./firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Flame,
  GraduationCap,
  Hammer,
  Moon,
  Plus,
  RotateCcw,
  Target,
  Trash2,
  Trophy,
  BriefcaseBusiness,
} from "lucide-react";

const defaultBlocks = [
  { id: crypto.randomUUID(), time: "8:00 AM", title: "Wake up + hygiene", type: "Reset", done: false },
  { id: crypto.randomUUID(), time: "8:30 AM", title: "Breakfast + plan day", type: "Life", done: false },
  { id: crypto.randomUUID(), time: "9:00 AM", title: "Deep work: class / technical study", type: "School", done: false },
  { id: crypto.randomUUID(), time: "11:00 AM", title: "Project build block", type: "Project", done: false },
  { id: crypto.randomUUID(), time: "1:00 PM", title: "Lunch + reset", type: "Life", done: false },
  { id: crypto.randomUUID(), time: "2:00 PM", title: "Internship/co-op applications or networking", type: "Career", done: false },
  { id: crypto.randomUUID(), time: "4:00 PM", title: "Gym / walk / movement", type: "Health", done: false },
  { id: crypto.randomUUID(), time: "6:00 PM", title: "Dinner", type: "Life", done: false },
  { id: crypto.randomUUID(), time: "7:00 PM", title: "Light work: GitHub, resume, or review", type: "Career", done: false },
  { id: crypto.randomUUID(), time: "9:30 PM", title: "Clean room + prep tomorrow", type: "Reset", done: false },
  { id: crypto.randomUUID(), time: "10:30 PM", title: "Wind down, no scrolling spiral", type: "Reset", done: false },
];

const defaultHabits = [
  { id: crypto.randomUUID(), name: "No wasted morning", done: false },
  { id: crypto.randomUUID(), name: "Apply/message for opportunity", done: false },
  { id: crypto.randomUUID(), name: "Work on one resume project", done: false },
  { id: crypto.randomUUID(), name: "Exercise or walk", done: false },
  { id: crypto.randomUUID(), name: "Sleep setup before midnight", done: false },
];

const typeStyles = {
  School: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Project: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Career: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Health: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Life: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  Reset: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

const getTodayKey = () => new Date().toISOString().slice(0, 10);

export default function SummerCommandCenter() {
  const dateKey = getTodayKey();

  const [blocks, setBlocks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [topGoal, setTopGoal] = useState("");
  const [reflection, setReflection] = useState({ win: "", fix: "", tomorrow: "" });
  const [loading, setLoading] = useState(true);

  const [newBlock, setNewBlock] = useState({ time: "", title: "", type: "Project" });
  const [newHabit, setNewHabit] = useState("");

  useEffect(() => {
    const docRef = doc(db, "days", dateKey);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setBlocks(data.blocks || []);
        setHabits(data.habits || []);
        setTopGoal(data.topGoal || "");
        setReflection(data.reflection || { win: "", fix: "", tomorrow: "" });
      } else {
        setDoc(docRef, {
          blocks: defaultBlocks,
          habits: defaultHabits,
          topGoal: "Finish one meaningful thing today.",
          reflection: { win: "", fix: "", tomorrow: "" },
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [dateKey]);

  const pushStateToCloud = async (updatedFields) => {
    try {
      const docRef = doc(db, "days", dateKey);
      await setDoc(docRef, updatedFields, { merge: true });
    } catch (err) {
      console.error("Database sync failure:", err);
    }
  };

  const completedBlocks = blocks.filter((b) => b.done).length;
  const completedHabits = habits.filter((h) => h.done).length;

  const score = useMemo(() => {
    const total = blocks.length + habits.length;
    if (!total) return 0;
    return Math.round(((completedBlocks + completedHabits) / total) * 100);
  }, [blocks, habits, completedBlocks, completedHabits]);

  const careerCount = blocks.filter((b) => b.type === "Career" && b.done).length;
  const projectCount = blocks.filter((b) => b.type === "Project" && b.done).length;

  const toggleBlock = (id) => {
    const updated = blocks.map((b) => (b.id === id ? { ...b, done: !b.done } : b));
    setBlocks(updated);
    pushStateToCloud({ blocks: updated });
  };

  const toggleHabit = (id) => {
    const updated = habits.map((h) => (h.id === id ? { ...h, done: !h.done } : h));
    setHabits(updated);
    pushStateToCloud({ habits: updated });
  };

  const addBlock = () => {
    if (!newBlock.time.trim() || !newBlock.title.trim()) return;
    const updated = [...blocks, { id: crypto.randomUUID(), ...newBlock, done: false }];
    setBlocks(updated);
    pushStateToCloud({ blocks: updated });
    setNewBlock({ time: "", title: "", type: "Project" });
  };

  const addHabit = () => {
    if (!newHabit.trim()) return;
    const updated = [...habits, { id: crypto.randomUUID(), name: newHabit.trim(), done: false }];
    setHabits(updated);
    pushStateToCloud({ habits: updated });
    setNewHabit("");
  };

  const deleteBlock = (id) => {
    const updated = blocks.filter((b) => b.id !== id);
    setBlocks(updated);
    pushStateToCloud({ blocks: updated });
  };

  const deleteHabit = (id) => {
    const updated = habits.filter((h) => h.id !== id);
    setHabits(updated);
    pushStateToCloud({ habits: updated });
  };

  const resetToday = () => {
    const resetB = defaultBlocks.map((b) => ({ ...b, id: crypto.randomUUID(), done: false }));
    const resetH = defaultHabits.map((h) => ({ ...h, id: crypto.randomUUID(), done: false }));
    const initialGoal = "Finish one meaningful thing today.";
    const initialRef = { win: "", fix: "", tomorrow: "" };

    setBlocks(resetB);
    setHabits(resetH);
    setTopGoal(initialGoal);
    setReflection(initialRef);

    pushStateToCloud({ blocks: resetB, habits: resetH, topGoal: initialGoal, reflection: initialRef });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-emerald-400 font-mono tracking-widest animate-pulse">
        CONNECTING TO COMMAND LAYER...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white p-4 md:p-8 selection:bg-emerald-500/30">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid lg:grid-cols-[1.4fr_.6fr] gap-4 items-stretch"
        >
          <div className="rounded-3xl bg-slate-900/40 border border-white/5 p-6 backdrop-blur-md shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 text-emerald-400 mb-3">
                <Flame className="w-5 h-5 animate-pulse" />
                <p className="uppercase tracking-[0.25em] text-xs font-black opacity-80">System Command Center</p>
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white/90">
                Don’t let the day disappear.
              </h1>
              <p className="text-slate-400 mt-2 text-sm md:text-base max-w-2xl leading-relaxed">
                Map the metrics, scale execution parameters, and lock down Fall 2026 / Spring 2027 technical placement.
              </p>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <div className="flex-1 rounded-2xl bg-black/40 border border-white/5 p-3.5 flex flex-col justify-center focus-within:border-emerald-500/30 transition">
                <label className="text-[11px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1 font-bold">
                  <Target className="w-3.5 h-3.5 text-emerald-400" /> Key Objective
                </label>
                <input
                  value={topGoal}
                  onChange={(e) => {
                    setTopGoal(e.target.value);
                    pushStateToCloud({ topGoal: e.target.value });
                  }}
                  className="w-full bg-transparent outline-none text-base font-bold placeholder:text-slate-600 text-slate-100"
                  placeholder="What builds momentum today?"
                />
              </div>
              <button
                onClick={resetToday}
                className="rounded-2xl px-5 py-3 bg-white text-slate-950 font-black text-sm flex items-center justify-center gap-2 hover:bg-emerald-300 transition active:scale-95 shadow-lg shrink-0"
              >
                <RotateCcw className="w-4 h-4" /> Reset Layout
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 p-6 shadow-xl flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute -right-6 -bottom-6 text-black/5 pointer-events-none group-hover:scale-110 transition duration-500">
              <Trophy className="w-44 h-44" />
            </div>
            <div className="flex items-start justify-between z-10">
              <div>
                <p className="text-xs uppercase tracking-widest font-black opacity-70">Daily Sync Vector</p>
                <p className="text-6xl font-black tracking-tighter mt-1">{score}%</p>
              </div>
              <Trophy className="w-10 h-10 opacity-90 hidden sm:block" />
            </div>
            <div className="mt-6 grid grid-cols-3 gap-2 text-center z-10">
              <StatCard val={completedBlocks} label="Blocks" />
              <StatCard val={projectCount} label="Project" />
              <StatCard val={careerCount} label="Career" />
            </div>
          </div>
        </motion.header>

        <section className="grid lg:grid-cols-[1.2fr_.8fr] gap-6">
          <div className="rounded-3xl bg-slate-900/20 border border-white/5 p-5 md:p-6 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-xl font-black flex items-center gap-2 text-white/90">
                  <CalendarDays className="w-5 h-5 text-emerald-400" /> Today’s Run Map
                </h2>
                <p className="text-slate-500 text-xs mt-0.5">Commit execution blocks down the stack.</p>
              </div>
              <span className="rounded-xl bg-white/5 border border-white/5 px-3 py-1.5 text-xs font-mono font-bold text-slate-400">
                {dateKey}
              </span>
            </div>

            <div className="space-y-2.5">
              <AnimatePresence mode="popLayout">
                {blocks.map((block) => (
                  <MapItem key={block.id} block={block} onToggle={toggleBlock} onDelete={deleteBlock} />
                ))}
              </AnimatePresence>
            </div>

            <div className="mt-4 rounded-2xl border border-white/5 bg-black/20 p-3 grid sm:grid-cols-[100px_1fr_130px_auto] gap-2">
              <input
                value={newBlock.time}
                onChange={(e) => setNewBlock({ ...newBlock, time: e.target.value })}
                placeholder="09:00 AM"
                className="rounded-xl bg-slate-900/60 border border-white/5 px-3 py-2 text-sm outline-none text-slate-200 focus:border-emerald-500/40"
              />
              <input
                value={newBlock.title}
                onChange={(e) => setNewBlock({ ...newBlock, title: e.target.value })}
                placeholder="Optimize DB layout or apply..."
                className="rounded-xl bg-slate-900/60 border border-white/5 px-3 py-2 text-sm outline-none text-slate-200 focus:border-emerald-500/40"
              />
              <select
                value={newBlock.type}
                onChange={(e) => setNewBlock({ ...newBlock, type: e.target.value })}
                className="rounded-xl bg-slate-900/80 border border-white/5 px-2 py-2 text-sm outline-none text-slate-300 focus:border-emerald-500/40 cursor-pointer"
              >
                {Object.keys(typeStyles).map((t) => (
                  <option key={t} value={t} className="bg-slate-950 text-white">
                    {t}
                  </option>
                ))}
              </select>
              <button onClick={addBlock} className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 text-sm font-black flex items-center justify-center gap-1.5 transition">
                <Plus className="w-4 h-4 stroke-[3]" /> Add
              </button>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl bg-slate-900/40 border border-white/5 p-5 shadow-xl backdrop-blur-md">
              <h2 className="text-lg font-black flex items-center gap-2 mb-4 text-white/90">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Non-Negotiable Loops
              </h2>
              <div className="space-y-2">
                {habits.map((habit) => (
                  <div key={habit.id} className="group flex items-center gap-3 rounded-xl bg-black/30 border border-white/5 p-3 hover:border-white/10 transition">
                    <button onClick={() => toggleHabit(habit.id)} className="focus:outline-none">
                      <CheckCircle2 className={`w-5 h-5 transition-transform active:scale-120 ${habit.done ? "text-emerald-400" : "text-slate-600"}`} />
                    </button>
                    <p className={`flex-1 text-sm font-semibold transition ${habit.done ? "line-through text-slate-500" : "text-slate-200"}`}>{habit.name}</p>
                    <button onClick={() => deleteHabit(habit.id)} className="opacity-0 group-hover:opacity-100 transition text-slate-600 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-3.5 flex gap-2">
                <input
                  value={newHabit}
                  onChange={(e) => setNewHabit(e.target.value)}
                  placeholder="Inject runtime rule..."
                  className="flex-1 rounded-xl bg-black/40 border border-white/5 px-3 py-2 text-sm outline-none focus:border-emerald-500/30 placeholder:text-slate-600 text-slate-200"
                />
                <button onClick={addHabit} className="rounded-xl bg-white text-slate-950 px-4 font-black text-xs hover:bg-emerald-300 transition">
                  Inject
                </button>
              </div>
            </div>

            <div className="rounded-3xl bg-slate-900/10 border border-white/5 p-5 shadow-xl">
              <h2 className="text-lg font-black flex items-center gap-2 mb-3.5 text-white/90">
                <BriefcaseBusiness className="w-5 h-5 text-slate-400" /> Placement Rules Engine
              </h2>
              <div className="grid gap-2.5 text-xs">
                <RuleBox title="Minimum Daily Career Action" desc="Apply to 1 targeted role, message 1 practitioner, or refactor 1 resume/project component." color="amber" icon={<Target className="w-3.5 h-3.5" />} />
                <RuleBox title="The Production Rule" desc="One deployed system beats ten sandbox proofs. Document, demo, and ship." color="purple" icon={<Hammer className="w-3.5 h-3.5" />} />
                <RuleBox title="Core Platform Shield" desc="Protect GPA and health. Use summer to expand scope, not crash resources." color="blue" icon={<GraduationCap className="w-3.5 h-3.5" />} />
              </div>
            </div>

            <div className="rounded-3xl bg-slate-900/40 border border-white/5 p-5 shadow-xl backdrop-blur-md">
              <h2 className="text-lg font-black flex items-center gap-2 mb-3 text-white/90">
                <Moon className="w-5 h-5 text-indigo-400" /> Post-Mortem Log
              </h2>
              <div className="space-y-2.5">
                <ReflectionArea
                  val={reflection.win}
                  placeholder="System wins / breakthroughs..."
                  onChange={(val) => {
                    const next = { ...reflection, win: val };
                    setReflection(next);
                    pushStateToCloud({ reflection: next });
                  }}
                />
                <ReflectionArea
                  val={reflection.fix}
                  placeholder="Where did I waste time?"
                  onChange={(val) => {
                    const next = { ...reflection, fix: val };
                    setReflection(next);
                    pushStateToCloud({ reflection: next });
                  }}
                />
                <ReflectionArea
                  val={reflection.tomorrow}
                  placeholder="Tomorrow’s first move..."
                  onChange={(val) => {
                    const next = { ...reflection, tomorrow: val };
                    setReflection(next);
                    pushStateToCloud({ reflection: next });
                  }}
                />
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function StatCard({ val, label }) {
  return (
    <div className="rounded-xl bg-black/10 py-2">
      <p className="text-xl font-black leading-none">{val}</p>
      <p className="text-[10px] font-bold uppercase tracking-wider opacity-60 mt-1">{label}</p>
    </div>
  );
}

function MapItem({ block, onToggle, onDelete }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.18 }}
      className={`group rounded-xl border p-3 flex items-center gap-3 transition-colors ${block.done ? "bg-emerald-950/20 border-emerald-500/20" : "bg-slate-900/50 border-white/5"}`}
    >
      <button onClick={() => onToggle(block.id)} className="focus:outline-none">
        <CheckCircle2 className={`w-5 h-5 transition ${block.done ? "text-emerald-400" : "text-slate-700"}`} />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-mono text-[11px] font-bold text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {block.time}
          </span>
          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${typeStyles[block.type] || typeStyles.Life}`}>
            {block.type}
          </span>
        </div>
        <p className={`text-sm font-semibold truncate ${block.done ? "line-through text-slate-500" : "text-slate-200"}`}>{block.title}</p>
      </div>
      <button onClick={() => onDelete(block.id)} className="opacity-0 group-hover:opacity-100 transition text-slate-600 hover:text-red-400 p-1">
        <Trash2 className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

function RuleBox({ title, desc, color, icon }) {
  const colors = {
    amber: "bg-amber-500/5 border-amber-500/10 text-amber-300",
    purple: "bg-purple-500/5 border-purple-500/10 text-purple-300",
    blue: "bg-blue-500/5 border-blue-500/10 text-blue-300",
  };

  return (
    <div className={`rounded-xl border p-3 ${colors[color] || colors.blue}`}>
      <p className="font-black flex items-center gap-1.5 text-xs uppercase tracking-wider">
        {icon} {title}
      </p>
      <p className="text-slate-400 font-medium mt-1 leading-relaxed text-[11px]">{desc}</p>
    </div>
  );
}

function ReflectionArea({ val, placeholder, onChange }) {
  return (
    <textarea
      value={val}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-16 rounded-xl bg-black/40 border border-white/5 p-2.5 text-xs outline-none focus:border-emerald-500/30 placeholder:text-slate-600 text-slate-300 resize-none font-medium leading-relaxed"
    />
  );
}

