import { useEffect, useMemo, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  CloudCog,
  Download,
  FileCheck2,
  FileText,
  GraduationCap,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  Milestone,
  Pencil,
  Printer,
  Save,
  Send,
  ShieldCheck,
  TriangleAlert,
  Users,
} from 'lucide-react';
import Logo from '../components/ui/Logo';

type FieldType = 'text' | 'email' | 'date' | 'textarea' | 'choice';

type FieldDefinition = {
  id: string;
  label: string;
  type?: FieldType;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  options?: string[];
  wide?: boolean;
};

type SectionDefinition = {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  icon: LucideIcon;
  fields: FieldDefinition[];
};

type Answers = Record<string, string>;
type SaveState = 'saved' | 'saving';
type SubmitState = 'idle' | 'submitting' | 'success' | 'error';
type AuthUser = {
  sub: string;
  email: string;
  name: string;
  domain: string;
};
type AuthState =
  | { status: 'loading' }
  | { status: 'anonymous' }
  | { status: 'authenticated'; user: AuthUser };

const STORAGE_KEY_PREFIX = 'aiify-sow-discovery-draft-v1';

const sections: SectionDefinition[] = [
  {
    id: 'project',
    title: 'Project foundation',
    shortTitle: 'Project',
    description: 'Anchor the engagement to a clear client, owner, objective, and approved use case.',
    icon: BriefcaseBusiness,
    fields: [
      { id: 'projectName', label: 'Project name', placeholder: 'e.g. Client Intake Automation', required: true },
      { id: 'clientLegalName', label: 'Client legal name', placeholder: 'Full contracting entity', required: true },
      { id: 'clientContactName', label: 'Primary client contact', placeholder: 'Full name', required: true },
      { id: 'clientContactTitle', label: 'Client contact title', placeholder: 'Role or department', required: true },
      { id: 'clientContactEmail', label: 'Client contact email', type: 'email', placeholder: 'name@company.com', required: true },
      { id: 'consultantOwner', label: 'AIify engagement owner', placeholder: 'Responsible lead', required: true },
      {
        id: 'businessObjective',
        label: 'Specific business objective',
        type: 'textarea',
        placeholder: 'What measurable business outcome is this project intended to create?',
        hint: 'State the problem, desired outcome, and why the work matters now.',
        required: true,
        wide: true,
      },
      {
        id: 'approvedUseCase',
        label: 'Approved use case',
        type: 'textarea',
        placeholder: 'Describe the exact workflow or capability approved for this engagement.',
        required: true,
        wide: true,
      },
      {
        id: 'successMeasures',
        label: 'Business success measures',
        type: 'textarea',
        placeholder: 'e.g. Reduce handling time by 40%, eliminate duplicate entry, improve response time to under 5 minutes',
        required: true,
        wide: true,
      },
    ],
  },
  {
    id: 'scope',
    title: 'Scope, deliverables & people',
    shortTitle: 'Scope',
    description: 'Define exactly what AIify will provide, who owns each output, and who is responsible for the work.',
    icon: Users,
    fields: [
      {
        id: 'scopeOfServices',
        label: 'Scope of services',
        type: 'textarea',
        placeholder: 'Describe the services AIify will perform from discovery through handoff.',
        required: true,
        wide: true,
      },
      {
        id: 'namedDeliverables',
        label: 'Named deliverables and ownership',
        type: 'textarea',
        placeholder: 'List each deliverable, its format, owner, and whether it is Client IP, AIify pre-existing IP, or jointly developed.',
        hint: 'Use one line per deliverable when possible.',
        required: true,
        wide: true,
      },
      {
        id: 'consultantPersonnel',
        label: 'Key AIify personnel',
        type: 'textarea',
        placeholder: 'Names, roles, responsibilities, and expected involvement.',
        required: true,
      },
      {
        id: 'clientPersonnel',
        label: 'Key client personnel',
        type: 'textarea',
        placeholder: 'Names or roles, decision authority, and expected involvement.',
        required: true,
      },
      {
        id: 'preExistingIp',
        label: 'Consultant pre-existing IP',
        type: 'textarea',
        placeholder: 'Frameworks, templates, code, prompts, libraries, or methods AIify will bring to the project. Enter “None” with explanation if not applicable.',
        required: true,
        wide: true,
      },
    ],
  },
  {
    id: 'technology',
    title: 'Technology & architecture',
    shortTitle: 'Technology',
    description: 'Record the approved stack, integrations, vendors, and locations before implementation begins.',
    icon: CloudCog,
    fields: [
      {
        id: 'technicalArchitecture',
        label: 'Technical architecture',
        type: 'textarea',
        placeholder: 'Describe the proposed end-to-end architecture, data flow, and major components.',
        required: true,
        wide: true,
      },
      { id: 'systemsInvolved', label: 'Systems involved', type: 'textarea', placeholder: 'Client systems, APIs, databases, CRMs, communication tools, and other integrations.', required: true },
      { id: 'approvedModels', label: 'Approved AI models', type: 'textarea', placeholder: 'Model/provider, version if known, and intended use.', required: true },
      { id: 'approvedAiTools', label: 'Approved AI tools', type: 'textarea', placeholder: 'Agents, assistants, vector stores, evaluation tools, or other AI services.', required: true },
      { id: 'automationPlatforms', label: 'Automation platforms', type: 'textarea', placeholder: 'e.g. Make, Zapier, n8n, custom orchestration', required: true },
      { id: 'hostingEnvironments', label: 'Hosting environments', type: 'textarea', placeholder: 'Provider, account owner, environments, and runtime.', required: true },
      { id: 'hostingLocations', label: 'Hosting and data locations', type: 'textarea', placeholder: 'Regions/countries where workloads and data will be hosted.', required: true },
      { id: 'thirdPartyServices', label: 'Third-party services and subprocessors', type: 'textarea', placeholder: 'Vendor, purpose, data handled, and approval status.', required: true, wide: true },
    ],
  },
  {
    id: 'data',
    title: 'Data, security & compliance',
    shortTitle: 'Security',
    description: 'Classify the data involved and capture every control required for safe delivery.',
    icon: ShieldCheck,
    fields: [
      {
        id: 'clientDataCategories',
        label: 'Client data categories',
        type: 'textarea',
        placeholder: 'List all data that will be accessed, generated, transferred, stored, or processed.',
        required: true,
        wide: true,
      },
      { id: 'phiInvolved', label: 'Protected Health Information (PHI)', type: 'choice', options: ['No', 'Yes', 'To be confirmed'], required: true },
      { id: 'piiInvolved', label: 'Personally Identifiable Information (PII)', type: 'choice', options: ['No', 'Yes', 'To be confirmed'], required: true },
      { id: 'confidentialInfoInvolved', label: 'Other confidential information', type: 'choice', options: ['No', 'Yes', 'To be confirmed'], required: true },
      { id: 'sensitiveDataDetails', label: 'Sensitive data details', type: 'textarea', placeholder: 'For every “Yes” or “To be confirmed,” describe the data, source, purpose, volume, and handling constraints.', required: true, wide: true },
      { id: 'securityControls', label: 'Required security controls', type: 'textarea', placeholder: 'Access control, encryption, secrets management, logging, vulnerability management, incident response, etc.', required: true },
      { id: 'privacyControls', label: 'Required privacy controls', type: 'textarea', placeholder: 'Minimization, consent, notices, residency, retention, deletion, DPA/BAA needs, etc.', required: true },
      { id: 'complianceControls', label: 'Applicable compliance requirements', type: 'textarea', placeholder: 'e.g. HIPAA, SOC 2, GDPR, CCPA/CPRA, PCI DSS, client policies', required: true },
      { id: 'retentionDeletion', label: 'Retention and deletion requirements', type: 'textarea', placeholder: 'Retention periods, deletion triggers, backups, and recordkeeping.', required: true, wide: true },
    ],
  },
  {
    id: 'delivery',
    title: 'Milestones & responsibilities',
    shortTitle: 'Delivery',
    description: 'Create a realistic delivery path with dates, dependencies, and named responsibilities on both sides.',
    icon: Milestone,
    fields: [
      { id: 'targetStartDate', label: 'Target start date', type: 'date', required: true },
      { id: 'targetProductionDate', label: 'Target production date', type: 'date', required: true },
      {
        id: 'milestones',
        label: 'Milestones and target dates',
        type: 'textarea',
        placeholder: 'List each milestone, target date, output, and decision gate.',
        required: true,
        wide: true,
      },
      { id: 'clientDependencies', label: 'Client dependencies', type: 'textarea', placeholder: 'Access, data, SMEs, approvals, environments, procurement, and other prerequisites.', required: true },
      { id: 'consultantResponsibilities', label: 'AIify responsibilities', type: 'textarea', placeholder: 'Specific responsibilities AIify owns throughout delivery.', required: true },
      { id: 'clientResponsibilities', label: 'Client responsibilities', type: 'textarea', placeholder: 'Specific responsibilities the client owns throughout delivery.', required: true },
      { id: 'scheduleRisks', label: 'Known schedule risks', type: 'textarea', placeholder: 'Likely blockers, decision deadlines, or external timing constraints.', required: true },
    ],
  },
  {
    id: 'acceptance',
    title: 'Acceptance & testing',
    shortTitle: 'Acceptance',
    description: 'Make “done” objective, testable, and tied to a clear approval process.',
    icon: ClipboardCheck,
    fields: [
      { id: 'acceptanceCriteria', label: 'Objective acceptance criteria', type: 'textarea', placeholder: 'Define measurable pass/fail conditions for each deliverable.', required: true, wide: true },
      { id: 'testPlan', label: 'Test plan and planning procedures', type: 'textarea', placeholder: 'Test types, scenarios, environments, data, owners, and evidence required.', required: true, wide: true },
      { id: 'acceptanceProcess', label: 'Acceptance process', type: 'textarea', placeholder: 'Review window, feedback method, remediation rules, retest, and deemed-acceptance terms.', required: true },
      { id: 'acceptanceApprover', label: 'Client acceptance approver', placeholder: 'Name, title, or authorized role', required: true },
    ],
  },
  {
    id: 'production',
    title: 'Production readiness',
    shortTitle: 'Production',
    description: 'Plan deployment, rollback, change control, and required approvals before go-live.',
    icon: Bot,
    fields: [
      { id: 'deploymentPlan', label: 'Production deployment plan', type: 'textarea', placeholder: 'Steps, owner, timing, environment checks, communication, and validation.', required: true, wide: true },
      { id: 'rollbackPlan', label: 'Rollback procedures', type: 'textarea', placeholder: 'Rollback triggers, steps, owner, recovery targets, and client communication.', required: true, wide: true },
      { id: 'changeManagement', label: 'Change-management requirements', type: 'textarea', placeholder: 'Approvals, maintenance windows, release records, stakeholder notices, and controls.', required: true },
      { id: 'productionApprovals', label: 'Approvals required before production', type: 'textarea', placeholder: 'Security, legal, compliance, business owner, IT, procurement, or other sign-offs.', required: true },
    ],
  },
  {
    id: 'enablement',
    title: 'Handoff, support & maintenance',
    shortTitle: 'Handoff',
    description: 'Define how the client will operate the solution and what ongoing work is included.',
    icon: GraduationCap,
    fields: [
      { id: 'documentationRequirements', label: 'Documentation requirements', type: 'textarea', placeholder: 'Technical, user, admin, runbook, architecture, and operational documents.', required: true },
      { id: 'trainingRequirements', label: 'Training requirements', type: 'textarea', placeholder: 'Audiences, format, number of sessions, materials, and recording needs.', required: true },
      { id: 'knowledgeTransfer', label: 'Knowledge-transfer requirements', type: 'textarea', placeholder: 'Handoff sessions, shadowing, ownership transfer, and readiness checks.', required: true },
      { id: 'includedMeetings', label: 'Included meetings', type: 'textarea', placeholder: 'Cadence, duration, attendees, and number of sessions included.', required: true },
      { id: 'offlineWork', label: 'Included offline work', type: 'textarea', placeholder: 'Expected analysis, configuration, development, testing, and documentation outside meetings.', required: true },
      { id: 'supportHours', label: 'Included support hours', type: 'textarea', placeholder: 'Hours, channels, response windows, coverage period, and escalation path.', required: true },
      { id: 'maintenanceObligations', label: 'Monthly maintenance obligations', type: 'textarea', placeholder: 'Monitoring, updates, fixes, optimization, reporting, and explicit limits.', required: true, wide: true },
    ],
  },
  {
    id: 'commercial',
    title: 'Commercial terms & boundaries',
    shortTitle: 'Commercial',
    description: 'Document the financial model, change controls, assumptions, exclusions, and final approvals.',
    icon: CircleDollarSign,
    fields: [
      { id: 'thirdPartyCosts', label: 'Third-party products and recurring costs', type: 'textarea', placeholder: 'Software, subscriptions, licenses, hosting, usage fees, and estimated amounts.', required: true, wide: true },
      { id: 'includedCosts', label: 'Costs included in the monthly fee', type: 'textarea', placeholder: 'Identify included products, usage allowances, licenses, and hosting.', required: true },
      { id: 'separateApprovalCosts', label: 'Costs requiring separate client approval', type: 'textarea', placeholder: 'Approval threshold, owner, timing, and billing method.', required: true },
      { id: 'fees', label: 'Fees and pricing structure', type: 'textarea', placeholder: 'Implementation, recurring, milestone, usage-based, or other fees.', required: true },
      { id: 'invoiceTriggers', label: 'Invoice triggers and payment schedule', type: 'textarea', placeholder: 'Dates, milestones, acceptance events, deposits, and payment terms.', required: true },
      { id: 'approvedExpenses', label: 'Approved expenses', type: 'textarea', placeholder: 'Categories, limits, pre-approval rules, and reimbursement process.', required: true },
      { id: 'changeOrderProcess', label: 'Change-order process', type: 'textarea', placeholder: 'How scope changes are requested, estimated, approved, scheduled, and billed.', required: true, wide: true },
      { id: 'assumptions', label: 'Assumptions', type: 'textarea', placeholder: 'Conditions relied upon for scope, pricing, staffing, and schedule.', required: true },
      { id: 'exclusions', label: 'Exclusions and out-of-scope items', type: 'textarea', placeholder: 'State what is expressly not included in this SOW.', required: true },
      { id: 'additionalRequirements', label: 'Additional project-specific requirements', type: 'textarea', placeholder: 'Any other requirements agreed by the parties. Enter “None” if not applicable.', required: true },
      { id: 'finalApprovals', label: 'Final SOW approvers', type: 'textarea', placeholder: 'Names or roles authorized to approve the SOW for each party.', required: true, wide: true },
    ],
  },
];

