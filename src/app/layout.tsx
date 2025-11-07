import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { GoalProvider } from '@/context/GoalContext';
import { AuthProvider } from '@/context/AuthContext';
import PrivateRoute from '@/components/auth/PrivateRoute';

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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <AuthProvider>
          <GoalProvider>
            <PrivateRoute>
              {children}
            </PrivateRoute>
            <Toaster />
          </GoalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
