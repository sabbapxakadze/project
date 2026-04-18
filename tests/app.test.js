const request = require("supertest");
const app = require("../src/app");

describe("GET /", () => {
  it("returns welcome message", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.message).toBe("Welcome to the DevOps Web App");
  });
});

describe("GET /health", () => {
  it("returns healthy status", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("healthy");
    expect(res.body).toHaveProperty("uptime");
  });
});

describe("POST /items", () => {
  it("creates a new item", async () => {
    const res = await request(app).post("/items").send({ name: "Test Item" });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Test Item");
    expect(res.body).toHaveProperty("id");
  });

  it("returns 400 when name is missing", async () => {
    const res = await request(app).post("/items").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Name is required");
  });
});

describe("GET /items", () => {
  it("returns list of items", async () => {
    const res = await request(app).get("/items");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe("DELETE /items/:id", () => {
  it("deletes an existing item", async () => {
    const createRes = await request(app)
      .post("/items")
      .send({ name: "To Delete" });
    const id = createRes.body.id;

    const res = await request(app).delete(`/items/${id}`);
    expect(res.status).toBe(204);
  });

  it("returns 404 for non-existent item", async () => {
    const res = await request(app).delete("/items/99999");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Item not found");
  });
});

describe("GET /time", () => {
  it("returns current time", async () => {
    const res = await request(app).get("/time");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("currentTime");
  });
});

describe("GET /features", () => {
  it("returns feature toggles", async () => {
    const res = await request(app).get("/features");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("darkMode");
    expect(res.body).toHaveProperty("detailedHealth");
  });
});

describe("GET /metrics", () => {
  it("returns Prometheus-format metrics", async () => {
    const res = await request(app).get("/metrics");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/plain");
    expect(res.text).toContain("http_requests_total");
    expect(res.text).toContain("uptime_seconds");
  });
});
