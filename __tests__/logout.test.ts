import request from "supertest";
import app from "../app";
import Users from "../models/users";
import Tokens from "../models/tokens";
import jwt from "jsonwebtoken";
import { currentTime, mockToken } from "../configs/constants";

const routePath = "/api/auth/logout";

beforeEach(async () => {
  // Need to register a user before login
  await Users.query().insert({
    id: 1,
    username: "john",
    email: "john@gmail.com",
    password: "hashedPwd",
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
  it("Without token", async () => {
    const response = await request(app)
      .post(routePath)
      .set("Accept", "application/json");

    expect(response.headers["content-type"]).toMatch(/json/i);
    expect(response.status).toEqual(401);
    expect(response.body.success).toBeFalsy();
    expect(response.body.error).toMatch(/token missing/i);
  });

  it("With token", async () => {
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      userId: 1,
      token: mockToken,
      userType: "buyer",
    }));

    const response = await request(app)
      .post(routePath)
      .set("Accept", "application/json")
      .set("Authorization", "Bearer " + mockToken);

    expect(response.headers["content-type"]).toMatch(/json/i);
    expect(response.status).toEqual(200);
    expect(response.body.success).toBeTruthy();
  });

  it("Saved user data in DB properly", async () => {
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
      userId: 1,
      token: mockToken,
      userType: "buyer",
    }));

    await request(app)
      .post(routePath)
      .set("Accept", "application/json")
      .set("Authorization", "Bearer " + mockToken);

    const tokenTable = await Tokens.query();
    expect(tokenTable).toEqual([
      {
        id: 1,
        userId: 1,
        token: "generatedToken",
        loggedInAt: currentTime,
        loggedOutAt: currentTime,
      },
    ]);
  });
});
