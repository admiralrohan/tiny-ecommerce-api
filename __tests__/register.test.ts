import request from "supertest";
import bcrypt from "bcrypt";
import app from "../app";
import Knex from "knex";
import knexConfig from "./../knexfile";
import { Model } from "objection";
import Users from "../models/users";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let knex: any;

beforeEach(async () => {
  knex = Knex(knexConfig.test);
  Model.knex(knex);
  await knex.migrate.latest();
});

afterEach(async () => {
  await knex.migrate.rollback();
  await knex.destroy();
});

describe("POST /api/auth/register", () => {
  it("Without any body", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .set("Accept", "application/json");

    expect(response.headers["content-type"]).toMatch(/json/i);
    expect(response.status).toEqual(400);
    expect(response.body.success).toBeFalsy();
    expect(response.body.error).toMatch(/username/i);
  });

  it("Without username", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .set("Accept", "application/json")
      .send({
        email: "john@gmail.com",
        password: "1234",
        confirmPassword: "1234",
        type: "seller",
      });

    expect(response.headers["content-type"]).toMatch(/json/i);
    expect(response.status).toEqual(400);
    expect(response.body.success).toBeFalsy();
    expect(response.body.error).toMatch(/username/i);
  });

  it("Without email", async () => {
    const response = await request(app)
      .post("/api/auth/register")
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
      .post("/api/auth/register")
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

  it("Without confirmPassword", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .set("Accept", "application/json")
      .send({
        username: "john",
        email: "john@gmail.com",
        password: "1234",
        type: "seller",
      });

    expect(response.headers["content-type"]).toMatch(/json/i);
    expect(response.status).toEqual(400);
    expect(response.body.success).toBeFalsy();
    expect(response.body.error).toMatch(/match/i);
  });

  it("With password !== confirmPassword", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .set("Accept", "application/json")
      .send({
        username: "john",
        email: "john@gmail.com",
        password: "1234",
        confirmPassword: "123",
        type: "seller",
      });

    expect(response.headers["content-type"]).toMatch(/json/i);
    expect(response.status).toEqual(400);
    expect(response.body.success).toBeFalsy();
    expect(response.body.error).toMatch(/match/i);
  });

  it("Without confirmPassword", async () => {
    const response = await request(app)
      .post("/api/auth/register")
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

  it("With proper body", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .set("Accept", "application/json")
      .send({
        username: "john",
        email: "john@gmail.com",
        password: "1234",
        confirmPassword: "1234",
        type: "seller",
      });

    expect(response.headers["content-type"]).toMatch(/json/i);
    expect(response.status).toEqual(200);
    expect(response.body.success).toBeTruthy();
    expect(response.body).toHaveProperty("message");
    expect(response.body).toHaveProperty("data");
    expect(response.body).not.toHaveProperty("error");
  });

  it("With used email of different user type", async () => {
    const requestBody = {
      username: "john",
      email: "john@gmail.com",
      password: "1234",
      confirmPassword: "1234",
      type: "seller",
    };

    const queryData: Partial<typeof requestBody> = {
      ...requestBody,
      type: "buyer",
    };
    delete queryData.confirmPassword;
    await Users.query().insert(queryData);

    const response = await request(app)
      .post("/api/auth/register")
      .set("Accept", "application/json")
      .send(requestBody);

    expect(response.headers["content-type"]).toMatch(/json/i);
    expect(response.status).toEqual(200);
    expect(response.body.success).toBeTruthy();
    expect(response.body).toHaveProperty("message");
    expect(response.body).toHaveProperty("data");
    expect(response.body).not.toHaveProperty("error");
  });

  it("With used email of same user type", async () => {
    const requestBody = {
      username: "john",
      email: "john@gmail.com",
      password: "1234",
      confirmPassword: "1234",
      type: "seller",
    };

    const queryData: Partial<typeof requestBody> = {
      ...requestBody,
    };
    delete queryData.confirmPassword;
    await Users.query().insert(queryData);

    const response = await request(app)
      .post("/api/auth/register")
      .set("Accept", "application/json")
      .send(requestBody);

    expect(response.headers["content-type"]).toMatch(/json/i);
    expect(response.status).toEqual(400);
    expect(response.body.success).toBeFalsy();
    expect(response.body).toHaveProperty("message");
    expect(response.body).not.toHaveProperty("data");
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toMatch(/already used/i);
  });

  it("Saved user data in DB properly", async () => {
    // Mocking
    const hashPwd = jest.spyOn(bcrypt, "hash");
    hashPwd.mockImplementationOnce(() => "hashedPwd");

    const currentTime = new Date("2022-01-01");
    jest.useFakeTimers();
    jest.setSystemTime(currentTime);

    // Act
    const requestBody = {
      username: "john",
      email: "john@gmail.com",
      password: "1234",
      confirmPassword: "1234",
      type: "seller",
    };

    const response = await request(app)
      .post("/api/auth/register")
      .set("Accept", "application/json")
      .send(requestBody);

    // Assertion
    const insertedUser = await Users.query().findById(
      response.body.data.user.id
    );

    expect(insertedUser).toEqual({
      id: 1,
      username: "john",
      email: "john@gmail.com",
      password: "hashedPwd",
      type: "seller",
      createdAt: currentTime,
      catalog: [],
    });

    // Cleanup
    jest.useRealTimers();
  });
});
