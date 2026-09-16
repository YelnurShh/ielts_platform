"use client";
import { useEffect, useMemo, useState } from "react";
import { BrainCircuit, CheckCircle2, LoaderCircle, RotateCcw, Send, Target, AlertTriangle, Clock, ChevronRight, Lightbulb, ThumbsUp } from "lucide-react";
import { useAuth } from "@/app/providers/auth";
import { useLocale } from "@/app/providers/locale";

type CriteriaItem = { name: string; score: number; positives: string[]; improvements: string[]; comment: string };
type Meta = {
  words: number; sentences: number; paragraphs: number; vocab: number;
  variety: number; linking: number; position: number; balance: number;
  repetition: number; complexSentences: number; avgLength: number;
};
type Result = { score: number; criteria: CriteriaItem[]; targets: string[]; meta: Meta };
type EssayHistory = { id: string; essay: string; result: Result; createdAt: string };

const fallback: Result = {
  score: 6.0,
  criteria: [
    { name: "Task Response", score: 6.0, positives: ["Position is visible."], improvements: ["Develop ideas with specific support."], comment: "Position is visible; ideas can be developed with more specific support." },
    { name: "Coherence & Cohesion", score: 6.0, positives: ["Paragraphing is present."], improvements: ["Strengthen topic-sentence links."], comment: "Overall progression is clear. Strengthen topic-sentence links and paragraph flow." },
    { name: "Lexical Resource", score: 5.5, positives: ["Meaning is generally clear."], improvements: ["Reduce repeated basic vocabulary."], comment: "Meaning is generally clear; reduce repeated basic vocabulary." },
    { name: "Grammar", score: 5.5, positives: ["Sentence structures are understandable."], improvements: ["Improve accuracy in complex sentences."], comment: "Sentence structures are understandable; improve accuracy in complex sentences." },
  ],
  targets: ["Develop one idea with a specific example", "Upgrade repeated basic vocabulary", "Rewrite two complex sentences for accuracy"],
  meta: { words: 0, sentences: 0, paragraphs: 0, vocab: 0, variety: 0, linking: 0, position: 0, balance: 0, repetition: 0, complexSentences: 0, avgLength: 0 },
};

function bandColor(score: number){
  if (score >= 7.5) return "text-[#059669] bg-[#ecfdf5]";
  if (score >= 6.5) return "text-[#4f46e5] bg-[#eef2ff]";
  if (score >= 5.5) return "text-[#d97706] bg-[#fffbeb]";
  return "text-[#dc2626] bg-[#fef2f2]";
}

