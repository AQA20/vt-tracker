'use client';

import React, { useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useErrorStore } from '@/store/useErrorStore';
import { AlertCircle, X } from 'lucide-react';

export function GlobalError() {
  const { error, clearError } = useErrorStore();
  const [isHovered, setIsHovered] = React.useState(false);

  useEffect(() => {
    if (error && !isHovered) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError, isHovered]);

  if (!error) return null;

  return (
    <div 
      className="fixed top-4 inset-x-4 md:inset-x-auto md:right-4 z-[100] md:max-w-md animate-in fade-in slide-in-from-top-4 duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Alert variant="destructive" className="relative pr-10 bg-destructive text-destructive-foreground shadow-lg border-none">
        <AlertCircle className="h-4 w-4 !text-destructive-foreground" />
        <AlertTitle className="text-destructive-foreground font-bold">Error</AlertTitle>
        <AlertDescription className="text-destructive-foreground/90">{error}</AlertDescription>
        <button
          onClick={clearError}
          className="absolute top-2 right-2 h-8 w-8 flex items-center justify-center rounded-md transition-colors hover:bg-white/20 text-destructive-foreground focus:outline-none !pl-0"
          aria-label="Close error"
        >
          <X className="h-4 w-4" />
        </button>
      </Alert>
    </div>
  );
}
