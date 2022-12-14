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

const routePath = "/api/seller/create-catalog";

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
    {
      id: 3,
      name: "Car",
      price: "50",
      isActive: true,
      ownerId: 3,
      createdAt: new Date(),
    },
  ]);
});

describe(`GET ${routePath}`, () => {
  it("Without token - throws error", async () => {
    const response = await request(app)
      .post(routePath)
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
      .post(routePath)
      .set("Accept", "application/json")
      .set("Authorization", "Bearer " + mockToken)
      .send({ products: [1, 2] });

    expectSuccessResponse(response);
  });

  it("With buyer user - throws error", async () => {
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      userId: 2,
      token: mockToken,
      userType: "buyer",
    }));

    const response = await request(app)
      .post(routePath)
      .set("Accept", "application/json")
      .set("Authorization", "Bearer " + mockToken);

    expectErrorResponse(response, { status: 401 });
    expect(response.body.error).toMatch(/only available for seller/i);
  });

  it("Create catalog with no product - throws error", async () => {
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      userId: 1,
      token: mockToken,
      userType: "seller",
    }));

    // We created only 3 users before tests, and fetching catalog of 10th user
    const response = await request(app)
      .post(routePath)
      .set("Accept", "application/json")
      .set("Authorization", "Bearer " + mockToken)
      .send({ products: [] });

    expectErrorResponse(response);
    expect(response.body.error).toMatch(/you need products/i);
  });

  it("Create catalog with non-existent product - throws error", async () => {
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      userId: 1,
      token: mockToken,
      userType: "seller",
    }));

    // We created only 3 users before tests, and fetching catalog of 10th user
    const response = await request(app)
      .post(routePath)
      .set("Accept", "application/json")
      .set("Authorization", "Bearer " + mockToken)
      .send({ products: [4] });

    expectErrorResponse(response);
    expect(response.body.error).toMatch(/You can only add your products/i);
  });

  it("Create catalog with products of other user - throws error", async () => {
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      userId: 1,
      token: mockToken,
      userType: "seller",
    }));

    // We created only 3 users before tests, and fetching catalog of 10th user
    const response = await request(app)
      .post(routePath)
      .set("Accept", "application/json")
      .set("Authorization", "Bearer " + mockToken)
      .send({ products: [3] });

    expectErrorResponse(response);
    expect(response.body.error).toMatch(/You can only add your products/i);
  });

  it("Update DB state - success", async () => {
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      userId: 1,
      token: mockToken,
      userType: "seller",
    }));

    await request(app)
      .post(routePath)
      .set("Accept", "application/json")
      .set("Authorization", "Bearer " + mockToken)
      .send({
        products: [1, 2],
      });

    const user = await Users.query().findById(1).select("catalog");
    expect(user?.catalog).toEqual([1, 2]);
  });
});
