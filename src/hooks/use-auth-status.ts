
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AuthStatusProps {
  setSession: (session: any) => void;
  setUser: (user: any) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useAuthStatus = ({ setSession, setUser, setIsLoading }: AuthStatusProps) => {
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setIsLoading, setSession, setUser]);
};
