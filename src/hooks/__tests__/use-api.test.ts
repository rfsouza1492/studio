/**
 * Tests for Backend API Hooks
 */

import { renderHook, waitFor } from '@testing-library/react'
import { useHealthCheck, useBackendAvailable } from '../use-api'
import apiClient, { ApiError } from '@/lib/api-client'

// Mock the API client
jest.mock('@/lib/api-client', () => {
  class ApiError extends Error {
    constructor(public status: number, message: string, public data?: any) {
      super(message);
      this.name = 'ApiError';
    }
  }
  
  return {
    __esModule: true,
    default: {
      checkHealth: jest.fn(),
      useBackendApi: jest.fn(() => false),
    },
    ApiError,
  };
})

describe('useHealthCheck', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with null data and not loading', () => {
    const { result } = renderHook(() => useHealthCheck())

    expect(result.current.data).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should check health successfully', async () => {
    const mockHealthData = {
      status: 'ok',
      service: 'goflow',
      environment: 'test',
      uptime: 123,
      timestamp: '2025-11-10T00:00:00Z',
      memory: { used: 10, total: 20 },
    }

    ;(apiClient.checkHealth as jest.Mock).mockResolvedValue(mockHealthData)

    const { result } = renderHook(() => useHealthCheck())

    expect(result.current.loading).toBe(false)

    await result.current.checkHealth()

    await waitFor(() => {
      expect(result.current.data).toEqual(mockHealthData)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  it('should handle errors', async () => {
    const error = new ApiError(500, 'Network error')
    ;(apiClient.checkHealth as jest.Mock).mockRejectedValue(error)

    const { result } = renderHook(() => useHealthCheck())

    await expect(result.current.checkHealth()).rejects.toThrow()

    await waitFor(() => {
      expect(result.current.data).toBeNull()
      expect(result.current.error).toBe('Network error')
      expect(result.current.loading).toBe(false)
    })
  })
})

describe('useBackendAvailable', () => {
  it('should return false when backend API is disabled', async () => {
    ;(apiClient.useBackendApi as jest.Mock).mockReturnValue(false)

    const { result } = renderHook(() => useBackendAvailable())

    await waitFor(() => {
      expect(result.current.checking).toBe(false)
      expect(result.current.available).toBe(false)
    })
  })

  it('should check backend availability when enabled', async () => {
    ;(apiClient.useBackendApi as jest.Mock).mockReturnValue(true)
    ;(apiClient.checkHealth as jest.Mock).mockResolvedValue({ status: 'ok' })

    const { result } = renderHook(() => useBackendAvailable())

    await waitFor(() => {
      expect(result.current.checking).toBe(false)
      expect(result.current.available).toBe(true)
    })
  })
})

