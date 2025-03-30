
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export class AuthService {
  static async signIn(email: string, password: string) {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      return { success: true };
    } catch (error: any) {
      console.error("Sign in error:", error.message);
      let errorMessage = error.message;
      
      // Provide more user-friendly error messages for common issues
      if (errorMessage.includes('captcha verification') || errorMessage.includes('captcha_token')) {
        errorMessage = "Authentication failed. The captcha verification system is currently disabled for development. Please try again or use the bypass option.";
      }
      
      return { success: false, error: errorMessage };
    }
  }

  static async signInWithGoogle() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
      
      return { success: true };
    } catch (error: any) {
      console.error("Google sign in error:", error.message);
      return { success: false, error: error.message };
    }
  }

  static async signUp(email: string, password: string, metadata?: { [key: string]: any }) {
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
      
      return { success: true };
    } catch (error: any) {
      console.error("Sign up error:", error.message);
      return { success: false, error: error.message };
    }
  }

  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      return { success: true };
    } catch (error: any) {
      console.error("Sign out error:", error.message);
      return { success: false, error: error.message };
    }
  }

  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      
      return { success: true };
    } catch (error: any) {
      console.error("Reset password error:", error.message);
      return { success: false, error: error.message };
    }
  }

  static async updatePassword(password: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });
      if (error) throw error;
      
      return { success: true };
    } catch (error: any) {
      console.error("Update password error:", error.message);
      return { success: false, error: error.message };
    }
  }

  static async getSession() {
    return await supabase.auth.getSession();
  }
}
