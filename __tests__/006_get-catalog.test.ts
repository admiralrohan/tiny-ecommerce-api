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
import Products from "../models/product";

const routePath = "/api/buyer/seller-catalog";

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
      catalog: [1, 2], // Will create them below
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

  await Products.query().insert([
    {
      id: 1,
      name: "Bike",
      price: "10",
      isActive: true,
      ownerId: 1,
      createdAt: new Date(),
    },
    {
      id: 2,
      name: "Cycle",
      price: "5",
      isActive: true,
      ownerId: 1,
      createdAt: new Date(),
    },
  ]);
});

describe(`GET ${routePath}/:seller_id`, () => {
  it("Without token - throws error", async () => {
    const response = await request(app)
      .get(routePath + "/1")
      .set("Accept", "application/json");

    expectErrorResponse(response, { status: 401 });
    expect(response.body.error).toMatch(/token missing/i);
  });

  it("With buyer user - success", async () => {
    loginAs(2, "buyer");

    const response = await request(app)
      .get(routePath + "/1")
      .set("Accept", "application/json")
      .set("Authorization", "Bearer " + mockToken);

    expectSuccessResponse(response);
  });

  it("With seller user - throws error", async () => {
    loginAs(1, "seller");

    const response = await request(app)
      .get(routePath + "/1")
      .set("Accept", "application/json")
      .set("Authorization", "Bearer " + mockToken);

    expectErrorResponse(response, { status: 401 });
    expect(response.body.error).toMatch(/only available for buyer/i);
  });

  it("Call API without seller_id - throws error", async () => {
    loginAs(2, "buyer");

    const response = await request(app)
      .get(routePath + "/")
      .set("Accept", "application/json")
      .set("Authorization", "Bearer " + mockToken);

    expectErrorResponse(response, { status: 404 });
  });

  it("Call API with invalid seller_id - throws error", async () => {
    loginAs(2, "buyer");

    // Using string instead of number
    const response = await request(app)
      .get(routePath + "/invalid")
      .set("Accept", "application/json")
      .set("Authorization", "Bearer " + mockToken);

    expectErrorResponse(response);
    expect(response.body.error).toMatch(/invalid seller_id/i);
  });

  it("Fetch catalog of non-existent user - throws error", async () => {
    loginAs(2, "buyer");

    // We created only 3 users before tests, and fetching catalog of 10th user
    const response = await request(app)
      .get(routePath + "/10")
      .set("Accept", "application/json")
      .set("Authorization", "Bearer " + mockToken);

    expectErrorResponse(response);
    expect(response.body.error).toMatch(/user not found/i);
  });

  it("Fetch catalog of buyer user - throws error", async () => {
    loginAs(2, "buyer");

    // User ID 2 is a "buyer"
    const response = await request(app)
      .get(routePath + "/2")
      .set("Accept", "application/json")
      .set("Authorization", "Bearer " + mockToken);

    expectErrorResponse(response);
    expect(response.body.error).toMatch(/user is not a seller/i);
  });

  it("Proper API response body for valid scenario", async () => {
    loginAs(2, "buyer");

    const response = await request(app)
      .get(routePath + "/1")
      .set("Accept", "application/json")
      .set("Authorization", "Bearer " + mockToken);

    expect(response.body.data.catalog).toEqual([
      {
        id: 1,
        name: "Bike",
        price: "10",
      },
      {
        id: 2,
        name: "Cycle",
        price: "5",
      },
    ]);
  });
});
