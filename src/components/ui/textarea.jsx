import React from "react";
    import { cn } from "@/lib/utils";
    import TextareaAutosize from "react-textarea-autosize";

    const Textarea = React.forwardRef(({ className, ...props }, ref) => {
      return (
        <TextareaAutosize
          className={cn(
            "flex w-full rounded-xl border border-yellow-400/30 bg-black/40 px-4 py-3 text-sm text-yellow-400",
            "placeholder:text-yellow-400/50 backdrop-blur-sm",
            "transition-all duration-250 ease-out",
            "focus-visible:outline-none focus-visible:border-yellow-400/60",
            "focus-visible:shadow-[0_0_0_3px_rgba(255,212,0,0.1),0_0_12px_rgba(255,212,0,0.2)]",
            "disabled:cursor-not-allowed disabled:opacity-50",
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