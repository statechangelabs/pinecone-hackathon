import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const myMutationFunction = mutation({
  // Validators for arguments.
  args: {
    url: v.string(),
    platform: v.string(),
    query: v.string(),
  },
  // Function implementation.
  handler: async ({ db, auth }, { url, platform, query }) => {
    // Insert or modify documents in the database here.
    // Mutations can also read from the database like queries.
    // See https://docs.convex.dev/database/writing-data.
    console.log({ url, platform, query });
    const me = await auth.getUserIdentity();
    const id = await db.insert("requests", {
      platform,
      url,
      query: me?.email || "so sad",
      //   query2: query,
    });
    // Optionally, return a value from your mutation.
    return await db.get(id);
  },
});
export const updateRepo = mutation({
  args: {
    url: v.string(),
    status: v.string(),
  },
  async handler({ db }, { url, status }) {
    const id = await db.insert("repos", {
      key: url,
      lastModified: Date.now(),
      status,
      url,
    });
    return await db.get(id);
  },
});
