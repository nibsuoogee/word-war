import { ArrowLeft, ArrowRight, Dice3 } from "lucide-react";
import { useState } from "preact/hooks";
import "./app.css";
import { Button } from "./components/ui/button";
import { Field, FieldLabel } from "./components/ui/field";
import { Input } from "./components/ui/input";
import { symbols, type Deck, type Symbols } from "./types";
import { categories } from "./data/cards";

export function App() {
  const [seed, setSeed] = useState<number>(0);
  const [playerCount, setPlayerCount] = useState<number>(3);
  const [playerPosition, setPlayerPosition] = useState<number>(0);
  const [deck, setDeck] = useState<Deck>({ cards: [] });

  function handleSeed(seed: number) {
    setSeed(seed);
    createDeck();
  }

  function randomizeSeed() {
    handleSeed(Math.round(Math.random() * 1_000_000));
  }

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

  const symbolValues = symbols.options;

  function getRandomSymbol(): Symbols {
    const index = Math.floor(Math.random() * symbolValues.length);
    return symbolValues[index];
  }

  function createDeck() {
    const newDeck: Deck = {
      cards: categories.map((category) => ({
        category,
        symbol: getRandomSymbol(),
      })),
    };

    setDeck(newDeck);
  }

  return (
    <>
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl">Word War</h1>

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

          <Button
            onClick={randomizeSeed}
            variant="outline"
            size="icon"
            aria-label="Submit"
          >
            <Dice3 />
          </Button>
        </div>

        <div className="flex items-center gap-4 w-full">
          <Field>
            <FieldLabel className="justify-center" htmlFor="input-seed">
              Player count
            </FieldLabel>
            <div className="flex items-center gap-2 w-full justify-center">
              <Button
                onClick={() => changePlayerCount(-1)}
                variant="outline"
                size="icon"
                aria-label="Submit"
              >
                <ArrowLeft />
              </Button>

              <p className="w-4">{playerCount}</p>

              <Button
                onClick={() => changePlayerCount(1)}
                variant="outline"
                size="icon"
                aria-label="Submit"
              >
                <ArrowRight />
              </Button>
            </div>
          </Field>

          <Field>
            <FieldLabel className="justify-center" htmlFor="input-seed">
              Starting position
            </FieldLabel>
            <div className="flex items-center gap-2 w-full justify-center">
              <Button
                onClick={() => changePlayerPosition(-1)}
                variant="outline"
                size="icon"
                aria-label="Submit"
              >
                <ArrowLeft />
              </Button>

              <p className="w-4">{playerPosition + 1}</p>

              <Button
                onClick={() => changePlayerPosition(1)}
                variant="outline"
                size="icon"
                aria-label="Submit"
              >
                <ArrowRight />
              </Button>
            </div>
          </Field>
        </div>

        <Button className="w-min" variant="outline">
          Start
        </Button>

        {deck.cards.map((card) => (
          <div>
            <p>{card.category}</p>
            <p>{card.symbol}</p>
          </div>
        ))}
      </div>
    </>
  );
}
