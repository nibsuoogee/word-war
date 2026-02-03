import { Button } from "@/components/ui/button";
import type { Deck, PlayerState } from "@/types";
import { BookOpenText } from "lucide-react";
import type { Dispatch, StateUpdater } from "preact/hooks";

export function Results({
  toMenu,
  playerState,
  setPlayerState,
  setPlayerDeck,
}: {
  toMenu: () => void;
  playerState: PlayerState;
  setPlayerState: Dispatch<StateUpdater<PlayerState>>;
  setPlayerDeck: Dispatch<StateUpdater<Deck>>;
}) {
  function handleReset() {
    setPlayerState({ points: 0, physicalDeck: [], virtualDeckPosition: 0 });
    setPlayerDeck({ cards: [] });
    toMenu();
  }

  return (
    <>
      <div className="flex flex-col items-center gap-4 w-full">
        <h1>Results</h1>

        <p className="text-3xl">{playerState.points} points</p>

        <Button onClick={handleReset} className="" variant="outline">
          <BookOpenText />
          Back to menu
        </Button>
      </div>
    </>
  );
}
