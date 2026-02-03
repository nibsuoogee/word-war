import { PlayingCard } from "@/components/playingCard/playingCard";
import { Button } from "@/components/ui/button";
import type { Card, Deck, PlayerState } from "@/types";
import { ArrowDown, ArrowLeft, Play, Trophy, X } from "lucide-react";
import {
  useEffect,
  useState,
  type Dispatch,
  type StateUpdater,
} from "preact/hooks";

export function Game({
  quit,
  playerDeck,
  playerState,
  setPlayerState,
}: {
  quit: () => void;
  playerDeck: Deck;
  playerState: PlayerState;
  setPlayerState: Dispatch<StateUpdater<PlayerState>>;
}) {
  const [quitDialogOpen, setQuitDialogOpen] = useState(false);
  const [topCard, setTopCard] = useState<Card | null>(null);
  const [virtualDeckEmpty, setVirtualDeckEmpty] = useState<boolean>(false);
  const [physicalDeckEmpty, setPhysicalDeckEmpty] = useState<boolean>(false);

  function addPoint() {
    setPlayerState((prev) => ({ ...prev, points: prev.points + 1 }));
  }

  function nextCard() {
    setPlayerState((prev) => ({
      ...prev,
      physicalDeck: [
        ...prev.physicalDeck,
        playerDeck.cards[prev.virtualDeckPosition],
      ],
      virtualDeckPosition: prev.virtualDeckPosition + 1,
    }));
  }

  function removeTopCard() {
    setPlayerState((prev) => ({
      ...prev,
      physicalDeck: prev.physicalDeck.slice(0, -1),
    }));
  }

  function quitButtons() {
    switch (quitDialogOpen) {
      case false:
        return (
          <>
            <Button
              onClick={() => setQuitDialogOpen(true)}
              className="ml-auto"
              variant="secondary"
            >
              <ArrowLeft />
              Quit
            </Button>
          </>
        );
      case true:
        return (
          <>
            <Button onClick={quit} className="mr-auto" variant="destructive">
              <ArrowLeft />
              Yes, quit...
            </Button>

            <Button
              onClick={() => setQuitDialogOpen(false)}
              className="ml-auto"
              variant="outline"
            >
              Keep playing
              <Play />
            </Button>
          </>
        );
      default:
        return <></>;
    }
  }

  useEffect(() => {
    const newTopCard =
      playerState.physicalDeck[playerState.physicalDeck.length - 1];

    setTopCard(newTopCard);
  }, [playerState]);

  useEffect(() => {
    if (playerState.virtualDeckPosition < playerDeck.cards.length) return;

    setVirtualDeckEmpty(true);
  }, [playerState.virtualDeckPosition]);

  useEffect(() => {
    if (playerState.physicalDeck.length < 1) {
      setPhysicalDeckEmpty(true);
      return;
    }

    setPhysicalDeckEmpty(false);
  }, [playerState.physicalDeck]);

  return (
    <>
      <div className="flex flex-col items-center gap-2 w-min mx-auto">
        <Button
          onClick={nextCard}
          disabled={virtualDeckEmpty}
          variant="outline"
          size={virtualDeckEmpty ? "default" : "icon"}
        >
          {virtualDeckEmpty ? "Deck empty" : <ArrowDown />}
        </Button>

        <div className="flex items-center gap-2">
          <Button
            onClick={removeTopCard}
            disabled={physicalDeckEmpty}
            size="icon"
            variant="outline"
          >
            <X />
          </Button>

          {topCard ? (
            <div className="flex flex-col gap-2">
              <PlayingCard
                category={topCard.category}
                symbol={`/symbols/${topCard.cardSymbol}.svg`}
              />
              <div className="flex justify-center w-full">{quitButtons()}</div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="playing-card opacity-20"></div>
              <div className="flex justify-center w-full">{quitButtons()}</div>
            </div>
          )}

          <Button onClick={addPoint} className="" size="icon" variant="outline">
            <Trophy />
          </Button>
        </div>
      </div>
    </>
  );
}
