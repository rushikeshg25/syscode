import {
  ArrowRight,
  Check,
  Database,
  Globe2,
  Network,
  Server,
} from "lucide-react";
import Link from "next/link";

const DiagramNode = ({
  icon: Icon,
  label,
  className,
}: {
  icon: typeof Server;
  label: string;
  className: string;
}) => (
  <div
    className={`absolute z-10 flex min-w-32 items-center gap-2.5 rounded-xl border bg-[#111824]/95 px-3.5 py-3 text-xs font-medium text-slate-200 shadow-xl ${className}`}
  >
    <span className="grid size-7 place-items-center rounded-lg bg-sky-400/10 text-sky-300">
      <Icon className="size-3.5" />
    </span>
    {label}
  </div>
);

const Hero = () => {
  return (
    <section className="relative isolate overflow-hidden px-5 pb-20 pt-32 sm:px-8 sm:pb-28 sm:pt-40">
      <div className="landing-grid absolute inset-0 -z-20" />
      <div className="absolute left-[12%] top-24 -z-10 size-80 rounded-full bg-sky-500/10 blur-[110px]" />
      <div className="absolute right-[8%] top-36 -z-10 size-96 rounded-full bg-violet-500/10 blur-[130px]" />

      <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="max-w-2xl">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/5 px-3 py-1.5 text-xs font-medium text-sky-200">
            <span className="size-1.5 rounded-full bg-sky-400 shadow-[0_0_10px_#38bdf8]" />
            A visual workspace for system design
          </div>
          <h1 className="text-balance text-5xl font-semibold leading-[1.04] tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl">
            Learn architecture by{" "}
            <span className="text-sky-300">building it.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-slate-400 sm:text-xl">
            Turn system design concepts into diagrams you can see, change, and
            understand. Start with a component, connect the flow, and make the
            trade-offs click.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/problems"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-sky-400 px-5 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_12px_40px_rgba(56,189,248,0.18)] transition hover:bg-sky-300"
            >
              Solve a question
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/home"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.07]"
            >
              Open the sandbox
            </Link>
          </div>
          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
            {[
              "No account required",
              "Saved in your browser",
              "Free to explore",
            ].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <Check className="size-3.5 text-emerald-400" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[590px]">
          <div className="absolute -inset-10 -z-10 rounded-full bg-sky-400/5 blur-3xl" />
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1018] shadow-[0_32px_100px_rgba(0,0,0,0.45)]">
            <div className="flex h-12 items-center justify-between border-b border-white/10 px-4">
              <div className="flex gap-1.5">
                <span className="size-2.5 rounded-full bg-rose-400/70" />
                <span className="size-2.5 rounded-full bg-amber-400/70" />
                <span className="size-2.5 rounded-full bg-emerald-400/70" />
              </div>
              <span className="rounded-md bg-white/5 px-2.5 py-1 text-[10px] font-medium text-slate-500">
                URL shortener · draft
              </span>
              <span className="w-10" />
            </div>
            <div className="relative h-[370px] bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.055),transparent_58%)] sm:h-[430px]">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:24px_24px]" />
              <svg
                className="absolute inset-0 size-full"
                viewBox="0 0 520 400"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="line" x1="0" x2="1">
                    <stop offset="0" stopColor="#38bdf8" stopOpacity=".25" />
                    <stop offset=".5" stopColor="#38bdf8" stopOpacity=".8" />
                    <stop offset="1" stopColor="#38bdf8" stopOpacity=".25" />
                  </linearGradient>
                </defs>
                <path
                  d="M 95 105 C 180 105, 170 195, 260 195"
                  fill="none"
                  stroke="url(#line)"
                  strokeWidth="2"
                />
                <path
                  d="M 385 105 C 315 105, 335 195, 260 195"
                  fill="none"
                  stroke="url(#line)"
                  strokeWidth="2"
                />
                <path
                  d="M 260 235 C 260 285, 145 275, 145 325"
                  fill="none"
                  stroke="url(#line)"
                  strokeWidth="2"
                />
                <path
                  d="M 260 235 C 260 285, 390 275, 390 325"
                  fill="none"
                  stroke="url(#line)"
                  strokeWidth="2"
                />
              </svg>
              <DiagramNode
                icon={Globe2}
                label="Web client"
                className="left-[4%] top-[17%] border-sky-400/25"
              />
              <DiagramNode
                icon={Network}
                label="API gateway"
                className="right-[4%] top-[17%] border-violet-400/25"
              />
              <DiagramNode
                icon={Server}
                label="Application"
                className="left-1/2 top-[43%] -translate-x-1/2 border-sky-400/35"
              />
              <DiagramNode
                icon={Database}
                label="Primary DB"
                className="bottom-[13%] left-[8%] border-emerald-400/25"
              />
              <DiagramNode
                icon={Database}
                label="Cache"
                className="bottom-[13%] right-[8%] border-amber-400/25"
              />
            </div>
          </div>
          <div className="absolute -bottom-5 left-6 flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-[#0d1717] px-3 py-2 text-xs text-emerald-300 shadow-xl">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            Changes saved locally
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
