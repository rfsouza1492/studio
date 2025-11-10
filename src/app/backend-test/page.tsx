/**
 * Backend Integration Test Page
 * Demo page to test GoFlow Backend API integration
 */

'use client';

import { useState } from 'react';
import BackendStatus from '@/components/backend/BackendStatus';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useBackendAuth, useDrive, useCalendar } from '@/hooks/use-api';
import apiClient from '@/lib/api-client';
import { Loader2 } from 'lucide-react';

export default function BackendTestPage() {
  const { checkAuthStatus, initiateOAuthLogin } = useBackendAuth();
  const { listFiles, loading: driveLoading, error: driveError, data: driveData } = useDrive();
  const { listEvents, createEvent, loading: calLoading, error: calError, data: calData } = useCalendar();
  
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(false);

  async function handleCheckAuth() {
    setCheckingAuth(true);
    try {
      const status = await checkAuthStatus();
      setAuthStatus(status);
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setCheckingAuth(false);
    }
  }

  async function handleListDrive() {
    try {
      await listFiles(10);
    } catch (error) {
      console.error('Drive list failed:', error);
    }
  }

  async function handleListCalendar() {
    try {
      await listEvents();
    } catch (error) {
      console.error('Calendar list failed:', error);
    }
  }

  async function handleCreateTestEvent() {
    try {
      const event = {
        summary: 'Test Event from GoalFlow',
        description: 'Created via GoFlow Backend API',
        start: {
          dateTime: new Date(Date.now() + 3600000).toISOString(),
        },
        end: {
          dateTime: new Date(Date.now() + 7200000).toISOString(),
        },
      };
      await createEvent(event);
      alert('Event created successfully!');
    } catch (error) {
      console.error('Event creation failed:', error);
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Backend Integration Test</h1>
        <p className="text-muted-foreground">
          Test connection and features of GoFlow Backend API
        </p>
      </div>

      {/* Backend Health Status */}
      <BackendStatus />

      {/* Backend URL Info */}
      <Card>
        <CardHeader>
          <CardTitle>Backend Configuration</CardTitle>
          <CardDescription>Current backend API settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">API URL:</span>{' '}
              <code className="bg-muted px-2 py-1 rounded text-xs">
                {apiClient.getApiUrl()}
              </code>
            </div>
            <div>
              <span className="text-muted-foreground">Backend API Enabled:</span>{' '}
              <Badge variant={apiClient.useBackendApi() ? 'default' : 'secondary'}>
                {apiClient.useBackendApi() ? 'YES' : 'NO'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Authentication Testing */}
      <Card>
        <CardHeader>
          <CardTitle>Authentication Testing</CardTitle>
          <CardDescription>Test backend authentication endpoints</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={handleCheckAuth}
              disabled={checkingAuth}
            >
              {checkingAuth && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Check Auth Status
            </Button>
            
            <Button
              variant="outline"
              onClick={initiateOAuthLogin}
            >
              Login with Google (OAuth)
            </Button>
          </div>

          {authStatus && (
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">Auth Status:</p>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(authStatus, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Google Drive Testing */}
      <Card>
        <CardHeader>
          <CardTitle>Google Drive API</CardTitle>
          <CardDescription>Test Google Drive integration (requires OAuth)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleListDrive}
            disabled={driveLoading}
          >
            {driveLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            List Drive Files
          </Button>

          {driveError && (
            <div className="text-red-500 text-sm">Error: {driveError}</div>
          )}

          {driveData && (
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">Drive Files:</p>
              <pre className="text-xs overflow-auto max-h-60">
                {JSON.stringify(driveData, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Google Calendar Testing */}
      <Card>
        <CardHeader>
          <CardTitle>Google Calendar API</CardTitle>
          <CardDescription>Test Google Calendar integration (requires OAuth)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={handleListCalendar}
              disabled={calLoading}
            >
              {calLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              List Events
            </Button>
            
            <Button
              variant="outline"
              onClick={handleCreateTestEvent}
              disabled={calLoading}
            >
              Create Test Event
            </Button>
          </div>

          {calError && (
            <div className="text-red-500 text-sm">Error: {calError}</div>
          )}

          {calData && (
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">Calendar Events:</p>
              <pre className="text-xs overflow-auto max-h-60">
                {JSON.stringify(calData, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use in Your Components</CardTitle>
          <CardDescription>Integration examples</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-medium mb-2">1. Import the hooks:</p>
              <pre className="bg-muted p-3 rounded text-xs overflow-auto">
{`import { useHealthCheck, useBackendAuth, useDrive, useCalendar } from '@/hooks/use-api';`}
              </pre>
            </div>

            <div>
              <p className="font-medium mb-2">2. Use in your component:</p>
              <pre className="bg-muted p-3 rounded text-xs overflow-auto">
{`function MyComponent() {
  const { checkHealth } = useHealthCheck();
  const { listFiles } = useDrive();
  const { createEvent } = useCalendar();
  
  // Check backend health
  await checkHealth();
  
  // List Google Drive files
  const files = await listFiles(10);
  
  // Create calendar event
  await createEvent({
    summary: 'My Task',
    start: { dateTime: '2025-11-10T10:00:00Z' },
    end: { dateTime: '2025-11-10T11:00:00Z' },
  });
}`}
              </pre>
            </div>

            <div>
              <p className="font-medium mb-2">3. Handle errors:</p>
              <pre className="bg-muted p-3 rounded text-xs overflow-auto">
{`try {
  await checkHealth();
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.status, error.message);
  }
}`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

