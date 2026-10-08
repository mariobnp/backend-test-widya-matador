import { describe, expect, it } from "vitest";
import { openApiDocument } from "../src/config/openapi.js";

describe("OpenAPI document", () => {
  it("documents every authentication, user, and item endpoint", () => {
    expect(Object.keys(openApiDocument.paths)).toEqual(
      expect.arrayContaining([
        "/auth/register",
        "/auth/login",
        "/users/me",
        "/items",
        "/items/{id}",
      ]),
    );
    expect(openApiDocument.paths["/items"]).toHaveProperty("get");
    expect(openApiDocument.paths["/items"]).toHaveProperty("post");
    expect(openApiDocument.paths["/items/{id}"]).toHaveProperty("put");
    expect(openApiDocument.paths["/items/{id}"]).toHaveProperty("delete");
  });

  it("requires bearer authentication for protected endpoints", () => {
    expect(openApiDocument.paths["/users/me"].get).toMatchObject({
      security: [{ bearerAuth: [] }],
    });
    expect(openApiDocument.paths["/items"].get).toMatchObject({
      security: [{ bearerAuth: [] }],
    });
    expect(openApiDocument.paths["/items"].post).toMatchObject({
      security: [{ bearerAuth: [] }],
    });
    expect(openApiDocument.components.securitySchemes.bearerAuth).toMatchObject({
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
    });
  });
});
