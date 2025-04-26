import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/ui/theme-provider";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Moon, Sun, Trash2 } from "lucide-react";

export function SettingsForm() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const handleThemeChange = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
    toast({
      title: `${checked ? "Dark" : "Light"} mode activated`,
      description: `Theme has been changed to ${checked ? "dark" : "light"} mode.`,
    });
  };

  // In a real app, this would be a mutation to delete the user account
  const handleDeleteAccount = () => {
    // Mock implementation
    setDeleteDialogOpen(false);
    toast({
      title: "Account deletion requested",
      description: "Your request to delete your account has been submitted. An administrator will review it.",
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Account Settings</h3>
            <p className="text-sm text-muted-foreground">
              Manage your account settings and preferences.
            </p>
          </div>

          <Separator />
          
          {/* Appearance */}
          <div className="space-y-4">
            <h4 className="text-md font-medium">Appearance</h4>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="theme-mode">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark themes
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Sun className="h-4 w-4 text-muted-foreground" />
                <Switch 
                  id="theme-mode" 
                  checked={theme === "dark"}
                  onCheckedChange={handleThemeChange}
                />
                <Moon className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          <Separator />
          
          {/* Danger Zone */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-destructive">Danger Zone</h4>
            
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button 
                variant="destructive" 
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Delete account confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}