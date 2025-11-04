'use client';
import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { addMinutes, formatISO, startOfToday, endOfToday } from 'date-fns';

export interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime: string, date?: null } | { dateTime?: null, date: string };
  end: { dateTime: string, date?: null } | { dateTime?: null, date: string };
}
interface GoogleApiContextType {
  isSignedIn: boolean;
  isGapiReady: boolean;
  signIn: () => void;
  signOut: () => void;
  createEvent: (summary: string, startTime: Date, duration: number) => void;
  listTodayEvents: () => Promise<CalendarEvent[]>;
  user: { name: string; email: string; } | null;
}

const GoogleApiContext = createContext<GoogleApiContextType | undefined>(undefined);

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const CLIENT_ID = '859574091958-fi657c59q9ucnpoun6u9mf9ifptvlssk.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.profile';

declare global {
  interface Window {
    gapi: any;
    google: any;
    initClient: () => void;
  }
}

export const GoogleApiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; } | null>(null);
  const [isGapiReady, setIsGapiReady] = useState(false);

  const updateSigninStatus = useCallback((signedIn: boolean) => {
    setIsSignedIn(signedIn);
    if (signedIn) {
      const gapiAuthInstance = window.gapi.auth2.getAuthInstance();
      const profile = gapiAuthInstance.currentUser.get().getBasicProfile();
      if (profile) {
        setUser({
          name: profile.getName(),
          email: profile.getEmail(),
        });
      }
    } else {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    // Define the callback function on the window object
    window.initClient = () => {
      window.gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        scope: SCOPES,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
      }).then(() => {
        setIsGapiReady(true);
        const authInstance = window.gapi.auth2.getAuthInstance();
        if (authInstance) {
          authInstance.isSignedIn.listen(updateSigninStatus);
          updateSigninStatus(authInstance.isSignedIn.get());
        }
      }).catch((err: any) => {
        console.error("Error initializing gapi client", err);
      });
    };
    
    // Load the GAPI script
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js?onload=initClient';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      // Clean up the script and the global callback
      document.body.removeChild(script);
      delete window.initClient;
    };
  }, [updateSigninStatus]);

  const signIn = () => {
    if (isGapiReady && window.gapi?.auth2) {
      window.gapi.auth2.getAuthInstance().signIn();
    } else {
      console.error("GAPI not ready for sign-in.");
    }
  };

  const signOut = () => {
    if (isGapiReady && window.gapi?.auth2) {
      window.gapi.auth2.getAuthInstance().signOut();
    }
  };
  
  const createEvent = async (summary: string, startTime: Date, duration: number) => {
    if (!isSignedIn || !isGapiReady) return;
    
    const endTime = addMinutes(startTime, duration);

    const event = {
      summary: summary,
      start: {
        dateTime: formatISO(startTime),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: formatISO(endTime),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };

    const request = window.gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });

    request.execute((event: any) => {
      console.log('Event created: ' + event.htmlLink);
    });
  };

  const listTodayEvents = async (): Promise<CalendarEvent[]> => {
    if (!isSignedIn || !isGapiReady) return [];
       
    const todayStart = startOfToday();
    const todayEnd = endOfToday();

    try {
      const response = await window.gapi.client.calendar.events.list({
        'calendarId': 'primary',
        'timeMin': todayStart.toISOString(),
        'timeMax': todayEnd.toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'orderBy': 'startTime'
      });
      return response.result.items as CalendarEvent[];
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      return [];
    }
  };

  return (
    <GoogleApiContext.Provider value={{ isSignedIn, isGapiReady, signIn, signOut, createEvent, listTodayEvents, user }}>
      {children}
    </GoogleApiContext.Provider>
  );
};

export const useGoogleApi = () => {
  const context = useContext(GoogleApiContext);
  if (context === undefined) {
    throw new Error('useGoogleApi must be used within a GoogleApiProvider');
  }
  return context;
};
