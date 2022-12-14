import request from "supertest";
import app from "../app";
import { userTypes } from "../configs/constants";
import {
  expectErrorResponse,
  expectSuccessResponse,
} from "../utils/test-helpers";

/**
 * These API routes are not interacting with DB and returns static response
 */

describe("GET /", () => {
  it("Responds properly", async () => {
    const response = await request(app)
      .get("/")
      .set("Accept", "application/json");

    expectSuccessResponse(response);
    expect(response.body.success).toBeTruthy();
  });
});

describe("GET /404", () => {
  it("Responds properly", async () => {
    const response = await request(app)
      .get("/random")
      .set("Accept", "application/json");

    expectErrorResponse(response, { status: 404 });
    expect(response.body.success).toBeFalsy();
  });
});

describe("GET /api/utils/user-roles", () => {
  it("Responds properly", async () => {
    const response = await request(app)
      .get("/api/utils/user-roles")
      .set("Accept", "application/json");

    expectSuccessResponse(response);
    expect(response.body.data).toEqual(userTypes);
  });
});
