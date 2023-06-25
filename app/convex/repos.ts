import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getByUrl = query({
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

export const list = query({
  async handler({ db }) {
    const resultSet = await db.query("repos").collect();
    if (!resultSet) return null;
    return resultSet;
  },
});

export const update = mutation({
  args: {
    url: v.string(),
    status: v.string(),
  },
  async handler({ db }, { url, status }) {
    const resultSet = await db
      .query("repos")
      .filter((q) => q.eq(q.field("url"), url))
      .collect();
    const repo = resultSet ? resultSet[0] : null;
    if (repo) {
      await db.patch(repo._id, {
        lastModified: Date.now(),
        status,
      });
      return await db.get(repo._id);
    } else {
      const id = await db.insert("repos", {
        key: url,
        lastModified: Date.now(),
        status,
        url,
      });
      return await db.get(id);
    }
  },
});
