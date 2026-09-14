"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, ShieldCheck, User, LogIn } from "lucide-react";
import { useAuth } from "@/app/providers/auth";
import { UserRole } from "@/lib/auth";
import { LoadingSpinner } from "../components/LoadingSpinner";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, signInWithGoogle, setRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [needsRole, setNeedsRole] = useState(false);
  const [error, setError] = useState("");

  const handleRoleSelect = useCallback(async () => {
    try {
      await setRole(selectedRole);
      setNeedsRole(false);
      router.push("/");
    } catch (err) {
      setError("Рөлді сақтау қатесі.");
    }
  }, [selectedRole, setRole, router]);

  const handleGoogleSignIn = async () => {
    try {
      setError("");
      await signInWithGoogle();
    } catch (err) {
      setError("Google арқылы кіру қатесі. Қайталап көріңіз.");
    }
  };

  useEffect(() => {
    if (user && !needsRole) {
      const storedRole = localStorage.getItem(`iwm-role-${user.uid}`) as UserRole | null;
      if (!storedRole) {
        setNeedsRole(true);
      } else {
        router.push("/");
      }
    }
  }, [user, needsRole, router]);

  if (loading) {
    return (
      <div className="container-wide py-16 min-h-[70vh] grid place-items-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (user && needsRole) {
    return (
      <div className="container-wide py-16 min-h-[70vh] grid place-items-center">
        <div className="card p-7 w-full max-w-md">
          <div className="h-12 w-12 rounded-2xl bg-[#111827] text-white grid place-items-center">
            <GraduationCap size={24} />
          </div>
          <h1 className="text-3xl font-black mt-5">Қош келдіңіз!</h1>
          <p className="text-[#667085] mt-2">{user.displayName || user.email}</p>
          <p className="text-sm text-[#667085] mt-1">Рөліңізді таңдаңыз:</p>
          <div className="grid grid-cols-2 gap-2 mt-5">
            {(["student", "teacher"] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRole(r)}
                className={`px-4 py-3 rounded-xl border font-bold capitalize flex items-center justify-center gap-2 ${
                  selectedRole === r
                    ? "border-[#4f46e5] bg-[#eef2ff] text-[#3730a3]"
                    : "border-[#e6e8ee] bg-white hover:bg-[#f8f8fa]"
                }`}
              >
                {r === "teacher" ? <ShieldCheck size={18} /> : <User size={18} />}
                {r === "teacher" ? "Мұғалім" : "Оқушы"}
              </button>
            ))}
          </div>
          <button onClick={handleRoleSelect} className="mt-5 w-full rounded-xl bg-[#111827] text-white py-3.5 font-bold">
            Жалғастыру
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-wide py-16 min-h-[70vh] grid place-items-center">
      <div className="card p-7 w-full max-w-md">
        <div className="h-12 w-12 rounded-2xl bg-[#111827] text-white grid place-items-center">
          <GraduationCap size={24} />
        </div>
        <h1 className="text-3xl font-black mt-5">Қош келдіңіз</h1>
        <p className="text-[#667085] mt-2">
          IELTS Writing Mastery-ға кіру үшін Google аккаунтыңызбен кіріңіз
        </p>
        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        <button
          onClick={handleGoogleSignIn}
          className="mt-5 w-full rounded-xl bg-white border border-[#e6e8ee] text-[#111827] py-3.5 font-bold flex items-center justify-center gap-2 hover:bg-[#f8f8fa]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.3v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google арқылы кіру
        </button>
      </div>
    </div>
  );
}
