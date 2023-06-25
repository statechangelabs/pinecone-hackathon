import { httpAction } from "./_generated/server";
import { httpRouter } from "convex/server";
import { api } from "./_generated/api";

const repoUpdate = httpAction(async ({ runMutation }, request) => {
  const { url, status } = await request.json();
  await runMutation(api.repos.update, { url, status });

  return new Response(null, {
    status: 200,
  });
});

const http = httpRouter();

http.route({
  path: "/repoUpdate",
  method: "POST",
  handler: repoUpdate,
});

// Convex expects the router to be the default export of `convex/http.js`.
export default http;
