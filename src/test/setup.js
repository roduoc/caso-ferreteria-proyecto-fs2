import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import { simularApi } from './apiSimulada';

beforeEach(() => {
  localStorage.clear();
  simularApi();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
