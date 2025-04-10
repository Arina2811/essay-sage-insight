
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  Loader2, 
  FileCheck, 
  AlertTriangle, 
  BrainCircuit, 
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { PlagiarismService, PlagiarismResult } from "@/services/PlagiarismService";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const PlagiarismChecker = () => {
  const [text, setText] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [checkProgress, setCheckProgress] = useState(0);
  const [result, setResult] = useState<PlagiarismResult | null>(null);
  const { toast } = useToast();

  const handleCheck = async () => {
    if (!text.trim()) {
      toast({
        title: "Text Required",
        description: "Please enter text to check for plagiarism.",
        variant: "destructive",
      });
      return;
    }

    setIsChecking(true);
    setCheckProgress(0);
    setResult(null);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setCheckProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 300);

      // Call plagiarism service
      const plagiarismResult = await PlagiarismService.checkPlagiarism(text);
      
      clearInterval(progressInterval);
      setCheckProgress(100);
      setResult(plagiarismResult);
      
      toast({
        title: "Plagiarism Check Complete",
        description: `Originality score: ${plagiarismResult.originalityScore}%`,
      });
    } catch (error) {
      console.error("Plagiarism check error:", error);
      toast({
        title: "Check Failed",
        description: "There was an error checking for plagiarism. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const getAnalysisMethodIcon = (method?: 'openai' | 'gemini' | 'bert') => {
    switch (method) {
      case 'openai':
        return <Sparkles className="h-4 w-4 mr-1" />;
      case 'gemini':
        return <BrainCircuit className="h-4 w-4 mr-1" />;
      case 'bert':
        return <ShieldCheck className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  const getAnalysisMethodName = (method?: 'openai' | 'gemini' | 'bert') => {
    switch (method) {
      case 'openai':
        return "OpenAI";
      case 'gemini':
        return "Google Gemini";
      case 'bert':
        return "BERT Analysis";
      default:
        return "AI Analysis";
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 glass">
        <h2 className="text-lg font-semibold mb-4">Advanced Plagiarism Checker</h2>
        <Textarea
          placeholder="Paste text to check for plagiarism..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[200px] mb-4"
        />
        {isChecking && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Analyzing content for potential plagiarism...</span>
              <span>{Math.round(checkProgress)}%</span>
            </div>
            <Progress value={checkProgress} className="h-2" />
          </div>
        )}
        <div className="flex justify-end">
          <Button
            onClick={handleCheck}
            disabled={isChecking}
            className="w-full sm:w-auto"
          >
            {isChecking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Check Plagiarism"
            )}
          </Button>
        </div>
      </Card>

      {result && (
        <Card className="p-6 glass">
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col">
              <h3 className="text-lg font-semibold">Plagiarism Analysis</h3>
              <div className="flex items-center mt-1">
                <Badge variant="outline" className="flex items-center text-xs">
                  {getAnalysisMethodIcon(result.analysisMethod)}
                  {getAnalysisMethodName(result.analysisMethod)}
                </Badge>
                <Badge variant="outline" className="ml-2 text-xs">
                  Confidence: {result.confidence || 85}%
                </Badge>
              </div>
            </div>
            <div className="flex items-center">
              {result.originalityScore >= 90 ? (
                <FileCheck className="h-5 w-5 mr-2 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
              )}
              <span className="text-lg font-semibold">
                {result.originalityScore}% Original
              </span>
            </div>
          </div>

          <Progress 
            value={result.originalityScore} 
            className="h-2 mb-6" 
          />

          {result.matches.length > 0 ? (
            <div className="space-y-4">
              <h4 className="font-medium">Potential matches found:</h4>
              {result.matches.map((match, idx) => (
                <div key={idx} className="bg-muted p-3 rounded-md">
                  <p className="italic mb-2">"{match.text}"</p>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Source: </span>
                      {match.url ? (
                        <a 
                          href={match.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {match.source}
                        </a>
                      ) : (
                        <span>{match.source}</span>
                      )}
                    </div>
                    <span className="font-medium">{match.matchPercentage}% match</span>
                  </div>
                  {match.recommendation && (
                    <div className="mt-2 text-sm bg-blue-50 dark:bg-blue-900/20 p-2 rounded border-l-2 border-blue-500">
                      <span className="font-medium">Recommendation:</span> {match.recommendation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-green-600 font-medium">No significant matches found!</p>
              <p className="text-muted-foreground mt-2">The text appears to be original.</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default PlagiarismChecker;
