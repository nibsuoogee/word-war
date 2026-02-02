import { useState } from "preact/hooks";
import "./app.css";
import { Menu } from "./pages/menu";
import { Game } from "./pages/game";
import type { Deck, Page, PlayerState } from "./types";
import { Results } from "./pages/results";

export function App() {
  const [currentPage, setCurrentPage] = useState<Page>("menu");
  const [playerDeck, setPlayerDeck] = useState<Deck>({ cards: [] });
  const [playerState, setPlayerState] = useState<PlayerState>({
    points: 0,
    physicalDeck: [],
    virtualDeckPosition: 0,
  });

  function showPage() {
    switch (currentPage) {
      case "menu":
        return (
          <Menu
            startGame={() => setCurrentPage("game")}
            setPlayerDeck={setPlayerDeck}
          />
        );
      case "game":
        return (
          <Game
            quit={() => setCurrentPage("results")}
            playerDeck={playerDeck}
            playerState={playerState}
            setPlayerState={setPlayerState}
          />
        );
      case "results":
        return (
          <Results
            toMenu={() => setCurrentPage("menu")}
            playerState={playerState}
          />
        );
      default:
        return <></>;
    }
  }

  return <>{showPage()}</>;
}
