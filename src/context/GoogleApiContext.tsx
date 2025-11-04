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
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

export const GoogleApiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gapi, setGapi] = useState<any>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; } | null>(null);

  useEffect(() => {
    import('gapi-script').then((gapiModule) => {
        const gapiInstance = gapiModule.gapi;
        setGapi(gapiInstance);

        const start = () => {
        gapiInstance.client
            .init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            scope: SCOPES,
            })
            .then(() => {
            const authInstance = gapiInstance.auth2.getAuthInstance();
            setIsSignedIn(authInstance.isSignedIn.get());
            authInstance.isSignedIn.listen(updateSigninStatus);
            if (authInstance.isSignedIn.get()) {
                const profile = authInstance.currentUser.get().getBasicProfile();
                setUser({
                name: profile.getName(),
                email: profile.getEmail(),
                });
            }
            })
            .catch((error: any) => {
            console.error('Error initializing GAPI client', error);
            });
        };

        gapiInstance.load('client:auth2', start);
    });
  }, []);

  const updateSigninStatus = (signedIn: boolean) => {
    setIsSignedIn(signedIn);
    if (signedIn && gapi) {
        const profile = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();
        setUser({
          name: profile.getName(),
          email: profile.getEmail(),
        });
    } else {
        setUser(null);
    }
  };

  const signIn = () => {
    if (gapi) gapi.auth2.getAuthInstance().signIn();
  };

  const signOut = () => {
    if (gapi) gapi.auth2.getAuthInstance().signOut();
  };

  const createEvent = (summary: string, startTime: Date, duration: number) => {
    if (!isSignedIn || !gapi) {
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
