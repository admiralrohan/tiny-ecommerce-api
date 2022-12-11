import request from "supertest";
import bcrypt from "bcrypt";
import app from "../app";
import Knex from "knex";
import knexConfig from "./../knexfile";
import { Model } from "objection";
import Users from "../models/users";
import Tokens from "../models/tokens";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let knex: any;
const routePath = "/api/auth/login";
const currentTime = new Date("2022-01-01");

beforeEach(async () => {
  jest.useFakeTimers();
  jest.setSystemTime(currentTime);

  knex = Knex(knexConfig.test);
  Model.knex(knex);
  await knex.migrate.latest();

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
});

afterEach(async () => {
  jest.useRealTimers();

  await knex.migrate.rollback();
  await knex.destroy();
});

jest.mock("../utils/jwt-token-generate", () =>
  jest.fn().mockReturnValue("generatedToken")
);

describe(`POST ${routePath}`, () => {
  it("Without any body", async () => {
    const response = await request(app)
      .post(routePath)
      .set("Accept", "application/json");

    expect(response.headers["content-type"]).toMatch(/json/i);
    expect(response.status).toEqual(400);
    expect(response.body.success).toBeFalsy();
    expect(response.body.error).toMatch(/email/i);
  });

  it("Without email", async () => {
    const response = await request(app)
      .post(routePath)
      .set("Accept", "application/json")
      .send({
        username: "john",
        password: "1234",
        confirmPassword: "1234",
        type: "seller",
      });

    expect(response.headers["content-type"]).toMatch(/json/i);
    expect(response.status).toEqual(400);
    expect(response.body.success).toBeFalsy();
    expect(response.body.error).toMatch(/email/i);
  });

  it("Without password", async () => {
    const response = await request(app)
      .post(routePath)
      .set("Accept", "application/json")
      .send({
        username: "john",
        email: "john@gmail.com",
        confirmPassword: "1234",
        type: "seller",
      });

    expect(response.headers["content-type"]).toMatch(/json/i);
    expect(response.status).toEqual(400);
    expect(response.body.success).toBeFalsy();
    expect(response.body.error).toMatch(/password/i);
  });

  it("Without user type", async () => {
    const response = await request(app)
      .post(routePath)
      .set("Accept", "application/json")
      .send({
        username: "john",
        email: "john@gmail.com",
        password: "1234",
        confirmPassword: "1234",
      });

    expect(response.headers["content-type"]).toMatch(/json/i);
    expect(response.status).toEqual(400);
    expect(response.body.success).toBeFalsy();
    expect(response.body.error).toMatch(/invalid/i);
  });

  it("Without proper user type", async () => {
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

    expect(response.headers["content-type"]).toMatch(/json/i);
    expect(response.status).toEqual(400);
    expect(response.body.success).toBeFalsy();
    expect(response.body.error).toMatch(/invalid/i);
  });

  it("Without proper password", async () => {
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

    expect(response.headers["content-type"]).toMatch(/json/i);
    expect(response.status).toEqual(400);
    expect(response.body.success).toBeFalsy();
    expect(response.body).toHaveProperty("message");
    expect(response.body).not.toHaveProperty("data");
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toMatch(/password mismatch/i);
  });

  it("With non-existent email", async () => {
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

    expect(response.headers["content-type"]).toMatch(/json/i);
    expect(response.status).toEqual(400);
    expect(response.body.success).toBeFalsy();
    expect(response.body).toHaveProperty("message");
    expect(response.body).not.toHaveProperty("data");
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toMatch(/no user found/i);
  });

  it("With proper email but wrong user type", async () => {
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

    expect(response.headers["content-type"]).toMatch(/json/i);
    expect(response.status).toEqual(400);
    expect(response.body.success).toBeFalsy();
    expect(response.body).toHaveProperty("message");
    expect(response.body).not.toHaveProperty("data");
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toMatch(/no user found/i);
  });

  it("With proper body", async () => {
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

    expect(response.headers["content-type"]).toMatch(/json/i);
    expect(response.status).toEqual(200);
    expect(response.body.success).toBeTruthy();
    expect(response.body).toHaveProperty("message");
    expect(response.body).toHaveProperty("data");
    expect(response.body).not.toHaveProperty("error");
    expect(response.body.data.token).toBe("generatedToken");
  });

  it("Saved user data in DB properly", async () => {
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
        token: "generatedToken",
        loggedInAt: currentTime,
        loggedOutAt: null,
      },
    ]);
  });
});
