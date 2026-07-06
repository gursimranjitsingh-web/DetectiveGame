import React, { useMemo, useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { getCaseDefinition } from '@/data/cases';
import type { CaseSuspect, EvidenceItem, EvidenceCategory } from '@/data/caseTypes';
import { ArrowLeft, Check, Gavel, MapPin, Target, AlertTriangle } from 'lucide-react';

function avatarColor(hue = 210) {
  return `hsl(${hue}, 52%, 42%)`;
}

function initials(name: string) {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const CATEGORY_LABEL: Record<EvidenceCategory, string> = {
  physical: 'Physical',
  digital: 'Digital',
  testimony: 'Testimony',
};

export default function InterrogationUI() {
  const { setGameState, activeCaseId } = useGameStore();
  const cluesFound = useGameStore((state) => state.cluesFound);
  const caseDefinition = useMemo(() => getCaseDefinition(activeCaseId), [activeCaseId]);
  const { suspects, questionLabels, evidenceItems } = caseDefinition;

  // Only evidence the player actually recovered can be presented.
  const availableEvidence = useMemo(
    () => evidenceItems.filter((item) => cluesFound.length === 0 || cluesFound.includes(item.id)),
    [evidenceItems, cluesFound]
  );

  const coreSuspects = useMemo(() => suspects.filter((s) => s.tier !== 'background'), [suspects]);
  const backgroundSuspects = useMemo(() => suspects.filter((s) => s.tier === 'background'), [suspects]);

  const [selectedSuspectId, setSelectedSuspectId] = useState<string>(coreSuspects[0]?.id ?? suspects[0].id);
  const [dialogue, setDialogue] = useState(caseDefinition.introDialogue);
  const [pressure, setPressure] = useState<Record<string, number>>(
    () => Object.fromEntries(suspects.map((suspect) => [suspect.id, 0]))
  );
  const [caseNotes, setCaseNotes] = useState<string[]>([]);
  const [presented, setPresented] = useState<Record<string, string[]>>({});
  const [showOthers, setShowOthers] = useState(false);
  const [confirmAccuse, setConfirmAccuse] = useState(false);
  const [lastReactionKind, setLastReactionKind] = useState<'neutral' | 'crack' | 'deflect'>('neutral');

  const selected: CaseSuspect = useMemo(
    () => suspects.find((suspect) => suspect.id === selectedSuspectId) ?? suspects[0],
    [selectedSuspectId, suspects]
  );

  const questionIds = Object.keys(questionLabels);
  const selectedPressure = pressure[selected.id] ?? 0;
  const shownToSelected = presented[selected.id] ?? [];

  const selectSuspect = (id: string) => {
    setSelectedSuspectId(id);
    setConfirmAccuse(false);
    const s = suspects.find((x) => x.id === id);
    if (s) {
      setDialogue(`${s.name}: "${s.alibi}"`);
      setLastReactionKind('neutral');
    }
  };

  const addCaseNote = (note?: string) => {
    if (!note) return;
    setCaseNotes((notes) => (notes.includes(note) ? notes : [...notes, note]));
  };

  const askQuestion = (questionId: string) => {
    setConfirmAccuse(false);
    setLastReactionKind('neutral');
    setDialogue(selected.questions[questionId] ?? `${selected.name} has nothing to say about that.`);
  };

  const presentEvidence = (evidenceId: string) => {
    setConfirmAccuse(false);
    const response = selected.evidence[evidenceId];

    setPresented((current) => {
      const already = current[selected.id] ?? [];
      if (already.includes(evidenceId)) return current;
      return { ...current, [selected.id]: [...already, evidenceId] };
    });

    if (!response) {
      setDialogue(selected.defaultDeflection ?? `${selected.name} shrugs. "I don't know anything about that."`);
      setLastReactionKind('deflect');
      return;
    }

    setDialogue(response.text);
    addCaseNote(response.flag);
    setLastReactionKind(response.pressure > 0 ? 'crack' : 'neutral');

    if (response.pressure > 0) {
      setPressure((current) => ({
        ...current,
        [selected.id]: Math.min(5, (current[selected.id] ?? 0) + response.pressure),
      }));
    }
  };

  const handleAccuse = () => {
    if (!confirmAccuse) {
      setConfirmAccuse(true);
      return;
    }
    setConfirmAccuse(false);

    const result = caseDefinition.resolveAccusation({
      suspect: selected,
      pressure: selectedPressure,
      caseNotes,
    });

    setDialogue(result.dialogue);

    if (result.outcome === 'win') {
      setLastReactionKind('crack');
      useGameStore.getState().markCaseSolved(caseDefinition.id);
      setTimeout(() => setGameState('END_SCREEN'), 5200);
    } else if (result.outcome === 'lose') {
      setLastReactionKind('deflect');
      setTimeout(() => setGameState('END_SCREEN'), 4600);
    } else {
      setLastReactionKind('deflect');
    }
  };

  const groupedEvidence = useMemo(() => {
    const groups: Record<string, EvidenceItem[]> = {};
    for (const item of availableEvidence) {
      const cat = item.category ?? 'physical';
      (groups[cat] ??= []).push(item);
    }
    return groups;
  }, [availableEvidence]);

  const transcriptBorder =
    lastReactionKind === 'crack'
      ? 'border-red-500/60 shadow-[0_0_30px_-8px_rgba(239,68,68,0.5)]'
      : lastReactionKind === 'deflect'
      ? 'border-amber-500/40'
      : 'border-white/10';

  const renderSuspectButton = (suspect: CaseSuspect) => {
    const isActive = selectedSuspectId === suspect.id;
    const p = pressure[suspect.id] ?? 0;
    return (
      <button
        key={suspect.id}
        onClick={() => selectSuspect(suspect.id)}
        className={`w-full p-3 text-left rounded-lg border transition-colors flex items-center gap-3 ${
          isActive ? 'bg-red-950/60 border-red-400' : 'bg-black/40 border-white/10 hover:bg-white/10'
        }`}
      >
        <span
          className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-xs font-bold text-white/90 border border-white/20"
          style={{ backgroundColor: avatarColor(suspect.portraitHue) }}
        >
          {initials(suspect.name)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-sm truncate">{suspect.name}</span>
          <span className="block text-[11px] uppercase tracking-wide text-red-200/70 truncate">{suspect.role}</span>
        </span>
        {p > 0 && (
          <span className="shrink-0 text-[10px] font-bold text-red-300 bg-red-950/70 border border-red-500/40 rounded px-1.5 py-0.5">
            {p}/5
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#08070a]/96 backdrop-blur-md text-white p-4">
      <div className="max-w-7xl w-full grid grid-cols-[280px_1fr_300px] gap-4 h-[90vh]">

        {/* ── Column 1: cast ── */}
        <div className="bg-white/5 border border-white/10 rounded-xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/10 shrink-0 flex items-center justify-between">
            <h2 className="text-xl font-serif">The Room</h2>
            <button
              onClick={() => setGameState('PLAYING')}
              className="text-xs flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Scene
            </button>
          </div>
          <div className="flex flex-col gap-2 overflow-y-auto p-3">
            <p className="text-[11px] uppercase tracking-[0.2em] text-red-300/80 px-1 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" /> Persons of Interest
            </p>
            {coreSuspects.map(renderSuspectButton)}

            {backgroundSuspects.length > 0 && (
              <>
                <button
                  onClick={() => setShowOthers((v) => !v)}
                  className="mt-2 text-[11px] uppercase tracking-[0.2em] text-gray-400 hover:text-white px-1 flex items-center justify-between transition-colors"
                >
                  <span>Everyone else ({backgroundSuspects.length})</span>
                  <span>{showOthers ? '–' : '+'}</span>
                </button>
                {showOthers && backgroundSuspects.map(renderSuspectButton)}
              </>
            )}
          </div>
        </div>

        {/* ── Column 2: transcript + profile + actions ── */}
        <div className="flex flex-col gap-4 min-h-0">
          {/* Transcript */}
          <div className={`bg-black/40 border ${transcriptBorder} p-6 rounded-xl min-h-[150px] flex items-center justify-center text-lg italic text-center text-gray-200 relative transition-all`}>
            <span className="absolute top-3 left-4 text-[11px] font-bold not-italic tracking-widest text-red-300/90">TRANSCRIPT</span>
            <span className="max-w-2xl">&ldquo;{dialogue}&rdquo;</span>
          </div>

          {/* Profile card */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 shrink-0">
            <div className="flex items-start gap-4">
              <span
                className="w-14 h-14 shrink-0 rounded-full flex items-center justify-center text-lg font-bold text-white border-2 border-white/20"
                style={{ backgroundColor: avatarColor(selected.portraitHue) }}
              >
                {initials(selected.name)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-xl font-bold">{selected.name}</h3>
                  <span className="text-xs uppercase tracking-wide text-red-200/70">{selected.role}</span>
                  {selected.tier === 'background' && (
                    <span className="text-[10px] uppercase tracking-wide text-gray-500 border border-white/10 rounded px-1.5 py-0.5">Not a lead</span>
                  )}
                </div>
                {selected.standing && <p className="mt-1 text-sm text-amber-200/80">{selected.standing}</p>}
                <div className="mt-2 flex flex-col gap-1 text-xs text-gray-400">
                  {selected.desk && (
                    <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {selected.desk}</span>
                  )}
                  {selected.motive && <span><span className="text-gray-500">Stake:</span> {selected.motive}</span>}
                </div>
              </div>
              {/* Pressure meter */}
              <div className="shrink-0 text-right">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Pressure</p>
                <div className="flex gap-1 justify-end">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <span
                      key={i}
                      className={`w-2.5 h-5 rounded-sm ${i < selectedPressure ? 'bg-red-500' : 'bg-white/10'}`}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-gray-500 mt-1">{selectedPressure}/5</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-4 overflow-y-auto min-h-0">
            <div>
              <h4 className="text-sm font-bold mb-2 text-gray-300">Ask a question</h4>
              <div className="grid grid-cols-3 gap-2">
                {questionIds.map((questionId) => (
                  <button
                    key={questionId}
                    onClick={() => askQuestion(questionId)}
                    className="p-2.5 bg-neutral-900 hover:bg-neutral-800 rounded-md border border-white/10 transition-colors text-sm"
                  >
                    {questionLabels[questionId]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold mb-2 text-gray-300">
                Present evidence <span className="text-gray-500 font-normal">({availableEvidence.length} in file)</span>
              </h4>
              {availableEvidence.length === 0 ? (
                <p className="text-xs text-gray-500">Collect evidence in the office first.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {(Object.keys(groupedEvidence) as EvidenceCategory[]).map((cat) => (
                    <div key={cat}>
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">{CATEGORY_LABEL[cat]}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {groupedEvidence[cat].map((item) => {
                          const wasShown = shownToSelected.includes(item.id);
                          const gotReaction = Boolean(selected.evidence[item.id]);
                          return (
                            <button
                              key={item.id}
                              onClick={() => presentEvidence(item.id)}
                              className={`relative p-2.5 rounded-md border transition-colors text-xs text-left flex items-center gap-2 ${
                                wasShown
                                  ? gotReaction
                                    ? 'bg-red-950/40 border-red-500/40 text-red-100'
                                    : 'bg-neutral-900/60 border-white/5 text-gray-500'
                                  : 'bg-neutral-900 hover:bg-neutral-800 border-white/10'
                              }`}
                            >
                              {item.key && <span className="text-amber-400 text-[9px] font-bold shrink-0">KEY</span>}
                              <span className="flex-1 leading-tight">{item.name}</span>
                              {wasShown && <Check className="w-3 h-3 shrink-0 opacity-70" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-auto pt-1">
              {confirmAccuse && (
                <p className="text-xs text-amber-300 mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Accuse {selected.name}? A wrong accusation ends the case.
                </p>
              )}
              <button
                onClick={handleAccuse}
                className={`w-full p-3.5 font-bold tracking-widest rounded-md border transition-colors flex items-center justify-center gap-2 ${
                  confirmAccuse
                    ? 'bg-red-600 hover:bg-red-500 border-red-300 text-white'
                    : 'bg-red-950 hover:bg-red-900 border-red-500/60 text-white'
                }`}
              >
                <Gavel className="w-4 h-4" />
                {confirmAccuse ? `CONFIRM — IT WAS ${selected.name.toUpperCase()}` : `ACCUSE ${selected.name.toUpperCase()}`}
              </button>
            </div>
          </div>
        </div>

        {/* ── Column 3: case notes ── */}
        <div className="bg-white/5 border border-white/10 rounded-xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/10 shrink-0">
            <h2 className="text-xl font-serif">Case Notes</h2>
            <p className="text-xs text-gray-500 mt-1">{caseNotes.length} lead{caseNotes.length === 1 ? '' : 's'} recorded</p>
          </div>
          <div className="p-3 flex flex-col gap-2.5 text-sm text-gray-300 overflow-y-auto">
            {caseNotes.length === 0 && (
              <p className="text-gray-500 text-sm">
                No contradictions yet. Present evidence to a suspect who reacts to it — useful admissions land here.
              </p>
            )}
            {caseNotes.map((note) => (
              <p key={note} className="rounded-md border border-red-500/20 bg-red-950/20 p-3 leading-snug">
                {note}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
