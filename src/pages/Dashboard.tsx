
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  // Placeholder data for demonstration
  const data = [
    { date: "Jan 1", score: 65 },
    { date: "Jan 15", score: 70 },
    { date: "Feb 1", score: 75 },
    { date: "Feb 15", score: 72 },
    { date: "Mar 1", score: 78 },
    { date: "Mar 15", score: 82 },
  ];

  const stats = [
    { label: "Essays Analyzed", value: "12" },
    { label: "Average Score", value: "78/100" },
    { label: "Improvement", value: "+15%" },
    { label: "Writing Time", value: "4.2 hrs" },
  ];

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

        <Card className="p-6 glass">
          <h2 className="text-lg font-semibold mb-4">Writing Progress</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
