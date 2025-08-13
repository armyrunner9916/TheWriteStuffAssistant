import React from "react";
    import { Button } from "@/components/ui/button";
    import { Input } from "@/components/ui/input";
    import mammoth from "mammoth";
    import { useToast } from "@/components/ui/use-toast"; // Added useToast

    // Simplified FileUploadForm: Only handles file selection and reading.
    // Passes content back via onFileRead prop.
    function FileUploadForm({ onFileRead, promptText = "Upload File" }) { // Added default promptText
      const [fileName, setFileName] = React.useState("");
      const fileInputRef = React.useRef(null);
      const { toast } = useToast(); // Added toast

      const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setFileName(file.name);

        try {
          if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer });
            onFileRead(result.value);
          } else if (file.type === "text/plain") { // Only allow .txt and .docx
            const reader = new FileReader();
            reader.onload = (e) => {
              onFileRead(e.target.result);
            };
            reader.readAsText(file);
          } else {
             toast({ // Inform user about unsupported file type
                title: "Unsupported File Type",
                description: "Please upload a .txt or .docx file.",
                variant: "destructive",
             });
             setFileName(""); // Reset filename display
             if (fileInputRef.current) {
                fileInputRef.current.value = ""; // Clear the file input
             }
          }
        } catch (error) {
            console.error("Error reading file:", error);
            toast({
              title: "Error Reading File",
              description: "Could not process the uploaded file.",
              variant: "destructive",
            });
            setFileName("");
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
      };

      return (
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Input
            type="file"
            onChange={handleFileChange}
            ref={fileInputRef}
            accept=".txt,.docx" // Specify accepted types
            className="hidden" // Hide the default input visually
          />
          <Button
            type="button" // Important: prevent form submission
            onClick={() => fileInputRef.current?.click()}
            className="bg-black text-yellow-400 hover:bg-black/80 border-2 border-yellow-400 w-full sm:w-40"
            variant="outline" // Use outline style for secondary action
          >
            {promptText}
          </Button>
          {fileName && (
            <span className="text-sm text-muted-foreground truncate">
              Selected: {fileName}
            </span>
          )}
        </div>
      );
    }

    export default FileUploadForm;