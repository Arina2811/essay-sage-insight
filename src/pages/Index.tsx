
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, BarChart2, History, Settings, CheckCircle, Brain, Zap } from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: Brain,
      title: "AI Writing Analysis",
      description: "Get comprehensive feedback on style, structure, and coherence",
      path: "/analysis"
    },
    {
      icon: CheckCircle,
      title: "Grammar & Style Check",
      description: "Advanced grammar correction and style improvement suggestions",
      path: "/analysis"
    },
    {
      icon: Zap,
      title: "Plagiarism Detection",
      description: "Compare your text against millions of sources in real-time",
      path: "/analysis"
    },
    {
      icon: BarChart2,
      title: "Analytics Dashboard",
      description: "Track improvements and writing patterns over time",
      path: "/dashboard"
    },
    {
      icon: History,
      title: "Writing History",
      description: "Access past analyses and track your progress journey",
      path: "/history"
    },
    {
      icon: Settings,
      title: "Custom Settings",
      description: "Personalize analysis preferences and writing goals",
      path: "/settings"
    }
  ];

  return (
    <div className="min-h-screen">
      <div className="hero-gradient">
        <div className="container mx-auto flex flex-col items-center justify-center min-h-[80vh] section-padding">
          <div className="text-center max-w-3xl mx-auto space-y-6 fade-in">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight gradient-text">
              WriteRight
            </h1>
            <p className="text-xl text-muted-foreground">
              Transform your writing with advanced analysis, 
              grammar correction, and plagiarism detection
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-8">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                <Link to="/analysis">Start Writing</Link>
              </Button>
              <Button variant="outline" asChild size="lg" className="border-primary/20 hover:bg-primary/10">
                <Link to="/dashboard">View Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto slide-in">
          {features.map((feature) => (
            <Link 
              key={feature.title} 
              to={feature.path}
              className="group p-6 rounded-lg glass hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex items-start space-x-4">
                <feature.icon className="h-6 w-6 text-primary shrink-0" />
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

      <div className="container mx-auto section-padding">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold gradient-text">
            Why Choose WriteRight?
          </h2>
          <p className="text-muted-foreground">
            Our advanced technology analyzes your writing from every angle, 
            providing comprehensive feedback on grammar, style, coherence, and originality. 
            Perfect for students, professionals, and anyone looking to elevate their writing.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
