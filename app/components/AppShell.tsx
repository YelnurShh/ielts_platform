"use client";
import Link from "next/link";
import {usePathname,useRouter} from "next/navigation";
import {BookOpenText,LayoutDashboard,PenLine,BarChart3,Languages,LogOut,Menu,X,ShieldCheck,BrainCircuit,User} from "lucide-react";
import {useEffect,useState} from "react";
import {Locale,translations} from "../../lib/i18n";
import {useAuth} from "../../app/providers/auth";
import {UserRole, roleLabels} from "../../lib/auth";
import { LoadingSpinner } from "./LoadingSpinner";

const studentNavKeys=[
  ["/","home",BookOpenText],
  ["/dashboard","dashboard",LayoutDashboard],
  ["/lessons","lessons",BookOpenText],
  ["/practice","practice",PenLine],
  ["/analyzer","analyzer",BrainCircuit],
  ["/portfolio","portfolio",BarChart3],
] as const;

const teacherNavKeys=[
  ["/","home",BookOpenText],
  ["/teacher","teacher",ShieldCheck],
] as const;

export function AppShell({children}:{children:React.ReactNode}){
  const path=usePathname(); const router=useRouter();
  const [locale,setLocale]=useState<Locale>("kk"); const [mobile,setMobile]=useState(false); const [avatarError,setAvatarError]=useState(false);
  const { user, loading, logout, setRole } = useAuth();

  useEffect(()=>{
    const l=localStorage.getItem("iwm-locale");
    if(l) setLocale(l as Locale);
  },[]);

  const tr=translations[locale];
  const userRole: UserRole = user?.role || "student";
  const navKeys = userRole === "teacher" ? teacherNavKeys : studentNavKeys;

  function changeLocale(v:Locale){setLocale(v);localStorage.setItem("iwm-locale",v)}

  async function handleLogout(){
    await logout();
    router.push("/login");
  }

  async function handleToggleRole(){
    const newRole: UserRole = userRole === "student" ? "teacher" : "student";
    await setRole(newRole);
  }

  if(loading){
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  }

  return <div className="min-h-screen flex flex-col">
    <header className="sticky top-0 z-50 border-b border-[#e6e8ee] bg-white/90 backdrop-blur-xl">
     <div className="container-wide h-[64px] flex items-center justify-between gap-3">
       <Link href="/" className="flex items-center gap-2.5 shrink-0">
         <span className="h-9 w-9 rounded-xl bg-[#111827] text-white grid place-items-center font-black text-sm">IW</span>
         <div className="hidden sm:block"><div className="font-extrabold tracking-tight text-[15px] leading-tight">IELTS Writing Mastery</div><div className="text-[10px] text-[#667085] leading-tight">Learn • Write • Improve</div></div>
       </Link>
       <nav className="hidden lg:flex items-center gap-1">
         {navKeys.map(([href,key,Icon])=><Link key={href} href={href} className={`nav-link ${path===href||((href!=="/"&&path.startsWith(href)))?"active":""}`}><span className="flex items-center gap-2"><Icon size={16}/>{tr.nav[key as keyof typeof tr.nav]}</span></Link>)}
       </nav>
       <div className="flex items-center gap-2">
         <div className="hidden sm:flex items-center gap-1 px-1.5 py-1 border border-[#e6e8ee] rounded-xl bg-white"><Languages size={16} className="text-[#667085]"/><select aria-label={tr.ui.language} value={locale} onChange={e=>changeLocale(e.target.value as Locale)} className="bg-transparent text-sm font-semibold outline-none"><option value="kk">KZ</option><option value="ru">RU</option><option value="en">EN</option></select></div>
         {user ? (
           <>
             <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border border-[#e6e8ee] bg-white shrink-0">
               {user.photoURL && !avatarError ? (
                 <img src={user.photoURL} alt={user.displayName || "User"} className="h-8 w-8 rounded-full object-cover shrink-0" onError={()=>setAvatarError(true)} />
               ) : (
                 <div className="h-8 w-8 rounded-full bg-[#eef2ff] text-[#4f46e5] grid place-items-center shrink-0">
                   <User size={16} />
                 </div>
               )}
               <span className="text-sm font-semibold truncate max-w-[120px]">{user.displayName || user.email}</span>
               <span className={`text-xs px-2 py-0.5 rounded-full font-bold whitespace-nowrap shrink-0 ${
                 userRole === "teacher" ? "bg-[#fef3c7] text-[#92400e]" : "bg-[#dbeafe] text-[#1e40af]"
               }`}>
                 {roleLabels[userRole]}
               </span>
             </div>
               <button onClick={handleLogout} title={tr.ui.logout} className="hidden md:inline-flex p-2 rounded-xl border border-[#e6e8ee] bg-white hover:bg-[#f8f8fa]"><LogOut size={18}/></button>
            </>
          ) : (
            <Link href="/login" className="hidden md:inline-flex px-4 py-2 rounded-xl bg-[#111827] text-white text-sm font-bold hover:bg-[#1f2937]">
              Кіру
            </Link>
          )}
          <button onClick={()=>setMobile(!mobile)} className="lg:hidden p-2 rounded-xl border border-[#e6e8ee] bg-white">{mobile?<X size={19}/>:<Menu size={19}/>}</button>
        </div>
      </div>
      {mobile&&<div className="lg:hidden border-t border-[#e6e8ee] bg-white"><div className="container-wide py-3 grid gap-1">{navKeys.map(([href,key,Icon])=><Link onClick={()=>setMobile(false)} key={href} href={href} className={`nav-link ${path===href?"active":""}`}><span className="flex items-center gap-2"><Icon size={16}/>{tr.nav[key as keyof typeof tr.nav]}</span></Link>)}</div></div>}
    </header>
    <main className="flex-1">{children}</main>
    <footer className="border-t border-[#e6e8ee] bg-white mt-16"><div className="container-wide py-9 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"><div><div className="font-extrabold">IELTS Writing Mastery</div><p className="text-sm text-[#667085] mt-1">Analyze → Plan → Write → Check → Feedback → Rewrite</p></div><div className="text-sm text-[#667085]">{new Date().getFullYear()} • Learning platform</div></div></footer>
  </div>
}
