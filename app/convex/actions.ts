"use node";
import { action, internalAction } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";
import { getRepoFromUrl, runPrompt } from "@raydeck/pinecone-hackathon";

export const myAction = action({
  // Validators for arguments.
  handler: async (ctx, args) => {
    const me = await ctx.auth.getUserIdentity();
    console.log("Hello there this is ray", args, me?.email);

    return { message: "Hello there this is ray" };
  },
});
export const queryRepoAction = action({
  args: {
    id: v.id("repos"),
    question: v.string(),
    platform: v.string(),
  },
  handler: async (ctx, { id, question, platform }) => {
    console.log("I will start by getting the item in question", question);
    console.log("Great, now I will get the repo");

    const repo = await ctx.runQuery(api.repos.get, { id });
    console.log("I got the repo of ", repo);
    if (!repo) throw new Error("Repo not found");
    const record = await ctx.runMutation(api.anothertable.add, {
      name: repo.url,
      platform,
      question,
      reply: "",
    });
    if (!record) throw new Error("Record not found");
    const recordId = record._id;
    console.log("I got the record of ", record);
    ctx.runAction(api.actions.runPromptAction, {
      url: repo.url,
      question,
      platform,
      recordId,
    });
    await new Promise((r) => setTimeout(r, 1000));
    console.log("leaving queryrepoaction");
    const __id = recordId as string;
    return { id: __id };
  },
});
export const runPromptAction = internalAction({
  args: {
    url: v.string(),
    question: v.string(),
    platform: v.string(),
    recordId: v.id("anothertable"),
  },
  async handler(ctx, { url, question, platform, recordId }) {
    console.log("Starting runpromptaction");
    let output = "";
    const result = await runPrompt(
      question,
      url,
      platform as "weweb" | "webflow",
      (token) => {
        console.log("I got a new token in here", token);
        output = output + token;
        console.log("I think output should be", output);
        ctx.runMutation(api.anothertable.update, {
          id: recordId,
          reply: output,
        });
      }
    );
    await ctx.runMutation(api.anothertable.update, {
      id: recordId,
      reply: result.fullText,
    });

    return { result };
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
