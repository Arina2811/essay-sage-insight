
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const NotificationSettings = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [analysisAlerts, setAnalysisAlerts] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(true);
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
        .select('email_notifications, analysis_complete_alerts, weekly_summary')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      if (data) {
        setEmailNotifications(data.email_notifications);
        setAnalysisAlerts(data.analysis_complete_alerts);
        setWeeklySummary(data.weekly_summary);
      }
    } catch (error: any) {
      console.error('Error loading notification settings:', error.message);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          email_notifications: emailNotifications,
          analysis_complete_alerts: analysisAlerts,
          weekly_summary: weeklySummary
        });

      if (error) throw error;
      
      toast({
        title: "Settings Saved",
        description: "Your notification preferences have been updated.",
      });
    } catch (error: any) {
      console.error('Error saving notification settings:', error.message);
      toast({
        title: "Error",
        description: "Failed to save notification settings.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="p-6 glass">
      <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="email-notifications" className="cursor-pointer">
            Email Notifications
          </Label>
          <Switch
            id="email-notifications"
            checked={emailNotifications}
            onCheckedChange={setEmailNotifications}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="analysis-alerts" className="cursor-pointer">
            Analysis Complete Alerts
          </Label>
          <Switch
            id="analysis-alerts"
            checked={analysisAlerts}
            onCheckedChange={setAnalysisAlerts}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="weekly-summary" className="cursor-pointer">
            Weekly Progress Summary
          </Label>
          <Switch
            id="weekly-summary"
            checked={weeklySummary}
            onCheckedChange={setWeeklySummary}
          />
        </div>
      </div>
    </Card>
  );
};
