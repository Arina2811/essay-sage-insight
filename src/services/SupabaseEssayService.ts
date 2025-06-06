
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EssayData, EssayAnalysisResult } from "@/types/essay";
import { Database } from "@/integrations/supabase/types";

/**
 * Service for handling essay data with Supabase backend integration
 */
export class SupabaseEssayService {
  /**
   * Save essay to Supabase
   */
  static async saveEssay(essayData: EssayData): Promise<{ id: string }> {
    try {
      // Check if user is authenticated
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;
      
      if (!userId) {
        // If not authenticated, fall back to local storage
        console.log("User not authenticated, falling back to local storage");
        const essayId = `essay-${Date.now()}`;
        
        // Save to local storage
        const localEssays = JSON.parse(localStorage.getItem('essays') || '[]');
        localEssays.push({
          id: essayId,
          ...essayData,
          created_at: new Date().toISOString()
        });
        localStorage.setItem('essays', JSON.stringify(localEssays));
        
        return { id: essayId };
      }
      
      // Insert essay into Supabase with proper typing
      const insertData: Database['public']['Tables']['essay_analyses']['Insert'] = {
        title: essayData.title,
        content: essayData.content,
        analysis_result: essayData.analysis as any, // Type casting to avoid TypeScript errors
        overall_score: essayData.analysis?.score || 0,
        user_id: userId
      };
      
      const { data, error } = await supabase
        .from('essay_analyses')
        .insert(insertData)
        .select('id')
        .single();
        
      if (error) {
        console.error("Error saving essay to Supabase:", error);
        throw error;
      }
      
      if (!data) {
        throw new Error("Failed to save essay: No data returned");
      }
      
      console.log("Essay saved to Supabase with ID:", data.id);
      return { id: data.id };
    } catch (error) {
      console.error("Error in saveEssay:", error);
      toast.error("Failed to save essay. Please try again later.");
      
      // Return temporary ID in case of error
      return { id: `temp-essay-${Date.now()}` };
    }
  }

  /**
   * Get all essays for the current user
   */
  static async getEssays(): Promise<EssayData[]> {
    try {
      // Check if user is authenticated
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;
      
      if (!userId) {
        // If not authenticated, get from local storage
        const localEssays = JSON.parse(localStorage.getItem('essays') || '[]');
        return localEssays;
      }
      
      // Get essays from Supabase with proper error handling
      const { data, error } = await supabase
        .from('essay_analyses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching essays from Supabase:", error);
        throw error;
      }
      
      if (!data) {
        return [];
      }
      
      // Convert to EssayData format with safe type handling
      return data.map(item => ({
        id: item.id,
        title: item.title || "",
        content: item.content || "",
        analysis: item.analysis_result as unknown as EssayAnalysisResult,
        created_at: item.created_at
      }));
    } catch (error) {
      console.error("Error in getEssays:", error);
      toast.error("Failed to fetch essays. Please try again later.");
      return [];
    }
  }

  /**
   * Get a single essay by ID
   */
  static async getEssayById(id: string): Promise<EssayData | null> {
    try {
      // Check if user is authenticated
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;
      
      if (!userId) {
        // If not authenticated, get from local storage
        const localEssays = JSON.parse(localStorage.getItem('essays') || '[]');
        const essay = localEssays.find((e: EssayData) => e.id === id);
        return essay || null;
      }
      
      // Get essay from Supabase with proper type handling
      const { data, error } = await supabase
        .from('essay_analyses')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .maybeSingle();
        
      if (error) {
        console.error("Error fetching essay from Supabase:", error);
        throw error;
      }
      
      if (!data) return null;
      
      // Convert to EssayData format with safe type handling
      return {
        id: data.id,
        title: data.title || "",
        content: data.content || "",
        analysis: data.analysis_result as unknown as EssayAnalysisResult,
        created_at: data.created_at
      };
    } catch (error) {
      console.error("Error in getEssayById:", error);
      toast.error("Failed to fetch essay. Please try again later.");
      return null;
    }
  }
}
