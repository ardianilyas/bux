"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "@/features/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { PricingSection } from "@/features/billing/components/pricing-section";

export function LandingView() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-lg font-bold text-primary-foreground">B</span>
            </div>
            <span className="text-xl font-semibold text-foreground">Bux</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {session?.user ? (
              <Button asChild variant="default" size="sm">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <Button asChild variant="default" size="sm">
                <Link href="/login">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16">
        <div className="max-w-3xl">
          <h1 className="text-6xl md:text-7xl font-bold text-foreground tracking-tight mb-6">
            Expense tracking,
            <br />
            simplified.
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
            Take control of your finances with Bux. Track expenses, set budgets,
            and gain insights into your spending habits.
          </p>
          <div className="flex items-center gap-4">
            <Button asChild size="lg">
              <Link href="/register">Get Started Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Feature 1 - Large */}
          <div className="md:col-span-2 lg:col-span-2 border border-border rounded-2xl p-8 hover:border-foreground/20 transition-colors">
            <div className="flex flex-col h-full">
              <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-foreground"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">
                Real-time Tracking
              </h3>
              <p className="text-muted-foreground text-lg mb-6">
                Track your expenses as they happen with instant updates and live
                summaries. Never lose sight of your spending.
              </p>
              <div className="mt-auto pt-4">
                <div className="h-32 rounded-xl bg-linear-to-br from-muted/50 to-muted border border-border" />
              </div>
            </div>
          </div>

          {/* Feature 2 - Small */}
          <div className="border border-border rounded-2xl p-8 hover:border-foreground/20 transition-colors">
            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-foreground"
              >
                <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
                <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              Categories
            </h3>
            <p className="text-muted-foreground">
              Organize expenses with custom categories and color-coded labels.
            </p>
          </div>

          {/* Feature 3 - Small */}
          <div className="border border-border rounded-2xl p-8 hover:border-foreground/20 transition-colors">
            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-foreground"
              >
                <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2h0V5z" />
                <path d="M2 9v1c0 1.1.9 2 2 2h1" />
                <path d="M16 11h0" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              Budget Control
            </h3>
            <p className="text-muted-foreground">
              Set monthly budgets and get alerts when you're approaching limits.
            </p>
          </div>

          {/* Feature 4 - Medium */}
          <div className="md:col-span-2 lg:col-span-2 border border-border rounded-2xl p-8 hover:border-foreground/20 transition-colors">
            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-foreground"
              >
                <path d="M3 3v16a2 2 0 0 0 2 2h16" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-foreground mb-3">
              Visual Insights
            </h3>
            <p className="text-muted-foreground text-lg">
              Beautiful charts and graphs help you understand your spending patterns
              at a glance.
            </p>
          </div>

          {/* Feature 5 - Small */}
          <div className="border border-border rounded-2xl p-8 hover:border-foreground/20 transition-colors">
            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-foreground"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              Secure & Private
            </h3>
            <p className="text-muted-foreground">
              Your financial data is encrypted and private. Only you have access.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* Footer */}
      <footer className="border-t border-border mt-24">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-lg font-bold text-primary-foreground">B</span>
              </div>
              <span className="text-xl font-semibold text-foreground">Bux</span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2026 Bux. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
