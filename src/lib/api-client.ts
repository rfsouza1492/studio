/**
 * API Client for GoFlow Backend
 * Handles HTTP requests to the Express backend API
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000');
const USE_BACKEND_API = process.env.NEXT_PUBLIC_USE_BACKEND_API === 'true';

/**
 * API Error class
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Fetch with timeout
 * Always ensures a response is returned, even if the request is cancelled
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = API_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    
    // Clear timeout on successful fetch
    clearTimeout(timeoutId);
    
    // Check if request was aborted after fetch but before processing
    // This can happen if abort happens between fetch completion and response processing
    if (controller.signal.aborted) {
      // Request was cancelled, but we got a response - still process it
      // unless it's a critical cancellation
      if (options.signal && (options.signal as AbortSignal).aborted) {
        throw new ApiError(408, 'Request was cancelled');
      }
    }
    
    return response;
  } catch (error) {
    // Always clear timeout in catch block
    clearTimeout(timeoutId);
    
    // Handle abort errors (timeout or manual cancellation)
    if (error instanceof Error) {
      // Check for abort errors first
      if (error.name === 'AbortError' || controller.signal.aborted) {
        // Always provide a response, even for cancelled requests
        throw new ApiError(408, 'Request timeout or cancelled');
      }
      
      // Handle network errors that might indicate closed connection
      // These errors often occur when message ports close unexpectedly
      if (error.message.includes('Failed to fetch') || 
          error.message.includes('NetworkError') ||
          error.message.includes('message port closed') ||
          error.message.includes('The message port closed')) {
        throw new ApiError(503, 'Network error: Unable to connect to server');
      }
    }
    
    // Re-throw if not handled above
    throw error;
  }
}

/**
 * Make API request
 * Always ensures a response is returned, even on error or cancellation
 * Similar to Chrome extension message listener pattern: always call sendResponse()
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const url = `${API_URL}${endpoint}`;
    
    const response = await fetchWithTimeout(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for session
    });

    // Check if response body is readable before parsing
    if (!response.body) {
      // Always provide a response, even for empty bodies
      throw new ApiError(500, 'Empty response from server');
    }

    // Handle non-200 responses
    if (!response.ok) {
      let errorData: any = {};
      try {
        // Only try to parse JSON if content-type indicates JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
        } else {
          const text = await response.text();
          errorData = { message: text || response.statusText };
        }
      } catch (parseError) {
        // If parsing fails, use status text - always provide a response
        errorData = { message: response.statusText || 'Unknown error' };
      }
      
      // Always throw an ApiError (this is our "sendResponse" equivalent)
      throw new ApiError(
        response.status,
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        errorData
      );
    }

    // Parse response
    let data: T;
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        // Try to parse as JSON, fallback to text
        try {
          data = JSON.parse(text) as T;
        } catch {
          // Always provide a response, even if parsing fails
          throw new ApiError(500, 'Invalid JSON response from server');
        }
      }
    } catch (parseError) {
      // Re-throw ApiError as-is (already has a response)
      if (parseError instanceof ApiError) {
        throw parseError;
      }
      // Always provide a response for parse errors
      throw new ApiError(500, 'Failed to parse response from server');
    }
    
    // Success - return data (this is our successful "sendResponse")
    return data;
  } catch (error) {
    // Pattern: Always send a response, even on error
    // Similar to Chrome extension: sendResponse({ error: ... })
    
    // Re-throw ApiError as-is (already has proper response)
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle abort/cancellation errors - always provide a response
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.message.includes('aborted')) {
        // Always send response for cancelled requests
        throw new ApiError(408, 'Request was cancelled');
      }
      
      // Handle network errors - always provide a response
      if (error.message.includes('Failed to fetch') ||
          error.message.includes('NetworkError') ||
          error.message.includes('message port closed') ||
          error.message.includes('The message port closed') ||
          error.message.includes('Network request failed')) {
        // Always send response for network errors
        throw new ApiError(503, 'Network error: Unable to connect to server');
      }
    }
    
    // Unknown errors - always provide a response
    // This ensures we never have an unhandled promise rejection
    throw new ApiError(
      500,
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
  }
}

/**
 * Check if backend API should be used
 */
export function useBackendApi(): boolean {
  return USE_BACKEND_API;
}

/**
 * Get API base URL
 */
export function getApiUrl(): string {
  return API_URL;
}

// ===================
// Health & Status
// ===================

export interface HealthResponse {
  status: string;
  timestamp: string;
  service: string;
  environment: string;
  uptime: number;
  memory: {
    used: number;
    total: number;
  };
}

