"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
      } else {
        setReady(true);
      }
    }
  }, [loading, user, router]);

  if (loading || !ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-black">
        Verificando sesión...
      </div>
    );
  }

  return children;
}
