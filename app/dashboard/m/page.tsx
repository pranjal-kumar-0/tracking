"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../../providers/AuthProvider";
import DashboardNavbar from "@/components/common/dashboard-navbar";
import { Calendar, Briefcase, LayoutDashboard, Compass } from "lucide-react";
import Link from "next/link";

interface Club {
  id: string;
  name: string;
  departments: string[];
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}

const CARD_THEMES = [
  {
    shadow: "shadow-[6px_6px_0px_0px_rgba(79,70,229,1)]",
    header: "bg-indigo-600",
    tag: "bg-indigo-50 text-indigo-700",
  },
  {
    shadow: "shadow-[6px_6px_0px_0px_rgba(16,185,129,1)]",
    header: "bg-emerald-600",
    tag: "bg-emerald-50 text-emerald-700",
  },
  {
    shadow: "shadow-[6px_6px_0px_0px_rgba(244,63,94,1)]",
    header: "bg-rose-600",
    tag: "bg-rose-50 text-rose-700",
  },
  {
    shadow: "shadow-[6px_6px_0px_0px_rgba(245,158,11,1)]",
    header: "bg-amber-600",
    tag: "bg-amber-50 text-amber-700",
  },
  {
    shadow: "shadow-[6px_6px_0px_0px_rgba(6,182,212,1)]",
    header: "bg-cyan-600",
    tag: "bg-cyan-50 text-cyan-700",
  },
];

export default function MemberDashboardPage() {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyClubs = async () => {
    try {
      const res = await fetch("/api/user/clubs/get-all-clubs");
      if (!res.ok) throw new Error("Connection Lost");
      const data: Club[] = await res.json();
      setClubs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyClubs();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen bg-[#FDFCFB]">
        <DashboardNavbar user={user} />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="border-4 border-black p-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-black uppercase italic">
            Loading...
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-black">
      <DashboardNavbar user={user} />

      <main className="p-6 md:p-12 max-w-7xl mx-auto">
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <Compass size={24} strokeWidth={2.5} className="text-indigo-600" />
            <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter">
              Explore
            </h1>
          </div>
          <div className="h-2 w-full bg-black shadow-[4px_4px_0px_0px_rgba(79,70,229,1)]" />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {clubs.map((club, index) => {
            const theme = CARD_THEMES[index % CARD_THEMES.length];
            return (
              <Link key={club.id} href={`/dashboard/m/${club.id}`} className="group">
                <div
                  className={`h-full border-4 border-black bg-white transition-all flex flex-col ${theme.shadow} group-hover:shadow-none group-hover:translate-x-1 group-hover:translate-y-1`}
                >
                  <div className={`${theme.header} p-5 border-b-4 border-black`}>
                    <h2 className="text-xl font-black text-white uppercase italic tracking-tight leading-tight">
                      {club.name}
                    </h2>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Briefcase size={14} strokeWidth={3} />
                        <span className="font-black uppercase text-[10px] tracking-widest">
                          Departments
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {club.departments.map((dep) => (
                          <span
                            key={dep}
                            className={`border-2 border-black px-2 py-1 text-[9px] font-black uppercase ${theme.tag}`}
                          >
                            {dep}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t-2 border-black border-dashed">
                      <div className="flex items-center gap-2 text-slate-500 font-bold uppercase text-[9px]">
                        <Calendar size={14} />
                        {new Date(club.createdAt._seconds * 1000).toLocaleDateString()}
                      </div>
                      <div className="bg-black text-white px-3 py-1 font-black text-[10px] uppercase">
                        Open
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}

          {clubs.length === 0 && (
            <div className="col-span-full border-4 border-black border-dashed p-16 text-center">
              <LayoutDashboard size={40} className="mx-auto mb-4" />
              <p className="font-black uppercase text-sm italic">No clubs found.</p>
            </div>
          )}
        </div>
      </main>

     
    </div>
  );
}