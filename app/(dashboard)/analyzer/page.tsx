"use client";
import { useEffect, useMemo, useState } from "react";
import { BrainCircuit, Check, LoaderCircle, RotateCcw, Send, Target, AlertTriangle, Clock, ChevronRight } from "lucide-react";
import { useAuth } from "@/app/providers/auth";

type Result = { score: number; criteria: { name: string; score: number; comment: string }[]; targets: string[] };
type EssayHistory = { id: string; essay: string; result: Result; createdAt: string };

const fallback: Result = {
  score: 6.0,
  criteria: [
    { name: "Task Response", score: 6.0, comment: "Position is visible; ideas can be developed with more specific support." },
    { name: "Coherence & Cohesion", score: 6.0, comment: "Overall progression is clear. Strengthen topic-sentence links and paragraph flow." },
    { name: "Lexical Resource", score: 5.5, comment: "Meaning is generally clear; reduce repeated basic vocabulary." },
    { name: "Grammar", score: 5.5, comment: "Sentence structures are understandable; improve accuracy in complex sentences." },
  ],
  targets: ["Develop one idea with a specific example", "Upgrade repeated basic vocabulary", "Rewrite two complex sentences for accuracy"],
};

export default function Analyzer() {
  const { user } = useAuth();
  const [essay, setEssay] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<EssayHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const words = useMemo(() => (essay.trim() ? essay.trim().split(/\s+/).length : 0), [essay]);

  useEffect(() => {
    async function loadHistory() {
      if (!user) return;
      try {
        const res = await fetch(`/api/essays?uid=${user.uid}`);
        const data = await res.json();
        if (data.essays) {
          setHistory(data.essays);
        }
      } catch (error) {
        console.error("Error fetching essay history:", error);
      } finally {
        setHistoryLoading(false);
      }
    }
    loadHistory();
  }, [user]);

  async function analyze() {
    if (!essay.trim() || !user) return;
    setLoading(true);
    setResult(null);
    try {
      const r = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ essay }),
      });
      const data = await r.json();
      const analysisResult: Result = data.result || data;
      setResult(analysisResult);

      setSaving(true);
      await fetch("/api/essays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          essay: essay.substring(0, 5000),
          result: analysisResult,
        }),
      });

      const historyRes = await fetch(`/api/essays?uid=${user.uid}`);
      const historyData = await historyRes.json();
      if (historyData.essays) {
        setHistory(historyData.essays);
      }
    } catch {
      setResult(fallback);
    } finally {
      setLoading(false);
      setSaving(false);
    }
  }

  function loadHistoryItem(item: EssayHistory) {
    setEssay(item.essay);
    setResult(item.result);
  }

  return (
    <div className="container-wide py-10">
      <div>
        <div className="eyebrow">PRACTICE ASSESSMENT</div>
        <h1 className="text-4xl font-black mt-2">Essay Analyzer</h1>
        <p className="text-[#667085] mt-2 max-w-2xl">TR / CC / LR / GRA бойынша practice feedback. Бұл ресми IELTS band score емес.</p>
      </div>

      <div className="grid lg:grid-cols-[1.1fr_.9fr] gap-6 mt-7">
        <section className="card p-6">
          <div className="flex items-center justify-between">
            <div className="font-extrabold flex items-center gap-2">
              <BrainCircuit size={19} />
              My essay
            </div>
            <div className="text-xs text-[#667085]">{words} words</div>
          </div>
          <textarea
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            placeholder="Paste or write your Task 2 essay..."
            className="mt-4 min-h-[460px] w-full rounded-xl border border-[#e6e8ee] p-4 resize-y outline-none focus:border-[#4f46e5] leading-7"
          />
          <div className="flex gap-2 mt-4">
            <button
              onClick={analyze}
              disabled={loading || !essay.trim()}
              className="px-4 py-3 rounded-xl bg-[#111827] text-white font-bold inline-flex items-center gap-2 disabled:opacity-40"
            >
              {loading ? <LoaderCircle size={17} className="animate-spin" /> : <Send size={17} />}
              Analyze essay
            </button>
            <button
              onClick={() => {
                setEssay("");
                setResult(null);
              }}
              className="px-4 py-3 rounded-xl border border-[#e6e8ee] font-bold inline-flex items-center gap-2"
            >
              <RotateCcw size={16} />
              Reset
            </button>
          </div>

          {history.length > 0 && (
            <div className="mt-6 pt-6 border-t border-[#e6e8ee]">
              <div className="font-extrabold mb-4">Analysis history</div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => loadHistoryItem(item)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-[#f8fafc] border border-[#e6e8ee] hover:bg-[#eef2ff] transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Clock size={16} className="text-[#667085]" />
                      <div>
                        <div className="text-sm font-semibold">
                          {new Date(item.createdAt).toLocaleDateString("kk-KZ", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <div className="text-xs text-[#667085] mt-0.5">
                          Score: {item.result.score.toFixed(1)} • {item.essay.substring(0, 50)}...
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-[#98a2b3]" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="card p-6">
          <div className="eyebrow">ANALYSIS</div>
          {!result ? (
            <div className="h-[460px] grid place-items-center text-center">
              <div>
                <div className="h-14 w-14 rounded-2xl bg-[#eef2ff] text-[#4f46e5] grid place-items-center mx-auto">
                  <Target size={25} />
                </div>
                <div className="font-extrabold mt-4">Your feedback appears here</div>
                <p className="text-sm text-[#667085] max-w-sm mt-2">Эссені енгізіп, Analyze басыңыз. Нәтиже Firestore-та сақталады.</p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-end justify-between mt-4">
                <div>
                  <div className="text-sm text-[#667085]">Estimated practice score</div>
                  <div className="text-5xl font-black mt-1">{result.score.toFixed(1)}</div>
                </div>
                <span className="badge bg-[#fff7ed] text-[#9a3412]">
                  <AlertTriangle size={14} className="mr-1" />
                  Practice
                </span>
              </div>
              <div className="space-y-4 mt-7">
                {result.criteria.map((c) => (
                  <div key={c.name} className="p-4 rounded-2xl bg-[#fafaff] border border-[#e6e8ee]">
                    <div className="flex justify-between gap-3">
                      <div className="font-extrabold">{c.name}</div>
                      <div className="font-black">{c.score.toFixed(1)}</div>
                    </div>
                    <p className="text-sm text-[#667085] mt-2 leading-6">{c.comment}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-5 rounded-2xl bg-[#111827] text-white">
                <div className="font-extrabold">3 improvement targets</div>
                <div className="mt-3 space-y-2">
                  {result.targets.map((x, i) => (
                    <div key={x} className="flex gap-2 text-sm text-white/75">
                      <span className="h-6 w-6 rounded-full bg-white/10 grid place-items-center text-xs">{i + 1}</span>
                      {x}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}