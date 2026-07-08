import { networkInterfaces } from "node:os";
import { config } from "./config";
import type { SystemMetrics } from "./collector";

export class Reporter {
  private registered = false;

  constructor(private token: string) {}

  async register(): Promise<boolean> {
    if (this.registered) return true;

    try {
      const url = `${config.serverUrl}/api/agent/register`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({
          hostname: config.hostname,
          ip: getLocalIp(),
          type: config.type,
        }),
      });

      if (!response.ok) {
        console.error(`[agent] Register failed: ${response.status} ${response.statusText}`);
        const text = await response.text();
        console.error("[agent] Server response:", text);
        return false;
      }

      this.registered = true;
      console.log("[agent] Registered successfully");
      return true;
    } catch (err) {
      console.error("[agent] Register error:", err);
      return false;
    }
  }

  async sendMetrics(metrics: SystemMetrics): Promise<boolean> {
    try {
      const url = `${config.serverUrl}/api/agent/heartbeat`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(metrics),
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error("[agent] Invalid token — agent needs a valid token from the dashboard");
        }
        return false;
      }

      return true;
    } catch (err) {
      console.error("[agent] Heartbeat error:", err);
      return false;
    }
  }
}

function getLocalIp(): string {
  const interfaces = networkInterfaces();
  for (const [, addrs] of Object.entries(interfaces)) {
    if (!addrs) continue;
    for (const addr of addrs) {
      if (addr.family === "IPv4" && !addr.internal) {
        return addr.address;
      }
    }
  }
  return "127.0.0.1";
}
