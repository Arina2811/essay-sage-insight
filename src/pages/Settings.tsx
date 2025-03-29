
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { GeminiService } from "@/services/GeminiService";
import { CheckCircle, RotateCcw } from "lucide-react";
import { EssayAnalysisService } from "@/services/EssayAnalysisService";

const Settings = () => {
  const [feedbackLevel, setFeedbackLevel] = useState("moderate");
  const [fullName, setFullName] = useState("Jane Doe");
  const [email, setEmail] = useState("jane.doe@example.com");
  const [institution, setInstitution] = useState("University of Technology");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [geminiKeyStatus, setGeminiKeyStatus] = useState(false);
  
  // NLP Model Configuration
  const [bertSensitivity, setBertSensitivity] = useState(75);
  const [bertContextDepth, setBertContextDepth] = useState(80);
  const [bartCreativity, setBartCreativity] = useState(60);
  const [bartAcademicTone, setBartAcademicTone] = useState(85);
  
  const { toast } = useToast();

  useEffect(() => {
    const savedKey = GeminiService.getApiKey();
    if (savedKey) {
      setGeminiApiKey(savedKey);
      setGeminiKeyStatus(true);
    }
    
    // Load NLP configuration
    const nlpConfig = EssayAnalysisService.getNlpConfig();
    setBertSensitivity(nlpConfig.bertConfig.sensitivity);
    setBertContextDepth(nlpConfig.bertConfig.contextDepth);
    setBartCreativity(nlpConfig.bartConfig.creativity);
    setBartAcademicTone(nlpConfig.bartConfig.academicTone);
  }, []);

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  const handleProfileSave = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved.",
    });
  };

  const handlePasswordChange = () => {
    toast({
      title: "Password Changed",
      description: "Your password has been updated successfully.",
    });
  };

  const handleGeminiApiKeySave = () => {
    if (geminiApiKey) {
      const success = GeminiService.setApiKey(geminiApiKey);
      if (success) {
        setGeminiKeyStatus(true);
        toast({
          title: "API Key Saved",
          description: "Your Gemini API key has been saved successfully.",
        });
      }
    } else {
      toast({
        title: "API Key Required",
        description: "Please enter a valid Gemini API key.",
        variant: "destructive",
      });
    }
  };

  const handleGeminiApiKeyRemove = () => {
    GeminiService.clearApiKey();
    setGeminiApiKey("");
    setGeminiKeyStatus(false);
    toast({
      title: "API Key Removed",
      description: "Your Gemini API key has been removed successfully.",
    });
  };

  const handleBertConfigSave = () => {
    EssayAnalysisService.updateNlpConfig({
      bertConfig: {
        sensitivity: bertSensitivity,
        contextDepth: bertContextDepth
      }
    });
  };

  const handleBartConfigSave = () => {
    EssayAnalysisService.updateNlpConfig({
      bartConfig: {
        creativity: bartCreativity,
        academicTone: bartAcademicTone
      }
    });
  };

  const handleResetNlpConfig = () => {
    EssayAnalysisService.resetNlpConfig();
    
    // Reload the default values
    const nlpConfig = EssayAnalysisService.getNlpConfig();
    setBertSensitivity(nlpConfig.bertConfig.sensitivity);
    setBertContextDepth(nlpConfig.bertConfig.contextDepth);
    setBartCreativity(nlpConfig.bartConfig.creativity);
    setBartAcademicTone(nlpConfig.bartConfig.academicTone);
  };

  return (
    <div className="container mx-auto section-padding">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Customize your AI Essay Insight experience
          </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid grid-cols-4 w-full mb-6 glass">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="ai-settings">AI Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6">
            <Card className="p-6 glass">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src="https://github.com/shadcn.png" alt="User avatar" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm">Change Avatar</Button>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input 
                      id="fullName" 
                      value={fullName} 
                      onChange={(e) => setFullName(e.target.value)} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="institution">Institution</Label>
                    <Input 
                      id="institution" 
                      value={institution} 
                      onChange={(e) => setInstitution(e.target.value)} 
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={handleProfileSave}>Save Profile</Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="feedback" className="space-y-6">
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
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">AI Model Preferences</h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1" 
                      onClick={handleResetNlpConfig}
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reset All
                    </Button>
                  </div>
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
                              <div className="flex items-center justify-between">
                                <Label htmlFor="sensitivity">Sensitivity: {bertSensitivity}</Label>
                                <span className="text-sm text-muted-foreground">{bertSensitivity}%</span>
                              </div>
                              <Input 
                                id="sensitivity" 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={bertSensitivity} 
                                onChange={(e) => setBertSensitivity(parseInt(e.target.value))}
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Higher sensitivity increases detection of semantic nuances in your essay.
                              </p>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="contextDepth">Context Depth: {bertContextDepth}</Label>
                                <span className="text-sm text-muted-foreground">{bertContextDepth}%</span>
                              </div>
                              <Input 
                                id="contextDepth" 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={bertContextDepth}
                                onChange={(e) => setBertContextDepth(parseInt(e.target.value))}
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Higher context depth improves analysis of relationships between concepts in your essay.
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <Button onClick={handleBertConfigSave}>Save Configuration</Button>
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
                              <div className="flex items-center justify-between">
                                <Label htmlFor="creativity">Creativity: {bartCreativity}</Label>
                                <span className="text-sm text-muted-foreground">{bartCreativity}%</span>
                              </div>
                              <Input 
                                id="creativity" 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={bartCreativity}
                                onChange={(e) => setBartCreativity(parseInt(e.target.value))}
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Higher creativity produces more novel and diverse suggestions for your essay.
                              </p>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="academicTone">Academic Tone: {bartAcademicTone}</Label>
                                <span className="text-sm text-muted-foreground">{bartAcademicTone}%</span>
                              </div>
                              <Input 
                                id="academicTone" 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={bartAcademicTone}
                                onChange={(e) => setBartAcademicTone(parseInt(e.target.value))}
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Higher academic tone ensures suggestions match scholarly writing conventions.
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <Button onClick={handleBartConfigSave}>Save Configuration</Button>
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
          </TabsContent>
          
          <TabsContent value="account" className="space-y-6">
            <Card className="p-6 glass">
              <h3 className="text-lg font-semibold mb-4">Account Security</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handlePasswordChange}>Change Password</Button>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 glass">
              <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications" className="cursor-pointer">
                    Email Notifications
                  </Label>
                  <input 
                    type="checkbox" 
                    id="email-notifications" 
                    className="toggle toggle-primary" 
                    defaultChecked
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="analysis-complete" className="cursor-pointer">
                    Analysis Complete Alerts
                  </Label>
                  <input 
                    type="checkbox" 
                    id="analysis-complete" 
                    className="toggle toggle-primary" 
                    defaultChecked
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="weekly-summary" className="cursor-pointer">
                    Weekly Progress Summary
                  </Label>
                  <input 
                    type="checkbox" 
                    id="weekly-summary" 
                    className="toggle toggle-primary" 
                    defaultChecked
                  />
                </div>
              </div>
            </Card>
            
            <Card className="p-6 glass">
              <h3 className="text-lg font-semibold mb-4 text-destructive">Danger Zone</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Delete Account</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <Button variant="destructive">Delete Account</Button>
                </div>
                <div>
                  <h4 className="font-medium">Export Data</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Download all your data including essays and analysis results.
                  </p>
                  <Button variant="outline">Export All Data</Button>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="ai-settings" className="space-y-6">
            <Card className="p-6 glass">
              <h3 className="text-lg font-semibold mb-4">AI API Keys</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="gemini-api-key">Google Gemini API Key</Label>
                    {geminiKeyStatus && (
                      <span className="text-sm text-green-500 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Connected
                      </span>
                    )}
                  </div>
                  <Input 
                    id="gemini-api-key" 
                    type="password" 
                    value={geminiApiKey} 
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder="Enter your Gemini API key"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Get your API key from the <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google AI Studio</a>
                  </p>
                </div>
                <div className="flex space-x-2 justify-end">
                  {geminiKeyStatus && (
                    <Button variant="outline" onClick={handleGeminiApiKeyRemove}>Remove Key</Button>
                  )}
                  <Button onClick={handleGeminiApiKeySave}>Save API Key</Button>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 glass">
              <h3 className="text-lg font-semibold mb-4">AI Models Configuration</h3>
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-md">
                  <h4 className="font-medium mb-2">Google Gemini Pro</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Google's most capable model for text analysis and generation. Used for high-quality essay analysis, plagiarism detection, and personalized feedback.
                  </p>
                  <div className="flex items-start space-x-2">
                    <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded">
                      Active
                    </div>
                    <div className="bg-muted-foreground/20 text-muted-foreground text-xs px-2 py-1 rounded">
                      {geminiKeyStatus ? "Key Configured" : "Key Required"}
                    </div>
                  </div>
                </div>
                
                <div className="bg-muted p-4 rounded-md">
                  <h4 className="font-medium mb-2">BERT Model</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Used for semantic understanding and academic text analysis. Provides fallback capabilities when Gemini API key is not configured.
                  </p>
                  <div className="flex items-start space-x-2">
                    <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded">
                      Active
                    </div>
                    <div className="bg-green-500/20 text-green-500 text-xs px-2 py-1 rounded">
                      No API Key Required
                    </div>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-md">
                  <h4 className="font-medium mb-2">BART Model</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Used for content generation and text summarization. Provides fallback capabilities when Gemini API key is not configured.
                  </p>
                  <div className="flex items-start space-x-2">
                    <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded">
                      Active
                    </div>
                    <div className="bg-green-500/20 text-green-500 text-xs px-2 py-1 rounded">
                      No API Key Required
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
