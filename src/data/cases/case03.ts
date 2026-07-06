import type { CaseDefinition, CaseSuspect } from '../caseTypes';

/*
 * CASE 03 — "The Last Case at Blackwood Manor"
 *
 * Eleanor Blackwood is shot dead the night Detective Adrian Cole is summoned. The manor
 * locks down; everyone is a suspect. Planted evidence frames Victor, but the real killer
 * is OLIVER GRANT (revenge + covering up embezzlement). Win by proving the frame-up is
 * fake AND tying the murder to Oliver (forged records + the voice recorder).
 */

const victor: CaseSuspect = {
  id: 'victor',
  name: 'Victor Blackwood',
  role: 'Eldest Son',
  tier: 'core',
  portraitHue: 8,
  standing: 'All the evidence points at him — which is exactly the problem.',
  motive: 'Drowning in gambling debts; argued with Eleanor that evening.',
  alibi: "Admits he argued with his mother, swears he left the hall before the shot.",
  defaultDeflection: "Victor: 'You think I'd be this obvious? Someone's setting me up.'",
  questions: {
    timeline: "Victor: 'We argued about money, yes. Everyone heard it — almost like it was meant to be heard.'",
    motive: "Victor: 'My debts aren't a secret. Killing Mother wouldn't clear them — her will would.'",
    midnight: "Victor: 'When the lights went out I was near the library. I never touched that revolver.'",
  },
  evidence: {
    revolver: { text: "Victor pales. 'Those are my prints, but I haven't held that gun in years. How are they even on it?'", pressure: 1, flag: "Victor can't explain his prints on the revolver — yet insists he never touched it." },
    footprints: { text: "Victor: 'Those are my shoes' size, sure. But I never went into the library tonight.'", pressure: 0 },
    gambling_note: { text: "Victor looks away. 'Fine — I owe a lot. That's motive, I know. It's also true.'", pressure: 1, flag: "Victor admits crushing gambling debts." },
    voice_recorder: { text: "Victor listens, stunned. 'That's not my voice arguing with her. That's Oliver.'", pressure: 0, flag: "Victor identifies the recorded voice as Oliver's, not his." },
  },
};

const clara: CaseSuspect = {
  id: 'clara',
  name: 'Clara Blackwood',
  role: 'The Artist',
  tier: 'core',
  portraitHue: 300,
  standing: 'Quiet, watchful. Hiding something personal.',
  motive: 'Secretly adopted — feared being cut from the family.',
  alibi: 'Says she was sketching in the greenhouse and heard the shot from far off.',
  defaultDeflection: "Clara: 'I keep to myself. I notice things, though.'",
  questions: {
    timeline: "Clara: 'I was in the greenhouse with my sketchbook. The rain was loud.'",
    motive: "Clara: 'You found out I was adopted. It doesn't make me a killer — it makes me the outsider who watches.'",
    midnight: "Clara: 'The gunshot came from the study side, not the hall. I'd swear to it.'",
  },
  evidence: {
    diary_page: { text: "Clara studies it. 'That's Mother's hand. Someone tore this out — they didn't want us reading it.'", pressure: 0, flag: 'Clara confirms the diary page was deliberately torn out.' },
    voice_recorder: { text: "Clara: 'I've heard Oliver use that exact tone with her. That's him.'", pressure: 0, flag: "Clara identifies the recorded voice as Oliver's." },
  },
};

const daniel: CaseSuspect = {
  id: 'daniel',
  name: 'Daniel Blackwood',
  role: 'The Lawyer',
  tier: 'core',
  portraitHue: 210,
  standing: 'Changed the will recently. Nervous about it.',
  motive: 'Rewrote Eleanor’s will days before her death.',
  alibi: 'Says he was in the dining room reviewing papers.',
  defaultDeflection: "Daniel: 'I advise on facts, detective. I'd suggest you stick to them too.'",
  questions: {
    timeline: "Daniel: 'Dining room, going over the estate papers. Alone, unfortunately for my alibi.'",
    motive: "Daniel: 'Yes, I amended the will. At Eleanor's instruction — she was cutting someone out.'",
    midnight: "Daniel: 'The new will removes a beneficiary for \"gross financial betrayal.\" She never told me the name.'",
  },
  evidence: {
    will_change: { text: "Daniel: 'This is the amendment. She struck out a beneficiary for theft. Read between the lines — it wasn't family.'", pressure: 1, flag: "The amended will cuts out someone for financial betrayal — pointing away from the family." },
    forged_records: { text: "Daniel frowns at the ledgers. 'These are doctored. Whoever stole from the company tried to bury it here.'", pressure: 0, flag: 'The financial records were forged to hide embezzlement.' },
  },
};

