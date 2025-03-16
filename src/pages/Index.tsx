
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, BarChart2, History, Settings, CheckCircle, Brain, Target, Sparkles } from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: Target,
      title: "Smart Essay Analysis",
      description: "Get instant feedback on essay structure, argumentation, and clarity",
      path: "/analysis"
    },
    {
      icon: Sparkles,
      title: "Style Enhancement",
      description: "Receive suggestions to improve your academic writing style",
      path: "/analysis"
    },
    {
      icon: Brain,
      title: "Thesis Detection",
      description: "Automatically identify and evaluate your thesis statement",
      path: "/analysis"
    },
    {
      icon: CheckCircle,
      title: "Citation Checker",
      description: "Verify proper citation format and academic integrity",
      path: "/analysis"
    },
    {
      icon: BarChart2,
      title: "Progress Tracking",
      description: "Monitor your essay writing improvements over time",
      path: "/dashboard"
    },
    {
      icon: FileText,
      title: "Essay Library",
      description: "Access your past essays and their evaluations",
      path: "/history"
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
              Advanced Essay Evaluation System
            </p>
            <p className="text-lg text-muted-foreground">
              Get instant, comprehensive feedback on your essays with our 
              intelligent detection and evaluation system
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-8">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                <Link to="/analysis">Evaluate Essay</Link>
              </Button>
              <Button variant="outline" asChild size="lg" className="border-primary/20 hover:bg-primary/10">
                <Link to="/sign-up">Create Account</Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground pt-2">
              Already have an account?{" "}
              <Link to="/sign-in" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
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
            Elevate Your Academic Writing
          </h2>
          <p className="text-muted-foreground">
            Our intelligent essay evaluation system provides detailed feedback on structure,
            argumentation, citations, and academic style. Perfect for students, researchers,
            and academic professionals aiming for excellence in their writing.
          </p>
          
          <div className="pt-6">
            <Button asChild>
              <Link to="/sign-up">Get Started Today</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
