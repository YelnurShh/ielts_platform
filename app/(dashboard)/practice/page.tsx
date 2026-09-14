"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { CheckCircle2, RotateCcw, Save, Timer, BookOpenText, Send, Loader2 } from "lucide-react";
import { useAuth } from "@/app/providers/auth";

type Plan = { thesis: string; bp1: string; bp2: string; example: string };
type SelfAssessment = { tr: boolean; cc: boolean; lr: boolean; gra: boolean };

const initialPlan: Plan = { thesis: "", bp1: "", bp2: "", example: "" };
const initialAssessment: SelfAssessment = { tr: false, cc: false, lr: false, gra: false };

export default function Practice() {
  const { user } = useAuth();
  const [essay, setEssay] = useState("");
  const [plan, setPlan] = useState<Plan>(initialPlan);
  const [assessment, setAssessment] = useState<SelfAssessment>(initialAssessment);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [seconds, setSeconds] = useState(40 * 60);

  const updateWordCount = useCallback((text: string) => {
    const count = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(count);
  }, []);

  useEffect(() => {
    async function loadDraft() {
      if (!user) return;
      try {
        const res = await fetch(`/api/progress?uid=${user.uid}`);
        const data = await res.json();
        if (data.exists) {
          if (data.essayDraft) setEssay(data.essayDraft);
          if (data.planDraft) setPlan(data.planDraft);
          if (data.selfAssessment) setAssessment(data.selfAssessment);
          updateWordCount(data.essayDraft || "");
        }
      } catch (error) {
        console.error("Error loading draft:", error);
      }
    }
    loadDraft();
  }, [user, updateWordCount]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  async function saveDraft() {
    if (!user) return;
    setLoading(true);
    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          essayDraft: essay,
          planDraft: plan,
          selfAssessment: assessment,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Error saving draft:", error);
    } finally {
      setLoading(false);
    }
  }

  async function submitEssay() {
    if (!user || !essay.trim()) return;
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ essay }),
      });
      const data = await res.json();
      if (data.result) {
        setFeedback(data.result);
      } else {
        setFeedback(data.error || "Feedback алу кезінде қате орын алды.");
      }
    } catch (error) {
      setFeedback("Feedback алу кезінде қате орын алды.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setEssay("");
    setPlan(initialPlan);
    setAssessment(initialAssessment);
    setFeedback(null);
    setWordCount(0);
    setSeconds(40 * 60);
  }

  return (
    <div className="container-wide py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <div className="eyebrow">WRITING PRACTICE</div>
          <h1 className="text-4xl font-black mt-2">Guided writing</h1>
          <p className="text-[#667085] mt-2 max-w-2xl">Сұрақ → plan → full essay → self-check. Draft автоматично сақталады.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`badge border ${seconds <= 60 ? "bg-red-50 border-red-200 text-red-600" : "bg-white border-[#e6e8ee] text-[#667085]"}`}>
            <Timer size={14} className="mr-1" />
            {formatTime(seconds)}
          </span>
          <button
            onClick={saveDraft}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#111827] text-white font-bold disabled:opacity-60"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
            {saved ? "Сақталды" : "Save draft"}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[.65fr_1.35fr] gap-6 mt-7">
        <aside className="card p-6 h-fit">
          <div className="text-xs font-bold text-[#667085]">TASK</div>
          <h2 className="font-extrabold text-lg mt-2">Discussion Essay</h2>
          <p className="mt-4 text-sm leading-7">
            Some people believe that schools should focus more on practical skills than academic subjects. Discuss both views and give your own opinion.
          </p>
          <div className="mt-6">
            <div className="text-xs font-bold text-[#667085]">QUESTION ANALYSIS</div>
            <div className="mt-3 space-y-2 text-sm">
              <div className="p-3 rounded-xl bg-[#eef2ff] text-[#3730a3] font-semibold">Task: Discuss both views + opinion</div>
              <div className="p-3 rounded-xl bg-[#f8fafc]">Position: choose a clear stance</div>
              <div className="p-3 rounded-xl bg-[#f8fafc]">Topic: education priorities</div>
            </div>
          </div>
        </aside>

        <main className="space-y-5">
          <section className="card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-extrabold">
                <BookOpenText size={18} />
                Essay plan
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-3 mt-5">
              {Object.entries(plan).map(([key, val]) => (
                <textarea
                  key={key}
                  value={val}
                  onChange={(e) => setPlan({ ...plan, [key]: e.target.value })}
                  placeholder={key.replace("bp1", "Body paragraph 1").replace("bp2", "Body paragraph 2").replace("thesis", "Thesis statement").replace("example", "Example / evidence")}
                  className="min-h-24 rounded-xl border border-[#e6e8ee] bg-white p-3 text-sm outline-none focus:border-[#4f46e5]"
                />
              ))}
            </div>
          </section>

          <section className="card p-6">
            <div className="flex items-center justify-between">
              <div className="font-extrabold">Full essay</div>
              <div className="text-xs text-[#667085]">
                {wordCount} words
              </div>
            </div>
            <textarea
              value={essay}
              onChange={(e) => {
                setEssay(e.target.value);
                updateWordCount(e.target.value);
              }}
              placeholder="Write your full Task 2 essay here..."
              className="mt-4 min-h-[360px] w-full rounded-xl border border-[#e6e8ee] p-4 resize-y outline-none focus:border-[#4f46e5] leading-7"
            />
          </section>

          <section className="card p-6">
            <div className="font-extrabold">Self-assessment</div>
            <div className="grid md:grid-cols-4 gap-3 mt-4">
              {Object.entries(assessment).map(([key, checked]) => (
                <label
                  key={key}
                  className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer text-sm font-semibold transition-colors ${
                    checked ? "bg-[#eef2ff] border-[#4f46e5] text-[#3730a3]" : "bg-[#f8fafc] border-[#e6e8ee]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => setAssessment({ ...assessment, [key]: e.target.checked })}
                    className="hidden"
                  />
                  <div className={`h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 ${checked ? "bg-[#4f46e5] border-[#4f46e5]" : "border-[#667085]"}`}>
                    {checked && <CheckCircle2 size={14} className="text-white" />}
                  </div>
                  {key.toUpperCase()}
                </label>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={submitEssay}
                disabled={loading || !essay.trim()}
                className="px-4 py-3 rounded-xl bg-[#4f46e5] text-white font-bold inline-flex items-center gap-2 disabled:opacity-60"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                Get feedback
              </button>
              <button
                onClick={resetForm}
                disabled={loading}
                className="px-4 py-3 rounded-xl border border-[#e6e8ee] font-bold inline-flex items-center gap-2 disabled:opacity-60"
              >
                <RotateCcw size={16} />
                Reset
              </button>
            </div>
            {feedback && (
              <div className="mt-4 p-4 rounded-xl bg-[#f8fafc] border border-[#e6e8ee]">
                <div className="text-sm font-bold mb-2">Feedback</div>
                <p className="text-sm text-[#667085] leading-6 whitespace-pre-wrap">{feedback}</p>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}