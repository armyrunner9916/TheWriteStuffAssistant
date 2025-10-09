import React from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth.jsx";

function AuthActionButtons() {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <Button
      onClick={handleLogout}
      variant="outline"
      size="sm"
      className="bg-black text-yellow-400 hover:bg-black/80 border-yellow-400"
    >
      <LogOut className="h-4 w-4 mr-1" />
      Sign Out
    </Button>
  );
}

export default AuthActionButtons;