const martha: CaseSuspect = {
  id: 'martha',
  name: 'Martha Hayes',
  role: 'The Housekeeper',
  tier: 'core',
  portraitHue: 40,
  standing: 'Loyal for decades. Guarding old secrets.',
  motive: "Hiding letters from Eleanor's late husband.",
  alibi: 'Says she was in the kitchen preparing tea when the lights failed.',
  defaultDeflection: "Martha: 'I've served this family forty years. I keep confidences, not guns.'",
  questions: {
    timeline: "Martha: 'In the kitchen, kettle on, when the dark came. I nearly dropped the tray at the shot.'",
    motive: "Martha: 'The letters are Mr. Blackwood's, from before he passed. Private grief, nothing to do with murder.'",
    midnight: "Martha: 'I saw Mr. Grant slip toward the study just before the lights went. I thought nothing of it — then.'",
  },
  evidence: {
    letters: { text: "Martha clutches them. 'These are the late master's letters. I hid them to spare Eleanor's heart, not to hide a crime.'", pressure: 0, flag: "Martha's hidden letters are personal, unrelated to the murder." },
    footage_gap: { text: "Martha: 'Six minutes of cameras, gone? Only someone with the security codes could do that. Mr. Grant sets those.'", pressure: 1, flag: 'Only someone with security access (like Oliver) could delete the footage.' },
  },
};

const reed: CaseSuspect = {
  id: 'reed',
  name: 'Dr. Samuel Reed',
  role: 'Family Physician',
  tier: 'core',
  portraitHue: 160,
  standing: 'Altered medical records. Defensive.',
  motive: "Falsified Eleanor's medical history.",
  alibi: 'Says he was in the master bedroom fetching Eleanor’s medication.',
  defaultDeflection: "Dr. Reed: 'Patient confidentiality, detective. Some doors I won't open.'",
  questions: {
    timeline: "Dr. Reed: 'Upstairs in the master bedroom, getting her heart medication. She'd been unwell.'",
    motive: "Dr. Reed: 'I adjusted her records, yes — to hide how frail she was, at her own request. Vanity, not murder.'",
    midnight: "Dr. Reed: 'A gunshot is not a heart attack. Whoever did this wanted her death to look like anything but natural.'",
  },
  evidence: {
    medical_records: { text: "Dr. Reed sighs. 'Altered, I admit it. To protect her pride. It has nothing to do with a bullet.'", pressure: 0, flag: "Dr. Reed's record tampering was cosmetic, unrelated to the murder." },
    revolver: { text: "Dr. Reed: 'One shot, close range judging by the wound. Not fired \"across the room\" as it was staged to look.'", pressure: 1, flag: 'The wound shows a close-range shot — contradicting the staged across-the-room scene.' },
  },
};

