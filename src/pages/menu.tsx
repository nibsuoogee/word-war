import { ArrowLeft, ArrowRight, Dice3, Share2, Swords } from "lucide-react";
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
  const [copied, setCopied] = useState(false);

  const symbolRandom = mulberry32(SYMBOL_SEED);
  const random = mulberry32(seed);

  function handleSeed(seed: number) {
    setSeed(seed);
  }

  function randomizeSeed() {
    handleSeed(Math.round(Math.random() * 899_999 + 100_000));
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlSeed = params.get("seed");
    const urlPlayers = params.get("players");
    const urlPacks = params.get("packs");

    if (urlSeed !== null) {
      const parsedSeed = Number(urlSeed);
      if (!isNaN(parsedSeed) && isFinite(parsedSeed)) {
        setSeed(parsedSeed);
      } else {
        randomizeSeed();
      }
    } else {
      randomizeSeed();
    }

    if (urlPlayers !== null) {
      const count = Number(urlPlayers);
      if (count >= MIN_PLAYERS && count <= MAX_PLAYERS) {
        setPlayerCount(count);
      }
    }

    if (urlPacks !== null) {
      const packKeys = urlPacks.split(",").filter((k) => k in categoryPacks);
      if (packKeys.length > 0) {
        setSelectedPackKeys(packKeys);
      }
    }
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

  async function shareConfig() {
    const params = new URLSearchParams();
    params.set("seed", String(seed));
    params.set("players", String(playerCount));
    params.set("packs", selectedPackKeys.join(","));

    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard write failed (e.g. no HTTPS or permission denied)
    }
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

        <Button onClick={handleStart} className="w-min" variant="outline">
          Start <Swords />
        </Button>
        <Button onClick={shareConfig} className="w-min" variant="outline">
          Share <Share2 />
        </Button>
      </div>
      {copied && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-md bg-foreground px-4 py-2 text-sm text-background shadow-md"
        >
          Link copied!
        </div>
      )}
    </>
  );
}
