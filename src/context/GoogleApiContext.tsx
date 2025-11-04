'use client';
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { addMinutes, formatISO, startOfToday, endOfToday } from 'date-fns';

export interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime: string, date?: null } | { dateTime?: null, date: string };
  end: { dateTime: string, date?: null } | { dateTime?: null, date: string };
}
interface GoogleApiContextType {
  isSignedIn: boolean;
  signIn: () => void;
  signOut: () => void;
  createEvent: (summary: string, startTime: Date, duration: number) => void;
  listTodayEvents: () => Promise<CalendarEvent[]>;
  user: { name: string; email: string; } | null;
}

const GoogleApiContext = createContext<GoogleApiContextType | undefined>(undefined);

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const CLIENT_ID = "1093153839293-uin7g98t29ol1c0f8s3a8g3p5c4o23s2.apps.googleusercontent.com";
const SCOPES = 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.profile';

export const GoogleApiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; } | null>(null);
  const [authInstance, setAuthInstance] = useState<any>(null);

  const updateSigninStatus = (signedIn: boolean, instance: any) => {
    setIsSignedIn(signedIn);
    if (signedIn && instance) {
        try {
            const profile = instance.currentUser.get().getBasicProfile();
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
    import('gapi-script').then((gapiModule) => {
      const gapi = gapiModule.gapi;
      gapi.load('client:auth2', () => {
        if (!gapi.auth2.getAuthInstance()) {
            gapi.client.init({
              apiKey: API_KEY,
              clientId: CLIENT_ID,
              scope: SCOPES,
            }).then(() => {
              const instance = gapi.auth2.getAuthInstance();
              setAuthInstance(instance);
              instance.isSignedIn.listen((signedIn: boolean) => updateSigninStatus(signedIn, instance));
              updateSigninStatus(instance.isSignedIn.get(), instance);
            }).catch((error: any) => {
              console.error('Error initializing GAPI client', error);
            });
        } else {
            const instance = gapi.auth2.getAuthInstance();
            setAuthInstance(instance);
            if(instance.isSignedIn.get()) {
                updateSigninStatus(true, instance);
            }
        }
      });
    });
  }, []);

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

  const ensureGapiClient = async (api: 'calendar', version: 'v3'): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined' || !(window as any).gapi) {
            return reject(new Error('GAPI not loaded'));
        }
        const gapi = (window as any).gapi;
        if (gapi.client[api]) {
            return resolve();
        }
        gapi.client.load(api, version, () => resolve());
    });
  }

  const createEvent = async (summary: string, startTime: Date, duration: number) => {
    if (!isSignedIn) return;

    await ensureGapiClient('calendar', 'v3');
    const gapi = (window as any).gapi;

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

    const listTodayEvents = async (): Promise<CalendarEvent[]> => {
        if (!isSignedIn) return [];

        await ensureGapiClient('calendar', 'v3');
        const gapi = (window as any).gapi;

        const todayStart = startOfToday();
        const todayEnd = endOfToday();

        try {
            const response = await gapi.client.calendar.events.list({
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
    <GoogleApiContext.Provider value={{ isSignedIn, signIn, signOut, createEvent, listTodayEvents, user }}>
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
