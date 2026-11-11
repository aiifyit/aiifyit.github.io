import type { NavItem, TeamMember, ProcessStep, Service, ResultStat, HeroStat, PrecisionBullet } from '../types';

export const CALENDLY_URL = "https://calendly.com/jon-aiifyit/30min";

// Retired homepage webhook. Public contact forms now post to OFFER_LEAD_ENDPOINT.
export const LEAD_WEBHOOK_URL = "https://jpronger1.app.n8n.cloud/webhook/7a8c25c7-bb38-450f-8341-9714f0f841a4";

export const NAV_ITEMS: NavItem[] = [
  { label: "How It Works", href: "#process" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Results", href: "#results" },
  { label: "Learn More", href: "#cta" },
];

export const HERO_EYEBROW = "Done-for-you AI agent swarms";
export const HERO_HEADLINE = "Do in Hours What Used to Take Months. Custom AI for Your Business.";
export const HERO_SUBHEADLINE =
  "We set it up, build with your executive team every week, and keep your agents on top of AI as it changes. The sign-up price is $10,000 per month per company account.";

export const HERO_BULLETS = [
  "Agent swarms aimed at your goals",
  "Co-managed by our expert AI management team",
  "Monthly group coaching and a members area included",
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
  "We're operators who got tired of tools that don't work. We've spent years inside real businesses — building, breaking, and rebuilding systems until they actually run day-in, day-out. AIify doesn't hand you a deck and walk away. We set up your AI agents ourselves, build with your team every week, and stay to make sure they keep working.";

export const TEAM_SUBHEADING =
  "We're proud of the people behind AIify — operators, builders, and problem-solvers who make sure your automation actually works.";

export const TEAM_MEMBERS: TeamMember[] = [
  { name: "Joshua Pellicer", title: "Founder & CEO", image: "/images/team/joshua.jpg" },
  { name: "Darius Mirshahzadeh", title: "Chairman of the Board", image: "/images/team/darius.jpg" },
  { name: "Sami Begg", title: "Head of AI Agent Development", image: "/images/team/sami.jpg" },
  { name: "Sara Flowers", title: "Chief of Staff", image: "/images/team/sara.jpg" },
];

export const PROCESS_HEADING = "Three Steps to a Fully";
export const PROCESS_SUBHEADING =
  "We do the setup and the building. You tell us what matters.";

export const PROCESS_STEPS: ProcessStep[] = [
  {
    number: "01",
    title: "We Learn Your Goals",
    description:
      "We meet your executives and their assistants, learn how the business runs, and decide where agents should work first.",
    iconName: "ClipboardCheck",
  },
  {
    number: "02",
    title: "We Build Your Swarm",
    description:
      "We set up the agents, connect them to your tools, and aim them at your goals.",
    iconName: "Bot",
  },
  {
    number: "03",
    title: "We Build With You Weekly",
    description:
      "Every week we build with your team, adjust the agents, and keep them on top of AI as it changes.",
    iconName: "Rocket",
  },
];

export const SERVICES_HEADING = "What's Included";
export const SERVICES_SUBHEADING =
  "Each company account covers your executives and their immediate assistants, like a chief of staff or executive assistant. Want more people covered? Add another account.";

export const SERVICES: Service[] = [
  {
    title: "Done-For-You Setup",
    description:
      "We set up your agent swarm and connect it to the tools your team already uses.",
    iconName: "Workflow",
  },
  {
    title: "Weekly Build Sessions",
    description:
      "We build with your team every week and point the agents at what matters now.",
    iconName: "TrendingUp",
  },
  {
    title: "Expert Co-Management",
    description:
      "Our AI management team watches the agents, fixes what breaks, and keeps them working.",
    iconName: "ShieldCheck",
  },
  {
    title: "Current With AI",
    description:
      "AI changes fast. We update your agents as new models and tools come out.",
    iconName: "Bot",
  },
];

export const SERVICES_FULL_WIDTH: Service = {
  title: "Coaching and Members Area",
  description:
    "Join a monthly group coaching call. Use the members area to ask questions, learn, and work with our team and other members to get the tools into daily use.",
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
  "Tell us about your business. The sign-up price is $10,000 per month per company account. Send us a message and we'll reply personally.";
