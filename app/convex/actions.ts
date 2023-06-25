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
      console.log("This repo does not yet exist in cache", repoUrl);
      fetch(
        "https://xw8v-tcfi-85ay.n7.xano.io/api:easylambda/run/3d09b484-b949-469e-9399-f272299c3295",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Bearer YjEwZjE2OWUtNjc3ZS00MWM2LWJmYjQtMzEwYmIyZTRiMjRl",
          },
          body: JSON.stringify({ url: repoUrl }),
        }
      );
      await new Promise((res) => setTimeout(res, 1000));
      //   ctx.runMutation(api.repos.update, {
      //     url: repoUrl,
      //     status: "fetching",
      //   });
      //   await cacheRepo(repoUrl);
      //   ctx.runMutation(api.repos.update, {
      //     url: repoUrl,
      //     status: "indexing",
      //   });
      //   await indexRepo(repoUrl);
      //   ctx.runMutation(api.repos.update, {
      //     url: repoUrl,
      //     status: "ready",
      //   });
    } else {
      console.log("This already exists", repoUrl);
    }
  },
});
