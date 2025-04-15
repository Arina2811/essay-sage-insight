
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { FeedbackSettings } from "@/components/settings/FeedbackSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const Settings = () => {
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();

  const handlePasswordChange = () => {
    toast({
      title: "Password Changed",
      description: "Your password has been updated successfully.",
    });
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
          
          <TabsContent value="profile">
            <ProfileSettings />
          </TabsContent>
          
          <TabsContent value="feedback">
            <FeedbackSettings />
          </TabsContent>
          
          <TabsContent value="account">
            <div className="space-y-6">
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
              
              <NotificationSettings />
              
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
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
