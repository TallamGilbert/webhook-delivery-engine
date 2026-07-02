import { config } from "./config";
import { buildApp } from "./api/server";

async function main() {
  const app = await buildApp();

  try {
    await app.listen({ port: config.port, host: config.host });
    console.log(`Server running at http://${config.host}:${config.port}`);
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

main();
