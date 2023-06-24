import { OpenAI } from "langchain/llms/openai";
import { config } from "dotenv";
import { GithubRepoLoader } from "langchain/document_loaders/web/github";

config();

console.log("Hello World!", OpenAI);

const git_url = "https://github.com/hwchase17/langchainjs";

const run = async () => {
  const loader = new GithubRepoLoader(git_url, {
    branch: "main",
    recursive: true,
    unknown: "warn",

    // ignorePaths: ["*.md"],
  });
  const docs = await loader.load();
  console.log(docs.length);
  // Will not include any .md files
};

run();
