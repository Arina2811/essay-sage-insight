
import { useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  bypassAuth: boolean;
}

export interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, metadata?: { [key: string]: any }) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  setBypassAuth: (bypass: boolean) => void;
}

export const useAuthState = (): AuthState & AuthActions => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bypassAuth, setBypassAuth] = useState(true); // Default to true to bypass auth
  const { toast } = useToast();

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      toast({
        title: "Sign in successful",
        description: "Welcome back!",
      });
    } catch (error: any) {
      console.error("Sign in error:", error.message);
      let errorMessage = error.message;
      
      // Provide more user-friendly error messages for common issues
      if (errorMessage.includes('captcha verification') || errorMessage.includes('captcha_token')) {
        errorMessage = "Authentication failed. The captcha verification system is currently disabled for development. Please try again or use the bypass option.";
      }
      
      toast({
        title: "Sign in failed",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Google sign in error:", error.message);
      toast({
        title: "Google sign in failed",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, metadata?: { [key: string]: any }) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/dashboard`
        },
      });
      if (error) throw error;
      
      toast({
        title: "Registration successful",
        description: "Please check your email to confirm your account."
      });
    } catch (error: any) {
      console.error("Sign up error:", error.message);
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      console.error("Sign out error:", error.message);
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      
      toast({
        title: "Password reset email sent",
        description: "Please check your inbox for the password reset link."
      });
    } catch (error: any) {
      console.error("Reset password error:", error.message);
      toast({
        title: "Reset password failed",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });
      if (error) throw error;
      
      toast({
        title: "Password updated successfully",
        description: "Your password has been changed."
      });
    } catch (error: any) {
      console.error("Update password error:", error.message);
      toast({
        title: "Update password failed",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    session,
    user,
    isLoading,
    bypassAuth,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    setBypassAuth,
  };
};
