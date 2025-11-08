
import tsconfig from './node_modules/@genkit-ai/google-genai/tsconfig.json';
import { expect, test } from 'vitest';

test('tsconfig should have compilerOptions', () => {
  expect(tsconfig).toHaveProperty('compilerOptions');
});

test('compilerOptions should have target', () => {
  expect(tsconfig.compilerOptions).toHaveProperty('target');
});

test('compilerOptions should have module', () => {
  expect(tsconfig.compilerOptions).toHaveProperty('module');
});

test('compilerOptions should have strict', () => {
  expect(tsconfig.compilerOptions).toHaveProperty('strict');
});

test('tsconfig should have include', () => {
  expect(tsconfig).toHaveProperty('include');
});

test('tsconfig should have exclude', () => {
  expect(tsconfig).toHaveProperty('exclude');
});
