"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

const LoginPage: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is logged in, redirect to dashboard
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // The useEffect hook will handle the redirect upon successful login
    } catch (error) {
      console.error("Error signing in with Google: ", error);
      // Optionally, show an error message to the user
    }
  };
  
  // Don't render anything while checking auth state
  if (loading || user) {
    return <div>Loading...</div>; // Or a spinner component
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome to GoalFlow</h1>
        <p className="mb-6">Please sign in to continue</p>
        <Button onClick={handleSignIn}>
          Sign in with Google
        </Button>
      </div>
    </div>
  );
};

export default LoginPage;
