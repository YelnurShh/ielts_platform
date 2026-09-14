"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Lightbulb } from "lucide-react";
import { lessons, getLesson } from "../../../../lib/course";
import { LessonInteractive } from "../../../components/LessonInteractive";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import { useAuth } from "@/app/providers/auth";

export default function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [marking, setMarking] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    params.then((resolved) => setId(resolved.id));
  }, [params]);

  useEffect(() => {
    async function fetchStatus() {
      if (!user || !id) return;
      try {
        const res = await fetch(`/api/progress?uid=${user.uid}`);
        const data = await res.json();
        if (data.exists && data.completedLessons) {
          setIsCompleted(data.completedLessons.includes(Number(id)));
        }
      } catch (error) {
        console.error("Error fetching lesson status:", error);
      }
    }
    fetchStatus();
  }, [user, id]);

  if (!id) {
    return <div className="container-wide py-20"><LoadingSpinner /></div>;
  }

  const lesson = getLesson(Number(id));
  if (!lesson) return <div className="container-wide py-20">Lesson not found.</div>;

  const next = lessons.find((l) => l.id > lesson.id && l.status === "available");

  async function handleMarkComplete() {
    if (!user || marking) return;
    setMarking(true);
    try {
      const res = await fetch("/api/progress", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid, lessonId: Number(id), completed: !isCompleted }),
      });
      const data = await res.json();
      if (data.success) {
        setIsCompleted(!isCompleted);
      }
    } catch (error) {
      console.error("Error marking lesson:", error);
    } finally {
      setMarking(false);
    }
  }

  return (
    <div className="container-wide py-10">
      <Link href="/lessons" className="inline-flex items-center gap-2 text-sm font-bold text-[#667085]">
        <ArrowLeft size={16} />
        Back to lessons
      </Link>
      <div className="grid lg:grid-cols-[.85fr_1.15fr] gap-6 mt-6">
        <aside className="card p-6 h-fit lg:sticky lg:top-24">
          <div className="eyebrow">LESSON {lesson.id} · {lesson.unit}</div>
          <h1 className="text-3xl font-black mt-2">{lesson.title}</h1>
          <p className="text-[#667085] mt-3 leading-7">{lesson.summary}</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="card-soft p-4">
              <div className="text-xs text-[#667085]">Duration</div>
              <div className="font-extrabold mt-1">{lesson.duration} min</div>
            </div>
            <div className="card-soft p-4">
              <div className="text-xs text-[#667085]">Steps</div>
              <div className="font-extrabold mt-1">{lesson.steps.length}</div>
            </div>
          </div>
          <div className="mt-6 space-y-2">
            {lesson.steps.map((s, i) => (
              <div key={s} className="flex items-center gap-3 p-3 rounded-xl bg-[#fafaff] border border-[#e6e8ee] text-sm">
                <span
                  className={`h-7 w-7 rounded-full grid place-items-center text-xs font-bold ${
                    i === 0 ? "bg-[#111827] text-white" : "bg-[#eef2ff] text-[#4f46e5]"
                  }`}
                >
                  {i + 1}
                </span>
                {s}
              </div>
            ))}
          </div>
          <button
            onClick={handleMarkComplete}
            disabled={marking}
            className={`mt-6 w-full px-4 py-3 rounded-xl font-bold inline-flex items-center justify-center gap-2 ${
              isCompleted
                ? "bg-[#ecfdf3] text-[#087443] border border-[#087443]"
                : "bg-[#111827] text-white"
            }`}
          >
            <Check size={18} />
            {marking ? "Сақталуда..." : isCompleted ? "Аяқталды" : "Сабақты аяқтау"}
          </button>
        </aside>
        <main className="card p-6 md:p-8">
          <div className="eyebrow">STEP 1 — LEARN</div>
          <h2 className="text-2xl font-extrabold mt-2">Core concept</h2>
          <p className="text-[#667085] mt-3 leading-7">
            IELTS Writing Task 2 үшін оқу процесі бірізді циклмен жүреді: теория → интерактивті практика → сұрақ анализі → brainstorm → plan → writing → self-check → feedback → rewrite.
          </p>
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            {[
              ["Question Analysis", "Сұрақтың нақты талабын белгіле."],
              ["Brainstorm", "Идеяларды релеванттық бойынша сұрыпта."],
              ["Rewrite", "Feedback-тен кейін мәтінді қайта жаз."],
            ].map(([title, desc], i) => (
              <div key={title} className="card-soft p-4">
                <div className="h-9 w-9 rounded-xl bg-[#eef2ff] text-[#4f46e5] grid place-items-center font-extrabold">{i + 1}</div>
                <div className="font-extrabold mt-3">{title}</div>
                <p className="text-sm text-[#667085] mt-1 leading-6">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 p-5 rounded-2xl bg-[#111827] text-white">
            <div className="flex gap-3">
              <Lightbulb size={20} />
              <div>
                <div className="font-extrabold">Practice principle</div>
                <p className="text-sm text-white/70 mt-1">Тек қатені белгілеу жеткіліксіз. Негізгі циклдің соңғы қадамы — rewrite.</p>
              </div>
            </div>
          </div>
          <LessonInteractive lesson={lesson} />
          <div className="mt-8 pt-6 border-t border-[#e6e8ee] flex justify-between gap-3">
            <Link href="/lessons" className="px-4 py-3 rounded-xl border border-[#e6e8ee] font-bold inline-flex gap-2 items-center">
              <ArrowLeft size={16} />
              Back
            </Link>
            {next ? (
              <Link href={`/lessons/${next.id}`} className="px-4 py-3 rounded-xl bg-[#111827] text-white font-bold inline-flex gap-2 items-center">
                Next lesson <ArrowRight size={16} />
              </Link>
            ) : (
              <Link href="/portfolio" className="px-4 py-3 rounded-xl bg-[#111827] text-white font-bold inline-flex gap-2 items-center">
                Open portfolio <ArrowRight size={16} />
              </Link>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}