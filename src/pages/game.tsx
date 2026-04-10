import { PlayingCard } from "@/components/playingCard/playingCard";
import { Button } from "@/components/ui/button";
import type { Card, Deck, PlayerState } from "@/types";
import { ArrowDown, ArrowLeft, Play, Trophy, X } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type StateUpdater,
} from "preact/hooks";
import "./game.css";

type DragSource = "deck" | "pile";
type ActiveZone = "left" | "right" | null;

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
  const [virtualDeckEmpty, setVirtualDeckEmpty] = useState(false);

  // Drag state
  const [ghostCard, setGhostCard] = useState<Card | null>(null);
  const [draggingFromPile, setDraggingFromPile] = useState(false);

  // During a pile drag, show the card underneath; otherwise show the top card
  const topCard =
    playerState.physicalDeck[playerState.physicalDeck.length - 1] ?? null;
  const visiblePileCard = draggingFromPile
    ? (playerState.physicalDeck[playerState.physicalDeck.length - 2] ?? null)
    : topCard;

  const [activeZone, setActiveZone] = useState<ActiveZone>(null);

  const ghostRef = useRef<HTMLDivElement>(null);
  const pileRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ source: DragSource; card: Card } | null>(null);

  // Game actions
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

  // Pile center for snap animations
  function getPileCenter() {
    if (!pileRef.current) {
      return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    }
    const rect = pileRef.current.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }

  // Animate ghost card to a target position, then call onDone
  function animateTo(
    x: number,
    y: number,
    scale: number,
    opacity: number,
    onDone: () => void,
  ) {
    const ghost = ghostRef.current;
    if (!ghost) {
      onDone();
      return;
    }

    const handler = (e: TransitionEvent) => {
      if (e.propertyName !== "transform") return;
      ghost.removeEventListener("transitionend", handler);
      onDone();
    };
    ghost.addEventListener("transitionend", handler);

    ghost.style.transition =
      "transform 0.3s ease-out, opacity 0.3s ease-out";
    ghost.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${scale})`;
    ghost.style.opacity = String(opacity);
  }

  function cleanupDrag() {
    dragRef.current = null;
    setDraggingFromPile(false);
    setActiveZone(null);
    setGhostCard(null);

    const ghost = ghostRef.current;
    if (ghost) {
      ghost.style.visibility = "hidden";
      ghost.style.opacity = "0";
      ghost.style.transition = "none";
    }
  }

  // Start a drag interaction
  function startDrag(e: PointerEvent, source: DragSource) {
    e.preventDefault();
    if (dragRef.current) return; // already dragging

    let card: Card | null = null;
    if (source === "deck") {
      if (playerState.virtualDeckPosition >= playerDeck.cards.length) return;
      card = playerDeck.cards[playerState.virtualDeckPosition];
    } else {
      card = topCard;
    }
    if (!card) return;

    dragRef.current = { source, card };
    setGhostCard(card);
    if (source === "pile") setDraggingFromPile(true);

    // Position ghost at pointer immediately
    const ghost = ghostRef.current;
    if (ghost) {
      ghost.style.transition = "none";
      ghost.style.opacity = "1";
      ghost.style.visibility = "visible";
      ghost.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%) scale(0.7)`;
    }

    function onMove(ev: PointerEvent) {
      const ghost = ghostRef.current;
      if (!ghost) return;
      ghost.style.transform = `translate(${ev.clientX}px, ${ev.clientY}px) translate(-50%, -50%) scale(0.7)`;

      // Highlight zones only when dragging from pile
      if (dragRef.current?.source === "pile") {
        const w = window.innerWidth;
        if (ev.clientX < w * 0.33) {
          setActiveZone("left");
        } else if (ev.clientX > w * 0.67) {
          setActiveZone("right");
        } else {
          setActiveZone(null);
        }
      }
    }

    function onUp(ev: PointerEvent) {
      removeListeners();

      const src = dragRef.current?.source;
      if (!src) {
        cleanupDrag();
        return;
      }

      const { clientX } = ev;
      const w = window.innerWidth;
      const center = getPileCenter();

      if (src === "deck") {
        // New card always goes to center pile
        animateTo(center.x, center.y, 1, 1, () => {
          nextCard();
          // Wait one frame so the pile re-renders with the new card
          // underneath the ghost before we hide it
          requestAnimationFrame(() => cleanupDrag());
        });
      } else {
        // Pile card: check which zone
        if (clientX < w * 0.33) {
          // Lost point — animate offscreen left
          animateTo(-200, center.y, 0.5, 0, () => {
            removeTopCard();
            cleanupDrag();
          });
        } else if (clientX > w * 0.67) {
          // Won point — animate offscreen right
          animateTo(w + 200, center.y, 0.5, 0, () => {
            addPoint();
            removeTopCard();
            cleanupDrag();
          });
        } else {
          // Center — snap back
          animateTo(center.x, center.y, 1, 1, () => {
            cleanupDrag();
          });
        }
      }
    }

    function onCancel() {
      removeListeners();
      // Treat cancel as snap-back
      const center = getPileCenter();
      if (dragRef.current?.source === "deck") {
        animateTo(center.x, center.y, 1, 1, () => {
          nextCard();
          requestAnimationFrame(() => cleanupDrag());
        });
      } else {
        animateTo(center.x, center.y, 1, 1, () => {
          cleanupDrag();
        });
      }
    }

    function removeListeners() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
  }

  // Quit dialog
  function quitButtons() {
    switch (quitDialogOpen) {
      case false:
        return (
          <Button
            onClick={() => setQuitDialogOpen(true)}
            variant="secondary"
          >
            <ArrowLeft />
            Quit
          </Button>
        );
      case true:
        return (
          <>
            <Button onClick={quit} variant="destructive">
              <ArrowLeft />
              Yes, quit...
            </Button>
            <Button
              onClick={() => setQuitDialogOpen(false)}
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

  // Derived state effects
  useEffect(() => {
    if (playerState.virtualDeckPosition >= playerDeck.cards.length) {
      setVirtualDeckEmpty(true);
    }
  }, [playerState.virtualDeckPosition]);

  return (
    <div className="game-area">
      {/* Draw zone */}
      <div
        className={`draw-zone ${virtualDeckEmpty ? "draw-zone-disabled" : ""}`}
        onPointerDown={(e) => startDrag(e, "deck")}
      >
        {virtualDeckEmpty ? (
          <span>Deck empty</span>
        ) : (
          <>
            <ArrowDown className="w-5 h-5" />
            <span>Draw</span>
          </>
        )}
      </div>

      {/* Play area with zones */}
      <div className="play-area">
        {/* Left zone — lost point */}
        <div
          className={`zone-indicator zone-left ${activeZone === "left" ? "zone-active" : ""}`}
        >
          <X className="w-8 h-8" />
        </div>

        {/* Card pile */}
        <div
          ref={pileRef}
          className="card-pile"
          onPointerDown={(e) => {
            if (topCard) startDrag(e, "pile");
          }}
        >
          {visiblePileCard ? (
            <PlayingCard
              category={visiblePileCard.category}
              symbol={`/symbols/${visiblePileCard.cardSymbol}.svg`}
            />
          ) : (
            <div className="playing-card opacity-20" />
          )}
        </div>

        {/* Right zone — won point */}
        <div
          className={`zone-indicator zone-right ${activeZone === "right" ? "zone-active" : ""}`}
        >
          <Trophy className="w-8 h-8" />
        </div>
      </div>

      {/* Quit buttons */}
      <div className="quit-area">{quitButtons()}</div>

      {/* Ghost card — follows pointer during drag */}
      <div ref={ghostRef} className="drag-ghost">
        {ghostCard && (
          <PlayingCard
            category={ghostCard.category}
            symbol={`/symbols/${ghostCard.cardSymbol}.svg`}
          />
        )}
      </div>
    </div>
  );
}
