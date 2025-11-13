import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  BadgeCheck,
  Coins,
  Flame,
  Globe,
  LineChart,
  MessageSquare,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import heroIllustration from "@/assets/hero-illustration.png";
import communityImage from "@/assets/community-image.png";

const navLinks = [
  { label: "Home", href: "#top" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Community", href: "#community" },
  { label: "Contact", href: "#contact" },
];

const heroMetrics = [
  {
    label: "Live Swaps Happening Now",
    value: "47",
    sublabel: "Mentor sessions in real time",
  },
  {
    label: "Coins Spent Globally",
    value: "1.2M+",
    sublabel: "Trust-backed knowledge exchange",
  },
  {
    label: "Member NPS",
    value: "78",
    sublabel: "SaaS-level satisfaction score",
  },
];

const problemPoints = [
  {
    title: "Too much noise",
    description:
      "Forums feel like chaos and DMs get lost. Your expertise deserves a curated stage.",
    icon: Flame,
  },
  {
    title: "Random advice",
    description:
      "Crowdsourced answers lack context. TechSwap connects you with vetted peers who speak your stack.",
    icon: ShieldCheck,
  },
  {
    title: "No real growth",
    description:
      "One-sided mentorship stalls momentum. Reciprocal swaps create skin in the game for both pros.",
    icon: LineChart,
  },
];

const solutionPillars = [
  {
    title: "Trusted skill swaps",
    description:
      "Every session is a 1:1 exchange powered by reputation scores, verified badges, and secure coin payments.",
    icon: BadgeCheck,
  },
  {
    title: "Session-first design",
    description:
      "Book, brief, and launch video swaps in minutes. Timers, notes, and recordings keep momentum.",
    icon: MessageSquare,
  },
  {
    title: "Gamified progression",
    description:
      "Earn badges, level up your expertise, and climb the leaderboard while compounding your skills.",
    icon: Trophy,
  },
];

const timelineSteps = [
  {
    step: "01",
    title: "Create your premium profile",
    description:
      "List what you can teach, what you want to learn, and showcase trust badges from previous swaps.",
    icon: Sparkles,
  },
  {
    step: "02",
    title: "Browse & shortlist experts",
    description:
      "Filter by skills, timezone, languages, and ratings. Save your dream swaps in curated collections.",
    icon: Users,
  },
  {
    step: "03",
    title: "Buy coins & secure your slot",
    description:
      "Purchase coin bundles or earn them by teaching. Every swap session costs just 50 coins per person.",
    icon: Coins,
  },
  {
    step: "04",
    title: "Launch the real-time swap",
    description:
      "Join the live session with integrated timers, shared notes, and in-session feedback nudges.",
    icon: MessageSquare,
  },
];

const trustMetrics = [
  { label: "Trusted IT professionals", value: "10,000+" },
  { label: "Swap sessions completed", value: "25,000+" },
  { label: "Average session rating", value: "4.9/5" },
  { label: "Coins reinvested monthly", value: "320K" },
];

const brandBadges = [
  "Secured via Stripe",
  "Built on MongoDB Atlas",
  "Powered by LiveKit",
  "GDPR & SOC2 Ready",
];

const testimonials = [
  {
    name: "Fatima Zouari",
    role: "Staff Full-Stack Engineer · Paris",
    avatar: "https://i.pravatar.cc/150?img=8",
    feedback:
      "“I swapped advanced GraphQL patterns with a Cloud Architect from Toronto. The depth was unreal — I shipped a new service in days and mentored my team with confidence.”",
    stat: "+4x faster feature delivery",
  },
  {
    name: "Youssef Alami",
    role: "Senior Data Analyst · Rabat",
    avatar: "https://i.pravatar.cc/150?img=9",
    feedback:
      "“Buying coins felt like investing in myself. I met a mentor who demystified dbt, and I earned coins back by coaching on SQL performance.”",
    stat: "2 dream job offers unlocked",
  },
  {
    name: "Amina Kadiri",
    role: "Lead Product Designer · Berlin",
    avatar: "https://i.pravatar.cc/150?img=10",
    feedback:
      "“We turned a UX jam session into a repeat exchange. The gamified badges keep me accountable — I never thought mentorship could feel this premium.”",
    stat: "Team design score +18 pts",
  },
];

const personaStories = [
  {
    name: "Sofia Chen",
    title: "DevOps Lead · Singapore",
    quote:
      "Swapped Kubernetes resiliency drills for LLM deployment tricks. Our uptime improved within a single sprint.",
    impact: "SRE escalation time ↓ 42%",
    avatar: "https://i.pravatar.cc/150?img=21",
  },
  {
    name: "Marcus Grant",
    title: "Cybersecurity Architect · Austin",
    quote:
      "I mentor on zero-trust playbooks and learn secure ML. The reciprocal model keeps both sides engaged.",
    impact: "Security incidents resolved 3x faster",
    avatar: "https://i.pravatar.cc/150?img=33",
  },
  {
    name: "Leila Haddad",
    title: "Mobile Engineer · Casablanca",
    quote:
      "Shared SwiftUI patterns and received guidance on monetization funnels. The coin economy makes collaboration effortless.",
    impact: "App Store revenue +27% QoQ",
    avatar: "https://i.pravatar.cc/150?img=45",
  },
];

const pricingTeaser = [
  {
    tier: "Starter",
    price: "Free",
    headline: "Explore the ecosystem",
    perks: ["Discover experts", "Join community events", "Buy coins on demand"],
  },
  {
    tier: "Pro",
    price: "$9/mo",
    headline: "+120 bonus coins / month",
    perks: ["Featured profile", "Priority matches", "Session analytics"],
  },
  {
    tier: "Elite",
    price: "$39/mo",
    headline: "For power swappers",
    perks: ["Premium swaps", "Advanced dashboards", "Early feature access"],
  },
];

const AUTOPLAY_INTERVAL = 6000;

const GradientBackdrop = () => (
  <div aria-hidden="true" className="pointer-events-none">
    <div className="absolute inset-x-0 -top-1/2 h-[650px] bg-gradient-to-b from-[#6d7aff1a] via-[#38f9d71a] to-transparent blur-[120px]" />
    <div className="absolute left-10 top-1/3 h-64 w-64 rounded-full bg-secondary/20 blur-[120px]" />
    <div className="absolute right-10 top-1/4 h-80 w-80 rounded-full bg-accent/20 blur-[140px]" />
  </div>
);

const StickyWalletCTA = ({ isAuthenticated, coinBalance, userName }) => {
  if (!isAuthenticated) return null;

  return (
    <motion.aside
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed bottom-6 right-6 z-50 w-[320px] max-w-[85vw]"
    >
      <Card className="bg-card/95 border border-border/50 px-6 py-6 shadow-[0_28px_80px_rgba(46,47,70,0.28)]">
        <CardContent className="p-0 flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-secondary/20 p-4 shadow-[0_16px_45px_rgba(109,122,255,0.25)]">
              <Coins className="size-6 text-secondary" />
            </div>
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
                {userName ? `${userName}'s coin balance` : "Coin balance"}
              </p>
              <p className="text-3xl font-semibold text-foreground">
                {coinBalance.toLocaleString()} coins
              </p>
              <p className="text-sm text-muted-foreground">
                50 coins per person per premium swap session.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/wallet" className="w-full">
              <Button variant="outline" className="w-full">
                View wallet
              </Button>
            </Link>
            <Link to="/pricing" className="w-full">
              <Button className="w-full">Buy coins</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.aside>
  );
};

const TestimonialsCarousel = ({ testimonials: data, activeIndex, onChange }) => {
  return (
    <div className="relative overflow-hidden">
      <div className="flex gap-6 transition-transform duration-500 ease-out" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
        {data.map((testimonial, idx) => (
          <Card
            key={testimonial.name}
            className="min-w-full bg-card/95 border border-border/60 p-0 shadow-[0_26px_88px_rgba(46,47,70,0.22)]"
          >
            <CardContent className="p-8 md:p-12 flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <Avatar className="size-16">
                  <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                  <AvatarFallback>{testimonial.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xl font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-lg leading-relaxed text-foreground/90">
                {testimonial.feedback}
              </p>
              <div className="flex items-center gap-2 text-secondary font-semibold text-sm uppercase tracking-[0.18em]">
                <ShieldCheck className="size-4" />
                {testimonial.stat}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-6 flex justify-center gap-3">
        {data.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onChange(idx)}
            className={`h-2.5 rounded-full transition-all duration-300 ${idx === activeIndex ? "w-10 bg-secondary" : "w-3 bg-border"}`}
            aria-label={`View testimonial ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default function Home() {
  const { user } = useSelector((state) => state.user || {});
  const isAuthenticated = Boolean(user);
  const coinBalance = useMemo(() => {
    const possibleBalances = [
      user?.coinBalance,
      user?.coins,
      user?.wallet?.balance,
      user?.walletBalance,
    ].filter((value) => typeof value === "number" && !Number.isNaN(value));
    return possibleBalances.length ? possibleBalances[0] : 0;
  }, [user]);

  const displayName = useMemo(() => {
    return (
      user?.fullName ||
      user?.name ||
      [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
      user?.username ||
      null
    );
  }, [user]);

  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    if (!testimonials.length) return undefined;
    const timer = window.setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, AUTOPLAY_INTERVAL);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div id="top" className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#f9fafb] via-white to-[#eef1ff]">
      <GradientBackdrop />
      <StickyWalletCTA isAuthenticated={isAuthenticated} coinBalance={coinBalance} userName={displayName} />
      <header className="sticky top-0 z-40 border-b border-border/60 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 sm:px-8">
          <Link to="/" className="flex items-center gap-3 text-xl font-semibold text-primary md:text-2xl">
            <span className="flex size-11 items-center justify-center rounded-[var(--radius)] bg-gradient-to-br from-primary to-[#3b3c5c] text-primary-foreground shadow-[0_18px_50px_rgba(46,47,70,0.28)]">
              TS
            </span>
            TechSwap
          </Link>
          <nav className="hidden gap-7 text-sm font-medium text-foreground/75 md:flex">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="tracking-wide transition-colors hover:text-secondary">
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="hidden text-foreground/80 hover:text-secondary md:inline-flex">
                Log in
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" className="hidden md:inline-flex">
                Start Swapping
              </Button>
            </Link>
            <Link to="/register" className="md:hidden">
              <Button size="sm">Join</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="relative overflow-hidden">
          <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-10 px-5 py-16 sm:px-8 md:grid-cols-12 md:py-24 lg:py-28">
            <div className="md:col-span-7 xl:col-span-6">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="font-mono text-xs uppercase tracking-[0.3em] text-secondary"
              >
                Premium peer-to-peer mentorship
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 text-4xl font-semibold text-foreground md:text-5xl lg:text-[56px] lg:leading-[1.05]"
              >
                Swap skills. Share knowledge. Accelerate your tech career together.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 max-w-xl text-lg text-foreground/70"
              >
                TechSwap pairs elite engineers, analysts, and architects in a gamified, trusted ecosystem.
                Buy coins once, and unlock unlimited growth through 50-coin swap sessions.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8 flex flex-col gap-4 sm:flex-row"
              >
                <Link to="/register" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full gap-2">
                    Start free <ArrowRight className="size-4" />
                  </Button>
                </Link>
                <a href="#how-it-works" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full gap-2">
                    See how it works <PlayCircle className="size-5" />
                  </Button>
                </a>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3"
              >
                {heroMetrics.map((metric) => (
                  <Card key={metric.label} className="border border-border/50 bg-card/90 p-0 shadow-[0_18px_55px_rgba(46,47,70,0.16)]">
                    <CardContent className="p-6">
                      <p className="text-sm font-mono uppercase tracking-[0.2em] text-muted-foreground">
                        {metric.label}
                      </p>
                      <p className="mt-3 text-3xl font-semibold text-foreground">{metric.value}</p>
                      <p className="mt-2 text-sm text-foreground/65">{metric.sublabel}</p>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            </div>
            <div className="relative md:col-span-5 xl:col-span-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="relative flex h-full items-center justify-center"
              >
                <div className="relative w-full max-w-[520px] rounded-[var(--radius)] border border-border/50 bg-white/80 p-6 shadow-[0_45px_120px_rgba(46,47,70,0.24)] backdrop-blur-2xl">
                  <img src={heroIllustration} alt="TechSwap session preview" className="w-full rounded-[var(--radius)] shadow-[0_22px_60px_rgba(46,47,70,0.22)]" />
                  <div className="mt-4 grid gap-3">
                    <div className="flex items-center justify-between rounded-[var(--radius)] border border-border/50 bg-white/70 p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-12">
                          <AvatarImage src="https://i.pravatar.cc/150?img=51" alt="Swap partner" />
                          <AvatarFallback>SP</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold">Cloud Architect Swap</p>
                          <p className="text-xs font-mono uppercase tracking-[0.2em] text-secondary">
                            Session in progress · 44:12
                          </p>
                        </div>
                      </div>
                      <BadgeCheck className="size-5 text-secondary" />
                    </div>
                    <div className="rounded-[var(--radius)] border border-border/50 bg-gradient-to-br from-white via-white to-secondary/10 p-4">
                      <p className="text-sm text-foreground/70">
                        “Runtime insights on Kubernetes HPA thresholds saved my launch last night. Let’s review your observability setup next.”
                      </p>
                      <div className="mt-3 flex items-center justify-between text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">
                        <span>Coins remaining · 120</span>
                        <span>Swap streak · Day 18</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section id="features" className="relative border-t border-border/40 bg-white/80">
          <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-12 px-5 py-20 sm:px-8 md:grid-cols-12">
            <div className="md:col-span-5">
              <h2 className="text-3xl font-semibold text-foreground md:text-4xl">
                Stack Overflow doesn&apos;t solve everything.
              </h2>
              <p className="mt-4 text-lg text-foreground/70">
                High-signal mentorship demands trust, structure, and ownership. TechSwap pairs senior technologists
                for reciprocal, coin-backed exchanges that actually move careers.
              </p>
            </div>
            <div className="md:col-span-7">
              <div className="grid gap-6 md:grid-cols-2">
                {problemPoints.map((point) => (
                  <Card key={point.title} className="border border-border/50 bg-card/90 p-0 shadow-[0_22px_70px_rgba(46,47,70,0.16)]">
                    <CardContent className="p-6">
                      <div className="flex size-12 items-center justify-center rounded-[var(--radius)] bg-secondary/15 text-secondary">
                        <point.icon className="size-6" />
                      </div>
                      <h3 className="mt-5 text-xl font-semibold text-foreground">{point.title}</h3>
                      <p className="mt-3 text-sm text-foreground/70">{point.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <div className="md:col-span-12">
              <div className="grid gap-6 md:grid-cols-3">
                {solutionPillars.map((pillar) => (
                  <Card key={pillar.title} className="border border-border/50 bg-gradient-to-b from-white/90 to-secondary/5 p-0 shadow-[0_24px_80px_rgba(46,47,70,0.18)]">
                    <CardContent className="p-7">
                      <div className="flex size-12 items-center justify-center rounded-[var(--radius)] bg-accent/20 text-accent-foreground shadow-[0_16px_45px_rgba(56,249,215,0.22)]">
                        <pillar.icon className="size-6" />
                      </div>
                      <h3 className="mt-5 text-xl font-semibold text-foreground">{pillar.title}</h3>
                      <p className="mt-3 text-sm text-foreground/75">{pillar.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-10 flex flex-wrap gap-4 text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground">
                {brandBadges.map((badge) => (
                  <span key={badge} className="rounded-full border border-border/50 bg-white/70 px-5 py-2">
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="relative border-t border-border/30 bg-gradient-to-b from-white via-[#f5f6ff] to-[#eef2ff]">
          <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-secondary">Swap workflow · 4 steps</p>
              <h2 className="mt-4 text-3xl font-semibold md:text-4xl">
                Sign up ➝ shortlist ➝ secure ➝ swap
              </h2>
              <p className="mt-4 text-lg text-foreground/70">
                Every swap session is guarded by coins, trust signals, and a premium mentoring interface. Here’s the journey.
              </p>
            </div>
            <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {timelineSteps.map((step) => (
                <Card key={step.step} className="group border border-border/40 bg-card/95 p-0 shadow-[0_20px_70px_rgba(46,47,70,0.16)] transition-transform duration-300 hover:-translate-y-2">
                  <CardContent className="p-7">
                    <div className="flex items-center justify-between">
                      <div className="rounded-full border border-border/50 bg-white/90 px-4 py-2 font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
                        {step.step}
                      </div>
                      <div className="rounded-full bg-secondary/15 p-3 text-secondary">
                        <step.icon className="size-5" />
                      </div>
                    </div>
                    <h3 className="mt-6 text-xl font-semibold text-foreground">{step.title}</h3>
                    <p className="mt-3 text-sm text-foreground/70">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="relative border-t border-border/30 bg-white/90">
          <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 md:py-20">
            <div className="grid gap-10 md:grid-cols-4">
              {trustMetrics.map((metric) => (
                <div key={metric.label} className="rounded-[var(--radius)] border border-border/40 bg-white/80 p-6 text-center shadow-[0_16px_55px_rgba(46,47,70,0.12)] backdrop-blur-xl">
                  <p className="font-mono text-xs uppercase tracking-[0.26em] text-muted-foreground">
                    {metric.label}
                  </p>
                  <p className="mt-4 text-3xl font-semibold text-primary">{metric.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="community" className="relative border-t border-border/30 bg-gradient-to-b from-white via-[#f5f7ff] to-white">
          <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8">
            <div className="grid gap-12 md:grid-cols-12">
              <div className="md:col-span-5">
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-secondary">Community · Stories</p>
                <h2 className="mt-4 text-3xl font-semibold text-foreground md:text-4xl">
                  Top swappers leading the leaderboard.
                </h2>
                <p className="mt-4 text-lg text-foreground/70">
                  Earn badges, unlock cohorts, and see the impact of every session across engineering, data, DevOps, and product.
                </p>
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <Card className="border border-border/50 bg-card/95 p-0 shadow-[0_18px_60px_rgba(46,47,70,0.16)]">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-secondary/15 p-3 text-secondary">
                          <Trophy className="size-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">Top swappers leaderboard</p>
                          <p className="text-xs text-foreground/60">Updated every hour</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border border-border/50 bg-card/95 p-0 shadow-[0_18px_60px_rgba(46,47,70,0.16)]">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-secondary/15 p-3 text-secondary">
                          <Globe className="size-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">Global skill map</p>
                          <p className="text-xs text-foreground/60">90+ countries represented</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              <div className="md:col-span-7">
                <div className="grid gap-6 md:grid-cols-3">
                  {personaStories.map((story) => (
                    <Card key={story.name} className="border border-border/40 bg-card/95 p-0 shadow-[0_24px_70px_rgba(46,47,70,0.18)]">
                      <CardContent className="flex h-full flex-col gap-5 p-6">
                        <div className="flex items-center gap-4">
                          <Avatar className="size-12">
                            <AvatarImage src={story.avatar} alt={story.name} />
                            <AvatarFallback>{story.name.slice(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-lg font-semibold text-foreground">{story.name}</p>
                            <p className="text-xs text-foreground/60">{story.title}</p>
                          </div>
                        </div>
                        <p className="text-sm text-foreground/75">{story.quote}</p>
                        <div className="mt-auto rounded-[var(--radius)] border border-border/40 bg-secondary/10 px-4 py-3 text-xs font-mono uppercase tracking-[0.2em] text-secondary">
                          {story.impact}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative border-t border-border/30 bg-white/95">
          <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 md:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-secondary">Proof · Testimonials</p>
              <h2 className="mt-4 text-3xl font-semibold md:text-4xl">
                Outcome-driven swaps from elite tech professionals.
              </h2>
            </div>
            <div className="mt-12">
              <TestimonialsCarousel
                testimonials={testimonials}
                activeIndex={activeTestimonial}
                onChange={setActiveTestimonial}
              />
            </div>
          </div>
        </section>

        <section id="pricing" className="relative border-t border-border/30 bg-gradient-to-b from-white via-[#f4f5ff] to-[#eef2ff]">
          <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 md:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-secondary">Pricing · Coin-first</p>
              <h2 className="mt-4 text-3xl font-semibold md:text-4xl">
                You only pay to swap — not to belong.
              </h2>
              <p className="mt-4 text-lg text-foreground/70">
                Start free, then unlock premium features and coin bundles tailored to how you mentor and learn.
              </p>
            </div>
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {pricingTeaser.map((plan) => (
                <Card
                  key={plan.tier}
                  className={`border border-border/40 bg-card/95 p-0 shadow-[0_24px_80px_rgba(46,47,70,0.2)] ${plan.tier === "Pro" ? "md:-translate-y-4 md:border-secondary/70 md:shadow-[0_45px_120px_rgba(109,122,255,0.28)]" : ""}`}
                >
                  <CardContent className="flex h-full flex-col gap-6 p-8">
                    <div>
                      <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
                        {plan.tier}
                      </p>
                      <p className="mt-4 text-3xl font-semibold text-foreground">{plan.price}</p>
                      <p className="mt-2 text-sm text-foreground/65">{plan.headline}</p>
                    </div>
                    <ul className="space-y-3 text-sm text-foreground/75">
                      {plan.perks.map((perk) => (
                        <li key={perk} className="flex items-start gap-2">
                          <ShieldCheck className="mt-0.5 size-4 text-secondary" />
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto">
                      <Link to="/pricing">
                        <Button variant={plan.tier === "Pro" ? "default" : "outline"} className="w-full">
                          View plan
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-10 text-center text-sm text-muted-foreground">
              <p>Coin bundles: 100 coins – $9 · 250 coins – $20 · 500 coins – $39</p>
            </div>
          </div>
        </section>

        <section id="contact" className="relative border-t border-border/30 bg-gradient-to-r from-primary to-[#3b3c5c] text-primary-foreground">
          <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 md:py-24">
            <div className="grid gap-12 md:grid-cols-12">
              <div className="md:col-span-7">
                <h2 className="text-3xl font-semibold md:text-4xl">
                  Ready to unlock your next swap session?
                </h2>
                <p className="mt-4 max-w-xl text-lg text-primary-foreground/80">
                  Join TechSwap today and receive 25 bonus coins to light up your first premium mentorship exchange.
                </p>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <Link to="/register" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full gap-2 text-primary">
                      Claim 25 free coins <Sparkles className="size-4" />
                    </Button>
                  </Link>
                  <a href="mailto:support@techswap.io" className="w-full sm:w-auto">
                    <Button size="lg" variant="ghost" className="w-full border border-primary-foreground/20 text-primary-foreground hover:text-accent">
                      Talk to our team
                    </Button>
                  </a>
                </div>
              </div>
              <div className="md:col-span-5">
                <Card className="border border-white/30 bg-white/10 p-0 shadow-[0_26px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
                  <CardContent className="p-8">
                    <h3 className="text-xl font-semibold text-primary-foreground">Need support fast?</h3>
                    <p className="mt-3 text-sm text-primary-foreground/80">
                      Our concierge team responds within 12 hours. Live chat available M-F, 9am – 9pm GMT.
                    </p>
                    <div className="mt-6 space-y-3 text-sm text-primary-foreground/80">
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="size-5 text-accent" />
                        <span>Secured via Stripe + MongoDB Atlas</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Coins className="size-5 text-accent" />
                        <span>Transparent coin policy. No surprise fees.</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <LineChart className="size-5 text-accent" />
                        <span>Live swaps happening right now: 47</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 bg-[#0f172a] text-slate-100">
        <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8">
          <div className="grid gap-10 md:grid-cols-4">
            <div>
              <Link to="/" className="text-2xl font-semibold text-white">
                TechSwap
              </Link>
              <p className="mt-4 text-sm text-slate-300">
                Built with ❤️ by IT professionals. Empowering trusted, skill-based mentorship worldwide.
              </p>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-secondary">Product</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                <li><a href="#features" className="transition-colors hover:text-secondary">Features</a></li>
                <li><a href="#pricing" className="transition-colors hover:text-secondary">Pricing</a></li>
                <li><Link to="/login" className="transition-colors hover:text-secondary">Login</Link></li>
                <li><Link to="/register" className="transition-colors hover:text-secondary">Sign up</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-secondary">Resources</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                <li><a href="#how-it-works" className="transition-colors hover:text-secondary">How it works</a></li>
                <li><Link to="/blog" className="transition-colors hover:text-secondary">Insights</Link></li>
                <li><Link to="/community" className="transition-colors hover:text-secondary">Community</Link></li>
                <li><Link to="/support" className="transition-colors hover:text-secondary">Support</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-secondary">Connect</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                <li><a href="mailto:support@techswap.io" className="transition-colors hover:text-secondary">support@techswap.io</a></li>
                <li><a href="https://www.linkedin.com" target="_blank" rel="noreferrer" className="transition-colors hover:text-secondary">LinkedIn</a></li>
                <li><a href="https://twitter.com" target="_blank" rel="noreferrer" className="transition-colors hover:text-secondary">X / Twitter</a></li>
                <li><a href="https://github.com" target="_blank" rel="noreferrer" className="transition-colors hover:text-secondary">GitHub</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-white/10 pt-6 text-xs text-slate-500">
            © {new Date().getFullYear()} TechSwap. All rights reserved. Powered by Elite Mentorship Technologies.
          </div>
        </div>
      </footer>
    </div>
  );
}
