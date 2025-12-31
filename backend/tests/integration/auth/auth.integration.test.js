import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import { createTestServer } from "../helpers/testServer.js";
import { TEST_USERS } from "../helpers/fixtures.js";

const app = createTestServer();

describe("Login Integration Tests", () => {
  describe("POST /api/auth/login", () => {
    it("should login successfully with valid credentials", async () => {
      const response = await request(app).post("/api/auth/login").send({
        username: TEST_USERS.teller.username,
        password: TEST_USERS.teller.password,
      });

      // Debug log
      // console.log("Login response:", JSON.stringify(response.body, null, 2));

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.data).toHaveProperty("token");
      expect(response.body.data).toHaveProperty("userId", TEST_USERS.teller.employeeId);
    });

    it("should fail with invalid credentials", async () => {
      const response = await request(app).post("/api/auth/login").send({
        username: TEST_USERS.teller.username,
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("success", false);
    });

    it("should fail with missing credentials", async () => {
      const response = await request(app).post("/api/auth/login").send({
        username: TEST_USERS.teller.username,
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Username and password are required");
    });
  });
});
