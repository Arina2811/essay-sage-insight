
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, BarChart2, History, Settings } from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: FileText,
      title: "Essay Analysis",
      description: "Get instant feedback on your essays with AI-powered analysis",
      path: "/analysis"
    },
    {
      icon: BarChart2,
      title: "Dashboard",
      description: "Track your progress and visualize improvements over time",
      path: "/dashboard"
    },
    {
      icon: History,
      title: "History",
      description: "Review past analyses and track your writing journey",
      path: "/history"
    },
    {
      icon: Settings,
      title: "Settings",
      description: "Customize your analysis preferences and experience",
      path: "/settings"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center section-padding">
      <div className="text-center max-w-3xl mx-auto space-y-6 fade-in">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          AI Essay Insight
        </h1>
        <p className="text-lg text-muted-foreground">
          Elevate your writing with advanced AI-powered essay analysis and feedback
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Button asChild size="lg">
            <Link to="/analysis">Start Analysis</Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link to="/dashboard">View Dashboard</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mt-16 slide-in">
        {features.map((feature) => (
          <Link 
            key={feature.title} 
            to={feature.path}
            className="group p-6 rounded-lg glass hover:bg-primary/5 transition-all duration-300"
          >
            <div className="flex items-start space-x-4">
              <feature.icon className="h-6 w-6 text-primary" />
              <div>
                <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground mt-2">
                  {feature.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Index;
