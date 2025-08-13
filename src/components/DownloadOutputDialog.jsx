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
    import { Loader2 } from "lucide-react";

    function DownloadOutputDialog({ isOpen, onOpenChange, outputToSave, queryType, defaultFilename }) {
      const [filename, setFilename] = useState("");
      const [isDownloading, setIsDownloading] = useState(false); // Renamed state
      const { toast } = useToast();

      useEffect(() => {
        if (isOpen) {
          // Ensure filename ends with .txt
          const baseFilename = defaultFilename || `${queryType}_output_${Date.now()}`;
          const txtFilename = baseFilename.endsWith('.txt') ? baseFilename : `${baseFilename}.txt`;
          setFilename(txtFilename);
        } else {
          setFilename("");
          setIsDownloading(false);
        }
      }, [isOpen, defaultFilename, queryType]);

      const handleDownloadConfirm = () => {
        if (!filename.trim()) {
          toast({
            title: "Filename Required",
            description: "Please enter a name for your download file.",
            variant: "destructive",
          });
          return;
        }
        if (!outputToSave) {
           toast({
             title: "Error",
             description: "No output content available to download.",
             variant: "destructive",
           });
           return;
         }

        setIsDownloading(true);
        try {
          // Ensure filename ends with .txt
          const finalFilename = filename.trim().endsWith('.txt') ? filename.trim() : `${filename.trim()}.txt`;

          // Create a Blob from the output text
          const blob = new Blob([outputToSave], { type: 'text/plain;charset=utf-8' });

          // Create a temporary URL for the Blob
          const url = URL.createObjectURL(blob);

          // Create a temporary anchor element
          const link = document.createElement('a');
          link.href = url;
          link.download = finalFilename; // Use the state filename

          // Programmatically click the link to trigger the download
          document.body.appendChild(link); // Append link to body
          link.click();

          // Clean up: remove the link and revoke the URL
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          toast({ title: "Download Started", description: `"${finalFilename}" is downloading.` });
          onOpenChange(false); // Close dialog on success

        } catch (error) {
          console.error('Failed to initiate download: ', error);
          toast({ title: "Error", description: "Failed to start download. " + error.message, variant: "destructive" });
        } finally {
          setIsDownloading(false);
        }
      };

      return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-[425px] bg-black border-yellow-400 text-yellow-400">
            <DialogHeader>
              <DialogTitle>Download Output</DialogTitle>
              <DialogDescription className="text-yellow-400/80">
                Enter a filename to download this generated output as a .txt file.
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
              <Button type="button" onClick={handleDownloadConfirm} disabled={isDownloading} className="bg-yellow-400 text-black hover:bg-yellow-500">
                {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Download"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    }

    export default DownloadOutputDialog;