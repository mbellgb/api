const GhostContentAPI = require("@tryghost/content-api");
const { addMinutes, compareAsc } = require("date-fns");
const { promisify } = require("util");

const api = new GhostContentAPI({
  url: "https://blog.mbell.dev",
  key: process.env["BLOG_API_KEY"],
  version: "v3"
});

const cache = {
  expiry: null,
  posts: []
};

const getPosts = async () => {
  if (
    cache.expiry != null &&
    compareAsc(cache.expiry, new Date()) &&
    cache.posts.length > 0
  ) {
    return cache.posts;
  } else {
    const posts = (await api.posts.browse({ limit: 5 })).map(post => ({
      title: post.title,
      excerpt: post.excerpt,
      url: post.url
    }));
    cache.expiry = addMinutes(new Date(), 15);
    cache.posts = posts;
    return posts;
  }
};

module.exports = { getPosts };
