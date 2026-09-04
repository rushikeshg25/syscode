import {
  Activity,
  Bell,
  Cable,
  CalendarClock,
  ChartColumn,
  ChartSpline,
  Cloud,
  Cog,
  Database,
  DatabaseZap,
  Gauge,
  Globe2,
  HardDrive,
  KeyRound,
  Network,
  Search,
  Server,
  Share2,
  Signpost,
  Smartphone,
  Split,
  Waves,
  Waypoints,
  Workflow,
  Zap,
} from "lucide-react";
import type { ComponentKey } from "./diagram-document";

export type ComponentCategory =
  | "edge"
  | "entry"
  | "compute"
  | "data"
  | "async"
  | "platform"
  | "external";

export type ComponentDefinition = {
  key: ComponentKey;
  label: string;
  description: string;
  category: ComponentCategory;
  accent: string;
  /** Extra search terms so "redis" finds the cache. */
  aliases: string[];
  icon: typeof Server;
};

export const categoryLabels: Record<ComponentCategory, string> = {
  edge: "Clients & edge",
  entry: "Entry",
  compute: "Compute",
  data: "Data",
  async: "Async",
  platform: "Platform",
  external: "External",
};

export const categoryOrder: ComponentCategory[] = [
  "edge",
  "entry",
  "compute",
  "data",
  "async",
  "platform",
  "external",
];

