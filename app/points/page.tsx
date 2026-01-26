"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useUserProfile } from "@/hooks/useUserProfile";
import {
    FaChessPawn,
    FaChessBishop,
    FaChessKnight,
    FaChessRook,
    FaCrown,
    FaLock,
    FaCode,
    FaRobot,
    FaGithub,
    FaCircleCheck,
    FaServer,
    FaBrain,
    FaGitAlt,
    FaTerminal,
    FaDocker,
    FaAws,
    FaPaperPlane,
    FaXmark,
    FaNetworkWired,
    FaCloud,
    FaDatabase,
    FaGlobe,
    FaCalendarCheck,
    FaClock,
    FaCircleExclamation,
    FaArrowLeft,
    FaArrowRight,
    FaCompass
} from "react-icons/fa6";
import DashboardNavbar from "@/components/common/dashboard-navbar";
import Link from "next/link";
import { Loader } from "lucide-react";

const BADGES = [
    { label: "Pawn", band: "0-799", icon: <FaChessPawn />, color: "bg-slate-200", bars: 4, base: 0, next: 800 },
    { label: "Bishop", band: "800-1199", icon: <FaChessBishop />, color: "bg-violet-400", bars: 4, base: 800, next: 1200 },
    { label: "Knight", band: "1200-1999", icon: <FaChessKnight />, color: "bg-pink-400", bars: 6, base: 1200, next: 2000 },
    { label: "Rook", band: "2000+", icon: <FaChessRook />, color: "bg-amber-400", bars: 1, base: 2000, next: null }
];

const QUESTS = [
    { id: 'git-1', title: "Git Fundamentals", type: 'core', minRank: 'Pawn', pts: 150, desc: "Init, Stage, Commit, Push. Demonstrate version control basics.", icon: <FaGitAlt /> },
    { id: 'git-2', title: "Branching Strategy", type: 'core', minRank: 'Bishop', pts: 350, desc: "Feature branch workflow & Pull Request review.", icon: <FaGithub /> },
    { id: 'web-1', title: "Semantic Portfolio", type: 'web', minRank: 'Pawn', pts: 200, desc: "Responsive site using only HTML5 & CSS Grid/Flexbox.", icon: <FaCode /> },
    { id: 'web-2', title: "JS Dom Manipulation", type: 'web', minRank: 'Pawn', pts: 250, desc: "Interactive ToDo list using Vanilla JS (No frameworks).", icon: <FaCode /> },
    { id: 'web-3', title: "React Components", type: 'web', minRank: 'Bishop', pts: 400, desc: "Single Page App (SPA) with React Hooks.", icon: <FaCode /> },
    { id: 'web-4', title: "Next.js Architecture", type: 'web', minRank: 'Knight', pts: 700, desc: "App Router, Server Actions, and Auth integration.", icon: <FaServer /> },
    { id: 'web-5', title: "Micro-Frontends", type: 'web', minRank: 'Rook', pts: 1000, desc: "Module Federation or Mono-repo setup (Turborepo).", icon: <FaNetworkWired /> },
    { id: 'ai-1', title: "Data Analysis", type: 'ai', minRank: 'Bishop', pts: 200, desc: "Clean & Visualize data using Pandas/Matplotlib.", icon: <FaRobot /> },
    { id: 'ai-2', title: "Basic Classification", type: 'ai', minRank: 'Bishop', pts: 250, desc: "Scikit-Learn model (Logistic Reg/Decision Tree).", icon: <FaBrain /> },
    { id: 'ai-3', title: "Computer Vision (CNN)", type: 'ai', minRank: 'Bishop', pts: 400, desc: "Classify images using PyTorch or TensorFlow.", icon: <FaRobot /> },
    { id: 'ai-4', title: "Transformer Tuning", type: 'ai', minRank: 'Knight', pts: 700, desc: "Fine-tune BERT/GPT for specific NLP tasks.", icon: <FaBrain /> },
    { id: 'ai-5', title: "LLM Implementation", type: 'ai', minRank: 'Rook', pts: 1000, desc: "Implement RAG system.", icon: <FaBrain /> },
    { id: 'ops-1', title: "Terminal Survival", type: 'ops', minRank: 'Pawn', pts: 200, desc: "Navigation (cd, ls), File Mgmt (cp, mv, rm, rmdir), Network (ping, curl).", icon: <FaTerminal /> },
    { id: 'ops-2', title: "Docker Basics", type: 'ops', minRank: 'Bishop', pts: 350, desc: "Containerize a simple Web/Python application.", icon: <FaDocker /> },
    { id: 'sys-1', title: "Database Design", type: 'sys', minRank: 'Bishop', pts: 350, desc: "Design a Normalized Schema (SQL).", icon: <FaDatabase /> },
    { id: 'ops-3', title: "CI/CD Pipeline", type: 'ops', minRank: 'Knight', pts: 600, desc: "GitHub Actions workflow to test & lint on push.", icon: <FaServer /> },
    { id: 'sys-2', title: "Scalability Basics", type: 'sys', minRank: 'Knight', pts: 600, desc: "Implement Load Balancing & Caching (Redis).", icon: <FaNetworkWired /> },
    { id: 'sys-3', title: "Design Twitter", type: 'sys', minRank: 'Knight', pts: 800, desc: "High-level design: Fan-out service & timeline gen.", icon: <FaNetworkWired /> },
    { id: 'ops-4', title: "IaC with Terraform", type: 'ops', minRank: 'Rook', pts: 900, desc: "Provision full infrastructure as code.", icon: <FaCloud /> },
    { id: 'ops-5', title: "Kubernetes Cluster", type: 'ops', minRank: 'Rook', pts: 1200, desc: "Deploy, scale, and manage pods on K8s.", icon: <FaServer /> },
    { id: 'sys-4', title: "Distributed Systems", type: 'sys', minRank: 'Rook', pts: 1500, desc: "CAP Theorem logic / Event-Driven Arch.", icon: <FaServer /> },
    { id: 'cloud-1', title: "AWS Core Services", type: 'cloud', minRank: 'Knight', pts: 600, desc: "Deploy a 3-tier app using EC2, RDS, and S3.", icon: <FaAws /> },
    { id: 'cloud-2', title: "Serverless Arch", type: 'cloud', minRank: 'Knight', pts: 700, desc: "Build an API using Lambda, API Gateway.", icon: <FaCloud /> },
    { id: 'cloud-3', title: "VPC Architect", type: 'cloud', minRank: 'Rook', pts: 1000, desc: "Design Public/Private Subnets, NAT.", icon: <FaNetworkWired /> },
    { id: 'cloud-4', title: "Global Scale", type: 'cloud', minRank: 'Rook', pts: 1200, desc: "Config CloudFront CDN and Route53.", icon: <FaGlobe /> },
];

