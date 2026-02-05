import { Button } from "@/components/ui/button";
import type { PlayerState } from "@/types";
import { BookOpenText } from "lucide-react";

export function Results({
  resetGame,
  playerState,
}: {
  resetGame: () => void;
  playerState: PlayerState;
}) {
  return (
    <>
      <div className="flex flex-col items-center gap-4 w-full">
        <h1>Results</h1>

        <p className="text-3xl">{playerState.points} points</p>

        <Button onClick={resetGame} className="" variant="outline">
          <BookOpenText />
          Back to menu
        </Button>
      </div>
    </>
  );
}
