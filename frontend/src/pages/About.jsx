import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Users, Shield, Star, Target, Rocket, Clock } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative overflow-hidden">
        {/* Hero backdrop */}
        <div className="pointer-events-none absolute inset-x-0 -top-64 h-[420px] bg-gradient-to-b from-[#2E2F46] via-[#2E2F46] to-transparent opacity-95" />

        <div className="relative z-10 flex min-h-screen flex-col">
          {/* Navbar */}
          <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-0">
              <Link
                to="/landing-page"
                className="flex items-center gap-3 text-sm font-medium tracking-tight text-primary"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#6D7AFF] via-[#38F9D7] to-[#2E2F46] shadow-md shadow-black/10">
                  <span className="text-xs font-bold text-white">TS</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-semibold leading-tight">TechSwap</span>
                  <span className="text-[11px] font-medium text-muted-foreground">
                    Peer-to-peer skill swaps for IT pros
                  </span>
                </div>
              </Link>

              <nav className="hidden items-center gap-6 text-xs font-medium text-muted-foreground md:flex">
                <Link to="/landing-page" className="transition-colors hover:text-primary">
                  Home
                </Link>
                <a href="/landing-page#how-it-works" className="transition-colors hover:text-primary">
                  How It Works
                </a>
                <a href="/landing-page#pricing" className="transition-colors hover:text-primary">
                  Pricing
                </a>
                <Link to="/about" className="text-primary">
                  About
                </Link>
              </nav>

              <div className="flex items-center gap-2">
                <Link to="/login" className="hidden sm:block">
                  <Button variant="outline" size="sm" className="rounded-full text-xs">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    size="sm"
                    className="rounded-full bg-[#6D7AFF] px-4 text-xs font-semibold text-white shadow-md shadow-black/10 hover:bg-[#5b6af2]"
                  >
                    Start Swapping
                  </Button>
                </Link>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1">
            {/* Hero */}
            <section className="border-b border-transparent bg-gradient-to-b from-[#2E2F46] via-[#1B1F32] to-[#020617] py-16 sm:py-20">
              <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 sm:px-6 lg:px-0 lg:flex-row lg:items-center">
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="flex-1"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A5B4FC]">
                    About TechSwap
                  </p>
                  <h1 className="mt-4 max-w-xl text-3xl font-semibold leading-tight text-white sm:text-4xl md:text-5xl">
                    Built by engineers,
                    <span className="block text-[#38F9D7]">for engineers who never stop learning.</span>
                  </h1>
                  <p className="mt-4 max-w-xl text-sm text-slate-100 sm:text-base">
                    TechSwap started as a small internal experiment between senior engineers who were tired of
                    one-way courses and random forum answers. Today, it is a focused ecosystem where ambitious IT
                    professionals trade real-world experience in live, structured sessions.
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <Link to="/register">
                      <Button
                        size="lg"
                        className="rounded-full bg-[#38F9D7] px-6 text-sm font-semibold text-[#022C22] shadow-lg shadow-black/20 hover:bg-[#2be6c5]"
                      >
                        Join the community
                      </Button>
                    </Link>
                    <Link to="/landing-page">
                      <Button
                        size="lg"
                        variant="outline"
                        className="rounded-full border-white/30 bg-white/5 text-xs font-medium text-slate-100 backdrop-blur hover:bg-white/10"
                      >
                        Back to landing page
                      </Button>
                    </Link>
                  </div>

                  <div className="mt-8 grid gap-4 text-xs text-slate-200 sm:grid-cols-3">
                    <div className="rounded-2xl bg-white/5 p-4">
                      <p className="text-[11px] font-medium text-slate-300">Swap sessions completed</p>
                      <p className="mt-2 text-xl font-semibold text-white">25,000+ live sessions</p>
                    </div>
                    <div className="rounded-2xl bg-white/5 p-4">
                      <p className="text-[11px] font-medium text-slate-300">Professionals in the network</p>
                      <p className="mt-2 text-xl font-semibold text-white">10,000+ members</p>
                    </div>
                    <div className="rounded-2xl bg-white/5 p-4">
                      <p className="text-[11px] font-medium text-slate-300">Average session rating</p>
                      <p className="mt-2 text-xl font-semibold text-white">4.9 / 5.0</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 24 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
                  className="flex-1"
                >
                  <div className="mx-auto w-full max-w-md rounded-[1.25rem] bg-gradient-to-br from-[#0B1020] via-[#111827] to-[#0B1020] p-[1px] shadow-2xl shadow-black/40">
                    <div className="rounded-[1.15rem] bg-[#020617] p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#6D7AFF] to-[#38F9D7] text-xs font-semibold text-white shadow-md shadow-black/30">
                            TS
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-slate-100">Our mission</span>
                            <span className="text-[11px] text-slate-400">Real conversations over endless content</span>
                          </div>
                        </div>
                        <div className="rounded-full bg-white/5 px-3 py-1 text-[11px] font-medium text-slate-100">
                          Ship faster, together
                        </div>
                      </div>

                      <p className="mt-4 text-xs text-slate-200">
                        We believe the best learning happens when two people who have actually shipped systems at
                        scale sit down for an honest, time-boxed exchange. TechSwap exists to make those
                        conversations easy to book, safe to run, and rewarding for both sides.
                      </p>

                      <div className="mt-4 grid gap-3 text-[11px] text-slate-100 sm:grid-cols-2">
                        <div className="rounded-2xl bg-white/5 p-3">
                          <p className="flex items-center gap-2 text-xs font-semibold">
                            <Users className="h-4 w-4 text-[#38F9D7]" />
                            Vetted peers only
                          </p>
                          <p className="mt-2 text-[11px] text-slate-300">
                            Profiles highlight real roles, stacks, and experience so you know who you are meeting.
                          </p>
                        </div>
                        <div className="rounded-2xl bg-white/5 p-3">
                          <p className="flex items-center gap-2 text-xs font-semibold">
                            <Shield className="h-4 w-4 text-[#6D7AFF]" />
                            Structured & safe
                          </p>
                          <p className="mt-2 text-[11px] text-slate-300">
                            Clear expectations, time boxes, and rating systems keep every swap focused and respectful.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* Why we built TechSwap */}
            <section className="border-t border-border bg-background py-14 sm:py-16">
              <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-0">
                <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
                  <div className="lg:col-span-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6D7AFF]">
                      Why we built it
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
                      The fastest way to learn is to talk to someone who has already solved your problem.
                    </h2>
                    <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                      Courses are great for foundations. But when you are deciding between two database designs,
                      or debugging a production outage, you need another practitioner, not another playlist.
                    </p>
                  </div>
                  <div className="lg:col-span-7">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm shadow-black/5">
                        <p className="flex items-center gap-2 text-xs font-semibold text-primary">
                          <Clock className="h-4 w-4 text-[#6D7AFF]" />
                          Respect your time
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Sessions are time-boxed and structured so you get meaningful insights in under an hour.
                        </p>
                      </div>
                      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm shadow-black/5">
                        <p className="flex items-center gap-2 text-xs font-semibold text-primary">
                          <Target className="h-4 w-4 text-[#38F9D7]" />
                          Real-world context
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Swap stories from real incident reviews, architecture migrations, and large-scale launches.
                        </p>
                      </div>
                      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm shadow-black/5">
                        <p className="flex items-center gap-2 text-xs font-semibold text-primary">
                          <Star className="h-4 w-4 text-amber-500" />
                          Mutual value
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Coins and reviews reward both mentors and learners so every swap is balanced and fair.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Our values */}
            <section className="border-t border-border bg-card/60 py-14 backdrop-blur-sm sm:py-16">
              <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-0">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6D7AFF]">
                      Our values
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
                      How we design every TechSwap experience.
                    </h2>
                  </div>
                  <p className="max-w-sm text-xs text-muted-foreground sm:text-sm">
                    TechSwap is more than a feature set. It is a set of principles about how experts should learn
                    from one another.
                  </p>
                </div>

                <div className="mt-8 grid gap-6 md:grid-cols-3">
                  <div className="rounded-2xl border border-border bg-background p-5 shadow-sm shadow-black/5">
                    <p className="flex items-center gap-2 text-xs font-semibold text-primary">
                      <Shield className="h-4 w-4 text-[#6D7AFF]" />
                      Psychological safety
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Sessions are private by default. We encourage honest discussion about failures, trade-offs,
                      and risks.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-background p-5 shadow-sm shadow-black/5">
                    <p className="flex items-center gap-2 text-xs font-semibold text-primary">
                      <Users className="h-4 w-4 text-[#38F9D7]" />
                      Generosity first
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Everyone shows up prepared to give as much as they receive. Coins simply keep the exchange
                      balanced.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-background p-5 shadow-sm shadow-black/5">
                    <p className="flex items-center gap-2 text-xs font-semibold text-primary">
                      <Rocket className="h-4 w-4 text-[#A5B4FC]" />
                      Career compounding
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Every session should leave you with something you can apply immediately to your team or
                      architecture.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Who TechSwap is for */}
            <section className="border-t border-border bg-background py-14 sm:py-16">
              <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-0">
                <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
                  <div className="lg:col-span-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6D7AFF]">
                      Who it is for
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
                      TechSwap is built for people who own outcomes, not just tickets.
                    </h2>
                    <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                      Whether you are leading an SRE team, building your first startup MVP, or moving from
                      individual contributor to architect, TechSwap connects you with peers at the right depth.
                    </p>
                  </div>
                  <div className="lg:col-span-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl border border-border bg-card p-4 text-xs text-muted-foreground">
                        <p className="text-xs font-semibold text-primary">Senior & staff engineers</p>
                        <p className="mt-2">
                          Swap stories about scaling systems, production incidents, and long-term technical strategy.
                        </p>
                      </div>
                      <div className="rounded-2xl border border-border bg-card p-4 text-xs text-muted-foreground">
                        <p className="text-xs font-semibold text-primary">DevOps & SRE leaders</p>
                        <p className="mt-2">
                          Compare approaches to observability, incident response, and reliability culture.
                        </p>
                      </div>
                      <div className="rounded-2xl border border-border bg-card p-4 text-xs text-muted-foreground">
                        <p className="text-xs font-semibold text-primary">Security & platform teams</p>
                        <p className="mt-2">
                          Learn how peers handle zero trust, threat modelling, and platform roadmaps in practice.
                        </p>
                      </div>
                      <div className="rounded-2xl border border-border bg-card p-4 text-xs text-muted-foreground">
                        <p className="text-xs font-semibold text-primary">Ambitious mid-level devs</p>
                        <p className="mt-2">
                          Sit with people a few steps ahead of you and unblock your next promotion or career move.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-dashed border-[#6D7AFF]/40 bg-[#F3F4FF] px-4 py-4 sm:px-6">
                  <div className="max-w-md text-xs text-slate-800 sm:text-sm">
                    <p className="font-semibold text-primary">Ready to write your TechSwap story?</p>
                    <p className="mt-1">
                      Create your profile in minutes, set your learning goals, and book your first high-leverage
                      swap session.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Link to="/register">
                      <Button size="sm" className="rounded-full bg-[#6D7AFF] px-5 text-xs font-semibold text-white">
                        Get started
                      </Button>
                    </Link>
                    <Link to="/login">
                      <Button size="sm" variant="outline" className="rounded-full text-xs">
                        I already have an account
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer (simple) */}
            <footer className="border-t border-border bg-[#020617] py-8 text-slate-100">
              <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-[11px] sm:flex-row sm:px-6 lg:px-0">
                <p className="text-slate-500">
                  &copy; {new Date().getFullYear()} TechSwap. Built by IT professionals for IT professionals.
                </p>
                <div className="flex flex-wrap items-center gap-4 text-slate-400">
                  <Link to="/landing-page" className="hover:text-white">
                    Home
                  </Link>
                  <a href="/landing-page#community" className="hover:text-white">
                    Community
                  </a>
                  <a href="/landing-page#pricing" className="hover:text-white">
                    Pricing
                  </a>
                  <a href="mailto:support@techswap.io" className="hover:text-white">
                    Contact support
                  </a>
                </div>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