const SteppedProgressBar = ({ progress, barColor = "bg-indigo-600", segments = 10 }: { progress: number, barColor?: string, segments?: number }) => {
    const filledSegments = Math.round((progress / 100) * segments);
    return (
        <div className="flex w-full gap-1 h-4 border-2 border-black p-0.5 bg-black">
            {Array.from({ length: segments }).map((_, i) => (
                <div
                    key={i}
                    className={`flex-1 h-full ${i < filledSegments ? barColor : "bg-white"}`}
                />
            ))}
        </div>
    );
};

export default function RatingPage() {
    const { user } = useAuth();
    const { profile } = useUserProfile();
    const [heroIdx, setIdx] = useState(0);
    const [path, setPath] = useState<'web' | 'ai' | 'ops' | 'sys' | 'cloud'>('web');
    const [onlyCurrent, setOnlyCurrent] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [modal, setModal] = useState({ open: false, quest: null as any });
    const [repoLink, setRepoLink] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [claim, setClaim] = useState({ loading: false, msg: "", isErr: false });
    const [submissions, setSubmissions] = useState<Record<string, string>>({});

    const rating = profile?.rating || "Pawn";
    const pts = profile?.points || 0;
    const userRankIdx = BADGES.findIndex(b => b.label === rating);
    const view = BADGES[heroIdx] || BADGES[0];
    const isUnlocked = heroIdx <= (userRankIdx === -1 ? 0 : userRankIdx);
    const claimedToday = profile?.lastDailyClaimAt?.toDate().toDateString() === new Date().toDateString();

    useEffect(() => { setIdx(userRankIdx === -1 ? 0 : userRankIdx) }, [rating]);

    useEffect(() => {
        if (!user) return;
        const fetchSubs = async () => {
            try {
                const res = await fetch("/api/user/points/submissions");
                if (res.ok) setSubmissions((await res.json()).submissions);
            } catch (e) { console.error(e); }
        };
        fetchSubs();
    }, [user]);

    const handleClaim = async () => {
        setClaim({ ...claim, loading: true });
        try {
            const res = await fetch("/api/user/points/daily-claim", { method: "POST" });
            const d = await res.json();
            setClaim({ loading: false, msg: res.ok ? d.message : d.error, isErr: !res.ok });
        } catch { setClaim({ loading: false, msg: "Network Error", isErr: true }); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const clubId = profile?.clubIds?.[0]?.clubId || "";
            if (!clubId) { alert("No club found"); setSubmitting(false); return; }
            const res = await fetch("/api/user/points/submit", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ questId: modal.quest?.id, questTitle: modal.quest?.title, points: modal.quest?.pts, track: modal.quest?.type, repoLink, clubId })
            });
            if (!res.ok) throw new Error((await res.json()).error);
            setSubmissions(prev => ({ ...prev, [modal.quest.id]: 'pending' }));
            setModal({ open: false, quest: null }); setRepoLink("");
            alert("Submitted successfully!");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) { alert(e.message); } finally { setSubmitting(false); }
    };

    const nav = (d: number) => setIdx((i) => (i + d + BADGES.length) % BADGES.length);
    
    const getProgressPercent = () => {
        if (heroIdx < userRankIdx) return 100;
        if (heroIdx > userRankIdx) return 0;
        if (view.label === "Rook") return 100;
        const total = (view.next || 3000) - view.base;
        const current = pts - view.base;
        return Math.min(100, Math.max(0, (current / total) * 100));
    };

    const visibleQuests = QUESTS.filter(q => (q.type === 'core' || q.type === path) && (!onlyCurrent || q.minRank === rating));

    return (
        <div className="min-h-screen bg-[#FDFCFB] text-black pb-20 overflow-x-hidden">
            <DashboardNavbar user={user} />

            <main className="p-4 sm:p-8 md:p-12 max-w-7xl mx-auto">
                
                {/* Hero / Rank Section */}
                <section className="border-4 border-black bg-white p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-12">
                    <div className="flex justify-between items-center mb-6">
                        <button onClick={() => nav(-1)} className="p-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all cursor-pointer"><FaArrowLeft /></button>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-8 bg-black" />
                            <span className="font-black uppercase text-[10px] tracking-widest">Global Ranking</span>
                            <div className="h-2 w-8 bg-black" />
                        </div>
                        <button onClick={() => nav(1)} className="p-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all cursor-pointer"><FaArrowRight /></button>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                            <div className={`w-20 h-20 sm:w-24 sm:h-24 border-4 border-black flex items-center justify-center text-4xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${isUnlocked ? view.color : 'bg-slate-100 opacity-30 grayscale'}`}>
                                {view.icon}
                            </div>
                            <div>
                                <h2 className="text-4xl sm:text-5xl font-black uppercase italic tracking-tighter leading-none flex items-center gap-3 mb-2">
                                    {view.label} {!isUnlocked && <FaLock size={20} className="text-slate-400" />}
                                </h2>
                                <div className="w-48 sm:w-64">
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="font-black uppercase text-[9px] tracking-widest text-slate-400">Tier Progress</span>
                                        <span className="font-black text-xs font-mono">{heroIdx < userRankIdx ? "100%" : view.label === "Rook" ? `${pts} PTS` : `${pts}/${view.next}`}</span>
                                    </div>
                                    <SteppedProgressBar progress={getProgressPercent()} segments={view.bars} barColor={view.color} />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center md:items-end gap-4 w-full md:w-auto">
                            <button 
                                onClick={handleClaim} 
                                disabled={claim.loading || claimedToday} 
                                className={`w-full md:w-auto px-6 py-4 border-4 border-black font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer flex items-center justify-center gap-2 ${claimedToday ? 'bg-emerald-400' : 'bg-white'}`}
                            >
                                {claim.loading ? <Loader className="animate-spin" /> : claimedToday ? <><FaCircleCheck /> Stashed (+20)</> : <><FaCalendarCheck /> Daily Claim</>}
                            </button>
                            {claim.msg && <p className={`font-bold uppercase text-[10px] ${claim.isErr ? 'text-rose-600' : 'text-emerald-600'}`}>{claim.msg}</p>}
                        </div>
                    </div>
                </section>

                {/* Explore Header */}
                <header className="mb-10">
                    <div className="flex items-center gap-3 mb-2">
                        <FaCompass size={24} strokeWidth={2.5} className="text-indigo-600" />
                        <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter">Explore Quests</h1>
                    </div>
                    <div className="h-2 w-full bg-black shadow-[4px_4px_0px_0px_rgba(79,70,229,1)]" />
                </header>

                {/* Filter Controls */}
                <div className="flex flex-col lg:flex-row gap-4 mb-8">
                    <button 
                        onClick={() => setOnlyCurrent(!onlyCurrent)} 
                        className={`px-6 py-3 border-4 border-black font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer ${onlyCurrent ? 'bg-indigo-600 text-white' : 'bg-white'}`}
                    >
                        {onlyCurrent ? `Rank: ${rating} Only` : "View All Levels"}
                    </button>
                    <div className="flex-1 flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
                        {['web', 'ai', 'ops', 'sys', 'cloud'].map((t) => (
                            <button 
                                key={t} 
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                onClick={() => setPath(t as any)} 
                                className={`px-5 py-3 border-4 border-black font-black uppercase text-[10px] whitespace-nowrap shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all cursor-pointer ${path === t ? 'bg-black text-white' : 'bg-white'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Quest Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {visibleQuests.length === 0 ? (
                        <div className="col-span-full border-4 border-black border-dashed p-16 text-center">
                            <p className="font-black uppercase text-slate-400 italic">No operations available in this sector.</p>
                        </div>
                    ) : visibleQuests.map((q) => {
                        const qRankIdx = BADGES.findIndex(b => b.label === q.minRank);
                        const isLocked = qRankIdx > userRankIdx;
                        const status = submissions[q.id];
                        const isApproved = status === 'approved';
                        const isPending = status === 'pending';
                        const isRejected = status === 'rejected';

                        return (
                            <div key={q.id} className={`border-4 border-black p-5 bg-white transition-all flex flex-col justify-between ${isLocked ? 'opacity-40 grayscale pointer-events-none' : 'shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'}`}>
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 border-2 border-black bg-slate-50 text-xl">{q.icon}</div>
                                        <div className="bg-black text-white px-2 py-1 font-black text-xs">+{q.pts} PTS</div>
                                    </div>
                                    <h3 className="text-xl font-black uppercase italic tracking-tighter leading-tight mb-2 break-words">
                                        {q.title} {isLocked && <FaLock className="ml-2" />}
                                    </h3>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="border-2 border-black px-2 py-0.5 font-black text-[9px] uppercase bg-slate-100">{q.minRank}</span>
                                        {isApproved && <span className="bg-emerald-400 border-2 border-black px-2 py-0.5 font-black text-[9px] uppercase">Verified</span>}
                                        {isPending && <span className="bg-amber-400 border-2 border-black px-2 py-0.5 font-black text-[9px] uppercase">Under Review</span>}
                                        {isRejected && <span className="bg-rose-400 border-2 border-black px-2 py-0.5 font-black text-[9px] uppercase">Rejected</span>}
                                    </div>
                                    <p className="font-bold text-xs text-slate-600 uppercase mb-6 leading-relaxed break-words">{q.desc}</p>
                                </div>

                                {!isApproved && !isPending && !isLocked && (
                                    <button 
                                        onClick={() => setModal({ open: true, quest: q })} 
                                        className="w-full bg-black text-white border-2 border-black py-3 font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(79,70,229,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer"
                                    >
                                        {isRejected ? "Resubmit Patch" : "Initiate Submission"}
                                    </button>
                                )}
                                {isPending && (
                                    <div className="w-full border-2 border-black py-3 font-black uppercase text-xs text-center bg-slate-50 italic">
                                        Signal Transmitted...
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </main>

            {/* Modal */}
            {modal.open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModal({ open: false, quest: null })} />
                    <div className="bg-white border-8 border-black p-6 md:p-8 w-full max-w-md relative shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
                        <button onClick={() => setModal({ open: false, quest: null })} className="absolute top-4 right-4 text-black hover:scale-110 cursor-pointer"><FaXmark size={24} /></button>
                        
                        <h3 className="text-3xl font-black uppercase italic mb-2 tracking-tighter">Submit Quest</h3>
                        <p className="font-bold text-indigo-600 uppercase text-xs mb-8">Objective: {modal.quest?.title}</p>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block font-black uppercase text-[10px] tracking-widest mb-2">Public Repository Link</label>
                                <input 
                                    required 
                                    type="url" 
                                    placeholder="HTTPS://GITHUB.COM/USER/REPO" 
                                    value={repoLink} 
                                    onChange={(e) => setRepoLink(e.target.value)} 
                                    className="w-full border-4 border-black p-4 font-black uppercase text-sm outline-none focus:bg-indigo-50" 
                                />
                            </div>

                            <div className="bg-amber-100 border-4 border-black p-4">
                                <h4 className="font-black uppercase text-[10px] mb-2 flex items-center gap-2"><FaCircleExclamation /> Pre-Flight Check</h4>
                                <ul className="font-bold uppercase text-[9px] space-y-1 list-disc pl-4">
                                    <li>Repository Visibility set to <b>PUBLIC</b></li>
                                    <li><b>README.md</b> describes features & setup</li>
                                </ul>
                            </div>

                            <button 
                                type="submit" 
                                disabled={submitting} 
                                className="w-full bg-black text-white border-4 border-black py-4 font-black uppercase shadow-[6px_6px_0px_0px_rgba(79,70,229,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer disabled:opacity-50"
                            >
                                {submitting ? "Uploading Data..." : "Finalize Submission"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}