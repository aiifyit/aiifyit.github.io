export const BOOKING_SERVICES = {
  'workflow-automation': {
    label: 'Workflow automation',
    preparation: 'Pick one repeatable process and describe what starts it, who handles it, and what a successful finish looks like.',
  },
  'custom-ai-agents': {
    label: 'Custom AI agents',
    preparation: 'Choose one job for an agent, the information it needs, and the actions that should still require your approval.',
  },
  'workflow-integration': {
    label: 'Workflow integration',
    preparation: 'List the tools involved, what needs to pass between them, and where a handoff currently breaks down.',
  },
} as const;

export const BOOKING_PRIORITIES = {
  routing: {
    label: 'Improve routing reliability',
    preparation: 'Bring a redacted example of a request that reached the wrong destination and describe the route you expected.',
  },
  'manual-work': {
    label: 'Reduce repetitive manual work',
    preparation: 'Identify the manual step your team repeats most often and roughly how often it happens.',
  },
  integrations: {
    label: 'Connect existing tools',
    preparation: 'Identify which system should own the data and what should happen when a handoff fails.',
  },
  'new-agent': {
    label: 'Scope a new AI agent',
    preparation: 'Describe one useful first task, how you would judge its result, and when the agent should ask for help.',
  },
} as const;

export interface BookingContext {
  service?: keyof typeof BOOKING_SERVICES;
  priority?: keyof typeof BOOKING_PRIORITIES;
  source?: string;
}

// Never forward arbitrary query values, duplicate parameters, or free text.
export function parseBookingContext(search: string, publishedSlugs: readonly string[] = []): BookingContext {
  const params = new URLSearchParams(search);
  const singleValue = (key: string) => params.getAll(key).length === 1 ? params.get(key) : null;
  const service = singleValue('service');
  const priority = singleValue('priority');
  const source = singleValue('source');
  const context: BookingContext = {};

  if (service && Object.hasOwn(BOOKING_SERVICES, service)) {
    context.service = service as BookingContext['service'];
  }
  if (priority && Object.hasOwn(BOOKING_PRIORITIES, priority)) {
    context.priority = priority as BookingContext['priority'];
  }
  if (source && source.length <= 100 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(source) && publishedSlugs.includes(source)) {
    context.source = source;
  }

  return context;
}

export function createBookingUrl(calendlyUrl: string, context: BookingContext): string {
  const url = new URL(calendlyUrl);
  // These five tags contain only fixed choices and a verified public article slug.
  // Explicit values also keep unrelated inbound UTM parameters out of the handoff.
  url.searchParams.set('utm_source', 'aiifyit');
  url.searchParams.set('utm_medium', 'website');
  url.searchParams.set('utm_campaign', context.service ?? 'strategy-call');
  url.searchParams.set('utm_term', context.priority ?? 'general');
  url.searchParams.set('utm_content', context.source ?? 'direct');
  return url.toString();
}
