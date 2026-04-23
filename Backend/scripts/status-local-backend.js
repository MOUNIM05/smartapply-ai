const services = [
  { name: "auth", port: 5000 },
  { name: "profile", port: 5001 },
  { name: "job", port: 5002 },
  { name: "ai", port: 5003 },
  { name: "document", port: 5004 },
  { name: "notification", port: 5005 }
];

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

const run = async () => {
  let allUp = true;

  for (const service of services) {
    const healthy = await checkHealth(service.port);
    const status = healthy ? "UP" : "DOWN";
    console.log(`${status} - ${service.name} (http://localhost:${service.port}/)`);
    if (!healthy) {
      allUp = false;
    }
  }

  if (!allUp) {
    process.exit(1);
  }
};

run().catch((error) => {
  console.error("Unable to check backend services:", error.message);
  process.exit(1);
});

