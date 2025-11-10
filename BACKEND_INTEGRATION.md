# Backend Integration Guide

Complete guide to connect Studio (Next.js frontend) with GoFlow (Express backend API)

---

## 🎯 Overview

This integration connects your **Next.js frontend** (Studio) with the **Express backend API** (GoFlow) to centralize business logic, improve security, and enable backend features like Redis sessions and OAuth 2.0.

---

## ✅ What Was Implemented

### 1. API Client (`src/lib/api-client.ts`)

TypeScript client with full type safety:

- Health & status endpoints
- Firebase authentication
- OAuth 2.0 flow
- Google Drive API
- Google Calendar API
- Gmail API (ready)
- Error handling with custom ApiError class
- Request timeout handling
- Session cookie support

### 2. React Hooks (`src/hooks/use-api.ts`)

Convenient hooks for React components:

- `useHealthCheck()` - Check backend health
- `useApiInfo()` - Get API information
- `useDrive()` - Google Drive operations
- `useCalendar()` - Google Calendar operations
- `useBackendAuth()` - Authentication operations
- `useBackendAvailable()` - Check if backend is available

### 3. Demo Component (`src/components/backend/BackendStatus.tsx`)

Visual component displaying:

- Backend connection status
- Health metrics
- API information
- Version and features

### 4. Test Page (`src/app/backend-test/page.tsx`)

Interactive test page with:

- Backend health check
- Authentication testing
- Google Drive API testing
- Google Calendar API testing
- Usage examples
- Error handling demos

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Configure Environment

Create or update `.env.local`:

```env
# Backend API Connection
NEXT_PUBLIC_API_URL=https://goflow-1--magnetai-4h4a8.us-east4.hosted.app
NEXT_PUBLIC_API_TIMEOUT=10000
NEXT_PUBLIC_USE_BACKEND_API=true

# Keep your existing Firebase config
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
# ... rest of Firebase config
```

### Step 2: Update Backend CORS

In Firebase Console → App Hosting → goflow-1 → Settings → Environment Variables:

Add or update:

```env
ALLOWED_ORIGINS=https://goflow.zone,https://www.goflow.zone,https://studio--magnetai-4h4a8.us-east4.hosted.app
```

**OR** if testing locally:

```env
ALLOWED_ORIGINS=http://localhost:3000,https://goflow.zone
```

### Step 3: Test Integration

```bash
# Install dependencies (if needed)
cd studio
npm install

# Run locally
npm run dev

# Visit test page
open http://localhost:3000/backend-test
```

---

## 💻 Usage Examples

### Example 1: Check Backend Health

```typescript
import { useHealthCheck } from '@/hooks/use-api';

function MyComponent() {
  const { data, loading, error, checkHealth } = useHealthCheck();

  useEffect(() => {
    checkHealth();
  }, []);

  if (loading) return <p>Checking backend...</p>;
  if (error) return <p>Error: {error}</p>;
  
  return (
    <div>
      <p>Backend Status: {data?.status}</p>
      <p>Environment: {data?.environment}</p>
      <p>Uptime: {data?.uptime}s</p>
    </div>
  );
}
```

### Example 2: Create Calendar Event from Task

```typescript
import { useCalendar } from '@/hooks/use-api';

function TaskComponent({ task }: { task: Task }) {
  const { createEvent, loading, error } = useCalendar();

  async function addToCalendar() {
    try {
      await createEvent({
        summary: task.title,
        description: task.description,
        start: {
          dateTime: task.dueDate.toISOString(),
        },
        end: {
          dateTime: new Date(task.dueDate.getTime() + task.duration * 60000).toISOString(),
        },
      });
      
      alert('✅ Event added to Google Calendar!');
    } catch (err) {
      alert('❌ Failed to create event. Please login first.');
    }
  }

  return (
    <Button onClick={addToCalendar} disabled={loading}>
      {loading ? 'Adding...' : 'Add to Calendar'}
    </Button>
  );
}
```

### Example 3: OAuth Login

