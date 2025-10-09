import React from "react";
    import { useToast } from "@/components/ui/use-toast";

    const backgroundImageUrl = "https://oirtcplqedetfhzrdgas.supabase.co/storage/v1/object/public/background-image/Wallpaper_new.jpg";

    export function useBackgroundImage() {
      const { toast } = useToast();
      const [isBackgroundLoaded, setIsBackgroundLoaded] = React.useState(false);

      React.useEffect(() => {
        const img = new Image();
        img.crossOrigin = "anonymous"; // Ensure CORS compatibility if needed
        img.src = backgroundImageUrl;

        const handleLoad = () => {
          setIsBackgroundLoaded(true);
        };

        const handleError = (error) => {
          console.error('Error loading background image:', error);
          setIsBackgroundLoaded(false); // Ensure it falls back if loading fails
          toast({
            title: "Notice",
            description: "Using fallback background style.",
            variant: "default", // Use default (green) or a custom variant if needed
          });
        };

        img.addEventListener('load', handleLoad);
        img.addEventListener('error', handleError);

        // Cleanup function
        return () => {
          img.removeEventListener('load', handleLoad);
          img.removeEventListener('error', handleError);
        };
      }, [toast]); // Only re-run if toast function instance changes (rare)

      return { isBackgroundLoaded, backgroundImageUrl };
    }