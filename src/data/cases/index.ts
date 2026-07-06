import type { CaseDefinition } from '../caseTypes';
import { case01 } from './case01';
import { case02 } from './case02';
import { case03 } from './case03';

export const CASE_REGISTRY: Record<string, CaseDefinition> = {
  [case01.id]: case01,
  [case02.id]: case02,
  [case03.id]: case03,
};

export const CASE_LIST: CaseDefinition[] = [case01, case02, case03];

export function getCaseDefinition(caseId: string): CaseDefinition {
  const definition = CASE_REGISTRY[caseId];
  if (!definition) {
    throw new Error(`Unknown case id: ${caseId}`);
  }
  return definition;
}
