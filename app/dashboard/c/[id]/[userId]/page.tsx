/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
    ClipboardCheck,
    User,
    Trash,
    ArrowLeft,
    CheckCircle2,
    XCircle,
    Clock,
} from "lucide-react";
import DashboardNavbar from "@/components/common/dashboard-navbar";
import { useAuth } from "../../../../../providers/AuthProvider";
import Image from "next/image";
import Link from "next/link";

const QuestSubmissions = ({ clubId, userId }: { clubId: string; userId: string }) => {
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSubmissions = () => {
        fetch("/api/admin/submissions/get-submissions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clubId, userId }),
        })
            .then((r) => r.json())
            .then((d) => {
                setSubmissions(d.submissions || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchSubmissions();
    }, [clubId, userId]);

    const handleReview = async (submissionId: string, action: "approved" | "rejected") => {
        try {
            const res = await fetch("/api/admin/submissions/review", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ submissionId, action, clubId }),
            });
            if (res.ok) fetchSubmissions();
            else alert("Failed to review");
        } catch {
            alert("Error reviewing");
        }
    };

    if (loading) return <div className="font-black uppercase italic p-4">Scanning...</div>;
    if (submissions.length === 0)
        return (
            <div className="border-4 border-black border-dashed p-8 text-center font-bold uppercase text-slate-400">
                No Submissions
            </div>
        );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {submissions.map((s: any) => (
                <div
                    key={s.id}
                    className="border-4 border-black p-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between"
                >
                    <div className="min-w-0">
                        <div className="flex justify-between items-start gap-2 mb-4">
                            <h3 className="font-black uppercase text-sm leading-tight break-words">
                                {s.questTitle}
                            </h3>
                            <div
                                className={`border-2 border-black px-2 py-1 font-black text-[9px] uppercase whitespace-nowrap ${s.status === "pending"
                                        ? "bg-amber-400"
                                        : s.status === "approved"
                                            ? "bg-emerald-400"
                                            : "bg-rose-400"
                                    }`}
                            >
                                {s.status}
                            </div>
                        </div>
                        <p className="font-bold text-[10px] uppercase mb-1">Points: {s.points}</p>
                        <a
                            href={s.repoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-black text-white px-3 py-1 text-[9px] font-black uppercase mb-4 hover:bg-indigo-600 transition-colors"
                        >
                            View Repo
                        </a>
                    </div>

                    <div className="flex gap-2">
                        {s.status !== "approved" && (
                            <button
                                onClick={() => handleReview(s.id, "approved")}
                                className="flex-1 py-2 bg-emerald-400 border-2 border-black font-black uppercase text-[10px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all cursor-pointer"
                            >
                                Approve
                            </button>
                        )}
                        {s.status !== "rejected" && (
                            <button
                                onClick={() => handleReview(s.id, "rejected")}
                                className="flex-1 py-2 bg-rose-400 border-2 border-black font-black uppercase text-[10px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all cursor-pointer"
                            >
                                Reject
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

const SteppedProgressBar = ({ progress }: { progress: number }) => {
    const segments = 10;
    const filledSegments = Math.round((progress / 100) * segments);
    return (
        <div className="flex w-full gap-1 h-4 border-2 border-black p-0.5 bg-black">
            {Array.from({ length: segments }).map((_, i) => (
                <div
                    key={i}
                    className={`flex-1 h-full ${i < filledSegments ? (progress === 100 ? "bg-emerald-400" : "bg-indigo-400") : "bg-white"
                        }`}
                />
            ))}
        </div>
    );
};

const ModalWrapper = ({
    children,
    isOpen,
    onClose,
}: {
    children: React.ReactNode;
    isOpen: boolean;
    onClose: () => void;
}) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white border-4 md:border-8 border-black p-6 md:p-8 w-full max-w-md relative shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
                {children}
            </div>
        </div>
    );
};

const TaskCard = ({
    task,
    onEditDueDate,
    onDeleteTask,
}: {
    task: any;
    onEditDueDate: (id: string, date: string) => void;
    onDeleteTask: (id: string) => void;
}) => {
    const isOverdue = new Date(task.dueDate._seconds * 1000) < new Date() && task.status < 100;
    return (
        <div className="bg-white border-4 border-black p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex justify-between items-start mb-4 gap-2">
                <h3 className="text-lg font-black uppercase italic tracking-tighter break-words">
                    {task.title}
                </h3>
                <button
                    onClick={() => onDeleteTask(task.progressId)}
                    className="text-rose-600 shrink-0 cursor-pointer"
                >
                    <Trash size={18} />
                </button>
            </div>
            <p className="font-bold text-xs mb-6 text-slate-600 uppercase break-words">
                {task.description}
            </p>
            <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                    <span className="font-black uppercase text-[9px] tracking-widest text-slate-400">
                        Progress
                    </span>
                    <span className="font-black text-sm">{task.status}%</span>
                </div>
                <SteppedProgressBar progress={task.status} />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t-2 border-black pt-4">
                <div
                    className={`flex items-center gap-2 font-black uppercase text-[10px] ${isOverdue ? "text-rose-600" : "text-black"
                        }`}
                >
                    <Clock size={14} />
                    <span>{new Date(task.dueDate._seconds * 1000).toLocaleDateString("en-GB")}</span>
                </div>
                <button
                    onClick={() =>
                        onEditDueDate(
                            task.progressId,
                            new Date(task.dueDate._seconds * 1000).toISOString().split("T")[0]
                        )
                    }
                    className="text-[10px] font-black uppercase underline decoration-2 cursor-pointer"
                >
                    Reschedule
                </button>
            </div>
        </div>
    );
};

export default function Page() {
    const params = useParams<{ id: string; userId: string }>();
    const { id, userId } = params;
    const { user } = useAuth();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [data, setData] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [editingTask, setEditingTask] = useState<any | null>(null);
    const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

    const [isAddingTask, setIsAddingTask] = useState(false);
    const [isUpdatingDueDate, setIsUpdatingDueDate] = useState(false);
    const [isRemovingMember, setIsRemovingMember] = useState(false);
    const [isDeletingTask, setIsDeletingTask] = useState(false);
    const [isUpdatingDepartment, setIsUpdatingDepartment] = useState(false);

    const [isEditingDepartment, setIsEditingDepartment] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [newTask, setNewTask] = useState({ title: "", description: "", dueDate: "" });
    const [newDueDate, setNewDueDate] = useState("");

    const fetchData = async () => {
        try {
            const response = await fetch(`/api/admin/members/get-member-info?userId=${userId}&clubId=${id}`);
            if (response.ok) {
                const result = await response.json();
                setData(result);
                setSelectedDepartment(result.department);
            } else {
                setError(`Error: ${response.status}`);
            }
        } catch (err) {
            setError("Fetch error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id && userId) fetchData();
    }, [id, userId]);

    const handleUpdateDepartment = async () => {
        setIsUpdatingDepartment(true);
        try {
            const res = await fetch("/api/admin/members/update-department", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, clubId: id, department: selectedDepartment }),
            });
            if (res.ok) {
                fetchData();
                setIsEditingDepartment(false);
            }
        } finally {
            setIsUpdatingDepartment(false);
        }
    };

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAddingTask(true);
        try {
            const res = await fetch("/api/admin/tasks/give-task", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    clubId: id,
                    userId,
                    createdAt: { _seconds: Math.floor(Date.now() / 1000), _nanoseconds: 0 },
                    description: newTask.description,
                    dueDate: {
                        _seconds: Math.floor(new Date(newTask.dueDate).getTime() / 1000),
                        _nanoseconds: 0,
                    },
                    title: newTask.title,
                }),
            });
            if (res.ok) {
                fetchData();
                setIsModalOpen(false);
                setNewTask({ title: "", description: "", dueDate: "" });
            }
        } finally {
            setIsAddingTask(false);
        }
    };

    const handleUpdateDueDate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTask) return;
        setIsUpdatingDueDate(true);
        try {
            const res = await fetch("/api/admin/tasks/update-duedate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    progressId: editingTask.progressId,
                    newDueDate: {
                        _seconds: Math.floor(new Date(newDueDate).getTime() / 1000),
                        _nanoseconds: 0,
                    },
                }),
            });
            if (res.ok) {
                fetchData();
                setIsEditModalOpen(false);
            }
        } finally {
            setIsUpdatingDueDate(false);
        }
    };

    const handleRemoveMember = async () => {
        setIsRemovingMember(true);
        try {
            const res = await fetch("/api/admin/members/remove-member", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clubId: id, userId }),
            });
            if (res.ok) window.location.href = `/dashboard/c/${id}`;
        } finally {
            setIsRemovingMember(false);
        }
    };

    const handleConfirmDeleteTask = async () => {
        if (!deletingTaskId) return;
        setIsDeletingTask(true);
        try {
            const res = await fetch("/api/admin/tasks/delete-task", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ progressId: deletingTaskId }),
            });
            if (res.ok) {
                fetchData();
                setIsDeleteModalOpen(false);
            }
        } finally {
            setIsDeletingTask(false);
        }
    };

    if (loading)
        return (
            <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-6 text-center">
                <div className="border-4 border-black p-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-black uppercase italic">
                    Fetching Member Stats...
                </div>
            </div>
        );

    if (error || !data)
        return (
            <div className="p-10 font-black uppercase text-rose-600 bg-[#FDFCFB] min-h-screen">
                {error || "Member not found"}
            </div>
        );

    return (
        <div className="min-h-screen bg-[#FDFCFB] text-black pb-20 overflow-x-hidden">
            <DashboardNavbar user={user} />

            <main className="p-4 sm:p-8 md:p-12 max-w-7xl mx-auto">
                <Link href={`/dashboard/c/${id}`}>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border-4 border-black font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer mb-8">
                        <ArrowLeft size={16} /> Exit to Directory
                    </button>
                </Link>

                <header className="mb-12 border-b-8 border-black pb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                        <div className="flex flex-col sm:flex-row items-start gap-6 min-w-0">
                            <div className="relative shrink-0">
                                {data.photoURL ? (
                                    <Image
                                        src={data.photoURL}
                                        alt={data.name}
                                        className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] object-cover"
                                        width={96}
                                        height={96}
                                    />
                                ) : (
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-indigo-400 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                                        <User size={40} />
                                    </div>
                                )}
                                <div className="absolute -bottom-2 -right-2 bg-black text-white px-2 py-1 font-black text-[9px] uppercase">
                                    {data.role}
                                </div>
                            </div>

                            <div className="min-w-0 w-full">
                                <h1 className="text-3xl sm:text-5xl font-black uppercase italic tracking-tighter leading-none mb-2 break-words">
                                    {data.name}
                                </h1>
                                <p className="font-bold text-sm sm:text-base text-slate-500 uppercase tracking-widest mb-4 break-all">
                                    {data.email}
                                </p>

                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="flex items-center gap-2 bg-white border-2 border-black px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                        <span className="font-black uppercase text-[9px]">Division:</span>
                                        {isEditingDepartment ? (
                                            <select
                                                value={selectedDepartment}
                                                onChange={(e) => setSelectedDepartment(e.target.value)}
                                                className="bg-transparent font-black uppercase text-[9px] outline-none"
                                            >
                                                {data.departments.map((d: string) => (
                                                    <option key={d} value={d}>
                                                        {d}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span className="font-black uppercase text-[9px] text-indigo-600">
                                                {data.department}
                                            </span>
                                        )}
                                    </div>
                                    {isEditingDepartment ? (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleUpdateDepartment}
                                                className="bg-emerald-400 border-2 border-black p-1 cursor-pointer"
                                            >
                                                <CheckCircle2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => setIsEditingDepartment(false)}
                                                className="bg-rose-400 border-2 border-black p-1 cursor-pointer"
                                            >
                                                <XCircle size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setIsEditingDepartment(true)}
                                            className="font-black uppercase text-[9px] underline decoration-2 cursor-pointer"
                                        >
                                            Change
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsRemoveModalOpen(true)}
                            className="w-full lg:w-auto bg-rose-600 text-white border-4 border-black px-6 py-3 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <Trash size={18} /> Expel Member
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    <section className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(79,70,229,1)]">
                        <div className="flex items-center justify-between mb-8 border-b-4 border-black pb-4">
                            <div className="flex items-center gap-2">
                                <ClipboardCheck className="text-indigo-600" size={24} />
                                <h2 className="text-xl sm:text-2xl font-black uppercase italic tracking-tighter">
                                    Club Tasks
                                </h2>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-indigo-600 text-white border-2 border-black px-3 py-1 font-black uppercase text-[10px] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all cursor-pointer"
                            >
                                Assign
                            </button>
                        </div>
                        <div className="space-y-6">
                            {data.progress
                                .filter((t: any) => t.givenBy === "club")
                                .map((task: any, i: number) => (
                                    <TaskCard
                                        key={i}
                                        task={task}
                                        onEditDueDate={(id, date) => {
                                            setEditingTask({ progressId: id });
                                            setNewDueDate(date);
                                            setIsEditModalOpen(true);
                                        }}
                                        onDeleteTask={(id) => {
                                            setDeletingTaskId(id);
                                            setIsDeleteModalOpen(true);
                                        }}
                                    />
                                ))}
                        </div>
                    </section>

                    <section className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(52,211,153,1)]">
                        <div className="flex items-center gap-2 mb-8 border-b-4 border-black pb-4">
                            <User className="text-emerald-500" size={24} />
                            <h2 className="text-xl sm:text-2xl font-black uppercase italic tracking-tighter">
                                Personal
                            </h2>
                        </div>
                        <div className="space-y-6">
                            {data.progress
                                .filter((t: any) => t.givenBy === "personal")
                                .map((task: any, i: number) => (
                                    <TaskCard
                                        key={i}
                                        task={task}
                                        onEditDueDate={(id, date) => {
                                            setEditingTask({ progressId: id });
                                            setNewDueDate(date);
                                            setIsEditModalOpen(true);
                                        }}
                                        onDeleteTask={(id) => {
                                            setDeletingTaskId(id);
                                            setIsDeleteModalOpen(true);
                                        }}
                                    />
                                ))}
                        </div>
                    </section>
                </div>

                <section className="border-4 border-black bg-slate-100 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-8 border-b-4 border-black pb-4">
                        Quest Activity
                    </h2>
                    <QuestSubmissions clubId={id as string} userId={userId as string} />
                </section>
            </main>

            {/* Modals */}
            <ModalWrapper isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <h3 className="text-xl font-black uppercase italic mb-6">Assign Task</h3>
                <form onSubmit={handleAddTask} className="space-y-4">
                    <input
                        type="text"
                        placeholder="TASK TITLE"
                        required
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        className="w-full border-4 border-black p-3 font-bold uppercase outline-none focus:bg-indigo-50"
                    />
                    <textarea
                        placeholder="DESCRIPTION"
                        required
                        value={newTask.description}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                        rows={3}
                        className="w-full border-4 border-black p-3 font-bold uppercase outline-none focus:bg-indigo-50"
                    />
                    <input
                        type="date"
                        required
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                        className="w-full border-4 border-black p-3 font-bold uppercase outline-none"
                    />
                    <button
                        disabled={isAddingTask}
                        className="w-full bg-black text-white border-4 border-black py-4 font-black uppercase shadow-[4px_4px_0px_0px_rgba(79,70,229,1)] hover:shadow-none transition-all cursor-pointer"
                    >
                        Deploy Task
                    </button>
                </form>
            </ModalWrapper>

            <ModalWrapper isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
                <h3 className="text-xl font-black uppercase italic mb-6">New Deadline</h3>
                <form onSubmit={handleUpdateDueDate} className="space-y-6">
                    <input
                        type="date"
                        value={newDueDate}
                        onChange={(e) => setNewDueDate(e.target.value)}
                        className="w-full border-4 border-black p-3 font-bold uppercase outline-none"
                    />
                    <button
                        disabled={isUpdatingDueDate}
                        className="w-full bg-emerald-400 border-4 border-black py-4 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all cursor-pointer"
                    >
                        Update
                    </button>
                </form>
            </ModalWrapper>

            <ModalWrapper isOpen={isRemoveModalOpen} onClose={() => setIsRemoveModalOpen(false)}>
                <h3 className="text-xl font-black uppercase italic mb-4 text-rose-600">Danger Area</h3>
                <p className="font-bold uppercase text-xs mb-8">
                    Expel this member? This action is irreversible.
                </p>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleRemoveMember}
                        disabled={isRemovingMember}
                        className="w-full bg-rose-600 text-white border-4 border-black py-4 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all cursor-pointer"
                    >
                        Confirm Expulsion
                    </button>
                    <button
                        onClick={() => setIsRemoveModalOpen(false)}
                        className="w-full bg-white border-4 border-black py-4 font-black uppercase cursor-pointer"
                    >
                        Cancel
                    </button>
                </div>
            </ModalWrapper>

            <ModalWrapper isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <h3 className="text-xl font-black uppercase italic mb-6">Delete Task</h3>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleConfirmDeleteTask}
                        disabled={isDeletingTask}
                        className="w-full bg-black text-white border-4 border-black py-4 font-black uppercase shadow-[4px_4px_0px_0px_rgba(225,29,72,1)] hover:shadow-none transition-all cursor-pointer"
                    >
                        Delete Permanently
                    </button>
                    <button
                        onClick={() => setIsDeleteModalOpen(false)}
                        className="w-full bg-white border-4 border-black py-4 font-black uppercase cursor-pointer"
                    >
                        Abort
                    </button>
                </div>
            </ModalWrapper>
        </div>
    );
}