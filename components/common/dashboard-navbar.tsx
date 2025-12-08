"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LogOut } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { User } from "firebase/auth";
import { FaChessPawn, FaChessBishop, FaChessKnight, FaChessRook } from "react-icons/fa6";
import { useUserProfile } from "@/hooks/useUserProfile";

interface DashboardNavbarProps {
  user: User | null;
  backHref?: string;
}

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ user, backHref }) => {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { profile } = useUserProfile();
  
  const rating = profile?.rating || "Pawn";
  const points = profile?.points ?? 0;

  // --- 1. DEFINE RANK STYLES ---
  // Pawn (Silver) | Bishop (Purple) | Knight (Pink) | Rook (Amber)
  let ratingIcon = <FaChessPawn className="text-slate-500" />;
  let ratingText = "text-slate-600";
  let btnGradient = "border border-gray-200 bg-white text-gray-800"; // Default Pawn style

  if (rating === "Bishop") {
    ratingIcon = <FaChessBishop className="text-violet-600" />;
    ratingText = "text-violet-700";
    btnGradient = "bg-gradient-to-r from-violet-100 via-purple-50 to-violet-200 text-violet-900 border-violet-200";
  } else if (rating === "Knight") {
    ratingIcon = <FaChessKnight className="text-pink-600" />;
    ratingText = "text-pink-700";
    btnGradient = "bg-gradient-to-r from-pink-100 via-rose-50 to-pink-200 text-pink-900 border-pink-200";
  } else if (rating === "Rook") {
    ratingIcon = <FaChessRook className="text-amber-600" />;
    ratingText = "text-amber-700";
    btnGradient = "bg-gradient-to-r from-amber-100 via-yellow-50 to-amber-200 text-amber-900 border-amber-200";
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="sticky top-0 left-0 z-40 flex w-full items-center justify-between p-4 md:p-8 bg-white/80 backdrop-blur-md border-b border-gray-200">
      {backHref ? (
        <Link href={backHref} className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50 transition">
          <span aria-hidden>←</span>
          Back to dashboard
        </Link>
      ) : (
        <Link href="/">
          <h1 className="text-2xl font-bold tracking-tighter">
            Club<span className="text-indigo-600">Sync</span>
          </h1>
        </Link>
      )}

      <div className="relative">
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold shadow-sm transition hover:shadow-md ${btnGradient}`}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <Image
            src={user?.photoURL || 'https://avatar.iran.liara.run/public'}
            alt="Profile"
            width={24}
            height={24}
            className="w-6 h-6 rounded-full border border-white/50"
          />
          <span className="flex items-center gap-2">
            <span className="hidden sm:inline">{user?.displayName}</span>
            
            {/* Rank Badge */}
            <span className={`flex items-center gap-1 rounded-full bg-white/60 px-2 py-0.5 text-xs font-bold shadow-sm ${ratingText}`}>
              {ratingIcon}
              {rating}
            </span>
            
            {/* Points Badge */}
            <span className="flex items-center gap-1 rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
              {points} pts
            </span>
          </span>
        </motion.button>

        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full mt-2 right-0 bg-white border border-gray-100 rounded-xl shadow-xl min-w-40 p-1 z-50 overflow-hidden"
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <Link
                href="/points"
                className="flex items-center gap-3 w-full text-left py-2.5 px-3 hover:bg-slate-50 rounded-lg text-slate-700 transition-colors text-sm font-medium"
                onClick={() => setIsDropdownOpen(false)}
              >
                <div className="p-1.5 bg-violet-100 text-violet-600 rounded-md">
                   <FaChessBishop size={14} />
                </div>
                My Rank & Quests
              </Link>
              
              <div className="h-px bg-gray-100 my-1"></div>

              <button
                className="flex items-center gap-3 w-full text-left py-2.5 px-3 hover:bg-red-50 rounded-lg text-red-600 transition-colors text-sm font-medium"
                onClick={() => {
                  handleLogout();
                  setIsDropdownOpen(false);
                }}
              >
                <div className="p-1.5 bg-red-100 text-red-500 rounded-md">
                  <LogOut size={14} />
                </div>
                Sign Out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default DashboardNavbar;