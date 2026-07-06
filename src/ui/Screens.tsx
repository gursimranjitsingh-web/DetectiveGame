import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { CASE_LIST, getCaseDefinition } from '@/data/cases';
import InterrogationUI from './InterrogationUI';
import { Lock, CheckCircle2, ChevronRight } from 'lucide-react';

export default function Screens() {
  const { gameState, setGameState, solvedCases, resetCase, activeCaseId, setActiveCaseId } = useGameStore();

  if (gameState === 'PLAYING') return null;

  if (gameState === 'INTERROGATION') return <InterrogationUI />;

  const solvedCount = CASE_LIST.filter((file) => solvedCases.includes(file.id)).length;

  const startCase = (caseId: string) => {
    setActiveCaseId(caseId);
    resetCase();
    setGameState('CASE_INTRO');
  };

  const activeCase = getCaseDefinition(activeCaseId);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm text-white">

      {gameState === 'SPLASH' && (
        <div className="text-center animate-pulse">
          <h1 className="text-6xl font-serif tracking-widest mb-4">DETECTIVE</h1>
          <p className="text-gray-400">Click anywhere to start</p>
        </div>
      )}

      {gameState === 'MAIN_MENU' && (
        <div className="w-full max-w-2xl px-6 flex flex-col items-center">
          <h1 className="text-5xl font-serif tracking-widest mb-2">DETECTIVE</h1>
          <p className="text-sm uppercase tracking-[0.3em] text-gray-500 mb-8">Case Files</p>

          {/* Overall progress */}
          <div className="w-full max-w-md mb-10">
            <div className="flex justify-between text-xs text-gray-400 mb-2 uppercase tracking-wide">
              <span>Cases Solved</span>
              <span>{solvedCount} / {CASE_LIST.length}</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-600 transition-all duration-500"
                style={{ width: `${(solvedCount / CASE_LIST.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Case list */}
          <div className="w-full flex flex-col gap-3">
            {CASE_LIST.map((file) => {
              const isSolved = solvedCases.includes(file.id);
              return (
                <button
                  key={file.id}
                  onClick={() => startCase(file.id)}
                  className="w-full flex items-center gap-4 p-4 rounded-lg border text-left transition-all bg-white/5 border-white/15 hover:bg-white/10 hover:border-red-400/50 cursor-pointer"
                >
                  <div
                    className={`w-12 h-12 flex items-center justify-center rounded-md border font-serif text-lg shrink-0 ${
                      isSolved ? 'border-green-500/50 text-green-400' : 'border-white/20 text-gray-300'
                    }`}
                  >
                    {file.number}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{file.title}</p>
                    <p className="text-sm text-gray-400 line-clamp-1">{file.synopsis.split('\n')[0]}</p>
                  </div>
                  {isSolved ? (
                    <div className="flex items-center gap-1 text-green-400 text-xs font-bold uppercase shrink-0">
                      <CheckCircle2 className="w-5 h-5" /> Solved
                    </div>
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                  )}
                </button>
              );
            })}
            {/* Future cases go here - locked placeholder */}
            <div className="w-full flex items-center gap-4 p-4 rounded-lg border text-left bg-white/5 border-white/5 opacity-50 cursor-not-allowed">
              <div className="w-12 h-12 flex items-center justify-center rounded-md border border-white/20 font-serif text-lg shrink-0 text-gray-300">
                04
              </div>
              <div className="flex-1">
                <p className="font-semibold">Case File Sealed</p>
                <p className="text-sm text-gray-400">More investigations are on the way.</p>
              </div>
              <Lock className="w-5 h-5 text-gray-500 shrink-0" />
            </div>
          </div>
        </div>
      )}

      {gameState === 'CASE_INTRO' && (
        <div className="w-full max-w-2xl max-h-[88vh] overflow-y-auto mx-4 text-center flex flex-col items-center p-5 sm:p-8 bg-black/50 border border-white/10 rounded-xl shadow-2xl">
          <h1 className="text-2xl sm:text-4xl font-serif mb-5 text-red-500">CASE {activeCase.number}: {activeCase.title}</h1>
          <p className="text-base sm:text-lg text-gray-300 leading-relaxed mb-6 whitespace-pre-line">
            {activeCase.synopsis}
          </p>
          {activeCase.objectives && activeCase.objectives.length > 0 && (
            <div className="w-full text-left bg-black/40 border border-white/10 rounded-lg p-4 mb-8">
              <p className="text-xs uppercase tracking-[0.25em] text-red-300/80 mb-3">Your objectives</p>
              <ul className="flex flex-col gap-2">
                {activeCase.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-red-400 font-bold shrink-0">{i + 1}.</span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button
            onClick={() => {
              if (activeCaseId === 'case-02') useGameStore.getState().startMission();
              setGameState('PLAYING');
              // Capture the mouse straight away (this click is the required user gesture),
              // so look works immediately without a second click.
              const cv = document.querySelector('canvas');
              Promise.resolve(cv?.requestPointerLock?.()).catch(() => {});
            }}
            className="px-8 py-3 bg-red-900/50 hover:bg-red-800/80 border border-red-500/50 rounded-md text-xl transition-all"
          >
            {activeCaseId === 'case-02' ? 'Breach the Tower' : 'Enter Crime Scene'}
          </button>
        </div>
      )}

      {gameState === 'END_SCREEN' && (
        <div className="text-center flex flex-col items-center">
          <h1 className="text-6xl font-serif mb-8 text-white tracking-widest">CASE CLOSED</h1>
          <button
            onClick={() => setGameState('MAIN_MENU')}
            className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-md text-xl transition-all"
          >
            Back to Case Files
          </button>
        </div>
      )}

    </div>
  );
}
