// @ts-nocheck
import Link from "next/link";
import {ArrowRight,BrainCircuit,CheckCircle2,FileText,PenLine,PlayCircle,ShieldCheck,Sparkles,TrendingUp} from "lucide-react";
import {lessons,units} from "../lib/course";

export default function Home(){return <>
<section className="container-wide pt-16 pb-10 grid lg:grid-cols-[1.2fr_.8fr] gap-10 items-center">
  <div><div className="eyebrow mb-4">IELTS WRITING MASTERY</div><h1 className="text-5xl md:text-7xl font-black tracking-[-0.05em] leading-[.98] max-w-4xl">Writing-ті <span className="gradient-text">жүйемен</span> жақсарт.</h1><p className="text-lg md:text-xl text-[#667085] max-w-2xl mt-6 leading-8">Авторлық бағдарламаға негізделген интерактивті платформа: сұрақты талда, жоспарла, жаз, тексер, feedback ал, қайта жаз.</p><div className="flex flex-wrap gap-3 mt-8"><Link href="/dashboard" className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-[#111827] text-white font-bold">Оқуды бастау <ArrowRight size={18}/></Link><Link href="/lessons" className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl border border-[#e6e8ee] bg-white font-bold">Сабақтарды көру</Link></div>
  <div className="flex flex-wrap gap-6 mt-9 text-sm text-[#667085]"><span className="inline-flex items-center gap-2"><CheckCircle2 size={17} className="text-[#139a63]"/>34 сабақ құрылымы</span><span className="inline-flex items-center gap-2"><CheckCircle2 size={17} className="text-[#139a63]"/>5 essay type</span><span className="inline-flex items-center gap-2"><CheckCircle2 size={17} className="text-[#139a63]"/>TR / CC / LR / GRA</span></div></div>
  <div className="card overflow-hidden">
   <video src="/assets/video.mp4" autoPlay loop muted playsInline className="w-full aspect-video bg-black object-cover" />
   <div className="p-6 md:p-8 text-center">
     <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#eef2ff] text-[#4f46e5] mb-4">
       <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4.995v10h-9.983zm-14.017 0v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4.995v10h-9.983z"/></svg>
     </div>
     <p className="text-xl md:text-2xl font-black leading-snug">Аз-аздан, бірақ үздіксіз.<br/>Жеңіс аралына бірге жетейік!</p>
     <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#667085]">
       <div className="h-px w-8 bg-[#e6e8ee]"></div>
       IELTS Writing Mastery
       <div className="h-px w-8 bg-[#e6e8ee]"></div>
     </div>
   </div>
 </div>
</section>
<section className="container-wide py-10"><div className="grid md:grid-cols-4 gap-4">{[["34","Lessons",FileText],["5","Essay types",TrendingUp],["4","Criteria",ShieldCheck],["1","Learning path",PlayCircle]].map(([v,l,I])=><div key={v as string} className="card p-5"><I size={19} className="text-[#4f46e5]"/><div className="text-3xl font-black mt-4">{v}</div><div className="text-sm text-[#667085] mt-1">{l}</div></div>)}</div></section>
<section className="container-wide py-10"><div className="flex items-end justify-between mb-5"><div><div className="eyebrow">COURSE MAP</div><h2 className="text-3xl font-extrabold mt-2">Бағдарлама архитектурасы</h2></div><Link href="/lessons" className="text-sm font-bold text-[#4f46e5]">Барлық сабақ →</Link></div><div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">{units.slice(0,8).map(u=><div key={u.id} className="card p-5"><div className="text-xs font-bold text-[#667085]">UNIT {u.id} · {u.range}</div><div className="text-lg font-extrabold mt-3">{u.title}</div><div className="text-sm text-[#667085] mt-2 leading-6">{u.description}</div></div>)}</div></section>
<section className="container-wide py-10"><div className="card p-7 md:p-9 grid lg:grid-cols-[1fr_auto] gap-8 items-center"><div><div className="eyebrow">LEARNING LOOP</div><h2 className="text-3xl font-extrabold mt-2">Analyze → Plan → Write → Check → Rewrite</h2><p className="text-[#667085] mt-3 max-w-2xl">Платформа оқушыны жай материал оқуға емес, нақты writing циклін қайталауға бағыттайды. Әр әрекет progress пен portfolio тарихына байланады.</p></div><Link href="/practice" className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#4f46e5] text-white font-bold">Практикаға өту <ArrowRight size={18}/></Link></div></section>
</>}
