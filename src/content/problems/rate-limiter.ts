import type { Problem } from "./types";
import { edge, node } from "./authoring";

export const rateLimiter: Problem = {
  slug: "rate-limiter",
  title: "API rate limiter",
  difficulty: "easy",
  tags: ["throttling", "shared-state", "edge"],
  summary:
    "Cap how many requests each API client may make, consistently across every server.",
  prompt: [
    "Design a rate limiter that caps each API client to a fixed number of requests per minute and rejects the rest with 429.",
    "The API runs on many servers behind a load balancer, and a client's requests may land on any of them. The limit must hold across the fleet, not per machine.",
  ],
  scale: [
    { label: "API traffic", value: "50,000 / sec" },
    { label: "Distinct clients", value: "2 million" },
    { label: "Default limit", value: "1,000 / min" },
    { label: "Added latency", value: "< 5 ms" },
  ],
  requirements: [
    {
      text: "Reject requests over a client's quota with 429.",
      type: "functional",
    },
    { text: "Quota is enforced per API key, not per IP.", type: "functional" },
    {
      text: "Limits hold across every server, not per instance.",
      type: "functional",
    },
    { text: "Adds under 5ms to an allowed request.", type: "non-functional" },
    {
      text: "The limiter failing must not take the API down with it.",
      type: "non-functional",
    },
  ],
  hints: [
    "If each server counts requests in its own memory, a client on ten servers gets ten times its quota. Where does the count have to live?",
    "Rejecting a request should cost less than serving it — do the check before the request reaches your business logic.",
    "Counters are tiny, hot, and expire quickly. That is a very specific kind of datastore.",
  ],
  rubric: [
    {
      id: "has-limiter",
      kind: "has-component",
      component: "rate-limiter",
      label: "There is a rate limiting tier",
      feedback: "No rate limiter is present, so nothing enforces the quota.",
    },
    {
      id: "limiter-before-service",
      kind: "path-exists",
      from: "client",
      to: "service",
      through: ["rate-limiter"],
      label: "Requests pass the limiter before the service",
      feedback:
        "Requests reach the service without passing the rate limiter, so rejected traffic still costs you a full request.",
    },
    {
      id: "shared-counter",
      kind: "connects",
      from: "rate-limiter",
      to: "cache",
      label: "Counters live in shared storage",
      feedback:
        "The limiter has no shared counter store. Counting in each server's own memory lets a client on N servers use N times its quota.",
    },
    {
      id: "gateway",
      kind: "has-component",
      component: "gateway",
      label: "A gateway fronts the API",
      required: false,
      feedback:
        "An API gateway is the natural home for cross-cutting concerns like auth and throttling.",
    },
    {
      id: "auth-identifies",
      kind: "has-component",
      component: "auth",
      label: "Clients are identified before being limited",
      required: false,
      feedback:
        "Quota is per API key, so something has to resolve the caller's identity before the counter is read.",
    },
    {
      id: "no-bypass",
      kind: "absent-edge",
      from: "client",
      to: "service",
      label: "No path around the limiter",
      feedback:
        "A client connects straight to the service, bypassing the limiter entirely.",
    },
    {
      id: "service-work",
      kind: "connects",
      from: "service",
      to: "database",
      label: "The API still does its real work",
      required: false,
      feedback: "The protected API has no backing store to read or write.",
    },
  ],
  referenceSolution: {
    nodes: [
      node("client", "client", "API client", 0, 150),
      node("lb", "load-balancer", "Load balancer", 230, 150),
      node("gw", "gateway", "API gateway", 460, 150),
      node("rl", "rate-limiter", "Token bucket limiter", 690, 40),
      node("counters", "cache", "Redis counters", 930, 40),
      node("auth", "auth", "Key lookup", 690, 260),
      node("svc", "service", "API service", 930, 260),
      node("db", "database", "App database", 1160, 260),
    ],
    edges: [
      edge("client", "lb"),
      edge("lb", "gw"),
      edge("gw", "rl"),
      edge("rl", "counters"),
      edge("gw", "auth"),
      edge("rl", "svc"),
      edge("svc", "db"),
    ],
  },
  tradeoffs: [
    "A fixed window is trivial to implement but allows a 2x burst across the window boundary. A sliding window log is exact but stores a timestamp per request; a token bucket is the usual compromise.",
    "Centralised counters are correct but add a network hop. Many production limiters keep a local approximation and reconcile asynchronously, trading exactness for latency.",
    "Decide what happens when the counter store is unreachable: fail open and risk overload, or fail closed and turn a cache outage into an API outage.",
  ],
};
