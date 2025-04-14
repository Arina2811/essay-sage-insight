
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Brain, BookOpen, Target, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { EssayProgressService } from "@/services/EssayProgressService";
import { SupabaseEssayService } from "@/services/SupabaseEssayService";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsGrid from "@/components/dashboard/StatsGrid";
import ProgressCharts from "@/components/dashboard/ProgressCharts";
import SkillsProgress from "@/components/dashboard/SkillsProgress";
import AdvancedStats from "@/components/dashboard/AdvancedStats";
import WeeklyFeedback from "@/components/dashboard/WeeklyFeedback";

const COLORS = ["#4f46e5", "#f97316", "#06b6d4", "#10b981", "#8b5cf6"];

const Dashboard = () => {
  const [weeklyFeedback, setWeeklyFeedback] = useState("Loading your personalized feedback...");

  const { 
    data: weeklyProgressData = [], 
    isLoading: isLoadingWeekly 
  } = useQuery({
    queryKey: ['weeklyProgress'],
    queryFn: EssayProgressService.getWeeklyProgress,
    staleTime: 5 * 60 * 1000
  });

  const { 
    data: recentEssays = [], 
    isLoading: isLoadingEssays 
  } = useQuery({
    queryKey: ['recentEssays'],
    queryFn: SupabaseEssayService.getEssays,
    staleTime: 5 * 60 * 1000
  });

  const progressData = weeklyProgressData.map(item => ({
    date: `Week ${item.week}`,
    score: item.avgScore
  }));

  const categoryScores = [
    { name: "Structure", score: 75 },
    { name: "Clarity", score: 82 },
    { name: "Arguments", score: 68 },
    { name: "Grammar", score: 90 },
    { name: "Citations", score: 65 },
  ];

  const latestEssay = recentEssays[0];
  const skills = latestEssay?.analysis ? [
    { name: "Structure", progress: latestEssay.analysis.structure.score },
    { name: "Style", progress: latestEssay.analysis.style.score },
    { name: "Thesis", progress: latestEssay.analysis.thesis.score },
    { name: "Citations", progress: latestEssay.analysis.citations.count > 0 ? 70 : 30 },
  ] : [
    { name: "Structure", progress: 75 },
    { name: "Clarity", progress: 82 },
    { name: "Citations", progress: 65 },
    { name: "Argumentation", progress: 68 },
  ];

  const essayCount = recentEssays.length;
  const averageScore = recentEssays.length > 0 
    ? Math.round(recentEssays.reduce((sum, essay) => sum + (essay.analysis?.score || 0), 0) / recentEssays.length) 
    : 0;

  const stats = [
    { label: "Essays Analyzed", value: essayCount.toString() },
    { label: "Average Score", value: `${averageScore}/100` },
    { label: "Latest Essay", value: recentEssays[0]?.created_at ? new Date(recentEssays[0].created_at).toLocaleDateString() : "N/A" },
    { label: "Weekly Progress", value: weeklyProgressData.length > 0 ? `${weeklyProgressData[0].count} essays` : "0 essays" },
  ];

  const advancedStats = [
    { 
      label: "AI Detection Score", 
      value: `${latestEssay?.analysis?.aiDetection?.score || 0}%`,
      icon: <Brain className="h-5 w-5 text-purple-500" />
    },
    { 
      label: "Readability Grade", 
      value: latestEssay?.analysis?.readability?.gradeLevel || "N/A",
      icon: <BookOpen className="h-5 w-5 text-blue-500" />
    },
    { 
      label: "Creativity Index", 
      value: `${latestEssay?.analysis?.creativity?.score || 0}%`,
      icon: <Target className="h-5 w-5 text-green-500" />
    },
    { 
      label: "Originality Score", 
      value: `${100 - (latestEssay?.analysis?.plagiarism?.score || 0)}%`,
      icon: <CheckCircle2 className="h-5 w-5 text-amber-500" />
    }
  ];

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const feedback = await EssayProgressService.getWeeklyFeedback();
        setWeeklyFeedback(feedback);
      } catch (error) {
        console.error("Error fetching weekly feedback:", error);
        setWeeklyFeedback("Unable to generate feedback at this time. Please try again later.");
      }
    };
    
    fetchFeedback();
  }, []);

  useEffect(() => {
    const cleanup = EssayProgressService.setupRealtimeTracking((payload) => {
      if (payload.eventType === 'INSERT') {
        toast.success("New essay analysis added!", {
          description: "Your dashboard has been updated with the latest data."
        });
      }
    });
    
    return cleanup;
  }, []);

  return (
    <div className="container mx-auto section-padding">
      <div className="max-w-6xl mx-auto space-y-8">
        <DashboardHeader />
        <StatsGrid stats={stats} />
        <ProgressCharts 
          progressData={progressData}
          categoryScores={categoryScores}
          isLoadingWeekly={isLoadingWeekly}
          colors={COLORS}
        />
        <SkillsProgress skills={skills} />
        <AdvancedStats stats={advancedStats} />
        <WeeklyFeedback feedback={weeklyFeedback} />
      </div>
    </div>
  );
};

export default Dashboard;
