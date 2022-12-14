import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app";
import { currentTime, mockPwd, mockToken } from "../configs/constants";
import Products from "../models/product";
import Tokens from "../models/tokens";
import Users from "../models/users";
import {
  expectErrorResponse,
  expectSuccessResponse,
} from "../utils/test-helpers";

const routePath = "/api/utils/products";

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

describe("GET /api/utils/products", () => {
  beforeEach(async () => {
    await Products.query().insert([
      {
        id: 1,
        name: "Bike",
        price: "10",
        isActive: true,
        ownerId: 1,
        createdAt: new Date(),
      },
    ]);
  });

  it("Responds properly", async () => {
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
    expect(response.body.data.productList).toEqual([
      {
        id: 1,
        name: "Bike",
        price: "10",
        isActive: true,
        ownerId: 1,
        createdAt: new Date().toISOString(),
      },
    ]);
  });
});

describe("POST /api/utils/products", () => {
  it("Without name - throws error", async () => {
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      userId: 1,
      token: mockToken,
      userType: "seller",
    }));

    const response = await request(app)
      .post(routePath)
      .set("Accept", "application/json")
      .set("Authorization", "Bearer " + mockToken)
      .send({
        price: "10",
        isActive: true,
      });

    expectErrorResponse(response);
    expect(response.body.error).toMatch(/name is required/i);
  });

  it("Without price - throws error", async () => {
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      userId: 1,
      token: mockToken,
      userType: "seller",
    }));

    const response = await request(app)
      .post(routePath)
      .set("Accept", "application/json")
      .set("Authorization", "Bearer " + mockToken)
      .send({
        name: "Bike",
        isActive: true,
      });

    expectErrorResponse(response);
    expect(response.body.error).toMatch(/price is required/i);
  });

  it("Without isActive - throws error", async () => {
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      userId: 1,
      token: mockToken,
      userType: "seller",
    }));

    const response = await request(app)
      .post(routePath)
      .set("Accept", "application/json")
      .set("Authorization", "Bearer " + mockToken)
      .send({
        name: "Bike",
        price: "10",
      });

    expectErrorResponse(response);
    expect(response.body.error).toMatch(/isActive is required/i);
  });

  it("Proper API response body for valid scenario", async () => {
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      userId: 1,
      token: mockToken,
      userType: "seller",
    }));

    const response = await request(app)
      .post(routePath)
      .set("Accept", "application/json")
      .set("Authorization", "Bearer " + mockToken)
      .send({
        name: "Bike",
        price: "10",
        isActive: true,
      });

    expectSuccessResponse(response);
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
        name: "Bike",
        price: "10",
        isActive: true,
      });

    const productsTable = await Products.query();
    expect(productsTable).toEqual([
      {
        id: 1,
        name: "Bike",
        price: "10",
        isActive: true,
        createdAt: new Date(),
        ownerId: 1,
      },
    ]);
  });
});

describe("PATCH /api/utils/products", () => {
  beforeEach(async () => {
    await Products.query().insert([
      {
        id: 1,
        name: "Bike",
        price: "10",
        isActive: true,
        ownerId: 1,
        createdAt: new Date(),
      },
    ]);
  });

  it("Without id param - throws error", async () => {
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      userId: 1,
      token: mockToken,
      userType: "seller",
    }));

    const response = await request(app)
      .patch(routePath)
      .set("Accept", "application/json")
      .set("Authorization", "Bearer " + mockToken)
      .send({
        isActive: false,
      });

    expectErrorResponse(response, { status: 404 });
  });

  it("Without valid id - throws error", async () => {
    const response = await request(app)
      .patch(routePath + "/invalid")
      .set("Accept", "application/json")
      .set("Authorization", "Bearer " + mockToken)
      .send({
        isActive: false,
      });

    expectErrorResponse(response);
    expect(response.body.error).toMatch(/Invalid product id/i);
  });

  it("Updating products of others - throws error", async () => {
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      userId: 2,
      token: mockToken,
      userType: "seller",
    }));

    const response = await request(app)
      .patch(routePath + "/1")
      .set("Accept", "application/json")
      .set("Authorization", "Bearer " + mockToken)
      .send({
        name: "3rd",
        isActive: false,
      });

    expectErrorResponse(response);
    expect(response.body.error).toMatch(
      /You can't update products created by others/i
    );
  });

  it("Proper API response body for valid scenario", async () => {
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      userId: 1,
      token: mockToken,
      userType: "seller",
    }));

    const response = await request(app)
      .patch(routePath + "/1")
      .set("Accept", "application/json")
      .set("Authorization", "Bearer " + mockToken)
      .send({
        name: "4th",
        isActive: false,
      });

    expectSuccessResponse(response);
  });

  it("Update DB state - success", async () => {
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      userId: 1,
      token: mockToken,
      userType: "seller",
    }));

    await request(app)
      .patch(routePath + "/1")
      .set("Accept", "application/json")
      .set("Authorization", "Bearer " + mockToken)
      .send({
        name: "5th",
        isActive: false,
      });

    const productsTable = await Products.query();
    expect(productsTable).toEqual([
      {
        id: 1,
        name: "5th",
        price: "10",
        isActive: false,
        createdAt: new Date(),
        ownerId: 1,
      },
    ]);
  });
});
