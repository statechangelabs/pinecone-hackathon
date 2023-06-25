import { v } from "convex/values";
import { query } from "./_generated/server";

export const checkRepo = query({
  args: {
    url: v.string(),
  },
  async handler({ db }, { url }) {
    const resultSet = await db
      .query("repos")
      .filter((q) => q.eq(q.field("url"), url))
      .collect();
    if (!resultSet) return null;
    return resultSet[0];
  },
});
