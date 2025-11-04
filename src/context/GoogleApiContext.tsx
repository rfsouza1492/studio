'use client';
import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { addMinutes, formatISO, startOfToday, endOfToday } from 'date-fns';
import { gapi, loadGapiInsideDOM } from 'gapi-script';

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

const CLIENT_ID = '859574091958-fi657c59q9ucnpoun6u9mf9ifptvlssk.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.profile';
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];


export const GoogleApiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; } | null>(null);
  const [isGapiReady, setIsGapiReady] = useState(false);
  const [gapiInstance, setGapiInstance] = useState<any>(null);


  useEffect(() => {
    const initClient = async () => {
      try {
        const gapi = await loadGapiInsideDOM();
        setGapiInstance(gapi);
        
        await new Promise<void>((resolve, reject) => {
            gapi.load('client:auth2', () => {
                gapi.client.init({
                    clientId: CLIENT_ID,
                    scope: SCOPES,
                    discoveryDocs: DISCOVERY_DOCS,
                }).then(() => {
                    resolve();
                }, (err: any) => {
                    reject(err);
                });
            });
        });
        
        const authInstance = gapi.auth2.getAuthInstance();
        if(!authInstance) {
            throw new Error("Failed to get auth instance");
        }

        setIsGapiReady(true);
        
        const updateStatus = (signedIn: boolean) => {
            setIsSignedIn(signedIn);
            if (signedIn) {
                const profile = authInstance.currentUser.get().getBasicProfile();
                if (profile) {
                    setUser({
                        name: profile.getName(),
                        email: profile.getEmail(),
                    });
                }
            } else {
                setUser(null);
            }
        };

        authInstance.isSignedIn.listen(updateStatus);
        updateStatus(authInstance.isSignedIn.get());

      } catch (error) {
        console.error('Error initializing Google API client', error);
      }
    };
    initClient();
  }, []);

  const signIn = () => {
    if (isGapiReady && gapiInstance) {
      gapiInstance.auth2.getAuthInstance().signIn();
    } else {
      console.error("GAPI not ready for sign-in.");
    }
  };

  const signOut = () => {
    if (isGapiReady && gapiInstance) {
      gapiInstance.auth2.getAuthInstance().signOut();
    }
  };
  
  const createEvent = async (summary: string, startTime: Date, duration: number) => {
    if (!isSignedIn || !isGapiReady || !gapiInstance) return;
    
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

    try {
      const request = gapiInstance.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
      });

      request.execute((event: any) => {
        console.log('Event created: ' + event.htmlLink);
      });
    } catch (error) {
        console.error("Error creating event:", error);
    }
  };

  const listTodayEvents = async (): Promise<CalendarEvent[]> => {
    if (!isSignedIn || !isGapiReady || !gapiInstance) return [];
       
    const todayStart = startOfToday();
    const todayEnd = endOfToday();

    try {
      const response = await gapiInstance.client.calendar.events.list({
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
