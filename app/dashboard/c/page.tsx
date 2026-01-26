"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../../providers/AuthProvider";
import DashboardNavbar from "@/components/common/dashboard-navbar";
import { Users, UserCircle, Calendar, Briefcase, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from "framer-motion";

interface Club {
  id: string;
  name: string;
  departments: string[];
  adminIds: string[];
  memberIds: string[];
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}

const ClubDashboardPage = () => {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyClubs = async () => {
    try {
      const response = await fetch('/api/admin/clubs/get-my-clubs');
      if (!response.ok) throw new Error('Failed to fetch clubs');
      const data: Club[] = await response.json();
      setClubs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyClubs();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#FDFCFB]">
        <DashboardNavbar user={user} />
        <main className="flex-1 flex items-center justify-center">
          <div className="border-4 border-black p-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-bounce font-black uppercase">
            Loading your fleet...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FDFCFB] text-black">
      <DashboardNavbar user={user} />
      <main className="flex-1 p-6 md:p-12">
        <div className="max-w-7xl mx-auto">
          <header className="mb-12">
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase leading-none italic">
              My <span className="text-indigo-600">Clubs</span>
            </h1>
            <p className="mt-4 text-slate-500 font-bold uppercase tracking-widest text-sm">
              Manage and monitor your active organizations
            </p>
          </header>

          {clubs.length === 0 ? (
            <div className="border-4 border-dashed border-black p-20 text-center bg-white shadow-[10px_10px_0px_0px_rgba(0,0,0,0.05)]">
              <Users className="mx-auto h-16 w-16 mb-4 opacity-20" />
              <p className="text-xl font-black uppercase italic text-slate-400">No active affiliations found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {clubs.map((club) => (
                <Link key={club.id} href={`/dashboard/c/${club.id}`} className="no-underline group">
                  <motion.div 
                    whileHover={{ x: -4, y: -4 }}
                    className="h-full bg-white border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[14px_14px_0px_0px_rgba(79,70,229,1)] transition-all flex flex-col overflow-hidden"
                  >
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-6">
                        <h2 className="text-2xl font-black uppercase tracking-tight leading-tight group-hover:text-indigo-600 transition-colors">
                          {club.name}
                        </h2>
                        <div className="bg-black p-2 group-hover:bg-indigo-600 transition-colors">
                            <ArrowRight className="text-white h-5 w-5" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="border-2 border-black p-3 bg-yellow-50">
                           <p className="text-[10px] font-black uppercase text-slate-500 mb-1 flex items-center gap-1">
                             <Briefcase size={12} /> Departments
                           </p>
                           <p className="text-xl font-black leading-none">{club.departments.length}</p>
                        </div>
                        <div className="border-2 border-black p-3 bg-indigo-50">
                           <p className="text-[10px] font-black uppercase text-slate-500 mb-1 flex items-center gap-1">
                             <UserCircle size={12} /> Staff
                           </p>
                           <p className="text-xl font-black leading-none">{club.adminIds.length}</p>
                        </div>
                      </div>

                      <div className="space-y-4 flex-1">
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Departments</p>
                           <div className="flex flex-wrap gap-1.5">
                             {club.departments.slice(0, 3).map(dep => (
                               <span key={dep} className="px-2 py-0.5 border border-black bg-white text-[9px] font-black uppercase">
                                 {dep}
                               </span>
                             ))}
                             {club.departments.length > 3 && (
                               <span className="px-2 py-0.5 border border-black bg-slate-100 text-[9px] font-black italic">
                                 +{club.departments.length - 3} MORE
                               </span>
                             )}
                           </div>
                        </div>

                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Administration</p>
                           <div className="flex -space-x-2">
                              {club.adminIds.slice(0, 5).map((admin, i) => (
                                <div key={i} className="h-8 w-8 border-2 border-black bg-white rounded-none flex items-center justify-center font-black text-[10px] uppercase shadow-[1px_1px_0px_0px_black] overflow-hidden bg-gradient-to-br from-indigo-100 to-white">
                                   {admin.charAt(0)}
                                </div>
                              ))}
                              {club.adminIds.length > 5 && (
                                <div className="h-8 w-8 border-2 border-black bg-black text-white flex items-center justify-center font-black text-[10px]">
                                   +{club.adminIds.length - 5}
                                </div>
                              )}
                           </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 border-t-2 border-black px-6 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter">
                        <Calendar size={14} className="text-indigo-600" />
                        EST. {new Date(club.createdAt._seconds * 1000).toLocaleDateString()}
                      </div>
                      <div className="h-2 w-2 bg-green-500 border border-black rounded-full" />
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ClubDashboardPage;