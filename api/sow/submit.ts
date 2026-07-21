import crypto from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isSameOrigin, readSession } from '../_lib/auth.js';

const REQUIRED_FIELDS = [
  'projectName', 'clientLegalName', 'clientContactName', 'clientContactTitle', 'clientContactEmail',
  'consultantOwner', 'businessObjective', 'approvedUseCase', 'successMeasures', 'scopeOfServices',
  'namedDeliverables', 'consultantPersonnel', 'clientPersonnel', 'preExistingIp', 'technicalArchitecture',
  'systemsInvolved', 'approvedModels', 'approvedAiTools', 'automationPlatforms', 'hostingEnvironments',
  'hostingLocations', 'thirdPartyServices', 'clientDataCategories', 'phiInvolved', 'piiInvolved',
  'confidentialInfoInvolved', 'sensitiveDataDetails', 'securityControls', 'privacyControls',
  'complianceControls', 'retentionDeletion', 'targetStartDate', 'targetProductionDate', 'milestones',
  'clientDependencies', 'consultantResponsibilities', 'clientResponsibilities', 'scheduleRisks',
  'acceptanceCriteria', 'testPlan', 'acceptanceProcess', 'acceptanceApprover', 'deploymentPlan',
  'rollbackPlan', 'changeManagement', 'productionApprovals', 'documentationRequirements',
  'trainingRequirements', 'knowledgeTransfer', 'includedMeetings', 'offlineWork', 'supportHours',
  'maintenanceObligations', 'thirdPartyCosts', 'includedCosts', 'separateApprovalCosts', 'fees',
  'invoiceTriggers', 'approvedExpenses', 'changeOrderProcess', 'assumptions', 'exclusions',
  'additionalRequirements', 'finalApprovals',
] as const;

function isAnswers(value: unknown): value is Record<string, string> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });
  if (!isSameOrigin(request)) return response.status(403).json({ error: 'Invalid request origin' });

  const user = await readSession(request);
  if (!user) return response.status(401).json({ error: 'Authentication required' });

  const answers = request.body?.answers;
  if (!isAnswers(answers)) return response.status(400).json({ error: 'Invalid discovery brief' });

  const missing = REQUIRED_FIELDS.filter((field) => typeof answers[field] !== 'string' || !answers[field].trim());
  if (missing.length > 0) return response.status(400).json({ error: 'Required responses are missing', missing });

  const webhookUrl = process.env.SOW_AUTOMATION_WEBHOOK_URL?.trim();
  if (!webhookUrl) return response.status(503).json({ error: 'SOW automation is not configured' });
  if (!webhookUrl.startsWith('https://')) return response.status(503).json({ error: 'SOW automation endpoint must use HTTPS' });

  const submissionId = crypto.randomUUID();
  const payload = {
    schemaVersion: 1,
    submissionId,
    submittedAt: new Date().toISOString(),
    submittedBy: user,
    answers,
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-AIify-Submission-Id': submissionId,
  };
  const webhookSecret = process.env.SOW_AUTOMATION_WEBHOOK_SECRET?.trim();
  if (webhookSecret) headers.Authorization = `Bearer ${webhookSecret}`;

  try {
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(20_000),
    });
    if (!webhookResponse.ok) return response.status(502).json({ error: 'SOW automation rejected the submission' });
    return response.status(202).json({ accepted: true, submissionId });
  } catch {
    return response.status(502).json({ error: 'SOW automation is temporarily unavailable' });
  }
}
