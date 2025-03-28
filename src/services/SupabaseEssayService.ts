
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EssayData, EssayAnalysisResult } from "@/types/essay";

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
      
      // Insert essay into Supabase
      const { data, error } = await supabase
        .from('essays')
        .insert({
          user_id: userId,
          title: essayData.title,
          content: essayData.content,
          analysis: essayData.analysis
        })
        .select('id')
        .single();
        
      if (error) {
        console.error("Error saving essay to Supabase:", error);
        throw error;
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
      
      // Get essays from Supabase
      const { data, error } = await supabase
        .from('essays')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching essays from Supabase:", error);
        throw error;
      }
      
      // Convert to EssayData format
      return data.map(item => ({
        id: item.id,
        title: item.title,
        content: item.content,
        analysis: item.analysis,
        created_at: item.created_at
      }));
    } catch (error) {
      console.error("Error in getEssays:", error);
      toast.error("Failed to fetch essays. Please try again later.");
      return [];
    }
  }
}
