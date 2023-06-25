import { PineconeStore } from "langchain/vectorstores/pinecone";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import Pinecone from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { Document } from "langchain/document";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { BufferMemory } from "langchain/memory";

const walk: (dirPath: string) => Promise<string[]> = async (dirPath) =>
  Promise.all(
    await readdir(dirPath, { withFileTypes: true }).then((entries) =>
      entries.map((entry) => {
        const childPath = join(dirPath, entry.name);
        return entry.isDirectory() ? walk(childPath) : childPath;
      })
    )
  ).then((a) => a.flatMap((paths) => paths));
const execAsync = promisify(exec);

export const flushRepo = async (
  repoUrl: string,
  path: string = "/tmp/clonecache"
) => {
  const rimraf = `rm -rf ${path}`;
  await execAsync(rimraf);
};

export const getRepoFromUrl = async (sourceUrl: string) => {
  //dude if this is already github, just return it
  if (sourceUrl.startsWith("https://github.com")) return sourceUrl;
  const body = await fetch(sourceUrl).then((res) => res.text());
  const urls = [
    ...body.matchAll(
      /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])/gm
    ),
  ];
  if (!urls.length) return undefined;
  return urls
    .map(([a]) => a)
    .filter((a) => a.includes("github.com"))
    .filter((e, i, a) => a.indexOf(e) == i)[0];
};

export const urlToKey = (url: string) => {
  const key = (url.split("://").pop() || "")
    .replace(/[\."/:]/gm, "-")
    .toLowerCase();
  return key;
};

export const cacheRepo = async (
  repoUrl: string,
  path: string = "/tmp/clonecache"
) => {
  await flushRepo(repoUrl, path);
  const cloneCommand = `git clone ${repoUrl} ${path}`;
  await execAsync(cloneCommand);
};

export const getStore = async (key: string) => {
  console.log("initializing pinecone");
  const pinecone = new Pinecone.PineconeClient();
  //check for existing index
  await pinecone.init({
    environment: process.env.PINECONE_ENVIRONMENT || "",
    apiKey: process.env.PINECONE_API_KEY || "",
  });

  const indexes = await pinecone.listIndexes();
  console.log("Indexes", indexes, process.env.PINECONE_INDEX);
  const existingIndex = indexes.some(
    (index) => index === process.env.PINECONE_INDEX
  );
  if (!existingIndex) {
    throw new Error("No index found");
  }
  const embeddings = new OpenAIEmbeddings();
  const store = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex: pinecone.Index(process.env.PINECONE_INDEX || ""),
    namespace: key,
  });
  return store;
};
export const indexRepo = async (
  repoUrl: string,
  path: string = "/tmp/clonecache"
) => {
  const key = urlToKey(repoUrl);
  //Now we create the index
  const store = await getStore(key); //recurse through file directory and pull out all files
  const files = await walk(path);
  const filteredFiles = files.filter((file) =>
    ["md", "txt", "js", "ts", "tsx", "jsx", "html", "css"].some((ext) =>
      file.endsWith(`.${ext}`)
    )
  );
  const baseNames = filteredFiles.map((p) => p.replace(path, ""));
  console.log("My files are", baseNames);
  //Iterate over the files and make documents
  let library: Document[] = [];
  const start = Date.now();
  console.log("Starting to index", filteredFiles.length, "files");
  for (const file of filteredFiles) {
    const name = file.replace(path, "");
    const content = await readFile(file, "utf-8");
    if (!content) continue;
    const doc = new Document({
      pageContent: content,
      metadata: { path: name, extension: name.split(".").pop() || "" },
    });
    if (!doc.pageContent || doc.pageContent.length > 30000) continue;
    library.push(doc);
    if (library.length > 200) {
      //send the chunk
      console.log(
        ((Date.now() - start) / 1000).toFixed(2),
        "sending..."
        // library.map((doc) => doc.metadata.path)
      );
      try {
        await store.addDocuments(
          library,
          library.map((doc) => doc.metadata.path)
        );
      } catch (e) {
        console.warn("unable to cache documents", (e as Error).message);
        let miniLibrary = [];
        for (const doc of library) {
          try {
            miniLibrary.push(doc);
            if (miniLibrary.length > 10) {
              try {
                console.log(
                  "Sending mini library",
                  miniLibrary.map((doc) => doc.metadata.path)
                );
                await store.addDocuments(
                  miniLibrary,
                  miniLibrary.map((doc) => doc.metadata.path)
                );
              } catch (e) {
                console.warn("unable to cache documents", (e as Error).message);
                for (const doc of miniLibrary) {
                  try {
                    console.log("Sending just the one", doc.metadata.path);
                    await store.addDocuments([doc], [doc.metadata.path]);
                  } catch (e) {
                    console.warn(
                      "unable to cache document",
                      doc.metadata.path,
                      doc.pageContent.length
                    );
                  }
                }
              }
              miniLibrary = [];
            }
          } catch (e) {
            console.warn(
              "unable to cache document",
              doc.metadata.path,
              doc.pageContent.length
            );
          }
        }
        if (miniLibrary.length) {
          for (const doc of miniLibrary) {
            try {
              console.log("Sending just the one", doc.metadata.path);
              await store.addDocuments([doc], [doc.metadata.path]);
            } catch (e) {
              console.warn(
                "unable to cache document",
                doc.metadata.path,
                doc.pageContent.length
              );
            }
          }
        }
      }
      library = [];
    }
  }
  if (library.length) {
    try {
      console.log("sending final...");
      await store.addDocuments(library);
    } catch (e) {
      console.warn("unable to cache documents", (e as Error).message);
      let miniLibrary = [];
      for (const doc of library) {
        try {
          miniLibrary.push(doc);
          if (miniLibrary.length > 30) {
            try {
              console.log(
                "Sending mini library",
                miniLibrary.map((doc) => doc.metadata.path)
              );
              await store.addDocuments(
                miniLibrary,
                miniLibrary.map((doc) => doc.metadata.path)
              );
            } catch (e) {
              console.warn("unable to cache documents", (e as Error).message);
              for (const doc of miniLibrary) {
                try {
                  console.log("Sending just the one", doc.metadata.path);
                  await store.addDocuments([doc], [doc.metadata.path]);
                } catch (e) {
                  console.warn(
                    "unable to cache document",
                    doc.metadata.path,
                    doc.pageContent.length
                  );
                }
              }
            }
            miniLibrary = [];
          }
        } catch (e) {
          console.warn(
            "unable to cache document",
            doc.metadata.path,
            doc.pageContent.length
          );
        }
      }
      if (miniLibrary.length) {
        try {
          console.log(
            "Sending final minilibrary",
            miniLibrary.map((doc) => doc.metadata.path)
          );
        } catch (e) {
          console.warn("unable to cache documents", (e as Error).message);
          for (const doc of miniLibrary) {
            try {
              console.log("Sending just the one at the end", doc.metadata.path);
              await store.addDocuments([doc], [doc.metadata.path]);
            } catch (e) {
              console.warn(
                "unable to cache document",
                doc.metadata.path,
                doc.pageContent.length
              );
            }
          }
        }
      }
    }
  }
};

