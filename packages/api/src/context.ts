import { auth } from "@monitoring-server/auth";
import prisma from "@monitoring-server/db";
import type { Context as HonoContext } from "hono";

export type CreateContextOptions = {
  context: HonoContext;
};

export async function createContext({ context }: CreateContextOptions) {
  const headers = context.req.raw.headers;

  const session = await auth.api.getSession({ headers });

  let agent: { serverId: string; server: Record<string, unknown> } | undefined;

  const authHeader = headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const server = await prisma.server.findUnique({
      where: { agentToken: token },
    });
    if (server) {
      agent = { serverId: server.id, server: server as unknown as Record<string, unknown> };
    }
  }

  return {
    auth: null,
    session,
    agent,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
