import React from "react";
    import { cn } from "@/lib/utils";
    import TextareaAutosize from "react-textarea-autosize";

    const Textarea = React.forwardRef(({ className, ...props }, ref) => {
      return (
        <TextareaAutosize
          className={cn(
            "flex w-full rounded-md border border-yellow-400 bg-black px-3 py-2 text-sm text-yellow-400 ring-offset-background placeholder:text-yellow-400/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            "min-h-[80px]", 
            className
          )}
          ref={ref}
          {...props}
        />
      );
    });
    Textarea.displayName = "Textarea";

    export { Textarea };