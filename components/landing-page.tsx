"use client";

import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  Users,
  CheckSquare,
  Trophy,
  ArrowRight,
  Mail,
  Github,
  Linkedin,
  ChevronDown
} from "lucide-react";
import Link from 'next/link';
import React, { useState } from 'react';

export default function ClubSyncLanding() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FDFCFB] font-sans text-black selection:bg-yellow-300">

      <nav className="fixed top-0 w-full z-50 bg-[#FDFCFB] border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 border-2 border-black bg-indigo-600 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center -rotate-3">
              <span className="text-white font-black text-xl">C</span>
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase">
              Club<span className="text-indigo-600">Sync</span>
            </span>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="cursor-pointer bg-white border-2 border-black px-6 py-2 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2"
            >
              <Lock size={16} strokeWidth={3} /> Login <ChevronDown size={16} />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-4 w-56 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-50"
                >
                  <Link href="/login/m" className="block p-4 font-black uppercase hover:bg-indigo-50 border-b-2 border-black no-underline text-black">Member</Link>
                  <Link href="/login/c" className="block p-4 font-black uppercase hover:bg-orange-50 border-b-2 border-black no-underline text-black">Club Admin</Link>
                  <Link href="/login/sa" className="block p-4 font-black uppercase hover:bg-green-50 no-underline text-black">Super Admin</Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      <section className="pt-44 pb-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.div
              initial={{ rotate: -2, opacity: 0 }}
              animate={{ rotate: -1, opacity: 1 }}
              className="inline-block bg-yellow-400 border-2 border-black px-4 py-1 mb-6 font-bold uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              Club Management OS
            </motion.div>

            <h1 className="text-6xl md:text-8xl font-black leading-[0.85] tracking-tighter mb-8 uppercase">
              Track your club. <br />
              <span className="text-indigo-600 underline decoration-black decoration-8">Grow together.</span>
            </h1>

            <p className="text-xl md:text-2xl font-bold leading-tight mb-12 text-slate-800 italic max-w-lg">
              The ultimate platform for club structure. <br />
              Manage departments, assign tasks, and track member points in one place.
            </p>

            <div className="flex flex-wrap gap-4">
              <button className="cursor-pointer bg-black text-white border-2 border-black px-8 py-4 font-black uppercase shadow-[6px_6px_0px_0px_rgba(79,70,229,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(79,70,229,1)] transition-all flex items-center gap-3">
                Get Started <ArrowRight size={20} />
              </button>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="w-full h-[400px] border-4 border-black bg-indigo-100 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center relative overflow-hidden">
              <div className="absolute top-4 left-4 border-2 border-black bg-white p-2 font-black text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                Admin Dashboard v1.0
              </div>
              <div className="space-y-4 w-3/4">
                <div className="h-4 bg-black w-1/2"></div>
                <div className="h-12 bg-white border-2 border-black w-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"></div>
                <div className="h-12 bg-white border-2 border-black w-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 border-t-4 border-black bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-16">
            <h2 className="text-4xl font-black uppercase italic">The Blueprint</h2>
            <div className="h-2 grow bg-black"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border-4 border-black p-8 bg-[#FDFCFB] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:bg-indigo-50 transition-colors group">
              <div className="w-16 h-16 bg-orange-400 border-2 border-black mb-6 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:-rotate-6 transition-transform">
                <Users size={32} strokeWidth={3} />
              </div>
              <h3 className="text-2xl font-black uppercase mb-4">Departmental Hierarchy</h3>
              <p className="font-bold text-slate-700">Organize members into Tech, Design, or Ops. Each department gets its own Admin and dedicated roster.</p>
            </div>

            <div className="border-4 border-black p-8 bg-[#FDFCFB] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:bg-green-50 transition-colors group">
              <div className="w-16 h-16 bg-green-400 border-2 border-black mb-6 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:-rotate-6 transition-transform">
                <CheckSquare size={32} strokeWidth={3} />
              </div>
              <h3 className="text-2xl font-black uppercase mb-4">Task Delegation</h3>
              <p className="font-bold text-slate-700">Admins assign high-impact tasks. Members submit work directly through their portal for review.</p>
            </div>

            <div className="border-4 border-black p-8 bg-[#FDFCFB] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-50 transition-colors group">
              <div className="w-16 h-16 bg-yellow-400 border-2 border-black mb-6 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:-rotate-6 transition-transform">
                <Trophy size={32} strokeWidth={3} />
              </div>
              <h3 className="text-2xl font-black uppercase mb-4">Gamified Growth</h3>
              <p className="font-bold text-slate-700">Earn points for every completed task. Watch your name climb the club-wide leaderboard in real-time.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-indigo-600">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border-4 border-black p-8 md:p-12 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black uppercase mb-6 leading-none">Bring your club <br />to the hub.</h2>
              <p className="text-xl font-bold mb-10 italic">
                ClubSync is currently in private beta. To onboard your organization, reach out to the developer.
              </p>

              <div className="flex flex-col sm:flex-row gap-6">
                <a
                  href="mailto:kpranjal219@gmail.com"
                  className="bg-green-400 border-2 border-black px-8 py-4 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-3 no-underline text-black"
                >
                  <Mail size={20} strokeWidth={3} /> Contact Me
                </a>
                <div className="flex gap-4">
                  <a href="https://github.com/pranjal-kumar-0/" target="_blank" className="w-14 h-14 bg-white border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-100 transition-colors">
                    <Github size={24} />
                  </a>
                  <a href="https://www.linkedin.com/in/pranjal-kumar-780942308/" target="_blank" className="w-14 h-14 bg-white border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-100 transition-colors">
                    <Linkedin size={24} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 bg-[#FDFCFB] border-t-4 border-black px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-black uppercase text-sm tracking-widest">
            © {new Date().getFullYear()} Club<span className="text-indigo-600">Sync</span> • Crafted by <span className="underline decoration-indigo-600 decoration-2 underline-offset-4">Pranjal Kumar</span>
          </div>

        </div>
      </footer>
    </div>
  );
}