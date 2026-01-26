"use client";

import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext<{ user: User | null; loading: boolean }>({
  user: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const response = await fetch("/api/auth/check-role", { 
            cache: "no-store",
            headers: { "Pragma": "no-cache" }
          });

          if (response.ok) {
            setUser(firebaseUser);
          } else {
            console.log("Session out of sync. Attempting auto-repair...");
            
            const idToken = await firebaseUser.getIdToken(true);
            
            const sessionRes = await fetch("/api/auth/session", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ idToken }),
            });

            if (sessionRes.ok) {
              console.log("Session repaired.");
              setUser(firebaseUser);
              router.refresh();
            } else {
              console.error("Session repair failed. Signing out.");
              await signOut(auth);
              setUser(null);
            }
          }
        } catch (error) {
          console.error("Auth check error:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}