"use client";

import DashboardNavbar from '@/components/common/dashboard-navbar'
import { useAuth } from '@/providers/AuthProvider';
import React, { useState, useEffect } from 'react'
import { Plus, Users, UserCircle, Calendar, Briefcase, X, Edit, Trash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

const Page = () => {
    const { user } = useAuth();
    const [clubs, setClubs] = useState<Club[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingClub, setEditingClub] = useState<Club | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingClubId, setDeletingClubId] = useState<string | null>(null);
    const [deletingClubName, setDeletingClubName] = useState<string>('');
    const [formData, setFormData] = useState({
        name: '',
        departments: '',
        adminIds: '',
        memberIds: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchClubs = async () => {
        try {
            const response = await fetch('/api/superadmin/clubs/get-clubs');
            if (!response.ok) throw new Error('Failed to fetch clubs');
            const data: Club[] = await response.json();
            setClubs(data);
        } catch (error) {
            console.error('Error fetching clubs:', error);
        }
    };

    useEffect(() => {
        fetchClubs();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                name: formData.name,
                departments: formData.departments.split(',').map(d => d.trim()),
                adminIds: formData.adminIds.split(',').map(a => a.trim()),
                memberIds: formData.memberIds.split(',').map(m => m.trim()),
            };
            const response = await fetch('/api/superadmin/clubs/create-club', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) throw new Error('Failed to create club');
            setFormData({ name: '', departments: '', adminIds: '', memberIds: '' });
            setIsModalOpen(false);
            fetchClubs();
        } catch (error) {
            console.error('Error creating club:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingClub) return;
        setIsSubmitting(true);
        try {
            const payload = {
                id: editingClub.id,
                name: formData.name,
                departments: formData.departments.split(',').map(d => d.trim()),
                adminIds: formData.adminIds.split(',').map(a => a.trim()),
                memberIds: formData.memberIds.split(',').map(m => m.trim()),
            };
            const response = await fetch('/api/superadmin/clubs/modify-club', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) throw new Error('Failed to update club');
            setFormData({ name: '', departments: '', adminIds: '', memberIds: '' });
            setIsEditModalOpen(false);
            setEditingClub(null);
            fetchClubs();
        } catch (error) {
            console.error('Error updating club:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const openEditModal = (club: Club) => {
        setEditingClub(club);
        setFormData({
            name: club.name,
            departments: club.departments.join(', '),
            adminIds: club.adminIds.join(', '),
            memberIds: club.memberIds.join(', '),
        });
        setIsEditModalOpen(true);
    };

    const handleDelete = (clubId: string, clubName: string) => {
        setDeletingClubId(clubId);
        setDeletingClubName(clubName);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deletingClubId) return;
        try {
            const response = await fetch('/api/superadmin/clubs/delete-club', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: deletingClubId }),
            });
            if (!response.ok) throw new Error('Failed to delete club');
            fetchClubs();
            setIsDeleteModalOpen(false);
            setDeletingClubId(null);
            setDeletingClubName('');
        } catch (error) {
            console.error('Error deleting club:', error);
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-[#FDFCFB] text-black">
            <DashboardNavbar user={user} />
            <main className="flex-1 p-6 md:p-12">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-12">
                        <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">
                            Super Admin <span className="text-indigo-600">Dashboard</span>
                        </h1>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex w-fit items-center gap-2 border-4 border-black bg-yellow-400 px-6 py-3 font-black uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
                        >
                            <Plus className="h-6 w-6 stroke-[3px]" />
                            Add New Club
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {clubs.map((club) => (
                            <motion.div
                                key={club.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex flex-col group"
                            >
                                <div className="p-6 grow">
                                    <div className="flex justify-between items-start mb-6 border-b-4 border-black pb-4">
                                        <h2 className="text-2xl font-black uppercase tracking-tight truncate mr-2">{club.name}</h2>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => openEditModal(club)}
                                                className="p-2 border-2 border-black bg-indigo-100 hover:bg-indigo-300 transition-colors cursor-pointer"
                                            >
                                                <Edit className="h-5 w-5" strokeWidth={3} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(club.id, club.name)}
                                                className="p-2 border-2 border-black bg-red-100 hover:bg-red-300 transition-colors cursor-pointer"
                                            >
                                                <Trash className="h-5 w-5" strokeWidth={3} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="font-black uppercase text-xs tracking-widest text-slate-500 mb-2 flex items-center gap-2">
                                                <Briefcase className="h-4 w-4 text-black" />
                                                Departments ({club.departments.length})
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {club.departments.map(dep => (
                                                    <span key={dep} className="px-2 py-1 border-2 border-black bg-slate-100 text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                                        {dep}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="font-black uppercase text-xs tracking-widest text-slate-500 mb-2 flex items-center gap-2">
                                                <UserCircle className="h-4 w-4 text-black" />
                                                Admins ({club.adminIds.length})
                                            </h3>
                                            <div className="space-y-1">
                                                {club.adminIds.map(admin => (
                                                    <p key={admin} className="text-xs font-bold truncate italic border-l-2 border-black pl-2">{admin}</p>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="font-black uppercase text-xs tracking-widest text-slate-500 mb-2 flex items-center gap-2">
                                                <Users className="h-4 w-4 text-black" />
                                                Members ({club.memberIds.length})
                                            </h3>
                                            <div className="bg-slate-50 border-2 border-black p-2 max-h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-black">
                                                {club.memberIds.map(member => (
                                                    <p key={member} className="text-[10px] font-bold truncate py-0.5 border-b border-black/10 last:border-0">{member}</p>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-black text-white px-6 py-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                                    <Calendar className="h-4 w-4" />
                                    SYNCED: {new Date(club.createdAt._seconds * 1000).toLocaleDateString()}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>

            <AnimatePresence>
                {(isModalOpen || isEditModalOpen) && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white border-8 border-black p-8 shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] w-full max-w-lg"
                        >
                            <div className="flex justify-between items-center mb-8 border-b-4 border-black pb-4">
                                <h2 className="text-3xl font-black uppercase tracking-tighter">
                                    {isEditModalOpen ? 'Modify Club' : 'Create New Club'}
                                </h2>
                                <button onClick={() => { setIsModalOpen(false); setIsEditModalOpen(false); }} className="hover:rotate-90 transition-transform cursor-pointer">
                                    <X className="h-8 w-8 stroke-[3px]" />
                                </button>
                            </div>
                            <form onSubmit={isEditModalOpen ? handleEditSubmit : handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black uppercase mb-1">Club Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full border-4 border-black p-3 font-bold focus:bg-yellow-50 outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase mb-1 text-indigo-600">Departments (comma-separated)</label>
                                    <textarea
                                        value={formData.departments}
                                        onChange={(e) => setFormData({ ...formData, departments: e.target.value })}
                                        className="w-full border-4 border-black p-3 font-bold focus:bg-yellow-50 outline-none h-20"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase mb-1">Admin Emails</label>
                                    <input
                                        type="text"
                                        value={formData.adminIds}
                                        onChange={(e) => setFormData({ ...formData, adminIds: e.target.value })}
                                        className="w-full border-4 border-black p-3 font-bold focus:bg-yellow-50 outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase mb-1">Member Emails</label>
                                    <textarea
                                        value={formData.memberIds}
                                        onChange={(e) => setFormData({ ...formData, memberIds: e.target.value })}
                                        className="w-full border-4 border-black p-3 font-bold focus:bg-yellow-50 outline-none h-24"
                                        required
                                    />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 border-4 border-black bg-indigo-600 text-white p-4 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 cursor-pointer"
                                    >
                                        {isSubmitting ? 'Processing...' : (isEditModalOpen ? 'Save Changes' : 'Confirm Creation')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {isDeleteModalOpen && (
                    <div className="fixed inset-0 bg-red-600/20 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white border-8 border-red-600 p-8 shadow-[15px_15px_0px_0px_rgba(220,38,38,1)] w-full max-w-md text-center"
                        >
                            <Trash className="h-16 w-16 mx-auto mb-4 text-red-600" strokeWidth={3} />
                            <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">Danger Zone</h2>
                            <p className="font-bold text-gray-600 mb-8 italic">
                                Are you sure you want to delete <span className="text-red-600 underline">&quot;{deletingClubName}&quot;</span>? This data will be purged.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="flex-1 border-4 border-black bg-white p-3 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                                >
                                    Abort
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 border-4 border-red-600 bg-red-600 text-white p-3 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Page