
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AuthService } from '@/services/AuthService';

// List of admin emails
const ADMIN_EMAILS = ['admin@writeright.app', 'admin@example.com'];

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: { [key: string]: any }) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  bypassAuth: boolean;
  setBypassAuth: (bypass: boolean) => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bypassAuth, setBypassAuth] = useState(true); // Default to true to bypass auth
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Check if user is an admin
        if (session?.user) {
          const userIsAdmin = ADMIN_EMAILS.includes(session.user.email || '');
          setIsAdmin(userIsAdmin);
        } else {
          setIsAdmin(false);
        }
        
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Check if user is an admin
      if (session?.user) {
        const userIsAdmin = ADMIN_EMAILS.includes(session.user.email || '');
        setIsAdmin(userIsAdmin);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { success, error } = await AuthService.signIn(email, password);
      
      if (!success && error) {
        toast({
          title: "Sign in failed",
          description: error,
          variant: "destructive"
        });
        throw new Error(error);
      }
      
      toast({
        title: "Sign in successful",
        description: "Welcome back!",
      });
    } catch (error: any) {
      console.error("Sign in error:", error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata?: { [key: string]: any }) => {
    try {
      const { success, error } = await AuthService.signUp(email, password, metadata);
      
      if (!success && error) {
        toast({
          title: "Sign up failed",
          description: error,
          variant: "destructive"
        });
        throw new Error(error);
      }
      
      toast({
        title: "Registration successful",
        description: "Please check your email to confirm your account."
      });
    } catch (error: any) {
      console.error("Sign up error:", error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { success, error } = await AuthService.signOut();
      
      if (!success && error) {
        toast({
          title: "Sign out failed",
          description: error,
          variant: "destructive"
        });
        throw new Error(error);
      }
    } catch (error: any) {
      console.error("Sign out error:", error.message);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { success, error } = await AuthService.resetPassword(email);
      
      if (!success && error) {
        toast({
          title: "Reset password failed",
          description: error,
          variant: "destructive"
        });
        throw new Error(error);
      }
      
      toast({
        title: "Password reset email sent",
        description: "Please check your inbox for the password reset link."
      });
    } catch (error: any) {
      console.error("Reset password error:", error.message);
      throw error;
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { success, error } = await AuthService.updatePassword(password);
      
      if (!success && error) {
        toast({
          title: "Update password failed",
          description: error,
          variant: "destructive"
        });
        throw new Error(error);
      }
      
      toast({
        title: "Password updated successfully",
        description: "Your password has been changed."
      });
    } catch (error: any) {
      console.error("Update password error:", error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isLoading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
        bypassAuth,
        setBypassAuth,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
