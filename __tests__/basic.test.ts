import request from "supertest";
import app from "../app";
import { userTypes } from "../configs/constants";

describe("GET /", () => {
  it("responds properly", async () => {
    const response = await request(app)
      .get("/")
      .set("Accept", "application/json");

    expect(response.headers["content-type"]).toMatch(/json/i);
    expect(response.status).toEqual(200);
    expect(response.body.success).toBeTruthy();
  });
});

describe("GET /404", () => {
  it("responds properly", async () => {
    const response = await request(app)
      .get("/random")
      .set("Accept", "application/json");

    expect(response.headers["content-type"]).toMatch(/json/i);
    expect(response.status).toEqual(404);
    expect(response.body.success).toBeFalsy();
  });
});

describe("GET /api/utils/user-roles", () => {
  it("responds properly", async () => {
    const response = await request(app)
      .get("/api/utils/user-roles")
      .set("Accept", "application/json");

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(200);
    expect(response.body.data).toEqual(userTypes);
  });
});
