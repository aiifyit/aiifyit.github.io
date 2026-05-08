export interface NavItem {
  label: string;
  href: string;
}

export interface TeamMember {
  name: string;
  title: string;
  image: string;
  objectPosition?: string;
  scale?: number;
}

export interface ProcessStep {
  number: string;
  title: string;
  description: string;
  iconName: string;
}

export interface Service {
  title: string;
  description: string;
  iconName: string;
}

export interface ResultStat {
  value: number;
  prefix?: string;
  suffix?: string;
  description: string;
}

export interface HeroStat {
  value: string;
  label: string;
}

export interface PrecisionBullet {
  title: string;
  description: string;
}

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (opts: { url: string; parentElement: HTMLElement }) => void;
    };
  }
}
