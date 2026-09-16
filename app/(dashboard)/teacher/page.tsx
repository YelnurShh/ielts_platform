"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, BarChart3, ChevronRight, FileCheck2, Users, UserRoundCheck } from "lucide-react";
import { useAuth } from "../../../app/providers/auth";
import { isTeacher } from "../../../lib/auth";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { useLocale } from "../../../app/providers/locale";

interface Student {
  uid: string;
  name: string;
  progress: number;
  score: number;
  weakest: string;
}

interface ClassStats {
  totalStudents: number;
  avgCompletion: number;
  avgScore: string;
  needAttention: number;
  criteriaStats: { name: string; avgValue: number }[];
}

export default function Teacher() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { t } = useLocale();
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<ClassStats | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && user && !isTeacher(user.role)) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function fetchClassData() {
      try {
        const res = await fetch("/api/class");
        const data = await res.json();

        if (data.students) {
          setStudents(data.students);
          setStats(data.stats);
        }
      } catch (error) {
        console.error("Error fetching class data:", error);
      } finally {
        setDataLoading(false);
      }
    }

    fetchClassData();
  }, []);

  if (loading || dataLoading) {
    return <div className="container-wide py-10"><LoadingSpinner /></div>;
  }

  if (!user) {
    return <div className="container-wide py-10">{t.ui.login}</div>;
  }

  return (
    <div className="container-wide py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <div className="eyebrow">{t.teacher.eyebrow}</div>
          <h1 className="text-4xl font-black mt-2">{t.teacher.title}</h1>
          <p className="text-[#667085] mt-2">{t.teacher.subtitle}</p>
        </div>
        <Link href="/teacher/content" className="px-4 py-3 rounded-xl border border-[#e6e8ee] bg-white font-bold">
          {t.teacher.manageContent}
        </Link>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-7">
        <div className="card p-5">
          <Users size={18} className="text-[#4f46e5]" />
          <div className="text-3xl font-black mt-4">{stats?.totalStudents ?? 0}</div>
          <div className="text-sm text-[#667085]">{t.teacher.students}</div>
        </div>
        <div className="card p-5">
          <FileCheck2 size={18} className="text-[#4f46e5]" />
          <div className="text-3xl font-black mt-4">{stats?.avgCompletion ?? 0}%</div>
          <div className="text-sm text-[#667085]">{t.teacher.completion}</div>
        </div>
        <div className="card p-5">
          <BarChart3 size={18} className="text-[#4f46e5]" />
          <div className="text-3xl font-black mt-4">{stats?.avgScore ?? "0.0"}</div>
          <div className="text-sm text-[#667085]">{t.teacher.avgBand}</div>
        </div>
        <div className="card p-5">
          <AlertCircle size={18} className="text-[#4f46e5]" />
          <div className="text-3xl font-black mt-4">{stats?.needAttention ?? 0}</div>
          <div className="text-sm text-[#667085]">{t.teacher.attention}</div>
        </div>
      </div>
      <div className="grid lg:grid-cols-[1.35fr_.65fr] gap-6 mt-6">
        <section className="card overflow-hidden">
          <div className="p-6 border-b border-[#e6e8ee] flex items-center justify-between">
            <div>
              <div className="eyebrow">{t.teacher.classProgress.split(' ')[0]}</div>
              <h2 className="text-2xl font-extrabold mt-2">{t.teacher.classProgress.split(' ').slice(1).join(' ') || t.teacher.classProgress}</h2>
            </div>
            <UserRoundCheck size={20} className="text-[#667085]" />
          </div>
          {students.length === 0 ? (
            <div className="p-6 text-center text-[#667085]">{t.ui.noStudents}</div>
          ) : (
            students.map((s) => (
              <div key={s.uid} className="p-5 border-b last:border-0 border-[#e6e8ee] flex items-center justify-between gap-4">
                <div>
                  <div className="font-extrabold">{s.name}</div>
                  <div className="text-xs text-[#667085] mt-1">
                    {s.progress} / 34 {t.lessons.lesson}s · {t.teacher.attention}: {s.weakest}
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <div className="font-black">{s.score}</div>
                  <ChevronRight size={17} className="text-[#98a2b3]" />
                </div>
              </div>
            ))
          )}
        </section>
        <section className="card p-6">
          <div className="eyebrow">{t.teacher.criteriaAverages}</div>
          <h2 className="text-2xl font-extrabold mt-2">{t.teacher.classPerformance}</h2>
          <p className="text-sm text-[#667085] mt-2">{t.teacher.criteriaDesc}</p>
          <div className="mt-6 space-y-4">
            {stats?.criteriaStats && stats.criteriaStats.length > 0 ? (
              stats.criteriaStats.map((c) => (
                <div key={c.name}>
                  <div className="flex justify-between text-sm font-semibold">
                    <span>{c.name}</span>
                    <span>{c.avgValue}%</span>
                  </div>
                  <div className="progress-track mt-2">
                    <div className="progress-fill" style={{ width: `${c.avgValue}%` }} />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-[#667085]">{t.ui.noStudents}</div>
            )}
          </div>
        </section>
      </div>
      <div className="card p-6 mt-6">
        <div className="eyebrow">{t.teacher.contentArchitecture}</div>
        <h2 className="text-2xl font-extrabold mt-2">{t.teacher.courseStructure}</h2>
        <p className="text-[#667085] mt-2">{t.teacher.courseStructureDesc}</p>
        <div className="grid md:grid-cols-4 gap-3 mt-5">
          {[
            ["Foundation", "1–2"],
            ["Discussion", "3–9"],
            ["Agree / Disagree", "10–16"],
            ["Adv/Disadv", "17–22"],
            ["Problem/Solution", "23–28"],
            ["Two-Part", "29–32"],
            ["Mixed", "33"],
            ["Final", "34"],
          ].map((x) => (
            <div key={x[0]} className="card-soft p-4">
              <div className="font-extrabold">{x[0]}</div>
              <div className="text-xs text-[#667085] mt-1">{t.lessons.lesson}s {x[1]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
