import type { Difficulty, Problem } from "./types";
import { chatMessaging } from "./chat-messaging";
import { checkoutPayments } from "./checkout-payments";
import { jobScheduler } from "./job-scheduler";
import { metricsPipeline } from "./metrics-pipeline";
import { newsFeed } from "./news-feed";
import { pastebin } from "./pastebin";
import { rateLimiter } from "./rate-limiter";
import { rideHailingMatch } from "./ride-hailing-match";
import { staticAssetDelivery } from "./static-asset-delivery";
import { typeaheadSearch } from "./typeahead-search";
import { urlShortener } from "./url-shortener";
import { videoStreaming } from "./video-streaming";

/** Ordered easiest to hardest — this is also the prev/next order. */
export const problems: Problem[] = [
  urlShortener,
  rateLimiter,
  staticAssetDelivery,
  pastebin,
  typeaheadSearch,
  newsFeed,
  chatMessaging,
  rideHailingMatch,
  checkoutPayments,
  videoStreaming,
  jobScheduler,
  metricsPipeline,
];

export const problemBySlug = new Map(
  problems.map((problem) => [problem.slug, problem]),
);

export const getProblem = (slug: string) => problemBySlug.get(slug);

export const problemIndex = (slug: string) =>
  problems.findIndex((problem) => problem.slug === slug);

export const allTags = [
  ...new Set(problems.flatMap((problem) => problem.tags)),
].sort();

export const difficulties: Difficulty[] = ["easy", "medium", "hard"];

export type { Problem, Difficulty };
export type { Check, Requirement } from "./types";
