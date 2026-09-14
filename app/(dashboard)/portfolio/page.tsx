"use client";
import { useEffect, useState } from "react";
import { FileText, TrendingUp, Clock3 } from "lucide-react";
import { useAuth } from "@/app/providers/auth";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { lessons } from "../../../lib/course";

interface PortfolioItem {
  id: number;
  title: string;
  unit: string;
  status: string;
  completedAt?: string;
}

export default function Portfolio() {
  const { user } = useAuth();
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [studyTime, setStudyTime] = useState("0h 0m");
  const [criteria, setCriteria] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProgress() {
      if (!user) return;
      try {
        const res = await fetch(`/api/progress?uid=${user.uid}`);
        const data = await res.json();
        if (data.exists) {
          setCompletedLessons(data.completedLessons || []);
          setStudyTime(data.studyTime || "0h 0m");
          setCriteria(data.criteria || []);
        }
      } catch (error) {
        console.error("Error fetching progress:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProgress();
  }, [user]);

  const completedLessonDetails = lessons
    .filter((l) => completedLessons.includes(l.id))
    .sort((a, b) => b.id - a.id);

  const bestImprovement = criteria.length > 0 ? Math.max(...criteria.map((c) => c.value)) : 0;
  const improvementLabel = bestImprovement > 0 ? `+${bestImprovement}%` : "0%";

  if (loading) {
    return <div className="container-wide py-10"><LoadingSpinner /></div>;
  }

  return (
    <div className="container-wide py-10">
      <div className="eyebrow">WRITING PORTFOLIO</div>
      <h1 className="text-4xl font-black mt-2">My writing</h1>
      <p className="text-[#667085] mt-2">First Draft → Feedback → Rewrite → Final Version тарихы.</p>

      <div className="grid md:grid-cols-3 gap-4 mt-7">
        <div className="card p-5">
          <div className="text-sm text-[#667085]">Essays</div>
          <div className="text-3xl font-black mt-3">{completedLessonDetails.length}</div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-[#667085]">Best improvement</div>
          <div className="text-3xl font-black mt-3">{improvementLabel}</div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-[#667085]">Practice time</div>
          <div className="text-3xl font-black mt-3">{studyTime}</div>
        </div>
      </div>

      <div className="card mt-6 overflow-hidden">
        <div className="p-6 border-b border-[#e6e8ee] font-extrabold">Essay history</div>
        {completedLessonDetails.length === 0 ? (
          <div className="p-6 text-center text-[#667085]">Әлі эсселер жоқ. Сабақтарды аяқтаңыз!</div>
        ) : (
          completedLessonDetails.map((lesson) => (
            <div key={lesson.id} className="p-5 border-b last:border-0 border-[#e6e8ee] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#eef2ff] text-[#4f46e5] grid place-items-center">
                  <FileText size={18} />
                </div>
                <div>
                  <div className="font-extrabold">{lesson.title}</div>
                  <div className="text-xs text-[#667085] mt-1">{lesson.unit}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-extrabold">Lesson {lesson.id}</div>
                <div className="text-xs text-[#667085] mt-1 inline-flex items-center gap-1">
                  <TrendingUp size={13} />
                  Аяқталған
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}