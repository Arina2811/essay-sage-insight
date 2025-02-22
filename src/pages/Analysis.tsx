
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const Analysis = () => {
  const [essay, setEssay] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleAnalysis = async () => {
    if (!essay.trim()) {
      toast({
        title: "Essay Required",
        description: "Please enter your essay text to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    // Temporary timeout to simulate analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      toast({
        title: "Analysis Complete",
        description: "Your essay has been analyzed successfully!",
      });
    }, 2000);
  };

  return (
    <div className="container mx-auto section-padding">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Essay Analysis</h1>
          <p className="text-muted-foreground">
            Submit your essay below for instant AI-powered analysis and feedback
          </p>
        </div>

        <Card className="p-6 glass">
          <Textarea
            placeholder="Paste or type your essay here..."
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            className="min-h-[300px] mb-4"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleAnalysis}
              disabled={isAnalyzing}
              size="lg"
              className="w-full sm:w-auto"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Essay"
              )}
            </Button>
          </div>
        </Card>

        {/* Placeholder for analysis results */}
        <div className="space-y-6">
          {/* Results will be displayed here */}
        </div>
      </div>
    </div>
  );
};

export default Analysis;
