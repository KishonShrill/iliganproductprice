import mongoose from 'mongoose';
import { expect, test } from 'vitest';
import { config } from 'dotenv';
config();

test('VITE_SCAN should be false', () => {
  expect(import.meta.env.VITE_SCAN).toBe('false'); // because it's a string
});

test('Mongoose should connect to MongoDB', async () => {
  await mongoose.connect(process.env.DATABASE_URI);

  expect(mongoose.connection.readyState).toBe(1) // 1 = connected

  await mongoose.disconnect();
})