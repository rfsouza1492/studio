# Testing Guide - GoalFlow Studio

Complete testing setup with Jest and Testing Library

---

## 🧪 Setup Complete

### Dependencies Installed

```json
{
  "jest": "^29.x",
  "@testing-library/react": "^14.x",
  "@testing-library/jest-dom": "^6.x",
  "@testing-library/user-event": "^14.x",
  "jest-environment-jsdom": "^29.x"
}
```

### Configuration Files

- ✅ `jest.config.js` - Jest configuration for Next.js
- ✅ `jest.setup.js` - Global test setup and mocks
- ✅ `src/test-utils.tsx` - Custom render with providers

---

## 🚀 Running Tests

### Run all tests

```bash
npm test
```

### Watch mode (development)

```bash
npm run test:watch
```

### Coverage report

```bash
npm run test:coverage
```

### CI mode

```bash
npm run test:ci
```

---

## 📁 Test Structure

```
src/
├── hooks/
│   └── __tests__/
│       └── use-api.test.ts        ✅ Created
├── lib/
│   └── __tests__/
│       ├── api-client.test.ts     ✅ Created
│       └── utils.test.ts          ✅ Created
├── components/
│   └── __tests__/
│       └── BackendStatus.test.tsx ✅ Created
└── test-utils.tsx                 ✅ Created (custom render)
```

---

## ✅ Tests Created

### 1. API Client Tests (`lib/__tests__/api-client.test.ts`)

- ✅ checkHealth() success
- ✅ checkHealth() HTTP errors
- ✅ checkHealth() network errors
- ✅ getApiInfo() success
- ✅ ApiError class
- ✅ Utility functions

### 2. API Hooks Tests (`hooks/__tests__/use-api.test.ts`)

- ✅ useHealthCheck initialization
- ✅ useHealthCheck success
- ✅ useHealthCheck errors
- ✅ useBackendAvailable when disabled
- ✅ useBackendAvailable when enabled

### 3. Component Tests (`components/__tests__/BackendStatus.test.tsx`)

- ✅ Loading state
- ✅ Not configured message
- ✅ Health data display
- ✅ Error handling

### 4. Utils Tests (`lib/__tests__/utils.test.ts`)

- ✅ cn() className merger
- ✅ Conditional classes
- ✅ Tailwind conflicts

**Total: ~30 tests created!**

---

## 📊 Coverage Goals

```javascript
{
  branches: 50%,
  functions: 50%,
  lines: 50%,
  statements: 50%
}
```

Current coverage will be shown after running `npm run test:coverage`

---

## 🧪 Writing New Tests

### Example: Testing a Component

```typescript
import { render, screen } from '@/test-utils'
import MyComponent from '../MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('should handle click', async () => {
    const { user } = render(<MyComponent />)
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('Clicked')).toBeInTheDocument()
  })
})
```

### Example: Testing a Hook

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { useMyHook } from '../useMyHook'

describe('useMyHook', () => {
  it('should return initial state', () => {
    const { result } = renderHook(() => useMyHook())
    expect(result.current.value).toBe(null)
  })

  it('should update state', async () => {
    const { result } = renderHook(() => useMyHook())
    result.current.setValue('test')
    
    await waitFor(() => {
      expect(result.current.value).toBe('test')
    })
  })
})
```

---

## 🎯 Test Best Practices

### Do's ✅

1. **Test behavior, not implementation**
   ```typescript
   // Good
   expect(screen.getByText('Submit')).toBeInTheDocument()
   
   // Avoid
   expect(component.state.isSubmitting).toBe(false)
   ```

2. **Use semantic queries**
   ```typescript
   screen.getByRole('button', { name: /submit/i })
   screen.getByLabelText('Email')
   screen.getByText('Welcome')
   ```

3. **Test user interactions**
   ```typescript
   await user.click(screen.getByRole('button'))
   await user.type(screen.getByLabelText('Name'), 'John')
   ```

4. **Mock external dependencies**
   - Firebase
   - API calls
   - Router
   - LocalStorage

### Don'ts ❌

1. **Don't test implementation details**
2. **Don't test third-party libraries**
3. **Don't make tests too coupled**
4. **Don't ignore async operations**

---

## 🔧 Mocking

### Mock Firebase

Already configured in `jest.setup.js`:
- ✅ firebase/app
- ✅ firebase/auth
- ✅ firebase/firestore
- ✅ next/navigation

### Mock API Calls

```typescript
global.fetch = jest.fn()

;(global.fetch as jest.Mock).mockResolvedValue({
  ok: true,
  json: async () => ({ data: 'test' }),
})
```

### Mock Contexts

Use `test-utils.tsx` custom render:

```typescript
import { render } from '@/test-utils'

// Automatically wraps with all providers
render(<MyComponent />)
```

---

## 📈 Next Steps

### Priority 1: Core Tests

- [ ] Context tests (AuthContext, GoalContext)
- [ ] Hook tests (more hooks)
- [ ] Component tests (GoalCard, TaskItem)

### Priority 2: Integration Tests

- [ ] Full user flows
- [ ] Form submissions
- [ ] Navigation flows

### Priority 3: E2E Tests

- [ ] Playwright or Cypress
- [ ] Critical user journeys
- [ ] Cross-browser testing

---

## 🆘 Troubleshooting

### Tests not running

```bash
# Clear Jest cache
npx jest --clearCache

# Check Jest config
cat jest.config.js
```

### Import errors

- Verify `@/` path mapping in jest.config.js
- Check tsconfig.json paths

### Firebase errors

- Mocks are in jest.setup.js
- Verify mocks match your Firebase version

### Timeout errors

```typescript
// Increase timeout for slow tests
jest.setTimeout(10000)
```

---

## ✅ Success Criteria

Your testing setup is successful when:

- ✅ `npm test` runs without errors
- ✅ Coverage report generates
- ✅ Tests are fast (<5s for unit tests)
- ✅ Coverage meets thresholds (50%+)
- ✅ Tests are maintainable

---

## 📚 Resources

- **Jest**: https://jestjs.io/
- **Testing Library**: https://testing-library.com/react
- **Next.js Testing**: https://nextjs.org/docs/app/building-your-application/testing/jest

---

**Created**: November 10, 2025  
**Status**: Setup Complete  
**Tests Created**: ~30 tests  
**Ready to**: Run tests and expand coverage

