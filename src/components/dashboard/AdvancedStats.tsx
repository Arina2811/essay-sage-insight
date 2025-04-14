
import { Card } from "@/components/ui/card";
import { Brain, BookOpen, Target, CheckCircle2 } from "lucide-react";

interface AdvancedStat {
  label: string;
  value: string;
  icon: React.ReactNode;
}

interface AdvancedStatsProps {
  stats: AdvancedStat[];
}

const AdvancedStats = ({ stats }: AdvancedStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
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
  );
};

export default AdvancedStats;
