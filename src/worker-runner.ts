import { processDueJobs } from "./services/worker";
import { config } from "./config";

async function run() {
  console.log("Worker started. Polling every", config.workerPollInterval, "ms");

  // Run in a loop
  setInterval(async () => {
    try {
      const processed = await processDueJobs();
      if (processed > 0) {
        console.log(`Processed ${processed} job(s)`);
      }
    } catch (err) {
      console.error("Worker error:", err);
    }
  }, config.workerPollInterval);
}

run();
