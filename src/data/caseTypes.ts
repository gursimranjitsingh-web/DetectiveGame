export type ClueType = 'knife' | 'note' | 'usb' | 'document' | 'laptop' | 'cans' | 'badge' | 'phone' | 'mug';

export type EvidenceCategory = 'physical' | 'digital' | 'testimony';

export interface EvidenceItem {
  id: string;
  name: string;
  desc: string;
  type: ClueType;
  position: [number, number, number];
  rotation?: [number, number, number];
  /** Where the item was found, e.g. "Mahi's desk". Surfaced in the inspect card and interrogation. */
  foundAt?: string;
  /** Loose grouping used to organise the evidence tray in the interrogation UI. */
  category?: EvidenceCategory;
  /** Marks contradiction-critical evidence so the UI can highlight it. */
  key?: boolean;
}

export interface EvidenceReaction {
  text: string;
  pressure: number;
  flag?: string;
}

export type SuspectTier = 'core' | 'background';

export interface CaseSuspect {
  id: string;
  name: string;
  role: string;
  alibi: string;
  questions: Record<string, string>;
  evidence: Record<string, EvidenceReaction>;
  /** 'core' suspects are real persons of interest; 'background' are office flavour. Defaults to 'core'. */
  tier?: SuspectTier;
  /** Which desk / room this person sits at, so evidence locations map to people. */
  desk?: string;
  /** Short motive / stake line shown on the suspect's profile. */
  motive?: string;
  /** One-line status the detective can see at a glance (e.g. "Prime suspect", "Alibi holds"). */
  standing?: string;
  /** Hue (0-360) used to generate a consistent avatar colour for this suspect. */
  portraitHue?: number;
  /** In-character brush-off when shown a piece of evidence they have no scripted reaction to. */
  defaultDeflection?: string;
}

export interface AccusationResult {
  outcome: 'win' | 'lose' | 'retry';
  dialogue: string;
}

export interface AccusationParams {
  suspect: CaseSuspect;
  pressure: number;
  caseNotes: string[];
}

export interface CaseDefinition {
  id: string;
  number: string;
  title: string;
  synopsis: string;
  introDialogue: string;
  /** Optional short list of investigative goals shown to the player. */
  objectives?: string[];
  playerBounds: { x: number; z: number };
  cameraStart: [number, number, number];
  questionLabels: Record<string, string>;
  evidenceItems: EvidenceItem[];
  suspects: CaseSuspect[];
  resolveAccusation: (params: AccusationParams) => AccusationResult;
}
