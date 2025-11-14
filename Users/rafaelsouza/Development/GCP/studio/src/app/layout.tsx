import type { Metadata } from 'next';
import './globals.css';
import '@/lib/error-handler'; // Import global error handler
import { Toaster } from '@/components/ui/toaster';
import { GoalProvider } from '@/context/GoalContext';
import { AuthProvider } from '@/context/AuthContext';
import { FirebaseClientProvider } from '@/firebase';
import PrivateRoute from '@/components/auth/PrivateRoute';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

export const metadata: Metadata = {
  title: 'GoalFlow',
  description: 'Track your goals and tasks with ease.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to critical third-party origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Preconnect to Firebase domains for faster auth */}
        <link rel="preconnect" href="https://magnetai-4h4a8.firebaseapp.com" />
        <link rel="preconnect" href="https://www.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        
        {/* Load Google Fonts with display=swap to prevent render blocking */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <FirebaseClientProvider>
          <AuthProvider>
            <GoalProvider>
                <PrivateRoute>
                    {children}
                </PrivateRoute>
              <Toaster />
              <FirebaseErrorListener />
            </GoalProvider>
          </AuthProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
