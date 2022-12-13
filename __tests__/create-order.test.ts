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

const routePath = "/api/buyer/create-order";

beforeEach(async () => {
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
    {
      id: 4,
      username: "john",
      email: "john@gmail.com",
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
    {
      userId: 4,
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
    {
      id: 3,
      name: "Car",
      price: "50",
      isActive: true,
      ownerId: 1,
      createdAt: new Date(),
    },
  ]);
});

describe(`GET ${routePath}/:seller_id`, () => {
  it("Without token - throws error", async () => {
    const response = await request(app)
      .post(routePath)
      .set("Accept", "application/json");

    expectErrorResponse(response, { status: 401 });
    expect(response.body.error).toMatch(/token missing/i);
  });

  it("With buyer user - success", async () => {
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      userId: 2,
      token: mockToken,
      userType: "buyer",
    }));

    const response = await request(app)
      .post(routePath + "/1")
      .set("Accept", "application/json")
      .set("Authorization", "Bearer " + mockToken)
      .send({ productIds: [1] });

    expectSuccessResponse(response);
  });

  it("With seller user - throws error", async () => {
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      userId: 1,
      token: mockToken,
      userType: "seller",
    }));

    const response = await request(app)
      .post(routePath)
      .set("Accept", "application/json")
      .set("Authorization", "Bearer " + mockToken)
      .send({ productIds: [1] });

    expectErrorResponse(response, { status: 401 });
    expect(response.body.error).toMatch(/only available for buyer/i);
  });

  it("Create order with no product - throws error", async () => {
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      userId: 2,
      token: mockToken,
      userType: "buyer",
    }));

    const response = await request(app)
      .post(routePath + "/1")
      .set("Accept", "application/json")
      .set("Authorization", "Bearer " + mockToken)
      .send({ productIds: [] });

    expectErrorResponse(response);
    expect(response.body.error).toMatch(/you need products/i);
  });

  it("Create catalog with non-existent product - throws error", async () => {
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      userId: 2,
      token: mockToken,
      userType: "buyer",
    }));

    const response = await request(app)
      .post(routePath + "/1")
      .set("Accept", "application/json")
      .set("Authorization", "Bearer " + mockToken)
      .send({ productIds: [4] });

    expectErrorResponse(response);
    expect(response.body.error).toMatch(
      /You can only add products from the seller catalog/i
    );
  });

  // eslint-disable-next-line max-len
  it("Create catalog with product outside of catalog - throws error", async () => {
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      userId: 2,
      token: mockToken,
      userType: "buyer",
    }));

    const response = await request(app)
      .post(routePath + "/1")
      .set("Accept", "application/json")
      .set("Authorization", "Bearer " + mockToken)
      .send({ productIds: [3] });

    expectErrorResponse(response);
    expect(response.body.error).toMatch(
      /You can only add products from the seller catalog/i
    );
  });

  it("Create order from invalid user - throws error", async () => {
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      userId: 2,
      token: mockToken,
      userType: "buyer",
    }));

    // We created only 3 users before tests, and fetching catalog of 10th user
    const response = await request(app)
      .post(routePath + "/10")
      .set("Accept", "application/json")
      .set("Authorization", "Bearer " + mockToken)
      .send({ productIds: [1] });

    expectErrorResponse(response);
    expect(response.body.error).toMatch(/seller not found/i);
  });

  it("Create order from buyer user - throws error", async () => {
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      userId: 2,
      token: mockToken,
      userType: "buyer",
    }));

    const response = await request(app)
      .post(routePath + "/4")
      .set("Accept", "application/json")
      .set("Authorization", "Bearer " + mockToken)
      .send({ productIds: [1] });

    expectErrorResponse(response);
    expect(response.body.error).toMatch(/not a seller/i);
  });

  it("Buying from same user - throws error", async () => {
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      userId: 4,
      token: mockToken,
      userType: "buyer",
    }));

    const response = await request(app)
      .post(routePath + "/1")
      .set("Accept", "application/json")
      .set("Authorization", "Bearer " + mockToken)
      .send({ productIds: [1] });

    expectErrorResponse(response);
    expect(response.body.error).toMatch(/can't buy from same user/i);
  });

  it("Update DB state - success", async () => {
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      userId: 2,
      token: mockToken,
      userType: "buyer",
    }));

    await request(app)
      .post(routePath + "/1")
      .set("Accept", "application/json")
      .set("Authorization", "Bearer " + mockToken)
      .send({ productIds: [1] });

    const orderTable = await Orders.query();
    expect(orderTable).toEqual([
      {
        id: 1,
        buyerId: 2,
        sellerId: 1,
        productIds: [1],
        createdAt: new Date(currentTime),
        completedAt: null,
      },
    ]);
  });
});
