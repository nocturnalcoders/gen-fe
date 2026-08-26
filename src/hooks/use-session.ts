import { useEffect, useState } from "react";
import { api } from "@/api";
import type { Session } from "@/api/types";

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.auth.getSession().then((s) => {
      if (!mounted) return;
      setSession(s);
      setLoading(false);
    });
    const unsubscribe = api.auth.onAuthStateChange((s) => {
      setSession(s);
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return { session, user: session?.user ?? null, loading };
}
