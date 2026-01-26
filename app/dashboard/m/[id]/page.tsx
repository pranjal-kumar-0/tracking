"use client";

import React, { useState, useEffect } from "react";
import {
    Plus,
    Edit2,
    X,
    ClipboardCheck,
    User,
    CalendarDays,
    Trash2,
    Loader,
    ArrowLeft,
    Compass,
    Save
} from "lucide-react";
import DashboardNavbar from "@/components/common/dashboard-navbar";
import { useAuth } from "@/providers/AuthProvider";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Task {
    id: string;
    createdAt: string;
    department: string;
    description: string;
    title: string;
    dueDate: string;
    status: number;
    givenBy: "personal" | "club";
}

interface Club {
    id: string;
    name: string;
    departments: string[];
    createdAt: Date;
}

const SteppedProgressBar = ({ progress }: { progress: number }) => {
    const segments = 10;
    const filledSegments = Math.round((progress / 100) * segments);

    return (
        <div className="flex w-full gap-1 h-4 border-2 border-black p-0.5 bg-black">
            {Array.from({ length: segments }).map((_, i) => (
                <div
                    key={i}
                    className={`flex-1 h-full ${i < filledSegments
                        ? (progress === 100 ? "bg-emerald-400" : "bg-indigo-400")
                        : "bg-white"
                        }`}
                />
            ))}
        </div>
    );
};