```typescript
import { useBackendAuth } from '@/hooks/use-api';

function LoginButton() {
  const { initiateOAuthLogin } = useBackendAuth();

  return (
    <Button onClick={initiateOAuthLogin}>
      Login with Google
    </Button>
  );
}
```

### Example 4: List Google Drive Files

```typescript
import { useDrive } from '@/hooks/use-api';

function DriveFileList() {
  const { data, loading, error, listFiles } = useDrive();

  useEffect(() => {
    listFiles(20);
  }, []);

  if (loading) return <Spinner />;
  if (error) return <Alert>Error: {error}</Alert>;

  return (
    <ul>
      {data?.files.map(file => (
        <li key={file.id}>
          <a href={file.webViewLink}>{file.name}</a>
        </li>
      ))}
    </ul>
  );
}
```

---

## 🏗️ Architecture

### Before Integration

```text
Frontend (Studio)
    ↓
Firebase SDK (client-side)
    ↓
Firebase Services
```

### After Integration

```text
Frontend (Studio)
    ↓
API Client → GoFlow Backend API
    ↓
Firebase Admin SDK + OAuth
    ↓
Firebase Services + Google APIs
```

### Benefits

- ✅ Centralized business logic
- ✅ Backend rate limiting
- ✅ Server-side validation
- ✅ Token encryption
- ✅ Session management (Redis)
- ✅ Improved security
- ✅ Better error handling
- ✅ Caching opportunities

---

## 🔐 Authentication Strategy

### Hybrid Approach (Recommended)

Use **both** Firebase client-side AND backend API:

```typescript
// For simple operations: Use Firebase directly
import { auth } from '@/firebase/config';
await signInWithEmailAndPassword(auth, email, password);

// For complex operations: Use backend API
import { useBackendAuth } from '@/hooks/use-api';
const { loginWithEmail } = useBackendAuth();
await loginWithEmail(email, password);

// For Google APIs: MUST use backend (OAuth required)
import { useDrive } from '@/hooks/use-api';
const { listFiles } = useDrive();
await listFiles();
```

### Token Handling

The backend handles tokens automatically:

- Session cookies (httpOnly, secure)
- Automatic token refresh
- CSRF protection
- Token encryption at rest

Frontend doesn't need to manage tokens!

---

## 🧪 Testing

### Test Page

Visit the test page to verify integration:

```bash
# Local
http://localhost:3000/backend-test

# Production (after deploy)
https://goflow.zone/backend-test
```

### Manual Testing

```bash
# 1. Test health endpoint
curl https://goflow-1--magnetai-4h4a8.us-east4.hosted.app/health

# 2. Test CORS from browser console (on goflow.zone)
fetch('https://goflow-1--magnetai-4h4a8.us-east4.hosted.app/health')
  .then(r => r.json())
  .then(console.log)

# 3. Test auth status
fetch('https://goflow-1--magnetai-4h4a8.us-east4.hosted.app/auth/firebase/status', {
  credentials: 'include'
}).then(r => r.json()).then(console.log)
```

---

## 🔧 Configuration

### Frontend (.env.local)

```env
# Backend API
NEXT_PUBLIC_API_URL=https://goflow-1--magnetai-4h4a8.us-east4.hosted.app
NEXT_PUBLIC_USE_BACKEND_API=true

# For local development
# NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Backend (Firebase Console)

Environment Variables for goflow-1:

```env
# Add frontend URL to CORS
ALLOWED_ORIGINS=https://goflow.zone,https://www.goflow.zone,https://studio--magnetai-4h4a8.us-east4.hosted.app,http://localhost:3000

