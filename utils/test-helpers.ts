import { Response } from "supertest";

export function expectSuccessResponse(response: Response) {
  expect(response.headers["content-type"]).toMatch(/json/i);
  expect(response.status).toEqual(200);
  expect(response.body.success).toBeTruthy();
  expect(response.body).toHaveProperty("message");
  expect(response.body).toHaveProperty("data");
  expect(response.body).not.toHaveProperty("error");
}

export function expectErrorResponse(response: Response) {
  expect(response.headers["content-type"]).toMatch(/json/i);
  expect(response.status).toEqual(400);
  expect(response.body.success).toBeFalsy();
  expect(response.body).toHaveProperty("message");
  expect(response.body).not.toHaveProperty("data");
  expect(response.body).toHaveProperty("error");
}
