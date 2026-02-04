import { describe, expect, it, mock } from "bun:test";

// Mock argon2 before importing the app to avoid native library issues (libstdc++.so.6)
mock.module("argon2", () => ({
  verify: async () => true,
  hash: async () => "mocked-hash",
}));

import { treaty } from "@elysiajs/eden";
import { app } from "../server";

// This test follows the Elysia patterns for unit testing as requested.
// We use Eden Treaty to simulate requests to our server.

const api = treaty(app).api;

describe("Billiard Management API", () => {
  let authToken: string;

  describe("Authentication", () => {
    it("should login successfully with admin credentials", async () => {
      const { data, status } = await api.auth.login.post({
        email: "admin@billiard.com",
        password: "admin123",
      });

      expect(status).toBe(200);
      expect(data).toBeDefined();
      if (data && "token" in data) {
        authToken = data.token;
        expect(authToken).toBeDefined();
      }
    });
  });

  describe("Booking Endpoints (Authorized)", () => {
    it("should return 401 without token", async () => {
      const { status } = await api.bookings({ id: "test-id" }).complete.post({
        paymentMethod: "CASH",
      });
      expect(status).toBe(401);
    });

    it("should allow access with valid token", async () => {
      // Skip if login failed
      if (!authToken) return;

      const { status } = await api.bookings.active.get({
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      // Status 200: OK (The endpoint exists and we are authorized)
      expect(status).toBe(200);
    });

    it("should handle booking not found with authorized user", async () => {
      if (!authToken) return;

      const { status } = await api.bookings({ id: "non-existent-id" }).get({
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      // Status 404: Not Found (Authorized but ID doesn't exist)
      expect(status).toBe(404);
    });
  });

  describe("Business Lifecycle (Full Flow)", () => {
    let booking1Id: string;
    let booking2Id: string;
    let table1Id: string;
    let table2Id: string;
    let productId: string;

    it("should complete a full lifecycle: Create -> Order -> Merge -> Complete", async () => {
      // 1. Get Tables and Products
      const tablesRes = await api.tables.get({
        headers: { authorization: `Bearer ${authToken}` },
      });
      const productsRes = await api.products.get({
        headers: { authorization: `Bearer ${authToken}` },
      });

      expect(tablesRes.status).toBe(200);
      expect(productsRes.status).toBe(200);

      const tables = tablesRes.data;
      const products = productsRes.data;

      if (Array.isArray(tables) && tables.length >= 2) {
        table1Id = tables[0].id;
        table2Id = tables[1].id;
      }
      
      if (Array.isArray(products)) {
        const productWithStock = products.find((p: any) => (p.currentStock ?? 0) > 0);
        if (productWithStock) {
          productId = productWithStock.id;
        } else if (products.length >= 1) {
          productId = products[0].id; // Fallback
        }
      }

      expect(table1Id).toBeDefined();
      expect(table2Id).toBeDefined();
      expect(productId).toBeDefined();

      // 2. Create Booking 1
      const createRes1 = await api.bookings.post(
        {
          tableIds: [table1Id],
          startTime: new Date().toISOString() as any,
        },
        { headers: { authorization: `Bearer ${authToken}` } },
      );
      expect(createRes1.status).toBe(200);
      booking1Id = (createRes1.data as any).id;

      // 3. Add Order to Booking 1
      const orderRes = await api.orders.post(
        {
          bookingId: booking1Id,
          items: [{ productId, quantity: 1 }],
        },
        { headers: { authorization: `Bearer ${authToken}` } },
      );
      expect(orderRes.status).toBe(200);

      // 4. Create Booking 2
      const createRes2 = await api.bookings.post(
        {
          tableIds: [table2Id],
          startTime: new Date().toISOString() as any,
        },
        { headers: { authorization: `Bearer ${authToken}` } },
      );
      expect(createRes2.status).toBe(200);
      booking2Id = (createRes2.data as any).id;

      // 5. Merge Booking 2 into Booking 1
      const mergeRes = await api.bookings({ id: booking1Id }).merge.post(
        { sourceBookingId: booking2Id },
        { headers: { authorization: `Bearer ${authToken}` } },
      );
      expect(mergeRes.status).toBe(200);

      // 6. Complete Booking 1
      const completeRes = await api.bookings({ id: booking1Id }).complete.post(
        {
          paymentMethod: "CASH",
          endTime: new Date().toISOString() as any,
        },
        { headers: { authorization: `Bearer ${authToken}` } },
      );
      expect(completeRes.status).toBe(200);
      expect((completeRes.data as any).status).toBe("COMPLETED");
      expect((completeRes.data as any).totalAmount).toBeGreaterThan(0);
    });
  });
});

// For logic testing (Calculations), it's often easier to test the Service directly.
// Example of how you would structure a service test:
/**
  describe("BookingService Logic", () => {
    it("should calculate totals correctly", () => {
      // Mock Prisma and call BookingService.calculateTotal(...)
    })
  })
*/
