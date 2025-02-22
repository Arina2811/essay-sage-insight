
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const History = () => {
  // Placeholder data for demonstration
  const essays = [
    {
      id: 1,
      title: "The Impact of Technology",
      date: "Mar 15, 2024",
      score: 82,
      wordCount: 1250,
    },
    {
      id: 2,
      title: "Climate Change Solutions",
      date: "Mar 10, 2024",
      score: 78,
      wordCount: 1500,
    },
    {
      id: 3,
      title: "Education in 2024",
      date: "Mar 5, 2024",
      score: 75,
      wordCount: 1100,
    },
  ];

  return (
    <div className="container mx-auto section-padding">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Essay History</h1>
          <p className="text-muted-foreground mt-2">
            Review your past essays and track your improvements
          </p>
        </div>

        <div className="space-y-4">
          {essays.map((essay) => (
            <Card key={essay.id} className="p-6 glass hover:bg-primary/5 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{essay.title}</h3>
                  <div className="text-sm text-muted-foreground mt-1">
                    {essay.date} • {essay.wordCount} words
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Score</div>
                    <div className="font-semibold">{essay.score}/100</div>
                  </div>
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default History;
