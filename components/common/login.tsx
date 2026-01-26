"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import React, { useEffect } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../firebase";
import { useAuth } from "../../providers/AuthProvider";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

interface LoginPageProps {
  userType: string;
}

export default function LoginPage({ userType }: LoginPageProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  let title = "Welcome Back";
  let description = "Sign in to access your dashboard.";
  const buttonText = "Sign in with Google";

  if (userType === "club") {
    title = "Club Login";
    description = "Sign in as a club representative.";
  } else if (userType === "superadmin") {
    title = "Super Admin Login";
    description = "Sign in as super admin.";
  }

  useEffect(() => {
    if (!loading && user) {
      if (userType === "member") {
        router.push("/dashboard/m");
      } else if (userType === "club") {
        router.push("/dashboard/c");
      } else if (userType === "superadmin") {
        router.push("/dashboard/sa");
      } else {
        router.push("/dashboard");
      }
    }
  }, [loading, user, router, userType]);

  const handleGoogleSignIn = async () => {
    try {
      const userCredential = await signInWithPopup(auth, provider);
      const idToken = await userCredential.user.getIdToken();

      await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });
    } catch (error) {
      console.error("Google sign-in error:", error);
    }
  };

  if (loading || (!loading && user)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FDFCFB]">
        <div className="border-4 border-black p-8 bg-yellow-400 font-black uppercase text-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          Syncing...
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FDFCFB] text-black font-sans selection:bg-yellow-300">
      <header className="fixed top-0 left-0 z-50 flex w-full items-center justify-between p-4 md:p-8 bg-[#FDFCFB] border-b-4 border-black">
        <Link href={"/"} className="no-underline text-black">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 border-2 border-black bg-indigo-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center -rotate-3">
              <span className="text-white font-black text-sm">C</span>
            </div>
            <h1 className="text-xl font-black tracking-tighter uppercase m-0">
              Club<span className="text-indigo-600">Sync</span>
            </h1>
          </div>
        </Link>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex flex-1 items-center justify-center p-6 pt-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
          className="w-full max-w-md bg-white border-4 border-black p-8 md:p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
        >
          <div className="text-center">
            <div className="inline-block p-4 bg-indigo-100 border-2 border-black mb-6 rotate-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Lock size={32} strokeWidth={3} className="text-indigo-600" />
            </div>
            
            <h2 className="mb-4 text-4xl font-black tracking-tighter uppercase leading-none">
              {title}
            </h2>
            <p className="mb-10 text-lg font-bold text-slate-700 italic border-l-4 border-indigo-600 pl-4 text-left">
              {description}
            </p>

            <button
              onClick={handleGoogleSignIn}
              className="group cursor-pointer flex w-full items-center justify-center gap-4 border-2 border-black bg-white px-6 py-4 font-black uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
            >
              <svg
                className="w-6 h-6 transition-transform group-hover:scale-110"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
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
              {buttonText}
            </button>
            
           
          </div>
        </motion.div>
      </main>

      <footer className="w-full bg-[#FDFCFB] border-t-4 border-black p-8 text-center">
        <p className="text-sm font-black uppercase tracking-widest">
          © {new Date().getFullYear()} Club<span className="text-indigo-600">Sync</span>
        </p>
      </footer>
    </div>
  );
}