export async function checkHealth(): Promise<HealthResponse> {
  return apiRequest<HealthResponse>('/health');
}

export interface ApiInfo {
  message: string;
  environment: string;
  version: string;
  endpoints: Record<string, string>;
  features: string[];
}

export async function getApiInfo(): Promise<ApiInfo> {
  return apiRequest<ApiInfo>('/api/info');
}

// ===================
// Authentication
// ===================

export interface AuthStatus {
  authenticated: boolean;
  user: {
    id: string;
    email: string;
    name: string;
    picture?: string;
  } | null;
}

export async function getAuthStatus(): Promise<AuthStatus> {
  return apiRequest<AuthStatus>('/auth/firebase/status');
}

export async function loginWithEmail(email: string, password: string) {
  return apiRequest('/auth/firebase/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function registerUser(email: string, password: string, displayName?: string) {
  return apiRequest('/auth/firebase/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, displayName }),
  });
}

export async function logout() {
  return apiRequest('/auth/firebase/logout', {
    method: 'POST',
  });
}

// ===================
// OAuth 2.0
// ===================

export function initiateOAuthLogin(): void {
  window.location.href = `${API_URL}/auth/oauth/login`;
}

export async function getOAuthStatus(): Promise<AuthStatus> {
  return apiRequest<AuthStatus>('/auth/oauth/status');
}

export async function logoutOAuth() {
  return apiRequest('/auth/oauth/logout', {
    method: 'POST',
  });
}

// ===================
// Google APIs (Protected)
// ===================

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime: string;
  modifiedTime: string;
  size?: number;
  webViewLink?: string;
}

export interface DriveFilesResponse {
  files: DriveFile[];
  nextPageToken?: string;
}

export async function listDriveFiles(pageSize = 10, pageToken?: string): Promise<DriveFilesResponse> {
  const params = new URLSearchParams({ pageSize: pageSize.toString() });
  if (pageToken) params.append('pageToken', pageToken);
  
  return apiRequest<DriveFilesResponse>(`/api/google/drive/files?${params}`);
}

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  recurrence?: string[];
  htmlLink?: string;
  attendees?: Array<{ email: string }>;
}

export interface CalendarEventsResponse {
  events: CalendarEvent[];
}

export async function listCalendarEvents(maxResults = 10, timeMin?: string, timeMax?: string): Promise<CalendarEventsResponse> {
  const params = new URLSearchParams({ maxResults: maxResults.toString() });
  if (timeMin) params.append('timeMin', timeMin);
  if (timeMax) params.append('timeMax', timeMax);
  
  return apiRequest<CalendarEventsResponse>(`/api/google/calendar/events?${params}`);
}

export async function getCalendarEvent(eventId: string): Promise<CalendarEvent> {
  return apiRequest<CalendarEvent>(`/api/google/calendar/events/${eventId}`);
}

export interface CreateCalendarEventData {
  summary: string;
  description?: string;
  location?: string;
  startTime: string;
  endTime: string;
  attendees?: Array<{ email: string }>;
  recurrence?: string;
}

export async function createCalendarEvent(event: CreateCalendarEventData): Promise<CalendarEvent> {
  return apiRequest<CalendarEvent>('/api/google/calendar/events', {
    method: 'POST',
    body: JSON.stringify(event),
  });
}

export interface UpdateCalendarEventData {
  summary?: string;
  description?: string;
  location?: string;
  startTime?: string;
  endTime?: string;
  attendees?: Array<{ email: string }>;
  recurrence?: string | null;
}

export async function updateCalendarEvent(eventId: string, event: UpdateCalendarEventData): Promise<CalendarEvent> {
  return apiRequest<CalendarEvent>(`/api/google/calendar/events/${eventId}`, {
    method: 'PUT',
    body: JSON.stringify(event),
  });
}

export interface DeleteEventResponse {
  success: boolean;
  message: string;
  eventId: string;
}

export async function deleteCalendarEvent(eventId: string): Promise<DeleteEventResponse> {
  return apiRequest<DeleteEventResponse>(`/api/google/calendar/events/${eventId}`, {
    method: 'DELETE',
  });
}

// ===================
// Export all
// ===================

const apiClient = {
  // Health & Status
  checkHealth,
  getApiInfo,
  
  // Authentication
  getAuthStatus,
  loginWithEmail,
  registerUser,
  logout,
  
  // OAuth
  initiateOAuthLogin,
  getOAuthStatus,
  logoutOAuth,
  
  // Google APIs
  listDriveFiles,
  listCalendarEvents,
  getCalendarEvent,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  
  // Utils
  useBackendApi,
  getApiUrl,
};

export default apiClient;

