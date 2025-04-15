
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const ProfileSettings = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [institution, setInstitution] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
    if (user?.user_metadata?.avatar_url) {
      setAvatarUrl(user.user_metadata.avatar_url);
    }
    if (user?.user_metadata?.full_name) {
      setFullName(user.user_metadata.full_name);
    }
    loadUserSettings();
  }, [user]);

  const loadUserSettings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('institution')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      if (data) {
        setInstitution(data.institution || '');
      }
    } catch (error: any) {
      console.error('Error loading settings:', error.message);
    }
  };

  const handleProfileSave = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          institution
        });

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved.",
      });
    } catch (error: any) {
      console.error('Error saving settings:', error.message);
      toast({
        title: "Error",
        description: "Failed to save profile settings.",
        variant: "destructive"
      });
    }
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
  );
};
