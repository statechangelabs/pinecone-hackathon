import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  PromptTemplate,
  SystemMessagePromptTemplate,
} from "langchain/prompts";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { config } from "dotenv";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { BufferMemory } from "langchain/memory";

config();
const run = async () => {
  const model = new ChatOpenAI({
    temperature: 0.9,
    //   openAIApiKey: "YOUR-API-KEY", // In Node.js defaults to process.env.OPENAI_API_KEY
  });

  const client = new PineconeClient();
  await client.init({
    apiKey: process.env.PINECONE_API_KEY || "",
    environment: process.env.PINECONE_ENVIRONMENT || "",
  });
  const pineconeIndex = client.Index("pinecone-hackathon-test");

  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings(),
    { pineconeIndex, namespace: "github-com-wbkd-react-flow" }
  );

  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorStore.asRetriever(),
    {
      memory: new BufferMemory({
        memoryKey: "chat_history", // Must be set to "chat_history"
      }),
    }
  );

  const question = "How do you connect two nodes in reactflow?";
  const res = await chain.call({ question });
  console.log(res);

  console.log("Chain is : \n", chain);

  console.log(
    "Chain memory is : \n",
    (chain.memory as BufferMemory).chatHistory
  );

  /* Ask it a follow up question */
  const followUpRes = await chain.call({
    question: "Was that nice?",
  });
  console.log(followUpRes);

  console.log(
    "Chain memory 2 is : \n",
    (chain.memory as BufferMemory).chatHistory
  );

  // A `PromptTemplate` consists of a template string and a list of input variables.
  //   const template = "What is a good name for a company that makes {product}?";
  //   const promptA = new PromptTemplate({ template, inputVariables: ["product"] });

  //   // We can use the `format` method to format the template with the given input values.
  //   const responseA = await promptA.format({ product: "colorful socks" });
  //   console.log({ responseA });
  //   console.log("Hello World!");
  //   return;
  /*
  {
    responseA: 'What is a good name for a company that makes colorful socks?'
  }
  */

  // We can also use the `fromTemplate` method to create a `PromptTemplate` object.
  //   const promptB = PromptTemplate.fromTemplate(
  //     "What is a good name for a company that makes {product}?"
  //   );
  //   const responseB = await promptB.format({ product: "colorful socks" });
  //   console.log({ responseB });
  /*
  {
    responseB: 'What is a good name for a company that makes colorful socks?'
  }
  */

  // For chat models, we provide a `ChatPromptTemplate` class that can be used to format chat prompts.
  //   const chatPrompt = ChatPromptTemplate.fromPromptMessages([
  //     SystemMessagePromptTemplate.fromTemplate(
  //       "You are a helpful assistant that translates {input_language} to {output_language}."
  //     ),
  //     HumanMessagePromptTemplate.fromTemplate("{text}"),
  //   ]);

  //   // The result can be formatted as a string using the `format` method.
  //   const responseC = await chatPrompt.format({
  //     input_language: "English",
  //     output_language: "French",
  //     text: "I love programming.",
  //   });
  //   console.log({ responseC });
  /*
  {
    responseC: '[{"text":"You are a helpful assistant that translates English to French."},{"text":"I love programming."}]'
  }
  */

  // The result can also be formatted as a list of `ChatMessage` objects by returning a `PromptValue` object and calling the `toChatMessages` method.
  // More on this below.
  //   const responseD = await chatPrompt.formatPromptValue({
  //     input_language: "English",
  //     output_language: "French",
  //     text: "I love programming.",
  //   });
  //   const messages = responseD.toChatMessages();
  //   console.log({ messages });
  /*
  {
    messages: [
        SystemChatMessage {
          text: 'You are a helpful assistant that translates English to French.'
        },
        HumanChatMessage { text: 'I love programming.' }
      ]
  }
  */
};

run();
