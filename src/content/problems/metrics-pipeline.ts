import type { Problem } from "./types";
import { edge, node } from "./authoring";

export const metricsPipeline: Problem = {
  slug: "metrics-pipeline",
  title: "Metrics and alerting",
  difficulty: "hard",
  tags: ["streaming", "time-series", "alerting"],
  summary:
    "Ingest metrics from a huge fleet, store them cheaply, and alert on them quickly.",
  prompt: [
    "Design the monitoring pipeline for a large infrastructure estate: every host and service emits metrics, engineers query dashboards over them, and alerts fire when thresholds are breached.",
    "Ingest is enormous and constant, queries are bursty and span long time ranges, and alert evaluation must keep up in near real time. Those are three very different workloads over the same data.",
  ],
  scale: [
    { label: "Reporting agents", value: "500,000" },
    { label: "Data points", value: "10 million / sec" },
    { label: "Retention", value: "13 months" },
    { label: "Alert latency", value: "< 30 s" },
  ],
  requirements: [
    {
      text: "Ingest metrics from every host continuously.",
      type: "functional",
    },
    { text: "Query metrics over arbitrary time ranges.", type: "functional" },
    { text: "Evaluate alert rules continuously.", type: "functional" },
    { text: "Notify on-call when an alert fires.", type: "functional" },
    {
      text: "Absorb ingest spikes without dropping data.",
      type: "non-functional",
    },
    { text: "Store 13 months affordably.", type: "non-functional" },
  ],
  hints: [
    "During an incident, ingest spikes at exactly the moment queries do. What sits between ingest and storage so one cannot starve the other?",
    "Alerting does not need to query the same store dashboards do — it only cares about the last few minutes, which are still in flight.",
    "Thirteen months at ten million points a second is not all equally valuable. Old data is almost always read at lower resolution.",
  ],
  rubric: [
    {
      id: "ingest-buffer",
      kind: "has-component",
      component: "event-stream",
      label: "Ingest is buffered by a stream",
      feedback:
        "There is no stream between agents and storage, so an ingest spike writes straight into your database and takes queries down with it.",
    },
    {
      id: "agents-to-stream",
      kind: "path-exists",
      from: "monitoring",
      to: "event-stream",
      through: ["service"],
      label: "Agents report through an ingest service",
      required: false,
      feedback:
        "Agents should report through an ingest tier that validates and batches before the stream.",
    },
    {
      id: "tsdb",
      kind: "has-component",
      component: "timeseries-db",
      label: "Metrics land in a time-series store",
      feedback:
        "No time-series database is present. A general-purpose database will not hold 10 million points per second economically.",
    },
    {
      id: "stream-to-store",
      kind: "path-exists",
      from: "event-stream",
      to: "timeseries-db",
      through: ["worker"],
      label: "A consumer writes the stream into storage",
      feedback:
        "Nothing consumes the stream into the time-series store, so ingested metrics are buffered and then dropped.",
    },
    {
      id: "alerting-off-stream",
      kind: "connects",
      from: "event-stream",
      to: "service",
      label: "Alert evaluation reads the live stream",
      feedback:
        "Alert evaluation is not reading the stream. Polling the historical store instead adds write and compaction lag to your 30-second budget.",
    },
    {
      id: "notify",
      kind: "has-component",
      component: "notification",
      label: "Alerts reach a human",
      feedback: "Nothing notifies on-call, so an alert fires into the void.",
    },
    {
      id: "alert-notify",
      kind: "connects",
      from: "service",
      to: "notification",
      label: "The alerting service pages on-call",
      feedback: "The alerting tier is not wired to the notification service.",
    },
    {
      id: "dashboards",
      kind: "connects",
      from: "service",
      to: "timeseries-db",
      label: "Dashboards query the time-series store",
      feedback:
        "Nothing queries the metrics store, so engineers have no way to read a dashboard.",
    },
    {
      id: "cold-storage",
      kind: "has-component",
      component: "object-storage",
      label: "Long retention rolls off to cheap storage",
      required: false,
      feedback:
        "Thirteen months of full-resolution data on hot storage is very expensive. Downsampled data in object storage is the usual answer.",
    },
    {
      id: "no-direct-writes",
      kind: "absent-edge",
      from: "monitoring",
      to: "timeseries-db",
      label: "Agents do not write storage directly",
      feedback:
        "Agents write directly to the time-series store, removing the buffer that protects it during a spike.",
    },
  ],
  referenceSolution: {
    nodes: [
      node("agents", "monitoring", "Host agents", 0, 190),
      node("ingest", "service", "Ingest service", 230, 190),
      node("stream", "event-stream", "Metric stream", 470, 190),
      node("writer", "worker", "Storage writer", 710, 60),
      node("tsdb", "timeseries-db", "Time-series DB", 950, 60),
      node("alerting", "service", "Alert evaluator", 710, 330),
      node("notify", "notification", "Pager", 950, 330),
      node("dash", "service", "Dashboard API", 950, 200),
      node("cold", "object-storage", "Downsampled archive", 1190, 60),
    ],
    edges: [
      edge("agents", "ingest"),
      edge("ingest", "stream"),
      edge("stream", "writer"),
      edge("writer", "tsdb"),
      edge("stream", "alerting"),
      edge("alerting", "notify"),
      edge("dash", "tsdb"),
      edge("tsdb", "cold"),
    ],
  },
  tradeoffs: [
    "Evaluating alerts off the stream keeps them fast but means alerts see slightly different data than dashboards, which confuses engineers during an incident. Some systems accept slower alerts to keep one source of truth.",
    "Downsampling old data makes 13 months affordable but destroys detail you cannot get back. The retention policy is a product decision as much as a cost one.",
    "Metrics ingest is one of the few places where dropping data under extreme load is the right call — a monitoring system that takes down production is worse than one with a gap.",
  ],
};
