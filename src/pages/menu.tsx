import { ArrowLeft, ArrowRight, Dice3, Swords } from "lucide-react";
import { useEffect, useState } from "preact/hooks";
import "../app.css";
import { Button } from "../components/ui/button";
import { Field, FieldLabel } from "../components/ui/field";
import { Input } from "../components/ui/input";
import { categories } from "../data/cards";
import { mulberry32 } from "../lib/random";
import { cardSymbol, type CardSymbol, type Deck } from "../types";

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 6;

export function Menu({
  startGame,
  setPlayerDeck,
}: {
  startGame: () => void;
  setPlayerDeck: (deck: Deck) => void;
}) {
  const [seed, setSeed] = useState<number>(0);
  const [playerCount, setPlayerCount] = useState<number>(3);
  const [playerPosition, setPlayerPosition] = useState<number>(0);
  const [deck, setDeck] = useState<Deck>({ cards: [] });

  const random = mulberry32(seed);

  function handleSeed(seed: number) {
    setSeed(seed);
    createDeck();
  }

  function randomizeSeed() {
    handleSeed(Math.round(random() * 1_000_000));
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

  useEffect(() => {
    handleSeed(1);
  }, []);

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

  function getRandomSymbol(): CardSymbol {
    const index = Math.floor(random() * symbolValues.length);
    return symbolValues[index];
  }

  function createDeck() {
    const newDeck: Deck = {
      cards: categories.map((category) => ({
        category,
        cardSymbol: getRandomSymbol(),
      })),
    };

    setDeck(newDeck);
  }

  function handleStart() {
    startGame();
  }

  return (
    <>
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-3xl">Word War</h1>

        <div className="flex items-end gap-2">
          <Field>
            <FieldLabel htmlFor="input-seed">Game seed</FieldLabel>
            <Input
              className="max-w-64"
              value={seed}
              onChange={(e) => handleSeed(Number(e.currentTarget.value))}
              id="input-seed"
              type="number"
              placeholder="1234"
            />
          </Field>

          <Button onClick={randomizeSeed} variant="outline" size="icon">
            <Dice3 />
          </Button>
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

        <Button onClick={handleStart} className="w-min" variant="outline">
          Start <Swords />
        </Button>
      </div>
    </>
  );
}