export const components: ComponentDefinition[] = [
  {
    key: "client",
    label: "Client",
    description: "Browser or web app",
    category: "edge",
    accent: "#38bdf8",
    aliases: ["browser", "web", "frontend", "user"],
    icon: Globe2,
  },
  {
    key: "mobile",
    label: "Mobile client",
    description: "iOS or Android app",
    category: "edge",
    accent: "#22d3ee",
    aliases: ["ios", "android", "phone", "app"],
    icon: Smartphone,
  },
  {
    key: "dns",
    label: "DNS",
    description: "Name resolution",
    category: "edge",
    accent: "#7dd3fc",
    aliases: ["route53", "domain", "resolver"],
    icon: Signpost,
  },
  {
    key: "cdn",
    label: "CDN",
    description: "Edge content cache",
    category: "edge",
    accent: "#67e8f9",
    aliases: ["cloudfront", "cloudflare", "edge", "pop"],
    icon: Waypoints,
  },
  {
    key: "load-balancer",
    label: "Load balancer",
    description: "Spreads traffic",
    category: "edge",
    accent: "#818cf8",
    aliases: ["lb", "nginx", "haproxy", "alb", "elb"],
    icon: Split,
  },
  {
    key: "gateway",
    label: "API gateway",
    description: "Request entry point",
    category: "entry",
    accent: "#a78bfa",
    aliases: ["api", "proxy", "ingress", "bff"],
    icon: Network,
  },
  {
    key: "rate-limiter",
    label: "Rate limiter",
    description: "Throttles requests",
    category: "entry",
    accent: "#c084fc",
    aliases: ["throttle", "quota", "token bucket"],
    icon: Gauge,
  },
  {
    key: "auth",
    label: "Auth service",
    description: "Identity and tokens",
    category: "entry",
    accent: "#f0abfc",
    aliases: ["oauth", "jwt", "identity", "login", "session"],
    icon: KeyRound,
  },
  {
    key: "service",
    label: "Service",
    description: "Application logic",
    category: "compute",
    accent: "#60a5fa",
    aliases: ["api", "backend", "microservice", "app server"],
    icon: Server,
  },
  {
    key: "worker",
    label: "Worker",
    description: "Background consumer",
    category: "compute",
    accent: "#93c5fd",
    aliases: ["consumer", "job", "batch", "transcoder", "processor"],
    icon: Cog,
  },
  {
    key: "scheduler",
    label: "Scheduler",
    description: "Triggers work on time",
    category: "compute",
    accent: "#a5b4fc",
    aliases: ["cron", "timer", "airflow", "dispatcher"],
    icon: CalendarClock,
  },
  {
    key: "websocket",
    label: "WebSocket server",
    description: "Persistent connections",
    category: "compute",
    accent: "#5eead4",
    aliases: ["realtime", "socket", "push", "long poll", "presence"],
    icon: Cable,
  },
  {
    key: "database",
    label: "Database",
    description: "Primary records",
    category: "data",
    accent: "#34d399",
    aliases: ["postgres", "mysql", "sql", "dynamo", "primary", "store"],
    icon: Database,
  },
  {
    key: "replica",
    label: "Read replica",
    description: "Scales reads out",
    category: "data",
    accent: "#4ade80",
    aliases: ["follower", "secondary", "standby", "read"],
    icon: DatabaseZap,
  },
  {
    key: "cache",
    label: "Cache",
    description: "Fast temporary data",
    category: "data",
    accent: "#fbbf24",
    aliases: ["redis", "memcached", "kv", "hot"],
    icon: Zap,
  },
  {
    key: "object-storage",
    label: "Object storage",
    description: "Files, blobs and media",
    category: "data",
    accent: "#2dd4bf",
    aliases: ["s3", "blob", "bucket", "gcs", "file"],
    icon: HardDrive,
  },
  {
    key: "search-index",
    label: "Search index",
    description: "Text and geo lookups",
    category: "data",
    accent: "#fb923c",
    aliases: ["elasticsearch", "solr", "lucene", "geo", "quadtree", "trie"],
    icon: Search,
  },
  {
    key: "timeseries-db",
    label: "Time-series DB",
    description: "Metrics over time",
    category: "data",
    accent: "#facc15",
    aliases: ["prometheus", "influx", "metrics", "tsdb"],
    icon: ChartSpline,
  },
  {
    key: "queue",
    label: "Message queue",
    description: "Async work handoff",
    category: "async",
    accent: "#fb7185",
    aliases: ["sqs", "rabbitmq", "celery", "task"],
    icon: Workflow,
  },
  {
    key: "event-stream",
    label: "Event stream",
    description: "Durable pub/sub log",
    category: "async",
    accent: "#f472b6",
    aliases: ["kafka", "kinesis", "pubsub", "log", "topic"],
    icon: Waves,
  },
  {
    key: "coordinator",
    label: "Coordinator",
    description: "Locks and leader election",
    category: "platform",
    accent: "#e879f9",
    aliases: ["zookeeper", "etcd", "consul", "lock", "consensus"],
    icon: Share2,
  },
  {
    key: "monitoring",
    label: "Monitoring",
    description: "Health and alerting",
    category: "platform",
    accent: "#f87171",
    aliases: ["observability", "alerting", "grafana", "logs", "tracing"],
    icon: Activity,
  },
  {
    key: "analytics",
    label: "Analytics",
    description: "Offline aggregation",
    category: "platform",
    accent: "#a3e635",
    aliases: ["warehouse", "spark", "hadoop", "etl", "bigquery"],
    icon: ChartColumn,
  },
  {
    key: "notification",
    label: "Notification service",
    description: "Push, email and SMS",
    category: "platform",
    accent: "#fdba74",
    aliases: ["push", "apns", "fcm", "email", "sms"],
    icon: Bell,
  },
  {
    key: "third-party",
    label: "External service",
    description: "Third-party system",
    category: "external",
    accent: "#94a3b8",
    aliases: ["vendor", "stripe", "payment", "api", "partner"],
    icon: Cloud,
  },
];

export const componentMap = Object.fromEntries(
  components.map((component) => [component.key, component]),
) as Record<ComponentKey, ComponentDefinition>;

export const componentLabel = (key: ComponentKey) =>
  componentMap[key]?.label ?? key;

export const searchComponents = (query: string) => {
  const term = query.trim().toLowerCase();
  if (!term) return components;
  return components.filter(
    ({ label, description, aliases, key }) =>
      label.toLowerCase().includes(term) ||
      description.toLowerCase().includes(term) ||
      key.includes(term) ||
      aliases.some((alias) => alias.includes(term)),
  );
};
