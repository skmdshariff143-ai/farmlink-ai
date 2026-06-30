import { prisma } from "./prisma";

// Mock handler factory for missing models
function createMockModel(modelName: string | symbol) {
  const name = String(modelName);
  return {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    create: async (args: any) => ({ id: "mock-id", createdAt: new Date(), updatedAt: new Date(), ...args.data }),
    update: async (args: any) => ({ id: args.where?.id || "mock-id", ...args.data }),
    delete: async (args: any) => ({ id: args.where?.id || "mock-id" }),
    upsert: async (args: any) => ({ id: args.where?.id || "mock-id", ...args.create })
  };
}

export const prismaSafe = new Proxy(prisma as any, {
  get(target, prop) {
    if (!(prop in target)) {
      console.warn(`[PRISMA SAFE MODE] Intercepted call to missing model properties: "${String(prop)}". Returning mock interfaces.`);
      return createMockModel(prop);
    }
    return target[prop];
  }
});
