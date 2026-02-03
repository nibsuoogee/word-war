import "./playingCard.css"
import type { JSX } from "preact";

export function PlayingCard({ category, symbol, style }: { category: string; symbol: string, style?: JSX.CSSProperties }) {
  return (
    <div className="playing-card" style={style}>
        <h3 className="playing-card-category playing-card-category-top">{category}</h3>
        <img src={symbol} className="playing-card-symbol"/>
        <h3 className="playing-card-category">{category}</h3>
    </div>
    );
}