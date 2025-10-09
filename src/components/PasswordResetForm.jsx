import React from "react";
    import { Button } from "@/components/ui/button";
    import { Input } from "@/components/ui/input";
    import { useToast } from "@/components/ui/use-toast";
    import { supabase } from "@/lib/supabase";

    function PasswordResetForm({ onCloseDialog }) {
      const { toast } = useToast();
      const [newPassword, setNewPassword] = React.useState("");
      const [confirmPassword, setConfirmPassword] = React.useState("");
      const [loading, setLoading] = React.useState(false);

      const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (!newPassword || !confirmPassword) {
          toast({
            title: "Error",
            description: "Please fill in both password fields.",
            variant: "destructive",
          });
          return;
        }
        if (newPassword !== confirmPassword) {
          toast({
            title: "Error",
            description: "Passwords do not match.",
            variant: "destructive",
          });
          return;
        }
        // Add basic password strength check if needed (e.g., minimum length)
        if (newPassword.length < 6) {
           toast({
            title: "Error",
            description: "Password must be at least 6 characters long.",
            variant: "destructive",
          });
          return;
        }


        setLoading(true);
        try {
          const { error } = await supabase.auth.updateUser({ 
            password: newPassword 
          });

          if (error) {
            throw error;
          }

          toast({
            title: "Success",
            description: "Your password has been updated successfully.",
          });
          setNewPassword("");
          setConfirmPassword("");
          if (onCloseDialog) onCloseDialog(); // Close the dialog after success

        } catch (error) {
          console.error("Password update error:", error);
          toast({
            title: "Error",
            description: error.message || "Failed to update password. Please try again.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };

      return (
        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div className="space-y-2">
             <label htmlFor="newPassword" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-content">New Password</label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="input-field"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-content">Confirm New Password</label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="input-field"
              disabled={loading}
            />
          </div>
          <Button 
            type="submit" 
            className="w-full button-primary" 
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      );
    }

    export default PasswordResetForm;