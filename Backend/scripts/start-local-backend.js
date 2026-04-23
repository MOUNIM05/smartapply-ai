const { spawn } = require("child_process");
const path = require("path");

const services = [
  { name: "auth", port: 5000, dir: "auth_service" },
  { name: "profile", port: 5001, dir: "profile_service" },
  { name: "job", port: 5002, dir: "job_service" },
  { name: "ai", port: 5003, dir: "ai_service" },
  { name: "document", port: 5004, dir: "document_service" },
  { name: "notification", port: 5005, dir: "notification_service" }
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const checkHealth = async (port, timeoutMs = 2500) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`http://localhost:${port}/`, {
      method: "GET",
      signal: controller.signal
    });
    return response.ok;
  } catch (error) {
    return false;
  } finally {
    clearTimeout(timeout);
  }
};

const startService = (service) => {
  const cwd = path.resolve(__dirname, "..", service.dir);

  const command = process.platform === "win32" ? "cmd.exe" : "npm";
  const args =
    process.platform === "win32" ? ["/c", "npm", "start"] : ["start"];

  const child = spawn(command, args, {
    cwd,
    detached: true,
    stdio: "ignore"
  });

  child.unref();
};

const waitUntilUp = async (service, attempts = 20, intervalMs = 1000) => {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const healthy = await checkHealth(service.port);
    if (healthy) {
      return true;
    }
    await sleep(intervalMs);
  }
  return false;
};

const run = async () => {
  const alreadyRunning = [];
  const started = [];
  const failed = [];

  for (const service of services) {
    const healthy = await checkHealth(service.port);

    if (healthy) {
      alreadyRunning.push(service.name);
      continue;
    }

    startService(service);
    const up = await waitUntilUp(service);

    if (up) {
      started.push(service.name);
    } else {
      failed.push(service.name);
    }
  }

  console.log("Already running:", alreadyRunning.length ? alreadyRunning.join(", ") : "none");
  console.log("Started now:", started.length ? started.join(", ") : "none");
  console.log("Failed:", failed.length ? failed.join(", ") : "none");

  if (failed.length > 0) {
    process.exit(1);
  }
};

run().catch((error) => {
  console.error("Unable to start backend services:", error.message);
  process.exit(1);
});

