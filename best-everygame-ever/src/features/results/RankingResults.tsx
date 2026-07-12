import type { Game } from "../../types/game";

type RankingResultsProps = {
  games: Game[];
  comparisonsCompleted: number;
  onStartOver: () => void;
};

function RankingResults({
  games,
  comparisonsCompleted,
  onStartOver,
}: RankingResultsProps) {
  return (
    <section className="ranking-results">
      <header className="results-header">
        <p className="eyebrow">Ranking complete</p>
        <h1>Ryan’s definitive game ranking</h1>

        <p>
          {games.length} games ranked through {comparisonsCompleted}{" "}
          comparisons.
        </p>
      </header>

      <ol className="final-ranking">
        {games.map((game, index) => (
          <li key={game.id}>
            <span className="ranking-number">{index + 1}</span>

            <div>
              <strong>{game.title}</strong>
              <span>{game.platform ?? "Unknown platform"}</span>
            </div>
          </li>
        ))}
      </ol>

      <button className="secondary-button" type="button" onClick={onStartOver}>
        Start over
      </button>
    </section>
  );
}

export default RankingResults;
