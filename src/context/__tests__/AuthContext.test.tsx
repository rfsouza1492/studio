/**
 * AuthContext Tests
 * Tests for Firebase Authentication context
 */

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';

// Mock Firebase
jest.mock('@/firebase', () => ({
  useUser: () => ({ user: null, isUserLoading: false }),
  useAuth: () => ({
    signOut: jest.fn(),
  }),
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  GoogleAuthProvider: jest.fn(() => ({})),
  signInWithRedirect: jest.fn(),
  getRedirectResult: jest.fn(() => Promise.resolve(null)),
}));

describe('AuthContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  describe('Initial State', () => {
    it('should provide user as null initially', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user).toBeNull();
      expect(result.current.loading).toBe(false);
    });

    it('should provide all auth functions', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(typeof result.current.signOut).toBe('function');
      expect(result.current.googleApiToken).toBeNull();
    });
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleError = console.error;
      console.error = jest.fn();

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');

      console.error = consoleError;
    });
  });

  describe('Auth Functions', () => {
    it('should have signOut function', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.signOut).toBeDefined();
      expect(typeof result.current.signOut).toBe('function');
    });

    it('should manage loading state', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(typeof result.current.loading).toBe('boolean');
    });

    it('should manage googleApiToken state', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.googleApiToken).toBeNull();
    });
  });

  describe('User State', () => {
    it('should provide user object', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Initially null (mocked)
      expect(result.current.user).toBeNull();
    });

    it('should handle user loading state', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Should not be loading (mocked as false)
      expect(result.current.loading).toBe(false);
    });
  });

  describe('Integration', () => {
    it('should integrate with Firebase Auth', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Context should be properly initialized
      expect(result.current).toBeDefined();
      expect(result.current).toHaveProperty('user');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('signOut');
      expect(result.current).toHaveProperty('googleApiToken');
    });

    it('should provide context value structure', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      const expectedKeys = ['user', 'loading', 'signOut', 'googleApiToken'];
      const actualKeys = Object.keys(result.current);

      expectedKeys.forEach(key => {
        expect(actualKeys).toContain(key);
      });
    });
  });
});

