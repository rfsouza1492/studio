/**
 * Backend Status Component
 * Displays connection status with GoFlow Backend API
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useHealthCheck, useApiInfo, useBackendAvailable } from '@/hooks/use-api';
import { CheckCircle2, XCircle, Loader2, RefreshCw } from 'lucide-react';

export default function BackendStatus() {
  const { available, checking } = useBackendAvailable();
  const { data: healthData, loading: healthLoading, error: healthError, checkHealth } = useHealthCheck();
  const { data: apiInfo, loading: apiLoading, error: apiError } = useApiInfo();

  // Auto-check health on mount
  useEffect(() => {
    if (available) {
      checkHealth();
    }
  }, [available, checkHealth]);

  if (checking) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Checking Backend Connection...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!available) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-yellow-500" />
            Backend API Not Configured
          </CardTitle>
          <CardDescription>
            Using Firebase only (client-side). To enable backend API, set NEXT_PUBLIC_USE_BACKEND_API=true
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Health Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {healthLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : healthError ? (
                <XCircle className="h-5 w-5 text-red-500" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
              Backend Health
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => checkHealth()}
              disabled={healthLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${healthLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <CardDescription>
            Connection status with GoFlow Backend API
          </CardDescription>
        </CardHeader>
        <CardContent>
          {healthError && (
            <div className="text-red-500 text-sm">
              Error: {healthError}
            </div>
          )}
          
          {healthData && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={healthData.status === 'ok' ? 'default' : 'destructive'}>
                  {healthData.status.toUpperCase()}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {healthData.environment}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Service</p>
                  <p className="font-medium">{healthData.service}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Uptime</p>
                  <p className="font-medium">{Math.floor(healthData.uptime)}s</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Memory</p>
                  <p className="font-medium">{healthData.memory.used}MB / {healthData.memory.total}MB</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Timestamp</p>
                  <p className="font-medium text-xs">{new Date(healthData.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Info */}
      {apiInfo && !apiLoading && !apiError && (
        <Card>
          <CardHeader>
            <CardTitle>API Information</CardTitle>
            <CardDescription>Backend version and features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Version</p>
                <p className="font-medium">{apiInfo.version}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-2">Features</p>
                <div className="flex flex-wrap gap-2">
                  {apiInfo.features.map((feature: string) => (
                    <Badge key={feature} variant="secondary">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Endpoints</p>
                <div className="text-xs space-y-1">
                  {Object.entries(apiInfo.endpoints).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-muted-foreground">{key}:</span>
                      <code className="bg-muted px-1 py-0.5 rounded">{value as string}</code>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

