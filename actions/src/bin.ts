import {
  cacheRepo,
  deIndexRepo,
  flushRepo,
  getRepoFromUrl,
  indexRepo,
  runPrompt,
} from "./scraper.js";

import { Command } from "commander";

import { config } from "dotenv";

config();

const command = new Command();
// command.addArgument(
//   command.createArgument("sourceUrl", "Source Url").argRequired()
// );

command.command("index <sourceUrl>").action(async (sourceUrl) => {
  const repoUrl = await getRepoFromUrl(sourceUrl);
  console.log(repoUrl);
  if (!repoUrl) {
    console.error("No repo found in source url", sourceUrl);
    process.exit(1);
  }
  const store = await cacheRepo(repoUrl);
  const index = await indexRepo(repoUrl);
  await flushRepo(repoUrl);
});

command.command("flush <sourceUrl>").action(async (sourceUrl) => {
  const repoUrl = await getRepoFromUrl(sourceUrl);
  console.log(repoUrl);
  if (!repoUrl) {
    console.error("No repo found in source url", sourceUrl);
    process.exit(1);
  }
  flushRepo(repoUrl);
  deIndexRepo(repoUrl);
});

command
  .command("query <sourceUrl> <query>")
  .option("-p --platform <platform>", "Platform to use", "webflow")
  .action(async (sourceUrl, query, command) => {
    const repoUrl = await getRepoFromUrl(sourceUrl);
    if (!repoUrl) {
      console.error("No repo found in source url", sourceUrl);
      process.exit(1);
    }
    const { code, fullText } = await runPrompt(
      query,
      repoUrl,
      command.platform
    );
    console.log(code);
  });

command.parse(process.argv);
//   //   console.log(command);
//   const [sourceUrl] = command.args;
//   if (sourceUrl) {
//     const repoUrl = await getRepoFromUrl(sourceUrl);
//     console.log(repoUrl);
//     if (!repoUrl) {
//       console.error("No repo found in source url", sourceUrl);
//       process.exit(1);
//     }
//     const store = await cacheRepo(repoUrl);
//     const index = await indexRepo(repoUrl);
//   } else {
//     console.log("Boopgers");
//   }
// })();
