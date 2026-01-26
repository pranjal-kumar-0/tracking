"use client";

import React, { useState, useEffect, use } from "react";
import { useAuth } from "../../../../../providers/AuthProvider";
import DashboardNavbar from "@/components/common/dashboard-navbar";
import { UserCircle, Briefcase, Plus, X, Edit, Trash2, Save, RotateCcw, ShieldAlert, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

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

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAuth();
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<string[]>([]);
  const [admins, setAdmins] = useState<string[]>([]);
  const [newDepartment, setNewDepartment] = useState('');
  const [newAdmin, setNewAdmin] = useState('');
  const [editingDept, setEditingDept] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const fetchClub = async (clubId: string) => {
    try {
      const response = await fetch(`/api/admin/clubs/get-my-club?clubId=${clubId}`);
      if (!response.ok) throw new Error('Failed to fetch club');
      const data: Club = await response.json();
      setClub(data);
      setDepartments(data.departments || []);
      setAdmins(data.adminIds || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchClub(id);
  }, [id]);

  const addDepartment = async () => {
    if (!newDepartment.trim() || departments.includes(newDepartment.trim())) return;
    try {
      const res = await fetch('/api/admin/departments/create-department', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clubId: club!.id, department: newDepartment.trim() })
      });
      if (res.ok) {
        setDepartments([...departments, newDepartment.trim()]);
        setNewDepartment('');
      }
    } catch (error) {
      alert('Error adding department');
    }
  };

  const removeDepartment = async (dep: string) => {
    if (!confirm(`Confirm Deletion: "${dep}"? members will be unassigned.`)) return;
    try {
      const res = await fetch('/api/admin/departments/delete-department', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clubId: club!.id, department: dep })
      });
      if (res.ok) setDepartments(departments.filter(d => d !== dep));
    } catch (e) {
      alert('Error deleting department');
    }
  };

  const saveEdit = async () => {
    if (!editName.trim() || editName.trim() === editingDept) {
      setEditingDept(null);
      return;
    }
    try {
      const res = await fetch('/api/admin/departments/update-department', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clubId: club!.id, oldDepartment: editingDept, newDepartment: editName.trim() })
      });
      if (res.ok) {
        setDepartments(departments.map(d => d === editingDept ? editName.trim() : d));
        setEditingDept(null);
      }
    } catch (e) {
      console.error('Error updating department', e);
    }
  };

  const addAdmin = async () => {
    if (!newAdmin.trim() || admins.includes(newAdmin.trim())) return;
    try {
      const res = await fetch('/api/admin/admins/add-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clubId: club!.id, email: newAdmin.trim() })
      });
      if (res.ok) {
        setAdmins([...admins, newAdmin.trim()]);
        setNewAdmin('');
      }
    } catch (error) {
      alert('Error adding admin');
    }
  };

  const removeAdmin = async (admin: string) => {
    if (!confirm(`Revoke admin access for ${admin}?`)) return;
    try {
      const res = await fetch('/api/admin/admins/delete-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clubId: club!.id, email: admin })
      });
      if (res.ok) setAdmins(admins.filter(a => a !== admin));
    } catch (error) {
      alert('Error removing admin');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <DashboardNavbar user={user} />
      <div className="flex items-center justify-center h-[60vh]">
        <div className="border-4 border-black p-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-black uppercase italic">
          Loading Config...
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-black pb-20">
      <DashboardNavbar user={user} />
      <main className="p-4 sm:p-8 md:p-12 max-w-5xl mx-auto">
        
        {/* Header Section with Back Button */}
        <header className="mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <Link href={`/dashboard/c/${id}`}>
              <button className="w-fit flex items-center gap-2 px-4 py-2 bg-white border-4 border-black font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer">
                <ArrowLeft size={16} /> Exit to Directory
              </button>
            </Link>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase italic leading-none mb-4">
            Control <span className="text-indigo-600">Panel</span>
          </h1>
          <div className="flex items-center gap-3">
            <div className="h-2 w-16 bg-black" />
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">
              {club?.name} — Operational Settings
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-12">
          
          {/* Departments - Indigo Theme */}
          <section className="border-4 border-black bg-white p-6 md:p-8 shadow-[10px_10px_0px_0px_rgba(79,70,229,1)]">
            <div className="flex items-center gap-3 mb-8 border-b-4 border-black pb-4">
              <Briefcase className="h-8 w-8 text-indigo-600" />
              <h2 className="text-3xl font-black uppercase italic tracking-tighter text-indigo-600">Departments</h2>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <input
                type="text"
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                className="flex-1 px-4 py-4 border-4 border-black font-bold uppercase text-sm bg-slate-50 focus:bg-white outline-none"
                placeholder="New Division Name"
              />
              <button
                onClick={addDepartment}
                className="px-8 py-4 bg-indigo-600 text-white border-4 border-black font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus size={20} /> Deploy
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {departments.map(dep => (
                <div key={dep} className="flex items-center justify-between border-4 border-black p-4 bg-slate-50 group hover:bg-white transition-colors">
                  {editingDept === dep ? (
                    <div className="flex w-full gap-2">
                      <input
                        autoFocus
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-2 py-1 border-2 border-black font-bold uppercase text-xs outline-none"
                      />
                      <button onClick={saveEdit} className="p-1 hover:text-green-600 transition-colors"><Save size={18}/></button>
                      <button onClick={() => setEditingDept(null)} className="p-1 hover:text-red-600 transition-colors"><RotateCcw size={18}/></button>
                    </div>
                  ) : (
                    <>
                      <span className="font-black uppercase text-sm tracking-tight">{dep}</span>
                      <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => {setEditingDept(dep); setEditName(dep);}} className="hover:text-indigo-600"><Edit size={16}/></button>
                        <button onClick={() => removeDepartment(dep)} className="hover:text-red-600"><Trash2 size={16}/></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Admins - Deep Red Theme */}
          <section className="border-4 border-red-950 bg-white p-6 md:p-8 shadow-[10px_10px_0px_0px_rgba(69,10,10,1)]">
            <div className="flex items-center gap-3 mb-8 border-b-4 border-red-950 pb-4">
              <ShieldAlert className="h-8 w-8 text-red-900" />
              <h2 className="text-3xl font-black uppercase italic tracking-tighter text-red-900">Privileged Access</h2>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <input
                type="email"
                value={newAdmin}
                onChange={(e) => setNewAdmin(e.target.value)}
                className="flex-1 px-4 py-4 border-4 border-red-950 font-bold uppercase text-sm bg-red-50/30 focus:bg-white outline-none"
                placeholder="Admin Email Address"
              />
              <button
                onClick={addAdmin}
                className="px-8 py-4 bg-red-950 text-white border-4 border-black font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus size={20} /> Authorize
              </button>
            </div>

            <div className="space-y-3">
              {admins.map(admin => (
                <div key={admin} className="flex items-center justify-between border-2 border-red-950 p-3 bg-red-50/50">
                  <span className="font-bold text-xs uppercase tracking-tighter text-red-950 truncate mr-4">{admin}</span>
                  <button
                    onClick={() => removeAdmin(admin)}
                    className="p-2 border-2 border-red-950 bg-white hover:bg-red-950 hover:text-white transition-all cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}