
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, BarChart2, History, CheckCircle, Brain, Target, Sparkles, Search } from "lucide-react";
import { useState, useEffect } from "react";

const Index = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedFeatureIndex, setAnimatedFeatureIndex] = useState(-1);

  useEffect(() => {
    setIsVisible(true);
    
    const interval = setInterval(() => {
      setAnimatedFeatureIndex((prev) => (prev + 1) % features.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

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
      icon: Search,
      title: "Plagiarism Detection",
      description: "Check your essay against millions of sources for originality",
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
      <div className="hero-background min-h-[90vh] flex items-center justify-center">
        <div className="container mx-auto flex flex-col items-center justify-center hero-content section-padding">
          <div className={`text-center max-w-3xl mx-auto space-y-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="mb-8 animate-float">
              <FileText size={64} className="mx-auto text-primary opacity-90" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight gradient-text text-glow">
              WriteRight
            </h1>
            <p className="text-xl text-gray-800">
              Advanced Essay Evaluation System
            </p>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Get instant, comprehensive feedback on your essays with our 
              intelligent detection and evaluation system that helps you achieve academic excellence
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-8">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all">
                <Link to="/analysis">Evaluate Essay</Link>
              </Button>
              <Button variant="outline" asChild size="lg" className="bg-white/80 border-gray-300 text-gray-800 hover:bg-gray-100">
                <Link to="/dashboard">View Progress</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto section-padding">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold gradient-text mb-4">Essay Analysis Features</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Our intelligent system provides comprehensive analysis to improve your academic writing</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Link 
              key={feature.title} 
              to={feature.path}
              className={`group p-6 rounded-lg glass feature-card ${index === animatedFeatureIndex ? 'ring-2 ring-primary/50 shadow-lg shadow-primary/20' : ''}`}
            >
              <div className="flex items-start space-x-4">
                <feature.icon className={`h-8 w-8 text-primary shrink-0 ${index === animatedFeatureIndex ? 'animate-pulse' : ''}`} />
                <div>
                  <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-700 mt-2">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="container mx-auto section-padding bg-gradient-to-r from-slate-900/50 to-purple-900/40 rounded-xl p-10 mb-16">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Elevate Your Academic Writing
          </h2>
          <p className="text-white text-opacity-90">
            Our intelligent essay evaluation system provides detailed feedback on structure,
            argumentation, citations, and academic style. Perfect for students, researchers,
            and academic professionals aiming for excellence in their writing.
          </p>
          <Button asChild size="lg" className="mt-4 bg-white text-primary hover:bg-white/90">
            <Link to="/analysis">Try It Now</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
