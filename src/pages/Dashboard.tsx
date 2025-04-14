import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend, RadarChart, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EssayProgressService } from "@/services/EssayProgressService";
import { SupabaseEssayService } from "@/services/SupabaseEssayService";
import { toast } from "sonner";
import { Loader2, BookOpen, Brain, Target, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const Dashboard = () => {
  const [weeklyFeedback, setWeeklyFeedback] = useState("Loading your personalized feedback...");

  const { 
    data: weeklyProgressData = [], 
    isLoading: isLoadingWeekly 
  } = useQuery({
    queryKey: ['weeklyProgress'],
    queryFn: EssayProgressService.getWeeklyProgress,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  const { 
    data: monthlyProgressData = [], 
    isLoading: isLoadingMonthly 
  } = useQuery({
    queryKey: ['monthlyProgress'],
    queryFn: EssayProgressService.getMonthlyProgress,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  const { 
    data: recentEssays = [], 
    isLoading: isLoadingEssays 
  } = useQuery({
    queryKey: ['recentEssays'],
    queryFn: SupabaseEssayService.getEssays,
    staleTime: 5 * 60 * 1000 // 5 minutes
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

  const pieData = [
    { name: "Strong Points", value: 65 },
    { name: "Areas to Improve", value: 35 },
  ];

  const COLORS = ["#4f46e5", "#f97316", "#06b6d4", "#10b981", "#8b5cf6"];
  const PIE_COLORS = ["#10b981", "#f97316"];

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

  const aiDetectionScore = recentEssays[0]?.analysis?.aiDetection?.score || 0;
  const readabilityScore = recentEssays[0]?.analysis?.readability?.score || 0;
  const creativityScore = recentEssays[0]?.analysis?.creativity?.score || 0;
  const plagiarismScore = 100 - (recentEssays[0]?.analysis?.plagiarism?.score || 0);

  const advancedStats = [
    { 
      label: "AI Detection Score", 
      value: `${aiDetectionScore}%`,
      icon: <Brain className="h-5 w-5 text-purple-500" />
    },
    { 
      label: "Readability Grade", 
      value: recentEssays[0]?.analysis?.readability?.gradeLevel || "N/A",
      icon: <BookOpen className="h-5 w-5 text-blue-500" />
    },
    { 
      label: "Creativity Index", 
      value: `${creativityScore}%`,
      icon: <Target className="h-5 w-5 text-green-500" />
    },
    { 
      label: "Originality Score", 
      value: `${plagiarismScore}%`,
      icon: <CheckCircle2 className="h-5 w-5 text-amber-500" />
    }
  ];

  const competencyData = [
    { subject: 'Structure', A: latestEssay?.analysis?.structure?.score || 0 },
    { subject: 'Style', A: latestEssay?.analysis?.style?.score || 0 },
    { subject: 'Thesis', A: latestEssay?.analysis?.thesis?.score || 0 },
    { subject: 'Citations', A: latestEssay?.analysis?.citations?.count > 0 ? 70 : 30 },
    { subject: 'Creativity', A: latestEssay?.analysis?.creativity?.score || 0 },
    { subject: 'Readability', A: latestEssay?.analysis?.readability?.score || 0 }
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
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Track your writing progress and performance metrics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="p-6 glass text-center">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold mt-2">{stat.value}</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 glass">
            <h2 className="text-lg font-semibold mb-4">Writing Progress</h2>
            {isLoadingWeekly ? (
              <div className="h-[300px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : progressData.length > 0 ? (
              <div className="h-[300px]">
                <ChartContainer
                  config={{
                    score: { color: "hsl(var(--primary))" },
                    grid: { color: "hsl(var(--border))" }
                  }}
                >
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ChartContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No progress data available yet. Submit more essays to see your progress.
              </div>
            )}
          </Card>

          <Card className="p-6 glass">
            <h2 className="text-lg font-semibold mb-4">Essay Component Analysis</h2>
            <div className="h-[300px]">
              <ChartContainer
                config={{
                  score: { color: "hsl(var(--primary))" },
                  grid: { color: "hsl(var(--border))" }
                }}
              >
                <BarChart data={categoryScores}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                  />
                  <Bar dataKey="score" fill="hsl(var(--primary))">
                    {categoryScores.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6 glass col-span-1">
            <h2 className="text-lg font-semibold mb-4">Essay Strength Analysis</h2>
            <div className="h-[250px]">
              <ChartContainer
                config={{
                  score: { color: "hsl(var(--primary))" },
                  grid: { color: "hsl(var(--border))" }
                }}
              >
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                </PieChart>
              </ChartContainer>
            </div>
          </Card>

          <Card className="p-6 glass col-span-2">
            <h2 className="text-lg font-semibold mb-4">Writing Skills Progress</h2>
            <div className="space-y-5">
              {skills.map((skill) => (
                <div key={skill.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{skill.name}</span>
                    <span className="font-medium">{skill.progress}%</span>
                  </div>
                  <Progress value={skill.progress} className="h-2" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {advancedStats.map((stat) => (
            <Card key={stat.label} className="p-6 glass">
              <div className="flex items-center gap-3">
                {stat.icon}
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6 glass">
          <h2 className="text-lg font-semibold mb-4">Writing Competencies Overview</h2>
          <div className="h-[400px]">
            <ChartContainer
              config={{
                score: { color: "hsl(var(--primary))" },
                grid: { color: "hsl(var(--border))" }
              }}
            >
              <RadarChart data={competencyData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar
                  name="Score"
                  dataKey="A"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
              </RadarChart>
            </ChartContainer>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 glass">
            <h2 className="text-lg font-semibold mb-4">AI Detection Analysis</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>AI Probability</span>
                <span className="font-medium">{aiDetectionScore}%</span>
              </div>
              <Progress value={aiDetectionScore} className="h-2" />
              {latestEssay?.analysis?.aiDetection?.feedback && (
                <p className="text-sm text-muted-foreground mt-2">
                  {latestEssay.analysis.aiDetection.feedback}
                </p>
              )}
            </div>
          </Card>

          <Card className="p-6 glass">
            <h2 className="text-lg font-semibold mb-4">Originality Check</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Original Content</span>
                <span className="font-medium">{plagiarismScore}%</span>
              </div>
              <Progress value={plagiarismScore} className="h-2" />
              {latestEssay?.analysis?.plagiarism?.passages?.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">
                    {latestEssay.analysis.plagiarism.passages.length} potential matches found
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        <Card className="p-6 glass">
          <h2 className="text-lg font-semibold mb-4">Weekly Feedback</h2>
          <div className="p-4 bg-muted/50 rounded-md whitespace-pre-line">
            {weeklyFeedback}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