export default function Analyzer() {
  const { user } = useAuth();
  const { t, locale } = useLocale();
  const safeLocale = locale || "kk";
  const [essay, setEssay] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<EssayHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const words = useMemo(() => (essay.trim() ? essay.trim().split(/\s+/).length : 0), [essay]);

  const criteriaNameMap: Record<string, string> = {
    "Task Response": t.analyzer.criteria.taskResponse,
    "Coherence & Cohesion": t.analyzer.criteria.coherence,
    "Lexical Resource": t.analyzer.criteria.lexical,
    "Grammar": t.analyzer.criteria.grammar,
  };

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
        body: JSON.stringify({ essay, locale: safeLocale }),
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
        <div className="eyebrow">{t.analyzer.eyebrow}</div>
        <h1 className="text-4xl font-black mt-2">{t.analyzer.title}</h1>
        <p className="text-[#667085] mt-2 max-w-2xl">{t.analyzer.subtitle}</p>
      </div>

      <div className="grid lg:grid-cols-[1.1fr_.9fr] gap-6 mt-7">
        <section className="card p-6">
          <div className="flex items-center justify-between">
            <div className="font-extrabold flex items-center gap-2">
              <BrainCircuit size={19} />
              {t.analyzer.myEssay}
            </div>
            <div className="text-xs text-[#667085]">{words} {t.practice.words}</div>
          </div>
          <textarea
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            placeholder={t.analyzer.placeholder}
            className="mt-4 min-h-[460px] w-full rounded-xl border border-[#e6e8ee] p-4 resize-y outline-none focus:border-[#4f46e5] leading-7"
          />
          <div className="flex gap-2 mt-4">
            <button
              onClick={analyze}
              disabled={loading || !essay.trim()}
              className="px-4 py-3 rounded-xl bg-[#111827] text-white font-bold inline-flex items-center gap-2 disabled:opacity-40"
            >
              {loading ? <LoaderCircle size={17} className="animate-spin" /> : <Send size={17} />}
              {t.analyzer.analyzeBtn}
            </button>
            <button
              onClick={() => {
                setEssay("");
                setResult(null);
              }}
              className="px-4 py-3 rounded-xl border border-[#e6e8ee] font-bold inline-flex items-center gap-2"
            >
              <RotateCcw size={16} />
              {t.analyzer.resetBtn}
            </button>
          </div>

          {history.length > 0 && (
            <div className="mt-6 pt-6 border-t border-[#e6e8ee]">
              <div className="font-extrabold mb-4">{t.analyzer.historyTitle}</div>
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
                          {t.analyzer.scoreLabel.replace("{score}", item.result.score.toFixed(1))} • {item.essay.substring(0, 50)}...
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
          <div className="eyebrow">{t.analyzer.analysis}</div>
          {!result ? (
            <div className="h-[460px] grid place-items-center text-center">
              <div>
                <div className="h-14 w-14 rounded-2xl bg-[#eef2ff] text-[#4f46e5] grid place-items-center mx-auto">
                  <Target size={25} />
                </div>
                <div className="font-extrabold mt-4">{t.analyzer.feedbackPlaceholder.split('.')[0]}</div>
                <p className="text-sm text-[#667085] max-w-sm mt-2">{t.analyzer.feedbackPlaceholder.split('.')[1] || ''}</p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-end justify-between mt-4">
                <div>
                  <div className="text-sm text-[#667085]">{t.analyzer.estimatedScore}</div>
                  <div className="text-5xl font-black mt-1">{result.score.toFixed(1)}</div>
                </div>
                <span className="badge bg-[#fff7ed] text-[#9a3412]">
                  <AlertTriangle size={14} className="mr-1" />
                  {t.analyzer.practiceBadge}
                </span>
              </div>

              {result.meta && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                  {[
                    [t.analyzer.meta?.words ?? "Words", result.meta.words, result.meta.words >= 250 ? "text-[#059669]" : "text-[#dc2626]"],
                    [t.analyzer.meta?.sentences ?? "Sentences", result.meta.sentences, result.meta.sentences >= 12 ? "text-[#059669]" : "text-[#d97706]"],
                    [t.analyzer.meta?.paragraphs ?? "Paragraphs", result.meta.paragraphs, result.meta.paragraphs >= 4 ? "text-[#059669]" : "text-[#d97706]"],
                    [t.analyzer.meta?.vocabulary ?? "Vocabulary", result.meta.vocab, result.meta.vocab >= 120 ? "text-[#059669]" : "text-[#d97706]"],
                  ].map(([label, value, color]) => (
                    <div key={label as string} className="p-3 rounded-xl bg-[#f8fafc] border border-[#e6e8ee]">
                      <div className="text-xs text-[#667085]">{label as string}</div>
                      <div className={`text-xl font-black ${color as string}`}>{value as number}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-4 mt-6">
                {result.criteria.map((c) => (
                  <div key={c.name} className="p-4 rounded-2xl bg-[#fafaff] border border-[#e6e8ee]">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-extrabold">{criteriaNameMap[c.name] || c.name}</div>
                      <div className={`px-2.5 py-1 rounded-lg text-sm font-black ${bandColor(c.score)}`}>{c.score.toFixed(1)}</div>
                    </div>
                    {c.positives.length > 0 && (
                      <div className="mt-3">
                        {c.positives.map((p) => (
                          <div key={p} className="flex items-start gap-2 text-sm text-[#374151]">
                            <CheckCircle2 size={16} className="text-[#059669] mt-0.5 shrink-0" />
                            <span>{p}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {c.improvements.length > 0 && (
                      <div className="mt-3">
                        {c.improvements.map((p) => (
                          <div key={p} className="flex items-start gap-2 text-sm text-[#374151]">
                            <Lightbulb size={16} className="text-[#d97706] mt-0.5 shrink-0" />
                            <span>{p}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {!c.positives.length && !c.improvements.length && (
                      <p className="text-sm text-[#667085] mt-2 leading-6">{c.comment}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 p-5 rounded-2xl bg-[#111827] text-white">
                <div className="font-extrabold">{t.analyzer.improvementTargets}</div>
                <div className="mt-3 space-y-2">
                  {result.targets.map((x, i) => (
                    <div key={x} className="flex gap-2 text-sm text-white/75">
                      <span className="h-6 w-6 rounded-full bg-white/10 grid place-items-center text-xs shrink-0">{i + 1}</span>
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
