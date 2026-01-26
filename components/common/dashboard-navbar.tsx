"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LogOut, ArrowLeft } from "lucide-react";
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

  let rankBg = "bg-slate-200";
  let ratingIcon = <FaChessPawn />;

  if (rating === "Bishop") {
    rankBg = "bg-violet-400";
    ratingIcon = <FaChessBishop />;
  } else if (rating === "Knight") {
    rankBg = "bg-pink-400";
    ratingIcon = <FaChessKnight />;
  } else if (rating === "Rook") {
    rankBg = "bg-orange-400";
    ratingIcon = <FaChessRook />;
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
    <header className="sticky top-0 left-0 z-40 flex w-full items-center justify-between p-4 md:px-8 md:py-6 bg-[#FDFCFB] border-b-4 border-black">
      {backHref ? (
        <Link 
          href={backHref} 
          className="group flex items-center gap-2 border-2 border-black bg-white px-4 py-2 text-sm font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all no-underline text-black"
        >
          <ArrowLeft size={16} strokeWidth={3} />
          <span className="hidden md:inline">Back to dashboard</span>
        </Link>
      ) : (
        <Link href="/" className="no-underline text-black">
          <h1 className="text-2xl font-black tracking-tighter uppercase m-0">
            Club<span className="text-indigo-600">Sync</span>
          </h1>
        </Link>
      )}

      <div className="relative">
        <button
          className="flex items-center gap-3 border-2 border-black bg-white p-1 pr-4 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <div className="relative w-10 h-10 border-2 border-black bg-yellow-400 overflow-hidden">
             <Image
                src={user?.photoURL || 'https://avatar.iran.liara.run/public'}
                alt="Profile"
                fill
                className="object-cover"
              />
          </div>
          
          <div className="flex flex-col items-start leading-none gap-1">
            <span className="text-[10px] text-slate-500 block">{user?.displayName?.split(' ')[0]}</span>
            <div className="flex items-center gap-2">
                <span className={`flex items-center gap-1 border border-black px-1.5 py-0.5 text-[10px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${rankBg}`}>
                  {ratingIcon} {rating}
                </span>
                <span className="bg-black text-white px-1.5 py-0.5 text-[10px] border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {points} PTS
                </span>
            </div>
          </div>
        </button>

        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-[calc(100%+12px)] right-0 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] min-w-[200px] z-50"
            >
              <Link
                href="/points"
                className="flex items-center gap-3 w-full text-left p-4 hover:bg-indigo-50 border-b-2 border-black no-underline text-black transition-colors text-sm font-black uppercase"
                onClick={() => setIsDropdownOpen(false)}
              >
                <FaChessBishop className="text-indigo-600" />
                My Quests
              </Link>
              
              <button
                className="flex items-center gap-3 w-full text-left p-4 hover:bg-red-50 text-red-600 transition-colors text-sm font-black uppercase cursor-pointer"
                onClick={() => {
                  handleLogout();
                  setIsDropdownOpen(false);
                }}
              >
                <LogOut size={18} strokeWidth={3} />
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