# Other required vars
SESSION_SECRET=...
TOKEN_ENCRYPTION_KEY=...
NODE_ENV=production
DISABLE_REDIS=true
```

---

## 🚨 Common Issues

### CORS Error

**Problem**: "Access to fetch blocked by CORS policy"

**Solution**:

1. Verify `ALLOWED_ORIGINS` in backend includes your frontend URL
2. Check backend logs for CORS errors
3. Ensure `credentials: 'include'` in fetch options

### 401 Unauthorized

**Problem**: API returns 401 for protected routes

**Solution**:

1. User needs to login first via OAuth: `/auth/oauth/login`
2. Check session cookies are being sent
3. Verify backend session store is working

### 404 Not Found

**Problem**: Endpoint returns 404

**Solution**:

1. Verify endpoint path in API client
2. Check backend routes are mounted correctly
3. Use `/auth/firebase/*` for Firebase auth
4. Use `/auth/oauth/*` for OAuth

### Connection Timeout

**Problem**: Request times out

**Solution**:

1. Increase `NEXT_PUBLIC_API_TIMEOUT`
2. Check backend is running
3. Verify network connectivity
4. Check backend logs for slow operations

---

## 📊 API Endpoints

### Public Endpoints

```text
GET  /health               - Health check
GET  /api/info             - API information
GET  /api/v1/status        - API status
GET  /api/v1/example       - Example endpoint
```

### Firebase Auth Endpoints

```text
POST /auth/firebase/register    - Register user
POST /auth/firebase/login       - Login with email/password
POST /auth/firebase/logout      - Logout
GET  /auth/firebase/profile     - Get user profile
GET  /auth/firebase/status      - Check auth status
```

### OAuth Endpoints

```text
GET  /auth/oauth/login          - Initiate Google OAuth
GET  /auth/oauth/callback       - OAuth callback
GET  /auth/oauth/status         - Check OAuth status
GET  /auth/oauth/profile        - Get OAuth profile
POST /auth/oauth/logout         - Logout OAuth
```

### Google APIs (Require OAuth)

```text
GET  /api/google/drive/files              - List Drive files
GET  /api/google/drive/files/:id          - Get file
POST /api/google/drive/files              - Create file

GET  /api/google/calendar/events          - List events
POST /api/google/calendar/events          - Create event

GET  /api/google/gmail/messages           - List messages
POST /api/google/gmail/send               - Send email
```

---

## 🎯 Migration Strategy

### Phase 1: Test Integration (Current)

✅ API client created
✅ Hooks available
✅ Test page ready

- Test backend connectivity
- Verify endpoints work
- Test error handling

### Phase 2: Gradual Migration

- Keep Firebase for existing features
- Use backend for new features
- Migrate critical paths first
- Monitor performance

### Phase 3: Full Integration

- Move all API calls to backend
- Deprecate direct Firebase usage
- Optimize caching
- Enable all backend features

---

## 📚 Related Documentation

- `OAUTH_PRODUCTION_GUIDE.md` - Backend production setup
- `DEPLOYMENT_SUCCESS.md` - Deployment status
- `README.md` (studio) - Frontend documentation
- `README.md` (goflow) - Backend documentation

---

## ✅ Integration Checklist

- [x] API client created
- [x] React hooks created
- [x] Test component created
- [x] Demo page created
- [x] Environment variables documented
- [ ] CORS configured in backend
- [ ] Environment variables set
- [ ] Test page visited
- [ ] OAuth flow tested
- [ ] Google APIs tested

---

## 🆘 Support

### Backend Issues

Check backend logs:

```text
Firebase Console → App Hosting → goflow-1 → Logs
```

### Frontend Issues

Check browser console:

```text
Open DevTools → Console tab
```

### Integration Issues

Test manually:

```bash
# From browser console on goflow.zone
fetch('https://goflow-1--magnetai-4h4a8.us-east4.hosted.app/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

---

## 🎉 Success Criteria

Your integration is successful when:

- ✅ Test page loads without errors
- ✅ Backend health check returns OK
- ✅ API info displays correctly
- ✅ OAuth login flow works
- ✅ Google APIs accessible after OAuth
- ✅ No CORS errors in console
- ✅ Sessions persist across requests

---

**Last Updated**: November 10, 2025  
**Version**: 1.0.0  
**Status**: Ready for Testing
