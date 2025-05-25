import { useEffect, useState } from 'react';
import { Loader2 } from "lucide-react";

const proverbs = [
  "Patience is not the ability to wait, but the ability to keep a good attitude while waiting.",
  "Knowledge is power, but wisdom is knowing how to use it.",
  "The journey of a thousand miles begins with a single step.",
  "A smooth sea never made a skilled sailor.",
  "The best time to plant a tree was 20 years ago. The second best time is now.",
  "When the winds of change blow, some people build walls and others build windmills.",
  "Fall seven times, stand up eight.",
  "Where there's a will, there's a way.",
  "Don't count your chickens before they hatch.",
  "The early bird catches the worm.",
];

export function LoadingScreen({ isLoading }: { isLoading: boolean }) {
  const [currentProverb, setCurrentProverb] = useState(proverbs[0]);

  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setCurrentProverb(prev => {
        const currentIndex = proverbs.indexOf(prev);
        const nextIndex = (currentIndex + 1) % proverbs.length;
        return proverbs[nextIndex];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div 
      className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center transition-opacity duration-300 ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="absolute -bottom-2 left-1/2 h-1 w-12 -translate-x-1/2 transform">
            <div className="h-full w-full animate-pulse rounded-full bg-primary/50" />
          </div>
        </div>
        <p className="text-muted-foreground text-center max-w-md animate-fade px-4">
          {currentProverb}
        </p>
      </div>
    </div>
  );
}
