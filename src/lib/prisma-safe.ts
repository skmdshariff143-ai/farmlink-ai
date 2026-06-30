import { prisma } from "./prisma";

interface MockArgs {
  data?: Record<string, unknown>;
  where?: { id?: string };
  create?: Record<string, unknown>;
}

// Mock handler factory for missing models
function createMockModel() {
  return {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    create: async (args: MockArgs) => ({ id: "mock-id", createdAt: new Date(), updatedAt: new Date(), ...(args?.data || {}) }),
    update: async (args: MockArgs) => ({ id: args?.where?.id || "mock-id", ...(args?.data || {}) }),
    delete: async (args: MockArgs) => ({ id: args?.where?.id || "mock-id" }),
    upsert: async (args: MockArgs) => ({ id: args?.where?.id || "mock-id", ...(args?.create || {}) })
  };
}

export const prismaSafe = new Proxy(prisma as unknown as Record<string, unknown>, {
  get(target, prop) {
    if (!(prop in target)) {
      console.warn(`[PRISMA SAFE MODE] Intercepted call to missing model properties: "${String(prop)}". Returning mock interfaces.`);
      return createMockModel();
    }
    return target[prop as string];
  }
});
