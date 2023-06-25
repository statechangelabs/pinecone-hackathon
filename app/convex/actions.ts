"use node";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";
import {
  cacheRepo,
  indexRepo,
  //   runPrompt,
  getRepoFromUrl,
} from "@raydeck/pinecone-hackathon";

export const myAction = action({
  // Validators for arguments.
  handler: async (ctx, args) => {
    const me = await ctx.auth.getUserIdentity();
    console.log("Hello there this is ray", args, me?.email);

    return { message: "Hello there this is ray" };
  },
});

export const cacheRepoAction = action({
  args: {
    url: v.string(),
  },
  async handler(ctx, { url }) {
    console.log("Starting with url", url);
    const repoUrl = await getRepoFromUrl(url);
    if (!repoUrl) {
      throw new Error("Invalid repo url");
    }
    const repo = await ctx.runQuery(api.repos.getByUrl, { url });
    if (!repo) {
      ctx.runMutation(api.repos.update, {
        url: repoUrl,
        status: "fetching",
      });
      await cacheRepo(repoUrl);
      ctx.runMutation(api.repos.update, {
        url: repoUrl,
        status: "indexing",
      });
      await indexRepo(repoUrl);
      ctx.runMutation(api.repos.update, {
        url: repoUrl,
        status: "ready",
      });
    }
  },
});
