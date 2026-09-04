import type { Problem } from "./types";
import { edge, node } from "./authoring";

export const jobScheduler: Problem = {
  slug: "job-scheduler",
  title: "Distributed job scheduler",
  difficulty: "hard",
  tags: ["scheduling", "coordination", "exactly-once"],
  summary:
    "Run millions of scheduled jobs on time, exactly once, across an unreliable fleet.",
  prompt: [
    "Design a service where users register jobs to run at a time or on a recurring schedule, and the platform executes them reliably.",
    "Machines running jobs will crash mid-execution. Several schedulers will be running for availability. Both facts make 'exactly once, on time' the hard part.",
  ],
  scale: [
    { label: "Registered jobs", value: "50 million" },
    { label: "Executions", value: "20,000 / sec" },
    { label: "Schedule accuracy", value: "within 1 s" },
    { label: "Job duration", value: "1 s to 6 h" },
  ],
  requirements: [
    { text: "Register one-off and recurring jobs.", type: "functional" },
    { text: "Execute each due job at its scheduled time.", type: "functional" },
    { text: "Retry failed jobs with backoff.", type: "functional" },
    { text: "Expose job status and execution history.", type: "functional" },
    {
      text: "A job runs once even with several schedulers live.",
      type: "non-functional",
    },
    { text: "A worker crash must not lose the job.", type: "non-functional" },
  ],
  hints: [
    "You need more than one scheduler for availability, but they must not both dispatch the same job. What arbitrates that?",
    "Dispatching is not executing. Separating 'decide it is due' from 'run it' lets long jobs run without blocking the clock.",
    "A worker that dies mid-job never acknowledges it. What should happen to an unacknowledged job, and how does that interact with retries?",
  ],
  rubric: [
    {
      id: "scheduler",
      kind: "has-component",
      component: "scheduler",
      label: "There is a scheduling tier",
      feedback:
        "No scheduler is present — something has to notice that a job is due.",
    },
    {
      id: "coordinator",
      kind: "has-component",
      component: "coordinator",
      label: "Schedulers coordinate ownership",
      feedback:
        "Nothing coordinates between schedulers. Run two for availability and every job fires twice.",
    },
    {
      id: "scheduler-coordinator",
      kind: "connects",
      from: "scheduler",
      to: "coordinator",
      label: "The scheduler takes leadership or a lock",
      feedback:
        "The scheduler does not consult the coordinator, so leader election or locking never actually happens.",
    },
    {
      id: "dispatch-queue",
      kind: "connects",
      from: "scheduler",
      to: "queue",
      label: "Due jobs are dispatched to a queue",
      feedback:
        "The scheduler has no queue to dispatch to, so it would have to execute jobs itself and a six-hour job would stall the clock.",
    },
    {
      id: "workers",
      kind: "connects",
      from: "queue",
      to: "worker",
      label: "Workers pull jobs from the queue",
      feedback:
        "Nothing consumes the dispatch queue, so due jobs are enqueued and never run.",
    },
    {
      id: "job-store",
      kind: "connects",
      from: "service",
      to: "database",
      label: "Job definitions are durable",
      feedback:
        "Job definitions and schedules are not stored durably, so a restart forgets every registered job.",
    },
    {
      id: "status-writeback",
      kind: "connects",
      from: "worker",
      to: "database",
      label: "Workers record execution outcomes",
      feedback:
        "Workers never write back status, so retries and history are impossible — you cannot tell a finished job from a lost one.",
    },
    {
      id: "scheduler-reads",
      kind: "connects",
      from: "scheduler",
      to: "database",
      label: "The scheduler reads due jobs from storage",
      feedback:
        "The scheduler is not reading job definitions from storage, so it has no idea what is due.",
    },
    {
      id: "observability",
      kind: "has-component",
      component: "monitoring",
      label: "Execution is monitored",
      required: false,
      feedback:
        "A scheduler that silently stops firing is the classic outage. Something should be watching that jobs actually run.",
    },
    {
      id: "no-direct-dispatch",
      kind: "absent-edge",
      from: "scheduler",
      to: "worker",
      label: "The scheduler does not call workers directly",
      feedback:
        "The scheduler invokes workers directly. A synchronous call means a slow or dead worker blocks the scheduling loop and the job is lost on failure.",
    },
  ],
  referenceSolution: {
    nodes: [
      node("client", "client", "Job console", 0, 190),
      node("api", "service", "Job API", 230, 190),
      node("db", "database", "Job store", 470, 320),
      node("sched-1", "scheduler", "Scheduler", 470, 60),
      node("coord", "coordinator", "Leader election", 710, 190),
      node("queue", "queue", "Dispatch queue", 710, 60),
      node("worker", "worker", "Execution workers", 950, 60),
      node("monitor", "monitoring", "Run monitoring", 950, 320),
    ],
    edges: [
      edge("client", "api"),
      edge("api", "db"),
      edge("sched-1", "db"),
      edge("sched-1", "coord"),
      edge("sched-1", "queue"),
      edge("queue", "worker"),
      edge("worker", "db"),
      edge("worker", "monitor"),
    ],
  },
  tradeoffs: [
    "Exactly-once execution is not really achievable across a network. What you build is at-least-once delivery plus idempotent jobs, which is why the job contract matters as much as the scheduler.",
    "Leader election gives you one active scheduler and simple reasoning, but a failover gap. Partitioning jobs across schedulers by hash scales further and keeps more of the fleet useful.",
    "A visibility timeout returns a job to the queue when a worker dies, at the cost of occasionally rerunning a job that was merely slow. Tuning that timeout is the real operational lever.",
  ],
};
