import { ArrowDown, ArrowLeft, ArrowRight, BookOpen, Dice3, Swords, Trophy, X } from "lucide-react";
import { useEffect, useState } from "preact/hooks";
import "../app.css";
import { Button } from "../components/ui/button";
import { Field, FieldLabel } from "../components/ui/field";
import { Input } from "../components/ui/input";
import { categoryPacks, DEFAULT_PACK_KEY } from "../data/packs";
import { PackSelect } from "../components/ui/packSelect";
import { arrayShuffle, mulberry32 } from "../lib/random";
import { cardSymbol, type Card, type CardSymbol, type Deck } from "../types";

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 6;
const SYMBOL_SEED = 1234;

export function Menu({
  startGame,
  setPlayerDeck,
}: {
  startGame: () => void;
  setPlayerDeck: (deck: Deck) => void;
}) {
  const [seed, setSeed] = useState<number>(1);
  const [playerCount, setPlayerCount] = useState<number>(3);
  const [playerPosition, setPlayerPosition] = useState<number>(0);
  const [deck, setDeck] = useState<Deck>({ cards: [] });
  const [selectedPackKeys, setSelectedPackKeys] = useState<string[]>([DEFAULT_PACK_KEY]);
  const [showInstructions, setShowInstructions] = useState(false);

  const symbolRandom = mulberry32(SYMBOL_SEED);
  const random = mulberry32(seed);

  function handleSeed(seed: number) {
    setSeed(seed);
  }

  function randomizeSeed() {
    handleSeed(Math.round(Math.random() * 899_999 + 100_000));
  }

  useEffect(() => {
    randomizeSeed();
  }, []);

  useEffect(() => {
    createDeck();
  }, [seed, selectedPackKeys]);

  function changePlayerCount(delta: number) {
    if (playerCount < 4 && delta < 0) return;
    if (playerCount > 5 && delta > 0) return;
    setPlayerCount((prev) => prev + delta);

    // Reset player position
    setPlayerPosition(0);
  }

  function changePlayerPosition(delta: number) {
    setPlayerPosition((prev) => {
      if (playerCount === 0) return 0; // avoid div-by-zero
      const next = (prev + delta) % playerCount;
      return (next + playerCount) % playerCount; // wraps negatives into [0, playerCount-1]
    });
  }

  const symbolValues = cardSymbol.options;

  function getSymbol(): CardSymbol {
    const index = Math.floor(symbolRandom() * symbolValues.length);
    return symbolValues[index];
  }

  function createDeck() {
    const merged = [
      ...new Set(selectedPackKeys.flatMap((key) => categoryPacks[key].categories)),
    ];
    const newCards: Card[] = merged.map((category) => ({
      category,
      cardSymbol: getSymbol(),
    }));

    setDeck({ cards: arrayShuffle(newCards, random) });
  }

  function createPlayerDeck() {
    const playerCards = deck.cards.filter(
      (_, index) => index % playerCount === playerPosition,
    );

    setPlayerDeck({ cards: playerCards });
  }

  useEffect(() => {
    createPlayerDeck();
  }, [deck, playerCount, playerPosition]);

  function handleStart() {
    startGame();
  }

  return (
    <>
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-3xl">Word War</h1>

        <Field>
          <FieldLabel className="justify-center">Category Pack</FieldLabel>
          <PackSelect selectedKeys={selectedPackKeys} onChange={setSelectedPackKeys} />
        </Field>

        <div className="flex items-end gap-2">
          <Field>
            <FieldLabel className="justify-center" htmlFor="input-seed">
              Game seed
            </FieldLabel>
            <div className="flex items-center gap-2">
              <Input
                className="max-w-32 text-xl"
                value={seed}
                onChange={(e) => handleSeed(Number(e.currentTarget.value))}
                id="input-seed"
                type="number"
                placeholder="1234"
              />
              <Button onClick={randomizeSeed} variant="outline" size="icon">
                <Dice3 />
              </Button>
            </div>
          </Field>
        </div>

        <div className="flex items-center max-w-96 gap-4 w-full">
          <Field>
            <FieldLabel className="justify-center" htmlFor="input-seed">
              Player count
            </FieldLabel>
            <div className="flex items-center gap-2 w-full justify-center">
              <Button
                onClick={() => changePlayerCount(-1)}
                variant="outline"
                size="icon"
                disabled={playerCount === MIN_PLAYERS}
              >
                <ArrowLeft />
              </Button>

              <p className="w-4">{playerCount}</p>

              <Button
                onClick={() => changePlayerCount(1)}
                variant="outline"
                size="icon"
                disabled={playerCount === MAX_PLAYERS}
              >
                <ArrowRight />
              </Button>
            </div>
          </Field>

          <Field>
            <FieldLabel className="justify-center" htmlFor="input-seed">
              Your starting position
            </FieldLabel>
            <div className="flex items-center gap-2 w-full justify-center">
              <Button
                onClick={() => changePlayerPosition(-1)}
                variant="outline"
                size="icon"
                disabled={playerPosition === 0}
              >
                <ArrowLeft />
              </Button>

              <p className="w-4">{playerPosition + 1}</p>

              <Button
                onClick={() => changePlayerPosition(1)}
                variant="outline"
                size="icon"
                disabled={playerPosition === playerCount - 1}
              >
                <ArrowRight />
              </Button>
            </div>
          </Field>
        </div>

        <Button onClick={() => setShowInstructions(true)} variant="ghost">
          <BookOpen /> How to play
        </Button>

        <Button onClick={handleStart} className="w-min" variant="outline">
          Start <Swords />
        </Button>
      </div>

      {/* How-to-play overlay */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background p-8 gap-8">
          <h1 className="text-2xl font-bold">How to play</h1>

          <ol className="flex flex-col gap-5 w-full max-w-sm">
            <li className="flex gap-3 items-start">
              <ArrowDown className="w-5 h-5 mt-0.5 shrink-0" />
              <span>
                Draw a card to reveal a category. Read it out aloud to other
                players.
              </span>
            </li>
            <li className="flex gap-3 items-start">
              <Trophy className="w-5 h-5 mt-0.5 shrink-0 text-green-500" />
              <span>
                Drag the card <strong>right</strong> if you won against another
                player in word battle — your score goes up.
              </span>
            </li>
            <li className="flex gap-3 items-start">
              <X className="w-5 h-5 mt-0.5 shrink-0 text-red-500" />
              <span>
                Drag the card <strong>left</strong> if you lost in word battle —
                the card is discarded.
              </span>
            </li>
            <li className="flex gap-3 items-start">
              <ArrowLeft className="w-5 h-5 mt-0.5 shrink-0" />
              <span>
                Press <strong>undo</strong> (you can only undo one action) if
                you made a mistake.
              </span>
            </li>
          </ol>

          <Button size="lg" variant="outline" onClick={() => setShowInstructions(false)}>
            Got it
          </Button>
        </div>
      )}
    </>
  );
}
