import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Users, Shield, Star, Clock, CircleDollarSign } from "lucide-react";

export default function Home() {
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
                <a href="#how-it-works" className="transition-colors hover:text-primary">
                  How It Works
                </a>
                <a href="#features" className="transition-colors hover:text-primary">
                  Features
                </a>
                <a href="#pricing" className="transition-colors hover:text-primary">
                  Pricing
                </a>
                <a href="#community" className="transition-colors hover:text-primary">
                  Community
                </a>
                <a href="#insights" className="transition-colors hover:text-primary">
                  Blog / Insights
                </a>
                <Link to="/about" className="transition-colors hover:text-primary">
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
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1">
            {/* Hero */}
            <section className="border-b border-transparent bg-gradient-to-b from-[#2E2F46] via-[#1B1F32] to-[#020617] py-16 sm:py-20">
              <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-4 sm:px-6 lg:flex-row lg:px-0">
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="flex-1"
                >
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-[#E5E7FF] shadow-sm shadow-black/20 backdrop-blur">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#38F9D7]" />
                    Built by IT professionals for IT professionals
                  </div>
                  <h1 className="mt-5 max-w-xl text-3xl font-semibold leading-tight text-white sm:text-4xl md:text-5xl">
                    Swap Skills. Share Knowledge.
                    <span className="block text-[#38F9D7]">Grow Together.</span>
                  </h1>
                  <p className="mt-4 max-w-xl text-sm text-slate-100 sm:text-base">
                    TechSwap connects engineers, architects, DevOps, and security specialists in a
                    trusted, gamified ecosystem for real-time peer-to-peer skill swaps.
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <Link to="/register">
                      <Button
                        size="lg"
                        className="rounded-full bg-[#38F9D7] px-6 text-sm font-semibold text-[#022C22] shadow-lg shadow-black/20 hover:bg-[#2be6c5]"
                      >
                        Start Free
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <a href="#how-it-works">
                      <Button
                        size="lg"
                        variant="outline"
                        className="rounded-full border-white/30 bg-white/5 text-xs font-medium text-slate-100 backdrop-blur hover:bg-white/10"
                      >
                        See How It Works
                      </Button>
                    </a>
                  </div>

                  <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-slate-200">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-[#38F9D7]" />
                      <div className="flex flex-col">
                        <span className="font-semibold">10,000+ IT professionals</span>
                        <span className="text-slate-300">already swapping skills worldwide</span>
                      </div>
                    </div>
                    <div className="hidden h-8 w-px bg-white/20 sm:block" />
                    <div className="flex flex-col">
                      <span className="text-[11px] uppercase tracking-wide text-slate-300">
                        Swap sessions completed
                      </span>
                      <span className="text-sm font-semibold">25,000+ live sessions</span>
                    </div>
                  </div>
                </motion.div>

                {/* Session preview card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 24 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
                  className="flex-1"
                >
                  <div className="mx-auto w-full max-w-md rounded-[1.25rem] bg-gradient-to-br from-[#0B1020] via-[#111827] to-[#0B1020] p-[1px] shadow-2xl shadow-black/40">
                    <div className="rounded-[1.15rem] bg-[#020617] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#6D7AFF] to-[#38F9D7] text-xs font-semibold text-white shadow-md shadow-black/30">
                            TS
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-slate-100">Swap Session</span>
                            <span className="text-[11px] text-slate-400">Backend Dev → Cloud Engineer</span>
                          </div>
                        </div>
                        <div className="rounded-full bg-white/5 px-3 py-1 text-[11px] font-medium text-slate-100">
                          Live now
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/5 bg-gradient-to-r from-[#111827] via-[#020617] to-[#111827] px-3 py-2 text-xs text-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#38F9D7]/10">
                            <CircleDollarSign className="h-4 w-4 text-[#38F9D7]" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[11px] uppercase tracking-wide text-slate-400">
                              Wallet balance
                            </span>
                            <span className="text-sm font-semibold">420 coins</span>
                          </div>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-[11px] text-slate-400">50 coins / person</span>
                          <span className="text-[11px] text-slate-200">Only when you swap</span>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-12 gap-3 text-[11px] text-slate-100">
                        <div className="col-span-7 space-y-2">
                          <div className="rounded-2xl bg-white/5 px-3 py-2">
                            "How did you design your microservice boundaries for payments?"
                          </div>
                          <div className="ml-6 rounded-2xl bg-[#38F9D7]/15 px-3 py-2 text-[#E5FEF8]">
                            "I can walk you through our real architecture and trade-offs."
                          </div>
                          <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-400">
                            <Clock className="h-3 w-3" /> 47 min remaining
                          </div>
                        </div>
                        <div className="col-span-5 space-y-2">
                          <div className="rounded-2xl bg-white/5 p-3">
                            <p className="text-[10px] font-medium text-slate-300">Session checklist</p>
                            <ul className="mt-1 space-y-1 text-[10px] text-slate-400">
                              <li>- Observability patterns</li>
                              <li>- Zero-trust in practice</li>
                              <li>- Take-home blueprint</li>
                            </ul>
                          </div>
                          <div className="rounded-2xl bg-gradient-to-r from-[#38F9D7]/20 to-[#6D7AFF]/20 p-2 text-[10px] text-slate-100">
                            "Best mentoring experience of my career." · Senior Backend Engineer
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* Problem • Solution */}
            <section id="features" className="border-t border-border bg-background py-14 sm:py-16">
              <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-0">
                <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
                  <div className="lg:col-span-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6D7AFF]">
                      The problem
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
                      Stack Overflow doesn't solve everything.
                    </h2>
                    <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                      As your career grows, copy-paste answers and anonymous threads stop being enough.
                      You need real-time, contextual conversations with peers who have solved the same
                      problems before.
                    </p>
                  </div>
                  <div className="lg:col-span-7">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm shadow-black/5">
                        <p className="text-xs font-semibold text-primary">Too much noise</p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Endless threads, conflicting opinions, and outdated answers slow teams down.
                        </p>
                      </div>
                      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm shadow-black/5">
                        <p className="text-xs font-semibold text-primary">No real accountability</p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          You rarely know who's on the other side or if they've actually shipped at scale.
                        </p>
                      </div>
                      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm shadow-black/5">
                        <p className="text-xs font-semibold text-primary">Hard to go deep</p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Threads don't replace whiteboarding, architecture reviews, or real mentoring.
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 rounded-2xl border border-dashed border-[#6D7AFF]/40 bg-[#F3F4FF] p-5">
                      <div className="flex items-start gap-3">
                        <Shield className="mt-0.5 h-4 w-4 text-[#2E2F46]" />
                        <div>
                          <p className="text-xs font-semibold text-primary">TechSwap is the solution.</p>
                          <p className="mt-1 text-xs text-slate-700">
                            We match you with vetted peers for real-time, 1:1 swap sessions where both
                            sides bring value. You only spend coins when a session is confirmed.
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-700">
                            <span className="rounded-full bg-white px-3 py-1 shadow-xs">
                              Skill swaps, not random posts.
                            </span>
                            <span className="rounded-full bg-white px-3 py-1 shadow-xs">
                              Structured, time-boxed sessions.
                            </span>
                            <span className="rounded-full bg-white px-3 py-1 shadow-xs">
                              Ratings, reviews, and verified profiles.
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* How it works */}
            <section
              id="how-it-works"
              className="border-t border-border bg-card/60 py-14 backdrop-blur-sm sm:py-16"
            >
              <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-0">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6D7AFF]">
                      How it works
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
                      A four-step path to meaningful tech mentorship.
                    </h2>
                  </div>
                  <p className="max-w-sm text-xs text-muted-foreground sm:text-sm">
                    From first login to your next breakthrough swap session, TechSwap is optimized for
                    trust, clarity, and speed.
                  </p>
                </div>

                <div className="mt-8 grid gap-6 md:grid-cols-4">
                  {[
                    {
                      step: "01",
                      title: "Create your profile",
                      body:
                        "Sign up with GitHub, Google, or LinkedIn. List the skills you can teach and the ones you want to learn.",
                    },
                    {
                      step: "02",
                      title: "Browse peer posts",
                      body:
                        "Explore swap posts by role, tech stack, and seniority level. Shortlist peers that match your goals.",
                    },
                    {
                      step: "03",
                      title: "Buy coins securely",
                      body:
                        "Purchase coin bundles with Stripe. You only spend coins when a swap session is accepted.",
                    },
                    {
                      step: "04",
                      title: "Start your live session",
                      body:
                        "Join a real-time video session, share context, and exchange real-world experience in 60 minutes or less.",
                    },
                  ].map((item) => (
                    <div
                      key={item.step}
                      className="relative flex flex-col rounded-2xl border border-border bg-card p-4 shadow-sm shadow-black/5"
                    >
                      <span className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#E3E7FF] text-[11px] font-semibold text-primary">
                        {item.step}
                      </span>
                      <h3 className="text-sm font-semibold text-primary">{item.title}</h3>
                      <p className="mt-2 text-xs text-muted-foreground">{item.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Trust & testimonials */}
            <section
              id="community"
              className="border-t border-border bg-background py-14 sm:py-16"
            >
              <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-0">
                <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
                  <div className="lg:col-span-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6D7AFF]">
                      Trust & community
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
                      A community of ambitious, generous technologists.
                    </h2>
                    <div className="mt-5 grid grid-cols-2 gap-4 text-xs">
                      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm shadow-black/5">
                        <p className="text-[11px] font-medium text-muted-foreground">
                          Trusted by
                        </p>
                        <p className="mt-1 text-xl font-semibold text-primary">10,000+</p>
                        <p className="text-[11px] text-muted-foreground">engineers, PMs & architects</p>
                      </div>
                      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm shadow-black/5">
                        <p className="text-[11px] font-medium text-muted-foreground">
                          Swap sessions completed
                        </p>
                        <p className="mt-1 text-xl font-semibold text-primary">25,000+</p>
                        <p className="text-[11px] text-muted-foreground">peer-to-peer mentoring calls</p>
                      </div>
                    </div>
                  </div>
                  <div className="lg:col-span-7">
                    <div className="flex gap-4 overflow-x-auto pb-2">
                      {[
                        {
                          role: "Senior Backend Engineer",
                          quote:
                            "I replaced random forum replies with one focused session a week. The ROI on time is insane.",
                          score: "4.9 / 5.0",
                        },
                        {
                          role: "DevOps Lead",
                          quote:
                            "Seeing how another team runs incident response in real life changed how we operate.",
                          score: "4.8 / 5.0",
                        },
                        {
                          role: "Security Engineer",
                          quote:
                            "It's like having access to a braintrust of people who have shipped at scale.",
                          score: "4.9 / 5.0",
                        },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className="min-w-[260px] flex-1 rounded-2xl border border-border bg-card p-4 shadow-sm shadow-black/5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold text-primary">{item.role}</p>
                            <div className="flex items-center gap-1 text-[11px] text-amber-500">
                              <Star className="h-3 w-3 fill-amber-400" />
                              <span>{item.score}</span>
                            </div>
                          </div>
                          <p className="mt-3 text-xs text-muted-foreground">{item.quote}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Pricing teaser */}
            <section id="pricing" className="border-t border-border bg-card py-14 sm:py-16">
              <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-0">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6D7AFF]">
                      Pricing
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
                      You only pay to swap — not to belong.
                    </h2>
                    <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                      Create your profile for free. Buy coins only when you're ready to book high-leverage
                      sessions with peers.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Link to="/register">
                      <Button size="sm" className="rounded-full bg-[#6D7AFF] px-5 text-xs font-semibold text-white">
                        Start Free
                      </Button>
                    </Link>
                    <a href="#contact">
                      <Button size="sm" variant="outline" className="rounded-full text-xs">
                        Talk to us
                      </Button>
                    </a>
                  </div>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-border bg-background p-5 shadow-sm shadow-black/5">
                    <p className="text-xs font-semibold text-primary">Starter</p>
                    <p className="mt-1 text-2xl font-semibold text-primary">Free</p>
                    <p className="mt-1 text-xs text-muted-foreground">Create profile, browse experts, join community.</p>
                  </div>
                  <div className="rounded-2xl border border-[#6D7AFF] bg-gradient-to-b from-[#EEF0FF] to-white p-5 shadow-md shadow-[#6D7AFF]/30">
                    <p className="text-xs font-semibold text-primary">Pro</p>
                    <p className="mt-1 text-2xl font-semibold text-primary">$9/mo</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Bonus coins, featured posts, priority in matching.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-background p-5 shadow-sm shadow-black/5">
                    <p className="text-xs font-semibold text-primary">Elite</p>
                    <p className="mt-1 text-2xl font-semibold text-primary">$39/mo</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Premium swaps, analytics, early access to new features.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer id="contact" className="border-t border-border bg-[#020617] py-10 text-slate-100">
              <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-0">
                <div className="grid gap-8 md:grid-cols-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#6D7AFF] via-[#38F9D7] to-[#2E2F46]">
                        <span className="text-[11px] font-bold text-white">TS</span>
                      </div>
                      <span className="text-sm font-semibold">TechSwap</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Built by IT professionals for the next generation of IT leaders.
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Secured via Stripe + MongoDB Atlas.
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Product
                    </p>
                    <div className="mt-3 space-y-2 text-xs text-slate-300">
                      <a href="#how-it-works" className="block hover:text-white">
                        How It Works
                      </a>
                      <a href="#features" className="block hover:text-white">
                        Features
                      </a>
                      <Link to="/login" className="block hover:text-white">
                        Login
                      </Link>
                      <Link to="/register" className="block hover:text-white">
                        Sign Up
                      </Link>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Resources
                    </p>
                    <div className="mt-3 space-y-2 text-xs text-slate-300">
                      <a href="#insights" className="block hover:text-white">
                        Blog / Insights
                      </a>
                      <a href="#community" className="block hover:text-white">
                        Community
                      </a>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Contact
                    </p>
                    <div className="mt-3 space-y-2 text-xs text-slate-300">
                      <p>support@techswap.io</p>
                      <p className="text-slate-500">
                        Have a team? Talk to us about scaling TechSwap across your organisation.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-8 border-t border-slate-800 pt-4 text-[11px] text-slate-500">
                  <p>&copy; {new Date().getFullYear()} TechSwap. All rights reserved.</p>
                </div>
              </div>
            </footer>
          </main>

          {/* Sticky CTA for conversions */}
          <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-4">
            <div className="pointer-events-auto flex w-full max-w-md items-center justify-between rounded-full border border-border bg-background/95 px-4 py-2 shadow-lg shadow-black/20 sm:px-5">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-primary">Ready for your first swap?</span>
                <span className="text-[11px] text-muted-foreground">
                  Get 25 free coins to start your first session.
                </span>
              </div>
              <Link to="/register">
                <Button size="sm" className="rounded-full bg-[#6D7AFF] text-xs font-semibold text-white">
                  Claim coins
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}