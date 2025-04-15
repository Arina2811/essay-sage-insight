import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const FeedbackSettings = () => {
  const [feedbackLevel, setFeedbackLevel] = useState("moderate");
  const [useBertAnalysis, setUseBertAnalysis] = useState(true);
  const [useBartGeneration, setUseBartGeneration] = useState(true);
  const [bertSensitivity, setBertSensitivity] = useState(75);
  const [bertContextDepth, setBertContextDepth] = useState(80);
  const [bartCreativity, setBartCreativity] = useState(60);
  const [bartAcademicTone, setBartAcademicTone] = useState(85);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      if (data) {
        setFeedbackLevel(data.feedback_level);
        setUseBertAnalysis(data.use_bert_analysis);
        setUseBartGeneration(data.use_bart_generation);
        setBertSensitivity(data.bert_sensitivity);
        setBertContextDepth(data.bert_context_depth);
        setBartCreativity(data.bart_creativity);
        setBartAcademicTone(data.bart_academic_tone);
      }
    } catch (error: any) {
      console.error('Error loading settings:', error.message);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          feedback_level,
          use_bert_analysis: useBertAnalysis,
          use_bart_generation: useBartGeneration,
          bert_sensitivity: bertSensitivity,
          bert_context_depth: bertContextDepth,
          bart_creativity: bartCreativity,
          bart_academic_tone: bartAcademicTone
        });

      if (error) throw error;
      
      toast({
        title: "Settings Saved",
        description: "Your feedback preferences have been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error saving settings:', error.message);
      toast({
        title: "Error",
        description: "Failed to save feedback settings.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="p-6 glass">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Feedback Intensity</h3>
          <RadioGroup
            value={feedbackLevel}
            onValueChange={setFeedbackLevel}
            className="space-y-3"
          >
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="lenient" id="lenient" />
              <Label htmlFor="lenient" className="font-normal leading-relaxed">
                <div className="font-medium">Lenient</div>
                <div className="text-sm text-muted-foreground">
                  Focus on major improvements with gentler feedback
                </div>
              </Label>
            </div>
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="moderate" id="moderate" />
              <Label htmlFor="moderate" className="font-normal leading-relaxed">
                <div className="font-medium">Moderate</div>
                <div className="text-sm text-muted-foreground">
                  Balanced feedback with both major and minor suggestions
                </div>
              </Label>
            </div>
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="strict" id="strict" />
              <Label htmlFor="strict" className="font-normal leading-relaxed">
                <div className="font-medium">Strict</div>
                <div className="text-sm text-muted-foreground">
                  Detailed feedback covering all potential improvements
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">AI Model Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Use BERT for Semantic Analysis</div>
                <div className="text-sm text-muted-foreground">
                  Enhanced contextual understanding of your essays
                </div>
              </div>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">Configure</Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>BERT Configuration</SheetTitle>
                    <SheetDescription>
                      Configure BERT model parameters for semantic analysis
                    </SheetDescription>
                  </SheetHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="sensitivity">Sensitivity</Label>
                      <Input id="sensitivity" type="range" min="0" max="100" defaultValue={bertSensitivity} onChange={(e) => setBertSensitivity(Number(e.target.value))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contextDepth">Context Depth</Label>
                      <Input id="contextDepth" type="range" min="0" max="100" defaultValue={bertContextDepth} onChange={(e) => setBertContextDepth(Number(e.target.value))} />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button>Save Configuration</Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Use BART for Content Generation</div>
                <div className="text-sm text-muted-foreground">
                  Better suggestions for improving your essay content
                </div>
              </div>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">Configure</Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>BART Configuration</SheetTitle>
                    <SheetDescription>
                      Configure BART model parameters for content generation
                    </SheetDescription>
                  </SheetHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="creativity">Creativity</Label>
                      <Input id="creativity" type="range" min="0" max="100" defaultValue={bartCreativity} onChange={(e) => setBartCreativity(Number(e.target.value))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="academicTone">Academic Tone</Label>
                      <Input id="academicTone" type="range" min="0" max="100" defaultValue={bartAcademicTone} onChange={(e) => setBartAcademicTone(Number(e.target.value))} />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button>Save Configuration</Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave}>Save Settings</Button>
        </div>
      </div>
    </Card>
  );
};
