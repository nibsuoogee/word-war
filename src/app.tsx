import { useState } from "preact/hooks";
import "./app.css";
import { Menu } from "./pages/menu";
import type { Page } from "./types";
import { Game } from "./pages/game";

export function App() {
  const [currentPage, setCurrentPage] = useState<Page>("menu");

  function showPage() {
    switch (currentPage) {
      case "menu":
        return <Menu startGame={() => setCurrentPage("game")} />;
      case "game":
        return <Game quit={() => setCurrentPage("menu")} />;
      default:
        return <></>;
    }
  }

  return <>{showPage()}</>;
}
