import type { Dispatch, StateUpdater } from "preact/hooks";
import type { PlayerState } from "./types";


export function onPointerUp(e: PointerEvent, cardDrag: { active: boolean; startX: number; startY: number; x: number; y: number; }, setCardDrag: Dispatch<{ active: boolean; startX: number; startY: number; x: number; y: number; }>, spawnDrag: { active: boolean; startX: number; startY: number; x: number; y: number; }, setSpawnDrag: Dispatch<{ active: boolean; startX: number; startY: number; x: number; y: number; }>, removeTopCard: () => void, addPoint: () => void, nextCard: () => void, containerRef: { current: HTMLDivElement | null }, setPlayerState: Dispatch<StateUpdater<PlayerState>>) {
    const rect = containerRef.current?.getBoundingClientRect();
    const releaseX = e.clientX - (rect?.left ?? 0);
    const releaseY = e.clientY - (rect?.top ?? 0);
    const width = rect?.width ?? window.innerWidth;
    const height = rect?.height ?? window.innerHeight;

    // finish card drag
    if (cardDrag.active) {
        setCardDrag((d) => ({ ...d, active: false }));
    if (releaseX < width * 0.25) {
        removeTopCard()
        setPlayerState((prev) => ({ ...prev, virtualDeckPosition: prev.virtualDeckPosition + 1 }));
    } else if (releaseX > width * 0.75) addPoint();
    // else snap back (no action)
    }

    // finish spawn drag (dragging from top)
    if (spawnDrag.active) {
        setSpawnDrag((d) => ({ ...d, active: false }));
    // if released near left/right edges trigger actions, otherwise add card if dragged downward enough
    if (releaseX < width * 0.25) removeTopCard();
    else if (releaseX > width * 0.75) addPoint();
    else if (releaseY > height * 0.15) nextCard();
    }
}

// card pointer handlers
export function onCardPointerDown(e: any, setCardDrag: Dispatch<{ active: boolean; startX: number; startY: number; x: number; y: number; }>) {
    e.preventDefault();
    const px = e.clientX;
    const py = e.clientY;
    setCardDrag({ active: true, startX: px, startY: py, x: px, y: py });
  }

  // spawn (pull-from-top) pointer handler
export function onTopPointerDown(e: any, setSpawnDrag: Dispatch<{ active: boolean; startX: number; startY: number; x: number; y: number; }>) {
    e.preventDefault();
    const px = e.clientX;
    const py = e.clientY;
    setSpawnDrag({ active: true, startX: px, startY: py, x: px, y: py });
}

export function onPointerMove(e: PointerEvent, cardDrag: { active: boolean; startX: number; startY: number; x: number; y: number; }, setCardDrag: Dispatch<{ active: boolean; startX: number; startY: number; x: number; y: number; }>, spawnDrag: { active: boolean; startX: number; startY: number; x: number; y: number; }, setSpawnDrag: Dispatch<{ active: boolean; startX: number; startY: number; x: number; y: number; }>) {
    if (cardDrag.active) {
    setCardDrag((d) => ({ ...d, x: e.clientX, y: e.clientY }));
    }
    if (spawnDrag.active) {
    setSpawnDrag((d) => ({ ...d, x: e.clientX, y: e.clientY }));
    }
}