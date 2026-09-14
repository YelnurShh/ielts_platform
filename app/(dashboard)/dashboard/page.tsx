"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, BookOpenCheck, BrainCircuit, Clock3, Trophy } from "lucide-react";
import { ProgressBar } from "../../components/ProgressBar";
import { StatCard } from "../../components/StatCard";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { lessons, units } from "../../../lib/course";
import { useAuth } from "../../../app/providers/auth";
import { isTeacher } from "../../../lib/auth";

interface Criteria {
  name: string;
  label: string;
  value: number;
}

interface ProgressData {
  courseProgress?: number;
  writingScore?: number;
  studyTime?: string;
  xp?: number;
  completedLessons?: number[];
  badges?: number;
  currentUnit?: {
    id: number;
    title: string;
    description: string;
    progress: number;
  };
  nextLesson?: {
    id: number;
    title: string;
    summary: string;
    duration: string;
    steps: number;
  };
  criteria?: Criteria[];
}

export default function Dashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [progressLoading, setProgressLoading] = useState(true);
  const next = lessons.find((l) => l.id === 3)!;

  useEffect(() => {
    if (!loading && user && isTeacher(user.role)) {
      router.push("/teacher");
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function fetchProgress() {
      if (!user) return;

      try {
        const res = await fetch(`/api/progress?uid=${user.uid}`);
        const data = await res.json();

        if (data.exists !== false && data.courseProgress !== undefined) {
          setProgress(data);
        } else {
          setProgress({
            courseProgress: 0,
            writingScore: 0,
            studyTime: "0h 0m",
            xp: 0,
            completedLessons: [],
            badges: 0,
            currentUnit: {
              id: 0,
              title: "No active unit",
              description: "",
              progress: 0,
            },
            nextLesson: {
              id: 0,
              title: "No lesson",
              summary: "",
              duration: "0 min",
              steps: 0,
            },
            criteria: [],
          });
        }
      } catch (error) {
        console.error("Error fetching progress:", error);
      } finally {
        setProgressLoading(false);
      }
    }

    if (user) {
      fetchProgress();
    }
  }, [user]);

  if (loading || progressLoading) {
    return <div className="container-wide py-10"><LoadingSpinner /></div>;
  }

  if (!user) {
    return <div className="container-wide py-10">Кіру қажет</div>;
  }

  const currentUnit = progress?.currentUnit || {
    id: 1,
    title: "Discussion Essays",
    description: "3–9 lessons · Question analysis and idea development",
    progress: 28,
  };

  const nextLesson = progress?.nextLesson || {
    id: 3,
    title: "Question Analysis",
    summary: "Learn to dissect essay questions and identify key components.",
    duration: "24 min",
    steps: 6,
  };

  return (
    <div className="container-wide py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
        <div>
          <div className="eyebrow">STUDENT DASHBOARD</div>
          <h1 className="text-4xl font-black mt-2">Сәлем, {user.displayName || user.email} 👋</h1>
          <p className="text-[#667085] mt-2">Бүгінгі learning path-ды жалғастырайық.</p>
        </div>
        <Link href={`/lessons/${nextLesson.id}`} className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-[#111827] text-white font-bold">
          Жалғастыру <ArrowRight size={17} />
        </Link>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Course progress" value={`${progress?.courseProgress ?? 0}%`} helper={`${progress?.completedLessons ?? 0} / 34 lessons mapped`} icon={<BookOpenCheck size={18} />} />
        <StatCard label="Writing score" value={`${progress?.writingScore ?? 0}`} helper="Practice assessment" icon={<BrainCircuit size={18} />} />
        <StatCard label="Study time" value={progress?.studyTime ?? "0h 0m"} helper="This week" icon={<Clock3 size={18} />} />
        <StatCard label="XP" value={`${progress?.xp ?? 0}`} helper={`${progress?.badges ?? 0} badges earned`} icon={<Trophy size={18} />} />
      </div>
      <div className="grid lg:grid-cols-[1.35fr_.65fr] gap-6 mt-6">
        <section className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="eyebrow">CURRENT UNIT</div>
              <h2 className="text-2xl font-extrabold mt-2">{currentUnit.title}</h2>
              <p className="text-[#667085] mt-1">{currentUnit.description}</p>
            </div>
            <span className="badge bg-[#eef2ff] text-[#4338ca]">Unit {currentUnit.id}</span>
          </div>
          <div className="mt-7">
            <ProgressBar value={currentUnit.progress} label="Unit progress" />
          </div>
          <div className="mt-7 p-5 rounded-2xl bg-[#fafaff] border border-[#e6e8ee]">
            <div className="text-xs font-bold text-[#667085]">NEXT LESSON</div>
            <h3 className="font-extrabold text-lg mt-2">{nextLesson.title}</h3>
            <p className="text-sm text-[#667085] mt-2">{nextLesson.summary}</p>
            <div className="flex gap-4 text-xs text-[#667085] mt-4">
              <span>{nextLesson.duration}</span>
              <span>{nextLesson.steps} steps</span>
            </div>
          </div>
        </section>
        <section className="card p-6">
          <div className="eyebrow">CRITERIA</div>
          <h2 className="text-2xl font-extrabold mt-2">TR / CC / LR / GRA</h2>
          <div className="space-y-5 mt-7">
            {(progress?.criteria || [
              { name: "Task Response", label: "Task Response · 7.0", value: 70 },
              { name: "Coherence & Cohesion", label: "Coherence & Cohesion · 6.0", value: 60 },
              { name: "Lexical Resource", label: "Lexical Resource · 5.5", value: 55 },
              { name: "Grammar", label: "Grammar · 5.5", value: 55 },
            ]).map((c) => (
              <ProgressBar key={c.name} value={c.value} label={c.label} />
            ))}
          </div>
          <Link href="/analyzer" className="mt-7 w-full inline-flex justify-center items-center gap-2 px-4 py-3 rounded-xl border border-[#e6e8ee] font-bold">
            Open analyzer <ArrowRight size={16} />
          </Link>
        </section>
      </div>
      <div className="card p-6 mt-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="eyebrow">COURSE ROADMAP</div>
            <h2 className="text-2xl font-extrabold mt-2">Келесі кезеңдер</h2>
          </div>
          <Link href="/lessons" className="text-sm font-bold text-[#4f46e5]">
            Open lessons
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {units
            .filter((u) => u.id > 0)
            .slice(0, 6)
            .map((u, i) => (
              <div key={u.id} className="card-soft p-4">
                <div className="text-xs font-bold text-[#667085]">UNIT {u.id}</div>
                <div className="font-extrabold mt-2">{u.title}</div>
                <div className="text-xs text-[#667085] mt-1">
                  {u.range} · {i < 1 ? "Current" : i < 2 ? "Next" : "Locked"}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
