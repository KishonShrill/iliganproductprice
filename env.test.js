import { expect, test } from 'vitest';

test('VITE_SCAN should be false', () => {
  expect(import.meta.env.VITE_SCAN).toBe('false'); // because it's a string
});