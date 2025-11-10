const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  
  // Auto-clear mocks between tests
  clearMocks: true,
  
  // Timeout for async tests (10 seconds)
  testTimeout: 10000,
  
  // Max workers to avoid overload
  maxWorkers: '50%',
  
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '@genkit-ai/next/server': '<rootDir>/__mocks__/next.js',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
    '!src/components/ui/**', // Skip shadcn components
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}',
  ],
}

module.exports = createJestConfig(customJestConfig)
