import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SignUpForm from '@/pages/SignUp';
import SignInForm from '@/pages/SignInForm';

function AuthDialog() {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="bg-yellow-400 text-black font-bold hover:bg-yellow-300 transition-colors duration-300 px-6 py-3 text-lg"
          size="lg"
        >
          Sign Up / Sign In
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-black border-2 border-yellow-400 text-yellow-400">
        <DialogHeader>
          <DialogTitle className="text-yellow-400 text-center text-2xl">Welcome!</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-zinc-900 border border-yellow-400/50">
            <TabsTrigger value="signin" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black text-yellow-400">Sign In</TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black text-yellow-400">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <SignInForm onClose={() => setOpen(false)} />
          </TabsContent>
          <TabsContent value="signup">
            <SignUpForm onClose={() => setOpen(false)} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default AuthDialog;