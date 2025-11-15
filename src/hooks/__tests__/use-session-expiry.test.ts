/**
 * Tests for session expiry hook
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useSessionExpiry } from '../use-session-expiry';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

jest.mock('@/hooks/use-toast');
jest.mock('@/context/AuthContext');

const mockToast = jest.fn();
const mockUser = {
  uid: 'test-uid',
  email: 'test@example.com',
  metadata: {
    lastSignInTime: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(), // 23 hours ago
  },
} as any;

describe('useSessionExpiry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('should calculate expiry time from user last sign in', () => {
    const { result } = renderHook(() => useSessionExpiry());

    expect(result.current.expiresAt).not.toBeNull();
    expect(result.current.timeRemaining).toBeGreaterThan(0);
  });

  test('should return null expiry when user is not logged in', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });

    const { result } = renderHook(() => useSessionExpiry());

    expect(result.current.expiresAt).toBeNull();
    expect(result.current.timeRemaining).toBeNull();
  });

  test('should show warning when within 5 minutes of expiry', async () => {
    // Set user to expire in 4 minutes
    const fourMinutesAgo = Date.now() - (24 * 60 * 60 * 1000 - 4 * 60 * 1000);
    const mockUserNearExpiry = {
      ...mockUser,
      metadata: {
        lastSignInTime: new Date(fourMinutesAgo).toISOString(),
      },
    };
    (useAuth as jest.Mock).mockReturnValue({ user: mockUserNearExpiry });

    renderHook(() => useSessionExpiry());

    // Advance time to trigger warning
    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Sessão expirando em breve',
          variant: 'destructive',
        })
      );
    });
  });

  test('should not show warning when session is valid', () => {
    // Set user to expire in 2 hours
    const twoHoursAgo = Date.now() - (24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000);
    const mockUserValid = {
      ...mockUser,
      metadata: {
        lastSignInTime: new Date(twoHoursAgo).toISOString(),
      },
    };
    (useAuth as jest.Mock).mockReturnValue({ user: mockUserValid });

    renderHook(() => useSessionExpiry());

    jest.advanceTimersByTime(60000); // 1 minute

    expect(mockToast).not.toHaveBeenCalled();
  });

  test('should format time remaining correctly', () => {
    const { result } = renderHook(() => useSessionExpiry());

    if (result.current.timeRemaining) {
      const formatted = result.current.formatTimeRemaining(result.current.timeRemaining);
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    }
  });

  test('should mark as expired when time remaining is 0', () => {
    // Set user to already expired
    const expiredTime = Date.now() - 25 * 60 * 60 * 1000; // 25 hours ago
    const mockUserExpired = {
      ...mockUser,
      metadata: {
        lastSignInTime: new Date(expiredTime).toISOString(),
      },
    };
    (useAuth as jest.Mock).mockReturnValue({ user: mockUserExpired });

    const { result } = renderHook(() => useSessionExpiry());

    expect(result.current.isExpired).toBe(true);
    expect(result.current.showWarning).toBe(true);
  });
});

