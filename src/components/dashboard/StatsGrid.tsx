
import { Card } from "@/components/ui/card";

interface StatItem {
  label: string;
  value: string;
}

interface StatsGridProps {
  stats: StatItem[];
}

const StatsGrid = ({ stats }: StatsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-6 glass text-center">
          <p className="text-sm text-muted-foreground">{stat.label}</p>
          <p className="text-2xl font-bold mt-2">{stat.value}</p>
        </Card>
      ))}
    </div>
  );
};

export default StatsGrid;
