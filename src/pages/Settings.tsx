
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
import { CheckCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const Settings = () => {
  const [feedbackLevel, setFeedbackLevel] = useState("moderate");
  const [fullName, setFullName] = useState("Jane Doe");
  const [email, setEmail] = useState("jane.doe@example.com");
  const [institution, setInstitution] = useState("University of Technology");
  const [avatarUrl, setAvatarUrl] = useState("");
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    // Update email from auth if available
    if (user?.email) {
      setEmail(user.email);
    }
    
    // Get avatar from metadata if available
    if (user?.user_metadata?.avatar_url) {
      setAvatarUrl(user.user_metadata.avatar_url);
    }
    
    // Get name from metadata if available
    if (user?.user_metadata?.full_name) {
      setFullName(user.user_metadata.full_name);
    }
  }, [user]);

  const handleSave = () => {
    localStorage.setItem('feedbackLevel', feedbackLevel);
    
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

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
        toast({
          title: "Avatar Uploaded",
          description: "Your avatar has been updated successfully.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container mx-auto section-padding">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Customize your AI Essay Insight experience
          </p>
          
          {isAdmin && (
            <div className="mt-4">
              <Link to="/admin-settings">
                <Button variant="outline" className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Admin Settings
                </Button>
              </Link>
            </div>
          )}
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid grid-cols-3 w-full mb-6 glass">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6">
            <Card className="p-6 glass">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24">
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt="User avatar" />
                    ) : (
                      <AvatarFallback>{fullName.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                    )}
                  </Avatar>
                  <label htmlFor="avatar-upload" className="cursor-pointer">
                    <div className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm">
                      Change Avatar
                    </div>
                    <input 
                      id="avatar-upload" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleAvatarUpload}
                    />
                  </label>
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
                      readOnly={!!user?.email}
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
                              <Input id="sensitivity" type="range" min="0" max="100" defaultValue="75" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="contextDepth">Context Depth</Label>
                              <Input id="contextDepth" type="range" min="0" max="100" defaultValue="80" />
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
                              <Input id="creativity" type="range" min="0" max="100" defaultValue="60" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="academicTone">Academic Tone</Label>
                              <Input id="academicTone" type="range" min="0" max="100" defaultValue="85" />
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
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
