import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load test environment
dotenv.config({ path: path.resolve(__dirname, "../../../.env.test") });

// Import routes
import authRoutes from "../../../src/routers/userAccount.router.js";
import savingBookRoutes from "../../../src/routers/savingBook.router.js";
import transactionRoutes from "../../../src/routers/transaction.router.js";
import customerRoutes from "../../../src/routers/customer.router.js";
import typeSavingRoutes from "../../../src/routers/typeSaving.router.js";
import reportRoutes from "../../../src/routers/report.router.js";
import branchRoutes from "../../../src/routers/branch.router.js";
import regulationRoutes from "../../../src/routers/regulation.router.js";

/**
 * Create test server instance
 */
export function createTestServer() {
  const app = express();

  app.use(
    cors({
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      credentials: true,
    })
  );

  app.use(express.json());

  // Register routes
  app.use("/api/auth", authRoutes);
  app.use("/api/users", authRoutes);
  app.use("/api/savingbook", savingBookRoutes);
  app.use("/api/transactions", transactionRoutes);
  app.use("/api/customer", customerRoutes);
  app.use("/api/typesaving", typeSavingRoutes);
  app.use("/api/report", reportRoutes);
  app.use("/api/branch", branchRoutes);
  app.use("/api/regulations", regulationRoutes);

  // Error handling
  app.use((err, req, res, next) => {
    console.error("Test server error:", err);
    res.status(500).json({
      message: "Internal server error",
      success: false,
      error: err.message,
    });
  });

  return app;
}

/**
 * Start test server
 */
export async function startTestServer(port = 3001) {
  const app = createTestServer();

  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      console.log(`Test server running on port ${port}`);
      resolve({ app, server });
    });

    server.on("error", reject);
  });
}

/**
 * Stop test server
 */
export async function stopTestServer(server) {
  return new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}
