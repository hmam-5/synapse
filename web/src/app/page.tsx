"use client";

import { motion } from "framer-motion";
import { ArrowRight, Shield, Layers, Zap, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  return (
    <div className="flex-1 w-full bg-background relative overflow-hidden">
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0 flex justify-center overflow-hidden">
        <div className="w-[100vw] h-[100vh] absolute top-[-50vh] bg-primary/20 blur-[120px] rounded-full mix-blend-screen opacity-50" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-32 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-4xl mx-auto space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border backdrop-blur-sm shadow-sm mb-4">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium tracking-tight text-secondary-foreground">
              Synapse Platform v1.0 Live
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
            Enterprise Collaboration, <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
              Uncompromised.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A secure, highly scalable, multi-tenant workspace built for the most
            demanding enterprise teams. Engineered with advanced RBAC and compliance-ready infrastructure.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center rounded-lg px-8 py-4 font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5"
            >
              Start Free Trial <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center justify-center rounded-lg px-8 py-4 font-medium text-secondary-foreground bg-secondary hover:bg-secondary/80 transition-all shadow-sm hover:-translate-y-0.5"
            >
              Read Documentation
            </Link>
          </div>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 relative z-10"
        >
          <FeatureCard
            icon={<Shield className="w-6 h-6 text-primary" />}
            title="Enterprise Security"
            description="Fine-grained Role-Based Access Control (RBAC), Row Level Security, and custom JWT claims ensure your data is always protected."
          />
          <FeatureCard
            icon={<Layers className="w-6 h-6 text-primary" />}
            title="True Multi-Tenancy"
            description="Logical isolation per organization with seamless switching, custom domains, and isolated team environments out of the box."
          />
          <FeatureCard
            icon={<Zap className="w-6 h-6 text-primary" />}
            title="Lightning Fast"
            description="Built on Next.js App Router and optimized database schemas, guaranteeing sub-50ms query times at scale."
          />
        </motion.div>

        {/* Mockup or Interface Teaser */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
          className="mt-32 rounded-2xl border border-border/50 bg-card shadow-2xl overflow-hidden backdrop-blur-md relative"
        >
          <div className="h-12 border-b border-border bg-muted/30 flex items-center px-4 gap-2">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
            </div>
          </div>
          <div className="p-8 grid grid-cols-4 gap-6 h-[400px]">
            <div className="col-span-1 border-r border-border/50 pr-6 space-y-6">
              <div className="space-y-3">
                <div className="h-4 w-24 bg-muted rounded-md" />
                <div className="h-4 w-full bg-muted/50 rounded-md" />
                <div className="h-4 w-3/4 bg-muted/50 rounded-md" />
              </div>
              <div className="space-y-3 pt-6">
                <div className="h-4 w-16 bg-muted rounded-md" />
                <div className="h-4 w-full bg-muted/50 rounded-md" />
                <div className="h-4 w-4/5 bg-muted/50 rounded-md" />
              </div>
            </div>
            <div className="col-span-3 space-y-6">
              <div className="flex items-center justify-between">
                <div className="h-8 w-48 bg-muted rounded-md" />
                <div className="h-8 w-24 bg-primary/20 rounded-md" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 rounded-xl bg-muted/30 border border-border/50 p-4 space-y-3">
                    <div className="h-4 w-1/2 bg-muted rounded-md" />
                    <div className="h-12 w-full bg-muted/50 rounded-md" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow group">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed text-sm">
        {description}
      </p>
    </div>
  );
}
