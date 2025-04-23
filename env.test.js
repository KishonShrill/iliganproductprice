import mongoose from 'mongoose';
import { expect, test } from 'vitest';
import { config } from 'dotenv';
config();

test('VITE_SCAN should be false', () => {
  expect(import.meta.env.VITE_SCAN).toBe('false'); // because it's a string
});

test('Mongoose full hidden URI should connect to MongoDB', async () => {
  await mongoose.connect(process.env.DATABASE_URI);

  expect(mongoose.connection.readyState).toBe(1) // 1 = connected

  await mongoose.disconnect();
})

test('Mongoose partial hidden URI should connect to MongoDB', async () => {
  await mongoose.connect(`mongodb+srv://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@chirscentportfolio.qj3tx5b.mongodb.net/IliganCityStores?retryWrites=true&w=majority`);

  expect(mongoose.connection.readyState).toBe(1) // 1 = connected

  await mongoose.disconnect();
})