import React, { useState, useEffect } from "react";
    import {
      Dialog,
      DialogContent,
      DialogHeader,
      DialogTitle,
      DialogDescription,
      DialogFooter,
      DialogClose,
    } from "@/components/ui/dialog";
    import { Button } from "@/components/ui/button";
    import { Input } from "@/components/ui/input";
    import { Label } from "@/components/ui/label";
    import { useToast } from "@/components/ui/use-toast";
    import { supabase } from "@/lib/supabase";
    import { Loader2 } from "lucide-react";

    function SaveOutputDialog({ isOpen, onOpenChange, outputToSave, queryType, defaultFilename }) {
      const [filename, setFilename] = useState("");
      const [isSaving, setIsSaving] = useState(false);
      const { toast } = useToast();

      useEffect(() => {
        if (isOpen) {
          // Set default filename when dialog opens
          setFilename(defaultFilename || `${queryType}_output_${Date.now()}.txt`);
        } else {
          // Reset state when dialog closes
          setFilename("");
          setIsSaving(false);
        }
      }, [isOpen, defaultFilename, queryType]);

      const handleSaveConfirm = async () => {
        if (!filename.trim()) {
          toast({
            title: "Filename Required",
            description: "Please enter a name for your saved output.",
            variant: "destructive",
          });
          return;
        }
        if (!outputToSave) {
           toast({
             title: "Error",
             description: "No output content available to save.",
             variant: "destructive",
           });
           return;
         }

        setIsSaving(true);
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("User not logged in.");

          const { error } = await supabase
            .from('saved_outputs')
            .insert([
              {
                user_id: user.id,
                query_type: queryType,
                output_text: outputToSave,
                filename: filename.trim(), // Save the provided filename
              }
            ]);

          if (error) throw error;

          toast({ title: "Saved!", description: `Output saved as "${filename.trim()}".` });
          onOpenChange(false); // Close dialog on success
        } catch (error) {
          console.error('Failed to save: ', error);
          toast({ title: "Error", description: "Failed to save output. " + error.message, variant: "destructive" });
        } finally {
          setIsSaving(false);
        }
      };

      return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-[425px] bg-black border-yellow-400 text-yellow-400">
            <DialogHeader>
              <DialogTitle>Save Output</DialogTitle>
              <DialogDescription className="text-yellow-400/80">
                Enter a filename for this generated output.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="filename" className="text-right text-yellow-400">
                  Filename
                </Label>
                <Input
                  id="filename"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  className="col-span-3 border-yellow-400 bg-black text-yellow-400 placeholder:text-yellow-400/50"
                  placeholder="e.g., chapter1_ideas.txt"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                 <Button type="button" variant="outline" className="bg-black text-yellow-400 hover:bg-black/80 border-yellow-400">
                   Cancel
                 </Button>
               </DialogClose>
              <Button type="button" onClick={handleSaveConfirm} disabled={isSaving} className="bg-yellow-400 text-black hover:bg-yellow-500">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    }

    export default SaveOutputDialog;