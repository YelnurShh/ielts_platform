"use client";
import Link from "next/link";
import {usePathname,useRouter} from "next/navigation";
import {BookOpenText,LayoutDashboard,PenLine,BarChart3,Languages,LogOut,Menu,X,ShieldCheck,BrainCircuit} from "lucide-react";
import {useEffect,useState} from "react";
import {Locale,translations} from "../../lib/i18n";
import {defaultProfile,getProfile,setProfile,Profile} from "../../lib/store";

const navKeys=[
  ["/","home",BookOpenText],
  ["/dashboard","dashboard",LayoutDashboard],
  ["/lessons","lessons",BookOpenText],
  ["/practice","practice",PenLine],
  ["/analyzer","analyzer",BrainCircuit],
  ["/portfolio","portfolio",BarChart3],
  ["/teacher","teacher",ShieldCheck],
] as const;

export function AppShell({children}:{children:React.ReactNode}){
 const path=usePathname(); const router=useRouter();
 const [locale,setLocale]=useState<Locale>("kk"); const [profile,setProfileState]=useState<Profile>(defaultProfile); const [mobile,setMobile]=useState(false);
 useEffect(()=>{const l=(localStorage.getItem("iwm-locale") as Locale)||"kk";setLocale(l);setProfileState(getProfile())},[]);
 const tr=translations[locale];
 function changeLocale(v:Locale){setLocale(v);localStorage.setItem("iwm-locale",v)}
 function toggleRole(){const role=profile.role==="student"?"teacher":"student";const next={...profile,role} as Profile;setProfile(next);setProfileState(next);router.push(role==="teacher"?"/teacher":"/dashboard")}
 function logout(){localStorage.removeItem("iwm-profile");setProfileState(defaultProfile);router.push("/login")}
 return <div className="min-h-screen flex flex-col">
   <header className="sticky top-0 z-50 border-b border-[#e6e8ee] bg-white/90 backdrop-blur-xl">
    <div className="container-wide h-[70px] flex items-center justify-between gap-4">
      <Link href="/" className="flex items-center gap-3 shrink-0">
        <span className="h-10 w-10 rounded-xl bg-[#111827] text-white grid place-items-center font-black">IW</span>
        <div className="hidden sm:block"><div className="font-extrabold tracking-tight">IELTS Writing Mastery</div><div className="text-[11px] text-[#667085]">Learn • Write • Improve</div></div>
      </Link>
      <nav className="hidden lg:flex items-center gap-1">
        {navKeys.map(([href,key,Icon])=><Link key={href} href={href} className={`nav-link ${path===href||((href!=="/"&&path.startsWith(href)))?"active":""}`}><span className="flex items-center gap-2"><Icon size={16}/>{tr.nav[key as keyof typeof tr.nav]}</span></Link>)}
      </nav>
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-1 px-1.5 py-1 border border-[#e6e8ee] rounded-xl bg-white"><Languages size={16} className="text-[#667085]"/><select aria-label={tr.ui.language} value={locale} onChange={e=>changeLocale(e.target.value as Locale)} className="bg-transparent text-sm font-semibold outline-none"><option value="kk">KZ</option><option value="ru">RU</option><option value="en">EN</option></select></div>
        <button onClick={toggleRole} className="hidden md:inline-flex px-3 py-2 rounded-xl border border-[#e6e8ee] text-sm font-semibold bg-white hover:bg-[#f8f8fa]">{profile.role==="student"?tr.ui.student:tr.ui.teacher}</button>
        <button onClick={()=>setMobile(!mobile)} className="lg:hidden p-2 rounded-xl border border-[#e6e8ee] bg-white">{mobile?<X size={19}/>:<Menu size={19}/>}</button>
        <button onClick={logout} title={tr.ui.logout} className="hidden md:inline-flex p-2 rounded-xl border border-[#e6e8ee] bg-white hover:bg-[#f8f8fa]"><LogOut size={18}/></button>
      </div>
    </div>
    {mobile&&<div className="lg:hidden border-t border-[#e6e8ee] bg-white"><div className="container-wide py-3 grid gap-1">{navKeys.map(([href,key,Icon])=><Link onClick={()=>setMobile(false)} key={href} href={href} className={`nav-link ${path===href?"active":""}`}><span className="flex items-center gap-2"><Icon size={16}/>{tr.nav[key as keyof typeof tr.nav]}</span></Link>)}</div></div>}
   </header>
   <main className="flex-1">{children}</main>
   <footer className="border-t border-[#e6e8ee] bg-white mt-16"><div className="container-wide py-9 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"><div><div className="font-extrabold">IELTS Writing Mastery</div><p className="text-sm text-[#667085] mt-1">Analyze → Plan → Write → Check → Feedback → Rewrite</p></div><div className="text-sm text-[#667085]">{new Date().getFullYear()} • Learning platform</div></div></footer>
 </div>
}
