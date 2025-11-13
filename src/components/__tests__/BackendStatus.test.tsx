/**
 * Tests for BackendStatus Component
 */

import React from 'react'
import { render, screen, waitFor } from '@/test-utils'
import '@testing-library/jest-dom'
import BackendStatus from '../backend/BackendStatus'
import * as useApiHooks from '@/hooks/use-api'

// Mock the hooks
jest.mock('@/hooks/use-api')

describe('BackendStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should show loading state initially', () => {
    ;(useApiHooks.useBackendAvailable as jest.Mock).mockReturnValue({
      available: null,
      checking: true,
    })
    ;(useApiHooks.useHealthCheck as jest.Mock).mockReturnValue({
      data: null,
      loading: false,
      error: null,
      checkHealth: jest.fn(),
    })
    ;(useApiHooks.useApiInfo as jest.Mock).mockReturnValue({
      data: null,
      loading: false,
      error: null,
    })

    render(<BackendStatus />)

    expect(screen.getByText(/Checking Backend Connection/i)).toBeInTheDocument()
  })

  it('should show not configured message when backend unavailable', () => {
    ;(useApiHooks.useBackendAvailable as jest.Mock).mockReturnValue({
      available: false,
      checking: false,
    })
    ;(useApiHooks.useHealthCheck as jest.Mock).mockReturnValue({
      data: null,
      loading: false,
      error: null,
      checkHealth: jest.fn(),
    })
    ;(useApiHooks.useApiInfo as jest.Mock).mockReturnValue({
      data: null,
      loading: false,
      error: null,
    })

    render(<BackendStatus />)

    expect(screen.getByText(/Backend API Not Configured/i)).toBeInTheDocument()
  })

  it('should show health data when available', async () => {
    const mockHealthData = {
      status: 'ok',
      service: 'goflow',
      environment: 'production',
      uptime: 123.45,
      timestamp: '2025-11-10T00:00:00Z',
      memory: { used: 15, total: 20 },
    }

    ;(useApiHooks.useBackendAvailable as jest.Mock).mockReturnValue({
      available: true,
      checking: false,
    })
    ;(useApiHooks.useHealthCheck as jest.Mock).mockReturnValue({
      data: mockHealthData,
      loading: false,
      error: null,
      checkHealth: jest.fn(),
    })
    ;(useApiHooks.useApiInfo as jest.Mock).mockReturnValue({
      data: null,
      loading: false,
      error: null,
    })

    render(<BackendStatus />)

    expect(screen.getByText(/Backend Health/i)).toBeInTheDocument()
    // Check for service name in the Service field
    const serviceElements = screen.getAllByText(/goflow/i)
    expect(serviceElements.length).toBeGreaterThan(0)
    expect(screen.getByText(/123s/i)).toBeInTheDocument()
  })

  it('should show error when health check fails', () => {
    ;(useApiHooks.useBackendAvailable as jest.Mock).mockReturnValue({
      available: true,
      checking: false,
    })
    ;(useApiHooks.useHealthCheck as jest.Mock).mockReturnValue({
      data: null,
      loading: false,
      error: 'Connection failed',
      checkHealth: jest.fn(),
    })
    ;(useApiHooks.useApiInfo as jest.Mock).mockReturnValue({
      data: null,
      loading: false,
      error: null,
    })

    render(<BackendStatus />)

    expect(screen.getByText(/Connection failed/i)).toBeInTheDocument()
  })
})