const oliver: CaseSuspect = {
  id: 'oliver',
  name: 'Oliver Grant',
  role: "Eleanor's Assistant",
  tier: 'core',
  portraitHue: 265,
  standing: 'Helpful, composed — a little too composed.',
  motive: 'Appears to have none. In truth: revenge, and covering up stolen funds.',
  alibi: 'Says he was organizing Eleanor’s schedule in the grand hall the whole evening.',
  defaultDeflection: "Oliver: 'I only ever tried to help Eleanor. Whatever you've found, there'll be an innocent explanation.'",
  questions: {
    timeline: "Oliver: 'I was in the grand hall with her calendar. I saw nothing — the dark took us all by surprise.'",
    motive: "Oliver: 'Motive? I had none. She trusted me completely.' A muscle tightens in his jaw.",
    midnight: "Oliver: 'When the shot came I froze, like everyone. Then I helped carry... I mean, I helped where I could.'",
  },
  evidence: {
    footage_gap: { text: "Oliver: 'The cameras? A glitch, surely. I wouldn't know how to erase footage.' He knows the codes and everyone knows it.", pressure: 1, flag: "Oliver deflects on the deleted footage he alone had the access codes for." },
    forged_records: { text: "Oliver's smile slips. 'Those figures are... I'd have to review them.' He can't explain the missing funds.", pressure: 1, flag: 'Oliver cannot explain the forged records hiding the funds he embezzled.' },
    empty_safe: { text: "Oliver: 'Robbery, clearly. Someone emptied the safe.' He answers before you mention robbery.", pressure: 1, flag: 'Oliver volunteers a robbery motive before anyone suggested it.' },
    voice_recorder: { text: "Oliver goes white as his own voice plays, arguing with Eleanor moments before the shot. 'That... that proves nothing.'", pressure: 2, flag: "The voice recorder captures OLIVER arguing with Eleanor moments before the gunshot." },
    revolver: { text: "Oliver: 'Victor's prints are right there. Case closed, surely?' Eager to point at Victor.", pressure: 1, flag: "Oliver pushes the Victor theory hard — like he needs it to be true." },
  },
};

const suspects: CaseSuspect[] = [victor, clara, daniel, martha, reed, oliver];

