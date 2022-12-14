import { Response } from "supertest";
import { mockToken, userTypes } from "../configs/constants";
import jwt from "jsonwebtoken";

/**
 * Extra options which can be passed optionally to change testing behavior
 */
interface AssertionOptions {
  status?: number;
}

/**
 * Boilerplate code to check for basic assertions for successful response
 */
export function expectSuccessResponse(
  response: Response,
  { status }: AssertionOptions = {}
) {
  expect(response.headers["content-type"]).toMatch(/json/i);
  expect(response.status).toEqual(status || 200);
  expect(response.body.success).toBeTruthy();
  expect(response.body).toHaveProperty("message");
  expect(response.body).toHaveProperty("data");
  expect(response.body).not.toHaveProperty("error");
}

/**
 * Boilerplate code to check for basic assertions for unsuccessful response
 */
export function expectErrorResponse(
  response: Response,
  { status }: AssertionOptions = {}
) {
  expect(response.headers["content-type"]).toMatch(/json/i);
  expect(response.status).toEqual(status || 400);
  expect(response.body.success).toBeFalsy();
  expect(response.body).toHaveProperty("message");
  expect(response.body).not.toHaveProperty("data");
  expect(response.body).toHaveProperty("error");
}

/**
 * Mock jwt.verify() once. Is is the function used to extract data from token inside auth middleware. \
 * Remove boilerplate code.
 */
export function loginAs(userId: number, userType: "buyer" | "seller") {
  jest.spyOn(jwt, "verify").mockImplementationOnce(() => ({
    userId,
    token: mockToken,
    userType,
  }));
}
