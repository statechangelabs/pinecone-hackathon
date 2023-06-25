"use node";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";
import {
  cacheRepo,
  indexRepo,
  runPrompt,
  getRepoFromUrl,
} from "pinecone-hackathon";

export const myAction = action({
  // Validators for arguments.
  handler: async (ctx, args) => {
    const me = await ctx.auth.getUserIdentity();
    console.log("Hello there this is ray", args, me?.email);
    ctx.runMutation(api.mutations.myMutationFunction, {
      url: "hello",
      platform: "world",
      query: "ray" + new Date().toISOString(),
    });
    return { message: "Hello there this is ray" };
  },
});

export const cacheRepoAction = action({
  args: {
    url: v.string(),
  },
  async handler(ctx, { url }) {
    const repoUrl = await getRepoFromUrl(url);
    if (!repoUrl) {
      throw new Error("Invalid repo url");
    }
    await cacheRepo(repoUrl);
    await indexRepo(repoUrl);
  },
});
