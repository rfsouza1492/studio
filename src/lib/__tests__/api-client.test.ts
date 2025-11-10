/**
 * Tests for API Client
 */

import apiClient, { ApiError } from '../api-client'

// Mock fetch
global.fetch = jest.fn()

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('checkHealth', () => {
    it('should fetch health endpoint successfully', async () => {
      const mockResponse = {
        status: 'ok',
        service: 'goflow',
        environment: 'test',
        uptime: 123,
        timestamp: '2025-11-10T00:00:00Z',
        memory: { used: 10, total: 20 },
      }

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await apiClient.checkHealth()

      expect(result).toEqual(mockResponse)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/health'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          credentials: 'include',
        })
      )
    })

    it('should handle HTTP errors', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ message: 'Server error' }),
      })

      await expect(apiClient.checkHealth()).rejects.toThrow(ApiError)
      await expect(apiClient.checkHealth()).rejects.toThrow('Server error')
    })

    it('should handle network errors', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network failed'))

      await expect(apiClient.checkHealth()).rejects.toThrow(ApiError)
    })
  })

  describe('getApiInfo', () => {
    it('should fetch API info successfully', async () => {
      const mockInfo = {
        message: 'GoFlow API is running',
        version: '1.1.0',
        environment: 'test',
        endpoints: {},
        features: [],
      }

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockInfo,
      })

      const result = await apiClient.getApiInfo()

      expect(result).toEqual(mockInfo)
    })
  })

  describe('ApiError', () => {
    it('should create ApiError with status and message', () => {
      const error = new ApiError(404, 'Not found')

      expect(error.status).toBe(404)
      expect(error.message).toBe('Not found')
      expect(error.name).toBe('ApiError')
    })

    it('should include additional data', () => {
      const additionalData = { field: 'value' }
      const error = new ApiError(400, 'Bad request', additionalData)

      expect(error.data).toEqual(additionalData)
    })
  })

  describe('utility functions', () => {
    it('should return API URL', () => {
      const url = apiClient.getApiUrl()
      expect(typeof url).toBe('string')
    })

    it('should return backend API flag', () => {
      const useApi = apiClient.useBackendApi()
      expect(typeof useApi).toBe('boolean')
    })
  })
})

