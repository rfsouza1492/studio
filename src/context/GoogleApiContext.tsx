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
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.profile';

export const GoogleApiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; } | null>(null);
  const [gapi, setGapi] = useState<any>(null);

  const updateSigninStatus = (signedIn: boolean, gapiInstance: any) => {
    setIsSignedIn(signedIn);
    if (signedIn) {
        try {
            const profile = gapiInstance.auth2.getAuthInstance().currentUser.get().getBasicProfile();
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
    const initGapiClient = async () => {
      try {
        const gapiModule = await import('gapi-script');
        const gapiInstance = gapiModule.gapi;
        setGapi(gapiInstance);

        await new Promise<void>((resolve) => gapiInstance.load('client:auth2', () => resolve()));
        
        const authInstance = gapiInstance.auth2.getAuthInstance();
        if (!authInstance) {
          await gapiInstance.client.init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            scope: SCOPES,
            discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
          });
        }
        
        const instance = gapiInstance.auth2.getAuthInstance();
        if(instance){
            instance.isSignedIn.listen((signedIn: boolean) => updateSigninStatus(signedIn, gapiInstance));
            updateSigninStatus(instance.isSignedIn.get(), gapiInstance);
        } else {
             console.error("Auth instance still not available after init.");
        }

      } catch (error) {
        console.error('Error initializing GAPI client', error);
      }
    };
    initGapiClient();
  }, []);

  const signIn = () => {
    if (gapi) {
        const authInstance = gapi.auth2.getAuthInstance();
        if (authInstance) {
          authInstance.signIn();
        } else {
          console.error("Cannot sign in, auth instance is not ready.");
        }
    }
  };

  const signOut = () => {
    if (gapi) {
       const authInstance = gapi.auth2.getAuthInstance();
        if (authInstance) {
          authInstance.signOut();
        }
    }
  };

  const ensureGapiClient = async (api: 'calendar', version: 'v3'): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!gapi) {
            return reject(new Error('GAPI not loaded'));
        }
        if (gapi.client[api]) {
            return resolve();
        }
        gapi.client.load(api, version, () => resolve());
    });
  }

  const createEvent = async (summary: string, startTime: Date, duration: number) => {
    if (!isSignedIn || !gapi) return;

    await ensureGapiClient('calendar', 'v3');
    
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
        if (!isSignedIn || !gapi) return [];

        await ensureGapiClient('calendar', 'v3');
       
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
