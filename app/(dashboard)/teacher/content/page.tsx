"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useLocale } from "@/app/providers/locale";

interface Lesson {
  id: number;
  title: string;
  unit: string;
  type: string;
  duration: number;
  status: string;
  summary: string;
  steps: string[];
}

export default function ContentManager() {
  const [items, setItems] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ id: "", title: "", unit: "Discussion Essays", summary: "", duration: "20" });
  const { t } = useLocale();

  async function fetchLessons() {
    try {
      const res = await fetch("/api/content");
      const data = await res.json();
      if (data.lessons) {
        setItems(data.lessons);
      }
    } catch (error) {
      console.error("Error fetching lessons:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLessons();
  }, []);

  async function handleAdd() {
    if (!form.id || !form.title) return;
    setSaving(true);
    try {
      await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: Number(form.id),
          title: form.title,
          unit: form.unit,
          summary: form.summary,
          duration: Number(form.duration) || 20,
        }),
      });
      setForm({ id: "", title: "", unit: "Discussion Essays", summary: "", duration: "20" });
      await fetchLessons();
    } catch (error) {
      console.error("Error adding lesson:", error);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    setSaving(true);
    try {
      await fetch(`/api/content?id=${id}`, { method: "DELETE" });
      await fetchLessons();
    } catch (error) {
      console.error("Error deleting lesson:", error);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="container-wide py-10">
        <div className="flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-[#4f46e5]" />
        </div>
      </div>
    );
  }

  return (
    <div className="container-wide py-10">
      <div className="eyebrow">{t.content.eyebrow}</div>
      <h1 className="text-4xl font-black mt-2">{t.content.title}</h1>
      <p className="text-[#667085] mt-2">{t.content.subtitle}</p>

      <div className="grid lg:grid-cols-[.7fr_1.3fr] gap-6 mt-7">
        <section className="card p-6">
          <div className="font-extrabold flex items-center gap-2">
            <Plus size={18} />
            {t.content.newLesson}
          </div>
          <div className="grid gap-3 mt-5">
            {[
              ["id", t.content.fields.id],
              ["title", t.content.fields.title],
              ["unit", t.content.fields.unit],
              ["summary", t.content.fields.summary],
              ["duration", t.content.fields.duration],
            ].map(([k, label]) => (
              <label key={k} className="text-sm font-bold">
                {label}
                <input
                  value={form[k as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-[#e6e8ee] px-3 py-2.5 font-normal outline-none focus:border-[#4f46e5]"
                />
              </label>
            ))}
          </div>
          <button onClick={handleAdd} disabled={saving} className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#111827] text-white font-bold disabled:opacity-60">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            {t.content.addBtn}
          </button>
        </section>

        <section className="card overflow-hidden">
          <div className="p-6 border-b border-[#e6e8ee] font-extrabold">{t.content.currentContent}</div>
          {items.length === 0 ? (
            <div className="p-6 text-center text-[#667085]">{t.ui.noLessons}</div>
          ) : (
            items.map((l) => (
              <div key={l.id} className="p-4 border-b last:border-0 border-[#e6e8ee] flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-[#667085]">{t.lessons.lesson} {l.id} · {l.unit}</div>
                  <div className="font-extrabold mt-1">{l.title}</div>
                </div>
                <button onClick={() => handleDelete(l.id)} disabled={saving} className="p-2 rounded-xl border border-[#e6e8ee] text-[#667085] hover:text-red-600 disabled:opacity-60">
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
