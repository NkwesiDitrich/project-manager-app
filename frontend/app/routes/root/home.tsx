import React from "react";
import type { Route } from "../../+types/root";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Tasco" },
    { name: "description", content: "Welcome to Tasco!" },
  ];
}

const Homepage = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-28 -left-16 h-[360px] w-[360px] rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute right-0 top-24 h-[280px] w-[280px] rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/80 via-transparent to-transparent dark:from-slate-900/60" />
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-10 px-6 py-16 sm:px-10 lg:flex-row lg:items-stretch lg:gap-16 lg:py-24">
        <div className="flex w-full flex-1 flex-col justify-center gap-8">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur animate-in fade-in slide-in-from-top-2 duration-700">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Built for focused teams
          </div>

          <div className="space-y-5">
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl animate-in fade-in slide-in-from-left-4 duration-700">
              Plan. Track. Deliver.
              <span className="block text-primary">Your projects, beautifully organized.</span>
            </h1>
            <p className="text-pretty text-base text-muted-foreground sm:text-lg lg:text-xl animate-in fade-in slide-in-from-left-6 duration-700 delay-150">
              Tasco gives you a modern workspace for tasks, timelines, and team
              collaboration. Stay aligned, reduce noise, and ship with confidence.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center animate-in fade-in slide-in-from-left-8 duration-700 delay-200">
            <Link to="/sign-up" className="w-full sm:w-auto">
              <Button className="w-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform duration-300 hover:-translate-y-0.5 hover:bg-primary/90">
                Get Started
              </Button>
            </Link>
            <Link to="/sign-in" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full border-primary/30 bg-card/70 text-foreground backdrop-blur transition-colors duration-300 hover:border-primary/60 hover:bg-primary/10"
              >
                Sign In
              </Button>
            </Link>
          </div>

          <div className="grid w-full gap-4 sm:grid-cols-3 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
            <div className="rounded-2xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur">
              <p className="text-sm font-semibold">Smart Workflows</p>
              <p className="text-xs text-muted-foreground">Automate status updates and reminders.</p>
            </div>
            <div className="rounded-2xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur">
              <p className="text-sm font-semibold">Real-time Chat</p>
              <p className="text-xs text-muted-foreground">Keep every project decision in one place.</p>
            </div>
            <div className="rounded-2xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur">
              <p className="text-sm font-semibold">Insights Ready</p>
              <p className="text-xs text-muted-foreground">Track progress with clear visibility.</p>
            </div>
          </div>
        </div>

        <div className="flex w-full max-w-md flex-1 items-center justify-center lg:justify-end">
          <div className="relative w-full rounded-3xl border border-border bg-card/80 p-6 shadow-xl backdrop-blur animate-in fade-in slide-in-from-right-6 duration-700 delay-200">
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-2xl bg-primary/20 blur-2xl" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Dashboard</p>
                <p className="text-lg font-semibold">Q1 Launch Plan</p>
              </div>
              <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                78% done
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {[
                { label: "Research", value: "Complete" },
                { label: "Design", value: "In review" },
                { label: "Development", value: "In progress" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-border/70 bg-background/80 p-4">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span>{item.label}</span>
                    <span className="text-muted-foreground">{item.value}</span>
                  </div>
                  <div className="mt-3 h-2 w-full rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-primary" style={{ width: "72%" }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
              <span>Team momentum</span>
              <span className="font-semibold text-primary">+24% this week</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
