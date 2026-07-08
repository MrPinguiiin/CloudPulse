import { collectMetrics } from "./collector";
import { config } from "./config";
import { Reporter } from "./reporter";

async function main() {
  console.log("[agent] Starting monitoring agent...");
  console.log(`[agent] Server: ${config.serverUrl}`);
  console.log(`[agent] Interval: ${config.intervalMs}ms`);
  console.log(`[agent] Hostname: ${config.hostname || "(auto-detect)"}`);
  console.log(`[agent] Type: ${config.type}`);
  console.log(`[agent] Token: ${config.token ? "provided" : "not provided"}`);

  const token = config.token;
  if (!token) {
    console.error(
      "[agent] No AGENT_TOKEN configured. This agent cannot send data.\n" +
      "  Create a server in the dashboard first, then copy the agent token and restart with:\n" +
      "  AGENT_TOKEN=<token> bun run apps/agent/src/index.ts",
    );
    process.exit(1);
  }

  const reporter = new Reporter(token);

  const registered = await reporter.register();
  if (!registered) {
    console.error("[agent] Cannot register with the server. Exiting.");
    process.exit(1);
  }

  console.log(`[agent] Collecting metrics every ${config.intervalMs}ms...`);

  setInterval(async () => {
    try {
      const metrics = await collectMetrics();
      await reporter.sendMetrics(metrics);
    } catch (err) {
      console.error("[agent] Collection error:", err);
    }
  }, config.intervalMs);

  const metrics = await collectMetrics();
  console.log("[agent] Initial metrics collected:", {
    cpu: `${metrics.cpuUsage}%`,
    ram: `${metrics.ramUsagePct}%`,
    disk: `${metrics.diskUsagePct}%`,
    uptime: `${Math.floor(metrics.uptime / 3600)}h`,
    load: metrics.loadAvg1m,
  });
}

main().catch((err) => {
  console.error("[agent] Fatal error:", err);
  process.exit(1);
});
