
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EssayData, EssayAnalysisResult } from "@/types/essay";

/**
 * Service for tracking essay analysis progress and providing feedback
 */
export class EssayProgressService {
  /**
   * Get weekly progress data for a user
   */
  static async getWeeklyProgress(): Promise<{ 
    week: number;
    count: number; 
    avgScore: number;
  }[]> {
    try {
      // Check if user is authenticated
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;
      
      if (!userId) {
        return [];
      }
      
      // Get weekly progress data by calculating the week from created_at
      const { data, error } = await supabase
        .from('essay_analyses')
        .select('created_at, overall_score')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching weekly progress:", error);
        throw error;
      }
      
      // Group by week and calculate statistics
      const weeklyData: Record<number, { 
        week: number, 
        count: number, 
        totalScore: number, 
        avgScore: number 
      }> = {};
      
      // Process each essay and group by week
      data.forEach(item => {
        const date = new Date(item.created_at);
        // Get ISO week number (1-53)
        const week = getWeekNumber(date);
        
        if (!weeklyData[week]) {
          weeklyData[week] = {
            week,
            count: 0,
            totalScore: 0,
            avgScore: 0
          };
        }
        
        weeklyData[week].count += 1;
        weeklyData[week].totalScore += item.overall_score || 0;
        weeklyData[week].avgScore = Math.round(weeklyData[week].totalScore / weeklyData[week].count);
      });
      
      return Object.values(weeklyData);
    } catch (error) {
      console.error("Error in getWeeklyProgress:", error);
      toast.error("Failed to fetch progress data");
      return [];
    }
  }

  /**
   * Get monthly progress data
   */
  static async getMonthlyProgress(): Promise<{
    month: number;
    count: number;
    avgScore: number;
  }[]> {
    try {
      // Check if user is authenticated
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;
      
      if (!userId) {
        return [];
      }
      
      // Get monthly progress data by extracting month from created_at
      const { data, error } = await supabase
        .from('essay_analyses')
        .select('created_at, overall_score')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching monthly progress:", error);
        throw error;
      }
      
      // Group by month and calculate statistics
      const monthlyData: Record<number, { 
        month: number, 
        count: number, 
        totalScore: number, 
        avgScore: number 
      }> = {};
      
      // Process each essay and group by month
      data.forEach(item => {
        const date = new Date(item.created_at);
        const month = date.getMonth() + 1; // JavaScript months are 0-indexed
        
        if (!monthlyData[month]) {
          monthlyData[month] = {
            month,
            count: 0,
            totalScore: 0,
            avgScore: 0
          };
        }
        
        monthlyData[month].count += 1;
        monthlyData[month].totalScore += item.overall_score || 0;
        monthlyData[month].avgScore = Math.round(monthlyData[month].totalScore / monthlyData[month].count);
      });
      
      return Object.values(monthlyData);
    } catch (error) {
      console.error("Error in getMonthlyProgress:", error);
      toast.error("Failed to fetch progress data");
      return [];
    }
  }

  /**
   * Get feedback based on user's recent essays
   */
  static async getWeeklyFeedback(): Promise<string> {
    try {
      // Check if user is authenticated
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;
      
      if (!userId) {
        return "Please sign in to get personalized feedback.";
      }
      
      // Get recent essays (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data, error } = await supabase
        .from('essay_analyses')
        .select('analysis_result, overall_score')
        .eq('user_id', userId)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching essay data for feedback:", error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        return "No recent essays found. Submit more essays to receive personalized feedback.";
      }
      
      // Generate feedback based on recent essay data
      const averageScore = data.reduce((sum, essay) => sum + (essay.overall_score || 0), 0) / data.length;
      
      // Collect common feedback points
      const feedbackPoints: Record<string, number> = {};
      data.forEach(essay => {
        // Type cast analysis_result to EssayAnalysisResult
        const analysis = essay.analysis_result as unknown as EssayAnalysisResult;
        
        // Structure feedback
        if (analysis && analysis.structure && analysis.structure.feedback) {
          const key = analysis.structure.feedback.substring(0, 50);
          feedbackPoints[key] = (feedbackPoints[key] || 0) + 1;
        }
        
        // Style suggestions
        if (analysis && analysis.style && analysis.style.suggestions) {
          analysis.style.suggestions.forEach((suggestion: string) => {
            const key = suggestion.substring(0, 50);
            feedbackPoints[key] = (feedbackPoints[key] || 0) + 1;
          });
        }
        
        // Thesis feedback
        if (analysis && analysis.thesis && analysis.thesis.feedback) {
          const key = analysis.thesis.feedback.substring(0, 50);
          feedbackPoints[key] = (feedbackPoints[key] || 0) + 1;
        }
      });
      
      // Get the most common feedback points (top 3)
      const sortedFeedback = Object.entries(feedbackPoints)
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, 3);
      
      // Generate feedback message
      let feedbackMessage = `Based on your ${data.length} recent essays (average score: ${Math.round(averageScore)}/100), here are some key areas to focus on:\n\n`;
      
      if (sortedFeedback.length > 0) {
        sortedFeedback.forEach(([feedback], index) => {
          feedbackMessage += `${index + 1}. ${feedback}...\n`;
        });
      } else {
        feedbackMessage += "Your essays show consistent quality. Continue practicing to further improve your writing skills.";
      }
      
      return feedbackMessage;
    } catch (error) {
      console.error("Error in getWeeklyFeedback:", error);
      return "Unable to generate feedback at this time. Please try again later.";
    }
  }

  /**
   * Set up a realtime subscription for live tracking
   */
  static setupRealtimeTracking(callback: (data: any) => void): (() => void) {
    const channel = supabase
      .channel('essay_analyses_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'essay_analyses',
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();
      
    // Return cleanup function
    return () => {
      supabase.removeChannel(channel);
    };
  }
}

/**
 * Helper function to get ISO week number from date
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
