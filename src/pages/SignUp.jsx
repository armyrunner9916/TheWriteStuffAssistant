import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

function SignUp({ onLogin }) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const logoUrl = "https://oirtcplqedetfhzrdgas.supabase.co/storage/v1/object/public/background-image/TheWriteStuff.jpg";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signUpError) throw signUpError;

      if (!authData?.user?.id) {
        throw new Error("No user data received after sign up");
      }

      const { error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .insert([
          {
            user_id: authData.user.id,
            is_admin: email.toLowerCase() === 'steven.j.reitz@gmail.com',
            is_subscribed: false,
            queries_remaining: 5,
            queries_used: 0
          }
        ]);

      if (subscriptionError) throw subscriptionError;

      localStorage.setItem('userId', authData.user.id);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('isAdmin', email.toLowerCase() === 'steven.j.reitz@gmail.com' ? 'true' : 'false');
      localStorage.setItem('isSubscribed', 'false');
      localStorage.setItem('queriesRemaining', '5');

      onLogin();
      toast({
        title: "Success",
        description: "Welcome to The Write Stuff! Your 10-day full-featured trial has started.",
      });
      navigate('/dashboard');

    } catch (error) {
      console.error("Sign up error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to sign up. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md card">
        <CardHeader className="text-center">
          <img 
            alt="The Write Stuff Logo" 
            className="mx-auto mb-4 h-24" 
            src={logoUrl} 
          />
          <h1 className="text-3xl font-bold text-content">Create Account</h1>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                id="email-signup"
                name="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
                disabled={loading}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Input
                id="password-signup"
                name="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field"
                disabled={loading}
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Input
                id="confirm-password-signup"
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="input-field"
                disabled={loading}
                autoComplete="new-password"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full button-primary"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-content">
            Already have an account?{" "}
            <Link to="/signin" className="text-yellow-400 hover:underline">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default SignUp;