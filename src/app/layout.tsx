import type { Metadata } from 'next';
import './globals.css';
import { GoalProvider } from '@/context/GoalContext';
import { Toaster } from '@/components/ui/toaster';
import { GoogleApiProvider } from '@/context/GoogleApiContext';

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
      <body className="font-body antialiased">
        <GoogleApiProvider>
          <GoalProvider>
            {children}
            <Toaster />
          </GoalProvider>
        </GoogleApiProvider>
      </body>
    </html>
  );
}
