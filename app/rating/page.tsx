"use client";

import React from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useUserProfile } from "@/hooks/useUserProfile";
import { FaChessPawn, FaChessBishop, FaChessKnight, FaChessRook, FaCrown, FaArrowLeft } from "react-icons/fa6";
import DashboardNavbar from "@/components/common/dashboard-navbar";
import Link from "next/link";

const BADGES = [
    { label: "Pawn", band: "0-799", icon: <FaChessPawn />, color: "bg-slate-200", accent: "rgba(100,116,139,1)", note: "Opening piece, 1 point", sub: "Basic moves, foundation" },
    { label: "Bishop", band: "800-1199", icon: <FaChessBishop />, color: "bg-violet-400", accent: "rgba(139,92,246,1)", note: "Diagonal piece, 3 points", sub: "Strategic positioning" },
    { label: "Knight", band: "1200-1999", icon: <FaChessKnight />, color: "bg-pink-400", accent: "rgba(236,72,153,1)", note: "Tactical piece, 3 points", sub: "Advanced tactics" },
    { label: "Rook", band: "2000+", icon: <FaChessRook />, color: "bg-amber-400", accent: "rgba(245,158,11,1)", note: "Anchor piece, 5 points", sub: "Masterful control" }
];

const EARN = [
    { pts: "10", t: "Daily Login", d: "Consistency bonus", shadow: "shadow-[4px_4px_0px_0px_rgba(79,70,229,1)]" },
    { pts: "20", t: "Solo Tasks", d: "Approved progress", shadow: "shadow-[4px_4px_0px_0px_rgba(16,185,129,1)]" },
    { pts: "100", t: "Club Ops", d: "Mission completion", shadow: "shadow-[4px_4px_0px_0px_rgba(244,63,94,1)]" },
    { pts: "!!", t: "Events", d: "Surprise bonuses", shadow: "shadow-[4px_4px_0px_0px_rgba(245,158,11,1)]" }
];

export default function RatingPage() {
    const { user } = useAuth();
    const { profile } = useUserProfile();

    const rating = profile?.rating || "Pawn";
    const role = profile?.role;
    const current = BADGES.find(b => b.label === rating) || BADGES[0];
    const isMax = rating === "Rook";
    const nextRank = rating === "Pawn" ? "Bishop" : rating === "Bishop" ? "Knight" : "Rook";

    const backPath = role === "super_admin" ? "/dashboard/sa" : role === "admin" ? "/dashboard/c" : "/dashboard/m";

    return (
        <div className="min-h-screen bg-[#FDFCFB] text-black pb-20 overflow-x-hidden">
            <DashboardNavbar user={user} />

            <main className="p-4 sm:p-8 md:p-12 max-w-7xl mx-auto">
                <Link href={backPath}>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border-4 border-black font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer mb-8">
                        <FaArrowLeft size={14} /> Back to Dashboard
                    </button>
                </Link>

                <header className="mb-12">
                    <div className="flex items-center gap-3 mb-2">
                        <FaCrown size={24} className="text-indigo-600" />
                        <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter">
                            Rank Protocol
                        </h1>
                    </div>
                    <div className="h-2 w-full bg-black shadow-[4px_4px_0px_0px_rgba(79,70,229,1)]" />
                </header>

                <section className="border-4 border-black bg-black text-white p-6 md:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-12 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className={`w-20 h-20 sm:w-24 sm:h-24 border-4 border-white flex items-center justify-center text-4xl shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] ${current.color} text-black`}>
                            {current.icon}
                        </div>
                        <div>
                            <p className="font-black uppercase text-[10px] tracking-[0.3em] text-slate-400 mb-1">Active Standing</p>
                            <h2 className="text-4xl sm:text-5xl font-black uppercase italic tracking-tighter leading-none">{current.label}</h2>
                            <p className="font-bold text-xs mt-2 text-indigo-400 uppercase tracking-widest">{current.band} Points Accumulated</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-3 w-full md:w-auto">
                        {!isMax ? (
                            <div className="bg-white text-black border-2 border-white px-4 py-2 font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(79,70,229,1)]">
                                Target: {nextRank} Rank
                            </div>
                        ) : (
                            <div className="bg-amber-400 text-black border-2 border-black px-4 py-2 font-black uppercase text-xs">
                                Peak Authority Status
                            </div>
                        )}
                        <p className="font-bold uppercase text-[9px] tracking-widest text-slate-400">
                            {!isMax ? "Deploy more tasks to advance" : "Maximum clearance achieved"}
                        </p>
                    </div>
                </section>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {BADGES.map((b) => (
                        <div 
                            key={b.label} 
                            className={`border-4 border-black p-6 bg-white flex flex-col transition-all ${
                                b.label === rating 
                                ? `shadow-[8px_8px_0px_0px_${b.accent}] ring-4 ring-black ring-offset-0` 
                                : 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] opacity-70'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-3 border-2 border-black text-2xl ${b.color}`}>{b.icon}</div>
                                {b.label === rating && (
                                    <span className="bg-black text-white px-2 py-1 font-black text-[8px] uppercase tracking-tighter">Current</span>
                                )}
                            </div>
                            <h4 className="text-2xl font-black uppercase italic tracking-tighter mb-1">{b.label}</h4>
                            <p className="font-black text-lg mb-4">{b.band} PTS</p>
                            <div className="mt-auto pt-4 border-t-2 border-black border-dashed">
                                <p className="font-bold text-[10px] uppercase leading-tight mb-1">{b.note}</p>
                                <p className="font-medium text-[9px] uppercase italic text-slate-500">{b.sub}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <section className="border-4 border-black bg-white p-6 md:p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center gap-3 mb-8 border-b-4 border-black pb-4">
                        <h3 className="text-2xl font-black uppercase italic tracking-tighter">Point Acquisition</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {EARN.map((m) => (
                            <div key={m.t} className={`border-4 border-black p-4 bg-white hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all ${m.shadow}`}>
                                <div className="text-2xl font-black mb-1">+{m.pts}</div>
                                <h4 className="font-black uppercase text-xs mb-2 tracking-tight">{m.t}</h4>
                                <p className="font-bold text-[10px] uppercase text-slate-500 leading-tight">{m.d}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <footer className="mt-20 border-t-4 border-black py-10 px-6 bg-white">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center">
                    <div className="font-black uppercase italic text-xl tracking-tighter">
                        Club<span className="text-indigo-600">Sync</span>
                    </div>
                    <p className="font-bold uppercase text-[9px] tracking-[0.3em] text-slate-400">
                        &copy; {new Date().getFullYear()} Rating Terminal v2.4
                    </p>
                </div>
            </footer>
        </div>
    );
}