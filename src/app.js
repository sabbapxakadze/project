const express = require("express");

const app = express();

app.use(express.json());

const items = [];

const featureToggles = {
  darkMode: process.env.FEATURE_DARK_MODE === "true",
  detailedHealth: process.env.FEATURE_DETAILED_HEALTH === "true",
};

app.get("/", (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DevOps Web App</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background: #1a1a2e; color: #eee; padding: 40px; }
    h1 { color: #e94560; margin-bottom: 10px; }
    .subtitle { color: #888; margin-bottom: 30px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .card { background: #16213e; border-radius: 10px; padding: 20px; }
    .card h3 { color: #e94560; margin-bottom: 10px; }
    .status { display: inline-block; background: #0f3460; padding: 4px 12px; border-radius: 20px; font-size: 13px; margin: 3px; }
    .status.on { background: #2ecc71; color: #000; }
    .status.off { background: #555; }
    #items-section { background: #16213e; border-radius: 10px; padding: 20px; max-width: 500px; }
    #items-section h3 { color: #e94560; margin-bottom: 15px; }
    .add-form { display: flex; gap: 10px; margin-bottom: 15px; }
    .add-form input { flex: 1; padding: 8px 12px; border-radius: 6px; border: none; background: #0f3460; color: #eee; }
    .add-form button { padding: 8px 16px; border-radius: 6px; border: none; background: #e94560; color: #fff; cursor: pointer; }
    .add-form button:hover { background: #c73650; }
    .item { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #0f3460; border-radius: 6px; margin-bottom: 6px; }
    .item button { background: none; border: none; color: #e94560; cursor: pointer; font-size: 16px; }
    .empty { color: #666; font-style: italic; }
    #time { color: #2ecc71; }
  </style>
</head>
<body>
  <h1>DevOps Web App</h1>
  <p class="subtitle">CI/CD Demo with GitHub Actions</p>

  <div class="grid">
    <div class="card">
      <h3>Health</h3>
      <p>Status: <span id="health-status">...</span></p>
      <p>Uptime: <span id="uptime">...</span></p>
    </div>
    <div class="card">
      <h3>Server Time</h3>
      <p id="time">...</p>
    </div>
    <div class="card">
      <h3>Feature Toggles</h3>
      <div id="features">...</div>
    </div>
  </div>

  <div id="items-section">
    <h3>Items</h3>
    <div class="add-form">
      <input type="text" id="item-name" placeholder="Enter item name...">
      <button onclick="addItem()">Add</button>
    </div>
    <div id="items-list"><p class="empty">No items yet</p></div>
  </div>

  <script>
    async function loadHealth() {
      const res = await fetch('/health');
      const data = await res.json();
      document.getElementById('health-status').textContent = data.status;
      document.getElementById('uptime').textContent = Math.floor(data.uptime) + 's';
    }

    async function loadTime() {
      const res = await fetch('/time');
      const data = await res.json();
      document.getElementById('time').textContent = new Date(data.currentTime).toLocaleString();
    }

    async function loadFeatures() {
      const res = await fetch('/features');
      const data = await res.json();
      const el = document.getElementById('features');
      el.innerHTML = Object.entries(data)
        .map(([k, v]) => '<span class="status ' + (v ? 'on' : 'off') + '">' + k + ': ' + (v ? 'ON' : 'OFF') + '</span>')
        .join('');
    }

    async function loadItems() {
      const res = await fetch('/items');
      const data = await res.json();
      const el = document.getElementById('items-list');
      if (data.length === 0) {
        el.innerHTML = '<p class="empty">No items yet</p>';
      } else {
        el.innerHTML = data.map(function(item) {
          return '<div class="item"><span>' + item.name + '</span><button onclick="deleteItem(' + item.id + ')">x</button></div>';
        }).join('');
      }
    }

    async function addItem() {
      const input = document.getElementById('item-name');
      const name = input.value.trim();
      if (!name) return;
      await fetch('/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name })
      });
      input.value = '';
      loadItems();
    }

    document.getElementById('item-name').addEventListener('keydown', function(e) {
      if (e.key === 'Enter') addItem();
    });

    async function deleteItem(id) {
      await fetch('/items/' + id, { method: 'DELETE' });
      loadItems();
    }

    loadHealth();
    loadTime();
    loadFeatures();
    loadItems();
    setInterval(loadTime, 1000);
    setInterval(loadHealth, 5000);
  </script>
</body>
</html>`);
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
