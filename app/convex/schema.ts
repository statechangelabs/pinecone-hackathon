import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Other tables here...

  requests: defineTable({
    platform: v.string(),
    query: v.string(),
    url: v.string(),
    // query2: v.string(),
  }),
  repos: defineTable({
    key: v.string(),
    lastModified: v.number(),
    status: v.string(),
    url: v.string(),
  }),
});
