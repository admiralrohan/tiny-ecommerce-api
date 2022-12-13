import request from "supertest";
import app from "../app";
import Users from "../models/users";
import Tokens from "../models/tokens";
import jwt from "jsonwebtoken";
import { currentTime, mockPwd, mockToken } from "../configs/constants";
import {
  expectErrorResponse,
  expectSuccessResponse,
} from "../utils/test-helpers";
import Products from "../models/product";
import Orders from "../models/order";

const routePath = "/api/seller/orders";

beforeEach(async () => {
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

  await Orders.query().insert([
    {
      buyerId: 2,
      sellerId: 1,
      productIds: [1, 2],
      createdAt: new Date(),
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

  it("With seller user - success", async () => {
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      userId: 1,
      token: mockToken,
      userType: "seller",
    }));

    const response = await request(app)
      .get(routePath)
      .set("Accept", "application/json")
      .set("Authorization", "Bearer " + mockToken);

    expectSuccessResponse(response);
  });

  it("With buyer user - throws error", async () => {
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      userId: 2,
      token: mockToken,
      userType: "buyer",
    }));

    const response = await request(app)
      .get(routePath)
      .set("Accept", "application/json")
      .set("Authorization", "Bearer " + mockToken);

    expectErrorResponse(response, { status: 401 });
    expect(response.body.error).toMatch(/only available for seller/i);
  });

  it("Proper API response body for valid scenario", async () => {
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      userId: 1,
      token: mockToken,
      userType: "seller",
    }));

    const response = await request(app)
      .get(routePath)
      .set("Accept", "application/json")
      .set("Authorization", "Bearer " + mockToken);

    expect(response.body.data.orders).toEqual([
      {
        id: 1,
        buyerId: 2,
        buyerName: "john",
        buyerEmail: "john1@gmail.com",
        products: [
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
        ],
        createdAt: "2022-01-01T00:00:00.000Z",
        completedAt: null,
      },
    ]);
  });
});
