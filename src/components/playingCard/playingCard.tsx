import "./playingCard.css"

export function PlayingCard({ category, symbol }: { category: string; symbol: string }) {
  return (
    <div className="playing-card">
        <h3 className="playing-card-category playing-card-category-top">{category}</h3>
        <img src={symbol} className="playing-card-symbol"/>
        <h3 className="playing-card-category">{category}</h3>
    </div>
    );
}