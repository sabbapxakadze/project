const express = require("express");

const app = express();

app.use(express.json());

const items = [];

const featureToggles = {
  darkMode: process.env.FEATURE_DARK_MODE === "true",
  detailedHealth: process.env.FEATURE_DETAILED_HEALTH === "true",
};

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Welcome to the DevOps Web App" });
});

app.get("/health", (req, res) => {
  const health = { status: "healthy", uptime: process.uptime() };
  if (featureToggles.detailedHealth) {
    health.memoryUsage = process.memoryUsage();
    health.nodeVersion = process.version;
  }
  res.json(health);
});

app.get("/features", (req, res) => {
  res.json(featureToggles);
});

let requestCount = 0;
app.use((req, res, next) => {
  requestCount++;
  next();
});

app.get("/metrics", (req, res) => {
  res.set("Content-Type", "text/plain");
  res.send(
    `# HELP http_requests_total Total HTTP requests\n` +
      `# TYPE http_requests_total counter\n` +
      `http_requests_total ${requestCount}\n` +
      `# HELP uptime_seconds Application uptime\n` +
      `# TYPE uptime_seconds gauge\n` +
      `uptime_seconds ${process.uptime()}\n`
  );
});

app.get("/time", (req, res) => {
  res.json({ currentTime: new Date().toISOString() });
});

app.get("/items", (req, res) => {
  res.json(items);
});

app.post("/items", (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }
  const item = { id: items.length + 1, name };
  items.push(item);
  res.status(201).json(item);
});

app.delete("/items/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Item not found" });
  }
  items.splice(index, 1);
  res.status(204).send();
});

module.exports = app;
