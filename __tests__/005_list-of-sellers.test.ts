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

const routePath = "/api/buyer/list-of-sellers";

beforeEach(async () => {
  // Register and login some users first
  await Users.query().insert([
    {
      id: 1,
      username: "john",
      email: "john@gmail.com",
      password: mockPwd,
      type: "seller",
      createdAt: currentTime,
      catalog: [],
    },
    {
      id: 2,
      username: "john",
      email: "john1@gmail.com",
      password: mockPwd,
      type: "buyer",
      createdAt: currentTime,
      catalog: [],
    },
    {
      id: 3,
      username: "john",
      email: "john2@gmail.com",
      password: mockPwd,
      type: "seller",
      createdAt: currentTime,
      catalog: [],
    },
  ]);

  await Tokens.query().insert([
    {
      userId: 1,
      token: mockToken,
      loggedInAt: currentTime,
    },
    {
      userId: 2,
      token: mockToken,
      loggedInAt: currentTime,
    },
  ]);
});

describe(`GET ${routePath}`, () => {
  it("Without token - throws error", async () => {
    const response = await request(app)
      .get(routePath)
      .set("Accept", "application/json");

    expectErrorResponse(response, { status: 401 });
    expect(response.body.error).toMatch(/token missing/i);
  });

  it("With buyer user - success", async () => {
    loginAs(2, "buyer");

    const response = await request(app)
      .get(routePath)
      .set("Accept", "application/json")
      .set("Authorization", "Bearer " + mockToken);

    expectSuccessResponse(response);
  });

  it("With seller user - throws error", async () => {
    loginAs(1, "seller");

    const response = await request(app)
      .get(routePath)
      .set("Accept", "application/json")
      .set("Authorization", "Bearer " + mockToken);

    expectErrorResponse(response, { status: 401 });
    expect(response.body.error).toMatch(/only available for buyer/i);
  });

  it("Proper API response body for buyers", async () => {
    loginAs(2, "buyer");

    const response = await request(app)
      .get(routePath)
      .set("Accept", "application/json")
      .set("Authorization", "Bearer " + mockToken);

    expect(response.body.data.listOfSellers).toEqual([
      { id: 1, username: "john", email: "john@gmail.com" },
      { id: 3, username: "john", email: "john2@gmail.com" },
    ]);
  });
});
