import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Loader2, CheckCircle, Sparkles, ArrowLeft, BookOpen, FileText } from 'lucide-react';
import Footer from '@/components/ui/Footer';

const features = [
  "Task-based assistants for fiction, poetry, scripts, nonfiction, online content and songwriting",
  "Conversational follow-ups to refine your work",
  "10-day full-access trial, then just $5/month",
  "Full access to all features during trial",
  "Export your work anytime",
  "No commitment — cancel anytime"
];

function AuthPage() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'signin';
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (window.gtag && activeTab === 'signup') {
      window.gtag('event', 'page_view', {
        page_path: '/auth?tab=signup',
        page_title: 'Sign Up - The Write Stuff Assistant'
      });
    }
  }, [activeTab]);

  const trackSignUpConversion = () => {
    if (window.gtag) {
      window.gtag('event', 'conversion', {
        'send_to': 'AW-17757058228/jZ7WCO7YyNUbELTpnJNC',
        'value': 1.0,
        'currency': 'USD',
        'transaction_id': ''
      });

      window.gtag('event', 'sign_up', {
        method: 'email'
      });
    }
  };

  const trackSignInConversion = () => {
    if (window.gtag) {
      window.gtag('event', 'login', {
        method: 'email'
      });
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!signInEmail || !signInPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await signIn(signInEmail, signInPassword);
      if (error) throw error;

      trackSignInConversion();

      toast({
        title: 'Welcome Back!',
        description: 'Successfully signed in.',
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Sign In Failed',
        description: error.message || 'Invalid email or password.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!signUpEmail || !signUpPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (signUpPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (signUpPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: signUpEmail.trim().toLowerCase(),
        password: signUpPassword,
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
            is_admin: signUpEmail.toLowerCase() === 'steven.j.reitz@gmail.com',
            is_subscribed: false,
            queries_remaining: 5,
            queries_used: 0
          }
        ]);

      if (subscriptionError) throw subscriptionError;

      trackSignUpConversion();

      localStorage.setItem('userId', authData.user.id);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('isAdmin', signUpEmail.toLowerCase() === 'steven.j.reitz@gmail.com' ? 'true' : 'false');
      localStorage.setItem('isSubscribed', 'false');
      localStorage.setItem('queriesRemaining', '5');

      toast({
        title: "Success!",
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
    <>
      <Helmet>
        <title>Sign Up / Sign In - The Write Stuff Assistant</title>
        <meta name="description" content="Join The Write Stuff Assistant today. Get AI-powered writing tools for prose, poetry, songwriting, and more. Start your 10-day full-featured trial now." />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href="https://writestuffassistant.com/auth" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Sign Up - The Write Stuff Assistant" />
        <meta property="og:description" content="Join The Write Stuff Assistant today. Get AI-powered writing tools for prose, poetry, songwriting, and more. Start your 10-day full-featured trial now." />
        <meta property="og:url" content="https://writestuffassistant.com/auth" />
      </Helmet>

      <div className="relative min-h-screen w-full flex flex-col">
        <div className="absolute inset-0 z-0">
          <img
            className="object-cover w-full h-full fixed"
            alt="Background image of a bookshelf filled with books under warm lighting"
            src="https://images.unsplash.com/photo-1630320778004-ffd02f18f93f"
          />
          <div className="absolute inset-0 bg-black/70 fixed"></div>
        </div>

        <main className="relative z-10 flex-grow container mx-auto px-4 py-8 sm:py-12 lg:px-10 xl:px-16">
          <div className="max-w-6xl lg:max-w-7xl xl:max-w-[1400px] mx-auto">
            <header className="w-full mb-8 lg:mb-10">
              <nav className="flex gap-1.5 items-center" role="navigation" aria-label="Secondary navigation">
                <Button
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="h-8 px-2.5 text-xs bg-transparent text-yellow-400/80 hover:text-yellow-400 hover:bg-yellow-400/10 border-yellow-400/40 hover:border-yellow-400/60 transition-all"
                  aria-label="Back to home page"
                >
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" aria-hidden="true" /> Back
                </Button>
                <Button
                  onClick={() => navigate('/resources')}
                  variant="outline"
                  className="h-8 px-2.5 text-xs bg-transparent text-yellow-400/80 hover:text-yellow-400 hover:bg-yellow-400/10 border-yellow-400/40 hover:border-yellow-400/60 transition-all"
                  aria-label="Go to resources page"
                >
                  <BookOpen className="h-3.5 w-3.5 mr-1" aria-hidden="true" /> Resources
                </Button>
                <Button
                  onClick={() => navigate('/blog')}
                  variant="outline"
                  className="h-8 px-2.5 text-xs bg-transparent text-yellow-400/80 hover:text-yellow-400 hover:bg-yellow-400/10 border-yellow-400/40 hover:border-yellow-400/60 transition-all"
                  aria-label="Go to blog page"
                >
                  <FileText className="h-3.5 w-3.5 mr-1" aria-hidden="true" /> Blog
                </Button>
              </nav>
            </header>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8 lg:mb-12"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-yellow-400 mb-4 lg:mb-6" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                Welcome to The Write Stuff
              </h1>
              <p className="text-xl lg:text-2xl xl:text-3xl text-yellow-400/90 max-w-2xl lg:max-w-4xl mx-auto" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                Your AI-powered writing companion for every creative need
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 xl:gap-12 items-stretch">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="bg-zinc-900/90 border-yellow-400/30 backdrop-blur-sm h-full flex flex-col">
                  <CardHeader className="lg:p-8">
                    <CardTitle className="text-yellow-400 text-2xl lg:text-3xl xl:text-4xl text-center" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>Get Started Today</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow lg:px-8 lg:pb-8">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-2 bg-zinc-800 border border-yellow-400/50">
                        <TabsTrigger
                          value="signin"
                          className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black text-yellow-400"
                        >
                          Sign In
                        </TabsTrigger>
                        <TabsTrigger
                          value="signup"
                          className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black text-yellow-400"
                        >
                          Sign Up
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="signin" className="mt-6">
                        <form onSubmit={handleSignIn} className="space-y-4 lg:space-y-6">
                          <div className="space-y-2">
                            <Label htmlFor="signin-email" className="text-yellow-400 lg:text-lg" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>Email</Label>
                            <Input
                              id="signin-email"
                              type="email"
                              value={signInEmail}
                              onChange={(e) => setSignInEmail(e.target.value)}
                              required
                              className="bg-zinc-800 border-yellow-400/50 text-white lg:h-12 lg:text-lg"
                              placeholder="you@example.com"
                              autoComplete="email"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="signin-password" className="text-yellow-400 lg:text-lg" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>Password</Label>
                            <Input
                              id="signin-password"
                              type="password"
                              value={signInPassword}
                              onChange={(e) => setSignInPassword(e.target.value)}
                              required
                              className="bg-zinc-800 border-yellow-400/50 text-white lg:h-12 lg:text-lg"
                              placeholder="••••••••"
                              autoComplete="current-password"
                            />
                          </div>
                          <Button
                            type="submit"
                            className="w-full bg-yellow-400 text-black hover:bg-yellow-300 font-bold rounded-lg lg:h-12 lg:text-lg"
                            disabled={loading}
                          >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sign In'}
                          </Button>
                        </form>
                      </TabsContent>

                      <TabsContent value="signup" className="mt-6">
                        <form onSubmit={handleSignUp} className="space-y-4 lg:space-y-6">
                          <div className="space-y-2">
                            <Label htmlFor="signup-email" className="text-yellow-400 lg:text-lg" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>Email</Label>
                            <Input
                              id="signup-email"
                              type="email"
                              value={signUpEmail}
                              onChange={(e) => setSignUpEmail(e.target.value)}
                              required
                              className="bg-zinc-800 border-yellow-400/50 text-white lg:h-12 lg:text-lg"
                              placeholder="you@example.com"
                              autoComplete="email"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="signup-password" className="text-yellow-400 lg:text-lg" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>Password</Label>
                            <Input
                              id="signup-password"
                              type="password"
                              value={signUpPassword}
                              onChange={(e) => setSignUpPassword(e.target.value)}
                              required
                              className="bg-zinc-800 border-yellow-400/50 text-white lg:h-12 lg:text-lg"
                              placeholder="••••••••"
                              autoComplete="new-password"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirm-password" className="text-yellow-400 lg:text-lg" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>Confirm Password</Label>
                            <Input
                              id="confirm-password"
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              required
                              className="bg-zinc-800 border-yellow-400/50 text-white lg:h-12 lg:text-lg"
                              placeholder="••••••••"
                              autoComplete="new-password"
                            />
                          </div>
                          <Button
                            type="submit"
                            className="w-full bg-yellow-400 text-black hover:bg-yellow-300 font-bold rounded-lg lg:h-12 lg:text-lg"
                            disabled={loading}
                          >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create Account'}
                          </Button>
                          <p className="text-xs lg:text-sm text-yellow-400/70 text-center">
                            By signing up, you start your 10-day full-featured trial. No credit card required.
                          </p>
                        </form>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="space-y-6"
              >
                <Card className="bg-zinc-900/90 border-yellow-400/30 backdrop-blur-sm h-full flex flex-col">
                  <CardHeader className="lg:p-8">
                    <CardTitle className="text-yellow-400 text-xl lg:text-2xl xl:text-3xl flex items-center gap-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                      <Sparkles className="h-5 w-5 lg:h-6 lg:w-6" />
                      What You Get
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 flex-grow flex flex-col lg:px-8 lg:pb-8">
                    <ul className="space-y-3 lg:space-y-4 flex-grow">
                      {features.map((feature, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                          className="flex items-start gap-3 text-yellow-400/90 lg:text-lg"
                        >
                          <CheckCircle className="h-5 w-5 lg:h-6 lg:w-6 mt-0.5 flex-shrink-0 text-yellow-400" />
                          <span style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                    <div className="pt-4 border-t border-yellow-400/20 mt-auto">
                      <Button
                        onClick={() => navigate('/demo')}
                        className="w-full bg-yellow-400 text-black hover:bg-yellow-300 rounded-lg font-bold lg:h-12 lg:text-lg"
                      >
                        Try the Demo First
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </main>

        <Footer showSubscription={false} />
      </div>
    </>
  );
}

export default AuthPage;
