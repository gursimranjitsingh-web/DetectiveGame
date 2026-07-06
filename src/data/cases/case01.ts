import type { CaseDefinition } from '../caseTypes';

const suspects: CaseDefinition['suspects'] = [
  {
    id: 'wife',
    name: 'Eleanor Vale',
    role: 'The Wife',
    alibi: 'Says she went to bed at 10:30 PM and slept upstairs all night.',
    questions: {
      timeline: "Eleanor: 'I took a sleeping pill before eleven. I didn't hear anything from the study.'",
      victim: "Eleanor: 'He worried a lot about his business papers. That was his problem, not mine.'",
      midnight: "Eleanor: 'Midnight? No. The house was quiet when I went upstairs.'",
    },
    evidence: {
      knife: { text: "Eleanor: 'That knife is from the kitchen. I never cook at night.'", pressure: 0 },
      note: { text: "Eleanor reads the letter. 'This sounds like something Arthur would write. He always says come alone.'", pressure: 1, flag: 'Eleanor thinks the note sounds like Arthur.' },
      usb: { text: "Eleanor freezes. 'He told me that drive was destroyed. If it still exists, it could ruin Arthur.'", pressure: 1, flag: 'The USB is tied to Arthur\'s business secrets.' },
    },
  },
  {
    id: 'partner',
    name: 'Arthur Crane',
    role: 'Business Partner',
    alibi: 'Says he left the house at 10 PM.',
    questions: {
      timeline: "Arthur: 'I left early. Ask the staff. I had no reason to stay.'",
      victim: "Arthur: 'We argued sometimes, sure. But partners argue. That doesn't make me a killer.'",
      midnight: "Arthur: 'If someone says I was here at midnight, they're lying.'",
    },
    evidence: {
      knife: { text: "Arthur: 'The kitchen staff handled those knives. Talk to Gaston.'", pressure: 0 },
      note: { text: "Arthur's jaw tightens. 'A lot of people know my handwriting.'", pressure: 1, flag: 'Arthur seems to recognize the note.' },
      usb: { text: "Arthur reaches for the drive, then stops himself. 'That belongs to the company.'", pressure: 1, flag: 'Arthur really wanted that USB drive back.' },
    },
  },
  {
    id: 'chef',
    name: 'Gaston Mirel',
    role: 'The Chef',
    alibi: 'Says he cleaned the kitchen all night.',
    questions: {
      timeline: "Gaston: 'I cleaned until late. The sink, the counters, everything.'",
      victim: "Gaston: 'He was tough on me, but he paid well. I kept my head down.'",
      midnight: "Gaston: 'I might have walked past the hallway. I don't remember the exact time.'",
    },
    evidence: {
      knife: { text: "Gaston wipes his hands on his coat. 'That knife went missing after dinner service. I thought someone borrowed it.'", pressure: 1, flag: 'Gaston can\'t explain why his knife was at the crime scene.' },
      note: { text: "Gaston: 'A letter isn't food. Why ask me?' He seems calmer now.", pressure: 0 },
      usb: { text: "Gaston: 'I saw Mr. Vale hide that under the lamp after Arthur left.'", pressure: 1, flag: 'Gaston admits he was near the study after Arthur left.' },
    },
  },
];

export const case01: CaseDefinition = {
  id: 'case-01',
  number: '01',
  title: 'The Midnight Murder',
  synopsis: 'Late last night, a wealthy businessman was found dead in his study. The police have secured the room, but the killer left almost no trace.\n\nYour job is to inspect the room, find all the hidden clues, and interrogate the suspects to find the culprit.',
  introDialogue: 'Ask questions and show evidence to find contradictions. Everyone has a motive, but only one story will fall apart.',
  playerBounds: { x: 4.5, z: 3.5 },
  cameraStart: [0, 1.7, 3],
  questionLabels: {
    timeline: 'Timeline',
    victim: 'Victim',
    midnight: 'Midnight',
  },
  evidenceItems: [
    {
      id: 'knife',
      name: 'Bloody Knife',
      desc: "A sharp chef's knife. There is dried blood near the hilt.",
      type: 'knife',
      position: [2.2, 0.05, -0.6],
      rotation: [Math.PI / 2, 0, Math.PI / 3],
    },
    {
      id: 'note',
      name: 'Torn Letter',
      desc: "'Meet me at midnight. Come alone.' The rest is unreadable.",
      type: 'note',
      position: [0.2, 0.86, -1.8],
      rotation: [0, Math.PI / 6, 0],
    },
    {
      id: 'usb',
      name: 'Encrypted USB Drive',
      desc: 'A heavy duty encrypted drive. It was hidden under the lamp.',
      type: 'usb',
      position: [-3, 0.05, -2.2],
      rotation: [0, Math.PI / 4, 0],
    },
  ],
  suspects,
  resolveAccusation: ({ suspect, pressure, caseNotes }) => {
    const hasKnifeContradiction = caseNotes.includes('Gaston can\'t explain why his knife was at the crime scene.');
    const hasStudyContradiction = caseNotes.includes('Gaston admits he was near the study after Arthur left.');
    const hasBusinessMotive = caseNotes.includes('The USB is tied to Arthur\'s business secrets.') || caseNotes.includes('Arthur really wanted that USB drive back.');

    if (suspect.id !== 'chef') {
      return {
        outcome: 'lose',
        dialogue: `${suspect.name} might have a reason to do it, but you have no evidence putting them with the weapon at midnight. Your accusation falls apart.`,
      };
    }

    if (pressure < 2 || !hasKnifeContradiction || !hasStudyContradiction || !hasBusinessMotive) {
      return {
        outcome: 'retry',
        dialogue: "Gaston stares back at you. 'That's just a guess, detective, not proof.' You still need three things: the missing knife, proof he was near the study late at night, and the business motive.",
      };
    }

    return {
      outcome: 'win',
      dialogue: "Gaston breaks down. 'Arthur paid me to get that USB drive back. But Mr. Vale caught me in the study with the knife...' CASE SOLVED!",
    };
  },
};
