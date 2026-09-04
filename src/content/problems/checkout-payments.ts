import type { Problem } from "./types";
import { edge, node } from "./authoring";

export const checkoutPayments: Problem = {
  slug: "checkout-payments",
  title: "Checkout and payments",
  difficulty: "medium",
  tags: ["idempotency", "consistency", "third-party"],
  summary:
    "Take payment exactly once, even when the network lies and the user double-clicks.",
  prompt: [
    "Design the checkout flow for an online store: reserve stock, charge the customer through an external payment provider, and confirm the order.",
    "The payment provider is a third party that can be slow or time out without telling you whether the charge succeeded. Getting this wrong means double-charging a customer.",
  ],
  scale: [
    { label: "Orders", value: "5,000 / sec at peak" },
    { label: "Provider latency", value: "300 ms - 20 s" },
    { label: "Provider timeouts", value: "~0.1% of calls" },
    { label: "Double charges", value: "zero tolerated" },
  ],
  requirements: [
    { text: "Reserve inventory before charging.", type: "functional" },
    {
      text: "Charge through an external payment provider.",
      type: "functional",
    },
    {
      text: "Retrying a submitted order never charges twice.",
      type: "functional",
    },
    { text: "Send confirmation once the order is placed.", type: "functional" },
    {
      text: "Order state survives a service crash mid-checkout.",
      type: "non-functional",
    },
    {
      text: "A slow provider must not block the whole checkout tier.",
      type: "non-functional",
    },
  ],
  hints: [
    "The client may retry, the network may retry, and a queue may redeliver. What has to accompany the request so the second attempt is recognised as the same one?",
    "A timeout is not a failure — the charge may well have succeeded. Record your intent before you call out, so you can reconcile afterwards.",
    "Confirmation emails and receipts do not need to happen before you answer the customer.",
  ],
  rubric: [
    {
      id: "order-service",
      kind: "path-exists",
      from: "client",
      to: "database",
      through: ["service"],
      label: "Orders are written through a service",
      feedback:
        "There is no path from the client to durable storage through a service, so order state is never recorded.",
    },
    {
      id: "idempotency",
      kind: "connects",
      from: "service",
      to: "cache",
      label: "Idempotency keys are checked",
      feedback:
        "Nothing stores idempotency keys, so a retried request starts a second charge for the same order.",
    },
    {
      id: "provider",
      kind: "has-component",
      component: "third-party",
      label: "An external payment provider is used",
      feedback:
        "No external payment provider is present — the charge has to leave your system somewhere.",
    },
    {
      id: "service-provider",
      kind: "connects",
      from: "service",
      to: "third-party",
      label: "A service owns the provider call",
      feedback: "Nothing in your system calls the payment provider.",
    },
    {
      id: "no-client-provider",
      kind: "absent-edge",
      from: "client",
      to: "third-party",
      label: "The client does not charge the provider directly",
      feedback:
        "The client calls the payment provider directly, so your system never learns authoritatively whether the charge happened.",
    },
    {
      id: "durable-intent",
      kind: "connects",
      from: "service",
      to: "database",
      label: "Order state is durable before charging",
      feedback:
        "Order state is not persisted, so a crash between charging and confirming leaves money taken and no order.",
    },
    {
      id: "async-followup",
      kind: "connects",
      from: "service",
      to: "queue",
      label: "Follow-up work is queued",
      feedback:
        "Receipts, emails and fulfilment are on the request path. They should be handed to a queue so checkout is not held up.",
    },
    {
      id: "notify",
      kind: "path-exists",
      from: "queue",
      to: "notification",
      through: ["worker"],
      label: "Confirmations are sent by a worker",
      required: false,
      feedback: "Nothing consumes the queue to actually send the confirmation.",
    },
  ],
  referenceSolution: {
    nodes: [
      node("client", "client", "Storefront", 0, 190),
      node("gw", "gateway", "API gateway", 220, 190),
      node("order", "service", "Order service", 450, 190),
      node("idem", "cache", "Idempotency keys", 690, 40),
      node("db", "database", "Order store", 690, 190),
      node("pay", "service", "Payment service", 690, 340),
      node("provider", "third-party", "Card processor", 930, 340),
      node("queue", "queue", "Fulfilment queue", 450, 460),
      node("worker", "worker", "Receipt worker", 690, 540),
      node("notify", "notification", "Email service", 930, 540),
    ],
    edges: [
      edge("client", "gw"),
      edge("gw", "order"),
      edge("order", "idem"),
      edge("order", "db"),
      edge("order", "pay"),
      edge("pay", "provider"),
      edge("pay", "db"),
      edge("order", "queue"),
      edge("queue", "worker"),
      edge("worker", "notify"),
    ],
  },
  tradeoffs: [
    "An idempotency key stored before the provider call turns 'did this already happen?' into a cheap lookup. Without one, retry safety depends on the provider's own deduplication, which you do not control.",
    "Holding inventory during payment risks stranding stock when a payment hangs; not holding it risks selling something twice. Most stores reserve with a short expiry and release on timeout.",
    "Distributed transactions across your database and an external provider are not available. A saga — record intent, act, then reconcile — is what you have instead.",
  ],
};
