import type { Problem } from "./types";
import { edge, node } from "./authoring";

export const pastebin: Problem = {
  slug: "pastebin",
  title: "Pastebin",
  difficulty: "easy",
  tags: ["storage", "expiry", "read-heavy"],
  summary:
    "Store text snippets behind a shareable link, with expiry and large-document support.",
  prompt: [
    "Design a service where a user pastes text, receives a link, and anyone with that link can read it back. Pastes may be set to expire.",
    "Most pastes are a few kilobytes, but some are multi-megabyte logs. Reads outnumber writes heavily, as a paste is usually shared with several people.",
  ],
  scale: [
    { label: "New pastes", value: "1 million / day" },
    { label: "Reads", value: "10 million / day" },
    { label: "Typical size", value: "10 KB" },
    { label: "Largest size", value: "10 MB" },
  ],
  requirements: [
    {
      text: "Store a text paste and return a unique link.",
      type: "functional",
    },
    { text: "Read a paste back by its link.", type: "functional" },
    { text: "Expire pastes after a chosen lifetime.", type: "functional" },
    { text: "Reclaim the storage of expired pastes.", type: "functional" },
    { text: "Reads stay fast as the corpus grows.", type: "non-functional" },
    {
      text: "A 10MB paste must not bloat the metadata store.",
      type: "non-functional",
    },
  ],
  hints: [
    "A 10MB blob and a 40-byte row about that blob want very different homes. Consider splitting the content from its metadata.",
    "Expiry does not happen for free — something has to run periodically and delete what has aged out.",
    "The read path looks a lot like the URL shortener's: a key lookup that is worth caching.",
  ],
  rubric: [
    {
      id: "api",
      kind: "path-exists",
      from: "client",
      to: "service",
      through: ["gateway"],
      label: "Requests enter through a gateway",
      required: false,
      feedback:
        "A gateway in front of the service gives you one place for auth, quotas and abuse controls.",
    },
    {
      id: "content-store",
      kind: "connects",
      from: "service",
      to: "object-storage",
      label: "Paste bodies go to object storage",
      feedback:
        "Multi-megabyte paste bodies are not in object storage. Putting them in database rows makes every metadata query drag the blobs along.",
    },
    {
      id: "metadata",
      kind: "connects",
      from: "service",
      to: "database",
      label: "Metadata lives in a database",
      feedback:
        "There is no metadata store for keys, expiry times and ownership — object storage alone cannot answer 'what has expired?'.",
    },
    {
      id: "cache-reads",
      kind: "connects",
      from: "service",
      to: "cache",
      label: "Hot pastes are cached",
      required: false,
      feedback:
        "Popular pastes are read many times. A cache in front of the read path removes most of that repeat work.",
    },
    {
      id: "expiry-worker",
      kind: "has-component",
      component: "scheduler",
      label: "Something drives expiry",
      feedback:
        "Nothing triggers cleanup, so expired pastes are still readable and keep consuming storage forever.",
    },
    {
      id: "cleanup-path",
      kind: "connects",
      from: "scheduler",
      to: "worker",
      label: "Expiry runs as background work",
      required: false,
      feedback:
        "Deleting expired pastes on the request path makes user requests pay for cleanup. Hand it to a worker.",
    },
    {
      id: "no-direct-storage",
      kind: "absent-edge",
      from: "client",
      to: "database",
      label: "Clients never query the database directly",
      feedback:
        "A client is wired straight to the database, which exposes the datastore and skips your service's validation.",
    },
  ],
  referenceSolution: {
    nodes: [
      node("client", "client", "Web client", 0, 160),
      node("gw", "gateway", "API gateway", 230, 160),
      node("svc", "service", "Paste service", 470, 160),
      node("cache", "cache", "Hot paste cache", 710, 20),
      node("meta", "database", "Paste metadata", 710, 180),
      node("blob", "object-storage", "Paste bodies", 710, 340),
      node("cron", "scheduler", "Expiry schedule", 230, 380),
      node("worker", "worker", "Cleanup worker", 470, 380),
    ],
    edges: [
      edge("client", "gw"),
      edge("gw", "svc"),
      edge("svc", "cache"),
      edge("svc", "meta"),
      edge("svc", "blob"),
      edge("cron", "worker"),
      edge("worker", "meta"),
      edge("worker", "blob"),
    ],
  },
  tradeoffs: [
    "Storing bodies in object storage costs an extra network hop per read, but keeps the metadata database small enough to stay in memory — usually the better trade at this ratio.",
    "Lazy expiry (check on read) is cheap and needs no scheduler, but never reclaims space for pastes nobody reads again. A sweeper reclaims storage at the cost of a background job.",
    "Random keys are unguessable but need a uniqueness check; sequential keys avoid the check but let anyone enumerate every paste on the site.",
  ],
};