const TaskCard = ({
    task,
    onEdit,
    onDelete,
}: {
    task: Task;
    onEdit: (task: Task) => void;
    onDelete: (task: Task) => void;
}) => {
    const isOverdue = new Date(task.dueDate) < new Date() && task.status < 100;

    return (
        <div className="bg-white border-4 border-black p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
            <div className="flex justify-between items-start mb-4 gap-2">
                <h3 className="text-xl font-black uppercase italic tracking-tighter leading-tight break-words">{task.title}</h3>
                <div className="flex gap-2 shrink-0">
                    <button
                        onClick={() => onEdit(task)}
                        className="p-2 border-2 border-black bg-indigo-50 hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer"
                    >
                        <Edit2 size={16} />
                    </button>
                    {task.givenBy === "personal" && (
                        <button
                            onClick={() => onDelete(task)}
                            className="p-2 border-2 border-black bg-rose-50 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            </div>
            <p className="font-bold text-xs text-slate-600 uppercase mb-6 break-words">{task.description}</p>

            <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                    <span className="font-black uppercase text-[9px] tracking-widest text-slate-400">Progression</span>
                    <span className="font-black text-sm">{task.status}%</span>
                </div>
                <SteppedProgressBar progress={task.status} />
            </div>

            <div className="flex items-center justify-between pt-4 border-t-2 border-black border-dashed">
                <div className={`flex items-center gap-1.5 font-black uppercase text-[10px] ${isOverdue ? "text-rose-600" : "text-black"}`}>
                    <CalendarDays size={14} />
                    <span>{isOverdue ? "EXPIRED" : "DUE"}: {new Date(task.dueDate).toLocaleDateString('en-GB')}</span>
                </div>
                {task.status === 100 && (
                    <div className="bg-emerald-400 border-2 border-black px-2 py-0.5 font-black text-[9px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        Verified
                    </div>
                )}
            </div>
        </div>
    );
};

const ModalWrapper = ({ children, isOpen, onClose }: { children: React.ReactNode; isOpen: boolean; onClose: () => void }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white border-8 border-black p-6 md:p-8 w-full max-w-lg relative shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
                {children}
            </div>
        </div>
    );
};

export default function Page() {
    const params = useParams<{ id: string }>();
    const id = params.id;
    const { user } = useAuth();

    const [tasks, setTasks] = useState<Task[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Partial<Task> | null>(null);

    const [userClubs, setUserClubs] = useState<string[]>([]);
    const [allClubs, setAllClubs] = useState<Club[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [applied, setApplied] = useState(false);
    const [refetchTrigger, setRefetchTrigger] = useState(0);

    const [isApplying, setIsApplying] = useState(false);
    const [isSavingTask, setIsSavingTask] = useState(false);

    const [modalData, setModalData] = useState({
        title: "",
        description: "",
        dueDate: new Date().toISOString().split("T")[0],
        status: 0,
        givenBy: "personal" as "personal" | "club"
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [clubsRes, allClubsRes] = await Promise.all([
                    fetch('/api/user/clubs/get-my-clubs'),
                    fetch('/api/user/clubs/get-all-clubs')
                ]);
                if (clubsRes.ok) setUserClubs(await clubsRes.json());
                if (allClubsRes.ok) setAllClubs(await allClubsRes.json());
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const fetchTasks = async () => {
            if (!user || !id) return;
            try {
                const res = await fetch(`/api/user/tasks/get-task?clubId=${id}&userId=${user.uid}`);
                if (res.ok) {
                    const data = await res.json();
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    setTasks(data.map((t: any) => ({
                        id: t.progressId,
                        createdAt: new Date(t.createdAt._seconds * 1000).toISOString(),
                        department: "Club",
                        description: t.description,
                        title: t.title,
                        dueDate: new Date(t.dueDate._seconds * 1000).toISOString().split('T')[0],
                        status: t.status,
                        givenBy: t.givenBy
                    })));
                }
            } catch (error) {
                console.error(error);
            }
        };
        fetchTasks();
    }, [user, id, refetchTrigger]);

    const handleApply = async () => {
        if (!selectedDepartment) return;
        setIsApplying(true);
        try {
            const res = await fetch('/api/user/clubs/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clubId: id, department: selectedDepartment })
            });
            if (res.ok) setApplied(true);
        } finally {
            setIsApplying(false);
        }
    };

    const handleOpenModal = (task: Task | null) => {
        if (task) {
            setEditingTask(task);
            setModalData({
                title: task.title,
                description: task.description,
                dueDate: task.dueDate,
                status: task.status,
                givenBy: task.givenBy
            });
        } else {
            setEditingTask(null);
            setModalData({
                title: "",
                description: "",
                dueDate: new Date().toISOString().split("T")[0],
                status: 0,
                givenBy: "personal"
            });
        }
        setIsModalOpen(true);
    };

    const handleSaveTask = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingTask(true);
        if (editingTask?.id) {
            try {
                const res = await fetch('/api/user/tasks/update-progress', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ progressId: editingTask.id, status: modalData.status }),
                });
                if (res.ok) {
                    setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, status: modalData.status } : t));
                }
            } catch (error) {
                console.error(error);
            }
        } else {
            const payload = {
                userId: user?.uid,
                clubId: id,
                createdAt: { _seconds: Math.floor(Date.now() / 1000), _nanoseconds: 0 },
                description: modalData.description,
                dueDate: { _seconds: Math.floor(new Date(modalData.dueDate).getTime() / 1000), _nanoseconds: 0 },
                givenBy: modalData.givenBy,
                status: modalData.status,
                title: modalData.title,
            };
            try {
                const res = await fetch('/api/user/tasks/add-task', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                if (res.ok) setRefetchTrigger(prev => prev + 1);
            } catch (error) {
                console.error(error);
            }
        }
        setIsSavingTask(false);
        setIsModalOpen(false);
    };

    const handleDeleteTask = async (task: Task) => {
        try {
            const res = await fetch('/api/user/tasks/delete-personal-task', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ progressId: task.id }),
            });
            if (res.ok) setTasks(tasks.filter((t) => t.id !== task.id));
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center">
            <div className="border-4 border-black p-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-black uppercase italic animate-pulse">
                Accessing Logs...
            </div>
        </div>
    );

    const clubData = allClubs.find(c => c.id === id);
    if (!clubData) return <div className="p-20 font-black uppercase text-rose-600">Club Void</div>;

    const isMember = userClubs.includes(id);

    if (!isMember) {
        return (
            <div className="min-h-screen bg-[#FDFCFB]">
                <DashboardNavbar user={user} />
                <main className="p-6 md:p-12 max-w-2xl mx-auto mt-10">
                    <div className="bg-white border-8 border-black p-8 shadow-[16px_16px_0px_0px_rgba(79,70,229,1)]">
                        <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-2 break-words">{clubData.name}</h1>
                        <p className="font-bold uppercase text-[10px] tracking-widest text-slate-400 mb-10">Membership Required</p>

                        {applied ? (
                            <div className="bg-emerald-400 border-4 border-black p-4 font-black uppercase italic text-center">
                                Application Transmitted. Awaiting Approval.
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div>
                                    <label className="block font-black uppercase text-xs mb-2">Division Selection</label>
                                    <select
                                        value={selectedDepartment}
                                        onChange={(e) => setSelectedDepartment(e.target.value)}
                                        className="w-full border-4 border-black p-4 font-black uppercase bg-slate-50 outline-none"
                                    >
                                        <option value="">Select Department</option>
                                        {clubData.departments.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    onClick={handleApply}
                                    disabled={isApplying}
                                    className="w-full bg-black text-white border-4 border-black p-5 font-black uppercase shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {isApplying ? "Transmitting..." : "Initiate Application"}
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        );
    }

    const clubTasks = tasks.filter(t => t.givenBy === "club");
    const personalTasks = tasks.filter(t => t.givenBy === "personal");

    return (
        <div className="min-h-screen bg-[#FDFCFB] text-black pb-24 overflow-x-hidden">
            <DashboardNavbar user={user} />

            <main className="p-4 sm:p-8 md:p-12 max-w-7xl mx-auto">
                <header className="mb-12">
                    <Link href="/dashboard">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border-4 border-black font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer mb-8">
                            <ArrowLeft size={16} /> Hub Directory
                        </button>
                    </Link>

                    <div className="flex items-center gap-3 mb-2">
                        <Compass size={24} strokeWidth={2.5} className="text-indigo-600" />
                        <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter">Explore: {clubData.name}</h1>
                    </div>
                    <div className="h-2 w-full bg-black shadow-[4px_4px_0px_0px_rgba(79,70,229,1)]" />
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <section className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(79,70,229,1)]">
                        <div className="flex items-center gap-3 mb-8 border-b-4 border-black pb-4">
                            <ClipboardCheck className="text-indigo-600" size={28} />
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter">Club Objectives ({clubTasks.length})</h2>
                        </div>
                        <div className="space-y-6">
                            {clubTasks.length > 0 ? (
                                clubTasks.map(task => <TaskCard key={task.id} task={task} onEdit={handleOpenModal} onDelete={handleDeleteTask} />)
                            ) : (
                                <div className="border-4 border-black border-dashed p-10 text-center font-black uppercase text-slate-300">No Operations assigned</div>
                            )}
                        </div>
                    </section>

                    <section className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(52,211,153,1)]">
                        <div className="flex items-center gap-3 mb-8 border-b-4 border-black pb-4">
                            <User className="text-emerald-500" size={28} />
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter">Solo Directives ({personalTasks.length})</h2>
                        </div>
                        <div className="space-y-6">
                            {personalTasks.length > 0 ? (
                                personalTasks.map(task => <TaskCard key={task.id} task={task} onEdit={handleOpenModal} onDelete={handleDeleteTask} />)
                            ) : (
                                <div className="border-4 border-black border-dashed p-10 text-center font-black uppercase text-slate-300">No personal entries</div>
                            )}
                        </div>
                    </section>
                </div>
            </main>

            <button
                onClick={() => handleOpenModal(null)}
                className="fixed bottom-8 right-8 w-16 h-16 bg-black text-white border-4 border-black rounded-none shadow-[6px_6px_0px_0px_rgba(79,70,229,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center z-50 cursor-pointer"
            >
                <Plus size={32} strokeWidth={3} />
            </button>

            <ModalWrapper isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <h2 className="text-3xl font-black uppercase italic mb-8 border-b-4 border-black pb-4">
                    {editingTask?.id ? "Update Status" : "New Entry"}
                </h2>

                <form onSubmit={handleSaveTask} className="space-y-6">
                    {!editingTask?.id && (
                        <>
                            <input
                                placeholder="OBJECTIVE TITLE"
                                value={modalData.title}
                                onChange={e => setModalData({ ...modalData, title: e.target.value })}
                                required
                                className="w-full border-4 border-black p-4 font-black uppercase outline-none focus:bg-indigo-50"
                            />
                            <textarea
                                placeholder="OPERATIONAL NOTES"
                                value={modalData.description}
                                onChange={e => setModalData({ ...modalData, description: e.target.value })}
                                rows={3}
                                className="w-full border-4 border-black p-4 font-black uppercase outline-none focus:bg-indigo-50"
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <input
                                    type="date"
                                    value={modalData.dueDate}
                                    onChange={e => setModalData({ ...modalData, dueDate: e.target.value })}
                                    required
                                    className="w-full border-4 border-black p-4 font-black uppercase outline-none"
                                />
                                <select
                                    value={modalData.givenBy}
                                    onChange={e => setModalData({ ...modalData, givenBy: e.target.value as "personal" | "club" })}
                                    className="w-full border-4 border-black p-4 font-black uppercase outline-none bg-white"
                                >
                                    <option value="personal">Personal</option>
                                    <option value="club">Club</option>
                                </select>
                            </div>
                        </>
                    )}

                    <div className="bg-slate-50 border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                        <label className="flex justify-between font-black uppercase text-xs mb-4">
                            Completion Level <span>{modalData.status}%</span>
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={modalData.status}
                            onChange={e => setModalData({ ...modalData, status: Number(e.target.value) })}
                            className="w-full h-8 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-runnable-track]:bg-black [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:-mt-2"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSavingTask}
                        className="w-full bg-black text-white border-4 border-black p-5 font-black uppercase shadow-[8px_8px_0px_0px_rgba(79,70,229,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer flex items-center justify-center gap-3"
                    >
                        {isSavingTask && <Loader size={20} className="animate-spin" />}
                        <Save size={20} />
                        {editingTask?.id ? "Sync Changes" : "Confirm Entry"}
                    </button>
                </form>
            </ModalWrapper>
        </div>
    );
}