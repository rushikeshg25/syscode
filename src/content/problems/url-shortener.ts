import type { Problem } from "./types";
import { edge, node } from "./authoring";

export const urlShortener: Problem = {
  slug: "url-shortener",
  title: "URL shortener",
  difficulty: "easy",
  tags: ["caching", "read-heavy", "key-value"],
  summary:
    "Turn long URLs into short codes and redirect billions of clicks a month.",
  prompt: [
    "Design a service that accepts a long URL and returns a short code, then redirects anyone who visits that code back to the original URL.",
    "Redirects vastly outnumber creations, and a redirect sits directly in the user's page load, so latency on the read path is what matters.",
  ],
  scale: [
    { label: "New links", value: "100 / sec" },
    { label: "Redirects", value: "10,000 / sec" },
    { label: "Read : write", value: "100 : 1" },
    { label: "Redirect latency", value: "< 50 ms p99" },
  ],
  requirements: [
    {
      text: "Create a short code for a submitted long URL.",
      type: "functional",
    },
    { text: "Redirect a short code to its original URL.", type: "functional" },
    { text: "Short codes are unique and never reused.", type: "functional" },
    {
      text: "Survive the loss of any single application server.",
      type: "non-functional",
    },
    { text: "Redirects resolve in under 50ms.", type: "non-functional" },
    { text: "Scale reads independently of writes.", type: "non-functional" },
  ],
  hints: [
    "Reads outnumber writes 100:1. Which tier absorbs that read traffic so the database does not see every redirect?",
    "One application server is a single point of failure. What sits in front of several of them?",
    "The mapping from code to URL never changes once written, which makes it an unusually good cache entry.",
  ],
  rubric: [
    {
      id: "lb-front",
      kind: "has-component",
      component: "load-balancer",
      label: "Traffic is spread across servers",
      feedback:
        "There is no load balancer, so every request lands on one machine and that machine is a single point of failure.",
    },
    {
      id: "client-through-lb",
      kind: "path-exists",
      from: "client",
      to: "service",
      through: ["load-balancer"],
      label: "Clients reach the service through the load balancer",
      feedback:
        "Clients are not routed through the load balancer, so adding servers will not spread any traffic.",
    },
    {
      id: "service-cache",
      kind: "connects",
      from: "service",
      to: "cache",
      label: "The service reads through a cache",
      feedback:
        "Nothing is caching the code-to-URL mapping, so all 10,000 redirects a second hit the database.",
    },
    {
      id: "service-db",
      kind: "connects",
      from: "service",
      to: "database",
      label: "The service persists links in a database",
      feedback:
        "Short codes need durable storage — a cache alone loses every link when it restarts.",
    },
    {
      id: "no-direct-db",
      kind: "absent-edge",
      from: "client",
      to: "database",
      label: "Clients never reach the database directly",
      feedback:
        "A client is wired straight to the database. Exposing the datastore to the public skips all validation and connection pooling.",
    },
    {
      id: "reaches-db",
      kind: "path-exists",
      from: "client",
      to: "database",
      through: ["service"],
      label: "The write path reaches storage through the service",
      feedback:
        "There is no route from a client to the database through your service tier, so links can never be saved.",
    },
    {
      id: "scale-out",
      kind: "count-at-least",
      component: "service",
      n: 2,
      label: "More than one application server",
      required: false,
      weight: 1,
      feedback:
        "Only one service instance is drawn. Two or more behind the load balancer is what actually buys you availability.",
    },
  ],
  referenceSolution: {
    nodes: [
      node("client", "client", "Web client", 0, 150),
      node("lb", "load-balancer", "Load balancer", 240, 150),
      node("svc-1", "service", "Shortener API", 500, 60),
      node("svc-2", "service", "Shortener API", 500, 250),
      node("cache", "cache", "Redis cache", 760, 40),
      node("db", "database", "URL store", 760, 260),
    ],
    edges: [
      edge("client", "lb"),
      edge("lb", "svc-1"),
      edge("lb", "svc-2"),
      edge("svc-1", "cache"),
      edge("svc-2", "cache"),
      edge("svc-1", "db"),
      edge("svc-2", "db"),
    ],
  },
  tradeoffs: [
    "Generating codes from a counter (base62) keeps them short and collision-free, but the counter becomes a write bottleneck. Hashing the URL avoids coordination but must handle collisions.",
    "Because a mapping is immutable once written, the cache never needs invalidation — only eviction. That is why a plain LRU works so well here.",
    "A key-value store fits the access pattern better than a relational database: every read is a single primary-key lookup.",
  ],
};
