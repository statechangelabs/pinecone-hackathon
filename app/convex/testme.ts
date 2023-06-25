import { mutation, action } from "./_generated/server";
import { v } from "convex/values";

export const myMutationFunction = mutation({
  // Validators for arguments.

  // Function implementation.
  handler: async (
    { db, auth },
    { url, platform, query }: { url: string; platform: string; query: string }
  ) => {
    // Insert or modify documents in the database here.
    // Mutations can also read from the database like queries.
    // See https://docs.convex.dev/database/writing-data.

    const me = await auth.getUserIdentity();
    const meJSON = JSON.stringify(me);
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

export const myAction = action({
  // Validators for arguments.
  handler: async (ctx, args) => {
    const me = await ctx.auth.getUserIdentity();
    console.log("Hello there this is ray", args, me?.email);
    return { message: "Hello there this is ray" };
  },
});
