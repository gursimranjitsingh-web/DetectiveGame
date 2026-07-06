"use client";

import { useGameStore } from "@/store/useGameStore";
import GameCanvas from "@/components/GameCanvas";
import UIOverlay from "@/ui/UIOverlay";
import Screens from "@/ui/Screens";

export default function Home() {
  const { gameState, setGameState } = useGameStore();

  return (
    <main 
      className="relative w-full h-screen bg-black overflow-hidden"
      onClick={() => {
        if (gameState === 'SPLASH') setGameState('MAIN_MENU');
      }}
    >
      {/* Game Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <GameCanvas />
      </div>

      {/* Screens Layer (Splash, Menu, Intro) */}
      <Screens />

      {/* UI Overlay Layer (Crosshair, Clues) */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <UIOverlay />
      </div>
    </main>
  );
}
