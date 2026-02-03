import { PlayingCard } from "@/components/playingCard/playingCard";
import { Button } from "@/components/ui/button";
import type { Card, Deck, PlayerState } from "@/types";
import { ArrowDown, ArrowLeft, Play, Trophy, X } from "lucide-react";
import {
  useEffect,
  useState,
  useRef,
  type Dispatch,
  type StateUpdater,
} from "preact/hooks";
import { onPointerUp, onCardPointerDown, onTopPointerDown, onPointerMove } from "@/utils";

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
  const [drawnCard, setDrawnCard] = useState<Card | null>(null);
  const [virtualDeckEmpty, setVirtualDeckEmpty] = useState<boolean>(false);
  const [physicalDeckEmpty, setPhysicalDeckEmpty] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [cardDrag, setCardDrag] = useState<{
    active: boolean;
    startX: number;
    startY: number;
    x: number;
    y: number;
  }>({ active: false, startX: 0, startY: 0, x: 0, y: 0 });

  const [spawnDrag, setSpawnDrag] = useState<{
    active: boolean;
    startX: number;
    startY: number;
    x: number;
    y: number;
  }>({ active: false, startX: 0, startY: 0, x: 0, y: 0 });

  useEffect(() => {

    if (cardDrag.active || spawnDrag.active) {
      window.addEventListener("pointermove", (e) => onPointerMove(e, cardDrag, setCardDrag, spawnDrag, setSpawnDrag));
      window.addEventListener("pointerup", (e) => onPointerUp(e, cardDrag, setCardDrag, spawnDrag, setSpawnDrag, removeTopCard, addPoint, nextCard, containerRef, setPlayerState));
    }

    return () => {
      window.removeEventListener("pointermove", (e) => onPointerMove(e, cardDrag, setCardDrag, spawnDrag, setSpawnDrag));
      window.removeEventListener("pointerup", (e) => onPointerUp(e, cardDrag, setCardDrag, spawnDrag, setSpawnDrag, removeTopCard, addPoint, nextCard, containerRef, setPlayerState));
    };
  }, [cardDrag.active, spawnDrag.active]);

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
    const newDrawnCard = playerDeck.cards[playerState.virtualDeckPosition]

    setDrawnCard(newDrawnCard)
  }, [playerState.virtualDeckPosition])

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
      <div ref={containerRef} className="flex flex-col items-center gap-2 w-min mx-auto">
        <div onPointerDown={(e) => onTopPointerDown(e, setSpawnDrag)} style={{ width: "100%", height: 64, touchAction: "none" }} />
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
              <div onPointerDown={(e) => onCardPointerDown(e, setCardDrag)} style={{ touchAction: "none" }}>
                <PlayingCard
                  category={topCard.category}
                  symbol={`symbols/${topCard.cardSymbol}.svg`}
                  style={{
                    transform: `translate(${cardDrag.active ? cardDrag.x - cardDrag.startX : 0}px, ${cardDrag.active ? cardDrag.y - cardDrag.startY : 0}px)`,
                    transition: cardDrag.active ? "none" : "transform 200ms ease",
                  }}
                />
              </div>
              <div className="flex justify-center w-full">{quitButtons()}</div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="playing-card opacity-20"></div>
              <div className="flex justify-center w-full">{quitButtons()}</div>
            </div>
          )}

          {/* spawn-from-top temporary card that follows pointer */}
          {spawnDrag.active && drawnCard && (
                <div style={{ position: "fixed", left: spawnDrag.x, top: spawnDrag.y, transform: "translate(-50%,-50%)", zIndex: 60, pointerEvents: "none" }}>
                  <PlayingCard
                    category={drawnCard.category}
                    symbol={`symbols/${drawnCard.cardSymbol}.svg`}
                  />
                </div>
              )
            }

          <Button onClick={addPoint} className="" size="icon" variant="outline">
            <Trophy />
          </Button>
        </div>
      </div>
    </>
  );
}
