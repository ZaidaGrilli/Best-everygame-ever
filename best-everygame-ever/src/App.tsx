import "./App.css";
import { useState } from "react";
import GameSpreadsheetImport from "./features/import/SpreadSheetImport";
import GameReview from "./utils/GameReview";
import GameComparison from "./features/comparison/gameComparison";
import RankingResults from "./features/results/RankingResults";
import { useRankingEngine } from "./hooks/useRankingEngine";
import type { Game } from "./types/game";

type AppStage = "import" | "review" | "comparison" | "results";

function App() {
  const [games, setGames] = useState<Game[]>([]);
  const [stage, setStage] = useState<AppStage>("import");

  const rankingEngine = useRankingEngine();

  function handleGamesImported(importedGames: Game[]) {
    setGames(importedGames);
    setStage("review");
  }

  function handleStartComparing() {
    rankingEngine.startRanking(games);
    setStage("comparison");
  }

  function handleStartOver() {
    rankingEngine.resetRanking();
    setGames([]);
    setStage("import");
  }

  if (stage === "comparison" && rankingEngine.currentComparison) {
    return (
      <main className="app">
        <GameComparison
          leftGame={rankingEngine.currentComparison.left}
          rightGame={rankingEngine.currentComparison.right}
          comparisonsCompleted={rankingEngine.comparisonsCompleted}
          onChooseLeft={rankingEngine.chooseLeft}
          onChooseRight={rankingEngine.chooseRight}
        />
      </main>
    );
  }

  if (stage === "results" || rankingEngine.status === "completed") {
    return (
      <main className="app">
        <RankingResults
          games={rankingEngine.finalRanking}
          comparisonsCompleted={rankingEngine.comparisonsCompleted}
          onStartOver={handleStartOver}
        />
      </main>
    );
  }

  if (stage === "review") {
    return (
      <main className="app">
        <GameReview
          games={games}
          onGamesChange={setGames}
          onStartComparing={handleStartComparing}
        />
      </main>
    );
  }

  return (
    <main className="app">
      <section className="hero">
        <h1 className="title">Best Every Game Ever</h1>

        <p className="description">
          Import every game you have played, compare them head-to-head, and
          create your definitive ordered ranking.
        </p>

        <GameSpreadsheetImport onGamesImported={handleGamesImported} />
      </section>
    </main>
  );
}

export default App;
