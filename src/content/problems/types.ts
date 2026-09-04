import type { ComponentKey, DiagramSnapshot } from "@/lib/diagram-document";

export type Difficulty = "easy" | "medium" | "hard";

/**
 * A check endpoint. Pass several keys when more than one component type is a
 * legitimate answer — a "client" and a "mobile" client are usually
 * interchangeable in a rubric.
 */
export type Endpoint = ComponentKey | ComponentKey[];

export type Requirement = {
  text: string;
  type: "functional" | "non-functional";
};

type CheckBase = {
  id: string;
  /** Short statement of what the check wants, shown pass or fail. */
  label: string;
  /** Shown on failure. Say what is wrong and why it matters. */
  feedback: string;
  /** A design is only accepted when every required check passes. */
  required?: boolean;
  weight?: number;
};

export type Check = CheckBase &
  (
    | { kind: "has-component"; component: Endpoint; min?: number }
    | {
        kind: "connects";
        from: Endpoint;
        to: Endpoint;
        /** Allow the hop to pass through these component types. */
        via?: ComponentKey[];
        /** Set false when the direction of the edge is arbitrary. */
        directed?: boolean;
      }
    | {
        kind: "path-exists";
        from: Endpoint;
        to: Endpoint;
        /** Every one of these types must appear somewhere on the path. */
        through: ComponentKey[];
      }
    | { kind: "absent-edge"; from: Endpoint; to: Endpoint }
    | { kind: "count-at-least"; component: Endpoint; n: number }
  );

export type Problem = {
  slug: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  /** One line for the problem list. */
  summary: string;
  /** The question itself, one paragraph per entry. */
  prompt: string[];
  scale: { label: string; value: string }[];
  requirements: Requirement[];
  /** Ordered, revealed one at a time. */
  hints: string[];
  rubric: Check[];
  referenceSolution: DiagramSnapshot;
  /** Discussion unlocked once the question is solved. */
  tradeoffs: string[];
};