const allFields = sections.flatMap((section) => section.fields);
const requiredFields = allFields.filter((field) => field.required);

function getInitialAnswers(storageKey: string): Answers {
  const empty = Object.fromEntries(allFields.map((field) => [field.id, '']));

  try {
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return empty;
    return { ...empty, ...JSON.parse(saved) as Answers };
  } catch {
    return empty;
  }
}

function AuthLoadingScreen() {
  return (
    <div className="grid min-h-screen place-items-center bg-[var(--color-bg)] px-6">
      <div className="text-center">
        <LoaderCircle size={28} className="mx-auto animate-spin text-[var(--color-accent)]" />
        <p className="mt-4 text-sm text-zinc-500">Checking secure access…</p>
      </div>
    </div>
  );
}

function GoogleLoginScreen() {
  const authError = new URLSearchParams(window.location.search).get('auth_error');
  const domainRejected = authError === 'domain';

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-[var(--color-bg)] px-5 py-12">
      <div aria-hidden="true" className="absolute inset-0 -z-0 opacity-70" style={{ background: 'radial-gradient(circle at 50% 10%, rgba(163, 215, 226, .13), transparent 40%)' }} />
      <main className="relative z-10 w-full max-w-md rounded-3xl border border-[var(--color-border-subtle)] bg-[#111113]/90 p-7 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-9">
        <a href="/" aria-label="AIify home" className="inline-flex"><Logo className="h-10" /></a>
        <div className="mt-10 grid h-12 w-12 place-items-center rounded-2xl border border-[var(--color-accent)]/30 bg-[var(--color-accent-glow)] text-[var(--color-accent)]">
          <LockKeyhole size={22} />
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">Private workspace</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50">SOW Discovery</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">Sign in with your AIify Google Workspace account to prepare and submit a new project brief.</p>

        {authError && (
          <div className="mt-6 flex gap-3 rounded-xl border border-amber-400/30 bg-amber-400/[0.07] p-4 text-sm leading-relaxed text-amber-100" role="alert">
            <TriangleAlert size={18} className="mt-0.5 shrink-0 text-amber-300" />
            <span>{domainRejected ? 'That Google account is not authorized. Select an @aiifyit.com account.' : 'Google sign-in could not be completed. Please try again.'}</span>
          </div>
        )}

        <a
          href="/api/auth/start"
          className="mt-7 flex w-full items-center justify-center gap-3 rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111113]"
        >
          <span aria-hidden="true" className="grid h-6 w-6 place-items-center rounded-full border border-zinc-200 font-bold text-[#4285f4]">G</span>
          Continue with Google
        </a>
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-600">
          <ShieldCheck size={14} />
          <span>Restricted to verified @aiifyit.com accounts</span>
        </div>
      </main>
    </div>
  );
}

