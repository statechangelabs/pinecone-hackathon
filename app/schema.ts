import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Other tables here...

  requests: defineTable({
    platform: v.string(),
    query: v.string(),
    url: v.string(),
  }),
});