export const case03: CaseDefinition = {
  id: 'case-03',
  number: '03',
  title: 'The Last Case at Blackwood Manor',
  synopsis:
    "It was raining the night Detective Adrian Cole received the letter: \"If you want the truth about the Blackwood family, come before midnight.\"\n\nSeven people waited in the grand hall. Then the lights went out, a gunshot rang through the mansion, and when the emergency lights flickered on, matriarch Eleanor Blackwood lay dead. The security doors sealed. No one leaves until morning.\n\nEveryone is a suspect — and everyone is hiding something. Search all eight rooms, gather the clues, and see past the trail someone laid so carefully. Not every secret is the murder.",
  introDialogue:
    "Explore the manor and collect every clue, then gather the household and present your evidence. The obvious suspect was framed — find the contradictions, unmask the real killer, and only accuse when the truth is airtight.",
  objectives: [
    'Search all eight rooms of Blackwood Manor for clues.',
    'Uncover each suspect’s secret — but tell which secrets tie to the murder.',
    'See through the frame-up and prove who really killed Eleanor.',
  ],
  playerBounds: { x: 21, z: 16 },
  cameraStart: [0, 1.7, 2],
  questionLabels: {
    timeline: 'That Night',
    motive: 'Their Secret',
    midnight: 'The Gunshot',
  },
  evidenceItems: [
    { id: 'revolver', name: 'The Revolver', type: 'knife', desc: 'A revolver with one bullet missing. Victor’s fingerprints are on it — almost too cleanly.', position: [1, 0.06, -11], rotation: [Math.PI / 2, 0, 0.4], foundAt: 'Study', category: 'physical', key: true },
    { id: 'footprints', name: 'Muddy Footprints', type: 'note', desc: 'Muddy footprints lead INTO the library — but none lead out. As if made to be found.', position: [-14.5, 0.05, -8], foundAt: 'Library', category: 'physical', key: true },
    { id: 'wine_glass', name: 'Shattered Wine Glass', type: 'mug', desc: 'A wine glass shattered in the study — where the shot really came from.', position: [-1.6, 0.9, -11.5], foundAt: 'Study', category: 'physical' },
    { id: 'footage_gap', name: 'Deleted Security Footage', type: 'document', desc: 'The cameras were wiped from 11:47 to 11:53 PM — six minutes, by someone with the codes.', position: [-14.5, 0.9, 11], foundAt: 'Basement', category: 'digital', key: true },
    { id: 'diary_page', name: 'Torn Diary Page', type: 'note', desc: "A page ripped from Eleanor's diary. The remaining stub mentions 'betrayal' and 'the police, first thing.'", position: [14.5, 0.9, 0.5], foundAt: 'Master Bedroom', category: 'physical' },
    { id: 'empty_safe', name: 'The Empty Safe', type: 'document', desc: 'A hidden study safe, standing open and empty — staged to suggest robbery.', position: [2.2, 0.9, -13], foundAt: 'Study', category: 'physical' },
    { id: 'fingerprints', name: 'Planted Fingerprints', type: 'badge', desc: "A fingerprint lift from the revolver. Under the lamp it's obvious: the prints were pressed on, not gripped.", position: [1.5, 0.05, 1.6], foundAt: 'Grand Hall', category: 'physical', key: true },
    { id: 'will_change', name: 'Amended Will', type: 'document', desc: 'Eleanor cut a beneficiary for "gross financial betrayal" days ago. Not a family member.', position: [-14.5, 0.9, -1], foundAt: 'Dining Room', category: 'physical' },
    { id: 'forged_records', name: 'Forged Financial Records', type: 'document', desc: "Company ledgers doctored to hide missing funds — traced to Eleanor's own assistant.", position: [0, 0.9, -13], foundAt: 'Study', category: 'digital', key: true },
    { id: 'medical_records', name: 'Altered Medical Records', type: 'document', desc: "Eleanor's medical history was edited — cosmetic changes, unrelated to a gunshot.", position: [14.5, 0.9, -11], foundAt: 'Kitchen', category: 'digital' },
    { id: 'gambling_note', name: 'Gambling Debt Notice', type: 'note', desc: 'A collector’s letter to Victor demanding millions. Motive — or the reason he’s the perfect scapegoat.', position: [-14.5, 0.9, 1.5], foundAt: 'Dining Room', category: 'physical' },
    { id: 'letters', name: "Hidden Letters", type: 'note', desc: "Bundled letters from Eleanor's late husband, hidden by Martha. Grief, not guilt.", position: [13, 0.9, -10], foundAt: 'Kitchen', category: 'physical' },
    { id: 'voice_recorder', name: 'Hidden Voice Recorder', type: 'phone', desc: "A recorder tucked in the greenhouse. It caught a man arguing with Eleanor seconds before the shot.", position: [0, 0.9, 11], foundAt: 'Greenhouse', category: 'digital', key: true },
  ],
  suspects,
  resolveAccusation: ({ suspect, pressure, caseNotes }) => {
    if (suspect.id === 'victor') {
      return {
        outcome: 'lose',
        dialogue:
          "You accuse Victor. The prints, the footprints, the argument — it all fits too neatly. As they cuff him, Oliver Grant allows himself the faintest smile. You've walked straight into the frame. CASE FAILED.",
      };
    }
    if (suspect.id !== 'oliver') {
      return {
        outcome: 'lose',
        dialogue: `${suspect.name} folds their arms. "${suspect.alibi}" Their secret is ugly, but it isn't murder — and you can't tie them to the gun. The accusation collapses.`,
      };
    }

    const hasVoice = caseNotes.includes('The voice recorder captures OLIVER arguing with Eleanor moments before the gunshot.');
    const hasForged = caseNotes.includes('Oliver cannot explain the forged records hiding the funds he embezzled.')
      || caseNotes.includes('The financial records were forged to hide embezzlement.');
    const hasFrameBusted = caseNotes.includes("A fingerprint lift from the revolver.")
      || caseNotes.includes('The wound shows a close-range shot — contradicting the staged across-the-room scene.')
      || caseNotes.includes("Oliver deflects on the deleted footage he alone had the access codes for.")
      || caseNotes.includes('Only someone with security access (like Oliver) could delete the footage.');

    if (pressure < 3 || !hasVoice || !hasForged || !hasFrameBusted) {
      return {
        outcome: 'retry',
        dialogue:
          "Oliver spreads his hands. 'You have nothing but a grudge, detective.' You need it airtight: prove the frame-up was staged, tie him to the stolen funds, and play the voice recorder that puts him in the study at the gunshot.",
      };
    }

    return {
      outcome: 'win',
      dialogue:
        "You lay it out piece by piece: the six deleted minutes only he could erase, the forged ledgers hiding the funds he stole, the fingerprints pressed onto the gun, the footprints made after she was already dead. Then you play the recording — his own voice, arguing with Eleanor seconds before the shot. Oliver sinks into a chair. 'She was going to destroy me... like they destroyed my father.' He confesses. As dawn breaks, the rain finally stops. CASE SOLVED.",
    };
  },
};