export default function SowIntakePage() {
  const shouldUseSecureSubdomain = import.meta.env.PROD && ['aiifyit.com', 'www.aiifyit.com'].includes(window.location.hostname);
  const developmentBypass = import.meta.env.DEV && import.meta.env.VITE_SOW_DEV_AUTH === 'true';
  const [auth, setAuth] = useState<AuthState>(() => developmentBypass
    ? { status: 'authenticated', user: { sub: 'local-development', email: 'developer@aiifyit.com', name: 'Local Developer', domain: 'aiifyit.com' } }
    : { status: 'loading' });

  useEffect(() => {
    if (shouldUseSecureSubdomain) {
      window.location.replace('https://sow.aiifyit.com/');
      return;
    }
    if (developmentBypass) return;

    const controller = new AbortController();
    fetch('/api/auth/session', { credentials: 'same-origin', signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          setAuth({ status: 'anonymous' });
          return;
        }
        const body = await response.json() as { user?: AuthUser };
        setAuth(body.user ? { status: 'authenticated', user: body.user } : { status: 'anonymous' });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setAuth({ status: 'anonymous' });
      });

    return () => controller.abort();
  }, [developmentBypass, shouldUseSecureSubdomain]);

  if (shouldUseSecureSubdomain) return <AuthLoadingScreen />;
  if (auth.status === 'loading') return <AuthLoadingScreen />;
  if (auth.status === 'anonymous') return <GoogleLoginScreen />;
  return <SowWorkspace user={auth.user} />;
}

