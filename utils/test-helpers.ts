import { Response } from "supertest";

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
