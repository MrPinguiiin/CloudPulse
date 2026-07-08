export interface AgentConfig {
  serverUrl: string;
  apiUrl: string;
  token?: string;
  intervalMs: number;
  hostname: string;
  type: "LOCAL" | "CLOUD";
}

function resolveConfig(): AgentConfig {
  const env = process.env;

  return {
    serverUrl: env.AGENT_SERVER_URL || "http://localhost:3000",
    apiUrl: env.AGENT_API_URL || (env.AGENT_SERVER_URL || "http://localhost:3000") + "/rpc/monitoring",
    token: env.AGENT_TOKEN,
    intervalMs: parseInt(env.AGENT_INTERVAL || "5000", 10),
    hostname: env.AGENT_HOSTNAME || "",
    type: (env.AGENT_TYPE as "LOCAL" | "CLOUD") || "LOCAL",
  };
}

export const config = resolveConfig();
