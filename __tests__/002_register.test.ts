import request from "supertest";
import bcrypt from "bcrypt";
import app from "../app";
import Users from "../models/users";
import { currentTime, mockPwd } from "../configs/constants";
import {
  expectErrorResponse,
  expectSuccessResponse,
} from "../utils/test-helpers";

const routePath = "/api/auth/register";

describe(`POST ${routePath}`, () => {
  it("Without body - throws error", async () => {
    const response = await request(app)
      .post(routePath)
      .set("Accept", "application/json");

    expectErrorResponse(response);
    expect(response.body.error).toMatch(/username/i);
  });

  it("Without username - throws error", async () => {
    const response = await request(app)
      .post(routePath)
      .set("Accept", "application/json")
      .send({
        email: "john@gmail.com",
        password: "1234",
        confirmPassword: "1234",
        type: "seller",
      });

    expectErrorResponse(response);
    expect(response.body.error).toMatch(/username/i);
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

  it("Without confirmPassword - throws error", async () => {
    const response = await request(app)
      .post(routePath)
      .set("Accept", "application/json")
      .send({
        username: "john",
        email: "john@gmail.com",
        password: "1234",
        type: "seller",
      });

    expectErrorResponse(response);
    expect(response.body.error).toMatch(/match/i);
  });

  it("With password !== confirmPassword - throws error", async () => {
    const response = await request(app)
      .post(routePath)
      .set("Accept", "application/json")
      .send({
        username: "john",
        email: "john@gmail.com",
        password: "1234",
        confirmPassword: "123",
        type: "seller",
      });

    expectErrorResponse(response);
    expect(response.body.error).toMatch(/match/i);
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

  it("With proper body - success", async () => {
    const response = await request(app)
      .post(routePath)
      .set("Accept", "application/json")
      .send({
        username: "john",
        email: "john@gmail.com",
        password: "1234",
        confirmPassword: "1234",
        type: "seller",
      });

    expectSuccessResponse(response);
  });

  it("With used email of different user type - success", async () => {
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
      .post(routePath)
      .set("Accept", "application/json")
      .send(requestBody);

    expectSuccessResponse(response);
  });

  it("With used email of same user type - throws error", async () => {
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
      .post(routePath)
      .set("Accept", "application/json")
      .send(requestBody);

    expectErrorResponse(response);
    expect(response.body.error).toMatch(/already used/i);
  });

  it("Update DB state - success", async () => {
    // Mocking
    const hashPwd = jest.spyOn(bcrypt, "hash");
    hashPwd.mockImplementationOnce(() => mockPwd);

    // Act
    const requestBody = {
      username: "john",
      email: "john@gmail.com",
      password: "1234",
      confirmPassword: "1234",
      type: "seller",
    };

    const response = await request(app)
      .post(routePath)
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
      password: mockPwd,
      type: "seller",
      createdAt: currentTime,
      catalog: [],
    });
  });
});
