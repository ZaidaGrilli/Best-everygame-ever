import "./App.css";
import { useState } from "react";
import GameSpreadsheetImport from "./features/import/SpreadSheetImport";
import GameReview from "./utils/GameReview";
import GameComparison from "./features/comparison/gameComparison";
import RankingResults from "./features/results/RankingResults";
import type { Game } from "./types/game";
import DeveloperPanel from "./components/DeveloperPanel";
import {
  useRankingEngine,
  type RankingEngineState,
} from "./hooks/useRankingEngine";

type AppStage = "import" | "review" | "comparison" | "results";

type SavedSession = {
  games: Game[];
  stage: AppStage;
  rankingState: RankingEngineState;
  savedAt: string;
};

const SAVE_KEY = "best-every-game-ever-session";

function App() {
  const [games, setGames] = useState<Game[]>([]);
  const [stage, setStage] = useState<AppStage>("import");
  const [hasSavedSession, setHasSavedSession] = useState(() => {
    return localStorage.getItem(SAVE_KEY) !== null;
  });

  const [saveMessage, setSaveMessage] = useState("");

  const rankingEngine = useRankingEngine();

  function handleSaveProgress() {
    const session: SavedSession = {
      games,
      stage,
      rankingState: rankingEngine.rankingState,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem(SAVE_KEY, JSON.stringify(session));

    setHasSavedSession(true);
    setSaveMessage("Progress saved!");

    window.setTimeout(() => {
      setSaveMessage("");
    }, 2000);
  }

  function handleResumeProgress() {
    const savedJson = localStorage.getItem(SAVE_KEY);

    if (!savedJson) {
      return;
    }

    try {
      const session = JSON.parse(savedJson) as SavedSession;

      setGames(session.games);
      setStage(session.stage);
      rankingEngine.restoreRanking(session.rankingState);
    } catch (error) {
      console.error("Could not restore saved ranking:", error);
      localStorage.removeItem(SAVE_KEY);
      setHasSavedSession(false);
    }
  }

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

    localStorage.removeItem(SAVE_KEY);
    setHasSavedSession(false);
  }

  function handleDeleteSavedProgress() {
    localStorage.removeItem(SAVE_KEY);
    setHasSavedSession(false);
  }

  if (stage === "comparison" && rankingEngine.currentComparison) {
    return (
      <main className="app">
        <GameComparison
          leftGame={rankingEngine.currentComparison.left}
          rightGame={rankingEngine.currentComparison.right}
          comparisonsCompleted={rankingEngine.comparisonsCompleted}
          estimatedTotalComparisons={rankingEngine.estimatedTotalComparisons}
          progressPercent={rankingEngine.progressPercent}
          onChooseLeft={rankingEngine.chooseLeft}
          onChooseRight={rankingEngine.chooseRight}
          onSaveProgress={handleSaveProgress}
          saveMessage={saveMessage}
        />

        {/* =====================================================
          DEV-ONLY PANEL
          This appears only during npm run dev.
          It will not render in the deployed production build.
          Remove this entire block later if no longer needed.
      ====================================================== */}
        {import.meta.env.DEV && (
          <DeveloperPanel debugInfo={rankingEngine.debugInfo} />
        )}
        {/* ================= END DEV-ONLY PANEL ============== */}
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
        {hasSavedSession && (
          <div className="resume-section">
            <p>You have an unfinished saved ranking.</p>

            <div className="resume-actions">
              <button
                className="primary-button"
                type="button"
                onClick={handleResumeProgress}
              >
                Resume ranking
              </button>

              <button
                className="text-button"
                type="button"
                onClick={handleDeleteSavedProgress}
              >
                Delete saved progress
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
