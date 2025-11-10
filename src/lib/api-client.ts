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
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = API_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(408, 'Request timeout');
    }
    throw error;
  }
}

/**
 * Make API request
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

    // Handle non-200 responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        errorData
      );
    }

    // Parse response
    const data = await response.json();
    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other errors
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
  start: { dateTime: string };
  end: { dateTime: string };
}

export async function listCalendarEvents(): Promise<CalendarEvent[]> {
  return apiRequest<CalendarEvent[]>('/api/google/calendar/events');
}

export async function createCalendarEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
  return apiRequest<CalendarEvent>('/api/google/calendar/events', {
    method: 'POST',
    body: JSON.stringify(event),
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
  createCalendarEvent,
  
  // Utils
  useBackendApi,
  getApiUrl,
};

export default apiClient;

