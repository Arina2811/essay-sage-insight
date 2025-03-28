import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { Loader2, FileCheck, AlertTriangle, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EssayAnalysisService } from "@/services/EssayAnalysisService";
import { EssayAnalysisResult } from "@/types/essay";

const Analysis = () => {
  const [essay, setEssay] = useState("");
  const [essayTitle, setEssayTitle] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<EssayAnalysisResult | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const { toast: uiToast } = useToast();

  const handleAnalysis = async () => {
    if (!essay.trim()) {
      uiToast({
        title: "Essay Required",
        description: "Please enter your essay text to analyze.",
        variant: "destructive",
      });
      return;
    }

    if (!essayTitle.trim()) {
      uiToast({
        title: "Title Required",
        description: "Please provide a title for your essay.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisResult(null);
    
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 300);

      // Call analysis service
      const result = await EssayAnalysisService.analyzeEssay(essay);
      
      clearInterval(progressInterval);
      setAnalysisProgress(100);
      setAnalysisResult(result);
      
      // Save the essay and its analysis
      await EssayAnalysisService.saveEssay({
        title: essayTitle,
        content: essay,
        analysis: result
      });

      toast.success("Essay analysis complete!", {
        description: "Your essay has been analyzed and saved to your library.",
      });
    } catch (error) {
      console.error("Analysis error:", error);
      uiToast({
        title: "Analysis Failed",
        description: "There was an error analyzing your essay. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
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
          <div className="mb-4">
            <label htmlFor="essay-title" className="block text-sm font-medium mb-1">
              Essay Title
            </label>
            <Input
              id="essay-title"
              placeholder="Enter essay title..."
              value={essayTitle}
              onChange={(e) => setEssayTitle(e.target.value)}
              className="mb-4"
            />
          </div>
          <Textarea
            placeholder="Paste or type your essay here..."
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            className="min-h-[300px] mb-4"
          />
          {isAnalyzing && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Analyzing essay...</span>
                <span>{Math.round(analysisProgress)}%</span>
              </div>
              <Progress value={analysisProgress} className="h-2" />
            </div>
          )}
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

        {/* Analysis Results */}
        {analysisResult && (
          <div className="space-y-6">
            <Card className="p-6 glass">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Analysis Results</h2>
                <div className="flex items-center">
                  <span className="text-2xl font-bold mr-2">{analysisResult.score}/100</span>
                  <span className="text-sm text-muted-foreground">Overall Score</span>
                </div>
              </div>
              
              <Tabs defaultValue="feedback">
                <TabsList className="mb-4">
                  <TabsTrigger value="feedback">Smart Feedback</TabsTrigger>
                  <TabsTrigger value="style">Style</TabsTrigger>
                  <TabsTrigger value="thesis">Thesis</TabsTrigger>
                  <TabsTrigger value="citations">Citations</TabsTrigger>
                  <TabsTrigger value="plagiarism">Plagiarism</TabsTrigger>
                </TabsList>
                
                <TabsContent value="feedback" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Essay Structure</h3>
                    <span className="text-sm font-medium">{analysisResult.structure.score}/100</span>
                  </div>
                  <Progress value={analysisResult.structure.score} className="h-2 mb-2" />
                  <p className="text-muted-foreground">{analysisResult.structure.feedback}</p>
                </TabsContent>
                
                <TabsContent value="style" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Writing Style</h3>
                    <span className="text-sm font-medium">{analysisResult.style.score}/100</span>
                  </div>
                  <Progress value={analysisResult.style.score} className="h-2 mb-2" />
                  <p className="text-muted-foreground">{analysisResult.style.feedback}</p>
                  <h4 className="font-medium text-sm mt-4 mb-2">Suggestions:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    {analysisResult.style.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </TabsContent>
                
                <TabsContent value="thesis" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Thesis Statement</h3>
                    <span className="text-sm font-medium">{analysisResult.thesis.score}/100</span>
                  </div>
                  <Progress value={analysisResult.thesis.score} className="h-2 mb-2" />
                  <div className="bg-muted p-3 rounded-md text-sm italic mb-2">
                    "{analysisResult.thesis.text}"
                  </div>
                  <p className="text-muted-foreground">{analysisResult.thesis.feedback}</p>
                </TabsContent>
                
                <TabsContent value="citations" className="space-y-4">
                  <div className="flex items-center mb-4">
                    <h3 className="font-medium flex-1">Citation Check</h3>
                    {analysisResult.citations.isValid ? (
                      <span className="inline-flex items-center text-green-500">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Valid
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-amber-500">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Issues Found
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm mb-2">
                    <div>
                      <span className="text-muted-foreground">Format:</span>
                      <span className="ml-1 font-medium">{analysisResult.citations.format}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Citations:</span>
                      <span className="ml-1 font-medium">{analysisResult.citations.count}</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground">{analysisResult.citations.feedback}</p>
                </TabsContent>
                
                <TabsContent value="plagiarism" className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Plagiarism Check</h3>
                    <div className="flex items-center">
                      <FileCheck className="h-5 w-5 mr-2 text-green-500" />
                      <span className="text-lg font-semibold">{analysisResult.plagiarism.score}% Original</span>
                    </div>
                  </div>
                  <Progress 
                    value={analysisResult.plagiarism.score} 
                    className="h-2 mb-4" 
                  />
                  {analysisResult.plagiarism.passages.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Potential matches found:</h4>
                      {analysisResult.plagiarism.passages.map((passage, idx) => (
                        <div key={idx} className="bg-muted p-3 rounded-md text-sm">
                          <p className="italic mb-1">"{passage.text}"</p>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{passage.source}</span>
                            <span className="font-medium">{passage.matchPercentage}% match</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No significant matches found. Your essay appears to be original!</p>
                  )}
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analysis;
