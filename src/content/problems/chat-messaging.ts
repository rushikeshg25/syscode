import type { Problem } from "./types";
import { edge, node } from "./authoring";

export const chatMessaging: Problem = {
  slug: "chat-messaging",
  title: "Chat messaging",
  difficulty: "medium",
  tags: ["realtime", "websockets", "delivery"],
  summary:
    "Deliver messages in real time to online users and reliably to offline ones.",
  prompt: [
    "Design one-to-one chat: a sender's message must reach the recipient within a second when both are online, and be waiting for them when they come back if they are not.",
    "Clients are mobile and disconnect constantly. The design has to answer where a message lives between being sent and being read.",
  ],
  scale: [
    { label: "Connected users", value: "50 million" },
    { label: "Messages", value: "1 million / sec" },
    { label: "Delivery latency", value: "< 1 s" },
    { label: "History retained", value: "forever" },
  ],
  requirements: [
    {
      text: "Deliver a message to an online recipient immediately.",
      type: "functional",
    },
    { text: "Queue messages for offline recipients.", type: "functional" },
    {
      text: "Push a notification when the recipient is offline.",
      type: "functional",
    },
    {
      text: "Message history survives restarts and is readable later.",
      type: "functional",
    },
    {
      text: "Hold tens of millions of concurrent connections.",
      type: "non-functional",
    },
    {
      text: "No message is lost if a delivery server dies.",
      type: "non-functional",
    },
  ],
  hints: [
    "Polling for new messages at this scale is hopeless. What kind of connection lets the server speak first?",
    "The sender's server and the recipient's server are almost never the same machine. How does one reach the other?",
    "Persist before you deliver. If the message is only in memory when a server dies, it is gone.",
  ],
  rubric: [
    {
      id: "websocket",
      kind: "has-component",
      component: "websocket",
      label: "Clients hold a persistent connection",
      feedback:
        "There is no WebSocket tier. Without a server-initiated channel, delivery means polling, which cannot hold a one-second budget for 50 million users.",
    },
    {
      id: "client-ws",
      kind: "connects",
      from: ["client", "mobile"],
      to: "websocket",
      via: ["load-balancer", "gateway"],
      directed: false,
      label: "Clients connect to the realtime tier",
      feedback:
        "Clients are not attached to the WebSocket servers, so nothing can push a message to them.",
    },
    {
      id: "persist-first",
      kind: "connects",
      from: "service",
      to: "database",
      label: "Messages are persisted",
      feedback:
        "Messages are never written to durable storage, so history is lost and an offline user never receives anything.",
    },
    {
      id: "routing",
      kind: "connects",
      from: "service",
      to: "queue",
      label: "Messages are routed asynchronously",
      feedback:
        "There is no queue or stream between the sending service and the delivery tier, so a message cannot reach the server holding the recipient's connection.",
    },
    {
      id: "queue-to-ws",
      kind: "connects",
      from: "queue",
      to: "websocket",
      label: "Routed messages reach the recipient's server",
      feedback:
        "The routing layer is not connected to the WebSocket tier, so messages are queued and never delivered.",
    },
    {
      id: "push",
      kind: "has-component",
      component: "notification",
      label: "Offline users get a push notification",
      feedback:
        "Nothing notifies an offline recipient, so they only learn about messages by reopening the app.",
    },
    {
      id: "presence",
      kind: "connects",
      from: "websocket",
      to: "cache",
      label: "Connection ownership is tracked",
      required: false,
      feedback:
        "Nothing records which server holds which user's connection, so routing a message means broadcasting to the whole fleet.",
    },
    {
      id: "no-direct-db",
      kind: "absent-edge",
      from: ["client", "mobile"],
      to: "database",
      label: "Clients never write the message store directly",
      feedback:
        "A client writes straight to the message store, bypassing delivery, ordering and authorisation.",
    },
  ],
  referenceSolution: {
    nodes: [
      node("client", "mobile", "Mobile client", 0, 190),
      node("lb", "load-balancer", "Connection LB", 220, 190),
      node("ws", "websocket", "WebSocket server", 450, 190),
      node("presence", "cache", "Presence registry", 450, 380),
      node("svc", "service", "Message service", 690, 60),
      node("db", "database", "Message store", 930, 60),
      node("queue", "queue", "Delivery queue", 690, 260),
      node("notify", "notification", "Push service", 930, 380),
    ],
    edges: [
      edge("client", "lb"),
      edge("lb", "ws"),
      edge("ws", "presence"),
      edge("ws", "svc"),
      edge("svc", "db"),
      edge("svc", "queue"),
      edge("queue", "ws"),
      edge("queue", "notify"),
    ],
  },
  tradeoffs: [
    "Writing the message before acknowledging the sender costs latency but means a server crash never loses a message. Acknowledging first feels faster and is how messages silently disappear.",
    "A presence registry makes routing a single lookup, but it is hot, constantly churning state — and stale entries send messages to servers that no longer hold the connection.",
    "Per-conversation sequence numbers give you ordering and let a reconnecting client ask for exactly what it missed, which is far cheaper than resending history.",
  ],
};
