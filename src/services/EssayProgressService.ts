
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
      
      // Get weekly progress data
      const { data, error } = await supabase
        .from('essay_analyses')
        .select('week_number, overall_score')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching weekly progress:", error);
        throw error;
      }
      
      // Group by week and calculate statistics
      const weeklyData = data.reduce((acc, item) => {
        const week = item.week_number;
        if (!acc[week]) {
          acc[week] = {
            week,
            count: 0,
            totalScore: 0,
            avgScore: 0
          };
        }
        
        acc[week].count += 1;
        acc[week].totalScore += item.overall_score;
        acc[week].avgScore = Math.round(acc[week].totalScore / acc[week].count);
        
        return acc;
      }, {});
      
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
      
      // Get monthly progress data
      const { data, error } = await supabase
        .from('essay_analyses')
        .select('month_number, overall_score')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching monthly progress:", error);
        throw error;
      }
      
      // Group by month and calculate statistics
      const monthlyData = data.reduce((acc, item) => {
        const month = item.month_number;
        if (!acc[month]) {
          acc[month] = {
            month,
            count: 0,
            totalScore: 0,
            avgScore: 0
          };
        }
        
        acc[month].count += 1;
        acc[month].totalScore += item.overall_score;
        acc[month].avgScore = Math.round(acc[month].totalScore / acc[month].count);
        
        return acc;
      }, {});
      
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
      const averageScore = data.reduce((sum, essay) => sum + essay.overall_score, 0) / data.length;
      
      // Collect common feedback points
      const feedbackPoints: Record<string, number> = {};
      data.forEach(essay => {
        const analysis = essay.analysis_result;
        
        // Structure feedback
        if (analysis.structure && analysis.structure.feedback) {
          const key = analysis.structure.feedback.substring(0, 50);
          feedbackPoints[key] = (feedbackPoints[key] || 0) + 1;
        }
        
        // Style suggestions
        if (analysis.style && analysis.style.suggestions) {
          analysis.style.suggestions.forEach((suggestion: string) => {
            const key = suggestion.substring(0, 50);
            feedbackPoints[key] = (feedbackPoints[key] || 0) + 1;
          });
        }
        
        // Thesis feedback
        if (analysis.thesis && analysis.thesis.feedback) {
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
