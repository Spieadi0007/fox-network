"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { fadeInUp, scaleIn, staggerContainer, ease } from "@/lib/animations";
import { ArrowRight, CheckCircle2, Zap, Shield, Clock } from "lucide-react";
import { GridBackground } from "@/components/ui/grid-background";

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-16">
      {/* Animated grid background */}
      <div className="mesh-gradient pointer-events-none absolute inset-0" />
      <GridBackground />

      <Container className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-20">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex max-w-4xl flex-col items-center text-center"
        >
          {/* Pill badge */}
          <motion.div variants={fadeInUp}>
            <div className="inline-flex items-center gap-2 rounded-full border border-stone-200/80 bg-white/80 px-4 py-1.5 shadow-sm backdrop-blur-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium text-stone-600">
                Now in Early Access
              </span>
            </div>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            variants={fadeInUp}
            className="mt-8 font-[family-name:var(--font-heading)] text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.05] tracking-[-0.035em] text-stone-900"
          >
            The operating system
            <br />
            for{" "}
            <span className="text-gradient-fox">
              physical infrastructure
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={fadeInUp}
            className="mt-6 max-w-lg text-[17px] leading-[1.6] text-stone-500"
          >
            Manage your technicians, validate work with AI, and close jobs
            in minutes — not days. One command center for your entire field team.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeInUp} className="mt-10 flex flex-wrap items-center gap-3">
            <Button href="#cta" size="lg" className="bg-fox-orange text-white hover:bg-fox-orange/90 shadow-lg shadow-fox-orange/20">
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href="#how-it-works" variant="secondary" size="lg">
              Watch Demo
            </Button>
          </motion.div>

          {/* Trust signals */}
          <motion.div
            variants={fadeInUp}
            className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
          >
            {["No credit card required", "Setup in 5 minutes", "Cancel anytime"].map(
              (text) => (
                <span key={text} className="flex items-center gap-1.5 text-xs text-stone-400">
                  <CheckCircle2 className="h-3 w-3 text-stone-300" />
                  {text}
                </span>
              ),
            )}
          </motion.div>
        </motion.div>

        {/* Floating dashboard mockup */}
        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4, duration: 0.8, ease }}
          className="relative mt-20 w-full max-w-4xl"
        >
          {/* Glow behind card */}
          <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-b from-fox-orange/5 to-transparent blur-2xl" />

          <div className="relative rounded-2xl border border-stone-200/80 bg-white/80 shadow-2xl shadow-stone-200/40 backdrop-blur-xl">
            {/* Window chrome */}
            <div className="flex items-center gap-2 border-b border-stone-100 px-5 py-3">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-stone-200" />
                <div className="h-2.5 w-2.5 rounded-full bg-stone-200" />
                <div className="h-2.5 w-2.5 rounded-full bg-stone-200" />
              </div>
              <div className="mx-auto flex items-center gap-2 rounded-lg bg-stone-50 px-4 py-1">
                <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                <span className="text-[11px] font-medium text-stone-400">app.foxnetwork.com</span>
              </div>
            </div>

            {/* Dashboard content */}
            <div className="p-6 sm:p-8">
              {/* Top bar */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-stone-400">Dashboard</p>
                  <p className="mt-0.5 text-lg font-semibold tracking-tight text-stone-900">Your Team&apos;s Jobs</p>
                </div>
                <div className="flex gap-2">
                  <div className="rounded-lg border border-stone-100 bg-stone-50 px-3 py-1.5">
                    <span className="text-[11px] font-medium text-stone-500">Today</span>
                  </div>
                  <div className="rounded-lg bg-fox-orange/10 px-3 py-1.5">
                    <span className="text-[11px] font-medium text-fox-orange">Live</span>
                  </div>
                </div>
              </div>

              {/* Stat row */}
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { icon: Zap, label: "Jobs Today", value: "24", change: "+12%", color: "text-fox-orange", bg: "bg-fox-orange/8" },
                  { icon: Shield, label: "QA Pass Rate", value: "98.2%", change: "+3.1%", color: "text-emerald-600", bg: "bg-emerald-50" },
                  { icon: Clock, label: "Avg Close", value: "2.1h", change: "-18%", color: "text-blue-600", bg: "bg-blue-50" },
                  { icon: CheckCircle2, label: "Techs Active", value: "18", change: "On shift", color: "text-violet-600", bg: "bg-violet-50" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-stone-100 bg-white p-4">
                    <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${stat.bg}`}>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                    <p className="mt-3 text-2xl font-bold tracking-tight text-stone-900">{stat.value}</p>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-[11px] text-stone-400">{stat.label}</span>
                      <span className="text-[10px] font-medium text-emerald-600">{stat.change}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Fake job rows */}
              <div className="mt-6 space-y-2">
                {[
                  { id: "FOX-1247", tech: "M. Rodriguez", status: "In Progress", statusColor: "bg-fox-orange/10 text-fox-orange" },
                  { id: "FOX-1248", tech: "K. Patel", status: "Validated", statusColor: "bg-emerald-50 text-emerald-700" },
                  { id: "FOX-1249", tech: "J. Thompson", status: "Dispatched", statusColor: "bg-blue-50 text-blue-700" },
                ].map((job) => (
                  <div key={job.id} className="flex items-center justify-between rounded-lg border border-stone-100 px-4 py-3 transition-colors hover:bg-stone-50/50">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-medium text-stone-400">{job.id}</span>
                      <span className="text-sm text-stone-700">{job.tech}</span>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${job.statusColor}`}>
                      {job.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Floating accent cards */}
          <motion.div
            initial={{ opacity: 0, x: 20, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 1, duration: 0.6, ease }}
            className="absolute -right-4 top-16 hidden animate-float rounded-xl border border-stone-200/80 bg-white/90 px-4 py-3 shadow-lg backdrop-blur-sm lg:block"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50">
                <Shield className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-stone-700">AI Verified</p>
                <p className="text-[10px] text-stone-400">Just now</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20, y: -10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6, ease }}
            className="absolute -left-4 bottom-24 hidden animate-float-delay rounded-xl border border-stone-200/80 bg-white/90 px-4 py-3 shadow-lg backdrop-blur-sm lg:block"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-fox-orange/10">
                <Zap className="h-3.5 w-3.5 text-fox-orange" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-stone-700">Tech dispatched</p>
                <p className="text-[10px] text-stone-400">ETA: 23 min</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
