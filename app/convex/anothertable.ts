import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: {
    id: v.id("anothertable"),
  },
  async handler({ db }, { id }) {
    return await db.get(id);
  },
});
export const add = mutation({
  args: {
    name: v.string(),
    platform: v.string(),
    question: v.string(),
    reply: v.string(),
  },

  async handler({ db }, { name, platform, question, reply }) {
    const id = await db.insert("anothertable", {
      key: name,
      platform,
      question,
      reply,
    });
    return await db.get(id);
  },
});
export const update = mutation({
  args: {
    id: v.id("anothertable"),
    reply: v.string(),
  },
  async handler({ db }, { id, reply }) {
    await db.patch(id, {
      reply,
    });
    return await db.get(id);
  },
});
