import { ORPCError, os } from "@orpc/server";

import type { Context } from "./context";

export const o = os.$context<Context>();

export const publicProcedure = o;

const requireAuth = o.middleware(async ({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError("UNAUTHORIZED");
  }
  return next({
    context: {
      session: context.session,
    },
  });
});

const requireAgent = o.middleware(async ({ context, next }) => {
  if (!context.agent) {
    throw new ORPCError("UNAUTHORIZED", { message: "Invalid agent token" });
  }
  return next({
    context: {
      agent: context.agent,
    },
  });
});

export const protectedProcedure = publicProcedure.use(requireAuth);
export const agentProcedure = publicProcedure.use(requireAgent);
