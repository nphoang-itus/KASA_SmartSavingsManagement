import { beforeAll, afterAll, beforeEach, afterEach } from "@jest/globals";
import { startTestServer, stopTestServer } from "./testServer.js";
import { cleanDatabase, seedTestData } from "./testDatabase.js";
import { supabase } from "../../../src/config/database.js";

let testServer;
let serverInstance;

/**
 * Global setup - runs once before all tests
 */
beforeAll(async () => {
  console.log("\n🧪 Starting Integration Tests...\n");

  // Start test server
  const result = await startTestServer(3001);
  testServer = result.app;
  serverInstance = result.server;

  // Seed initial test data
  await seedTestData();
});

/**
 * Global teardown - runs once after all tests
 */
afterAll(async () => {
  console.log("\n✅ Integration Tests Completed\n");

  // Clean database
  await cleanDatabase();

  // Stop test server
  if (serverInstance) {
    await stopTestServer(serverInstance);
  }

  // Đóng tất cả channels và subscriptions của Supabase
  try {
    const channels = supabase.getChannels();
    for (const channel of channels) {
      await supabase.removeChannel(channel);
    }
  } catch (e) {
    // Ignore errors
  }

  // Force close any remaining connections
  await new Promise((resolve) => setTimeout(resolve, 500));
});

/**
 * Reset data before each test
 */
beforeEach(async () => {
  // Optional: Reset specific tables before each test
});

/**
 * Cleanup after each test
 */
afterEach(async () => {
  // Optional: Clean up test data
});

export { testServer };
