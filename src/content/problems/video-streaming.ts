import type { Problem } from "./types";
import { edge, node } from "./authoring";

export const videoStreaming: Problem = {
  slug: "video-streaming",
  title: "Video upload and playback",
  difficulty: "hard",
  tags: ["media", "batch-processing", "cdn"],
  summary:
    "Take a raw upload, transcode it into every format, and stream it worldwide.",
  prompt: [
    "Design upload and playback for a video platform. A creator uploads a large raw file; viewers stream it on phones, laptops and TVs across highly variable connections.",
    "A raw upload is unplayable for most clients, so it has to be converted into several resolutions and formats. That work takes minutes and cannot happen inside the upload request.",
  ],
  scale: [
    { label: "Uploads", value: "500 hours / minute" },
    { label: "Raw file size", value: "up to 20 GB" },
    { label: "Concurrent viewers", value: "10 million" },
    { label: "Transcode time", value: "minutes per video" },
  ],
  requirements: [
    { text: "Accept very large uploads reliably.", type: "functional" },
    {
      text: "Transcode to multiple resolutions and formats.",
      type: "functional",
    },
    {
      text: "Stream adaptively based on connection quality.",
      type: "functional",
    },
    {
      text: "Make videos findable by title and description.",
      type: "functional",
    },
    {
      text: "Upload responds without waiting for transcoding.",
      type: "non-functional",
    },
    {
      text: "Playback starts quickly anywhere in the world.",
      type: "non-functional",
    },
  ],
  hints: [
    "A 20GB file should not travel through your application servers. Where can a client put bytes directly?",
    "Transcoding takes minutes and is embarrassingly parallel. What decouples the upload from that work, and what performs it?",
    "Ten million concurrent viewers pulling from your origin is not a plan.",
  ],
  rubric: [
    {
      id: "raw-storage",
      kind: "has-component",
      component: "object-storage",
      label: "Raw and encoded files live in object storage",
      feedback:
        "There is no object storage. Multi-gigabyte media cannot live in a database or on an application server's disk.",
    },
    {
      id: "upload-path",
      kind: "connects",
      from: "client",
      to: "object-storage",
      via: ["service", "gateway", "load-balancer"],
      label: "Uploads reach storage",
      feedback:
        "There is no route from the client to object storage, so an upload has nowhere to land.",
    },
    {
      id: "async-transcode",
      kind: "connects",
      from: "service",
      to: "queue",
      label: "Transcoding is queued, not synchronous",
      feedback:
        "There is no queue between upload and transcoding, so the uploader's request waits minutes for encoding to finish.",
    },
    {
      id: "workers",
      kind: "connects",
      from: "queue",
      to: "worker",
      label: "Workers perform the transcode",
      feedback:
        "Nothing consumes the transcode queue, so uploaded videos are never converted into playable formats.",
    },
    {
      id: "worker-writes",
      kind: "connects",
      from: "worker",
      to: "object-storage",
      label: "Encoded renditions are written back",
      feedback:
        "Transcode workers do not write their output anywhere, so the encoded renditions are lost.",
    },
    {
      id: "cdn-playback",
      kind: "has-component",
      component: "cdn",
      label: "Playback is served from the edge",
      feedback:
        "There is no CDN. Ten million concurrent viewers streaming from your origin will saturate it immediately.",
    },
    {
      id: "client-cdn",
      kind: "connects",
      from: "client",
      to: "cdn",
      label: "Viewers stream from the CDN",
      feedback:
        "Viewers are not pointed at the CDN, so the edge tier you drew serves nobody.",
    },
    {
      id: "metadata",
      kind: "connects",
      from: "service",
      to: "database",
      label: "Video metadata is stored",
      feedback:
        "Titles, owners and encoding status have to live somewhere queryable.",
    },
    {
      id: "search",
      kind: "has-component",
      component: "search-index",
      label: "Videos are searchable",
      required: false,
      feedback:
        "Nothing indexes titles and descriptions, so videos cannot be found by search.",
    },
    {
      id: "no-origin-streaming",
      kind: "absent-edge",
      from: "client",
      to: "worker",
      label: "Viewers do not talk to transcoders",
      feedback:
        "Clients are wired to the transcoding tier. Encoding is background work and should never be on the playback path.",
    },
  ],
  referenceSolution: {
    nodes: [
      node("client", "client", "Viewer / uploader", 0, 220),
      node("cdn", "cdn", "Streaming CDN", 230, 420),
      node("gw", "gateway", "API gateway", 230, 120),
      node("upload", "service", "Upload service", 470, 120),
      node("store", "object-storage", "Media store", 710, 260),
      node("queue", "queue", "Transcode queue", 470, 10),
      node("worker", "worker", "Transcode workers", 710, 10),
      node("meta", "database", "Video metadata", 950, 120),
      node("search", "search-index", "Video search", 950, 400),
    ],
    edges: [
      edge("client", "gw"),
      edge("gw", "upload"),
      edge("upload", "store"),
      edge("upload", "queue"),
      edge("queue", "worker"),
      edge("worker", "store"),
      edge("worker", "meta"),
      edge("upload", "meta"),
      edge("meta", "search"),
      edge("store", "cdn"),
      edge("client", "cdn"),
    ],
  },
  tradeoffs: [
    "Uploading directly to object storage with a signed URL keeps 20GB files off your servers entirely, at the cost of a more complex client and a callback to learn the upload finished.",
    "Transcoding every rendition up front costs compute for videos nobody watches. Encoding popular resolutions eagerly and rare ones on demand is the usual compromise.",
    "Chunked adaptive streaming means the CDN caches many small segments rather than one huge file, which is what lets a viewer switch quality mid-playback.",
  ],
};
