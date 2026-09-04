import type { Problem } from "./types";
import { edge, node } from "./authoring";

export const staticAssetDelivery: Problem = {
  slug: "static-asset-delivery",
  title: "Global image delivery",
  difficulty: "easy",
  tags: ["cdn", "latency", "storage"],
  summary:
    "Serve images and static files fast to users on every continent from one origin.",
  prompt: [
    "Design the delivery path for a photo site's images. Users are spread worldwide, but the files are uploaded once and rarely change.",
    "Fetching every image across an ocean is what makes the site feel slow. The design should put bytes close to the people reading them.",
  ],
  scale: [
    { label: "Stored objects", value: "500 million" },
    { label: "Peak requests", value: "200,000 / sec" },
    { label: "Average object", value: "400 KB" },
    { label: "Cache hit target", value: "> 95%" },
  ],
  requirements: [
    { text: "Serve an uploaded image by URL.", type: "functional" },
    { text: "Accept new uploads and store them durably.", type: "functional" },
    { text: "Reflect a replaced image within minutes.", type: "functional" },
    {
      text: "Users on any continent see comparable latency.",
      type: "non-functional",
    },
    {
      text: "The origin absorbs under 5% of read traffic.",
      type: "non-functional",
    },
    {
      text: "Storage cost scales sub-linearly with reads.",
      type: "non-functional",
    },
  ],
  hints: [
    "The same file being read from Sydney and Frankfurt should not cross the ocean twice. What tier has points of presence near users?",
    "Images are large and immutable — a row in a relational database is the wrong home for the bytes themselves.",
    "How does a browser find the nearest edge location in the first place? Something has to resolve the hostname.",
  ],
  rubric: [
    {
      id: "has-cdn",
      kind: "has-component",
      component: "cdn",
      label: "Content is served from edge locations",
      feedback:
        "There is no CDN, so a reader in Sydney fetches every image from your origin region.",
    },
    {
      id: "client-cdn",
      kind: "connects",
      from: "client",
      to: "cdn",
      label: "Clients read from the CDN",
      feedback:
        "Clients are not pointed at the CDN, so the edge cache you drew never serves anyone.",
    },
    {
      id: "cdn-origin",
      kind: "connects",
      from: "cdn",
      to: "object-storage",
      via: ["service", "load-balancer"],
      label: "The CDN falls back to an origin store",
      feedback:
        "The CDN has no origin to pull from on a cache miss, so the first request for any image fails.",
    },
    {
      id: "blob-store",
      kind: "has-component",
      component: "object-storage",
      label: "Files live in object storage",
      feedback:
        "400KB images belong in object storage, not in a database row or on a single server's disk.",
    },
    {
      id: "dns",
      kind: "has-component",
      component: "dns",
      label: "DNS steers users to a nearby edge",
      required: false,
      feedback:
        "Nothing resolves the hostname to a nearby point of presence — that routing decision is usually made in DNS.",
    },
    {
      id: "upload-path",
      kind: "connects",
      from: "service",
      to: "object-storage",
      label: "Uploads reach durable storage",
      feedback:
        "There is no upload path into object storage, so no image ever gets there to be served.",
    },
    {
      id: "no-origin-hammering",
      kind: "absent-edge",
      from: "client",
      to: "object-storage",
      label: "Reads do not bypass the edge",
      feedback:
        "Clients read object storage directly, which skips the CDN and puts full read traffic on the origin.",
    },
  ],
  referenceSolution: {
    nodes: [
      node("client", "client", "Browser", 0, 150),
      node("dns", "dns", "GeoDNS", 230, 30),
      node("cdn", "cdn", "Edge CDN", 230, 250),
      node("lb", "load-balancer", "Origin LB", 470, 250),
      node("svc", "service", "Upload service", 700, 250),
      node("store", "object-storage", "Object store", 940, 150),
      node("meta", "database", "Image metadata", 940, 360),
    ],
    edges: [
      edge("client", "dns"),
      edge("client", "cdn"),
      edge("cdn", "lb"),
      edge("lb", "svc"),
      edge("svc", "store"),
      edge("svc", "meta"),
    ],
  },
  tradeoffs: [
    "Long cache TTLs give high hit rates but slow propagation of a replaced image. Content-hashed filenames sidestep the conflict: the URL changes when the bytes change, so you can cache forever.",
    "Pull-through CDNs are simple but make the first request per region slow. Pushing hot assets to the edge ahead of demand costs more but removes that cold start.",
    "Signed URLs let you keep the bucket private while still serving through the edge — worth it as soon as any content is not public.",
  ],
};
