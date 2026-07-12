import { useState } from "react";
import "./App.css";
import GameSpreadsheetImport from "./features/import/SpreadSheetImport";
import type { Game } from "./types/game";

function App() {
  const [games, setGames] = useState<Game[]>([]);

  function handleGamesImported(importedGames: Game[]) {
    setGames(importedGames);
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

        {games.length > 0 && (
          <section className="import-results">
            <h2>{games.length} games imported</h2>

            <p>Review the imported games before beginning the ranking.</p>

            <ol className="game-list">
              {games.map((game) => (
                <li key={game.id}>
                  <strong>{game.title}</strong>

                  {game.platform && (
                    <span className="game-platform">{game.platform}</span>
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}
      </section>
    </main>
  );
}

export default App;
