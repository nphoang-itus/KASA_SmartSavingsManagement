import { describe, it, expect, beforeAll } from "@jest/globals";
import request from "supertest";
import { createTestServer } from "../helpers/testServer.js";
import { getTestUserToken } from "../helpers/testDatabase.js";
import { TEST_USERS, TEST_CUSTOMERS } from "../helpers/fixtures.js";

const app = createTestServer();
let tellerToken;

describe("Customer Integration Tests", () => {
  beforeAll(async () => {
    tellerToken = await getTestUserToken(
      TEST_USERS.teller.username,
      TEST_USERS.teller.password
    );
  });

  describe("POST /api/customer", () => {
    it("should create customer successfully", async () => {
      const response = await request(app)
        .post("/api/customer")
        .set("Authorization", `Bearer ${tellerToken}`)
        .send(TEST_CUSTOMERS.customer1);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.data).toHaveProperty(
        "citizenid",
        TEST_CUSTOMERS.customer1.citizenId
      );
    });

    it("should fail without authentication", async () => {
      const response = await request(app)
        .post("/api/customer")
        .send(TEST_CUSTOMERS.customer2);

      expect(response.status).toBe(401);
    });

    it("should fail with duplicate citizen ID", async () => {
      // First creation
      await request(app)
        .post("/api/customer")
        .set("Authorization", `Bearer ${tellerToken}`)
        .send(TEST_CUSTOMERS.customer1);

      // Duplicate creation
      const response = await request(app)
        .post("/api/customer")
        .set("Authorization", `Bearer ${tellerToken}`)
        .send(TEST_CUSTOMERS.customer1);

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/customer/search", () => {
    it("should search customer by citizen ID", async () => {
      const response = await request(app)
        .get("/api/customer/search")
        .set("Authorization", `Bearer ${tellerToken}`)
        .query({ citizenID: TEST_CUSTOMERS.customer1.citizenId });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });
});
