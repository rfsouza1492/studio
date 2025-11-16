/**
 * Debug Script for OAuth Authentication Issues
 * 
 * Execute this in the browser console (DevTools → Console)
 * after attempting to login with OAuth.
 * 
 * This script will:
 * 1. Check OAuth status endpoint
 * 2. Check calendar events endpoint
 * 3. Verify cookies
 * 4. Display comprehensive debug information
 */

(async function debugOAuth() {
  const API_URL = 'https://goflow--magnetai-4h4a8.us-east4.hosted.app';
  
  console.log('🔍 Starting OAuth Debug...\n');
  
  // 1. Check OAuth Status
  console.log('1️⃣ Checking OAuth Status...');
  try {
    const statusResponse = await fetch(`${API_URL}/auth/oauth/status`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    const statusData = await statusResponse.json();
    console.log('   Status Code:', statusResponse.status);
    console.log('   Response:', statusData);
    console.log('   ✅ Authenticated:', statusData.authenticated);
    console.log('   ✅ Has User:', !!statusData.user);
    
    if (statusData.user) {
      console.log('   User Info:', {
        id: statusData.user.id,
        email: statusData.user.email,
        name: statusData.user.name,
      });
    }
  } catch (err) {
    console.error('   ❌ Error checking OAuth status:', err);
  }
  
  console.log('');
  
  // 2. Check Calendar Events
  console.log('2️⃣ Checking Calendar Events...');
  try {
    const timeMin = new Date().toISOString();
    const eventsResponse = await fetch(
      `${API_URL}/api/google/calendar/events?maxResults=5&timeMin=${encodeURIComponent(timeMin)}`,
      {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    
    console.log('   Status Code:', eventsResponse.status);
    
    if (eventsResponse.ok) {
      const eventsData = await eventsResponse.json();
      console.log('   ✅ Events loaded successfully');
      console.log('   Events Count:', eventsData.events?.length || 0);
      if (eventsData.events && eventsData.events.length > 0) {
        console.log('   First Event:', {
          summary: eventsData.events[0].summary,
          start: eventsData.events[0].start,
        });
      }
    } else {
      const errorData = await eventsResponse.json().catch(() => ({}));
      console.error('   ❌ Failed to load events');
      console.error('   Error:', errorData);
    }
  } catch (err) {
    console.error('   ❌ Error checking calendar events:', err);
  }
  
  console.log('');
  
  // 3. Check Cookies
  console.log('3️⃣ Checking Cookies...');
  const cookies = document.cookie.split(';').map(c => c.trim());
  const sessionCookie = cookies.find(c => c.startsWith('connect.sid'));
  
  if (sessionCookie) {
    console.log('   ✅ Session cookie found');
    const [name, value] = sessionCookie.split('=');
    console.log('   Cookie Name:', name);
    console.log('   Cookie Value:', value.substring(0, 20) + '...');
    console.log('   Cookie Length:', value.length);
  } else {
    console.error('   ❌ Session cookie NOT found');
    console.log('   All cookies:', cookies);
  }
  
  console.log('');
  
  // 4. Check React State (if React DevTools is available)
  console.log('4️⃣ React State Check...');
  console.log('   ℹ️  Open React DevTools and check CalendarPage component state:');
  console.log('      - isBackendAuthenticated');
  console.log('      - checkingAuth');
  console.log('      - isLoading');
  console.log('      - error');
  
  console.log('');
  
  // 5. Summary
  console.log('📋 Summary:');
  console.log('   Run this script after:');
  console.log('   1. Clicking "Fazer Login"');
  console.log('   2. Completing OAuth flow');
  console.log('   3. Being redirected back to /calendar');
  console.log('');
  console.log('   If authenticated=true but events fail:');
  console.log('   → Token may be expired or missing scopes');
  console.log('');
  console.log('   If authenticated=false:');
  console.log('   → Session not saved or expired');
  console.log('   → Check backend logs during OAuth callback');
  console.log('');
  console.log('✅ Debug complete!');
})();

