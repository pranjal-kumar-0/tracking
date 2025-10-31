"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Settings, LogOut } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { User } from "firebase/auth";

interface DashboardNavbarProps {
  user: User | null;
}

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ user }) => {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="fixed top-0 left-0 z-50 flex w-full items-center justify-between p-4 md:p-8 bg-white border-b border-gray-200">
      <Link href="/">
        <h1 className="text-2xl font-bold tracking-tighter">
          Club<span className="text-indigo-600">Sync</span>
        </h1>
      </Link>
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 rounded-full border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <Image
            src={user?.photoURL || 'https://avatar.iran.liara.run/public'}
            alt="Profile"
            width={24}
            height={24}
            className="w-6 h-6 rounded-full"
          />
          <span>{user?.displayName}</span>
        </motion.button>
        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[200px]"
            >
              <div className="flex items-center gap-3 mb-3">
                <Image
                  src={user?.photoURL || 'https://avatar.iran.liara.run/public'}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <p className="font-medium text-sm">{user?.displayName}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              <button
                className="flex items-center gap-2 w-full text-left py-2 px-4 hover:bg-gray-100 rounded"
                onClick={() => {
                  console.log("Settings clicked");
                  setIsDropdownOpen(false);
                }}
              >
                <Settings size={16} />
                Settings
              </button>
              <button
                className="flex items-center gap-2 w-full text-left py-2 px-4 hover:bg-gray-100 rounded text-red-600"
                onClick={() => {
                  handleLogout();
                  setIsDropdownOpen(false);
                }}
              >
                <LogOut size={16} />
                Logout
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default DashboardNavbar;