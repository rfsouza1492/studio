/**
 * Test Utilities
 * Helper functions and wrappers for testing React components
 */

import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { AuthProvider } from '@/context/AuthContext'
import { GoalProvider } from '@/context/GoalContext'
import { FirebaseClientProvider } from '@/firebase'

// Mock providers for testing
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <FirebaseClientProvider>
      <AuthProvider>
        <GoalProvider>
          {children}
        </GoalProvider>
      </AuthProvider>
    </FirebaseClientProvider>
  )
}

/**
 * Custom render with all providers
 */
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

/**
 * Mock user for testing
 */
export const mockUser = {
  uid: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: 'https://example.com/photo.jpg',
}

/**
 * Mock goal for testing
 */
export const mockGoal = {
  id: 'goal-123',
  name: 'Test Goal',
  kpiName: 'Pages Read',
  kpiTarget: 100,
  kpiCurrent: 50,
  userId: 'test-user-123',
}

/**
 * Mock task for testing
 */
export const mockTask = {
  id: 'task-123',
  title: 'Test Task',
  goalId: 'goal-123',
  completed: false,
  priority: 'alta' as const,
  dueDate: new Date('2025-11-15'),
  recurrence: 'none' as const,
  duration: 60,
  userId: 'test-user-123',
}

/**
 * Wait for async updates
 */
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0))

