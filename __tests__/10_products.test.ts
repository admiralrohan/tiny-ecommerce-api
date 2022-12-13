import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app";
import { currentTime, mockPwd, mockToken } from "../configs/constants";
import Products from "../models/product";
import Tokens from "../models/tokens";
import Users from "../models/users";
import { expectSuccessResponse } from "../utils/test-helpers";

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
  ]);

  await Tokens.query().insert([
    {
      userId: 1,
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

  it("responds properly", async () => {
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      userId: 1,
      token: mockToken,
      userType: "seller",
    }));

    const response = await request(app)
      .get("/api/utils/products")
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
