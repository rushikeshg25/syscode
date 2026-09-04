import type { Problem } from "@/content/problems/types";

export function ProblemBrief({ problem }: { problem: Problem }) {
  const functional = problem.requirements.filter(
    (requirement) => requirement.type === "functional",
  );
  const nonFunctional = problem.requirements.filter(
    (requirement) => requirement.type === "non-functional",
  );

  return (
    <div className="space-y-6 p-5">
      <div className="space-y-3">
        {problem.prompt.map((paragraph) => (
          <p key={paragraph} className="text-xs leading-6 text-slate-400">
            {paragraph}
          </p>
        ))}
      </div>

      <section>
        <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
          Scale
        </h3>
        <dl className="grid grid-cols-2 gap-2">
          {problem.scale.map((entry) => (
            <div
              key={entry.label}
              className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2"
            >
              <dt className="text-[10px] text-slate-600">{entry.label}</dt>
              <dd className="mt-0.5 text-xs font-semibold text-slate-200">
                {entry.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <RequirementList title="Functional" items={functional} />
      <RequirementList title="Non-functional" items={nonFunctional} />
    </div>
  );
}

function RequirementList({
  title,
  items,
}: {
  title: string;
  items: { text: string }[];
}) {
  if (!items.length) return null;
  return (
    <section>
      <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
        {title} requirements
      </h3>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li
            key={item.text}
            className="flex gap-2.5 text-xs leading-5 text-slate-400"
          >
            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-slate-600" />
            {item.text}
          </li>
        ))}
      </ul>
    </section>
  );
}
