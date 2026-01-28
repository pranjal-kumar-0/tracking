"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../../../providers/AuthProvider";
import DashboardNavbar from "@/components/common/dashboard-navbar";
import { Briefcase, Settings, Loader, UserCheck, UserX, Clock, ChevronRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from "framer-motion";

const MemberCardWithCount = ({ member, clubId }: { member: User; clubId: string }) => {
  const [count, setCount] = useState(0);
  const isAdmin = member.role === "admin";
  
  useEffect(() => {
    fetch("/api/admin/submissions/get-submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clubId, userId: member.id }),
    })
      .then((r) => r.json())
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((d) => setCount(d.submissions?.filter((s: any) => s.status === "pending").length || 0))
      .catch(() => {});
  }, [clubId, member.id]);

  const pts = member.points || 0;
  const rating = pts >= 2000 ? "Rook" : pts >= 1200 ? "Knight" : pts >= 800 ? "Bishop" : "Pawn";
  
  const ratingStyles: Record<string, string> = {
    Rook: "bg-amber-100 text-amber-700 border-amber-200",
    Knight: "bg-purple-100 text-purple-700 border-purple-200",
    Bishop: "bg-slate-100 text-slate-700 border-slate-300",
    Pawn: "bg-gray-100 text-gray-600 border-gray-200"
  };

  // ADMIN STYLE: Deep Red / Red-950
  const borderClass = isAdmin 
    ? "border-red-950 shadow-[6px_6px_0px_0px_rgba(69,10,10,1)]" 
    : "border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]";

  const hoverShadow = isAdmin 
    ? "hover:shadow-[10px_10px_0px_0px_rgba(69,10,10,1)]" 
    : "hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]";

  return (
    <Link href={`/dashboard/c/${clubId}/${member.id}`} className="w-full">
      <motion.div 
        whileHover={{ y: -4 }}
        className={`relative bg-white p-5 rounded-2xl border-4 transition-all cursor-pointer group h-full flex flex-col ${borderClass} ${hoverShadow}`}
      >
        {isAdmin && (
          <div className="absolute -top-3 left-4 bg-red-950 text-white px-2 py-0.5 text-[9px] font-black uppercase flex items-center gap-1 z-10">
            <ShieldCheck size={10} /> Admin 
          </div>
        )}

        {count > 0 && (
          <span className={`absolute -top-3 -right-3 px-3 py-1 bg-orange-500 text-white text-[10px] font-black rounded-none border-2 ${isAdmin ? 'border-red-950' : 'border-black'} uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,0.15)] z-10`}>
            {count} Alerts
          </span>
        )}
        
        <div className="mb-4">
          <p className={`text-sm font-black uppercase tracking-tight truncate transition-colors ${isAdmin ? 'group-hover:text-red-800' : 'group-hover:text-indigo-600'}`}>
            {member.name || 'Anonymous'}
          </p>
          <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-tighter">{member.email}</p>
        </div>

        <div className={`space-y-2 border-t-2 ${isAdmin ? 'border-red-100' : 'border-black'} pt-3 mt-auto`}>
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-black uppercase text-slate-400">Class</span>
            <span className={`text-[10px] font-bold uppercase italic ${isAdmin ? 'text-red-900' : 'text-black'}`}>
              {member.role || 'Member'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-black uppercase text-slate-400">Since</span>
            <span className="text-[10px] font-bold uppercase italic">
                {(() => {
                const date = member.joinedAt || member.createdAt;
                return date?._seconds ? new Date(date._seconds * 1000).toLocaleDateString('en-GB') : 'N/A';
                })()}
            </span>
          </div>
        </div>

        <div className={`mt-4 w-fit px-3 py-1 text-[9px] font-black uppercase border-2 ${isAdmin ? 'border-red-950 bg-red-50 text-red-950' : 'border-black bg-slate-50 text-slate-700'}`}>
          {rating} Rank
        </div>
      </motion.div>
    </Link>
  );
};

interface User {
  createdAt: { _seconds: number; _nanoseconds: number; } | undefined;
  id: string;
  email: string;
  role?: string;
  clubIds?: string[];
  name?: string;
  department?: string;
  points?: number;
  joinedAt?: {
    _seconds: number;
    _nanoseconds: number;
  };
}

interface Applicant {
  id: string;
  appliedAt: { _seconds: number; _nanoseconds?: number } | string | number | null;
  department: string;
  email: string;
  role: string;
  userId: string;
  clubId: string;
  name?: string;
}

export default function Page() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'member'>('member');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const fetchMembers = async (clubId: string) => {
    try {
      const response = await fetch(`/api/admin/members/get-my-members?clubId=${clubId}`);
      if (!response.ok) throw new Error('Failed to fetch members');
      const data: User[] = await response.json();
      setMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicants = async (clubId: string) => {
    try {
      const response = await fetch(`/api/admin/members/get-applicants?clubId=${clubId}`);
      if (!response.ok) throw new Error('Failed to fetch applicants');
      const data: Applicant[] = await response.json();
      setApplicants(data);
    } catch (err) {
      console.error('Error fetching applicants:', err);
    }
  };

  useEffect(() => {
    if (id) {
      fetchMembers(id);
      fetchApplicants(id);
    }
  }, [id]);

  const handleAccept = async () => {
    if (!selectedApplicant) return;
    setIsAccepting(true);
    try {
      const res = await fetch('/api/admin/members/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicantId: selectedApplicant.id,
          role: selectedRole,
          department: selectedDepartment
        })
      });
      if (res.ok) {
        setModalOpen(false);
        fetchApplicants(id);
        fetchMembers(id);
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Failed to accept');
      }
    } catch (error) {
      setError('Error accepting');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleReject = async (applicantId: string) => {
    setIsRejecting(true);
    try {
      const res = await fetch('/api/admin/members/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicantId })
      });
      if (res.ok) {
        fetchApplicants(id);
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Failed to reject');
      }
    } catch (error) {
      setError('Error rejecting');
    } finally {
      setIsRejecting(false);
    }
  };

  const openAcceptModal = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setSelectedRole('member');
    setSelectedDepartment(applicant.department);
    setModalOpen(true);
  };
  const groupedMembers = members.reduce((acc, mem) => {
    const dept = mem.department || 'General';
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(mem);
    return acc;
  }, {} as Record<string, User[]>);

  // Sort departments alphabetically and sort members (admins first)
  const sortedDepartments = Object.entries(groupedMembers)
    .sort(([deptA], [deptB]) => deptA.localeCompare(deptB))
    .map(([dept, deptMembers]) => [
      dept,
      deptMembers.sort((a, b) => {
        // Admins first
        if (a.role === 'admin' && b.role !== 'admin') return -1;
        if (a.role !== 'admin' && b.role === 'admin') return 1;
        return 0;
      })
    ] as [string, User[]]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#FDFCFB]">
        <DashboardNavbar user={user} />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="border-4 border-black p-6 bg-white shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4">
            <Loader className="animate-spin h-6 w-6" />
            <span className="font-black uppercase italic tracking-tighter">Syncing Roster...</span>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FDFCFB] text-black">
      <DashboardNavbar user={user} />
      <main className="flex-1 p-4 sm:p-8 md:p-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 sm:mb-20">
            <div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
                Club <span className="text-indigo-600">Members</span>
              </h1>
              <div className="mt-4 flex items-center gap-2">
                 <div className="h-2 w-8 sm:w-12 bg-black" />
                 <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500">Management</p>
              </div>
            </div>
            <Link href={`/dashboard/c/${id}/settings`} className="w-full md:w-auto">
              <button className="group w-full md:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-white border-4 border-black font-black uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer">
                <Settings className="h-5 w-5 group-hover:rotate-90 transition-transform" />
                Settings
              </button>
            </Link>
          </div>          {/* Members List */}
          <div className="space-y-12 sm:space-y-20">
            {sortedDepartments.map(([dept, deptMembers]) => (
              <section key={dept}>
                <div className="flex items-center gap-4 mb-8">
                    <div className="bg-black text-white p-2 border-2 border-black hidden sm:block">
                        <Briefcase className="h-5 w-5" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight italic">
                    {dept} <span className="text-indigo-600">/ {deptMembers.length}</span>
                    </h2>
                    <div className="flex-1 h-1 bg-black/10" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                  {deptMembers.map(mem => (
                    <MemberCardWithCount key={mem.id} member={mem} clubId={id} />
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Applicants Section */}
          {applicants.length > 0 && (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-20 sm:mt-32 border-4 sm:border-8 border-orange-500 bg-white p-6 sm:p-10 shadow-[10px_10px_0px_0px_rgba(249,115,22,1)] sm:shadow-[20px_20px_0px_0px_rgba(249,115,22,1)]"
            >
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter italic flex items-center gap-3 text-orange-600 mb-10 border-b-4 border-black pb-4">
                  <Clock className="h-8 w-8 sm:h-10 sm:w-10" />
                  Pending Registry ({applicants.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
                {applicants.map(app => (
                  <div key={app.id} className="bg-orange-50 p-6 border-4 border-black flex flex-col h-full shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <div className="mb-4">
                        <p className="text-lg font-black uppercase tracking-tight text-black truncate">{app.name || 'New Prospect'}</p>
                        <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">{app.email}</p>
                    </div>
                    <div className="flex-1 space-y-2 mb-6 text-[10px] font-black uppercase">
                        <div className="flex justify-between border-b border-black/10 py-1">
                            <span>Req. Dept</span>
                            <span className="italic">{app.department}</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => openAcceptModal(app)}
                        className="flex-1 px-4 py-3 bg-white border-4 border-black font-black uppercase text-[10px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <UserCheck size={14} className="text-green-600" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(app.id)}
                        className="px-4 py-3 bg-white border-4 border-black font-black uppercase text-[10px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 cursor-pointer"
                        disabled={isRejecting}
                      >
                        {isRejecting ? <Loader className="animate-spin" size={14} /> : <UserX size={14} className="text-red-600" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Modal */}
          <AnimatePresence>
            {modalOpen && selectedApplicant && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white border-8 border-black p-8 shadow-[15px_15px_0px_0px_rgba(249,115,22,1)] w-full max-w-md"
                    >
                        <h3 className="text-2xl font-black uppercase tracking-tighter mb-6 italic border-b-4 border-black pb-2">Entry Approval</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest mb-2">Clearance Level</label>
                                <select
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value as 'admin' | 'member')}
                                    className="w-full px-4 py-4 border-4 border-black font-black uppercase bg-slate-50 outline-none focus:ring-4 ring-orange-100"
                                >
                                    <option value="member">Field Member</option>
                                    <option value="admin">System Admin</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={handleAccept}
                                    className="px-4 py-4 bg-black text-white border-4 border-black font-black uppercase text-xs shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                    disabled={isAccepting}
                                >
                                    {isAccepting ? <Loader className="animate-spin" /> : <ChevronRight />}
                                    Approve
                                </button>
                                <button
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-4 bg-white border-4 border-black font-black uppercase text-xs shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer"
                                    disabled={isAccepting}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}