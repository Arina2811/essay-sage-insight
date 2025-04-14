
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar, Cell, Legend
} from "recharts";
import { Card } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Loader2 } from "lucide-react";

interface ProgressData {
  date: string;
  score: number;
}

interface CategoryScore {
  name: string;
  score: number;
}

interface ProgressChartsProps {
  progressData: ProgressData[];
  categoryScores: CategoryScore[];
  isLoadingWeekly: boolean;
  colors: string[];
}

const ProgressCharts = ({ 
  progressData, 
  categoryScores, 
  isLoadingWeekly,
  colors 
}: ProgressChartsProps) => {
  return (
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
                <ChartTooltip content={<ChartTooltipContent />} />
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
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="score" fill="hsl(var(--primary))">
                {categoryScores.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
      </Card>
    </div>
  );
};

export default ProgressCharts;
