import type { Problem } from "./types";
import { edge, node } from "./authoring";

export const typeaheadSearch: Problem = {
  slug: "typeahead-search",
  title: "Search autocomplete",
  difficulty: "medium",
  tags: ["search", "latency", "analytics"],
  summary:
    "Suggest completions on every keystroke, ranked by what people actually search for.",
  prompt: [
    "Design the autocomplete that appears as a user types into a search box. Every keystroke is a request, and suggestions must appear faster than the user types.",
    "Rankings come from real search volume, so the suggestion set has to be rebuilt from query logs — but not on the request path.",
  ],
  scale: [
    { label: "Keystroke queries", value: "400,000 / sec" },
    { label: "Distinct prefixes", value: "billions" },
    { label: "Suggestion latency", value: "< 20 ms p99" },
    { label: "Ranking freshness", value: "hourly is fine" },
  ],
  requirements: [
    { text: "Return top suggestions for a typed prefix.", type: "functional" },
    { text: "Rank suggestions by search popularity.", type: "functional" },
    { text: "Log queries to feed future rankings.", type: "functional" },
    { text: "Suggestions return in under 20ms.", type: "non-functional" },
    {
      text: "Ranking updates never slow the read path.",
      type: "non-functional",
    },
    {
      text: "Absorb keystroke-rate traffic without melting.",
      type: "non-functional",
    },
  ],
  hints: [
    "Ranking is computed from logs and only needs to be hourly-fresh. That means the read path and the build path can be completely separate systems.",
    "A prefix lookup is not a SQL LIKE query at this rate. What data structure serves prefixes, and where does it live?",
    "The most common prefixes are a tiny fraction of all prefixes, and they are requested constantly.",
  ],
  rubric: [
    {
      id: "index",
      kind: "has-component",
      component: "search-index",
      label: "There is a prefix index",
      feedback:
        "No search index is present. Scanning a database for matching prefixes cannot hold a 20ms budget at this rate.",
    },
    {
      id: "service-index",
      kind: "connects",
      from: "service",
      to: "search-index",
      label: "The suggestion service queries the index",
      feedback:
        "The service is not wired to the index, so nothing can actually answer a prefix query.",
    },
    {
      id: "cache-hot",
      kind: "connects",
      from: "service",
      to: "cache",
      label: "Popular prefixes are cached",
      feedback:
        "Nothing caches the hottest prefixes, so a handful of extremely common queries repeatedly do full index work.",
    },
    {
      id: "edge",
      kind: "has-component",
      component: "cdn",
      label: "Suggestions are served near the user",
      required: false,
      feedback:
        "At a 20ms budget, network round-trip time dominates. Edge caching common prefixes buys most of that budget back.",
    },
    {
      id: "logging",
      kind: "connects",
      from: "service",
      to: "event-stream",
      label: "Queries are logged to a stream",
      feedback:
        "Queries are never captured, so rankings can never be built from real search volume.",
    },
    {
      id: "offline-build",
      kind: "connects",
      from: "event-stream",
      to: "analytics",
      label: "Logs feed an offline aggregation job",
      feedback: "Nothing aggregates the query logs into ranked suggestions.",
    },
    {
      id: "build-to-index",
      kind: "path-exists",
      from: "analytics",
      to: "search-index",
      through: ["worker"],
      label: "The built ranking is published to the index",
      required: false,
      feedback:
        "The aggregation result never reaches the serving index, so rankings would never actually change.",
    },
    {
      id: "no-sync-analytics",
      kind: "absent-edge",
      from: "service",
      to: "analytics",
      label: "The read path does not wait on analytics",
      feedback:
        "The request path calls the analytics system directly. Batch aggregation is far too slow to sit inside a 20ms request.",
    },
  ],
  referenceSolution: {
    nodes: [
      node("client", "client", "Search box", 0, 170),
      node("cdn", "cdn", "Edge cache", 220, 170),
      node("svc", "service", "Suggest service", 450, 170),
      node("cache", "cache", "Hot prefixes", 690, 40),
      node("index", "search-index", "Prefix trie index", 690, 300),
      node("stream", "event-stream", "Query log stream", 450, 430),
      node("analytics", "analytics", "Ranking job", 690, 550),
      node("worker", "worker", "Index builder", 930, 430),
    ],
    edges: [
      edge("client", "cdn"),
      edge("cdn", "svc"),
      edge("svc", "cache"),
      edge("svc", "index"),
      edge("svc", "stream"),
      edge("stream", "analytics"),
      edge("analytics", "worker"),
      edge("worker", "index"),
    ],
  },
  tradeoffs: [
    "Precomputing the top-k completions for every prefix makes reads trivial but multiplies storage and makes updates a full rebuild. Walking a trie at query time is compact but costs more per request.",
    "Because rankings only need hourly freshness, the whole ranking pipeline can be batch. Resisting the urge to make it real time is the main design win here.",
    "Swapping a freshly built index atomically avoids serving half-updated rankings, at the cost of holding two copies during the swap.",
  ],
};
