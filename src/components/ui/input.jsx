import React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-xl border border-yellow-400/30 bg-black/40 px-4 py-3 text-sm text-yellow-400",
        "placeholder:text-yellow-400/50 backdrop-blur-sm",
        "transition-all duration-250 ease-out",
        "focus-visible:outline-none focus-visible:border-yellow-400/60",
        "focus-visible:shadow-[0_0_0_3px_rgba(255,212,0,0.1),0_0_12px_rgba(255,212,0,0.2)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };