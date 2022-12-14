import request from "supertest";
import app from "../app";
import Users from "../models/users";
import Tokens from "../models/tokens";
import { currentTime, mockPwd, mockToken } from "../configs/constants";
import {
  expectErrorResponse,
  expectSuccessResponse,
  loginAs,
} from "../utils/test-helpers";

const routePath = "/api/auth/logout";

beforeEach(async () => {
  // Need to register a user before login
  await Users.query().insert({
    id: 1,
    username: "john",
    email: "john@gmail.com",
    password: mockPwd,
    type: "buyer",
    createdAt: currentTime,
    catalog: [],
  });

  // Need to login before logout
  await Tokens.query().insert({
    userId: 1,
    token: mockToken,
    loggedInAt: currentTime,
  });
});

describe(`POST ${routePath}`, () => {
  it("Without token - throws error", async () => {
    const response = await request(app)
      .post(routePath)
      .set("Accept", "application/json");

    expectErrorResponse(response, { status: 401 });
    expect(response.body.error).toMatch(/token missing/i);
  });

  it("With token - success", async () => {
    loginAs(1, "buyer");

    const response = await request(app)
      .post(routePath)
      .set("Accept", "application/json")
      .set("Authorization", "Bearer " + mockToken);

    expectSuccessResponse(response);
  });

  it("Update DB state - success", async () => {
    loginAs(1, "buyer");

    await request(app)
      .post(routePath)
      .set("Accept", "application/json")
      .set("Authorization", "Bearer " + mockToken);

    const tokenTable = await Tokens.query();
    expect(tokenTable).toEqual([
      {
        id: 1,
        userId: 1,
        token: mockToken,
        loggedInAt: currentTime,
        // Login and logout time will never be same in real scenario, but we just need to verify
        // whether our program saves current time. We are not increasing the timer to reduce complexity
        loggedOutAt: currentTime,
      },
    ]);
  });
});
