
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { 
  Loader2, 
  FileCheck, 
  AlertTriangle, 
  CheckCircle, 
  Sparkles, 
  BookOpen, 
  Bot, 
  Lightbulb, 
  Users, 
  HeartPulse,
  BadgeAlert,
  Pencil
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EssayAnalysisService } from "@/services/EssayAnalysisService";
import { EssayAnalysisResult } from "@/types/essay";
import { useNavigate } from "react-router-dom";

const Analysis = () => {
  const [essay, setEssay] = useState("");
  const [essayTitle, setEssayTitle] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<EssayAnalysisResult | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const { toast: uiToast } = useToast();
  const navigate = useNavigate();

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
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 300);

      const result = await EssayAnalysisService.analyzeEssay(essay);
      
      clearInterval(progressInterval);
      setAnalysisProgress(100);
      setAnalysisResult(result);
      
      const savedResult = await EssayAnalysisService.saveEssay({
        title: essayTitle,
        content: essay,
        analysis: result
      });

      toast.success("Essay analysis complete!", {
        description: "Your essay has been analyzed and saved to your library.",
        action: {
          label: "View Dashboard",
          onClick: () => navigate('/dashboard')
        }
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
                <span>Analyzing...</span>
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
                <TabsList className="mb-4 flex flex-wrap">
                  <TabsTrigger value="feedback">Smart Feedback</TabsTrigger>
                  <TabsTrigger value="style">Style</TabsTrigger>
                  <TabsTrigger value="thesis">Thesis</TabsTrigger>
                  <TabsTrigger value="creativity">Creativity</TabsTrigger>
                  <TabsTrigger value="readability">Readability</TabsTrigger>
                  <TabsTrigger value="aiDetection">AI Detection</TabsTrigger>
                  <TabsTrigger value="vocabulary">Vocabulary</TabsTrigger>
                  <TabsTrigger value="audience">Audience</TabsTrigger>
                  <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
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
                
                <TabsContent value="creativity" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium flex items-center">
                      <Sparkles className="h-4 w-4 mr-2 text-amber-500" />
                      Creativity
                    </h3>
                    <span className="text-sm font-medium">{analysisResult.creativity.score}/100</span>
                  </div>
                  <Progress 
                    value={analysisResult.creativity.score} 
                    className="h-2 mb-2"
                  />
                  <p className="text-muted-foreground">{analysisResult.creativity.feedback}</p>
                  
                  {analysisResult.creativity.highlights.length > 0 && (
                    <>
                      <h4 className="font-medium text-sm mt-4 mb-2">Creative Highlights:</h4>
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        {analysisResult.creativity.highlights.map((highlight, index) => (
                          <li key={index}>{highlight}</li>
                        ))}
                      </ul>
                    </>
                  )}
                  
                  {analysisResult.creativity.suggestions.length > 0 && (
                    <>
                      <h4 className="font-medium text-sm mt-4 mb-2">Suggestions to Boost Creativity:</h4>
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        {analysisResult.creativity.suggestions.map((suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </TabsContent>
                
                <TabsContent value="readability" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium flex items-center">
                      <BookOpen className="h-4 w-4 mr-2 text-blue-500" />
                      Readability
                    </h3>
                    <span className="text-sm font-medium">{analysisResult.readability?.score || 0}/100</span>
                  </div>
                  <Progress 
                    value={analysisResult.readability?.score || 0} 
                    className="h-2 mb-2"
                  />
                  <div className="flex items-center text-sm mb-2">
                    <span className="text-muted-foreground mr-2">Reading Level:</span>
                    <span className="font-medium">{analysisResult.readability?.gradeLevel || "Not detected"}</span>
                  </div>
                  <p className="text-muted-foreground">{analysisResult.readability?.feedback || "No readability feedback available."}</p>
                  
                  {analysisResult.readability?.suggestions && analysisResult.readability.suggestions.length > 0 && (
                    <>
                      <h4 className="font-medium text-sm mt-4 mb-2">Readability Suggestions:</h4>
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        {analysisResult.readability.suggestions.map((suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </TabsContent>
                
                <TabsContent value="aiDetection" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium flex items-center">
                      <Bot className="h-4 w-4 mr-2 text-purple-500" />
                      AI Detection
                    </h3>
                    <span className="text-sm font-medium">{analysisResult.aiDetection?.score || 0}/100</span>
                  </div>
                  <Progress 
                    value={analysisResult.aiDetection?.score || 0} 
                    className="h-2 mb-2"
                  />
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm text-muted-foreground">Verdict:</span>
                    {analysisResult.aiDetection?.isAiGenerated ? (
                      <span className="text-sm font-medium text-red-500 flex items-center">
                        <BadgeAlert className="h-4 w-4 mr-1" />
                        Likely AI-generated
                      </span>
                    ) : (
                      <span className="text-sm font-medium text-green-500 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Likely human-written
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      ({analysisResult.aiDetection?.confidence || 0}% confidence)
                    </span>
                  </div>
                  <p className="text-muted-foreground">{analysisResult.aiDetection?.feedback || "No AI detection feedback available."}</p>
                  
                  {analysisResult.aiDetection?.markers && analysisResult.aiDetection.markers.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Key Indicators:</h4>
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        {analysisResult.aiDetection.markers.map((marker, idx) => (
                          <li key={idx}>{marker}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="vocabulary" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium flex items-center">
                      <Lightbulb className="h-4 w-4 mr-2 text-yellow-500" />
                      Vocabulary
                    </h3>
                    <span className="text-sm font-medium">{analysisResult.vocabulary?.score || 0}/100</span>
                  </div>
                  <Progress 
                    value={analysisResult.vocabulary?.score || 0} 
                    className="h-2 mb-2"
                  />
                  
                  {analysisResult.vocabulary?.academicLevel && (
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm text-muted-foreground">Academic Level:</span>
                      <span className="text-sm font-medium capitalize">{analysisResult.vocabulary.academicLevel}</span>
                      {analysisResult.vocabulary.uniqueness && (
                        <span className="text-xs text-muted-foreground ml-4">
                          Word Uniqueness: {Math.round(analysisResult.vocabulary.uniqueness)}%
                        </span>
                      )}
                    </div>
                  )}
                  
                  <p className="text-muted-foreground">{analysisResult.vocabulary?.feedback || "No vocabulary feedback available."}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {analysisResult.vocabulary?.strengths && analysisResult.vocabulary.strengths.length > 0 && (
                      <div className="bg-muted/50 p-4 rounded-md">
                        <h4 className="font-medium text-sm mb-2 text-green-600 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Strengths
                        </h4>
                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                          {analysisResult.vocabulary.strengths.map((strength, index) => (
                            <li key={index}>{strength}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {analysisResult.vocabulary?.improvementAreas && analysisResult.vocabulary.improvementAreas.length > 0 && (
                      <div className="bg-muted/50 p-4 rounded-md">
                        <h4 className="font-medium text-sm mb-2 text-amber-600 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Areas for Improvement
                        </h4>
                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                          {analysisResult.vocabulary.improvementAreas.map((area, index) => (
                            <li key={index}>{area}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  {analysisResult.vocabulary?.advanced && analysisResult.vocabulary.advanced.length > 0 && (
                    <>
                      <h4 className="font-medium text-sm mt-4 mb-2">Advanced Terms Used:</h4>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {analysisResult.vocabulary.advanced.map((term, index) => (
                          <span key={index} className="px-2 py-1 bg-muted rounded-md text-xs">
                            {term}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                  
                  {analysisResult.vocabulary?.typos && analysisResult.vocabulary.typos.length > 0 && (
                    <>
                      <h4 className="font-medium text-sm mt-4 mb-2 flex items-center">
                        <Pencil className="h-4 w-4 mr-1 text-red-500" />
                        Potential Spelling Errors:
                      </h4>
                      <div className="space-y-3">
                        {analysisResult.vocabulary.typos.map((typo, index) => (
                          <div key={index} className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md text-sm">
                            <div className="mb-1">
                              <span className="font-semibold text-red-600 dark:text-red-400">{typo.word}</span>
                              <span className="text-muted-foreground"> in context: </span>
                              <span className="italic">"{typo.context}"</span>
                            </div>
                            {typo.suggestions.length > 0 && (
                              <div>
                                <span className="text-xs text-muted-foreground">Suggested corrections: </span>
                                <span className="text-xs font-medium">{typo.suggestions.join(', ')}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  
                  {analysisResult.vocabulary?.suggestions && analysisResult.vocabulary.suggestions.length > 0 && (
                    <>
                      <h4 className="font-medium text-sm mt-4 mb-2">Vocabulary Improvement Suggestions:</h4>
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        {analysisResult.vocabulary.suggestions.map((suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </TabsContent>
                
                <TabsContent value="audience" className="space-y-4">
                  <div className="flex items-center mb-4">
                    <h3 className="font-medium flex items-center">
                      <Users className="h-4 w-4 mr-2 text-indigo-500" />
                      Target Audience Analysis
                    </h3>
                  </div>
                  
                  <p className="text-muted-foreground mb-4">{analysisResult.targetAudience?.feedback || "No audience feedback available."}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysisResult.targetAudience?.suitable && analysisResult.targetAudience.suitable.length > 0 && (
                      <div className="bg-muted/50 p-4 rounded-md">
                        <h4 className="font-medium text-sm mb-2 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          Suitable For
                        </h4>
                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                          {analysisResult.targetAudience.suitable.map((audience, index) => (
                            <li key={index}>{audience}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {analysisResult.targetAudience?.unsuitable && analysisResult.targetAudience.unsuitable.length > 0 && (
                      <div className="bg-muted/50 p-4 rounded-md">
                        <h4 className="font-medium text-sm mb-2 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                          Less Suitable For
                        </h4>
                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                          {analysisResult.targetAudience.unsuitable.map((audience, index) => (
                            <li key={index}>{audience}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="sentiment" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium flex items-center">
                      <HeartPulse className="h-4 w-4 mr-2 text-pink-500" />
                      Sentiment Analysis
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span 
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          analysisResult.sentiment?.overall === 'positive' ? 'bg-green-100 text-green-800' :
                          analysisResult.sentiment?.overall === 'negative' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {analysisResult.sentiment?.overall || "Neutral"}
                      </span>
                      <span className="text-sm font-medium">{analysisResult.sentiment?.score || 50}/100</span>
                    </div>
                  </div>
                  
                  <Progress 
                    value={analysisResult.sentiment?.score || 50} 
                    className="h-2 mb-2"
                  />
                  
                  <p className="text-muted-foreground">{analysisResult.sentiment?.feedback || "No sentiment analysis available."}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {analysisResult.sentiment?.highlights?.positive && analysisResult.sentiment.highlights.positive.length > 0 && (
                      <div className="bg-muted/50 p-4 rounded-md">
                        <h4 className="font-medium text-sm mb-2 text-green-600">Positive Elements</h4>
                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                          {analysisResult.sentiment.highlights.positive.map((highlight, index) => (
                            <li key={index}>{highlight}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {analysisResult.sentiment?.highlights?.negative && analysisResult.sentiment.highlights.negative.length > 0 && (
                      <div className="bg-muted/50 p-4 rounded-md">
                        <h4 className="font-medium text-sm mb-2 text-red-600">Areas for Improvement</h4>
                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                          {analysisResult.sentiment.highlights.negative.map((highlight, index) => (
                            <li key={index}>{highlight}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="citations" className="space-y-4">
                  <div className="flex items-center mb-4">
                    <h3 className="font-medium">Citation Check</h3>
                    {analysisResult.citations.isValid ? (
                      <span className="inline-flex items-center text-green-500 ml-auto">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Valid
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-amber-500 ml-auto">
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
              
              <div className="mt-6 flex justify-end">
                <Button 
                  variant="outline"
                  onClick={() => navigate('/history')}
                  className="mr-2"
                >
                  View History
                </Button>
                <Button 
                  onClick={() => navigate('/dashboard')}
                >
                  Go to Dashboard
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analysis;
