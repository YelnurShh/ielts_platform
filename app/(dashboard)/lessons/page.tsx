"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Check, Lock, PlayCircle, Search } from "lucide-react";
import { lessons, units } from "../../../lib/course";
import { useAuth } from "../../../app/providers/auth";

interface LessonWithStatus {
  id: number;
  title: string;
  unit: string;
  type: string;
  duration: number;
  summary: string;
  steps: string[];
  status: "completed" | "available" | "locked";
}

export default function Lessons() {
  const { user } = useAuth();
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterUnit, setFilterUnit] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    async function fetchProgress() {
      if (!user) return;
      try {
        const res = await fetch(`/api/progress?uid=${user.uid}`);
        const data = await res.json();
        if (data.exists) {
          setCompletedLessons(data.completedLessons || []);
        }
      } catch (error) {
        console.error("Error fetching progress:", error);
      }
    }
    fetchProgress();
  }, [user]);

  const getLessonStatus = (lessonId: number, unitTitle: string, lessonIndex: number, unitLessonsCount: number): "completed" | "available" | "locked" => {
    if (completedLessons.includes(lessonId)) {
      return "completed";
    }

    const unitLessons = lessons.filter((l) => l.unit === unitTitle);
    const sortedLessons = [...unitLessons].sort((a, b) => a.id - b.id);
    const currentIndex = sortedLessons.findIndex((l) => l.id === lessonId);

    if (currentIndex === 0) {
      return "available";
    }

    const previousLesson = sortedLessons[currentIndex - 1];
    if (previousLesson && completedLessons.includes(previousLesson.id)) {
      return "available";
    }

    return "locked";
  };

  const lessonsWithStatus: LessonWithStatus[] = lessons.map((lesson) => {
    const unit = units.find((u) => u.title === lesson.unit);
    const unitLessons = lessons.filter((l) => l.unit === lesson.unit);
    const sortedUnitLessons = [...unitLessons].sort((a, b) => a.id - b.id);
    const lessonIndex = sortedUnitLessons.findIndex((l) => l.id === lesson.id);

    return {
      ...lesson,
      status: getLessonStatus(lesson.id, lesson.unit, lessonIndex, unitLessons.length),
    };
  });

  const filteredLessons = useMemo(() => {
    let filtered = lessonsWithStatus;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.title.toLowerCase().includes(query) ||
          l.summary.toLowerCase().includes(query) ||
          l.unit.toLowerCase().includes(query)
      );
    }

    if (filterUnit !== "all") {
      filtered = filtered.filter((l) => l.unit === filterUnit);
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((l) => l.status === filterStatus);
    }

    return filtered;
  }, [lessonsWithStatus, searchQuery, filterUnit, filterStatus]);

  const continueLesson = useMemo(() => {
    const available = lessonsWithStatus
      .filter((l) => l.status === "available" || l.status === "completed")
      .sort((a, b) => b.id - a.id);

    return available[0] || null;
  }, [lessonsWithStatus]);

  return (
    <div className="container-wide py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <div className="eyebrow">COURSE</div>
          <h1 className="text-4xl font-black mt-2">Сабақтар</h1>
          <p className="text-[#667085] mt-2 max-w-2xl">
            Құжаттағы 34 сабақтық құрылым сақталған. Қазір бастапқы сабақтар дайын, қалғандарын осы каталогқа қоса аласыз.
          </p>
        </div>
        {continueLesson && (
          <Link
            href={`/lessons/${continueLesson.id}`}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#111827] text-white font-bold"
          >
            Жалғастыру <ArrowRight size={18} />
          </Link>
        )}
      </div>

      <div className="mt-8 card p-5">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-bold mb-2">Іздеу</label>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#667085]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Сабақ іздеу..."
                className="w-full rounded-xl border border-[#e6e8ee] pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#4f46e5]"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Unit</label>
            <select
              value={filterUnit}
              onChange={(e) => setFilterUnit(e.target.value)}
              className="w-full rounded-xl border border-[#e6e8ee] px-4 py-2.5 text-sm outline-none focus:border-[#4f46e5]"
            >
              <option value="all">Барлығы</option>
              {units.map((u) => (
                <option key={u.id} value={u.title}>
                  Unit {u.id}: {u.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Күйі</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full rounded-xl border border-[#e6e8ee] px-4 py-2.5 text-sm outline-none focus:border-[#4f46e5]"
            >
              <option value="all">Барлығы</option>
              <option value="available">Қолжетімді</option>
              <option value="completed">Аяқталған</option>
              <option value="locked">Жабық</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-8">
        {units.map((unit) => {
          const unitLessons = filteredLessons.filter((l) => l.unit === unit.title);
          if (unitLessons.length === 0 && (filterUnit !== "all" || filterStatus !== "all" || searchQuery)) {
            return null;
          }

          return (
            <section key={unit.id}>
              <div className="flex items-end justify-between mb-4">
                <div>
                  <div className="text-xs font-bold text-[#667085]">UNIT {unit.id} · {unit.range}</div>
                  <h2 className="text-2xl font-extrabold mt-1">{unit.title}</h2>
                  <p className="text-sm text-[#667085] mt-1">{unit.description}</p>
                </div>
              </div>
              {unitLessons.length === 0 ? (
                <div className="card-soft p-5 text-sm text-[#667085]">
                  Бұл unit үшін сабақтар каталогы дайын — контент кейін осы дерек моделіне қосылады.
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {unitLessons.map((l) => (
                    <div key={l.id} className={`card p-5 ${l.status === "locked" ? "opacity-65" : ""}`}>
                      <div className="flex items-start justify-between gap-3">
                        <span
                          className={`badge ${
                            l.status === "completed"
                              ? "bg-[#ecfdf3] text-[#087443]"
                              : l.status === "available"
                              ? "bg-[#eef2ff] text-[#4f46e5]"
                              : "bg-[#f3f4f6] text-[#667085]"
                          }`}
                        >
                          {l.status === "completed" ? (
                            <>
                              <Check size={14} className="mr-1" />
                              Аяқталды
                            </>
                          ) : l.status === "available" ? (
                            <>
                              <PlayCircle size={14} className="mr-1" />
                              Қолжетімді
                            </>
                          ) : (
                            <>
                              <Lock size={14} className="mr-1" />
                              Жабық
                            </>
                          )}
                        </span>
                        <span className="text-xs text-[#667085]">Lesson {l.id}</span>
                      </div>
                      <h3 className="font-extrabold text-lg mt-5">{l.title}</h3>
                      <p className="text-sm text-[#667085] mt-2 leading-6">{l.summary}</p>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {l.steps.slice(0, 4).map((s) => (
                          <span key={s} className="px-2.5 py-1 rounded-lg bg-[#f6f7fa] text-xs font-semibold">
                            {s}
                          </span>
                        ))}
                      </div>
                      {l.status === "available" || l.status === "completed" ? (
                        <div className="mt-5 flex items-center gap-3">
                          <Link href={`/lessons/${l.id}`} className="inline-flex items-center gap-2 text-sm font-bold text-[#4f46e5]">
                            {l.status === "completed" ? "Қайталап көру" : "Сабақты бастау"}
                            <ArrowRight size={15} />
                          </Link>
                          {l.status === "completed" && (
                            <span className="text-xs text-[#139a63] font-semibold">✓ Аяқталған</span>
                          )}
                        </div>
                      ) : (
                        <div className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#98a2b3]">
                          <Lock size={15} />
                          Алдыңғы сабақты аяқтаңыз
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}