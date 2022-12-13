import request from "supertest";
import bcrypt from "bcrypt";
import app from "../app";
import Users from "../models/users";
import Tokens from "../models/tokens";
import { currentTime, mockPwd, mockToken } from "../configs/constants";
import {
  expectErrorResponse,
  expectSuccessResponse,
} from "../utils/test-helpers";

const routePath = "/api/auth/login";

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
});

describe(`POST ${routePath}`, () => {
  it("Without body - throws error", async () => {
    const response = await request(app)
      .post(routePath)
      .set("Accept", "application/json");

    expectErrorResponse(response);
    expect(response.body.error).toMatch(/email/i);
  });

  it("Without email - throws error", async () => {
    const response = await request(app)
      .post(routePath)
      .set("Accept", "application/json")
      .send({
        username: "john",
        password: "1234",
        confirmPassword: "1234",
        type: "seller",
      });

    expectErrorResponse(response);
    expect(response.body.error).toMatch(/email/i);
  });

  it("Without password - throws error", async () => {
    const response = await request(app)
      .post(routePath)
      .set("Accept", "application/json")
      .send({
        username: "john",
        email: "john@gmail.com",
        confirmPassword: "1234",
        type: "seller",
      });

    expectErrorResponse(response);
    expect(response.body.error).toMatch(/password/i);
  });

  it("Without user type - throws error", async () => {
    const response = await request(app)
      .post(routePath)
      .set("Accept", "application/json")
      .send({
        username: "john",
        email: "john@gmail.com",
        password: "1234",
        confirmPassword: "1234",
      });

    expectErrorResponse(response);
    expect(response.body.error).toMatch(/invalid/i);
  });

  it("With invalid user type - throws error", async () => {
    const response = await request(app)
      .post(routePath)
      .set("Accept", "application/json")
      .send({
        username: "john",
        email: "john@gmail.com",
        password: "1234",
        confirmPassword: "1234",
        type: "invalid",
      });

    expectErrorResponse(response);
    expect(response.body.error).toMatch(/invalid/i);
  });

  it("Without proper password - throws error", async () => {
    const hashPwd = jest.spyOn(bcrypt, "compare");
    hashPwd.mockImplementationOnce(() => Promise.resolve(false));

    const response = await request(app)
      .post(routePath)
      .set("Accept", "application/json")
      .send({
        email: "john@gmail.com",
        password: "123",
        type: "buyer",
      });

    expectErrorResponse(response);
    expect(response.body.error).toMatch(/password mismatch/i);
  });

  it("With non-existent email - throws error", async () => {
    const hashPwd = jest.spyOn(bcrypt, "compare");
    hashPwd.mockImplementationOnce(() => Promise.resolve(true));

    const response = await request(app)
      .post(routePath)
      .set("Accept", "application/json")
      .send({
        email: "jane@gmail.com",
        password: "1234",
        type: "buyer",
      });

    expectErrorResponse(response);
    expect(response.body.error).toMatch(/no user found/i);
  });

  it("With proper email but wrong user type - throws error", async () => {
    const hashPwd = jest.spyOn(bcrypt, "compare");
    hashPwd.mockImplementationOnce(() => Promise.resolve(true));

    const response = await request(app)
      .post(routePath)
      .set("Accept", "application/json")
      .send({
        email: "john@gmail.com",
        password: "1234",
        type: "seller",
      });

    expectErrorResponse(response);
    expect(response.body.error).toMatch(/no user found/i);
  });

  it("With proper body - success", async () => {
    const hashPwd = jest.spyOn(bcrypt, "compare");
    hashPwd.mockImplementationOnce(() => Promise.resolve(true));

    const response = await request(app)
      .post(routePath)
      .set("Accept", "application/json")
      .send({
        email: "john@gmail.com",
        password: "1234",
        type: "buyer",
      });

    expectSuccessResponse(response);
    expect(response.body.data.token).toBe(mockToken);
  });

  it("Update DB state - success", async () => {
    const hashPwd = jest.spyOn(bcrypt, "compare");
    hashPwd.mockImplementationOnce(() => Promise.resolve(true));

    await request(app).post(routePath).set("Accept", "application/json").send({
      email: "john@gmail.com",
      password: "1234",
      type: "buyer",
    });

    const tokenTable = await Tokens.query();
    expect(tokenTable).toEqual([
      {
        id: 1,
        userId: 1,
        token: mockToken,
        loggedInAt: currentTime,
        loggedOutAt: null,
      },
    ]);
  });
});
