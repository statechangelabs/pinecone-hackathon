import { OpenAI } from "langchain/llms/openai";
import {config} from "dotenv";

config();

console.log("Hello World!", OpenAI);