
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const [feedbackLevel, setFeedbackLevel] = useState("moderate");
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  return (
    <div className="container mx-auto section-padding">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Customize your AI Essay Insight experience
          </p>
        </div>

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

            <div className="flex justify-end">
              <Button onClick={handleSave}>Save Settings</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
