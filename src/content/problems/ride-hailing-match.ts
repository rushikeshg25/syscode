import type { Problem } from "./types";
import { edge, node } from "./authoring";

export const rideHailingMatch: Problem = {
  slug: "ride-hailing-match",
  title: "Ride matching",
  difficulty: "medium",
  tags: ["geospatial", "streaming", "matching"],
  summary:
    "Match a rider to a nearby driver from a constantly moving fleet of locations.",
  prompt: [
    "Design the matching half of a ride-hailing app. Drivers stream their location continuously; a rider requests a ride and must be matched to a suitable nearby driver within seconds.",
    "The hard part is that the searchable data changes constantly — every driver updates their position every few seconds, and a stale position produces a bad match.",
  ],
  scale: [
    { label: "Active drivers", value: "2 million" },
    { label: "Location updates", value: "500,000 / sec" },
    { label: "Ride requests", value: "10,000 / sec" },
    { label: "Match time", value: "< 5 s" },
  ],
  requirements: [
    { text: "Ingest continuous driver location updates.", type: "functional" },
    { text: "Find available drivers near a pickup point.", type: "functional" },
    { text: "Assign exactly one driver per ride request.", type: "functional" },
    { text: "Persist trips for billing and history.", type: "functional" },
    { text: "Absorb 500k location writes per second.", type: "non-functional" },
    { text: "Never double-book a driver.", type: "non-functional" },
  ],
  hints: [
    "500,000 writes a second into your system of record will not work. Where should a firehose of updates land first?",
    "'Drivers within 2km of this point' is not a query a plain B-tree index answers well. What kind of index handles two dimensions?",
    "Two riders can request the same driver at the same instant. Something has to make that assignment exclusive.",
  ],
  rubric: [
    {
      id: "ingest-stream",
      kind: "connects",
      from: "service",
      to: "event-stream",
      label: "Location updates land on a stream",
      feedback:
        "Location updates have no stream to absorb them, so a 500k/sec firehose hits your datastore directly.",
    },
    {
      id: "geo-index",
      kind: "has-component",
      component: "search-index",
      label: "There is a geospatial index",
      feedback:
        "No spatial index is present. Scanning every driver row to find nearby ones cannot meet a five-second match budget.",
    },
    {
      id: "stream-to-index",
      kind: "path-exists",
      from: "event-stream",
      to: "search-index",
      through: ["worker"],
      label: "The stream keeps the index current",
      feedback:
        "Nothing consumes the location stream into the spatial index, so matching would run against positions that never update.",
    },
    {
      id: "match-queries-index",
      kind: "connects",
      from: "service",
      to: "search-index",
      label: "Matching queries the spatial index",
      feedback:
        "The matching service does not query the spatial index, so it has no way to find nearby drivers.",
    },
    {
      id: "exclusive",
      kind: "has-component",
      component: "coordinator",
      label: "Assignment is made exclusive",
      feedback:
        "Nothing prevents two riders being matched to the same driver at the same moment. Exclusive assignment needs a lock or a coordinator.",
    },
    {
      id: "trips-persisted",
      kind: "connects",
      from: "service",
      to: "database",
      label: "Trips are persisted",
      feedback:
        "Matched trips are never stored, so there is no record to bill or support.",
    },
    {
      id: "driver-connection",
      kind: "has-component",
      component: "websocket",
      label: "Drivers hold a live connection",
      required: false,
      feedback:
        "Offers have to be pushed to a driver's phone within seconds — that wants a persistent connection, not polling.",
    },
    {
      id: "no-db-firehose",
      kind: "absent-edge",
      from: ["client", "mobile"],
      to: "database",
      label: "Raw location writes do not hit the database",
      feedback:
        "Driver clients write location straight to the database. That is 500,000 writes per second into your system of record.",
    },
  ],
  referenceSolution: {
    nodes: [
      node("driver", "mobile", "Driver app", 0, 60),
      node("rider", "mobile", "Rider app", 0, 320),
      node("gw", "gateway", "API gateway", 230, 190),
      node("loc-svc", "service", "Location service", 470, 60),
      node("stream", "event-stream", "Location stream", 710, 60),
      node("indexer", "worker", "Index updater", 950, 60),
      node("geo", "search-index", "Geo index", 1190, 190),
      node("match", "service", "Matching service", 470, 320),
      node("lock", "coordinator", "Assignment locks", 710, 430),
      node("db", "database", "Trip store", 950, 320),
      node("ws", "websocket", "Offer push", 230, 430),
    ],
    edges: [
      edge("driver", "gw"),
      edge("rider", "gw"),
      edge("gw", "loc-svc"),
      edge("loc-svc", "stream"),
      edge("stream", "indexer"),
      edge("indexer", "geo"),
      edge("gw", "match"),
      edge("match", "geo"),
      edge("match", "lock"),
      edge("match", "db"),
      edge("match", "ws"),
      edge("ws", "driver"),
    ],
  },
  tradeoffs: [
    "Geohashes or quadtrees both answer proximity queries; geohashes are simple string prefixes but handle boundary cases badly, while quadtrees adapt to density at the cost of rebalancing.",
    "Keeping the live location index in memory is what makes it fast, and losing it on restart is survivable — drivers re-report within seconds. Not everything needs to be durable.",
    "Matching the nearest driver is not the same as matching the best one. Estimated time of arrival, direction of travel and driver acceptance rate all matter more than raw distance.",
  ],
};
