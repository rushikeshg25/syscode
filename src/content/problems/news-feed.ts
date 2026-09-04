import type { Problem } from "./types";
import { edge, node } from "./authoring";

export const newsFeed: Problem = {
  slug: "news-feed",
  title: "Social news feed",
  difficulty: "medium",
  tags: ["fan-out", "async", "caching"],
  summary:
    "Build each user's timeline from the people they follow, fast enough to open instantly.",
  prompt: [
    "Design the feed a user sees on opening a social app: recent posts from everyone they follow, newest first.",
    "Reading a feed must be fast. Building it by querying every followed account at read time does not hold up once someone follows a thousand people — and some accounts have millions of followers.",
  ],
  scale: [
    { label: "Daily actives", value: "100 million" },
    { label: "Posts", value: "5,000 / sec" },
    { label: "Feed opens", value: "300,000 / sec" },
    { label: "Feed load", value: "< 200 ms" },
  ],
  requirements: [
    { text: "Show recent posts from followed accounts.", type: "functional" },
    {
      text: "A new post appears in follower feeds within seconds.",
      type: "functional",
    },
    { text: "Attached media loads quickly worldwide.", type: "functional" },
    {
      text: "Feed reads stay fast regardless of following count.",
      type: "non-functional",
    },
    {
      text: "A celebrity post must not stall the write path.",
      type: "non-functional",
    },
    {
      text: "Posting stays available if feed building lags.",
      type: "non-functional",
    },
  ],
  hints: [
    "Reads outnumber writes 60:1. That argues for doing the expensive work when a post is created, not when a feed is opened.",
    "Fanning out to millions of followers cannot happen inside the user's post request. What decouples the two?",
    "A precomputed timeline per user is just a list — and it is read constantly.",
  ],
  rubric: [
    {
      id: "post-async",
      kind: "connects",
      from: "service",
      to: "queue",
      label: "Posting hands fan-out to a queue",
      feedback:
        "The post path has no queue behind it, so writing a post waits for fan-out to every follower.",
    },
    {
      id: "fanout-worker",
      kind: "connects",
      from: "queue",
      to: "worker",
      label: "Workers consume the fan-out work",
      feedback:
        "Nothing consumes the queue, so the fan-out work is enqueued and never performed.",
    },
    {
      id: "worker-writes-feed",
      kind: "connects",
      from: "worker",
      to: "cache",
      label: "Workers write precomputed timelines",
      feedback:
        "Workers do not write anywhere a feed read can use, so opening the app still has to build the feed from scratch.",
    },
    {
      id: "read-from-cache",
      kind: "connects",
      from: "service",
      to: "cache",
      label: "Feed reads hit the precomputed timeline",
      feedback:
        "Feed reads do not use the precomputed timelines, which defeats the whole point of fanning out on write.",
    },
    {
      id: "durable-posts",
      kind: "connects",
      from: "service",
      to: "database",
      label: "Posts are stored durably",
      feedback:
        "Posts only exist in the cache. A cache restart would erase them.",
    },
    {
      id: "media",
      kind: "has-component",
      component: "cdn",
      label: "Media is served from the edge",
      required: false,
      feedback:
        "Feed images and video should come from a CDN rather than your service.",
    },
    {
      id: "no-sync-fanout",
      kind: "absent-edge",
      from: "service",
      to: "worker",
      label: "Fan-out is not called synchronously",
      feedback:
        "The service calls the fan-out worker directly, so a celebrity post with millions of followers blocks the poster's request.",
    },
    {
      id: "reaches-storage",
      kind: "path-exists",
      from: ["client", "mobile"],
      to: "database",
      through: ["service"],
      label: "Writes reach storage through the service",
      feedback:
        "There is no path from the client to durable storage through your service tier.",
    },
  ],
  referenceSolution: {
    nodes: [
      node("client", "client", "Mobile app", 0, 200),
      node("lb", "load-balancer", "Load balancer", 220, 200),
      node("post-svc", "service", "Post service", 450, 90),
      node("feed-svc", "service", "Feed service", 450, 330),
      node("db", "database", "Post store", 690, 90),
      node("queue", "queue", "Fan-out queue", 690, 210),
      node("worker", "worker", "Fan-out worker", 930, 210),
      node("cache", "cache", "Timeline cache", 930, 380),
      node("cdn", "cdn", "Media CDN", 220, 400),
    ],
    edges: [
      edge("client", "lb"),
      edge("lb", "post-svc"),
      edge("lb", "feed-svc"),
      edge("post-svc", "db"),
      edge("post-svc", "queue"),
      edge("queue", "worker"),
      edge("worker", "cache"),
      edge("feed-svc", "cache"),
      edge("client", "cdn"),
    ],
  },
  tradeoffs: [
    "Fan-out on write makes reads trivial but costs a write per follower — untenable for accounts with millions of followers. Most real systems go hybrid: fan out for normal accounts, and merge celebrity posts in at read time.",
    "Precomputed timelines are eventually consistent. A post may take seconds to appear, which is almost always an acceptable trade for read latency.",
    "Timelines are usually capped at a few hundred entries; older pages fall back to querying the post store, which keeps cache memory bounded.",
  ],
};
