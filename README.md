# DevOps Web App

![CI/CD Pipeline](https://github.com/sabbapxakadze/devops-web-app/actions/workflows/ci-cd.yml/badge.svg)

A Node.js web application demonstrating CI/CD with GitHub Actions, Kubernetes deployment strategies, feature toggles, and monitoring.

## Quick Start

```bash
npm install
npm start
```

Visit http://localhost:3000

## Run Tests

```bash
npm test
```

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/` | GET | Welcome message |
| `/health` | GET | Health check |
| `/features` | GET | Feature toggles status |
| `/metrics` | GET | Prometheus metrics |
| `/items` | GET | List all items |
| `/items` | POST | Create an item |
| `/items/:id` | DELETE | Delete an item |
