import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { exec } from "child_process";
import { promisify } from "util";
const execAsync = promisify(exec);
export const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
) => {
  try {
    const list = await execAsync("ls -la");
    console.log(list);
    const result = await execAsync("./git --help");
    const data = { result, event, context };
    return { statusCode: 200, body: JSON.stringify({ data }) };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed fetching data" }),
    };
  }
};
