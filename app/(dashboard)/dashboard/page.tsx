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
import { useLocale } from "../../../app/providers/locale";

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
  const { t } = useLocale();
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
    return <div className="container-wide py-10">{t.ui.login}</div>;
  }

  const currentUnit = progress?.currentUnit || {
    id: 0,
    title: "No active unit",
    description: "",
    progress: 0,
  };

  const nextLesson = progress?.nextLesson || {
    id: 0,
    title: "No lesson",
    summary: "",
    duration: "0 min",
    steps: 0,
  };

  return (
    <div className="container-wide py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
        <div>
          <div className="eyebrow">{t.dashboard.eyebrow}</div>
          <h1 className="text-4xl font-black mt-2">
            {((t.dashboard as any)?.greeting ?? "").replace("{name}", user.displayName || user.email)}
          </h1>
          <p className="text-[#667085] mt-2">{t.dashboard.subtitle}</p>
        </div>
        <Link href={`/lessons/${nextLesson.id}`} className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-[#111827] text-white font-bold">
          {t.dashboard.continue} <ArrowRight size={17} />
        </Link>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t.dashboard.courseProgress}
          value={`${progress?.courseProgress ?? 0}%`}
          helper={((t.dashboard as any)?.lessonsMapped ?? "").replace("{count}", String(progress?.completedLessons?.length ?? 0))}
          icon={<BookOpenCheck size={18} />}
        />
        <StatCard
          label={t.dashboard.writingScore}
          value={`${progress?.writingScore ?? 0}`}
          helper={t.dashboard.practiceAssessment}
          icon={<BrainCircuit size={18} />}
        />
        <StatCard
          label={t.dashboard.studyTime}
          value={progress?.studyTime ?? "0h 0m"}
          helper={t.dashboard.thisWeek}
          icon={<Clock3 size={18} />}
        />
        <StatCard
          label={t.dashboard.xp}
          value={`${progress?.xp ?? 0}`}
          helper={((t.dashboard as any)?.badgesEarned ?? "").replace("{count}", String(progress?.badges ?? 0))}
          icon={<Trophy size={18} />}
        />
      </div>
      <div className="grid lg:grid-cols-[1.35fr_.65fr] gap-6 mt-6">
        <section className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="eyebrow">{t.dashboard.currentUnit}</div>
              <h2 className="text-2xl font-extrabold mt-2">{currentUnit.title}</h2>
              <p className="text-[#667085] mt-1">{currentUnit.description}</p>
            </div>
            <span className="badge bg-[#eef2ff] text-[#4338ca]">Unit {currentUnit.id}</span>
          </div>
          <div className="mt-7">
            <ProgressBar value={currentUnit.progress} label={t.dashboard.unitProgress} />
          </div>
          <div className="mt-7 p-5 rounded-2xl bg-[#fafaff] border border-[#e6e8ee]">
            <div className="text-xs font-bold text-[#667085]">{t.dashboard.nextLesson}</div>
            <h3 className="font-extrabold text-lg mt-2">{nextLesson.title}</h3>
            <p className="text-sm text-[#667085] mt-2">{nextLesson.summary}</p>
            <div className="flex gap-4 text-xs text-[#667085] mt-4">
              <span>{nextLesson.duration}</span>
              <span>{nextLesson.steps} {t.lessons.steps}</span>
            </div>
          </div>
        </section>
        <section className="card p-6">
          <div className="eyebrow">{t.dashboard.criteria}</div>
          <h2 className="text-2xl font-extrabold mt-2">TR / CC / LR / GRA</h2>
          <div className="space-y-5 mt-7">
            {(progress?.criteria || []).map((c) => (
              <ProgressBar key={c.name} value={c.value} label={c.label} />
            ))}
          </div>
          <Link href="/analyzer" className="mt-7 w-full inline-flex justify-center items-center gap-2 px-4 py-3 rounded-xl border border-[#e6e8ee] font-bold">
            {t.dashboard.openAnalyzer} <ArrowRight size={16} />
          </Link>
        </section>
      </div>
      <div className="card p-6 mt-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="eyebrow">{t.dashboard.courseRoadmap}</div>
            <h2 className="text-2xl font-extrabold mt-2">{t.dashboard.nextStages}</h2>
          </div>
          <Link href="/lessons" className="text-sm font-bold text-[#4f46e5]">
            {t.dashboard.openLessons}
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
                  {u.range} · {i < 1 ? t.ui.inProgress : i < 2 ? t.ui.locked : t.ui.locked}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
