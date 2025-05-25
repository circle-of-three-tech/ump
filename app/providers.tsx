'use client';

import { SessionProvider } from 'next-auth/react';
// import { AuthProvider } from './lib/contexts/auth-context';
// import { FirebaseProvider } from './lib/contexts/firebase-context';
import { Toaster } from 'sonner';
// import { ThemeProvider } from '@/app/components/theme-provider';
// import { Provider as ReduxProvider } from 'react-redux';
// import { store } from './lib/store';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider session={null}>
      {/* <ReduxProvider store={store}>
        <ThemeProvider 
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <FirebaseProvider>*/}
              {children}
              <Toaster />
            {/* </FirebaseProvider> 
          </AuthProvider>
        </ThemeProvider>
      </ReduxProvider>*/}
    </SessionProvider>
  );
}
