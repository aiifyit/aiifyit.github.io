import type { NavItem, TeamMember, ProcessStep, Service, ResultStat, HeroStat, PrecisionBullet } from '../types';

export const CALENDLY_URL = "https://calendly.com/jon-aiifyit/30min";

// Webhook endpoint for lead form submissions — n8n production webhook routing to HubSpot.
export const LEAD_WEBHOOK_URL = "https://jpronger1.app.n8n.cloud/webhook/7a8c25c7-bb38-450f-8341-9714f0f841a4";

export const NAV_ITEMS: NavItem[] = [
  { label: "How It Works", href: "#process" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Results", href: "#results" },
  { label: "Learn More", href: "#cta" },
];

export const HERO_EYEBROW = "Want to Use AI in Your Business?";
export const HERO_HEADLINE = "We Got You.";
export const HERO_SUBHEADLINE =
  "Build Real AI Employees that Never Sleep. Massively cut costs, custom AI agents wired into your operations, hands-on implementation that never stops.";

export const HERO_BULLETS = [
  "We audit your workflows and fix what's costing you time & money",
  "We add custom AI agent employees to your specific operations",
  "We deploy, manage, and optimize them — ongoing, every week",
];

export const HERO_STATS: HeroStat[] = [
  { value: "Thousands", label: "of workflows built" },
  { value: "Up to 87%", label: "operational cost reduction" },
  { value: "Millions", label: "saved for clients" },
  { value: "Hundreds", label: "of agents deployed" },
];

export const SOCIAL_PROOF_LOGOS = [
  "Equity Prime Mortgage",
  "Inanna Manufacturing",
  "Powerlink",
  "Battalion",
  "Sonoma Wealth",
  "SLG Mortgage",
  "Trimerit",
  "Servebank",
  "Pro Legal Serve",
  "Genway Mortgage",
  "Burkland & Associates",
  "Sonoma Wealth Advisors",
];

export const ABOUT_SUBHEADING = "Built by Operators, for Operators";
export const ABOUT_BODY =
  "We're operators who got tired of tools that don't work. We've spent years inside real businesses — building, breaking, and rebuilding systems until they actually run day-in, day-out. AIify doesn't hand you a deck and walk away. We get inside your operations, build the AI agents ourselves, and stay to make sure they keep working.";

export const TEAM_MEMBERS: TeamMember[] = [
  { name: "Joshua Pellicer", title: "Founder & CEO", image: "/images/team/joshua.jpg" },
  { name: "Darius Mirshahzadeh", title: "Chairman of the Board", image: "/images/team/darius.jpg" },
  { name: "Sami Begg", title: "Head of AI Agent Development", image: "/images/team/sami.jpg" },
  { name: "Duncan Shea", title: "Director of Client Success", image: "/images/team/duncan-opt.jpg" },
  { name: "Jon Luisi", title: "Director of Business Development", image: "/images/team/john.jpeg" },
];

export const PROCESS_HEADING = "Three Steps to a Fully";
export const PROCESS_SUBHEADING =
  "Most firms know they need AI. What they don't have is someone who will get inside their operations, build it for them, and make sure it actually works and is never ending. That's what we do.";

export const PROCESS_STEPS: ProcessStep[] = [
  {
    number: "01",
    title: "The Workflow Audit",
    description:
      "We analyze your existing systems, identify the highest-impact automation opportunities, map out dependencies, and build a prioritized roadmap.",
    iconName: "ClipboardCheck",
  },
  {
    number: "02",
    title: "Custom AI Agent Build",
    description:
      "We build your AI agents from scratch, custom to your workflows. Every agent is tested, validated, and tuned before it touches production.",
    iconName: "Bot",
  },
  {
    number: "03",
    title: "Deploy, Manage, Optimize",
    description:
      "We deploy to your live environment, monitor performance, and optimize weekly. This isn't a handoff — it's ongoing.",
    iconName: "Rocket",
  },
];

export const SERVICES_HEADING = "What Happens When Nothing Falls Through the Cracks";
export const SERVICES_SUBHEADING =
  "Every document gets processed. Every lead followed up. Every compliance check run on time. We get inside your workflows and make sure nothing slips — from onboarding to financial review.";

export const SERVICES: Service[] = [
  {
    title: "Intelligent Process Automation",
    description:
      "Automate end-to-end document processing, data validation, client onboarding, and internal approvals. From raw input to fully processed output.",
    iconName: "Workflow",
  },
  {
    title: "Revenue & Pipeline Acceleration",
    description:
      "Auto-capture leads, enrich data, sequence outreach, and track conversion — AI that works your pipeline while your team focuses on closing.",
    iconName: "TrendingUp",
  },
  {
    title: "Compliance & Risk Automation",
    description:
      "Real-time compliance monitoring across documents, communications, and transactions. Automated flagging and audit trails.",
    iconName: "ShieldCheck",
  },
  {
    title: "Custom AI Agent Development",
    description:
      "Purpose-built AI agents designed for your specific operations, integrated directly into your existing systems.",
    iconName: "Bot",
  },
];

export const SERVICES_FULL_WIDTH: Service = {
  title: "Workflow Integration & API Connectivity",
  description:
    "We connect everything: APIs, data pipelines, third-party platforms, and internal tools into a unified automated workflow.",
  iconName: "Plug",
};

export const RESULTS_HEADING = "The Results Speak for Themselves";
export const RESULTS_SUBHEADING =
  "These aren't projections. This is what happens when AI agents are built right and managed continuously.";

export const RESULTS_STATS: ResultStat[] = [
  {
    value: 87,
    prefix: "Up to ",
    suffix: "%",
    description:
      "reduction in operational costs — total workflow cost that directly maps to fully staff time via automation tools.",
  },
  {
    value: 20,
    suffix: "+ hours",
    description:
      "reclaimed per team member per week — that's half the week, every week, redirected toward higher value.",
  },
  {
    value: 3,
    suffix: "x",
    description:
      "pipeline conversion improvement — workflows built to follow up, nurture, and close on timelines 24/7 via automated AI pipelines.",
  },
  {
    value: 60,
    suffix: "%",
    description:
      "reduction in compliance workload — auditing and flagging that takes weeks done in minutes. Eliminating human error and risk.",
  },
  {
    value: 90,
    suffix: "%+",
    description:
      "client retention rate — 9 in 10 clients that start with us continue with us to expand the custom intelligent AI pipelines.",
  },
];

export const PRECISION_HEADING = "Built to Run on Precision";
export const PRECISION_BODY =
  "AIify works with financial services firms, professional services firms, and growth-stage companies where accuracy, speed, and compliance aren't optional and never will be balanced.";

export const PRECISION_BULLETS: PrecisionBullet[] = [
  {
    title: "Financial advisory & wealth management",
    description:
      "AI for trading & investment risk monitoring, compliance, client onboarding, portfolio monitoring, and more",
  },
  {
    title: "Mortgage and lending",
    description:
      "AI-powered compliance processing, automated qualifying processing, document verification, rate optimization",
  },
  {
    title: "Healthcare",
    description:
      "Real-time insurance screening, credentialing, claim processing, and more",
  },
  {
    title: "Data and analytics",
    description:
      "AI-powered business intelligence, predictive analytics, custom reporting, scalable",
  },
  {
    title: "Platforms and marketplaces",
    description:
      "AI for managing, mapping, customer matching, and scaling — across right sectors and regions",
  },
];

export const PRECISION_CLOSING =
  "If your firm depends on workflows that have to be done right every time, we built this for you.";

export const CTA_HEADING = "Ready to";
export const CTA_SUBHEADING =
  "Book a free strategy call. We'll audit your workflows and show you exactly where AI can save you time and money.";