function FieldControl({
  field,
  value,
  onChange,
  missing,
}: {
  field: FieldDefinition;
  value: string;
  onChange: (value: string) => void;
  missing: boolean;
}) {
  const inputId = `sow-${field.id}`;
  const baseClasses = `w-full rounded-xl border bg-white/[0.035] px-4 py-3.5 text-[15px] text-[var(--color-text)] outline-none transition placeholder:text-zinc-600 focus:border-[var(--color-accent)] focus:ring-3 focus:ring-[var(--color-accent-glow)] ${
    missing ? 'border-amber-400/70' : 'border-[var(--color-border)]'
  }`;

  return (
    <div className={field.wide ? 'md:col-span-2' : ''}>
      <div className="mb-2 flex items-start justify-between gap-3">
        <label htmlFor={inputId} className="text-sm font-medium text-zinc-200">
          {field.label}
          {field.required && <span className="ml-1 text-[var(--color-accent)]" aria-hidden="true">*</span>}
        </label>
        {value.trim() && <Check size={16} className="mt-0.5 shrink-0 text-emerald-400" aria-label="Completed" />}
      </div>

      {field.type === 'textarea' ? (
        <textarea
          id={inputId}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          rows={5}
          aria-invalid={missing}
          className={`${baseClasses} min-h-32 resize-y leading-relaxed`}
        />
      ) : field.type === 'choice' ? (
        <div id={inputId} className="grid grid-cols-1 gap-2 sm:grid-cols-3" role="radiogroup" aria-label={field.label}>
          {field.options?.map((option) => {
            const selected = value === option;
            return (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange(option)}
                className={`rounded-xl border px-3 py-3 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${
                  selected
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent-glow)] text-[var(--color-text)]'
                    : 'border-[var(--color-border)] bg-white/[0.025] text-[var(--color-text-muted)] hover:border-zinc-500 hover:text-zinc-200'
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      ) : (
        <input
          id={inputId}
          type={field.type ?? 'text'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          aria-invalid={missing}
          className={baseClasses}
        />
      )}

      {field.hint && <p className="mt-2 text-xs leading-relaxed text-zinc-500">{field.hint}</p>}
      {missing && <p className="mt-2 text-xs text-amber-300">Required before this brief can be submitted.</p>}
    </div>
  );
}

function ProgressRing({ percent }: { percent: number }) {
  const circumference = 2 * Math.PI * 25;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative h-16 w-16 shrink-0" aria-label={`${percent}% complete`}>
      <svg viewBox="0 0 60 60" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="30" cy="30" r="25" fill="none" stroke="rgba(63,63,70,.7)" strokeWidth="5" />
        <circle
          cx="30"
          cy="30"
          r="25"
          fill="none"
          stroke="var(--color-accent)"
          strokeLinecap="round"
          strokeWidth="5"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-xs font-semibold text-zinc-100">{percent}%</span>
    </div>
  );
}

function SowWorkspace({ user }: { user: AuthUser }) {
  const storageKey = `${STORAGE_KEY_PREFIX}:${user.sub}`;
  const [answers, setAnswers] = useState<Answers>(() => getInitialAnswers(storageKey));
  const [currentStep, setCurrentStep] = useState(0);
  const [showMissing, setShowMissing] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>('saved');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const mainRef = useRef<HTMLElement>(null);

  const isReview = currentStep === sections.length;
  const currentSection = sections[Math.min(currentStep, sections.length - 1)];
  const answeredRequired = requiredFields.filter((field) => answers[field.id]?.trim()).length;
  const missingRequired = requiredFields.filter((field) => !answers[field.id]?.trim());
  const percentComplete = Math.round((answeredRequired / requiredFields.length) * 100);

  const sectionProgress = useMemo(() => {
    return Object.fromEntries(
      sections.map((section) => {
        const required = section.fields.filter((field) => field.required);
        const answered = required.filter((field) => answers[field.id]?.trim()).length;
        return [section.id, { answered, total: required.length, complete: answered === required.length }];
      }),
    );
  }, [answers]);

  useEffect(() => {
    document.title = 'SOW Discovery Workspace | AIify It';
    return () => {
      document.title = 'AIify It — AI Automation Consultancy | Custom AI Agents for Your Business';
    };
  }, []);

  useEffect(() => {
    setSaveState('saving');
    const timer = window.setTimeout(() => {
      window.localStorage.setItem(storageKey, JSON.stringify(answers));
      setSaveState('saved');
    }, 450);

    return () => window.clearTimeout(timer);
  }, [answers, storageKey]);

  const updateAnswer = (fieldId: string, value: string) => {
    setAnswers((current) => ({ ...current, [fieldId]: value }));
    setSubmitState('idle');
    setSubmitMessage('');
  };

  const moveToStep = (step: number) => {
    setCurrentStep(step);
    setShowMissing(false);
    window.requestAnimationFrame(() => mainRef.current?.focus());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const continueForward = () => {
    if (currentStep < sections.length) moveToStep(currentStep + 1);
  };

  const flagMissing = () => {
    setShowMissing(true);
    const firstMissing = missingRequired[0];
    if (firstMissing) {
      const owningSectionIndex = sections.findIndex((section) => section.fields.some((field) => field.id === firstMissing.id));
      moveToStep(owningSectionIndex);
      window.setTimeout(() => document.getElementById(`sow-${firstMissing.id}`)?.focus(), 250);
    }
  };

  const exportBrief = () => {
    const payload = {
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      status: missingRequired.length === 0 ? 'ready_for_sow_generation' : 'discovery_in_progress',
      sections: sections.map((section) => ({
        id: section.id,
        title: section.title,
        responses: Object.fromEntries(section.fields.map((field) => [field.label, answers[field.id]])),
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    const safeName = (answers.projectName || 'new-project').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    anchor.href = url;
    anchor.download = `${safeName || 'new-project'}-sow-discovery.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const submitBrief = async () => {
    if (missingRequired.length > 0) {
      flagMissing();
      return;
    }

    setSubmitState('submitting');
    setSubmitMessage('');

    try {
      const response = await fetch('/api/sow/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          schemaVersion: 1,
          submittedAt: new Date().toISOString(),
          answers,
        }),
      });

      if (!response.ok) throw new Error('Submission failed');
      setSubmitState('success');
      setSubmitMessage(`Discovery brief submitted. The SOW automation will send the completed document to ${answers.clientContactEmail}.`);
    } catch {
      setSubmitState('error');
      setSubmitMessage('The brief could not be submitted. Your draft remains saved; the SOW automation may still need to be connected.');
    }
  };

  const signOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
    } finally {
      window.location.assign('/sow');
    }
  };

  return (
    <div className="sow-app min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <header className="sticky top-0 z-40 border-b border-[var(--color-border-subtle)] bg-[#09090b]/90 backdrop-blur-xl print:hidden">
        <div className="mx-auto flex h-18 max-w-[1500px] items-center gap-4 px-5 lg:px-8">
          <a href="/" aria-label="AIify home" className="flex shrink-0 items-center">
            <Logo className="h-9" />
          </a>
          <div className="hidden h-7 w-px bg-[var(--color-border)] sm:block" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-100">SOW Discovery Workspace</p>
            <p className="hidden text-xs text-zinc-500 sm:block">Internal · New build outline</p>
          </div>
          <div className="ml-auto flex items-center gap-3 sm:gap-5">
            <div className="hidden items-center gap-2 text-xs text-zinc-500 md:flex">
              {saveState === 'saving' ? <LoaderCircle size={14} className="animate-spin" /> : <Save size={14} />}
              <span>{saveState === 'saving' ? 'Saving…' : 'Draft saved'}</span>
            </div>
            <div className="hidden text-right sm:block">
              <p className="max-w-48 truncate text-xs font-medium text-zinc-300">{user.name}</p>
              <p className="max-w-48 truncate text-[11px] text-zinc-600">{user.email}</p>
            </div>
            <button type="button" onClick={signOut} className="grid h-9 w-9 place-items-center rounded-lg border border-zinc-800 text-zinc-500 transition hover:border-zinc-600 hover:text-zinc-100" aria-label="Sign out">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] lg:grid-cols-[290px_minmax(0,1fr)]">
        <aside className="hidden min-h-[calc(100vh-72px)] border-r border-[var(--color-border-subtle)] px-5 py-8 lg:block print:hidden">
          <div className="mb-8 flex items-center gap-4 rounded-2xl border border-[var(--color-border-subtle)] bg-white/[0.025] p-4">
            <ProgressRing percent={percentComplete} />
            <div>
              <p className="text-sm font-semibold text-zinc-100">Brief progress</p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500">{answeredRequired} of {requiredFields.length} required fields</p>
            </div>
          </div>

          <nav aria-label="SOW discovery sections" className="space-y-1">
            {sections.map((section, index) => {
              const Icon = section.icon;
              const active = currentStep === index;
              const progress = sectionProgress[section.id];
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => moveToStep(index)}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${
                    active ? 'bg-[var(--color-accent-glow)] text-zinc-50' : 'text-zinc-500 hover:bg-white/[0.035] hover:text-zinc-200'
                  }`}
                >
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border ${active ? 'border-[var(--color-accent)]/50 text-[var(--color-accent)]' : 'border-zinc-800 text-zinc-600 group-hover:text-zinc-300'}`}>
                    {progress.complete ? <Check size={15} /> : <Icon size={15} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{section.shortTitle}</span>
                    <span className="mt-0.5 block text-[11px] text-zinc-600">{progress.answered}/{progress.total} complete</span>
                  </span>
                  {active && <ChevronRight size={14} className="text-[var(--color-accent)]" />}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => moveToStep(sections.length)}
              className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${
                isReview ? 'bg-[var(--color-accent-glow)] text-zinc-50' : 'text-zinc-500 hover:bg-white/[0.035] hover:text-zinc-200'
              }`}
            >
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border ${isReview ? 'border-[var(--color-accent)]/50 text-[var(--color-accent)]' : 'border-zinc-800 text-zinc-600 group-hover:text-zinc-300'}`}>
                <FileCheck2 size={15} />
              </span>
              <span className="text-sm font-medium">Review & submit</span>
            </button>
          </nav>

          <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-300">
              <LockKeyhole size={14} className="text-[var(--color-accent)]" />
              Private workspace
            </div>
            <p className="mt-2 text-xs leading-relaxed text-zinc-600">Signed in as {user.email}. Drafts are separated by company account on this device.</p>
          </div>
        </aside>

        <main ref={mainRef} tabIndex={-1} className="min-w-0 px-5 py-8 outline-none sm:px-8 lg:px-12 lg:py-12 xl:px-16">
          <div className="mx-auto max-w-5xl">
            <div className="mb-7 flex items-center gap-3 overflow-x-auto pb-2 lg:hidden print:hidden">
              {sections.map((section, index) => {
                const active = currentStep === index;
                const complete = sectionProgress[section.id].complete;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => moveToStep(index)}
                    aria-label={`Open ${section.title}`}
                    className={`h-2.5 min-w-10 flex-1 rounded-full transition ${active ? 'bg-[var(--color-accent)]' : complete ? 'bg-emerald-500/70' : 'bg-zinc-800'}`}
                  />
                );
              })}
              <button
                type="button"
                onClick={() => moveToStep(sections.length)}
                aria-label="Open review"
                className={`h-2.5 min-w-10 flex-1 rounded-full transition ${isReview ? 'bg-[var(--color-accent)]' : 'bg-zinc-800'}`}
              />
            </div>

            {!isReview ? (
              <>
                <div className="mb-8 border-b border-[var(--color-border-subtle)] pb-8">
                  <div className="mb-4 flex items-center gap-3 text-sm text-[var(--color-accent)]">
                    <span className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--color-accent)]/30 bg-[var(--color-accent-glow)]">
                      <currentSection.icon size={18} />
                    </span>
                    <span className="font-medium">Section {currentStep + 1} of {sections.length}</span>
                  </div>
                  <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">{currentSection.title}</h1>
                  <p className="mt-3 max-w-3xl text-base leading-relaxed text-[var(--color-text-muted)]">{currentSection.description}</p>
                </div>

                <div className="grid gap-x-6 gap-y-8 md:grid-cols-2">
                  {currentSection.fields.map((field) => (
                    <FieldControl
                      key={field.id}
                      field={field}
                      value={answers[field.id] ?? ''}
                      onChange={(value) => updateAnswer(field.id, value)}
                      missing={showMissing && Boolean(field.required) && !answers[field.id]?.trim()}
                    />
                  ))}
                </div>

                <div className="mt-12 flex flex-col-reverse gap-3 border-t border-[var(--color-border-subtle)] pt-6 sm:flex-row sm:items-center sm:justify-between print:hidden">
                  <button
                    type="button"
                    onClick={() => moveToStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] px-5 py-3 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <p className="text-center text-xs text-zinc-600 sm:text-right">You can return to incomplete fields anytime.</p>
                    <button
                      type="button"
                      onClick={continueForward}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-6 py-3 text-sm font-semibold text-[var(--color-bg)] transition hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
                    >
                      {currentStep === sections.length - 1 ? 'Review brief' : 'Save & continue'} <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <section>
                <div className="mb-8 flex flex-col gap-6 border-b border-[var(--color-border-subtle)] pb-8 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="mb-4 flex items-center gap-3 text-sm text-[var(--color-accent)]">
                      <span className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--color-accent)]/30 bg-[var(--color-accent-glow)]"><FileCheck2 size={18} /></span>
                      <span className="font-medium">Final review</span>
                    </div>
                    <h1 className="text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">Discovery brief</h1>
                    <p className="mt-3 max-w-2xl text-base leading-relaxed text-[var(--color-text-muted)]">Confirm every required detail before sending the brief into SOW generation.</p>
                  </div>
                  <div className="flex gap-2 print:hidden">
                    <button type="button" onClick={exportBrief} className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white">
                      <Download size={16} /> Export
                    </button>
                    <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white">
                      <Printer size={16} /> Print
                    </button>
                  </div>
                </div>

                <div className={`mb-8 flex items-start gap-4 rounded-2xl border p-5 ${missingRequired.length === 0 ? 'border-emerald-500/30 bg-emerald-500/[0.07]' : 'border-amber-400/30 bg-amber-400/[0.07]'}`}>
                  {missingRequired.length === 0 ? <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-400" size={22} /> : <TriangleAlert className="mt-0.5 shrink-0 text-amber-300" size={22} />}
                  <div className="flex-1">
                    <p className="font-medium text-zinc-100">{missingRequired.length === 0 ? 'Ready for SOW generation' : `${missingRequired.length} required ${missingRequired.length === 1 ? 'item needs' : 'items need'} attention`}</p>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-400">{missingRequired.length === 0 ? 'All minimum SOW requirements have a recorded response.' : 'The draft is saved, but it cannot be submitted until the remaining minimum requirements are completed.'}</p>
                  </div>
                  {missingRequired.length > 0 && (
                    <button type="button" onClick={flagMissing} className="hidden rounded-lg border border-amber-300/30 px-3 py-2 text-xs font-medium text-amber-200 hover:bg-amber-300/10 sm:block print:hidden">Complete fields</button>
                  )}
                </div>

                <div className="space-y-5">
                  {sections.map((section, sectionIndex) => {
                    const progress = sectionProgress[section.id];
                    return (
                      <article key={section.id} className="overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] bg-white/[0.02] print:break-inside-avoid">
                        <div className="flex items-center gap-4 border-b border-[var(--color-border-subtle)] px-5 py-4 sm:px-6">
                          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--color-accent-glow)] text-[var(--color-accent)]"><section.icon size={17} /></span>
                          <div className="flex-1">
                            <h2 className="text-base font-semibold text-zinc-100">{section.title}</h2>
                            <p className="mt-0.5 text-xs text-zinc-600">{progress.answered} of {progress.total} complete</p>
                          </div>
                          <button type="button" onClick={() => moveToStep(sectionIndex)} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-400 hover:bg-white/5 hover:text-white print:hidden"><Pencil size={13} /> Edit</button>
                        </div>
                        <dl className="grid gap-x-8 gap-y-6 p-5 sm:grid-cols-2 sm:p-6">
                          {section.fields.map((field) => (
                            <div key={field.id} className={field.wide ? 'sm:col-span-2' : ''}>
                              <dt className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-600">{field.label}</dt>
                              <dd className={`mt-2 whitespace-pre-wrap text-sm leading-relaxed ${answers[field.id]?.trim() ? 'text-zinc-300' : 'italic text-amber-300/80'}`}>{answers[field.id]?.trim() || 'Response required'}</dd>
                            </div>
                          ))}
                        </dl>
                      </article>
                    );
                  })}
                </div>

                <div className="mt-10 rounded-2xl border border-[var(--color-accent)]/25 bg-[linear-gradient(135deg,rgba(163,215,226,.09),rgba(255,255,255,.015))] p-6 sm:p-8 print:hidden">
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-accent)]"><FileText size={17} /> Next: generate the SOW</div>
                      <h2 className="mt-2 text-2xl font-semibold text-zinc-50">Send this brief to the automation</h2>
                      <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400">The approved project details will be transformed into a fully outlined SOW and emailed to the primary client contact.</p>
                    </div>
                    <button
                      type="button"
                      onClick={submitBrief}
                      disabled={submitState === 'submitting'}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-6 py-4 text-sm font-semibold text-[var(--color-bg)] transition hover:bg-[var(--color-accent-hover)] disabled:cursor-wait disabled:opacity-70"
                    >
                      {submitState === 'submitting' ? <LoaderCircle size={17} className="animate-spin" /> : <Send size={17} />}
                      {submitState === 'submitting' ? 'Submitting…' : 'Submit for SOW generation'}
                    </button>
                  </div>
                  {submitMessage && (
                    <div className={`mt-5 rounded-xl border px-4 py-3 text-sm ${submitState === 'success' ? 'border-emerald-500/30 bg-emerald-500/[0.08] text-emerald-200' : 'border-amber-400/30 bg-amber-400/[0.08] text-amber-200'}`} role="status">
                      {submitMessage}
                    </div>
                  )}
                </div>

                <button type="button" onClick={() => moveToStep(sections.length - 1)} className="mt-6 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-200 print:hidden"><ArrowLeft size={15} /> Back to final section</button>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
