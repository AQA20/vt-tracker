'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check persist rehydration or token
    const checkAuth = async () => {
         // Wait for store to be hydrated/ready
         if (!useAuthStore.persist.hasHydrated()) {
             await useAuthStore.persist.onFinishHydration;
         }
         
         // Double check with a small delay for state propagation
         await new Promise(resolve => setTimeout(resolve, 50));
         
         const state = useAuthStore.getState();
         if (!state.isAuthenticated) {
             router.replace('/login');
         }
         setIsChecking(false);
    };
    checkAuth();
  }, [router, isAuthenticated]);

  if (isChecking) {
      return (
          <div className="flex h-screen w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      )
  }

  return <>{children}</>;
}
