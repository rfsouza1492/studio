
'use client';
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { addMinutes, formatISO } from 'date-fns';

interface GoogleApiContextType {
  isSignedIn: boolean;
  signIn: () => void;
  signOut: () => void;
  createEvent: (summary: string, startTime: Date, duration: number) => void;
  user: { name: string; email: string; } | null;
}

const GoogleApiContext = createContext<GoogleApiContextType | undefined>(undefined);

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.profile';

export const GoogleApiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; } | null>(null);
  const [gapi, setGapi] = useState<any>(null);
  const [authInstance, setAuthInstance] = useState<any>(null);

  useEffect(() => {
    import('gapi-script').then((gapiModule) => {
      setGapi(gapiModule.gapi);
    });
  }, []);

  const updateSigninStatus = (signedIn: boolean) => {
    setIsSignedIn(signedIn);
    if (signedIn && authInstance) {
        try {
            const profile = authInstance.currentUser.get().getBasicProfile();
            if (profile) {
                setUser({
                  name: profile.getName(),
                  email: profile.getEmail(),
                });
            }
        } catch (error) {
            console.error("Error getting user profile", error);
            setUser(null);
        }
    } else {
        setUser(null);
    }
  };

  useEffect(() => {
    if (!gapi) return;

    const initClient = () => {
      gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        scope: SCOPES,
      }).then(() => {
        const instance = gapi.auth2.getAuthInstance();
        setAuthInstance(instance);
        if (instance) {
            instance.isSignedIn.listen(updateSigninStatus);
            updateSigninStatus(instance.isSignedIn.get());
        }
      }).catch((error: any) => {
        console.error('Error initializing GAPI client', error);
      });
    };

    gapi.load('client:auth2', initClient);
  }, [gapi]);

  const signIn = () => {
    if (authInstance) {
        authInstance.signIn();
    }
  };

  const signOut = () => {
    if (authInstance) {
        authInstance.signOut();
    }
  };

  const createEvent = (summary: string, startTime: Date, duration: number) => {
    if (!isSignedIn || !gapi || !gapi.client || !gapi.client.calendar) {
      console.log('User not signed in or GAPI not loaded. Cannot create event.');
      return;
    }

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

    const request = gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });

    request.execute((event: any) => {
      console.log('Event created: ' + event.htmlLink);
    });
  };

  return (
    <GoogleApiContext.Provider value={{ isSignedIn, signIn, signOut, createEvent, user }}>
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
