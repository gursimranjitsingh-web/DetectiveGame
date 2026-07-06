import { useGameStore } from "@/store/useGameStore";
import BedroomScene from "./scenes/BedroomScene";
import BuildingScene from "./scenes/BuildingScene";
import ManorScene from "./scenes/ManorScene";

export default function Scene() {
  const activeCaseId = useGameStore((state) => state.activeCaseId);

  if (activeCaseId === 'case-02') return <BuildingScene />;
  if (activeCaseId === 'case-03') return <ManorScene />;
  return <BedroomScene />;
}