export const deIndexRepo = async (url: string) => {
  const key = urlToKey(url);
  const pinecone = new Pinecone.PineconeClient();
  await pinecone.init({
    apiKey: process.env.PINECONE_API_KEY || "",
    environment: process.env.PINECONE_ENVIRONMENT || "",
  });
  const index = pinecone.Index(process.env.PINECONE_INDEX || "");
  await index.delete1({ deleteAll: true, namespace: key });
};

export const runPrompt = async (
  query: string,
  repoUrl: string,
  platform: "webflow" | "weweb"
) => {
  const store = await getStore(urlToKey(repoUrl));
  const retriever = store.asRetriever();
  const model = new ChatOpenAI({
    temperature: 0.9,
    modelName: "gpt-4-0613",
  });
  const questions = {
    webflow: `Make an HTML <script> tag to satisfy the following request:
    First, import the library into the current page with a script tag. 
    Second, do the following inside a function that is added to a global variable called webflow using the following syntax: 
    ${"```"}javascript
    var Webflow = window.Webflow || [];
    Webflow.push(function() {[fulfill the request here]})
    ${"```"}
    {query} 
    
    Add line comments to explain each step in the process. `,
    weweb: "Please satisfy the following request: {query}",
  };
  let question = questions[platform];
  question = question.replace("{query}", query);
  console.log("Question", question);
  const chain = ConversationalRetrievalQAChain.fromLLM(model, retriever, {
    memory: new BufferMemory({ memoryKey: "chat_history" }),
  });
  const res = await chain.call({ question: question });
  console.log("Response from chain", res);
  const text: string = res.text;
  //lets check for markdown code
  const codeRegex = /```.*\n[\s\S]*?```/g;
  const codeBlocks = text.match(codeRegex);
  if (codeBlocks) {
    const middle = codeBlocks[0].split("\n");
    middle.shift();
    middle.pop();
    return { code: middle.join("\n"), fullText: text };
  } else {
    return { fullText: text };
  }
};
